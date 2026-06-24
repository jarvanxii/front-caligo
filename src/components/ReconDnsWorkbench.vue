<template>
  <section class="scanner-workspace recon-dns-workspace" :class="`recon-dns-workspace--${toolId}`" aria-labelledby="recon-dns-title">
    <div class="scanner-workspace__shell">
      <ToolHeroHeader
        :tool-id="toolId"
        :title="toolCopy.title"
        :eyebrow="toolCopy.eyebrow"
        :summary="toolCopy.summary"
        title-id="recon-dns-title"
        :logo-tools="[toolId]"
        :meta="heroMeta"
      />

      <div class="scanner-layout">
        <form class="scanner-console recon-dns-console" @submit.prevent="startRun">
          <header class="scanner-console__head">
            <span>Parámetros</span>
            <strong>{{ toolCopy.command }}</strong>
          </header>

          <label for="recon-dns-target">
            {{ isFping ? "Hosts o rango autorizado" : "Dominio autorizado" }}
            <input
              id="recon-dns-target"
              v-model.trim="form.target"
              type="text"
              autocomplete="off"
              spellcheck="false"
              :placeholder="toolCopy.placeholder"
            />
          </label>

          <div class="scanner-field-grid">
            <label>
              Modo
              <select v-model="form.mode">
                <option v-for="mode in modes" :key="optionValue(mode)" :value="optionValue(mode)">
                  {{ optionLabel(mode) }}
                </option>
              </select>
            </label>

            <label v-if="!isAssetfinder && !isFping">
              Servidor DNS
              <input v-model.trim="form.nameServer" type="text" placeholder="1.1.1.1, 8.8.8.8 o vacío" />
            </label>

            <label v-if="isFping">
              Count
              <input v-model.number="form.count" type="number" min="1" max="10" step="1" />
            </label>

            <label v-if="!isAssetfinder && !isFping">
              Threads
              <input v-model.number="form.threads" type="number" min="1" max="80" step="1" />
            </label>

            <label v-if="isFping">
              Intervalo
              <input v-model.number="form.intervalMillis" type="number" min="100" max="5000" step="100" />
            </label>
          </div>

          <div v-if="needsWordlist" class="scanner-field-grid">
            <label>
              Wordlist DNS
              <select v-model="form.wordlist">
                <option v-for="wordlist in wordlists" :key="optionValue(wordlist)" :value="optionValue(wordlist)">
                  {{ optionLabel(wordlist) }}
                </option>
              </select>
            </label>

            <label>
              Timeout
              <input v-model.number="form.timeoutSeconds" type="number" min="5" max="1800" step="5" />
            </label>
          </div>

          <div v-else class="scanner-field-grid scanner-field-grid--ports">
            <label v-if="isFping">
              Timeout por host
              <input v-model.number="form.timeoutMillis" type="number" min="100" max="10000" step="100" />
            </label>
            <label v-else>
              Timeout
              <input v-model.number="form.timeoutSeconds" type="number" min="5" max="1800" step="5" />
            </label>
          </div>

          <label v-if="form.wordlist === 'custom' || isFierce" class="recon-dns-console__wide">
            Subdominios personalizados
            <textarea
              v-model.trim="subdomainsText"
              rows="4"
              spellcheck="false"
              placeholder="www, mail, vpn, api..."
            ></textarea>
          </label>

          <div class="scanner-switch-grid recon-dns-switch-grid">
            <label v-if="isAssetfinder" class="scanner-switch">
              <input v-model="form.subsOnly" type="checkbox" />
              <span>Solo subdominios</span>
            </label>
            <label v-if="isDnsenum || isDnsrecon" class="scanner-switch">
              <input v-model="form.bruteForce" type="checkbox" />
              <span>Bruteforce DNS</span>
            </label>
            <label v-if="isDnsrecon" class="scanner-switch">
              <input v-model="form.zoneTransfer" type="checkbox" />
              <span>AXFR</span>
            </label>
            <label v-if="isDnsrecon" class="scanner-switch">
              <input v-model="form.crtsh" type="checkbox" />
              <span>crt.sh</span>
            </label>
            <label v-if="isDnsrecon" class="scanner-switch">
              <input v-model="form.whois" type="checkbox" />
              <span>Whois profundo</span>
            </label>
            <label v-if="isFierce" class="scanner-switch">
              <input v-model="form.wide" type="checkbox" />
              <span>Wide scan</span>
            </label>
            <label v-if="isFierce" class="scanner-switch">
              <input v-model="form.tcp" type="checkbox" />
              <span>DNS TCP</span>
            </label>
            <label v-if="isFping" class="scanner-switch">
              <input v-model="form.aliveOnly" type="checkbox" />
              <span>Solo vivos</span>
            </label>
          </div>

          <label class="scanner-switch recon-dns-authorized">
            <input v-model="form.authorized" type="checkbox" />
            <span>Confirmo que el objetivo pertenece a un entorno autorizado.</span>
          </label>

          <button type="submit" :disabled="starting || !canStart">
            {{ startButtonLabel }}
          </button>

          <p v-if="error" class="scanner-error">{{ error }}</p>
          <p v-else-if="capabilityError" class="scanner-warning">{{ capabilityError }}</p>
        </form>

        <section class="scanner-run" aria-label="Ejecución">
          <header class="scanner-run__head">
            <span>{{ job?.status || "READY" }}</span>
            <strong>{{ progress }}%</strong>
          </header>

          <div class="scanner-progress" aria-label="Progreso">
            <span :style="{ width: `${progress}%` }"></span>
          </div>

          <dl class="scanner-run__meta">
            <div>
              <dt>Fase</dt>
              <dd>{{ job?.phase || "Esperando parámetros" }}</dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>{{ durationLabel }}</dd>
            </div>
            <div>
              <dt>Hallazgos</dt>
              <dd>{{ findingCount }}</dd>
            </div>
          </dl>

          <div v-if="job?.command" class="scanner-command">
            <span>Comando</span>
            <code>{{ job.command }}</code>
          </div>

          <div v-if="logLines.length" class="scanner-log">
            <span>Traza</span>
            <pre>{{ logLines.join("\n") }}</pre>
          </div>
        </section>
      </div>

      <section v-if="summaryCards.length" class="scanner-results scanner-results--summary">
        <article v-for="card in summaryCards" :key="card.label">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>
      </section>

      <section class="scanner-panel">
        <header>
          <span>Salida normalizada</span>
          <h2>{{ outputTitle }}</h2>
        </header>

        <div v-if="findings.length" class="scanner-table recon-dns-table">
          <div class="scanner-table__row scanner-table__row--head">
            <span>Tipo</span>
            <span>Host</span>
            <span>IP</span>
            <span>Señal</span>
          </div>
          <div v-for="(finding, index) in findings" :key="`${finding.host || finding.address || finding.line}-${index}`" class="scanner-table__row">
            <strong>{{ finding.type || finding.record_type || "signal" }}</strong>
            <code>{{ finding.host || finding.name || finding.domain || "N/D" }}</code>
            <span>{{ finding.address || finding.addresses || finding.mname || "N/D" }}</span>
            <span>{{ finding.line || finding.target || finding.exchange || finding.value || "Registro detectado" }}</span>
          </div>
        </div>

        <pre v-else>{{ rawOutput || "La salida aparecerá aquí cuando termine la ejecución." }}</pre>
      </section>

      <section class="scanner-panel recon-dns-history">
        <header>
          <span>Historial</span>
          <button type="button" @click="loadHistory">Actualizar</button>
        </header>
        <div v-if="history.length" class="recon-dns-history__list">
          <button v-for="item in history" :key="item.id" type="button" @click="loadJob(item.id)">
            <span>{{ item.target }}</span>
            <strong>{{ item.status }}</strong>
          </button>
        </div>
        <p v-else>No hay ejecuciones recientes de {{ toolCopy.title }}.</p>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { forgetRuntimeJob, isRuntimeJobRunning, rememberedRuntimeJob, rememberRuntimeJob } from "@/services/runtimeJobs";
import { findCatalogTool } from "@/data/toolCatalog";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

const TOOL_COPY = {
  assetfinder: {
    title: "assetfinder",
    command: "AST",
    eyebrow: "SCAN / DNS",
    summary: "Recolecta dominios y subdominios relacionados usando fuentes OSINT rápidas desde el servidor.",
    placeholder: "iana.org",
  },
  dnsenum: {
    title: "DNSEnum",
    command: "DEN",
    eyebrow: "SCAN / DNS",
    summary: "Enumera registros DNS y permite una fuerza bruta acotada de subdominios con diccionarios controlados.",
    placeholder: "iana.org",
  },
  dnsrecon: {
    title: "DNSRecon",
    command: "DRC",
    eyebrow: "SCAN / DNS",
    summary: "Orquesta enumeración DNS, AXFR, SRV, crt.sh y brute force con salida normalizada en JSON.",
    placeholder: "iana.org",
  },
  fierce: {
    title: "Fierce",
    command: "FRC",
    eyebrow: "SCAN / DNS",
    summary: "Localiza subdominios y rangos no contiguos relacionados con un dominio autorizado.",
    placeholder: "iana.org",
  },
  fping: {
    title: "fping",
    command: "FPN",
    eyebrow: "SCAN / Hosts",
    summary: "Ping sweep ligero para detectar hosts vivos antes de lanzar escaneos más profundos.",
    placeholder: "127.0.0.1, 192.168.0.253 o 192.168.0.0/30",
  },
};

export default {
  name: "ReconDnsWorkbench",
  components: {
    ToolHeroHeader,
  },
  props: {
    toolId: {
      type: String,
      required: true,
      validator: (value) => Object.keys(TOOL_COPY).includes(value),
    },
  },
  data() {
    return {
      capabilities: null,
      capabilityError: "",
      starting: false,
      error: "",
      job: null,
      history: [],
      pollTimer: null,
      subdomainsText: "www, mail, vpn, api",
      form: {
        target: "",
        mode: "",
        wordlist: "small",
        nameServer: "",
        authorized: false,
        subsOnly: true,
        bruteForce: false,
        zoneTransfer: false,
        reverseLookup: false,
        crtsh: false,
        bing: false,
        yandex: false,
        whois: false,
        dnssec: false,
        tcp: false,
        wide: false,
        connect: false,
        aliveOnly: true,
        threads: 10,
        count: 1,
        intervalMillis: 500,
        timeoutMillis: 1000,
        timeoutSeconds: 120,
      },
    };
  },
  computed: {
    catalogTool() {
      return findCatalogTool(this.toolId) || {};
    },
    toolCopy() {
      return TOOL_COPY[this.toolId];
    },
    runtimeScope() {
      return `scan.${this.toolId}`;
    },
    isAssetfinder() {
      return this.toolId === "assetfinder";
    },
    isDnsenum() {
      return this.toolId === "dnsenum";
    },
    isDnsrecon() {
      return this.toolId === "dnsrecon";
    },
    isFierce() {
      return this.toolId === "fierce";
    },
    isFping() {
      return this.toolId === "fping";
    },
    engineReady() {
      return Boolean(this.capabilities?.available);
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.engineReady ? "Operativo" : "Pendiente" },
        { label: "Motor", value: this.capabilities?.binary || this.catalogTool.command || this.toolCopy.title },
        { label: "Versión", value: this.capabilities?.version || "Inventario servidor" },
      ];
    },
    modes() {
      return this.capabilities?.modes || [{ value: "standard", label: "Estándar" }];
    },
    wordlists() {
      return this.capabilities?.wordlists || [{ value: "small", label: "Compacta" }];
    },
    needsWordlist() {
      return this.isDnsenum || this.isDnsrecon;
    },
    canStart() {
      return this.engineReady && this.form.target && this.form.authorized && !this.isRunning;
    },
    isRunning() {
      return isRuntimeJobRunning(this.job);
    },
    startButtonLabel() {
      if (this.starting) return "Lanzando";
      if (this.isRunning) return "En ejecución";
      return `Ejecutar ${this.toolCopy.title}`;
    },
    progress() {
      return Math.max(0, Math.min(100, Number(this.job?.progress || 0)));
    },
    durationLabel() {
      const ms = this.job?.durationMs;
      if (!ms) return "0s";
      if (ms < 1000) return `${ms}ms`;
      const seconds = Math.round(ms / 1000);
      if (seconds < 60) return `${seconds}s`;
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    },
    result() {
      return this.job?.result || null;
    },
    findings() {
      return (this.result?.findings || []).slice(0, 250);
    },
    findingCount() {
      return Number(this.result?.findingCount || this.findings.length || 0);
    },
    logLines() {
      return (this.job?.logs || []).slice(-10);
    },
    rawOutput() {
      return this.result?.stdout || this.result?.stderr || "";
    },
    outputTitle() {
      return `${this.findingCount} señal${this.findingCount === 1 ? "" : "es"} detectada${this.findingCount === 1 ? "" : "s"}`;
    },
    summaryCards() {
      const summary = this.result?.summary || {};
      if (!this.result) return [];
      if (this.isFping) {
        return [
          { label: "Hosts", value: summary.hosts ?? 0 },
          { label: "Vivos", value: summary.alive ?? 0 },
          { label: "Sin respuesta", value: summary.unreachable ?? 0 },
          { label: "Exit", value: this.result.exitCode ?? 0 },
        ];
      }
      return [
        { label: "Hallazgos", value: summary.findings ?? this.findingCount },
        { label: "Hosts", value: summary.hosts ?? 0 },
        { label: "IPs", value: summary.addresses ?? 0 },
        { label: "Exit", value: this.result.exitCode ?? 0 },
      ];
    },
  },
  watch: {
    toolId: {
      immediate: true,
      handler() {
        this.reset();
        this.loadCapabilities();
        this.restoreJob();
        this.loadHistory();
      },
    },
    "form.mode"(mode) {
      if (this.isAssetfinder) {
        this.form.subsOnly = mode !== "passive";
      }
      if (this.isDnsenum) {
        this.form.bruteForce = mode === "bruteforce";
      }
      if (this.isDnsrecon) {
        this.form.bruteForce = mode === "bruteforce";
        this.form.zoneTransfer = mode === "axfr";
        this.form.crtsh = mode === "crtsh";
      }
      if (this.isFierce) {
        this.form.wide = mode === "wide";
      }
    },
  },
  beforeUnmount() {
    this.stopPolling();
  },
  activated() {
    if (isRuntimeJobRunning(this.job)) {
      this.startPolling();
    } else if (!this.job) {
      this.restoreJob();
    }
  },
  deactivated() {
    this.stopPolling();
  },
  methods: {
    reset() {
      this.stopPolling();
      this.capabilities = null;
      this.capabilityError = "";
      this.error = "";
      this.job = null;
      this.history = [];
      this.subdomainsText = "www, mail, vpn, api";
      this.form = {
        target: this.isFping ? "127.0.0.1" : "iana.org",
        mode: this.isAssetfinder ? "subs-only" : this.isFping ? "alive" : "standard",
        wordlist: "small",
        nameServer: "",
        authorized: false,
        subsOnly: true,
        bruteForce: false,
        zoneTransfer: false,
        reverseLookup: false,
        crtsh: false,
        bing: false,
        yandex: false,
        whois: false,
        dnssec: false,
        tcp: false,
        wide: false,
        connect: false,
        aliveOnly: true,
        threads: 10,
        count: 1,
        intervalMillis: 500,
        timeoutMillis: 1000,
        timeoutSeconds: 120,
      };
    },
    async ensureSession() {
      if (this.$store.getters.isPortfolioMode) {
        throw new Error("Modo demo activo: inicia sesión con credenciales para ejecutar herramientas.");
      }
      if (!this.$store.getters.hasAppAccess) {
        this.$router.push({ name: "login" });
        throw new Error("Inicia sesión para ejecutar herramientas");
      }
    },
    async loadCapabilities() {
      try {
        await this.ensureSession();
        this.capabilities = await caligoApi.request(`/api/recon/${this.toolId}/capabilities`);
        this.applyDefaults();
      } catch (error) {
        this.capabilityError = error.message || "No se pudo consultar el motor";
      }
    },
    applyDefaults() {
      const defaults = this.capabilities?.defaults || {};
      this.form = {
        ...this.form,
        ...defaults,
        target: this.form.target || defaults.target || this.form.target,
        authorized: false,
      };
      if (Array.isArray(defaults.subdomains)) {
        this.subdomainsText = defaults.subdomains.join(", ");
      }
    },
    async startRun() {
      this.error = "";
      this.starting = true;
      try {
        await this.ensureSession();
        this.job = await caligoApi.request(`/api/recon/${this.toolId}/scans`, {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        this.startPolling();
        await this.loadHistory();
      } catch (error) {
        this.error = error.message || "No se pudo iniciar la herramienta";
      } finally {
        this.starting = false;
      }
    },
    payload() {
      return {
        target: this.form.target,
        mode: this.form.mode,
        wordlist: this.form.wordlist,
        nameServer: this.form.nameServer,
        subdomains: this.subdomains(),
        authorized: this.form.authorized,
        subsOnly: this.form.subsOnly,
        bruteForce: this.form.bruteForce,
        zoneTransfer: this.form.zoneTransfer,
        reverseLookup: this.form.reverseLookup,
        crtsh: this.form.crtsh,
        bing: this.form.bing,
        yandex: this.form.yandex,
        whois: this.form.whois,
        dnssec: this.form.dnssec,
        tcp: this.form.tcp,
        wide: this.form.wide,
        connect: this.form.connect,
        aliveOnly: this.form.aliveOnly,
        threads: this.form.threads,
        count: this.form.count,
        intervalMillis: this.form.intervalMillis,
        timeoutMillis: this.form.timeoutMillis,
        timeoutSeconds: this.form.timeoutSeconds,
      };
    },
    subdomains() {
      return this.subdomainsText
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    },
    async restoreJob() {
      const id = rememberedRuntimeJob(this.runtimeScope);
      if (!id) return;
      try {
        await this.loadJob(id);
        if (isRuntimeJobRunning(this.job)) {
          this.startPolling();
        } else {
          forgetRuntimeJob(this.runtimeScope);
        }
      } catch {
        forgetRuntimeJob(this.runtimeScope);
      }
    },
    async loadJob(id) {
      this.job = await caligoApi.request(`/api/recon/${this.toolId}/scans/${id}`);
      this.form.target = this.job.target || this.form.target;
      if (isRuntimeJobRunning(this.job)) {
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        this.startPolling();
      }
    },
    async loadHistory() {
      try {
        this.history = await caligoApi.request(`/api/recon/${this.toolId}/scans`);
      } catch {
        this.history = [];
      }
    },
    startPolling() {
      this.stopPolling();
      this.pollTimer = window.setInterval(this.refreshJob, 2200);
      this.refreshJob();
    },
    stopPolling() {
      if (this.pollTimer) {
        window.clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    async refreshJob() {
      if (!this.job?.id) return;
      try {
        this.job = await caligoApi.request(`/api/recon/${this.toolId}/scans/${this.job.id}`);
        if (!isRuntimeJobRunning(this.job)) {
          this.stopPolling();
          forgetRuntimeJob(this.runtimeScope);
          await this.loadHistory();
        }
      } catch (error) {
        this.error = error.message || "No se pudo refrescar el job";
        this.stopPolling();
      }
    },
    optionValue(option) {
      return option?.value || option?.name || option?.label || option;
    },
    optionLabel(option) {
      return option?.label || option?.name || option?.value || option;
    },
  },
};
</script>
