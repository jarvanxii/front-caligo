<template>
  <section class="osint-workbench osint-interface osint-interface--people" aria-labelledby="caligo-people-title">
    <div class="osint-workbench__shell">
      <ToolHeroHeader
        tool-id="caligo-people"
        title="Caligo People"
        eyebrow="OSINT / Identidad pública"
        summary="Correlación pasiva de nombre real, alias, LinkedIn y redes indexadas. Caligo genera consultas trazables y candidatos priorizados para validación manual."
        title-id="caligo-people-title"
        :logo-tools="['caligo-people', 'sherlock', 'maigret']"
        :meta="heroMeta"
      />

      <div class="osint-interface__grid osint-interface__grid--people">
        <form class="osint-panel osint-interface__control" @submit.prevent="submit">
          <header>
            <span>Consulta</span>
            <strong>backend-http</strong>
          </header>

          <label>
            Nombre, alias o identidad pública
            <input v-model.trim="form.query" type="text" autocomplete="off" spellcheck="false" placeholder="Nombre Apellido" />
          </label>

          <label>
            Pista de contexto
            <input v-model.trim="form.locationHint" type="text" autocomplete="off" spellcheck="false" placeholder="Empresa, ciudad, sector..." />
          </label>

          <div class="osint-interface__platforms">
            <button
              v-for="platform in availablePlatforms"
              :key="platform"
              type="button"
              :class="{ 'is-active': form.platforms.includes(platform) }"
              @click="togglePlatform(platform)"
            >
              <span>{{ platformLabel(platform) }}</span>
            </button>
          </div>

          <label class="osint-interface__range">
            Resultados máximos
            <input v-model.number="form.maxResults" type="range" min="3" max="40" />
            <strong>{{ form.maxResults }}</strong>
          </label>

          <button type="submit" :disabled="busy || !canSubmit">
            {{ busy ? "Buscando" : "Buscar perfiles" }}
          </button>
          <p v-if="error" class="osint-error">{{ error }}</p>
        </form>

        <section class="osint-panel osint-interface__status">
          <header>
            <span>Señales</span>
            <strong>{{ result ? candidateCount : "READY" }}</strong>
          </header>

          <div class="osint-interface__metric-grid">
            <article>
              <span>Target</span>
              <strong>{{ form.query || "sin consulta" }}</strong>
            </article>
            <article>
              <span>Plataformas</span>
              <strong>{{ form.platforms.length }}</strong>
            </article>
            <article>
              <span>Candidatos</span>
              <strong>{{ candidateCount }}</strong>
            </article>
            <article>
              <span>Motor</span>
              <strong>DuckDuckGo</strong>
            </article>
          </div>

          <p class="osint-hint">
            La coincidencia de nombre no atribuye identidad. La vista prioriza señales públicas y deja enlaces directos para revisión humana.
          </p>
        </section>
      </div>

      <section class="osint-panel osint-interface__results">
        <header>
          <span>Candidatos priorizados</span>
          <strong>{{ candidateCount }} hallazgos</strong>
        </header>

        <div v-if="profileCandidates.length" class="osint-interface__candidate-list">
          <article v-for="candidate in profileCandidates" :key="candidate.url">
            <div class="osint-interface__score" :style="scoreStyle(candidate.score)">
              <strong>{{ candidate.score || 0 }}</strong>
              <span>%</span>
            </div>
            <div>
              <span>{{ platformLabel(candidate.platform) }} / {{ candidate.source || "index" }}</span>
              <strong>{{ candidate.title || candidate.url }}</strong>
              <a :href="candidate.url" target="_blank" rel="noreferrer">{{ candidate.url }}</a>
            </div>
          </article>
        </div>

        <div v-else class="osint-interface__empty">
          <strong>{{ result ? "Sin candidatos sólidos" : "Esperando consulta" }}</strong>
          <span>Introduce una identidad pública y selecciona plataformas para generar candidatos verificables.</span>
        </div>
      </section>

      <section class="osint-panel osint-interface__results" v-if="searchQueries.length">
        <header>
          <span>Consultas reproducibles</span>
          <strong>{{ searchQueries.length }}</strong>
        </header>
        <div class="osint-interface__query-grid">
          <a v-for="query in searchQueries" :key="query.url" :href="query.url" target="_blank" rel="noreferrer">
            <span>{{ platformLabel(query.platform) }}</span>
            <strong>{{ query.query }}</strong>
          </a>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";
import { caligoApi } from "@/services/caligoApi";

const STORAGE_KEY = "caligo.osint.caligoPeople";
const DEFAULT_PLATFORMS = ["linkedin", "github", "x", "instagram", "facebook", "tiktok"];
const PLATFORM_LABELS = {
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X",
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  reddit: "Reddit",
  youtube: "YouTube",
  medium: "Medium",
};

export default {
  name: "ProfileSearchView",
  components: {
    ToolHeroHeader,
  },
  data() {
    return {
      busy: false,
      error: "",
      capabilities: null,
      result: null,
      form: {
        query: "",
        locationHint: "",
        platforms: [...DEFAULT_PLATFORMS],
        maxResults: 18,
      },
    };
  },
  computed: {
    availablePlatforms() {
      return this.capabilities?.platforms || ["linkedin", "github", "x", "instagram", "facebook", "tiktok", "reddit", "youtube", "medium"];
    },
    toolCapability() {
      return (this.capabilities?.tools || []).find((item) => item.id === "profile-search") || {};
    },
    heroMeta() {
      return [
        { label: "Estado", value: "Operativo" },
        { label: "Motor", value: this.toolCapability.version || "server-side-search" },
        { label: "Cobertura", value: `${this.availablePlatforms.length} plataformas` },
      ];
    },
    canSubmit() {
      return Boolean(this.form.query && this.form.platforms.length);
    },
    profileCandidates() {
      return this.result?.candidates || [];
    },
    candidateCount() {
      return Number(this.result?.candidateCount || this.profileCandidates.length || 0);
    },
    searchQueries() {
      return this.result?.queries || [];
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
    this.loadCapabilities();
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
      this.busy = true;
      this.error = "";
      try {
        this.result = await caligoApi.request("/api/osint/profile-search/search", {
          method: "POST",
          body: JSON.stringify({
            query: this.form.query,
            locationHint: this.form.locationHint,
            platforms: this.form.platforms,
            maxResults: this.form.maxResults,
          }),
        });
      } catch (error) {
        this.error = error.message || "No se pudo ejecutar Caligo People";
      } finally {
        this.busy = false;
      }
    },
    togglePlatform(platform) {
      const current = new Set(this.form.platforms);
      if (current.has(platform)) {
        current.delete(platform);
      } else {
        current.add(platform);
      }
      this.form.platforms = [...current];
    },
    platformLabel(platform) {
      return PLATFORM_LABELS[platform] || String(platform || "OSINT").toUpperCase();
    },
    scoreStyle(score) {
      const value = Math.max(0, Math.min(100, Number(score || 0)));
      return {
        "--score": `${value}%`,
      };
    },
    restoreState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        this.form = { ...this.form, ...(state.form || {}) };
        this.result = state.result || null;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    persistState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form: this.form, result: this.result }));
    },
  },
};
</script>
