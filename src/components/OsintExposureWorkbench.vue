<template>
  <section class="osint-workbench osint-exposure" :class="`osint-workbench--${tool.key}`" aria-labelledby="osint-exposure-title">
    <div class="osint-workbench__shell">
      <ToolHeroHeader
        :tool-id="catalogToolId"
        :tool="tool"
        :title="tool.title"
        :eyebrow="tool.eyebrow"
        :summary="tool.summary"
        title-id="osint-exposure-title"
        :logo-tools="heroLogos"
        :meta="heroMeta"
      />

      <div class="osint-grid">
        <form class="osint-panel osint-console osint-exposure__console" @submit.prevent="submit">
          <header>
            <span>Entrada</span>
            <strong>{{ tool.command }}</strong>
          </header>

          <template v-for="field in tool.fields" :key="field.key">
            <label v-if="field.type === 'textarea'" class="osint-exposure__field osint-exposure__field--wide">
              {{ field.label }}
              <textarea v-model.trim="form[field.key]" :placeholder="field.placeholder" spellcheck="false"></textarea>
            </label>

            <label v-else-if="field.type === 'select'" class="osint-exposure__field">
              {{ field.label }}
              <select v-model="form[field.key]">
                <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
              </select>
            </label>

            <label v-else-if="field.type === 'checkbox'" class="osint-switch">
              <input v-model="form[field.key]" type="checkbox" />
              <span>{{ field.label }}</span>
            </label>

            <label v-else class="osint-exposure__field">
              {{ field.label }}
              <input
                v-model.trim="form[field.key]"
                :type="field.type"
                :min="field.min"
                :max="field.max"
                :autocomplete="field.sensitive ? 'new-password' : 'off'"
                :placeholder="field.placeholder"
                spellcheck="false"
              />
            </label>
          </template>

          <label class="osint-switch osint-exposure__scope">
            <input v-model="form.authorized" type="checkbox" />
            <span>Confirmo alcance autorizado, propio o con consentimiento explícito.</span>
          </label>

          <button type="submit" :disabled="busy || !canSubmit">
            {{ busy ? "Consultando" : `Ejecutar ${tool.title}` }}
          </button>
          <button v-if="result || error" class="osint-exposure__ghost" type="button" @click="clearState">Limpiar resultado</button>
          <p v-if="error" class="osint-error">{{ error }}</p>
        </form>

        <section class="osint-panel osint-run osint-exposure__status">
          <header>
            <span>Estado</span>
            <strong>{{ result ? "READY" : "WAIT" }}</strong>
          </header>

          <div class="osint-signal">
            <span>Objetivo</span>
            <strong>{{ currentTarget || "sin objetivo" }}</strong>
            <small>{{ targetHint }}</small>
          </div>

          <dl>
            <div>
              <dt>Modo</dt>
              <dd>Pasivo</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{{ form.authorized ? "OK" : "Pendiente" }}</dd>
            </div>
            <div>
              <dt>Persistencia</dt>
              <dd>Local</dd>
            </div>
          </dl>

          <p class="osint-hint">
            Caligo limita esta zona a exposición propia, corporativa o autorizada. No se intenta descubrir datos privados ni acceder a cuentas.
          </p>
        </section>
      </div>

      <section class="osint-panel osint-panel--wide osint-exposure__results">
        <header>
          <span>Salida</span>
          <strong>{{ outputTitle }}</strong>
        </header>

        <div v-if="summaryItems.length" class="osint-exposure__summary">
          <article v-for="item in summaryItems" :key="item.key">
            <span>{{ item.key }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <div v-if="resultBlocks.length" class="osint-exposure__blocks">
          <section v-for="block in resultBlocks" :key="block.key" class="osint-exposure__block">
            <header>
              <span>{{ block.label }}</span>
              <strong>{{ block.items.length }}</strong>
            </header>
            <div class="osint-result-list">
              <article v-for="(item, index) in block.items" :key="`${block.key}-${index}`">
                <span>{{ item.kicker }}</span>
                <strong>{{ item.title }}</strong>
                <a v-if="item.url" :href="item.url" target="_blank" rel="noreferrer">{{ item.url }}</a>
                <small v-if="item.text">{{ item.text }}</small>
              </article>
            </div>
          </section>
        </div>

        <pre v-else>{{ result ? JSON.stringify(result, null, 2) : "Los hallazgos aparecerán aquí." }}</pre>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { osintExposureTools } from "@/data/osintExposureTools";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

const EXPOSURE_CATALOG_TOOL = {
  emailExposure: "email-exposure",
  phoneLookup: "phone-lookup",
  domainContacts: "domain-contacts",
  passwordExposure: "password-exposure",
  metadataExposure: "metadata-exposure",
  publicFiles: "public-files",
};

const STORAGE_PREFIX = "caligo.osint.exposure.";

export default {
  name: "OsintExposureWorkbench",
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
      result: null,
      form: {},
    };
  },
  computed: {
    tool() {
      return osintExposureTools[this.toolKey];
    },
    catalogToolId() {
      return EXPOSURE_CATALOG_TOOL[this.toolKey] || this.tool.key;
    },
    heroLogos() {
      if (this.toolKey === "metadataExposure") return [this.catalogToolId, "exiftool"];
      return [this.catalogToolId];
    },
    storageKey() {
      return `${STORAGE_PREFIX}${this.tool.key}`;
    },
    toolCapability() {
      return (this.capabilities?.tools || []).find((item) => item.id === this.tool.key) || {};
    },
    toolAvailable() {
      return this.toolCapability.available !== false;
    },
    toolVersion() {
      return this.toolCapability.version || "";
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.toolAvailable ? "Operativo" : "Servidor" },
        { label: "Entrada", value: this.tool.requiredAny?.join(" / ") || this.tool.required?.join(" / ") || "Target" },
        { label: "Canal", value: this.toolVersion || this.tool.command },
      ];
    },
    canSubmit() {
      if (!this.form.authorized) return false;
      if (this.tool.requiredAny?.length) {
        return this.tool.requiredAny.some((key) => this.hasValue(this.form[key]));
      }
      return (this.tool.required || []).every((key) => this.hasValue(this.form[key]));
    },
    currentTarget() {
      const priority = ["email", "domain", "phone", "target", "url", "fullName"];
      return priority.map((key) => this.form[key]).find((value) => this.hasValue(value)) || "";
    },
    targetHint() {
      if (this.tool.key === "password-exposure") return "El valor no se guarda en persistencia local.";
      return "Formulario y último resultado se recuerdan al volver a la vista.";
    },
    outputTitle() {
      if (!this.result) return "Sin ejecución";
      const count = this.resultBlocks.reduce((total, block) => total + block.items.length, 0);
      return `${count} elemento${count === 1 ? "" : "s"}`;
    },
    summaryItems() {
      const summary = this.result?.summary;
      if (!summary || typeof summary !== "object" || Array.isArray(summary)) return [];
      return Object.entries(summary).map(([key, value]) => ({ key, value: this.displayValue(value) }));
    },
    resultBlocks() {
      if (!this.result) return [];
      const blocks = [];
      this.addBlock(blocks, "findings", "Hallazgos", this.result.findings);
      this.addBlock(blocks, "emails", "Emails", this.result.emails);
      this.addBlock(blocks, "phones", "Teléfonos", this.result.phones);
      this.addBlock(blocks, "candidates", "Candidatos", this.result.candidates);
      this.addBlock(blocks, "breaches", "Brechas", this.result.breaches);
      this.addBlock(blocks, "resources", "Recursos", this.result.resources);
      this.addBlock(blocks, "queries", "Consultas manuales", this.result.queries);
      this.addBlock(blocks, "mxRecords", "MX", this.result.mxRecords);
      this.addObjectBlock(blocks, "normalized", "Normalización", this.result.normalized);
      this.addObjectBlock(blocks, "headers", "Cabeceras", this.result.headers);
      this.addBlock(blocks, "recommendations", "Recomendaciones", this.result.recommendations);
      return blocks;
    },
  },
  watch: {
    toolKey: {
      immediate: true,
      handler() {
        this.error = "";
        this.result = null;
        this.form = this.initialForm();
        this.restoreState();
        this.loadCapabilities();
      },
    },
    form: {
      deep: true,
      handler() {
        this.persistState();
      },
    },
    result: {
      deep: true,
      handler() {
        this.persistState();
      },
    },
  },
  methods: {
    initialForm() {
      const form = { authorized: false };
      for (const field of this.tool.fields) {
          form[field.key] = field.defaultValue ?? (field.type === "checkbox" ? false : "");
      }
      return form;
    },
    async loadCapabilities() {
      try {
        this.capabilities = await caligoApi.request("/api/osint/capabilities");
      } catch {
        try {
          this.capabilities = await caligoApi.request("/api/osint/exposure/capabilities");
        } catch {
          this.capabilities = { tools: [] };
        }
      }
    },
    async submit() {
      this.busy = true;
      this.error = "";
      try {
        this.result = await caligoApi.request(this.tool.endpoint, {
          method: "POST",
          body: JSON.stringify(this.payload()),
        });
      } catch (error) {
        this.error = error.message || "No se pudo ejecutar la consulta OSINT";
      } finally {
        this.busy = false;
      }
    },
    payload() {
      const payload = {};
      for (const field of this.tool.fields) {
        let value = this.form[field.key];
        if (field.type === "number" && this.hasValue(value)) {
          value = Number(value);
        }
        if (field.type === "textarea") {
          value = this.splitLines(value);
        }
        payload[field.key] = value;
      }
      payload.authorized = this.form.authorized;
      return payload;
    },
    restoreState() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return;
        const state = JSON.parse(raw);
        this.form = { ...this.form, ...(state.form || {}), authorized: false };
        this.result = state.result || null;
      } catch {
        localStorage.removeItem(this.storageKey);
      }
    },
    persistState() {
      const form = { ...this.form, authorized: false };
      for (const field of this.tool.fields) {
        if (field.sensitive) {
          form[field.key] = "";
        }
      }
      localStorage.setItem(this.storageKey, JSON.stringify({ form, result: this.result }));
    },
    clearState() {
      this.error = "";
      this.result = null;
      this.form = this.initialForm();
      localStorage.removeItem(this.storageKey);
    },
    splitLines(value) {
      return String(value || "")
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    },
    addBlock(blocks, key, label, value) {
      if (!Array.isArray(value) || !value.length) return;
      blocks.push({
        key,
        label,
        items: value.map((item) => this.normalizeResultItem(item, key)),
      });
    },
    addObjectBlock(blocks, key, label, value) {
      if (!value || typeof value !== "object" || Array.isArray(value) || !Object.keys(value).length) return;
      blocks.push({
        key,
        label,
        items: Object.entries(value).map(([name, item]) => ({
          kicker: name,
          title: this.displayValue(item),
          text: "",
          url: this.urlValue(item),
        })),
      });
    },
    normalizeResultItem(item, key) {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        return {
          kicker: key,
          title: this.displayValue(item),
          text: "",
          url: this.urlValue(item),
        };
      }

      const title = item.title || item.name || item.value || item.email || item.url || item.platform || item.status || item.service || item.Name || "resultado";
      const text = item.evidence || item.description || item.sample || item.text || item.line || item.status || item.Description || "";
      return {
        kicker: item.type || item.source || item.platform || item.status || key,
        title: this.displayValue(title),
        text: this.stripHtml(this.displayValue(text)),
        url: item.url || this.urlValue(title),
      };
    },
    displayValue(value) {
      if (value === null || value === undefined || value === "") return "N/D";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    },
    urlValue(value) {
      const text = String(value || "");
      return /^https?:\/\//i.test(text) ? text : "";
    },
    stripHtml(value) {
      return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    },
    hasValue(value) {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && String(value).trim() !== "";
    },
  },
};
</script>
