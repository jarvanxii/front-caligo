<template>
  <section class="password-lab password-lab--wordlists" aria-labelledby="wordlists-title">
    <div class="password-lab__shell">
      <header class="password-lab__header password-lab__header--compact">
        <div>
          <span class="eyebrow">Contraseñas / Diccionarios</span>
          <h1 id="wordlists-title">Wordlists</h1>
          <p>Inventario de listas permitidas en el servidor para auditorías offline y pruebas de laboratorio.</p>
        </div>

        <aside class="password-lab__engine is-ready">
          <span>Repositorio</span>
          <strong>{{ filteredWordlists.length }}</strong>
          <small>listas visibles</small>
        </aside>
      </header>

      <section class="password-results password-results--inventory">
        <header>
          <div>
            <span>Fuentes</span>
            <strong>{{ wordlists.length }} ficheros</strong>
          </div>
          <div class="wordlist-toolbar">
            <input v-model.trim="query" type="search" spellcheck="false" placeholder="Filtrar listas" />
            <button type="button" :disabled="loading" @click="loadWordlists">{{ loading ? "Cargando" : "Actualizar" }}</button>
          </div>
        </header>

        <p v-if="error" class="password-alert password-alert--error">{{ error }}</p>

        <div v-if="filteredWordlists.length" class="wordlist-grid">
          <article v-for="wordlist in filteredWordlists" :key="wordlist.path">
            <strong>{{ wordlist.label }}</strong>
            <code>{{ wordlist.path }}</code>
            <div>
              <span>{{ formatLines(wordlist.lineCount) }}</span>
              <small>{{ sizeLabel(wordlist.sizeBytes) }}</small>
            </div>
          </article>
        </div>
        <p v-else class="password-empty">No hay wordlists que coincidan con el filtro actual.</p>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";

export default {
  name: "WordlistInventory",
  data() {
    return {
      wordlists: [],
      query: "",
      loading: false,
      error: "",
    };
  },
  computed: {
    filteredWordlists() {
      const needle = this.query.toLowerCase();
      if (!needle) return this.wordlists;
      return this.wordlists.filter((item) => `${item.label} ${item.path}`.toLowerCase().includes(needle));
    },
  },
  mounted() {
    this.loadWordlists();
  },
  methods: {
    async ensureSession() {
      if (!this.$store.getters.isAuthenticated) {
        this.$router.push({ name: "login" });
        throw new Error("Inicia sesión para consultar wordlists");
      }
    },
    async loadWordlists() {
      this.error = "";
      this.loading = true;
      try {
        await this.ensureSession();
        this.wordlists = await caligoApi.request("/api/passwords/wordlists");
      } catch (error) {
        this.error = error.message || "No se pudo consultar el inventario";
      } finally {
        this.loading = false;
      }
    },
    formatLines(value) {
      const lines = Number(value || 0);
      return lines ? `${lines.toLocaleString("es-ES")} líneas` : "líneas no calculadas";
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
