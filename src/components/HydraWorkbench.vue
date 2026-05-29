<template>
  <section class="hydra-workbench" aria-labelledby="hydra-title">
    <div class="hydra-workbench__shell">
      <ToolHeroHeader
        tool-id="hydra"
        title="Hydra"
        eyebrow="Vulnerabilidades / Fuerza bruta"
        summary="Orquestador de credenciales para servicios de laboratorio con alcance privado, wordlists del servidor y progreso en vivo."
        title-id="hydra-title"
        :logo-tools="['hydra', 'wordlists']"
        :meta="heroMeta"
      />

      <div class="hydra-grid">
        <form class="hydra-console hydra-console--target" @submit.prevent="startRun">
          <header>
            <span>Objetivo</span>
            <strong>{{ selectedServiceLabel }}</strong>
          </header>

          <label>
            Host autorizado
            <input v-model.trim="form.target" type="text" autocomplete="off" spellcheck="false" placeholder="192.168.0.10" />
          </label>

          <div class="hydra-fields hydra-fields--service">
            <label>
              Servicio
              <select v-model="form.service">
                <option v-for="service in services" :key="service.value" :value="service.value">
                  {{ service.label }}
                </option>
              </select>
            </label>
            <label>
              Puerto
              <input v-model.number="form.port" type="number" min="1" max="65535" />
            </label>
          </div>

          <div class="hydra-toggle-row">
            <label class="hydra-switch">
              <input v-model="form.ssl" type="checkbox" />
              <span>SSL/TLS</span>
            </label>
            <label class="hydra-switch">
              <input v-model="form.stopOnFound" type="checkbox" />
              <span>Parar al encontrar</span>
            </label>
            <label class="hydra-switch">
              <input v-model="form.exitOnFirstHost" type="checkbox" />
              <span>Salir por host</span>
            </label>
          </div>

          <section v-if="isHttpForm" class="hydra-inline-panel">
            <header>
              <span>HTTP form</span>
              <strong>^USER^ / ^PASS^</strong>
            </header>
            <label>
              Ruta
              <input v-model.trim="form.httpPath" type="text" placeholder="/login" />
            </label>
            <label>
              Parámetros
              <input v-model.trim="form.httpParameters" type="text" placeholder="username=^USER^&password=^PASS^" />
            </label>
            <div class="hydra-fields">
              <label>
                Falla si
                <input v-model.trim="form.httpFailCondition" type="text" placeholder="F=incorrect" />
              </label>
              <label>
                Éxito si
                <input v-model.trim="form.httpSuccessCondition" type="text" placeholder="S=dashboard" />
              </label>
            </div>
          </section>

          <label v-else>
            Opciones del módulo
            <input v-model.trim="form.moduleOptions" type="text" placeholder="Opcional: argumento específico Hydra" />
          </label>
        </form>

        <form class="hydra-console hydra-console--credentials" @submit.prevent="startRun">
          <header>
            <span>Credenciales</span>
            <strong>{{ credentialModeLabel }}</strong>
          </header>

          <div class="hydra-mode-tabs">
            <button
              v-for="mode in passwordModes"
              :key="mode.value"
              type="button"
              :class="{ 'is-active': form.passwordMode === mode.value }"
              @click="form.passwordMode = mode.value"
            >
              {{ mode.shortLabel || mode.label }}
            </button>
          </div>

          <template v-if="form.passwordMode !== 'combo'">
            <label>
              Usuarios
              <select v-model="form.usernameMode">
                <option v-for="mode in usernameModes" :key="mode.value" :value="mode.value">{{ mode.label }}</option>
              </select>
            </label>

            <input
              v-if="form.usernameMode === 'single'"
              v-model.trim="form.username"
              class="hydra-mono-input"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="hacker"
            />
            <textarea
              v-else-if="form.usernameMode === 'list'"
              v-model="form.usernames"
              rows="6"
              spellcheck="false"
              placeholder="admin&#10;root&#10;caligo"
            ></textarea>
            <select v-else v-model="form.usernameFile">
              <option value="">Selecciona wordlist</option>
              <option v-for="wordlist in wordlists" :key="`u-${wordlist.path}`" :value="wordlist.path">
                {{ wordlist.label }}
              </option>
            </select>
          </template>

          <label>
            {{ form.passwordMode === "combo" ? "Combo login:pass" : "Passwords" }}
            <span>{{ credentialHint }}</span>
          </label>

          <input
            v-if="form.passwordMode === 'single'"
            v-model="form.password"
            class="hydra-mono-input"
            type="password"
            autocomplete="off"
            placeholder="password123"
          />
          <textarea
            v-else-if="form.passwordMode === 'list'"
            v-model="form.passwords"
            rows="7"
            spellcheck="false"
            placeholder="password&#10;password123&#10;pepito53"
          ></textarea>
          <textarea
            v-else-if="form.passwordMode === 'combo' && !form.comboFile"
            v-model="form.passwords"
            rows="9"
            spellcheck="false"
            placeholder="admin:admin&#10;root:toor&#10;hacker:password123"
          ></textarea>
          <select v-if="form.passwordMode === 'file'" v-model="form.passwordFile">
            <option value="">Selecciona wordlist</option>
            <option v-for="wordlist in wordlists" :key="`p-${wordlist.path}`" :value="wordlist.path">
              {{ wordlist.label }}
            </option>
          </select>
          <select v-if="form.passwordMode === 'combo'" v-model="form.comboFile">
            <option value="">Combo pegado manualmente</option>
            <option v-for="wordlist in wordlists" :key="`c-${wordlist.path}`" :value="wordlist.path">
              {{ wordlist.label }}
            </option>
          </select>
        </form>

        <section class="hydra-console hydra-console--run">
          <header>
            <span>Ejecución</span>
            <strong>{{ job?.status || "READY" }}</strong>
          </header>

          <div class="hydra-sliders">
            <label>
              Tareas
              <input v-model.number="form.tasks" type="range" min="1" max="64" />
              <strong>{{ form.tasks }}</strong>
            </label>
            <label>
              Timeout conexión
              <input v-model.number="form.connectTimeoutSeconds" type="range" min="3" max="120" />
              <strong>{{ form.connectTimeoutSeconds }}s</strong>
            </label>
            <label>
              Espera respuesta
              <input v-model.number="form.responseWaitSeconds" type="range" min="1" max="60" />
              <strong>{{ form.responseWaitSeconds }}s</strong>
            </label>
          </div>

          <div class="hydra-toggle-row hydra-toggle-row--dense">
            <label class="hydra-switch">
              <input v-model="form.loopUsers" type="checkbox" />
              <span>Loop usuarios</span>
            </label>
            <label class="hydra-switch">
              <input v-model="form.verboseAttempts" type="checkbox" />
              <span>Intentos</span>
            </label>
            <label class="hydra-switch">
              <input v-model="form.debugVerbose" type="checkbox" />
              <span>Verbose+</span>
            </label>
          </div>

          <button class="hydra-primary" type="button" :disabled="starting || !canStart" @click="startRun">
            {{ startButtonLabel }}
          </button>

          <p v-if="error" class="hydra-error">{{ error }}</p>
          <p v-else-if="capabilityError" class="hydra-warning">{{ capabilityError }}</p>
        </section>
      </div>

      <section class="hydra-run-panel" aria-label="Progreso Hydra">
        <div class="hydra-run-panel__main">
          <header>
              <span>{{ job?.phase || "Esperando parámetros" }}</span>
            <strong>{{ progress }}%</strong>
          </header>
          <div class="hydra-progress"><span :style="{ width: `${progress}%` }"></span></div>
          <dl>
            <div>
              <dt>Objetivo</dt>
              <dd>{{ job?.target || form.target || "N/D" }}</dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>{{ durationLabel }}</dd>
            </div>
            <div>
              <dt>Espacio</dt>
              <dd>{{ credentialSpaceLabel }}</dd>
            </div>
            <div>
              <dt>Validas</dt>
              <dd>{{ credentials.length }}</dd>
            </div>
          </dl>
        </div>

        <div class="hydra-run-panel__trace">
          <div v-if="job?.command" class="hydra-command">
            <span>Comando</span>
            <code>{{ job.command }}</code>
          </div>
          <div class="hydra-log">
            <span>Traza</span>
            <pre>{{ logText }}</pre>
          </div>
        </div>
      </section>

      <section v-if="credentials.length" class="hydra-results">
        <header>
          <div>
            <span>Credenciales válidas</span>
            <strong>{{ credentials.length }} hallazgo{{ credentials.length === 1 ? "" : "s" }}</strong>
          </div>
          <button type="button" @click="showPasswords = !showPasswords">
            {{ showPasswords ? "Ocultar passwords" : "Mostrar passwords" }}
          </button>
        </header>
        <div class="hydra-table">
          <div class="hydra-table__row hydra-table__row--head">
            <span>Host</span>
            <span>Servicio</span>
            <span>Login</span>
            <span>Password</span>
          </div>
          <div v-for="item in credentials" :key="`${item.host}-${item.service}-${item.login}-${item.password}`" class="hydra-table__row">
            <code>{{ item.host }}</code>
            <span>{{ item.service }}:{{ item.port || form.port || "" }}</span>
            <strong>{{ item.login }}</strong>
            <code>{{ showPasswords ? item.password : maskedPassword(item.password) }}</code>
          </div>
        </div>
      </section>

      <section class="hydra-history">
        <header>
          <span>Historial local</span>
          <button type="button" @click="loadHistory">Actualizar</button>
        </header>
        <div v-if="history.length" class="hydra-history__list">
          <button v-for="item in history" :key="item.id" type="button" @click="loadJob(item.id)">
            <span>{{ item.parameters?.service || "hydra" }} / {{ item.target }}</span>
            <strong>{{ item.status }}</strong>
          </button>
        </div>
        <p v-else>No hay ejecuciones recientes de Hydra para este usuario.</p>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { forgetRuntimeJob, isRuntimeJobRunning, rememberedRuntimeJob, rememberRuntimeJob } from "@/services/runtimeJobs";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

const FALLBACK_SERVICES = [
  "ssh",
  "ftp",
  "smb",
  "rdp",
  "vnc",
  "mysql",
  "http-get",
  "http-post-form",
].map((service) => ({ value: service, label: service.toUpperCase() }));

export default {
  name: "HydraWorkbench",
  components: {
    ToolHeroHeader,
  },
  data() {
    return {
      capabilities: null,
      capabilityError: "",
      error: "",
      starting: false,
      job: null,
      history: [],
      pollTimer: null,
      showPasswords: false,
      form: {
        target: "192.168.0.1",
        service: "ssh",
        port: 22,
        ssl: false,
        usernameMode: "single",
        username: "hacker",
        usernames: "admin\nroot\ncaligo",
        usernameFile: "",
        passwordMode: "single",
        password: "password123",
        passwords: "password\npassword123\npepito53",
        passwordFile: "",
        comboFile: "",
        tasks: 4,
        connectTimeoutSeconds: 10,
        responseWaitSeconds: 5,
        stopOnFound: true,
        exitOnFirstHost: false,
        loopUsers: false,
        verboseAttempts: false,
        debugVerbose: false,
        httpPath: "/login",
        httpParameters: "username=^USER^&password=^PASS^",
        httpFailCondition: "F=incorrect",
        httpSuccessCondition: "",
        moduleOptions: "",
      },
    };
  },
  computed: {
    engineReady() {
      return Boolean(this.capabilities?.available);
    },
    runtimeScope() {
      return "hydra.run";
    },
    engineMessage() {
      if (!this.capabilities) return "Comprobando Hydra";
      const message = this.capabilities.version || this.capabilities.binary || "Hydra listo";
      return String(message).split(" - ")[0].replace(/\(c\).*$/i, "").trim();
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.engineReady ? "Operativo" : "Pendiente" },
        { label: "Servicios", value: this.services.length },
        { label: "Version", value: this.engineMessage },
      ];
    },
    services() {
      return (this.capabilities?.services || FALLBACK_SERVICES).map((item) => ({
        value: item.value || item.name,
        label: item.label || item.value || item.name,
        description: item.description || "",
      }));
    },
    usernameModes() {
      return this.capabilities?.usernameModes || [
        { value: "single", label: "Usuario único" },
        { value: "list", label: "Lista pegada" },
        { value: "file", label: "Wordlist servidor" },
      ];
    },
    passwordModes() {
      return (this.capabilities?.passwordModes || [
        { value: "single", label: "Password único" },
        { value: "list", label: "Lista pegada" },
        { value: "file", label: "Wordlist servidor" },
        { value: "combo", label: "Combo login:pass" },
      ]).map((item) => ({
        ...item,
        shortLabel: {
          single: "Única",
          list: "Lista",
          file: "Fichero",
          combo: "Combo",
        }[item.value],
      }));
    },
    wordlists() {
      return this.capabilities?.wordlists || [];
    },
    selectedServiceLabel() {
      return this.services.find((item) => item.value === this.form.service)?.label || this.form.service.toUpperCase();
    },
    isHttpForm() {
      return this.form.service.endsWith("post-form") || this.form.service.endsWith("get-form");
    },
    credentialModeLabel() {
      return this.form.passwordMode === "combo" ? "COMBO" : `${this.form.usernameMode}/${this.form.passwordMode}`.toUpperCase();
    },
    credentialHint() {
      if (this.form.passwordMode === "combo") return "Formato login:password, manual o desde fichero permitido.";
      if (this.form.passwordMode === "file") return "Se usara una wordlist local del servidor.";
      if (this.form.passwordMode === "list") return "Una password por línea.";
      return "No se guarda en parámetros ni preview.";
    },
    canStart() {
      return this.engineReady && this.form.target && this.form.service && !this.isRunning;
    },
    isRunning() {
      return ["QUEUED", "RUNNING"].includes(this.job?.status);
    },
    startButtonLabel() {
      if (this.starting) return "Preparando";
      if (this.isRunning) return "En ejecución";
      return "Lanzar Hydra";
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
    credentials() {
      return this.result?.credentials || [];
    },
    credentialSpaceLabel() {
      const total = this.result?.summary?.credentialSpace || this.job?.parameters?.credentialSpace || 0;
      return total ? total.toLocaleString("es-ES") : "Variable";
    },
    logText() {
      const lines = this.job?.logs || [];
      if (lines.length) return lines.slice(-14).join("\n");
      return this.job ? "Hydra aún no ha emitido traza." : "La traza aparecerá al iniciar una ejecución.";
    },
  },
  watch: {
    "form.service"(service) {
      const port = this.defaultPort(service);
      if (port && (!this.form.port || this.form.port === this.defaultPort(this.previousService))) {
        this.form.port = port;
      }
      this.form.ssl = service.startsWith("https") || service.endsWith("s");
      this.previousService = service;
    },
  },
  mounted() {
    this.previousService = this.form.service;
    this.loadCapabilities();
    this.restoreActiveJob();
  },
  beforeUnmount() {
    this.stopPolling();
  },
  methods: {
    async ensureSession() {
      if (this.$store.getters.isPortfolioMode) {
        throw new Error("Modo portfolio activo: inicia sesión con credenciales para ejecutar herramientas.");
      }
      if (!this.$store.getters.hasAppAccess) {
        this.$router.push({ name: "login" });
        throw new Error("Inicia sesión para ejecutar herramientas");
      }
    },
    async loadCapabilities() {
      this.capabilityError = "";
      try {
        await this.ensureSession();
        this.capabilities = await caligoApi.request("/api/bruteforce/hydra/capabilities");
        this.applyDefaults();
        this.loadHistory();
      } catch (error) {
        this.capabilityError = error.message || "No se pudo consultar Hydra";
      }
    },
    applyDefaults() {
      const defaults = this.capabilities?.defaults || {};
      this.form = {
        ...this.form,
        ...defaults,
        target: this.form.target || defaults.target || "192.168.0.1",
      };
      this.previousService = this.form.service;
      if (!this.form.usernameFile && this.wordlists.length) this.form.usernameFile = this.wordlists[0].path;
      if (!this.form.passwordFile && this.wordlists.length) this.form.passwordFile = this.wordlists[0].path;
    },
    async startRun() {
      this.error = "";
      this.starting = true;
      try {
        await this.ensureSession();
        this.job = await caligoApi.request("/api/bruteforce/hydra/runs", {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        this.startPolling();
      } catch (error) {
        this.error = error.message || "No se pudo iniciar Hydra";
      } finally {
        this.starting = false;
      }
    },
    payload() {
      return {
        target: this.form.target,
        service: this.form.service,
        port: this.form.port,
        ssl: this.form.ssl,
        usernameMode: this.form.usernameMode,
        username: this.form.username,
        usernames: this.form.usernames,
        usernameFile: this.form.usernameFile,
        passwordMode: this.form.passwordMode,
        password: this.form.password,
        passwords: this.form.passwords,
        passwordFile: this.form.passwordFile,
        comboFile: this.form.comboFile,
        tasks: this.form.tasks,
        connectTimeoutSeconds: this.form.connectTimeoutSeconds,
        responseWaitSeconds: this.form.responseWaitSeconds,
        stopOnFound: this.form.stopOnFound,
        exitOnFirstHost: this.form.exitOnFirstHost,
        loopUsers: this.form.loopUsers,
        verboseAttempts: this.form.verboseAttempts,
        debugVerbose: this.form.debugVerbose,
        httpPath: this.form.httpPath,
        httpParameters: this.form.httpParameters,
        httpFailCondition: this.form.httpFailCondition,
        httpSuccessCondition: this.form.httpSuccessCondition,
        moduleOptions: this.form.moduleOptions,
      };
    },
    async restoreActiveJob() {
      const id = rememberedRuntimeJob(this.runtimeScope);
      if (!id) return;
      try {
        await this.ensureSession();
        this.job = await caligoApi.request(`/api/bruteforce/hydra/runs/${id}`);
        this.form.target = this.job.target || this.form.target;
        if (isRuntimeJobRunning(this.job)) {
          this.startPolling();
        }
      } catch {
        forgetRuntimeJob(this.runtimeScope);
      }
    },
    startPolling() {
      this.stopPolling();
      this.pollTimer = window.setInterval(this.refreshJob, 1800);
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
        this.job = await caligoApi.request(`/api/bruteforce/hydra/runs/${this.job.id}`);
        if (!isRuntimeJobRunning(this.job)) {
          this.stopPolling();
          this.loadHistory();
        }
      } catch (error) {
        this.error = error.message || "No se pudo refrescar Hydra";
        forgetRuntimeJob(this.runtimeScope);
        this.stopPolling();
      }
    },
    async loadHistory() {
      try {
        await this.ensureSession();
        this.history = await caligoApi.request("/api/bruteforce/hydra/runs");
      } catch {
        this.history = [];
      }
    },
    async loadJob(id) {
      this.error = "";
      try {
        await this.ensureSession();
        this.job = await caligoApi.request(`/api/bruteforce/hydra/runs/${id}`);
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        if (isRuntimeJobRunning(this.job)) {
          this.startPolling();
        }
      } catch (error) {
        this.error = error.message || "No se pudo recuperar el job";
      }
    },
    maskedPassword(value) {
      const length = Math.max(6, String(value || "").length);
      return "*".repeat(Math.min(length, 18));
    },
    defaultPort(service) {
      return {
        ssh: 22,
        ftp: 21,
        ftps: 990,
        telnet: 23,
        smtp: 25,
        smtps: 465,
        pop3: 110,
        pop3s: 995,
        imap: 143,
        imaps: 993,
        smb: 445,
        smbnt: 445,
        rdp: 3389,
        vnc: 5900,
        mysql: 3306,
        postgres: 5432,
        mssql: 1433,
        redis: 6379,
        mongodb: 27017,
        ldap2: 389,
        ldap3: 389,
        "http-get": 80,
        "http-head": 80,
        "http-post-form": 80,
        "http-get-form": 80,
        "https-get": 443,
        "https-head": 443,
        "https-post-form": 443,
        "https-get-form": 443,
      }[service];
    },
  },
};
</script>
