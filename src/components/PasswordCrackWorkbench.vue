<template>
  <section class="password-lab" :class="`password-lab--${tool}`" aria-labelledby="password-crack-title">
    <div class="password-lab__shell">
      <ToolHeroHeader
        :tool-id="tool"
        :title="copy.title"
        :eyebrow="copy.eyebrow"
        :summary="copy.summary"
        title-id="password-crack-title"
        :logo-tools="[tool, 'wordlists']"
        :meta="heroMeta"
      />

      <div class="password-lab__grid">
        <form class="password-console password-console--input" @submit.prevent="startRun">
          <header>
            <span>Entrada</span>
            <strong>{{ tool.toUpperCase() }}</strong>
          </header>

          <label>
            Hashes autorizados
            <textarea v-model="form.hashes" rows="6" spellcheck="false" placeholder="Un hash por línea"></textarea>
          </label>

          <div class="password-fields">
            <label v-if="isJohn">
              Formato John
              <select v-model="form.hashFormat">
                <option v-for="item in johnFormats" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </label>

            <label v-else>
              Modo Hashcat
              <select v-model="form.hashcatMode">
                <option v-for="item in hashcatModes" :key="item.value" :value="item.value">
                  {{ item.label }} / {{ item.value }}
                </option>
              </select>
            </label>

            <label v-if="!isJohn">
              Ataque
              <select v-model="form.attackMode">
                <option value="wordlist">Diccionario</option>
                <option value="mask">Máscara</option>
              </select>
            </label>
          </div>

          <label v-if="!isJohn && form.attackMode === 'mask'">
            Máscara
            <input v-model.trim="form.mask" type="text" spellcheck="false" placeholder="?l?l?l?l?d?d" />
          </label>

          <label v-else>
            Diccionario
            <select v-model="form.wordlistFile">
              <option value="">Lista pegada manualmente</option>
              <option v-for="wordlist in wordlists" :key="wordlist.path" :value="wordlist.path">
                {{ wordlist.label }}
              </option>
            </select>
          </label>

          <label v-if="usesInlineWordlist">
            Wordlist temporal
            <textarea v-model="form.wordlistText" rows="6" spellcheck="false" placeholder="password&#10;password123&#10;pepito53"></textarea>
          </label>

          <div class="password-switches">
            <label class="password-switch">
              <input v-model="form.usernameFormat" type="checkbox" :disabled="isJohn" />
              <span>Formato user:hash</span>
            </label>
            <label class="password-switch">
              <input v-model="showPasswords" type="checkbox" />
              <span>Mostrar claves</span>
            </label>
          </div>

          <button type="submit" :disabled="starting || !canStart">
            {{ startButtonLabel }}
          </button>

          <p v-if="error" class="password-alert password-alert--error">{{ error }}</p>
          <p v-else-if="capabilityError" class="password-alert">{{ capabilityError }}</p>
        </form>

        <section class="password-run" aria-label="Ejecución">
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
              <dd>{{ job?.phase || "Esperando material" }}</dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>{{ durationLabel }}</dd>
            </div>
            <div>
              <dt>Hashes</dt>
              <dd>{{ hashCount }}</dd>
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
            <span>Resultados</span>
            <strong>{{ cracked.length }} credencial{{ cracked.length === 1 ? "" : "es" }}</strong>
          </div>
          <button type="button" @click="loadHistory">Actualizar historial</button>
        </header>

        <div v-if="cracked.length" class="password-table">
          <div class="password-table__row password-table__row--head">
            <span>Hash</span>
            <span>Password</span>
            <span>Formato</span>
          </div>
          <div v-for="item in cracked" :key="`${item.hash}-${item.password}`" class="password-table__row">
            <code>{{ item.hash || item.raw || "N/D" }}</code>
            <strong>{{ showPasswords ? item.password : maskedPassword(item.password) }}</strong>
            <span>{{ item.format || item.source || tool }}</span>
          </div>
        </div>

        <p v-else>{{ emptyResultLabel }}</p>
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
        <p v-else>No hay ejecuciones recientes de {{ copy.title }} para este usuario.</p>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { forgetRuntimeJob, isRuntimeJobRunning, rememberedRuntimeJob, rememberRuntimeJob } from "@/services/runtimeJobs";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

export default {
  name: "PasswordCrackWorkbench",
  components: {
    ToolHeroHeader,
  },
  props: {
    tool: {
      type: String,
      required: true,
      validator: (value) => ["john", "hashcat"].includes(value),
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
      showPasswords: false,
      form: {
        hashes: "5f4dcc3b5aa765d61d8327deb882cf99",
        hashFormat: "raw-md5",
        hashcatMode: "0",
        attackMode: "wordlist",
        wordlistFile: "",
        wordlistText: "password\npassword123\npepito53\ncaligo",
        mask: "?l?l?l?l?d?d",
        usernameFormat: false,
      },
    };
  },
  computed: {
    isJohn() {
      return this.tool === "john";
    },
    runtimeScope() {
      return `passwords.${this.tool}`;
    },
    copy() {
      return this.isJohn
        ? {
            eyebrow: "Contraseñas / John",
            title: "John the Ripper",
            summary: "Auditoría offline de hashes con formatos de John, diccionarios locales del servidor y jobs persistentes.",
          }
        : {
            eyebrow: "Contraseñas / Hashcat",
            title: "Hashcat",
            summary: "Cracking offline con modos Hashcat, ataque por diccionario o máscara y seguimiento del proceso en vivo.",
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
        { label: "Hashes", value: this.hashCount || "0" },
        { label: "Version", value: this.engineMessage },
      ];
    },
    johnFormats() {
      return this.capabilities?.johnFormats || [{ value: "auto", label: "Auto" }];
    },
    hashcatModes() {
      return this.capabilities?.hashcatModes || [{ value: "0", label: "MD5" }];
    },
    wordlists() {
      return this.capabilities?.wordlists || [];
    },
    usesInlineWordlist() {
      return this.form.attackMode !== "mask" && !this.form.wordlistFile;
    },
    isRunning() {
      return isRuntimeJobRunning(this.job);
    },
    canStart() {
      return this.engineReady && this.form.hashes.trim() && !this.isRunning;
    },
    startButtonLabel() {
      if (this.starting) return "Preparando";
      if (this.isRunning) return "En ejecución";
      return this.isJohn ? "Ejecutar John" : "Ejecutar Hashcat";
    },
    progress() {
      return Math.max(0, Math.min(100, Number(this.job?.progress || 0)));
    },
    hashCount() {
      return this.form.hashes.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).length;
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
    cracked() {
      const values = this.result?.cracked || this.result?.passwords || [];
      return Array.isArray(values) ? values : [];
    },
    logText() {
      const lines = this.job?.logs || [];
      if (lines.length) return lines.slice(-14).join("\n");
      if (this.job?.error) return this.job.error;
      return this.job ? "El motor aún no ha emitido traza." : "La traza aparecerá al iniciar una ejecución.";
    },
    emptyResultLabel() {
      if (this.isRunning) return "El motor sigue trabajando. Puedes cambiar de vista y volver aquí para recuperar el progreso.";
      if (this.job?.status === "COMPLETED") return "No se han recuperado passwords con el material actual.";
      return "Ejecuta una auditoría o carga un job reciente para ver resultados.";
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
  activated() {
    if (isRuntimeJobRunning(this.job)) {
      this.startPolling();
    } else if (!this.job) {
      this.restoreActiveJob();
    }
  },
  deactivated() {
    this.stopPolling();
  },
  methods: {
    resetRuntime() {
      this.stopPolling();
      this.error = "";
      this.capabilityError = "";
      this.job = null;
      this.history = [];
      this.form.attackMode = "wordlist";
      this.form.usernameFormat = false;
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
      this.capabilityError = "";
      try {
        await this.ensureSession();
        this.capabilities = await caligoApi.request("/api/passwords/capabilities");
        this.applyDefaults();
        this.loadHistory();
      } catch (error) {
        this.capabilityError = error.message || "No se pudieron consultar las herramientas de contraseñas";
      }
    },
    applyDefaults() {
      const defaults = this.capabilities?.defaults || {};
      this.form = {
        ...this.form,
        hashes: this.form.hashes || defaults.hashes || "",
        hashFormat: this.form.hashFormat || defaults.hashFormat || "auto",
        hashcatMode: this.form.hashcatMode || defaults.hashcatMode || "0",
        attackMode: this.form.attackMode || defaults.attackMode || "wordlist",
        wordlistText: this.form.wordlistText || defaults.wordlistText || "",
        mask: this.form.mask || defaults.mask || "?l?l?l?l?d?d",
      };
    },
    payload() {
      return {
        hashes: this.form.hashes,
        hashFormat: this.form.hashFormat,
        hashcatMode: this.form.hashcatMode,
        attackMode: this.form.attackMode,
        wordlistFile: this.form.attackMode === "mask" ? "" : this.form.wordlistFile,
        wordlistText: this.usesInlineWordlist ? this.form.wordlistText : "",
        mask: this.form.mask,
        usernameFormat: !this.isJohn && this.form.usernameFormat,
        showPasswords: this.showPasswords,
      };
    },
    async startRun() {
      this.error = "";
      this.starting = true;
      try {
        await this.ensureSession();
        this.job = await caligoApi.request(`/api/passwords/${this.tool}/runs`, {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        this.startPolling();
      } catch (error) {
        this.error = error.message || `No se pudo iniciar ${this.copy.title}`;
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
    maskedPassword(value) {
      const length = Math.max(8, String(value || "").length);
      return "*".repeat(Math.min(length, 20));
    },
  },
};
</script>
