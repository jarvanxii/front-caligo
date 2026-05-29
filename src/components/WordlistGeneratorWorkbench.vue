<template>
  <section class="password-lab" :class="`password-lab--${tool}`" aria-labelledby="wordlist-generator-title">
    <div class="password-lab__shell">
      <ToolHeroHeader
        :tool-id="tool"
        :title="copy.title"
        :eyebrow="copy.eyebrow"
        :summary="copy.summary"
        title-id="wordlist-generator-title"
        :logo-tools="[tool, 'wordlists']"
        :meta="heroMeta"
        compact
      />

      <div class="password-lab__grid">
        <form class="password-console" @submit.prevent="startRun">
          <header>
            <span>Parámetros</span>
            <strong>{{ tool.toUpperCase() }}</strong>
          </header>

          <template v-if="isCrunch">
            <div class="password-fields">
              <label>
                Longitud mínima
                <input v-model.number="form.minLength" type="number" min="1" max="8" />
              </label>
              <label>
                Longitud máxima
                <input v-model.number="form.maxLength" type="number" min="1" max="8" />
              </label>
            </div>

            <label>
              Charset
              <input v-model.trim="form.charset" type="text" spellcheck="false" placeholder="abc123" />
            </label>
          </template>

          <template v-else>
            <label>
              URL autorizada
              <input v-model.trim="form.url" type="url" spellcheck="false" placeholder="http://192.168.0.10" />
            </label>

            <div class="password-fields">
              <label>
                Profundidad
                <input v-model.number="form.depth" type="number" min="1" max="5" />
              </label>
              <label>
                Min. palabra
                <input v-model.number="form.minWordLength" type="number" min="3" max="12" />
              </label>
            </div>

            <label class="password-switch password-switch--standalone">
              <input v-model="form.withNumbers" type="checkbox" />
              <span>Incluir palabras con números</span>
            </label>
          </template>

          <label>
            Fichero de salida
            <input v-model.trim="form.outputName" type="text" spellcheck="false" :placeholder="defaultOutputName" />
          </label>

          <button type="submit" :disabled="starting || !canStart">
            {{ startButtonLabel }}
          </button>

          <p v-if="error" class="password-alert password-alert--error">{{ error }}</p>
          <p v-else-if="capabilityError" class="password-alert">{{ capabilityError }}</p>
        </form>

        <section class="password-run" aria-label="Generación">
          <header>
            <span>{{ job?.status || "READY" }}</span>
            <strong>{{ progress }}%</strong>
          </header>

          <div class="password-progress">
            <span :style="{ width: `${progress}%` }"></span>
          </div>

          <dl>
            <div>
              <dt>Fase</dt>
              <dd>{{ job?.phase || "Esperando parámetros" }}</dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>{{ durationLabel }}</dd>
            </div>
            <div>
              <dt>Salida</dt>
              <dd>{{ outputLabel }}</dd>
            </div>
          </dl>

          <div v-if="job?.command" class="password-command">
            <span>Comando</span>
            <code>{{ job.command }}</code>
          </div>

          <div class="password-log">
            <span>Traza</span>
            <pre>{{ logText }}</pre>
          </div>
        </section>
      </div>

      <section class="password-results">
        <header>
          <div>
            <span>Wordlist generada</span>
            <strong>{{ generatedLines }} líneas</strong>
          </div>
          <button type="button" @click="loadHistory">Actualizar historial</button>
        </header>

        <div v-if="generatedPath" class="wordlist-output">
          <code>{{ generatedPath }}</code>
          <span>{{ sizeLabel(generatedSize) }}</span>
        </div>
        <p v-else>El fichero aparecerá aquí cuando termine la generación.</p>
      </section>

      <section class="password-history">
        <header>
          <span>Jobs recientes</span>
          <small>{{ history.length }} guardado{{ history.length === 1 ? "" : "s" }}</small>
        </header>
        <div v-if="history.length" class="password-history__list">
          <button v-for="item in history" :key="item.id" type="button" @click="loadJob(item.id)">
            <span>{{ item.target || item.tool }}</span>
            <strong>{{ item.status }}</strong>
          </button>
        </div>
        <p v-else>No hay generaciones recientes de {{ copy.title }} para este usuario.</p>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { forgetRuntimeJob, isRuntimeJobRunning, rememberedRuntimeJob, rememberRuntimeJob } from "@/services/runtimeJobs";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

export default {
  name: "WordlistGeneratorWorkbench",
  components: {
    ToolHeroHeader,
  },
  props: {
    tool: {
      type: String,
      required: true,
      validator: (value) => ["crunch", "cewl"].includes(value),
    },
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
      form: {
        minLength: 4,
        maxLength: 5,
        charset: "abcdefghijklmnopqrstuvwxyz0123456789",
        outputName: "",
        url: "http://192.168.0.1",
        depth: 2,
        minWordLength: 4,
        withNumbers: true,
      },
    };
  },
  computed: {
    isCrunch() {
      return this.tool === "crunch";
    },
    runtimeScope() {
      return `passwords.${this.tool}`;
    },
    copy() {
      return this.isCrunch
        ? {
            eyebrow: "Contraseñas / Wordlists",
            title: "Crunch",
            summary: "Genera diccionarios acotados por longitud y charset dentro del directorio controlado de Caligo.",
          }
        : {
            eyebrow: "Contraseñas / Wordlists",
            title: "CeWL",
            summary: "Crea wordlists desde contenido web autorizado y las deja disponibles para John, Hashcat o Hydra.",
          };
    },
    toolInfo() {
      return (this.capabilities?.tools || []).find((item) => item.id === this.tool) || null;
    },
    engineReady() {
      return Boolean(this.toolInfo?.available);
    },
    engineMessage() {
      if (!this.capabilities) return "Comprobando motor";
      return this.toolInfo?.version || this.toolInfo?.label || "Disponible";
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.engineReady ? "Operativo" : "Pendiente" },
        { label: "Salida", value: this.outputLabel },
        { label: "Version", value: this.engineMessage },
      ];
    },
    defaultOutputName() {
      return this.isCrunch ? "crunch-lab.txt" : "cewl-lab.txt";
    },
    canStart() {
      if (!this.engineReady || this.isRunning) return false;
      return this.isCrunch ? Boolean(this.form.charset) : Boolean(this.form.url);
    },
    isRunning() {
      return isRuntimeJobRunning(this.job);
    },
    startButtonLabel() {
      if (this.starting) return "Preparando";
      if (this.isRunning) return "Generando";
      return this.isCrunch ? "Generar con Crunch" : "Generar con CeWL";
    },
    progress() {
      return Math.max(0, Math.min(100, Number(this.job?.progress || 0)));
    },
    result() {
      return this.job?.result || null;
    },
    outputLabel() {
      return this.generatedPath || this.form.outputName || this.defaultOutputName;
    },
    generatedPath() {
      return this.result?.wordlist?.path || this.result?.outputPath || "";
    },
    generatedSize() {
      return Number(this.result?.wordlist?.sizeBytes || this.result?.sizeBytes || 0);
    },
    generatedLines() {
      return Number(this.result?.wordlist?.lineCount || this.result?.lineCount || 0);
    },
    durationLabel() {
      const ms = this.job?.durationMs;
      if (!ms) return "0s";
      if (ms < 1000) return `${ms}ms`;
      const seconds = Math.round(ms / 1000);
      if (seconds < 60) return `${seconds}s`;
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    },
    logText() {
      const lines = this.job?.logs || [];
      if (lines.length) return lines.slice(-14).join("\n");
      if (this.job?.error) return this.job.error;
      return this.job ? "El generador aún no ha emitido traza." : "La traza aparecerá al iniciar una generación.";
    },
  },
  watch: {
    tool: {
      immediate: true,
      handler() {
        this.resetRuntime();
        this.loadCapabilities();
        this.restoreActiveJob();
      },
    },
  },
  beforeUnmount() {
    this.stopPolling();
  },
  methods: {
    resetRuntime() {
      this.stopPolling();
      this.error = "";
      this.capabilityError = "";
      this.job = null;
      this.history = [];
    },
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
      try {
        await this.ensureSession();
        this.capabilities = await caligoApi.request("/api/passwords/capabilities");
        this.loadHistory();
      } catch (error) {
        this.capabilityError = error.message || "No se pudo consultar el generador";
      }
    },
    payload() {
      return {
        minLength: this.form.minLength,
        maxLength: this.form.maxLength,
        charset: this.form.charset,
        outputName: this.form.outputName || this.defaultOutputName,
        url: this.form.url,
        depth: this.form.depth,
        minWordLength: this.form.minWordLength,
        withNumbers: this.form.withNumbers,
      };
    },
    async startRun() {
      this.error = "";
      this.starting = true;
      try {
        await this.ensureSession();
        this.job = await caligoApi.request(`/api/passwords/${this.tool}/generate`, {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        this.startPolling();
      } catch (error) {
        this.error = error.message || "No se pudo iniciar la generación";
      } finally {
        this.starting = false;
      }
    },
    async restoreActiveJob() {
      const id = rememberedRuntimeJob(this.runtimeScope);
      if (!id) return;
      try {
        await this.ensureSession();
        this.job = await caligoApi.request(`/api/passwords/${this.tool}/runs/${id}`);
        if (isRuntimeJobRunning(this.job)) this.startPolling();
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
        this.job = await caligoApi.request(`/api/passwords/${this.tool}/runs/${this.job.id}`);
        if (!isRuntimeJobRunning(this.job)) {
          this.stopPolling();
          this.loadHistory();
        }
      } catch (error) {
        this.error = error.message || "No se pudo refrescar el job";
        forgetRuntimeJob(this.runtimeScope);
        this.stopPolling();
      }
    },
    async loadHistory() {
      try {
        await this.ensureSession();
        this.history = await caligoApi.request(`/api/passwords/${this.tool}/runs`);
      } catch {
        this.history = [];
      }
    },
    async loadJob(id) {
      this.error = "";
      try {
        await this.ensureSession();
        this.job = await caligoApi.request(`/api/passwords/${this.tool}/runs/${id}`);
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        if (isRuntimeJobRunning(this.job)) this.startPolling();
      } catch (error) {
        this.error = error.message || "No se pudo recuperar el job";
      }
    },
    sizeLabel(bytes) {
      const value = Number(bytes || 0);
      if (value < 1024) return `${value} B`;
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
      return `${(value / 1024 / 1024).toFixed(1)} MB`;
    },
  },
};
</script>
