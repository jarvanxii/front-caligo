<template>
  <section class="identity-workbench" aria-labelledby="identity-title">
    <div class="identity-workbench__shell">
      <header class="identity-head">
        <div>
          <span class="eyebrow">Redes / Identidad</span>
          <h1 id="identity-title">WHOAMI</h1>
          <p>
            Lectura combinada del navegador, la sesion local y el servidor Caligo para comparar
            superficie cliente, cabeceras observadas, IP publica del backend y estado VPN.
          </p>
        </div>

        <aside class="identity-status" :class="{ 'is-ready': !loading }">
          <span>Caligo identity</span>
          <strong>{{ loading ? "Leyendo" : "Preparado" }}</strong>
          <small>{{ statusMessage }}</small>
        </aside>
      </header>

      <div class="identity-actions">
        <button type="button" :disabled="loading" @click="refreshAll">
          {{ loading ? "Actualizando" : "Actualizar lectura" }}
        </button>
        <button type="button" :disabled="copying || !reportText" @click="copyReport">
          {{ copying ? "Copiando" : "Copiar informe" }}
        </button>
        <button type="button" :disabled="!reportText" @click="downloadJson">
          Descargar JSON
        </button>
        <button type="button" :disabled="geoLoading" @click="requestGeoLocation">
          {{ geoLoading ? "Geolocalizando" : "Reintentar ubicacion" }}
        </button>
      </div>

      <section class="identity-summary-grid" aria-label="Resumen de identidad">
        <article v-for="item in summaryCards" :key="item.label" class="identity-card identity-card--signal">
          <span>{{ item.label }}</span>
          <strong :class="item.tone">{{ item.value }}</strong>
          <small>{{ item.note }}</small>
        </article>
      </section>

      <section class="identity-split">
        <article class="identity-panel identity-panel--wide">
          <header>
            <span>Cliente</span>
            <strong>Huella local</strong>
          </header>
          <div class="identity-metric-grid">
            <div v-for="item in identityCards" :key="item.label" class="identity-metric">
              <span>{{ item.label }}</span>
              <strong :class="item.tone">{{ item.value }}</strong>
              <small>{{ item.note }}</small>
            </div>
          </div>
        </article>

        <article class="identity-panel">
          <header>
            <span>Servidor</span>
            <strong>Salida Caligo</strong>
          </header>
          <dl class="identity-dl">
            <div v-for="item in serverCards" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section class="identity-split">
        <article class="identity-panel">
          <header>
            <span>Red</span>
            <strong>Privacidad y conectividad</strong>
          </header>
          <div class="identity-metric-grid identity-metric-grid--compact">
            <div v-for="item in networkCards" :key="item.label" class="identity-metric">
              <span>{{ item.label }}</span>
              <strong :class="item.tone">{{ item.value }}</strong>
              <small>{{ item.note }}</small>
            </div>
          </div>
        </article>

        <article class="identity-panel">
          <header>
            <span>Dispositivo</span>
            <strong>Hardware y render</strong>
          </header>
          <div class="identity-metric-grid identity-metric-grid--compact">
            <div v-for="item in hardwareCards" :key="item.label" class="identity-metric">
              <span>{{ item.label }}</span>
              <strong :class="item.tone">{{ item.value }}</strong>
              <small>{{ item.note }}</small>
            </div>
          </div>
        </article>
      </section>

      <section class="identity-split">
        <article class="identity-panel">
          <header>
            <span>Permisos</span>
            <strong>Superficie sensible</strong>
          </header>
          <div class="identity-metric-grid identity-metric-grid--compact">
            <div v-for="item in permissionCards" :key="item.label" class="identity-metric">
              <span>{{ item.label }}</span>
              <strong :class="item.tone">{{ item.value }}</strong>
              <small>{{ item.note }}</small>
            </div>
          </div>
        </article>

        <article class="identity-panel">
          <header>
            <span>VPN</span>
            <strong>{{ vpnActive ? "Activa" : "No activa" }}</strong>
          </header>
          <dl class="identity-dl">
            <div>
              <dt>Helper</dt>
              <dd>{{ vpnStatus.helper || "No detectado" }}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{{ vpnStatus.available ? "Operativo" : (vpnStatus.message || "Pendiente") }}</dd>
            </div>
            <div>
              <dt>Perfiles activos</dt>
              <dd>{{ activeVpnProfiles }}</dd>
            </div>
            <div>
              <dt>Salida</dt>
              <dd>{{ compactValue(vpnStatus.output || "Sin salida") }}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section class="identity-panel identity-panel--wide">
        <header>
          <span>Salida tecnica</span>
          <strong>Snapshot crudo</strong>
        </header>
        <div class="identity-raw-grid">
          <article v-for="panel in rawPanels" :key="panel.title">
            <span>{{ panel.badge }}</span>
            <strong>{{ panel.title }}</strong>
            <pre>{{ panel.content }}</pre>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";

const PERMISSION_MAP = [
  { key: "geolocation", label: "Geolocalizacion" },
  { key: "notifications", label: "Notificaciones" },
  { key: "camera", label: "Camara" },
  { key: "microphone", label: "Microfono" },
  { key: "clipboard-read", label: "Clipboard read" },
  { key: "clipboard-write", label: "Clipboard write" },
];

const TRACKER_PATTERNS = [
  { name: "Google", pattern: /google|googletagmanager|doubleclick|google-analytics/i },
  { name: "Meta", pattern: /facebook|meta/i },
  { name: "Hotjar", pattern: /hotjar/i },
  { name: "Clarity", pattern: /clarity/i },
  { name: "Matomo", pattern: /matomo|piwik/i },
  { name: "Plausible", pattern: /plausible/i },
];

function emptySnapshot() {
  return {
    scannedAt: "-",
    browserPublicIp: "-",
    browserPublicIpSource: "-",
    serverPublicIp: "-",
    serverPublicIpSource: "-",
    clientObservedIp: "-",
    forwardedFor: "-",
    browser: "-",
    browserVersion: "-",
    engine: "-",
    os: "-",
    platform: "-",
    userAgent: "-",
    language: "-",
    languages: "-",
    locale: "-",
    timezone: "-",
    vendor: "-",
    online: "-",
    secureContext: "-",
    crossOriginIsolated: "-",
    cookiesEnabled: "-",
    doNotTrack: "-",
    globalPrivacyControl: "-",
    webdriver: "-",
    connectionType: "-",
    effectiveType: "-",
    downlink: "-",
    rtt: "-",
    saveData: "-",
    cpuCores: "-",
    deviceMemory: "-",
    maxTouchPoints: "-",
    screenResolution: "-",
    availableScreen: "-",
    viewport: "-",
    pixelRatio: "-",
    colorDepth: "-",
    orientation: "-",
    darkMode: "-",
    reducedMotion: "-",
    contrast: "-",
    colorGamut: "-",
    dynamicRange: "-",
    batteryLevel: "-",
    batteryCharging: "-",
    batteryTime: "-",
    webglVendor: "-",
    webglRenderer: "-",
    storageUsage: "-",
    storageQuota: "-",
    storagePersisted: "-",
    storageEstimateStatus: "-",
    localStorageItems: "-",
    sessionStorageItems: "-",
    cookieCount: "-",
    firstPartyScripts: "-",
    thirdPartyScripts: "-",
    trackerMatches: "-",
    pluginsCount: "-",
    mimeTypesCount: "-",
    historyLength: "-",
    referrer: "-",
    mediaDevices: "-",
    audioInputs: "-",
    videoInputs: "-",
    audioOutputs: "-",
    serviceWorker: "-",
    shareApi: "-",
    bluetoothApi: "-",
    usbApi: "-",
    serialApi: "-",
    hidApi: "-",
    nfcApi: "-",
    clipboardApi: "-",
    credentialApi: "-",
    pdfViewerEnabled: "-",
    geoLat: "-",
    geoLon: "-",
    geoAccuracy: "-",
    geoTimestamp: "-",
    issues: [],
  };
}

export default {
  name: "IdentityWorkbench",
  data() {
    return {
      loading: false,
      geoLoading: false,
      copying: false,
      statusMessage: "Listo",
      permissionState: {},
      serverIdentity: null,
      vpnStatus: {},
      reportText: "",
      snapshot: emptySnapshot(),
    };
  },
  computed: {
    vpnActive() {
      return Boolean(this.vpnStatus?.active);
    },
    activeVpnProfiles() {
      const profiles = this.vpnStatus?.profiles;
      if (Array.isArray(profiles) && profiles.length) {
        return profiles.join(", ");
      }
      return this.vpnActive ? "Activa" : "Ninguno";
    },
    exposureScore() {
      let score = 18;
      score += this.numericValue(this.snapshot.thirdPartyScripts) * 8;
      score += this.numericValue(this.snapshot.cookieCount) * 2;
      score += this.numericValue(this.snapshot.localStorageItems) * 3;
      score += this.permissionGrantedCount * 9;
      if (this.snapshot.browserPublicIp !== "-" && this.snapshot.browserPublicIp !== "No disponible") score += 10;
      if (this.snapshot.geoLat !== "-") score += 14;
      if (this.snapshot.webglRenderer !== "-") score += 6;
      if (this.snapshot.mediaDevices !== "-" && this.snapshot.mediaDevices !== "0") score += 4;
      if (this.snapshot.globalPrivacyControl === "Activado") score -= 6;
      if (this.snapshot.doNotTrack === "Activado") score -= 4;
      return Math.max(0, Math.min(100, score));
    },
    permissionGrantedCount() {
      return Object.values(this.permissionState).filter((state) => state === "granted").length;
    },
    permissionPromptCount() {
      return Object.values(this.permissionState).filter((state) => state === "prompt").length;
    },
    summaryCards() {
      return [
        {
          label: "IP servidor",
          value: this.snapshot.serverPublicIp,
          note: `Fuente: ${this.snapshot.serverPublicIpSource}`,
          tone: "tone-matrix",
        },
        {
          label: "IP cliente",
          value: this.snapshot.browserPublicIp,
          note: `Observada por backend: ${this.snapshot.clientObservedIp}`,
          tone: "tone-matrix",
        },
        {
          label: "VPN servidor",
          value: this.vpnActive ? "Activa" : "Sin tunel",
          note: this.activeVpnProfiles,
          tone: this.vpnActive ? "tone-success" : "tone-neutral",
        },
        {
          label: "Exposicion local",
          value: `${this.exposureScore}/100`,
          note: `${this.permissionGrantedCount} permisos concedidos; ${this.snapshot.thirdPartyScripts} scripts terceros`,
          tone: this.exposureScore >= 70 ? "tone-warning" : "tone-neutral",
        },
      ];
    },
    identityCards() {
      return [
        this.buildCard("Navegador", this.composeBrowserLabel(), this.snapshot.engine),
        this.buildCard("Sistema", this.snapshot.os, this.snapshot.platform),
        this.buildCard("Idioma", this.snapshot.language, this.snapshot.languages),
        this.buildCard("Zona horaria", this.snapshot.timezone, this.snapshot.locale),
        this.buildCard("Contexto seguro", this.snapshot.secureContext, `COI: ${this.snapshot.crossOriginIsolated}`, this.booleanTone(this.snapshot.secureContext)),
        this.buildCard("WebDriver", this.snapshot.webdriver, "Automatizacion declarada", this.snapshot.webdriver === "Si" ? "tone-warning" : "tone-success"),
        this.buildCard("User Agent", this.compactValue(this.snapshot.userAgent), "Cadena completa expuesta"),
        this.buildCard("Referrer", this.compactValue(this.snapshot.referrer), "Procedencia visible"),
      ];
    },
    networkCards() {
      return [
        this.buildCard("Online", this.snapshot.online, "navigator.onLine", this.booleanTone(this.snapshot.online)),
        this.buildCard("Conexion", this.snapshot.connectionType, `Effective: ${this.snapshot.effectiveType}`),
        this.buildCard("Downlink", this.snapshot.downlink, `RTT: ${this.snapshot.rtt}`),
        this.buildCard("Ahorro datos", this.snapshot.saveData, "saveData del navegador", this.booleanTone(this.snapshot.saveData)),
        this.buildCard("Cookies", this.snapshot.cookiesEnabled, `${this.snapshot.cookieCount} cookies visibles`, this.booleanTone(this.snapshot.cookiesEnabled)),
        this.buildCard("DNT/GPC", `${this.snapshot.doNotTrack} / ${this.snapshot.globalPrivacyControl}`, "Preferencias de privacidad"),
        this.buildCard("Storage", this.snapshot.storageUsage, `Cuota: ${this.snapshot.storageQuota}`),
        this.buildCard("Scripts terceros", this.snapshot.thirdPartyScripts, `${this.snapshot.trackerMatches} trackers reconocidos`, this.numericValue(this.snapshot.thirdPartyScripts) ? "tone-warning" : "tone-success"),
      ];
    },
    hardwareCards() {
      return [
        this.buildCard("CPU", this.snapshot.cpuCores, "Nucleos logicos"),
        this.buildCard("Memoria", this.snapshot.deviceMemory, "deviceMemory"),
        this.buildCard("Pantalla", this.snapshot.screenResolution, `Disponible: ${this.snapshot.availableScreen}`),
        this.buildCard("Viewport", this.snapshot.viewport, `Ratio: ${this.snapshot.pixelRatio}`),
        this.buildCard("Color", this.snapshot.colorDepth, `${this.snapshot.colorGamut} / ${this.snapshot.dynamicRange}`),
        this.buildCard("GPU vendor", this.snapshot.webglVendor, "WebGL debug"),
        this.buildCard("GPU renderer", this.compactValue(this.snapshot.webglRenderer), "Renderer WebGL"),
        this.buildCard("Bateria", this.snapshot.batteryLevel, `${this.snapshot.batteryCharging} / ${this.snapshot.batteryTime}`),
      ];
    },
    permissionCards() {
      return [
        ...PERMISSION_MAP.map((item) => {
          const value = this.permissionState[item.key] || "unsupported";
          return this.buildCard(item.label, this.formatPermission(value), "Permissions API", this.permissionTone(value));
        }),
        this.buildCard("Geolocalizacion", `${this.snapshot.geoLat}, ${this.snapshot.geoLon}`, `Precision: ${this.snapshot.geoAccuracy}`, this.snapshot.geoLat === "-" ? "tone-neutral" : "tone-warning"),
        this.buildCard("Media devices", this.snapshot.mediaDevices, `${this.snapshot.audioInputs} audio / ${this.snapshot.videoInputs} video`),
      ];
    },
    serverCards() {
      const server = this.serverIdentity?.server || {};
      const client = this.serverIdentity?.client || {};
      return [
        { label: "IP publica", value: server.publicIp || "No disponible" },
        { label: "Fuente IP", value: server.publicIpSource || "No disponible" },
        { label: "Hostname", value: server.hostname || "No disponible" },
        { label: "Cliente observado", value: client.observedIp || "No disponible" },
        { label: "X-Forwarded-For", value: client.forwardedFor || "Vacio" },
        { label: "Origin", value: client.origin || "Vacio" },
        { label: "Interfaces", value: this.serverInterfaceLabel },
      ];
    },
    serverInterfaceLabel() {
      const interfaces = this.serverIdentity?.server?.interfaces;
      if (!Array.isArray(interfaces) || !interfaces.length) {
        return "No expuestas";
      }
      return interfaces.map((item) => `${item.name}: ${(item.addresses || []).join(", ")}`).join(" | ");
    },
    rawPanels() {
      return [
        { title: "Cliente", badge: "browser", content: this.prettyPrint(this.snapshot) },
        { title: "Servidor", badge: "backend", content: this.prettyPrint(this.serverIdentity || {}) },
        { title: "Permisos", badge: "permissions", content: this.prettyPrint(this.permissionState) },
        { title: "VPN", badge: "vpn", content: this.prettyPrint(this.vpnStatus || {}) },
      ];
    },
  },
  mounted() {
    this.refreshAll().finally(() => this.requestGeoLocation({ automatic: true }));
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("online", this.handleConnectivityChange);
    window.addEventListener("offline", this.handleConnectivityChange);
    navigator.connection?.addEventListener?.("change", this.handleConnectivityChange);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("online", this.handleConnectivityChange);
    window.removeEventListener("offline", this.handleConnectivityChange);
    navigator.connection?.removeEventListener?.("change", this.handleConnectivityChange);
  },
  methods: {
    async refreshAll() {
      this.loading = true;
      this.statusMessage = "Leyendo cliente y servidor";
      this.snapshot.issues = [];
      this.snapshot.scannedAt = new Date().toLocaleString();
      this.captureEnvironment();

      await Promise.allSettled([
        this.fetchBrowserPublicIp(),
        this.fetchServerIdentity(),
        this.inspectStorage(),
        this.inspectPermissions(),
        this.inspectMediaDevices(),
        this.inspectBattery(),
        this.inspectWebGl(),
      ]);
      this.buildReport();
      this.statusMessage = "Lectura actualizada";
      this.loading = false;
    },
    captureEnvironment() {
      const nav = navigator;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;
      const intl = Intl.DateTimeFormat().resolvedOptions();

      this.snapshot.online = nav.onLine ? "Si" : "No";
      this.snapshot.secureContext = window.isSecureContext ? "Si" : "No";
      this.snapshot.crossOriginIsolated = window.crossOriginIsolated ? "Si" : "No";
      this.snapshot.browser = this.detectBrowser(nav.userAgent);
      this.snapshot.browserVersion = this.detectBrowserVersion(nav.userAgent);
      this.snapshot.engine = this.detectEngine(nav.userAgent);
      this.snapshot.os = this.detectOS(nav.userAgent);
      this.snapshot.platform = nav.userAgentData?.platform || nav.platform || "No expuesto";
      this.snapshot.userAgent = nav.userAgent || "No expuesto";
      this.snapshot.language = nav.language || "No expuesto";
      this.snapshot.languages = Array.isArray(nav.languages) && nav.languages.length ? nav.languages.join(", ") : "No expuesto";
      this.snapshot.locale = intl.locale || "No expuesto";
      this.snapshot.timezone = intl.timeZone || "No expuesto";
      this.snapshot.vendor = nav.vendor || "No expuesto";
      this.snapshot.cookiesEnabled = nav.cookieEnabled ? "Si" : "No";
      this.snapshot.doNotTrack = nav.doNotTrack === "1" ? "Activado" : "Desactivado";
      this.snapshot.globalPrivacyControl = nav.globalPrivacyControl ? "Activado" : "No expuesto";
      this.snapshot.webdriver = nav.webdriver ? "Si" : "No";
      this.snapshot.connectionType = connection?.type || "No expuesto";
      this.snapshot.effectiveType = connection?.effectiveType || "No expuesto";
      this.snapshot.downlink = connection?.downlink ? `${connection.downlink} Mbps` : "No expuesto";
      this.snapshot.rtt = connection?.rtt ? `${connection.rtt} ms` : "No expuesto";
      this.snapshot.saveData = connection?.saveData ? "Si" : "No";
      this.snapshot.cpuCores = nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : "No expuesto";
      this.snapshot.deviceMemory = nav.deviceMemory ? `${nav.deviceMemory} GB` : "No expuesto";
      this.snapshot.maxTouchPoints = String(nav.maxTouchPoints || 0);
      this.snapshot.screenResolution = `${window.screen.width} x ${window.screen.height}`;
      this.snapshot.availableScreen = `${window.screen.availWidth} x ${window.screen.availHeight}`;
      this.snapshot.viewport = `${window.innerWidth} x ${window.innerHeight}`;
      this.snapshot.pixelRatio = String(window.devicePixelRatio || 1);
      this.snapshot.colorDepth = `${window.screen.colorDepth} bits`;
      this.snapshot.orientation = window.screen.orientation?.type || "No expuesto";
      this.snapshot.darkMode = this.matchMediaState("(prefers-color-scheme: dark)");
      this.snapshot.reducedMotion = this.matchMediaState("(prefers-reduced-motion: reduce)");
      this.snapshot.contrast = this.detectContrast();
      this.snapshot.colorGamut = this.detectColorGamut();
      this.snapshot.dynamicRange = this.matchMedia("(dynamic-range: high)") ? "Alta" : "Estandar o no expuesto";
      this.snapshot.historyLength = String(window.history.length);
      this.snapshot.referrer = document.referrer || "Directo / vacio";
      this.snapshot.localStorageItems = this.safeStorageLength(window.localStorage);
      this.snapshot.sessionStorageItems = this.safeStorageLength(window.sessionStorage);
      this.snapshot.cookieCount = document.cookie ? String(document.cookie.split(";").filter(Boolean).length) : "0";
      this.captureScriptSurface();
      this.captureFeatureSurface();
    },
    async fetchBrowserPublicIp() {
      const sources = [
        { name: "api.ipify.org", url: "https://api.ipify.org?format=json", parse: async (response) => (await response.json()).ip },
        { name: "icanhazip.com", url: "https://icanhazip.com", parse: async (response) => (await response.text()).trim() },
      ];
      for (const source of sources) {
        try {
          const response = await fetch(source.url, { cache: "no-store" });
          if (!response.ok) continue;
          const ip = await source.parse(response);
          if (this.looksLikeIp(ip)) {
            this.snapshot.browserPublicIp = ip;
            this.snapshot.browserPublicIpSource = source.name;
            return;
          }
        } catch {
          // Try next source.
        }
      }
      this.snapshot.browserPublicIp = "No disponible";
      this.snapshot.browserPublicIpSource = "sin respuesta";
      this.pushIssue("No se pudo resolver la IP publica del navegador.");
    },
    async fetchServerIdentity() {
      try {
        const payload = await caligoApi.request("/api/network/identity");
        this.serverIdentity = payload;
        this.vpnStatus = payload?.vpn || {};
        this.snapshot.serverPublicIp = payload?.server?.publicIp || "No disponible";
        this.snapshot.serverPublicIpSource = payload?.server?.publicIpSource || "sin respuesta";
        this.snapshot.clientObservedIp = payload?.client?.observedIp || "No disponible";
        this.snapshot.forwardedFor = payload?.client?.forwardedFor || "";
      } catch (error) {
        this.pushIssue(error?.message || "No se pudo leer identidad del servidor Caligo.");
      }
    },
    async inspectStorage() {
      try {
        if (!navigator.storage?.estimate) {
          this.snapshot.storageEstimateStatus = "StorageManager no disponible";
          this.snapshot.storageUsage = "No expuesto";
          this.snapshot.storageQuota = "No expuesto";
          this.snapshot.storagePersisted = "No expuesto";
          return;
        }
        const estimate = await navigator.storage.estimate();
        this.snapshot.storageUsage = this.formatBytes(estimate.usage);
        this.snapshot.storageQuota = this.formatBytes(estimate.quota);
        this.snapshot.storageEstimateStatus = "Estimate disponible";
        if (navigator.storage.persisted) {
          const persisted = await navigator.storage.persisted();
          this.snapshot.storagePersisted = persisted ? "Si" : "No";
        }
      } catch {
        this.snapshot.storageEstimateStatus = "No se pudo estimar storage";
      }
    },
    async inspectPermissions() {
      if (!navigator.permissions?.query) {
        this.permissionState = {};
        this.pushIssue("Permissions API no disponible.");
        return;
      }
      const states = {};
      for (const permission of PERMISSION_MAP) {
        try {
          const result = await navigator.permissions.query({ name: permission.key });
          states[permission.key] = result.state;
        } catch {
          states[permission.key] = "unsupported";
        }
      }
      this.permissionState = states;
    },
    async inspectMediaDevices() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) {
          this.snapshot.mediaDevices = "No soportado";
          return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.snapshot.mediaDevices = String(devices.length);
        this.snapshot.audioInputs = String(devices.filter((item) => item.kind === "audioinput").length);
        this.snapshot.videoInputs = String(devices.filter((item) => item.kind === "videoinput").length);
        this.snapshot.audioOutputs = String(devices.filter((item) => item.kind === "audiooutput").length);
      } catch {
        this.snapshot.mediaDevices = "Bloqueado";
      }
    },
    async inspectBattery() {
      try {
        if (typeof navigator.getBattery !== "function") {
          this.snapshot.batteryLevel = "No soportado";
          this.snapshot.batteryCharging = "No soportado";
          this.snapshot.batteryTime = "No soportado";
          return;
        }
        const battery = await navigator.getBattery();
        this.snapshot.batteryLevel = `${Math.round(battery.level * 100)}%`;
        this.snapshot.batteryCharging = battery.charging ? "Cargando" : "Descargando";
        this.snapshot.batteryTime = battery.charging
          ? (battery.chargingTime === Infinity ? "Indeterminado" : `${battery.chargingTime}s carga`)
          : (battery.dischargingTime === Infinity ? "Indeterminado" : `${battery.dischargingTime}s restantes`);
      } catch {
        this.snapshot.batteryLevel = "No expuesto";
      }
    },
    async inspectWebGl() {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
          this.snapshot.webglVendor = "No disponible";
          this.snapshot.webglRenderer = "No disponible";
          return;
        }
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        this.snapshot.webglVendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "Generico";
        this.snapshot.webglRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Renderer oculto";
      } catch {
        this.snapshot.webglVendor = "No disponible";
        this.snapshot.webglRenderer = "No disponible";
      }
    },
    captureScriptSurface() {
      const currentHost = window.location.host;
      const scripts = Array.from(document.scripts || []);
      let firstParty = 0;
      let thirdParty = 0;
      let trackerHits = 0;
      scripts.forEach((script) => {
        if (!script.src) return;
        try {
          const url = new URL(script.src, window.location.href);
          const isFirstParty = url.host === currentHost;
          firstParty += isFirstParty ? 1 : 0;
          thirdParty += isFirstParty ? 0 : 1;
          trackerHits += TRACKER_PATTERNS.some((item) => item.pattern.test(url.href)) ? 1 : 0;
        } catch {
          firstParty += 1;
        }
      });
      this.snapshot.firstPartyScripts = String(firstParty);
      this.snapshot.thirdPartyScripts = String(thirdParty);
      this.snapshot.trackerMatches = String(trackerHits);
    },
    captureFeatureSurface() {
      const nav = navigator;
      this.snapshot.pluginsCount = typeof nav.plugins?.length === "number" ? String(nav.plugins.length) : "No expuesto";
      this.snapshot.mimeTypesCount = typeof nav.mimeTypes?.length === "number" ? String(nav.mimeTypes.length) : "No expuesto";
      this.snapshot.serviceWorker = "serviceWorker" in nav ? "Si" : "No";
      this.snapshot.shareApi = "share" in nav ? "Si" : "No";
      this.snapshot.bluetoothApi = "bluetooth" in nav ? "Si" : "No";
      this.snapshot.usbApi = "usb" in nav ? "Si" : "No";
      this.snapshot.serialApi = "serial" in nav ? "Si" : "No";
      this.snapshot.hidApi = "hid" in nav ? "Si" : "No";
      this.snapshot.nfcApi = "NDEFReader" in window ? "Si" : "No";
      this.snapshot.clipboardApi = nav.clipboard ? "Si" : "No";
      this.snapshot.credentialApi = "credentials" in nav ? "Si" : "No";
      this.snapshot.pdfViewerEnabled = typeof nav.pdfViewerEnabled === "boolean" ? (nav.pdfViewerEnabled ? "Si" : "No") : "No expuesto";
    },
    async requestGeoLocation(options = {}) {
      if (!navigator.geolocation || this.geoLoading) {
        return false;
      }
      this.geoLoading = true;
      this.statusMessage = options.automatic ? "Solicitando ubicacion" : "Leyendo geolocalizacion";
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.snapshot.geoLat = position.coords.latitude.toFixed(5);
            this.snapshot.geoLon = position.coords.longitude.toFixed(5);
            this.snapshot.geoAccuracy = `${Math.round(position.coords.accuracy)} m`;
            this.snapshot.geoTimestamp = new Date(position.timestamp).toLocaleString();
            this.geoLoading = false;
            this.inspectPermissions().finally(() => {
              this.buildReport();
              resolve(true);
            });
          },
          (error) => {
            this.pushIssue(`Geolocalizacion: ${this.describeGeolocationError(error)}`);
            this.geoLoading = false;
            this.inspectPermissions().finally(() => {
              this.buildReport();
              resolve(false);
            });
          },
          { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 },
        );
      });
    },
    describeGeolocationError(error) {
      if (error?.code === 1) return "permiso denegado";
      if (error?.code === 2) return "posicion no disponible";
      if (error?.code === 3) return "timeout";
      return error?.message || "error desconocido";
    },
    downloadJson() {
      const blob = new Blob([JSON.stringify(this.buildExportPayload(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      link.href = url;
      link.download = `caligo-whoami-${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    async copyReport() {
      if (!this.reportText || !navigator.clipboard?.writeText) return;
      this.copying = true;
      try {
        await navigator.clipboard.writeText(this.reportText);
        this.statusMessage = "Informe copiado";
      } catch {
        this.statusMessage = "No se pudo copiar";
      } finally {
        this.copying = false;
      }
    },
    buildExportPayload() {
      return {
        tool: "Caligo WHOAMI",
        scannedAt: this.snapshot.scannedAt,
        exposureScore: this.exposureScore,
        permissionState: this.permissionState,
        snapshot: this.snapshot,
        serverIdentity: this.serverIdentity,
        vpn: this.vpnStatus,
      };
    },
    buildReport() {
      this.reportText = [
        "Caligo WHOAMI",
        `Escaneo: ${this.snapshot.scannedAt}`,
        "",
        "[IPs]",
        `Servidor: ${this.snapshot.serverPublicIp} (${this.snapshot.serverPublicIpSource})`,
        `Cliente publico: ${this.snapshot.browserPublicIp} (${this.snapshot.browserPublicIpSource})`,
        `Cliente observado por backend: ${this.snapshot.clientObservedIp}`,
        "",
        "[Navegador]",
        `Browser: ${this.composeBrowserLabel()}`,
        `OS: ${this.snapshot.os}`,
        `Idioma: ${this.snapshot.language}`,
        `Timezone: ${this.snapshot.timezone}`,
        `User-Agent: ${this.snapshot.userAgent}`,
        "",
        "[Privacidad]",
        `Exposicion: ${this.exposureScore}/100`,
        `Permisos concedidos: ${this.permissionGrantedCount}`,
        `Cookies: ${this.snapshot.cookiesEnabled} (${this.snapshot.cookieCount})`,
        `Storage: ${this.snapshot.storageUsage} / ${this.snapshot.storageQuota}`,
        `Terceros: ${this.snapshot.thirdPartyScripts} scripts, ${this.snapshot.trackerMatches} trackers`,
        "",
        "[VPN]",
        `Activa: ${this.vpnActive ? "Si" : "No"}`,
        `Perfiles: ${this.activeVpnProfiles}`,
        "",
        "[Incidencias]",
        ...(this.snapshot.issues.length ? this.snapshot.issues : ["Sin incidencias relevantes"]),
      ].join("\n");
    },
    handleResize() {
      this.snapshot.viewport = `${window.innerWidth} x ${window.innerHeight}`;
      this.buildReport();
    },
    handleConnectivityChange() {
      this.captureEnvironment();
      this.buildReport();
    },
    pushIssue(message) {
      if (message && !this.snapshot.issues.includes(message)) {
        this.snapshot.issues.push(message);
      }
    },
    buildCard(label, value, note, tone = "tone-neutral") {
      return { label, value, note, tone };
    },
    formatPermission(state) {
      if (state === "granted") return "Concedido";
      if (state === "denied") return "Denegado";
      if (state === "prompt") return "Pendiente";
      if (state === "unsupported") return "No soportado";
      return "No consultado";
    },
    permissionTone(state) {
      if (state === "granted") return "tone-warning";
      if (state === "denied") return "tone-success";
      return "tone-neutral";
    },
    booleanTone(value) {
      return value === "Si" || value === "Activado" ? "tone-success" : "tone-neutral";
    },
    numericValue(value) {
      const parsed = Number.parseInt(String(value), 10);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    safeStorageLength(storage) {
      try {
        return String(storage.length);
      } catch {
        return "No accesible";
      }
    },
    matchMedia(query) {
      return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
    },
    matchMediaState(query) {
      return this.matchMedia(query) ? "Si" : "No";
    },
    detectContrast() {
      if (this.matchMedia("(prefers-contrast: more)")) return "Mas contraste";
      if (this.matchMedia("(prefers-contrast: less)")) return "Menos contraste";
      return "Normal o no expuesto";
    },
    detectColorGamut() {
      if (this.matchMedia("(color-gamut: rec2020)")) return "rec2020";
      if (this.matchMedia("(color-gamut: p3)")) return "p3";
      if (this.matchMedia("(color-gamut: srgb)")) return "srgb";
      return "No expuesto";
    },
    formatBytes(value) {
      if (typeof value !== "number" || Number.isNaN(value)) return "No expuesto";
      if (value === 0) return "0 B";
      const units = ["B", "KB", "MB", "GB", "TB"];
      const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
      const amount = value / (1024 ** exponent);
      return `${amount.toFixed(amount >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
    },
    prettyPrint(value) {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    },
    compactValue(value) {
      const text = String(value || "-");
      return text.length > 110 ? `${text.slice(0, 107)}...` : text;
    },
    composeBrowserLabel() {
      return `${this.snapshot.browser} ${this.snapshot.browserVersion}`.trim();
    },
    detectBrowser(ua) {
      if (/Edg\//i.test(ua)) return "Edge";
      if (/OPR\//i.test(ua)) return "Opera";
      if (/Firefox\//i.test(ua)) return "Firefox";
      if (/Chrome\//i.test(ua)) return "Chrome";
      if (/Safari\//i.test(ua)) return "Safari";
      return "Otro";
    },
    detectBrowserVersion(ua) {
      const matchers = [/Edg\/([\d.]+)/i, /OPR\/([\d.]+)/i, /Firefox\/([\d.]+)/i, /Chrome\/([\d.]+)/i, /Version\/([\d.]+)/i];
      for (const matcher of matchers) {
        const match = ua.match(matcher);
        if (match) return match[1];
      }
      return "N/D";
    },
    detectEngine(ua) {
      if (/AppleWebKit/i.test(ua) && /Chrome|Edg|OPR/i.test(ua)) return "Blink";
      if (/AppleWebKit/i.test(ua) && /Safari/i.test(ua)) return "WebKit";
      if (/Gecko\//i.test(ua) && /Firefox/i.test(ua)) return "Gecko";
      return "No detectado";
    },
    detectOS(ua) {
      if (/Windows NT/i.test(ua)) return "Windows";
      if (/Android/i.test(ua)) return "Android";
      if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
      if (/Mac OS X/i.test(ua)) return "macOS";
      if (/Linux/i.test(ua)) return "Linux";
      return "Otro";
    },
    looksLikeIp(value) {
      return /^[0-9a-fA-F:.]{3,80}$/.test(String(value || ""));
    },
  },
};
</script>
