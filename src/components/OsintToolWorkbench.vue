<template>
  <section class="osint-workbench" :class="`osint-workbench--${tool.key}`" aria-labelledby="osint-tool-title">
    <div class="osint-workbench__shell">
      <ToolHeroHeader
        :tool-id="catalogToolId"
        :tool="tool"
        :title="tool.title"
        :eyebrow="tool.eyebrow"
        :summary="tool.summary"
        title-id="osint-tool-title"
        :logo-tools="heroLogos"
        :meta="heroMeta"
      />

      <div class="osint-grid">
        <form class="osint-panel osint-console" @submit.prevent="submit">
          <header>
            <span>{{ tool.mode === "search" ? "Consulta" : "Parámetros" }}</span>
            <strong>{{ tool.command }}</strong>
          </header>

          <template v-if="tool.mode === 'search'">
            <label>
              Nombre o identidad pública
              <input v-model.trim="form.query" type="text" autocomplete="off" spellcheck="false" placeholder="Nombre Apellido" />
            </label>

            <label>
              Pista opcional
              <input v-model.trim="form.locationHint" type="text" autocomplete="off" spellcheck="false" placeholder="Madrid, empresa, sector..." />
            </label>

            <div class="osint-check-grid">
              <label v-for="platform in platforms" :key="platform">
                <input v-model="form.platforms" type="checkbox" :value="platform" />
                <span>{{ platform }}</span>
              </label>
            </div>

            <label>
              Resultados máximos
              <input v-model.number="form.maxResults" type="number" min="3" max="40" />
            </label>
          </template>

          <template v-else-if="tool.inputType === 'email'">
            <label>
              Email
              <input v-model.trim="form.email" type="email" autocomplete="off" spellcheck="false" placeholder="nombre@dominio.com" />
            </label>
            <label class="osint-switch">
              <input v-model="form.onlyUsed" type="checkbox" />
              <span>Mostrar solo servicios con indicios positivos</span>
            </label>
            <label>
              Timeout
              <input v-model.number="form.timeoutSeconds" type="number" min="5" max="120" />
            </label>
          </template>

          <template v-else-if="tool.inputType === 'domain'">
            <label>
              Dominio
              <input v-model.trim="form.domain" type="text" autocomplete="off" spellcheck="false" placeholder="example.com" />
            </label>
            <div class="osint-check-grid">
              <label v-for="source in domainSources" :key="source">
                <input v-model="form.sources" type="checkbox" :value="source" />
                <span>{{ source }}</span>
              </label>
            </div>
            <div class="osint-fields">
              <label>
                Límite
                <input v-model.number="form.limit" type="number" min="20" max="1000" />
              </label>
              <label>
                Timeout
                <input v-model.number="form.timeoutSeconds" type="number" min="10" max="600" />
              </label>
            </div>
          </template>

          <template v-else>
            <label>
              {{ tool.inputType === "loose" ? "Nombre, alias o username" : "Username" }}
              <input v-model.trim="form.username" type="text" autocomplete="off" spellcheck="false" placeholder="hacker" />
            </label>

            <div class="osint-fields">
              <label>
                Top sitios
                <input v-model.number="form.topSites" type="number" min="20" max="1000" />
              </label>
              <label>
                Timeout
                <input v-model.number="form.timeoutSeconds" type="number" min="5" max="120" />
              </label>
            </div>

            <label v-if="tool.key === 'maigret'" class="osint-switch">
              <input v-model="form.deepMode" type="checkbox" />
              <span>Modo profundo</span>
            </label>
          </template>

          <button type="submit" :disabled="busy || !canSubmit">
            {{ busy ? "Ejecutando" : actionLabel }}
          </button>
          <p v-if="error" class="osint-error">{{ error }}</p>
        </form>

        <section class="osint-panel osint-run">
          <header>
            <span>{{ tool.mode === "search" ? "Resultados públicos" : job?.phase || "Esperando parámetros" }}</span>
            <strong>{{ tool.mode === "search" ? profileCandidateCount : `${progress}%` }}</strong>
          </header>

          <template v-if="tool.mode === 'search'">
            <div class="osint-signal">
              <span>Objetivo</span>
              <strong>{{ form.query || "sin consulta" }}</strong>
              <small>LinkedIn y redes indexadas por motores públicos</small>
            </div>
            <p class="osint-hint">Valida manualmente cada candidato: coincidencia de nombre no equivale a atribución de identidad.</p>
          </template>

          <template v-else>
            <div class="osint-progress"><span :style="{ width: `${progress}%` }"></span></div>
            <dl>
              <div>
                <dt>Estado</dt>
                <dd>{{ job?.status || "READY" }}</dd>
              </div>
              <div>
                <dt>Objetivo</dt>
                <dd>{{ job?.target || runTarget || "N/D" }}</dd>
              </div>
              <div>
                <dt>Hallazgos</dt>
                <dd>{{ findingCount }}</dd>
              </div>
            </dl>
            <code v-if="job?.command">{{ job.command }}</code>
          </template>
        </section>
      </div>

      <section class="osint-panel osint-panel--wide">
        <header>
          <span>Salida</span>
          <strong>{{ outputTitle }}</strong>
        </header>

        <div v-if="profileCandidates.length" class="osint-result-list osint-result-list--profiles">
          <article v-for="candidate in profileCandidates" :key="candidate.url">
            <span>{{ candidate.platform }} / {{ candidate.score }}%</span>
            <strong>{{ candidate.title || candidate.url }}</strong>
            <a :href="candidate.url" target="_blank" rel="noreferrer">{{ candidate.url }}</a>
          </article>
        </div>

        <div v-else-if="findings.length" class="osint-result-list">
          <article v-for="(item, index) in findings" :key="index">
            <span>{{ item.platform || item.service || item.type || item.status || "osint" }}</span>
            <strong>{{ item.title || item.label || item.value || item.url || item.service || item.status }}</strong>
            <a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">{{ item.url }}</a>
            <small v-else>{{ item.line || item.value || item.status }}</small>
          </article>
        </div>

        <div v-else-if="searchQueries.length" class="osint-query-links">
          <a v-for="query in searchQueries" :key="query.url" :href="query.url" target="_blank" rel="noreferrer">
            <span>{{ query.platform }}</span>
            <strong>{{ query.query }}</strong>
          </a>
        </div>

        <pre v-else>{{ logText || "Los resultados aparecerán aquí." }}</pre>
      </section>

      <section v-if="tool.mode !== 'search'" class="osint-panel osint-panel--history">
        <header>
          <span>Historial</span>
          <button type="button" @click="loadHistory">Actualizar</button>
        </header>
        <div v-if="history.length" class="osint-history-list">
          <button v-for="item in history" :key="item.id" type="button" @click="loadJob(item.id)">
            <span>{{ item.target }}</span>
            <strong>{{ item.status }}</strong>
          </button>
        </div>
        <p v-else class="osint-empty">No hay ejecuciones recientes de {{ tool.title }}.</p>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { forgetRuntimeJob, isRuntimeJobRunning, rememberedRuntimeJob, rememberRuntimeJob } from "@/services/runtimeJobs";
import { osintTools } from "@/data/osintTools";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

const OSINT_CATALOG_TOOL = {
  profileSearch: "caligo-people",
  sherlock: "sherlock",
  maigret: "maigret",
  socialAnalyzer: "social-analyzer",
  holehe: "holehe",
  theharvester: "theharvester",
};

export default {
  name: "OsintToolWorkbench",
  components: {
    ToolHeroHeader,
  },
  props: {
    toolKey: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      capabilities: null,
      busy: false,
      error: "",
      job: null,
      history: [],
      pollTimer: null,
      searchResult: null,
      form: {
        query: "",
        locationHint: "",
        platforms: ["linkedin", "github", "x", "instagram", "facebook", "tiktok"],
        maxResults: 18,
        username: "",
        email: "",
        domain: "",
        sources: ["duckduckgo", "bing", "yahoo", "crtsh"],
        limit: 200,
        topSites: 250,
        timeoutSeconds: 45,
        deepMode: false,
        onlyUsed: true,
      },
    };
  },
  computed: {
    tool() {
      return osintTools[this.toolKey];
    },
    catalogToolId() {
      return OSINT_CATALOG_TOOL[this.toolKey] || this.tool.key;
    },
    heroLogos() {
      return this.tool.mode === "search" ? ["caligo-people", "sherlock", "maigret"] : [this.catalogToolId];
    },
    toolCapability() {
      return (this.capabilities?.tools || []).find((item) => item.id === this.tool.key) || {};
    },
    toolAvailable() {
      return Boolean(this.toolCapability.available);
    },
    toolVersion() {
      return this.toolCapability.version || "";
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.toolAvailable ? "Operativo" : "Pendiente" },
        { label: "Consulta", value: this.tool.inputType || this.tool.mode },
        { label: "Version", value: this.toolVersion || "Inventario servidor" },
      ];
    },
    platforms() {
      return this.capabilities?.platforms || ["linkedin", "github", "x", "instagram", "facebook", "tiktok", "reddit", "youtube"];
    },
    domainSources() {
      return this.capabilities?.defaults?.domainSources || ["duckduckgo", "bing", "yahoo", "crtsh"];
    },
    canSubmit() {
      if (this.tool.mode === "search") return Boolean(this.form.query);
      if (this.tool.inputType === "email") return Boolean(this.form.email);
      if (this.tool.inputType === "domain") return Boolean(this.form.domain);
      return Boolean(this.form.username);
    },
    actionLabel() {
      return this.tool.mode === "search" ? "Buscar perfiles" : `Ejecutar ${this.tool.title}`;
    },
    progress() {
      return Number(this.job?.progress || 0);
    },
    runTarget() {
      if (this.tool.inputType === "email") return this.form.email;
      if (this.tool.inputType === "domain") return this.form.domain;
      return this.form.username;
    },
    profileCandidates() {
      return this.searchResult?.candidates || [];
    },
    profileCandidateCount() {
      return Number(this.searchResult?.candidateCount || this.profileCandidates.length || 0);
    },
    searchQueries() {
      return this.searchResult?.queries || [];
    },
    findings() {
      return this.job?.result?.findings || [];
    },
    findingCount() {
      return Number(this.job?.result?.findingCount || this.findings.length || 0);
    },
    logText() {
      const logs = this.job?.logs || [];
      if (logs.length) return logs.join("\n");
      return this.job?.result?.stdout || this.job?.result?.stderr || "";
    },
    outputTitle() {
      if (this.tool.mode === "search") return `${this.profileCandidateCount} candidato${this.profileCandidateCount === 1 ? "" : "s"}`;
      return `${this.findingCount} hallazgo${this.findingCount === 1 ? "" : "s"}`;
    },
    runtimeScope() {
      return `osint.${this.tool.key}`;
    },
  },
  watch: {
    toolKey: {
      immediate: true,
      handler() {
        this.stopPolling();
        this.error = "";
        this.job = null;
        this.searchResult = null;
        this.$nextTick(() => {
          this.loadCapabilities();
          if (this.tool.mode !== "search") {
            this.restoreJob();
            this.loadHistory();
          }
        });
      },
    },
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
    async submit() {
      if (this.tool.mode === "search") {
        await this.runProfileSearch();
        return;
      }
      await this.startRun();
    },
    async runProfileSearch() {
      this.busy = true;
      this.error = "";
      try {
        this.searchResult = await caligoApi.request(this.tool.endpoint, {
          method: "POST",
          body: JSON.stringify({
            query: this.form.query,
            locationHint: this.form.locationHint,
            platforms: this.form.platforms,
            maxResults: this.form.maxResults,
          }),
        });
      } catch (error) {
        this.error = error.message || "No se pudo ejecutar la búsqueda OSINT";
      } finally {
        this.busy = false;
      }
    },
    async startRun() {
      this.busy = true;
      this.error = "";
      try {
        this.job = await caligoApi.request(this.tool.endpoint, {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        this.startPolling();
        await this.loadHistory();
      } catch (error) {
        this.error = error.message || "No se pudo iniciar la herramienta OSINT";
      } finally {
        this.busy = false;
      }
    },
    payload() {
      if (this.tool.inputType === "email") {
        return {
          email: this.form.email,
          timeoutSeconds: this.form.timeoutSeconds,
          onlyUsed: this.form.onlyUsed,
        };
      }
      if (this.tool.inputType === "domain") {
        return {
          domain: this.form.domain,
          sources: this.form.sources,
          limit: this.form.limit,
          timeoutSeconds: this.form.timeoutSeconds,
        };
      }
      return {
        query: this.form.username,
        topSites: this.form.topSites,
        timeoutSeconds: this.form.timeoutSeconds,
        deepMode: this.form.deepMode,
      };
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
      this.job = await caligoApi.request(`${this.tool.jobBase}/${id}`);
      if (isRuntimeJobRunning(this.job)) {
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        this.startPolling();
      } else {
        forgetRuntimeJob(this.runtimeScope);
      }
    },
    async loadHistory() {
      try {
        this.history = await caligoApi.request(this.tool.jobBase);
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
        this.job = await caligoApi.request(`${this.tool.jobBase}/${this.job.id}`);
        if (!isRuntimeJobRunning(this.job)) {
          this.stopPolling();
          forgetRuntimeJob(this.runtimeScope);
          await this.loadHistory();
        }
      } catch (error) {
        this.error = error.message || "No se pudo refrescar el job OSINT";
        this.stopPolling();
      }
    },
  },
};
</script>
