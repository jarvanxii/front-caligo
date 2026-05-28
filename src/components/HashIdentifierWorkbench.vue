<template>
  <section class="password-lab password-lab--identifier" aria-labelledby="hash-id-title">
    <div class="password-lab__shell">
      <header class="password-lab__header password-lab__header--compact">
        <div>
          <span class="eyebrow">Contraseñas / Fingerprint</span>
          <h1 id="hash-id-title">Identificador de hashes</h1>
          <p>Clasifica formatos probables con hashID y heurísticas locales antes de lanzar John o Hashcat.</p>
        </div>

        <aside class="password-lab__engine" :class="{ 'is-ready': engineReady }">
          <span>hashID</span>
          <strong>{{ engineReady ? "Operativo" : "Fallback" }}</strong>
          <small>{{ engineMessage }}</small>
        </aside>
      </header>

      <div class="password-lab__grid password-lab__grid--identifier">
        <form class="password-console" @submit.prevent="identify">
          <header>
            <span>Entrada</span>
            <strong>HASH</strong>
          </header>

          <label>
            Hash o muestra
            <textarea v-model.trim="hash" rows="7" spellcheck="false" placeholder="5f4dcc3b5aa765d61d8327deb882cf99"></textarea>
          </label>

          <button type="submit" :disabled="loading || !hash">
            {{ loading ? "Analizando" : "Identificar" }}
          </button>

          <p v-if="error" class="password-alert password-alert--error">{{ error }}</p>
          <p v-else-if="capabilityError" class="password-alert">{{ capabilityError }}</p>
        </form>

        <section class="password-run">
          <header>
            <span>Resultado</span>
            <strong>{{ candidates.length }} candidato{{ candidates.length === 1 ? "" : "s" }}</strong>
          </header>

          <div v-if="candidates.length" class="hash-candidates">
            <article v-for="candidate in candidates" :key="`${candidate.name}-${candidate.hint || ''}`">
              <strong>{{ candidate.name }}</strong>
              <small>{{ candidate.hint || "Detectado por hashID" }}</small>
            </article>
          </div>
          <p v-else class="password-empty">Pega un hash para obtener formatos probables y pistas de ejecución.</p>

          <div v-if="result?.output" class="password-log">
            <span>Salida hashID</span>
            <pre>{{ result.output }}</pre>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";

export default {
  name: "HashIdentifierWorkbench",
  data() {
    return {
      capabilities: null,
      capabilityError: "",
      error: "",
      loading: false,
      hash: "5f4dcc3b5aa765d61d8327deb882cf99",
      result: null,
    };
  },
  computed: {
    toolInfo() {
      return (this.capabilities?.tools || []).find((item) => item.id === "hashid") || null;
    },
    engineReady() {
      return Boolean(this.toolInfo?.available);
    },
    engineMessage() {
      if (!this.capabilities) return "Comprobando hashID";
      return this.toolInfo?.version || "Heurísticas locales disponibles";
    },
    candidates() {
      const seen = new Set();
      return [...(this.result?.candidates || []), ...(this.result?.heuristics || [])].filter((item) => {
        const key = `${item.name}-${item.hint || ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
  },
  mounted() {
    this.loadCapabilities();
  },
  methods: {
    async ensureSession() {
      if (!this.$store.getters.isAuthenticated) {
        this.$router.push({ name: "login" });
        throw new Error("Inicia sesión para ejecutar herramientas");
      }
    },
    async loadCapabilities() {
      try {
        await this.ensureSession();
        this.capabilities = await caligoApi.request("/api/passwords/capabilities");
      } catch (error) {
        this.capabilityError = error.message || "No se pudo consultar hashID";
      }
    },
    async identify() {
      this.error = "";
      this.loading = true;
      try {
        await this.ensureSession();
        this.result = await caligoApi.request("/api/passwords/identify", {
          method: "POST",
          body: JSON.stringify({ hash: this.hash }),
        });
      } catch (error) {
        this.error = error.message || "No se pudo identificar el hash";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
