<template>
  <section class="osint-workbench osint-interface osint-interface--git" aria-labelledby="git-dumper-title">
    <div class="osint-workbench__shell">
      <ToolHeroHeader
        tool-id="git-dumper"
        title="git-dumper"
        eyebrow="OSINT / Repositorios expuestos"
        summary="Recuperación controlada de directorios .git publicados por error. Caligo ejecuta el binario en backend, conserva el job y resume ficheros recuperados."
        title-id="git-dumper-title"
        :logo-tools="['git-dumper', 'trufflehog']"
        :meta="heroMeta"
      />

      <div class="osint-interface__grid">
        <form class="osint-panel osint-interface__control" @submit.prevent="startRun">
          <header>
            <span>Objetivo</span>
            <strong>git-dumper</strong>
          </header>

          <label>
            URL del repositorio expuesto
            <input v-model.trim="form.url" type="url" autocomplete="off" spellcheck="false" placeholder="https://lab.example.com/.git/" />
          </label>

          <label class="osint-switch">
            <input v-model="form.appendGitPath" type="checkbox" />
            <span>Añadir /.git/ automáticamente si no aparece en la URL</span>
          </label>

          <div class="osint-interface__split osint-interface__split--three">
            <label>
              Jobs
              <input v-model.number="form.jobs" type="number" min="1" max="40" />
            </label>
            <label>
              Reintentos
              <input v-model.number="form.retry" type="number" min="0" max="10" />
            </label>
            <label>
              Timeout
              <input v-model.number="form.timeoutSeconds" type="number" min="5" max="900" />
            </label>
          </div>

          <label>
            User-Agent
            <input v-model.trim="form.userAgent" type="text" autocomplete="off" spellcheck="false" placeholder="Caligo git-dumper lab" />
          </label>

          <label>
            Proxy opcional
            <input v-model.trim="form.proxy" type="text" autocomplete="off" spellcheck="false" placeholder="http://127.0.0.1:8080" />
          </label>

          <label>
            Headers no sensibles
            <textarea v-model.trim="form.headersText" spellcheck="false" placeholder="X-Lab-Scope: authorized"></textarea>
          </label>

          <label class="osint-switch osint-interface__scope">
            <input v-model="form.authorized" type="checkbox" />
            <span>Confirmo que el dominio es propio, de laboratorio o cuenta con autorización explícita.</span>
          </label>

          <button type="submit" :disabled="busy || !canSubmit">
            {{ busy ? "Lanzando" : "Ejecutar git-dumper" }}
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
              <span>Ficheros</span>
              <strong>{{ fileCount }}</strong>
            </article>
            <article>
              <span>Salida</span>
              <strong>{{ shortOutputDir }}</strong>
            </article>
            <article>
              <span>Historial</span>
              <strong>{{ history.length }}</strong>
            </article>
          </div>

          <code v-if="job?.command">{{ job.command }}</code>

          <div class="osint-interface__run-actions">
            <button type="button" @click="loadHistory">Historial</button>
            <button type="button" :disabled="!job?.id" @click="reloadCurrentJob">Refrescar</button>
          </div>
        </section>
      </div>

      <section class="osint-panel osint-interface__results">
        <header>
          <span>Repositorio recuperado</span>
          <strong>{{ fileCount }} ficheros</strong>
        </header>

        <div v-if="jobResult" class="osint-interface__evidence-grid">
          <article>
            <span>Directorio backend</span>
            <strong>{{ jobResult.outputDir || "N/D" }}</strong>
          </article>
          <article>
            <span>Repositorio</span>
            <strong>{{ jobResult.repositoryRecovered ? "Detectado" : "Parcial / no confirmado" }}</strong>
          </article>
        </div>

        <div v-if="files.length" class="osint-interface__file-list">
          <article v-for="file in files" :key="file.path">
            <span>{{ file.category }}</span>
            <strong>{{ file.path }}</strong>
            <small>{{ formatBytes(file.size) }}</small>
          </article>
        </div>

        <pre v-else>{{ logText || "Lanza un job para recuperar y listar artefactos .git." }}</pre>
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

const RUNTIME_SCOPE = "osint.git-dumper";
const FORM_STORAGE_KEY = "caligo.osint.gitDumper.form";

export default {
  name: "GitDumperView",
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
        url: "",
        appendGitPath: true,
        jobs: 10,
        retry: 3,
        timeoutSeconds: 120,
        userAgent: "Caligo git-dumper lab",
        proxy: "",
        headersText: "",
        authorized: false,
      },
    };
  },
  computed: {
    toolCapability() {
      return (this.capabilities?.tools || []).find((item) => item.id === "git-dumper") || {};
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.toolCapability.available ? "Operativo" : "Pendiente" },
        { label: "Versión", value: this.toolCapability.version || "Inventario servidor" },
        { label: "Persistencia", value: "Job backend" },
      ];
    },
    canSubmit() {
      return this.form.authorized && Boolean(this.form.url);
    },
    progress() {
      return Number(this.job?.progress || 0);
    },
    jobResult() {
      return this.job?.result || null;
    },
    files() {
      return this.jobResult?.files || [];
    },
    fileCount() {
      return Number(this.jobResult?.fileCount || this.files.length || 0);
    },
    shortOutputDir() {
      const output = this.jobResult?.outputDir || "";
      if (!output) return "N/D";
      return output.split(/[\\/]/).slice(-2).join("/");
    },
    logText() {
      const logs = this.job?.logs || [];
      if (logs.length) return logs.join("\n");
      return this.jobResult?.stdout || this.jobResult?.stderr || "";
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
        this.job = await caligoApi.request("/api/osint/git-dumper/runs", {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
        rememberRuntimeJob(RUNTIME_SCOPE, this.job.id);
        this.startPolling();
        await this.loadHistory();
      } catch (error) {
        this.error = error.message || "No se pudo iniciar git-dumper";
      } finally {
        this.busy = false;
      }
    },
    payload() {
      return {
        url: this.form.url,
        appendGitPath: this.form.appendGitPath,
        jobs: Number(this.form.jobs),
        retry: Number(this.form.retry),
        timeoutSeconds: Number(this.form.timeoutSeconds),
        userAgent: this.form.userAgent,
        proxy: this.form.proxy,
        headers: this.splitLines(this.form.headersText),
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
      this.job = await caligoApi.request(`/api/osint/git-dumper/runs/${id}`);
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
        this.history = await caligoApi.request("/api/osint/git-dumper/runs");
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
        this.error = error.message || "No se pudo refrescar el job";
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
        this.form = { ...this.form, ...JSON.parse(raw), authorized: false };
      } catch {
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    },
    persistForm() {
      const form = { ...this.form, authorized: false };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
    },
    formatBytes(value) {
      const bytes = Number(value || 0);
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    },
  },
};
</script>
