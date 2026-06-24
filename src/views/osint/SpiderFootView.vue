<template>
  <section class="osint-workbench osint-interface osint-interface--spiderfoot" aria-labelledby="spiderfoot-title">
    <div class="osint-workbench__shell">
      <ToolHeroHeader
        tool-id="spiderfoot"
        title="SpiderFoot"
        eyebrow="OSINT / Correlación multi-fuente"
        summary="Automatización OSINT con perfiles, módulos y tipos de evento controlados desde Caligo. El backend conserva el job y normaliza hallazgos para revisión técnica."
        title-id="spiderfoot-title"
        :logo-tools="['spiderfoot']"
        :meta="heroMeta"
      />

      <div class="osint-interface__grid osint-interface__grid--ops">
        <form class="osint-panel osint-interface__control" @submit.prevent="startRun">
          <header>
            <span>Objetivo</span>
            <strong>spiderfoot</strong>
          </header>

          <label>
            Target autorizado
            <input v-model.trim="form.target" type="text" autocomplete="off" spellcheck="false" :placeholder="targetPlaceholder" />
          </label>

          <div class="osint-interface__split">
            <label>
              Tipo de target
              <select v-model="form.targetType">
                <option v-for="target in targetTypes" :key="target.value" :value="target.value">{{ target.label }}</option>
              </select>
            </label>
            <label>
              Timeout
              <input v-model.number="form.timeoutSeconds" type="number" min="60" max="3600" />
            </label>
          </div>

          <section class="osint-parameter-block">
            <div>
              <span>Perfil de escaneo</span>
              <strong>{{ activeProfile.label }}</strong>
            </div>
            <div class="osint-interface__preset-grid osint-interface__preset-grid--profiles">
              <button
                v-for="profile in profiles"
                :key="profile.value"
                type="button"
                :class="{ 'is-active': form.scanProfile === profile.value }"
                @click="selectProfile(profile.value)"
              >
                <strong>{{ profile.label }}</strong>
                <small>{{ profile.description }}</small>
              </button>
            </div>
          </section>

          <section class="osint-parameter-block">
            <div>
              <span>Módulos explícitos</span>
              <strong>{{ moduleModeLabel }}</strong>
            </div>
            <div class="osint-toggle-grid osint-toggle-grid--three">
              <label v-for="module in moduleChoices" :key="module.value" :class="{ 'is-active': form.modules.includes(module.value) }">
                <input v-model="form.modules" type="checkbox" :value="module.value" />
                <span>
                  <strong>{{ module.label }}</strong>
                  <small>{{ module.value }}</small>
                </span>
              </label>
            </div>
          </section>

          <section class="osint-parameter-block">
            <div>
              <span>Tipos de evento</span>
              <strong>{{ eventModeLabel }}</strong>
            </div>
            <div class="osint-toggle-grid osint-toggle-grid--four">
              <label v-for="event in eventTypes" :key="event.value" :class="{ 'is-active': form.eventTypes.includes(event.value) }">
                <input v-model="form.eventTypes" type="checkbox" :value="event.value" />
                <span>{{ event.label }}</span>
              </label>
            </div>
          </section>

          <label class="osint-switch">
            <input v-model="form.strictMode" type="checkbox" />
            <span>Modo estricto: descartar resultados con menor confianza cuando SpiderFoot lo permita.</span>
          </label>

          <label class="osint-switch osint-interface__scope">
            <input v-model="form.authorized" type="checkbox" />
            <span>Confirmo que el objetivo pertenece a un alcance propio, de laboratorio o autorizado.</span>
          </label>

          <button type="submit" :disabled="busy || !canSubmit">
            {{ busy ? "Lanzando" : "Ejecutar SpiderFoot" }}
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
              <span>Hallazgos</span>
              <strong>{{ findingCount }}</strong>
            </article>
            <article>
              <span>Target</span>
              <strong>{{ job?.target || form.target || "N/D" }}</strong>
            </article>
            <article>
              <span>Perfil</span>
              <strong>{{ form.scanProfile }}</strong>
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
          <span>Correlación OSINT</span>
          <strong>{{ findingCount }} hallazgo{{ findingCount === 1 ? "" : "s" }}</strong>
        </header>

        <div v-if="summaryTypes.length" class="osint-interface__evidence-grid osint-interface__evidence-grid--three">
          <article v-for="item in summaryTypes" :key="item.type">
            <span>{{ item.type }}</span>
            <strong>{{ item.count }}</strong>
          </article>
        </div>

        <div v-if="findings.length" class="osint-finding-table">
          <article v-for="(item, index) in findings" :key="`${item.type}-${index}`">
            <span class="osint-finding-table__score">{{ item.score || 0 }}</span>
            <div>
              <small>{{ item.type }} / {{ item.module || "spiderfoot" }}</small>
              <strong>{{ item.value }}</strong>
              <a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">{{ item.url }}</a>
            </div>
          </article>
        </div>

        <pre v-else>{{ logText || "Define target, perfil y módulos. Los hallazgos normalizados aparecerán aquí." }}</pre>
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

const RUNTIME_SCOPE = "osint.spiderfoot";
const FORM_STORAGE_KEY = "caligo.osint.spiderfoot.form";

const PROFILES = [
  { value: "passive", label: "Pasivo", description: "Fuentes abiertas, bajo ruido" },
  { value: "footprint", label: "Footprint", description: "DNS, rangos y superficie" },
  { value: "investigate", label: "Investigación", description: "Email, PGP y social" },
  { value: "all", label: "Completo", description: "Cobertura amplia" },
  { value: "custom", label: "Manual", description: "Solo módulos elegidos" },
];

const TARGET_TYPES = [
  { value: "auto", label: "Auto" },
  { value: "domain", label: "Dominio" },
  { value: "ip", label: "IP" },
  { value: "netblock", label: "Netblock" },
  { value: "email", label: "Email" },
  { value: "username", label: "Username" },
  { value: "name", label: "Nombre" },
  { value: "phone", label: "Teléfono" },
];

const MODULE_CHOICES = [
  { value: "sfp_dnsresolve", label: "DNS resolve" },
  { value: "sfp_whois", label: "WHOIS" },
  { value: "sfp_crtsh", label: "crt.sh" },
  { value: "sfp_arin", label: "ARIN" },
  { value: "sfp_bingsearch", label: "Bing" },
  { value: "sfp_dnsbrute", label: "DNS brute" },
  { value: "sfp_email", label: "Email" },
  { value: "sfp_pgp", label: "PGP" },
  { value: "sfp_social", label: "Social" },
  { value: "sfp_haveibeenpwned", label: "Leaks" },
  { value: "sfp_urlscan", label: "urlscan" },
  { value: "sfp_shodan", label: "Shodan" },
];

const EVENT_TYPES = [
  { value: "DOMAIN_NAME", label: "Dominio" },
  { value: "IP_ADDRESS", label: "IP" },
  { value: "EMAILADDR", label: "Email" },
  { value: "USERNAME", label: "Username" },
  { value: "HUMAN_NAME", label: "Nombre" },
  { value: "PHONE_NUMBER", label: "Teléfono" },
  { value: "URL_FORM", label: "URL" },
  { value: "WEBSERVER_HTTPHEADERS", label: "HTTP" },
];

export default {
  name: "SpiderFootView",
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
        target: "",
        targetType: "domain",
        scanProfile: "passive",
        modules: [],
        eventTypes: [],
        strictMode: false,
        timeoutSeconds: 900,
        authorized: false,
      },
    };
  },
  computed: {
    profiles() {
      return PROFILES;
    },
    targetTypes() {
      return TARGET_TYPES;
    },
    moduleChoices() {
      return MODULE_CHOICES;
    },
    eventTypes() {
      return EVENT_TYPES;
    },
    toolCapability() {
      return (this.capabilities?.tools || []).find((item) => item.id === "spiderfoot") || {};
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.toolCapability.available ? "Operativo" : "Pendiente" },
        { label: "Versión", value: this.toolCapability.version || "Inventario servidor" },
        { label: "Persistencia", value: "Job backend" },
      ];
    },
    activeProfile() {
      return this.profiles.find((profile) => profile.value === this.form.scanProfile) || this.profiles[0];
    },
    targetPlaceholder() {
      const placeholders = {
        domain: "example.com",
        ip: "192.168.0.10",
        netblock: "192.168.0.0/24",
        email: "nombre@example.com",
        username: "alias_publico",
        name: "Nombre Apellido",
        phone: "+34900111222",
      };
      return placeholders[this.form.targetType] || "dominio, IP, email, alias o nombre";
    },
    moduleModeLabel() {
      if (this.form.modules.length) return `${this.form.modules.length} seleccionado${this.form.modules.length === 1 ? "" : "s"}`;
      if (this.form.scanProfile === "custom") return "Selecciona al menos uno";
      return `Preset ${this.activeProfile.label}`;
    },
    eventModeLabel() {
      return this.form.eventTypes.length ? `${this.form.eventTypes.length} filtro${this.form.eventTypes.length === 1 ? "" : "s"}` : "Auto por target";
    },
    canSubmit() {
      return this.form.authorized && Boolean(this.form.target) && (this.form.scanProfile !== "custom" || this.form.modules.length > 0);
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
    summaryTypes() {
      const types = this.jobResult?.summary?.types || {};
      return Object.entries(types)
        .map(([type, count]) => ({ type, count }))
        .sort((first, second) => Number(second.count) - Number(first.count))
        .slice(0, 9);
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
    selectProfile(profile) {
      this.form.scanProfile = profile;
      if (profile !== "custom") {
        this.form.modules = [];
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
        this.job = await caligoApi.request("/api/osint/spiderfoot/runs", {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
        rememberRuntimeJob(RUNTIME_SCOPE, this.job.id);
        this.startPolling();
        await this.loadHistory();
      } catch (error) {
        this.error = error.message || "No se pudo iniciar SpiderFoot";
      } finally {
        this.busy = false;
      }
    },
    payload() {
      return {
        target: this.form.target,
        targetType: this.form.targetType,
        scanProfile: this.form.scanProfile,
        modules: this.form.modules,
        eventTypes: this.form.eventTypes,
        strictMode: this.form.strictMode,
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
      this.job = await caligoApi.request(`/api/osint/spiderfoot/runs/${id}`);
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
        this.history = await caligoApi.request("/api/osint/spiderfoot/runs");
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
        this.error = error.message || "No se pudo refrescar SpiderFoot";
        this.stopPolling();
      }
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
      link.download = `caligo-spiderfoot-${this.job?.id || "result"}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  },
};
</script>
