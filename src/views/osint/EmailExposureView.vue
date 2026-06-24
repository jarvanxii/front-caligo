<template>
  <section class="osint-workbench osint-interface osint-interface--email" aria-labelledby="email-exposure-title">
    <div class="osint-workbench__shell">
      <ToolHeroHeader
        tool-id="email-exposure"
        title="Email Exposure"
        eyebrow="OSINT / Contacto"
        summary="Validación pasiva de formato, dominio, MX y patrones corporativos. Útil para mapear superficie pública sin verificar buzones ni tocar cuentas."
        title-id="email-exposure-title"
        :logo-tools="['email-exposure', 'holehe', 'theharvester']"
        :meta="heroMeta"
      />

      <div class="osint-interface__grid">
        <form class="osint-panel osint-interface__control" @submit.prevent="submit">
          <header>
            <span>Entrada</span>
            <strong>backend-http</strong>
          </header>

          <label>
            Email objetivo
            <input v-model.trim="form.email" type="email" autocomplete="off" spellcheck="false" placeholder="nombre@empresa.com" />
          </label>

          <div class="osint-interface__split">
            <label>
              Nombre completo
              <input v-model.trim="form.fullName" type="text" autocomplete="off" spellcheck="false" placeholder="Nombre Apellido" />
            </label>
            <label>
              Dominio
              <input v-model.trim="form.domain" type="text" autocomplete="off" spellcheck="false" placeholder="empresa.com" />
            </label>
          </div>

          <label class="osint-switch">
            <input v-model="form.generateCandidates" type="checkbox" />
            <span>Generar candidatos profesionales desde nombre + dominio</span>
          </label>

          <label class="osint-switch osint-interface__scope">
            <input v-model="form.authorized" type="checkbox" />
            <span>Confirmo que el email, dominio o identidad pertenece a un alcance autorizado.</span>
          </label>

          <button type="submit" :disabled="busy || !canSubmit">
            {{ busy ? "Analizando" : "Analizar exposición" }}
          </button>
          <button v-if="result || error" class="osint-interface__ghost" type="button" @click="clearState">Limpiar</button>
          <p v-if="error" class="osint-error">{{ error }}</p>
        </form>

        <section class="osint-panel osint-interface__status">
          <header>
            <span>Modelo</span>
            <strong>{{ result ? "READY" : "WAIT" }}</strong>
          </header>

          <div class="osint-interface__metric-grid">
            <article>
              <span>Dominio</span>
              <strong>{{ result?.domain || derivedDomain || "N/D" }}</strong>
            </article>
            <article>
              <span>MX</span>
              <strong>{{ mxRecords.length }}</strong>
            </article>
            <article>
              <span>Candidatos</span>
              <strong>{{ candidates.length }}</strong>
            </article>
            <article>
              <span>Scope</span>
              <strong>{{ form.authorized ? "OK" : "Pendiente" }}</strong>
            </article>
          </div>

          <p class="osint-hint">
            Esta vista no ejecuta SMTP VRFY, no prueba login y no consulta APIs de pago. Solo transforma datos aportados y señales públicas.
          </p>
        </section>
      </div>

      <section class="osint-panel osint-interface__results">
        <header>
          <span>Resultado técnico</span>
          <strong>{{ result ? `${findingCount} señales` : "Sin ejecución" }}</strong>
        </header>

        <div v-if="result" class="osint-interface__evidence-grid">
          <article>
            <span>Registros MX</span>
            <div class="osint-interface__tag-list">
              <strong v-for="mx in mxRecords" :key="mx">{{ mx }}</strong>
              <small v-if="!mxRecords.length">No localizados</small>
            </div>
          </article>

          <article>
            <span>Patrones generados</span>
            <div class="osint-interface__tag-list osint-interface__tag-list--wrap">
              <strong v-for="candidate in candidates" :key="candidate">{{ candidate }}</strong>
              <small v-if="!candidates.length">Sin candidatos</small>
            </div>
          </article>
        </div>

        <div v-if="findings.length" class="osint-interface__finding-list">
          <article v-for="(finding, index) in findings" :key="`${finding.type}-${index}`">
            <span>{{ finding.source || finding.type }}</span>
            <strong>{{ finding.value }}</strong>
            <small>{{ finding.evidence }}</small>
          </article>
        </div>

        <div v-if="queries.length" class="osint-interface__query-grid">
          <a v-for="query in queries" :key="query.url" :href="query.url" target="_blank" rel="noreferrer">
            <span>{{ query.platform }}</span>
            <strong>{{ query.query }}</strong>
          </a>
        </div>

        <div v-if="recommendations.length" class="osint-interface__notes">
          <strong>Notas operativas</strong>
          <p v-for="note in recommendations" :key="note">{{ note }}</p>
        </div>

        <div v-if="!result" class="osint-interface__empty">
          <strong>Preparado para consulta pasiva</strong>
          <span>Introduce un email o combina nombre completo y dominio para obtener MX, patrones y búsquedas reproducibles.</span>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";
import { caligoApi } from "@/services/caligoApi";

const STORAGE_KEY = "caligo.osint.emailExposure";

export default {
  name: "EmailExposureView",
  components: {
    ToolHeroHeader,
  },
  data() {
    return {
      busy: false,
      error: "",
      result: null,
      form: {
        email: "",
        fullName: "",
        domain: "",
        generateCandidates: true,
        authorized: false,
      },
    };
  },
  computed: {
    heroMeta() {
      return [
        { label: "Estado", value: "Operativo" },
        { label: "Canal", value: "Pasivo" },
        { label: "Proveedor", value: "DNS + HTTP" },
      ];
    },
    derivedDomain() {
      if (this.form.email.includes("@")) {
        return this.form.email.split("@").pop();
      }
      return this.form.domain;
    },
    canSubmit() {
      return this.form.authorized && Boolean(this.form.email || this.form.domain);
    },
    mxRecords() {
      return this.result?.mxRecords || [];
    },
    candidates() {
      return this.result?.candidates || [];
    },
    findings() {
      return this.result?.findings || [];
    },
    queries() {
      return this.result?.queries || [];
    },
    recommendations() {
      return this.result?.recommendations || [];
    },
    findingCount() {
      return this.findings.length;
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
    async submit() {
      this.busy = true;
      this.error = "";
      try {
        this.result = await caligoApi.request("/api/osint/exposure/email", {
          method: "POST",
          body: JSON.stringify({ ...this.form }),
        });
      } catch (error) {
        this.error = error.message || "No se pudo analizar la exposición de email";
      } finally {
        this.busy = false;
      }
    },
    clearState() {
      this.error = "";
      this.result = null;
      this.form = {
        email: "",
        fullName: "",
        domain: "",
        generateCandidates: true,
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
