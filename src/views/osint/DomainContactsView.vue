<template>
  <section class="osint-workbench osint-interface osint-interface--domain" aria-labelledby="domain-contacts-title">
    <div class="osint-workbench__shell">
      <ToolHeroHeader
        tool-id="domain-contacts"
        title="Domain Contacts"
        eyebrow="OSINT / Contacto"
        summary="Extracción pasiva de canales publicados por dominios autorizados: security.txt, contacto, privacidad, legal, robots y sitemap."
        title-id="domain-contacts-title"
        :logo-tools="['domain-contacts', 'theharvester', 'public-files']"
        :meta="heroMeta"
      />

      <div class="osint-interface__grid">
        <form class="osint-panel osint-interface__control" @submit.prevent="submit">
          <header>
            <span>Parámetros</span>
            <strong>HTTP fetch</strong>
          </header>

          <label>
            Dominio autorizado
            <input v-model.trim="form.domain" type="text" autocomplete="off" spellcheck="false" placeholder="empresa.com" />
          </label>

          <div class="osint-interface__preset-grid">
            <button
              v-for="preset in presets"
              :key="preset.id"
              type="button"
              :class="{ 'is-active': form.preset === preset.id }"
              @click="selectPreset(preset.id)"
            >
              <span>{{ preset.label }}</span>
              <small>{{ preset.paths.length }} rutas</small>
            </button>
          </div>

          <label>
            Rutas a comprobar
            <textarea v-model.trim="form.pathsText" spellcheck="false" placeholder="/.well-known/security.txt&#10;/contact&#10;/privacy"></textarea>
          </label>

          <label class="osint-interface__range">
            Timeout HTTP
            <input v-model.number="form.timeoutSeconds" type="range" min="5" max="45" />
            <strong>{{ form.timeoutSeconds }}s</strong>
          </label>

          <label class="osint-switch osint-interface__scope">
            <input v-model="form.authorized" type="checkbox" />
            <span>Confirmo que el dominio pertenece a un entorno autorizado.</span>
          </label>

          <button type="submit" :disabled="busy || !canSubmit">
            {{ busy ? "Extrayendo" : "Extraer contactos" }}
          </button>
          <button v-if="result || error" class="osint-interface__ghost" type="button" @click="clearState">Limpiar</button>
          <p v-if="error" class="osint-error">{{ error }}</p>
        </form>

        <section class="osint-panel osint-interface__status">
          <header>
            <span>Superficie</span>
            <strong>{{ result ? "READY" : "WAIT" }}</strong>
          </header>

          <div class="osint-interface__metric-grid">
            <article>
              <span>Rutas</span>
              <strong>{{ selectedPaths.length }}</strong>
            </article>
            <article>
              <span>Emails</span>
              <strong>{{ emails.length }}</strong>
            </article>
            <article>
              <span>Teléfonos</span>
              <strong>{{ phones.length }}</strong>
            </article>
            <article>
              <span>URLs</span>
              <strong>{{ urls.length }}</strong>
            </article>
          </div>

          <p class="osint-hint">
            La salida prioriza canales publicados por el propio dominio. Evita atribuir teléfonos o emails personales sin una fuente pública inequívoca.
          </p>
        </section>
      </div>

      <section class="osint-panel osint-interface__results">
        <header>
          <span>Contactos publicados</span>
          <strong>{{ findingCount }} señales</strong>
        </header>

        <div v-if="result" class="osint-interface__evidence-grid osint-interface__evidence-grid--three">
          <article>
            <span>Emails</span>
            <div class="osint-interface__tag-list osint-interface__tag-list--wrap">
              <strong v-for="email in emails" :key="email">{{ email }}</strong>
              <small v-if="!emails.length">Sin emails publicados</small>
            </div>
          </article>
          <article>
            <span>Teléfonos</span>
            <div class="osint-interface__tag-list osint-interface__tag-list--wrap">
              <strong v-for="phone in phones" :key="phone">{{ phone }}</strong>
              <small v-if="!phones.length">Sin teléfonos publicados</small>
            </div>
          </article>
          <article>
            <span>URLs relacionadas</span>
            <div class="osint-interface__tag-list osint-interface__tag-list--wrap">
              <a v-for="url in urls" :key="url" :href="url" target="_blank" rel="noreferrer">{{ url }}</a>
              <small v-if="!urls.length">Sin URLs extraídas</small>
            </div>
          </article>
        </div>

        <div v-if="resources.length" class="osint-interface__resource-list">
          <article v-for="resource in resources" :key="resource.url">
            <div>
              <span>{{ resource.status }} / {{ resource.durationMs || 0 }}ms</span>
              <strong>{{ resource.url }}</strong>
              <small>{{ resource.contentType || "sin content-type" }}</small>
            </div>
            <pre>{{ resource.sample || "Sin muestra" }}</pre>
          </article>
        </div>

        <div v-if="!result" class="osint-interface__empty">
          <strong>Esperando dominio</strong>
          <span>Selecciona un preset de rutas o define una lista propia para inspeccionar canales de contacto publicados.</span>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";
import { caligoApi } from "@/services/caligoApi";

const STORAGE_KEY = "caligo.osint.domainContacts";
const PRESETS = [
  {
    id: "standard",
    label: "Estándar",
    paths: ["/.well-known/security.txt", "/security.txt", "/contact", "/contacto", "/privacy", "/legal", "/robots.txt", "/sitemap.xml"],
  },
  {
    id: "security",
    label: "Security",
    paths: ["/.well-known/security.txt", "/security.txt", "/.well-known/change-password", "/humans.txt"],
  },
  {
    id: "legal",
    label: "Legal",
    paths: ["/legal", "/privacy", "/privacidad", "/aviso-legal", "/terms", "/cookies"],
  },
  {
    id: "custom",
    label: "Custom",
    paths: [],
  },
];

export default {
  name: "DomainContactsView",
  components: {
    ToolHeroHeader,
  },
  data() {
    return {
      busy: false,
      error: "",
      result: null,
      presets: PRESETS,
      form: {
        domain: "",
        preset: "standard",
        pathsText: PRESETS[0].paths.join("\n"),
        timeoutSeconds: 12,
        authorized: false,
      },
    };
  },
  computed: {
    heroMeta() {
      return [
        { label: "Estado", value: "Operativo" },
        { label: "Canal", value: "Pasivo" },
        { label: "Rutas", value: `${this.selectedPaths.length}` },
      ];
    },
    selectedPaths() {
      return this.form.pathsText
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    },
    canSubmit() {
      return this.form.authorized && Boolean(this.form.domain && this.selectedPaths.length);
    },
    resources() {
      return this.result?.resources || [];
    },
    emails() {
      return this.result?.emails || [];
    },
    phones() {
      return this.result?.phones || [];
    },
    urls() {
      return this.result?.urls || [];
    },
    findingCount() {
      return Number(this.result?.findings?.length || 0);
    },
  },
  watch: {
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
  mounted() {
    this.restoreState();
  },
  methods: {
    selectPreset(id) {
      this.form.preset = id;
      const preset = this.presets.find((item) => item.id === id);
      if (preset && id !== "custom") {
        this.form.pathsText = preset.paths.join("\n");
      }
    },
    async submit() {
      this.busy = true;
      this.error = "";
      try {
        this.result = await caligoApi.request("/api/osint/exposure/domain-contacts", {
          method: "POST",
          body: JSON.stringify({
            domain: this.form.domain,
            paths: this.selectedPaths,
            timeoutSeconds: this.form.timeoutSeconds,
            authorized: this.form.authorized,
          }),
        });
      } catch (error) {
        this.error = error.message || "No se pudieron extraer contactos del dominio";
      } finally {
        this.busy = false;
      }
    },
    clearState() {
      this.error = "";
      this.result = null;
      this.form = {
        domain: "",
        preset: "standard",
        pathsText: PRESETS[0].paths.join("\n"),
        timeoutSeconds: 12,
        authorized: false,
      };
      localStorage.removeItem(STORAGE_KEY);
    },
    restoreState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        this.form = { ...this.form, ...(state.form || {}), authorized: false };
        this.result = state.result || null;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    persistState() {
      const form = { ...this.form, authorized: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, result: this.result }));
    },
  },
};
</script>
