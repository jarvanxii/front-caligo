<template>
  <section class="osint-workbench osint-interface osint-interface--trufflehog" aria-labelledby="trufflehog-title">
    <div class="osint-workbench__shell">
      <ToolHeroHeader
        tool-id="trufflehog"
        title="TruffleHog"
        eyebrow="OSINT / Secret scanning"
        summary="Detección de secretos en repositorios Git, GitHub y rutas permitidas del servidor. Caligo parametriza el CLI, conserva el job y presenta hallazgos redaccionados."
        title-id="trufflehog-title"
        :logo-tools="['trufflehog', 'git-dumper']"
        :meta="heroMeta"
      />

      <div class="osint-interface__grid osint-interface__grid--ops">
        <form class="osint-panel osint-interface__control" @submit.prevent="startRun">
          <header>
            <span>Fuente</span>
            <strong>trufflehog</strong>
          </header>

          <div class="osint-interface__preset-grid osint-interface__preset-grid--profiles">
            <button
              v-for="source in sourceTypes"
              :key="source.value"
              type="button"
              :class="{ 'is-active': form.sourceType === source.value }"
              @click="selectSourceType(source.value)"
            >
              <strong>{{ source.label }}</strong>
              <small>{{ source.description }}</small>
            </button>
          </div>

          <label>
            {{ activeSource.inputLabel }}
            <input v-model.trim="form.target" type="text" autocomplete="off" spellcheck="false" :placeholder="activeSource.placeholder" />
          </label>

          <div class="osint-interface__split osint-interface__split--three">
            <label>
              Resultados
              <select v-model="form.results">
                <option v-for="filter in resultFilters" :key="filter.value" :value="filter.value">{{ filter.label }}</option>
              </select>
            </label>
            <label>
              Concurrencia
              <input v-model.number="form.concurrency" type="number" min="1" max="64" />
            </label>
            <label>
              Timeout
              <input v-model.number="form.timeoutSeconds" type="number" min="30" max="3600" />
            </label>
          </div>

          <div v-if="usesGitOptions" class="osint-interface__split">
            <label>
              Branch opcional
              <input v-model.trim="form.branch" type="text" autocomplete="off" spellcheck="false" placeholder="main" />
            </label>
            <label>
              Profundidad máxima
              <input v-model.number="form.maxDepth" type="number" min="1" max="5000" />
            </label>
          </div>

          <div class="osint-interface__split">
            <label>
              Incluir rutas
              <textarea v-model.trim="form.includePathsText" spellcheck="false" placeholder="src/**&#10;config/**"></textarea>
            </label>
            <label>
              Excluir rutas
              <textarea v-model.trim="form.excludePathsText" spellcheck="false" placeholder="node_modules/**&#10;dist/**"></textarea>
            </label>
          </div>

          <section class="osint-parameter-block">
            <div>
              <span>Verificación y análisis</span>
              <strong>{{ verificationMode }}</strong>
            </div>
            <div class="osint-toggle-grid">
              <label :class="{ 'is-active': !form.noVerification }">
                <input v-model="form.noVerification" type="checkbox" />
                <span>
                  <strong>Sin verificación remota</strong>
                  <small>Evita llamadas de validación externa</small>
                </span>
              </label>
              <label :class="{ 'is-active': form.filterEntropy }">
                <input v-model="form.filterEntropy" type="checkbox" />
                <span>
                  <strong>Filtro de entropía</strong>
                  <small>Reduce cadenas de bajo valor</small>
                </span>
              </label>
              <label :class="{ 'is-active': form.scanEntireChunk }">
                <input v-model="form.scanEntireChunk" type="checkbox" />
                <span>
                  <strong>Chunk completo</strong>
                  <small>Inspecciona el bloque completo</small>
                </span>
              </label>
            </div>
          </section>

          <p v-if="form.sourceType === 'filesystem'" class="osint-inline-note">
            Rutas permitidas por backend: <strong>/tmp/caligo/git-dumper</strong>, <strong>/var/www/caligo</strong>, <strong>/opt/caligo</strong>.
          </p>

          <label class="osint-switch osint-interface__scope">
            <input v-model="form.authorized" type="checkbox" />
            <span>Confirmo que el repositorio, organización o ruta pertenece a un alcance autorizado.</span>
          </label>

          <button type="submit" :disabled="busy || !canSubmit">
            {{ busy ? "Lanzando" : "Ejecutar TruffleHog" }}
          </button>
          <p v-if="error" class="osint-error">{{ error }}</p>
        </form>

        <section class="osint-panel osint-interface__status osint-interface__status--run">
          <header>
            <span>{{ job?.phase || "Estado" }}</span>
            <strong>{{ job?.status || "READY" }}</strong>
          </header>

          <div class="osint-progress"><span :style="{ width: `${progress}%` }"></span></div>

          <div class="osint-interface__metric-grid">
            <article>
              <span>Progreso</span>
              <strong>{{ progress }}%</strong>
            </article>
            <article>
              <span>Secretos</span>
              <strong>{{ findingCount }}</strong>
            </article>
            <article>
              <span>Verificados</span>
              <strong>{{ summary.verified || 0 }}</strong>
            </article>
            <article>
              <span>Fuente</span>
              <strong>{{ form.sourceType }}</strong>
            </article>
          </div>

          <code v-if="job?.command">{{ job.command }}</code>

          <div class="osint-interface__run-actions">
            <button type="button" @click="loadHistory">Historial</button>
            <button type="button" :disabled="!job?.id" @click="reloadCurrentJob">Refrescar</button>
            <button type="button" :disabled="!jobResult" @click="downloadCurrentJson">Exportar JSON</button>
          </div>
        </section>
      </div>

      <section class="osint-panel osint-interface__results">
        <header>
          <span>Secretos detectados</span>
          <strong>{{ findingCount }} hallazgo{{ findingCount === 1 ? "" : "s" }}</strong>
        </header>

        <div v-if="jobResult" class="osint-interface__evidence-grid osint-interface__evidence-grid--three">
          <article>
            <span>Verificados</span>
            <strong>{{ summary.verified || 0 }}</strong>
          </article>
          <article>
            <span>Unknown</span>
            <strong>{{ summary.unknown || 0 }}</strong>
          </article>
          <article>
            <span>No verificados</span>
            <strong>{{ summary.unverified || 0 }}</strong>
          </article>
        </div>

        <div v-if="findings.length" class="osint-secret-list">
          <article v-for="(item, index) in findings" :key="`${item.type}-${index}`" :class="`is-${item.status || 'unknown'}`">
            <span>{{ item.status || "unknown" }}</span>
            <div>
              <strong>{{ item.type || "secret" }}</strong>
              <code>{{ item.value || "redactado" }}</code>
              <small>{{ item.source || item.sourceType || "origen no informado" }}</small>
            </div>
          </article>
        </div>

        <pre v-else>{{ logText || "Selecciona fuente, filtros y alcance. Los secretos aparecerán redaccionados aquí." }}</pre>
      </section>

      <section class="osint-panel osint-panel--history" v-if="history.length">
        <header>
          <span>Jobs recientes</span>
          <button type="button" @click="loadHistory">Actualizar</button>
        </header>
        <div class="osint-history-list">
          <button v-for="item in history" :key="item.id" type="button" @click="loadJob(item.id)">
            <span>{{ item.target }}</span>
            <strong>{{ item.status }} / {{ item.progress }}%</strong>
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";
import { caligoApi } from "@/services/caligoApi";
import { forgetRuntimeJob, isRuntimeJobRunning, rememberedRuntimeJob, rememberRuntimeJob } from "@/services/runtimeJobs";

const RUNTIME_SCOPE = "osint.trufflehog";
const FORM_STORAGE_KEY = "caligo.osint.trufflehog.form";

const SOURCE_TYPES = [
  {
    value: "git",
    label: "Git URL",
    description: "Repositorio remoto",
    inputLabel: "URL del repositorio",
    placeholder: "https://github.com/org/repo.git",
  },
  {
    value: "github",
    label: "GitHub",
    description: "Repo GitHub",
    inputLabel: "Repositorio GitHub",
    placeholder: "https://github.com/org/repo",
  },
  {
    value: "filesystem",
    label: "Filesystem",
    description: "Ruta del servidor",
    inputLabel: "Ruta permitida",
    placeholder: "/tmp/caligo/git-dumper/job-id",
  },
];

const RESULT_FILTERS = [
  { value: "verified", label: "Solo verificados" },
  { value: "verified,unknown", label: "Verificados + unknown" },
  { value: "all", label: "Todos" },
];

export default {
  name: "TruffleHogView",
  components: {
    ToolHeroHeader,
  },
  data() {
    return {
      busy: false,
      error: "",
      capabilities: null,
      pollTimer: null,
      job: null,
      history: [],
      form: {
        sourceType: "git",
        target: "",
        results: "verified,unknown",
        branch: "",
        maxDepth: 250,
        concurrency: 8,
        includePathsText: "",
        excludePathsText: "node_modules/**\ndist/**\ntarget/**",
        noVerification: false,
        filterEntropy: true,
        scanEntireChunk: false,
        timeoutSeconds: 900,
        authorized: false,
      },
    };
  },
  computed: {
    sourceTypes() {
      return SOURCE_TYPES;
    },
    resultFilters() {
      return RESULT_FILTERS;
    },
    activeSource() {
      return this.sourceTypes.find((source) => source.value === this.form.sourceType) || this.sourceTypes[0];
    },
    usesGitOptions() {
      return this.form.sourceType === "git" || this.form.sourceType === "github";
    },
    toolCapability() {
      return (this.capabilities?.tools || []).find((item) => item.id === "trufflehog") || {};
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.toolCapability.available ? "Operativo" : "Pendiente" },
        { label: "Versión", value: this.toolCapability.version || "Inventario servidor" },
        { label: "Persistencia", value: "Job backend" },
      ];
    },
    verificationMode() {
      if (this.form.noVerification) return "Offline";
      return this.form.results === "verified" ? "Verificado" : "Híbrido";
    },
    canSubmit() {
      return this.form.authorized && Boolean(this.form.target);
    },
    progress() {
      return Number(this.job?.progress || 0);
    },
    jobResult() {
      return this.job?.result || null;
    },
    findings() {
      return this.jobResult?.findings || [];
    },
    findingCount() {
      return Number(this.jobResult?.findingCount || this.findings.length || 0);
    },
    summary() {
      return this.jobResult?.summary || {};
    },
    logText() {
      const logs = this.job?.logs || [];
      if (logs.length) return logs.join("\n");
      return this.job?.error || this.jobResult?.stderr || this.jobResult?.stdout || "";
    },
  },
  watch: {
    form: {
      deep: true,
      handler() {
        this.persistForm();
      },
    },
  },
  mounted() {
    this.restoreForm();
    this.loadCapabilities();
    this.restoreJob();
    this.loadHistory();
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
  beforeUnmount() {
    this.stopPolling();
  },
  methods: {
    selectSourceType(sourceType) {
      this.form.sourceType = sourceType;
      if (sourceType === "filesystem") {
        this.form.branch = "";
        this.form.maxDepth = 250;
      }
    },
    async loadCapabilities() {
      try {
        this.capabilities = await caligoApi.request("/api/osint/capabilities");
      } catch (error) {
        this.error = error.message || "No se pudo cargar el inventario OSINT";
      }
    },
    async startRun() {
      this.busy = true;
      this.error = "";
      try {
        this.job = await caligoApi.request("/api/osint/trufflehog/runs", {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
        rememberRuntimeJob(RUNTIME_SCOPE, this.job.id);
        this.startPolling();
        await this.loadHistory();
      } catch (error) {
        this.error = error.message || "No se pudo iniciar TruffleHog";
      } finally {
        this.busy = false;
      }
    },
    payload() {
      return {
        sourceType: this.form.sourceType,
        target: this.form.target,
        results: this.form.results,
        branch: this.usesGitOptions ? this.form.branch : "",
        maxDepth: this.usesGitOptions ? Number(this.form.maxDepth) : null,
        concurrency: Number(this.form.concurrency),
        includePaths: this.splitLines(this.form.includePathsText),
        excludePaths: this.splitLines(this.form.excludePathsText),
        noVerification: this.form.noVerification,
        filterEntropy: this.form.filterEntropy,
        scanEntireChunk: this.form.scanEntireChunk,
        timeoutSeconds: Number(this.form.timeoutSeconds),
        authorized: this.form.authorized,
      };
    },
    async restoreJob() {
      const id = rememberedRuntimeJob(RUNTIME_SCOPE);
      if (!id) return;
      try {
        await this.loadJob(id);
      } catch {
        forgetRuntimeJob(RUNTIME_SCOPE);
      }
    },
    async loadJob(id) {
      this.job = await caligoApi.request(`/api/osint/trufflehog/runs/${id}`);
      if (isRuntimeJobRunning(this.job)) {
        rememberRuntimeJob(RUNTIME_SCOPE, this.job.id);
        this.startPolling();
      } else {
        forgetRuntimeJob(RUNTIME_SCOPE);
        this.stopPolling();
      }
    },
    async reloadCurrentJob() {
      if (!this.job?.id) return;
      await this.loadJob(this.job.id);
    },
    async loadHistory() {
      try {
        this.history = await caligoApi.request("/api/osint/trufflehog/runs");
      } catch {
        this.history = [];
      }
    },
    startPolling() {
      this.stopPolling();
      this.pollTimer = window.setInterval(this.pollJob, 2500);
    },
    stopPolling() {
      if (this.pollTimer) {
        window.clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    async pollJob() {
      if (!this.job?.id) return;
      try {
        await this.loadJob(this.job.id);
        if (!isRuntimeJobRunning(this.job)) {
          await this.loadHistory();
        }
      } catch (error) {
        this.error = error.message || "No se pudo refrescar TruffleHog";
        this.stopPolling();
      }
    },
    splitLines(value) {
      return String(value || "")
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    },
    restoreForm() {
      try {
        const raw = localStorage.getItem(FORM_STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        this.form = { ...this.form, ...saved, authorized: false };
      } catch {
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    },
    persistForm() {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ ...this.form, authorized: false }));
    },
    downloadCurrentJson() {
      if (!this.jobResult) return;
      const blob = new Blob([JSON.stringify(this.jobResult, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `caligo-trufflehog-${this.job?.id || "result"}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  },
};
</script>
