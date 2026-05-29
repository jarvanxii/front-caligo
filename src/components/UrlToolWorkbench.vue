<template>
  <section
    id="module-overview"
    class="urls-workspace"
    :class="`urls-workspace--${tool.mode}`"
    aria-labelledby="url-tool-title"
  >
    <div class="urls-workspace__hero urls-workspace__hero--tool">
      <ToolHeroHeader
        :tool-id="catalogToolId"
        :tool="tool"
        :title="tool.title"
        :eyebrow="tool.eyebrow"
        :summary="tool.summary"
        title-id="url-tool-title"
        :logo-tools="heroLogos"
        :meta="heroMeta"
      />
      <form class="urls-console" @submit.prevent="runTool">
        <template v-if="!tool.noTarget">
          <label for="url-target">Objetivo</label>
          <div class="urls-console__input">
            <input
              id="url-target"
              v-model.trim="target"
              type="text"
              placeholder="https://example.com"
              autocomplete="off"
              spellcheck="false"
            />
            <button type="submit" :disabled="loading">{{ loading ? "Ejecutando" : tool.buttonLabel }}</button>
          </div>

          <label class="urls-toggle">
            <input v-model="allowPrivateNetworks" type="checkbox" />
            <span>Permitir rangos privados para laboratorio local</span>
          </label>
        </template>

        <button v-else type="submit" :disabled="loading">{{ loading ? "Actualizando" : tool.buttonLabel }}</button>
        <p v-if="error" class="urls-console__error">{{ error }}</p>
      </form>
    </div>

    <section v-if="result && tool.mode === 'analysis'" class="urls-score">
      <div>
        <span>Score</span>
        <strong :class="`urls-score__value urls-score__value--${result.verdictTone}`">{{ result.score }}/100</strong>
      </div>
      <div>
        <span>Veredicto</span>
        <strong>{{ result.verdict }}</strong>
      </div>
      <div>
        <span>HTTP</span>
        <strong>{{ result.http?.status || "N/D" }}</strong>
      </div>
      <div>
        <span>TLS</span>
        <strong>{{ result.tls?.validNow ? "Válido" : "Revisar" }}</strong>
      </div>
    </section>

    <section v-if="result?.normalized" class="urls-panel">
      <header class="urls-panel__header">
        <span>URL</span>
        <h2>Objetivo normalizado</h2>
      </header>
      <div class="urls-kv-grid">
        <article v-for="item in normalizedRows" :key="item.label">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
      <div v-if="result.normalized.indicators?.length" class="urls-chipline">
        <span v-for="indicator in result.normalized.indicators" :key="indicator.code" :class="`urls-chip urls-chip--${indicator.tone}`">
          {{ indicator.label }}
        </span>
      </div>
    </section>

    <section v-if="hasDns" class="urls-panel">
      <header class="urls-panel__header">
        <span>DNS</span>
        <h2>Registros DNS</h2>
      </header>
      <div class="urls-dns-grid">
        <article v-for="item in dnsSections" :key="item.key" class="urls-dns-card">
          <span>{{ item.label }}</span>
          <strong>{{ recordsFor(item.key).length }}</strong>
          <p>{{ shortRecords(item.key) }}</p>
        </article>
      </div>
    </section>

    <section v-if="result?.http || securityChecks.length" class="urls-panel">
      <header class="urls-panel__header">
        <span>HTTP</span>
        <h2>Respuesta y cabeceras</h2>
      </header>
      <div v-if="result.http" class="urls-split">
        <article class="urls-subpanel">
          <span>Status</span>
          <strong>{{ result.http.status || "N/D" }}</strong>
          <p>{{ result.http.finalUrl || result.http.error }}</p>
        </article>
        <article class="urls-subpanel">
          <span>Redirecciones</span>
          <strong>{{ result.http.redirects?.length || 0 }}</strong>
          <p>{{ redirectSummary }}</p>
        </article>
      </div>
      <div v-if="securityChecks.length" class="urls-checks">
        <article v-for="check in securityChecks" :key="check.code" :class="{ 'is-passed': check.passed }">
          <span>{{ check.passed ? "OK" : "REV" }}</span>
          <strong>{{ check.label }}</strong>
          <p>{{ check.note }}</p>
        </article>
      </div>
      <div v-if="headers.length" class="urls-table">
        <div v-for="header in headers" :key="header.name">
          <span>{{ header.name }}</span>
          <strong>{{ header.values.join(', ') }}</strong>
        </div>
      </div>
    </section>

    <section v-if="result?.tls" class="urls-panel">
      <header class="urls-panel__header">
        <span>TLS</span>
        <h2>Certificado</h2>
      </header>
      <div class="urls-kv-grid">
        <article>
          <span>Estado</span>
          <strong>{{ result.tls.success ? "Handshake correcto" : "No disponible" }}</strong>
        </article>
        <article>
          <span>Validez</span>
          <strong>{{ result.tls.validNow ? "Válido" : "Revisar" }}</strong>
        </article>
        <article>
          <span>Expira</span>
          <strong>{{ result.tls.notAfter || result.tls.error || "N/D" }}</strong>
        </article>
        <article>
          <span>Emisor</span>
          <strong>{{ result.tls.issuer || "N/D" }}</strong>
        </article>
      </div>
      <p v-if="result.tls.sha256" class="urls-fingerprint">{{ result.tls.sha256 }}</p>
    </section>

    <section v-if="reputationCards.length" class="urls-panel">
      <header class="urls-panel__header">
        <span>REP</span>
        <h2>Reputación</h2>
      </header>
      <div class="urls-card-grid">
        <article v-for="card in reputationCards" :key="card.name" class="urls-subpanel">
          <span>{{ card.name }}</span>
          <strong>{{ card.status }}</strong>
          <p>{{ card.note }}</p>
        </article>
      </div>
    </section>

    <section v-if="result?.history" class="urls-panel">
      <header class="urls-panel__header">
        <span>HST</span>
        <h2>Historial público</h2>
      </header>
      <div class="urls-card-grid">
        <article class="urls-subpanel">
          <span>RDAP</span>
          <strong>{{ result.history.rdap?.success ? "Visible" : "Sin datos" }}</strong>
          <p>{{ result.history.rdap?.ldhName || result.history.rdap?.error || "Registro público." }}</p>
        </article>
        <article class="urls-subpanel">
          <span>crt.sh</span>
          <strong>{{ result.history.certificateTransparency?.count || 0 }}</strong>
          <p>Subdominios derivados de Certificate Transparency.</p>
        </article>
        <article class="urls-subpanel">
          <span>Wayback</span>
          <strong>{{ result.history.wayback?.count || 0 }}</strong>
          <p>Capturas históricas recuperadas.</p>
        </article>
      </div>
    </section>

    <section v-if="publicFileRows.length" class="urls-panel">
      <header class="urls-panel__header">
        <span>PUB</span>
        <h2>Archivos públicos</h2>
      </header>
      <div class="urls-card-grid">
        <article v-for="file in publicFileRows" :key="file.key" class="urls-subpanel">
          <span>{{ file.key }}</span>
          <strong>{{ file.value.success ? "Visible" : "No recuperado" }}</strong>
          <p>{{ file.value.url }}</p>
        </article>
      </div>
    </section>

    <section v-if="endpointRows.length || result?.endpoints" class="urls-panel">
      <header class="urls-panel__header">
        <span>END</span>
        <h2>Endpoints pasivos</h2>
      </header>
      <div v-if="endpointRows.length" class="urls-table">
        <div v-for="item in endpointRows" :key="item.url">
          <span>{{ item.source }}</span>
          <strong>{{ item.url }}</strong>
        </div>
      </div>
      <p v-else class="urls-empty">No hay HTML analizado o no se encontraron endpoints en la muestra.</p>
    </section>

    <section v-if="toolRows.length" class="urls-panel">
      <header class="urls-panel__header">
        <span>CLI</span>
        <h2>Herramientas locales</h2>
      </header>
      <div class="urls-tool-grid">
        <article v-for="toolItem in toolRows" :key="toolItem.name" :class="{ 'is-installed': toolItem.installed }">
          <span>{{ toolItem.group }}</span>
          <strong>{{ toolItem.name }}</strong>
          <p>{{ toolItem.installed ? toolItem.path : "No detectada en PATH" }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { urlTools } from "@/data/urlTools";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

const URL_TOOL_LOGOS = {
  intelligent: ["caligo-intel", "httpx", "testssl", "gau"],
  dns: ["caligo-intel", "dnsrecon", "dnsenum"],
  inspector: ["caligo-intel", "httpx"],
  http: ["httpx", "whatweb", "wafw00f"],
  tls: ["testssl", "openssl"],
  reputation: ["caligo-intel", "urlhaus"],
  history: ["gau", "waybackurls"],
  publicFiles: ["httpx", "katana"],
  endpoints: ["katana", "gau"],
  localTools: ["caligo-intel"],
};

const URL_CATALOG_TOOL = {
  intelligent: "caligo-intel",
  dns: "caligo-intel",
  inspector: "caligo-intel",
  http: "caligo-intel",
  tls: "caligo-intel",
  reputation: "caligo-intel",
  history: "caligo-intel",
  publicFiles: "caligo-intel",
  endpoints: "caligo-intel",
  localTools: "caligo-intel",
};

export default {
  name: "UrlToolWorkbench",
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
      target: "https://example.com",
      allowPrivateNetworks: false,
      loading: false,
      error: "",
      result: null,
      dnsSections: [
        { key: "a", label: "A" },
        { key: "aaaa", label: "AAAA" },
        { key: "cname", label: "CNAME" },
        { key: "mx", label: "MX" },
        { key: "ns", label: "NS" },
        { key: "txt", label: "TXT" },
        { key: "caa", label: "CAA" },
      ],
    };
  },
  computed: {
    tool() {
      return urlTools[this.toolKey];
    },
    catalogToolId() {
      return URL_CATALOG_TOOL[this.toolKey] || "caligo-intel";
    },
    heroLogos() {
      return URL_TOOL_LOGOS[this.toolKey] || [this.catalogToolId];
    },
    heroMeta() {
      return [
        { label: "Modo", value: this.tool.mode },
        { label: "Entrada", value: this.tool.noTarget ? "Inventario" : "URL / dominio" },
        { label: "Salida", value: this.tool.facts?.[1]?.[1] || "Informe" },
      ];
    },
    normalizedRows() {
      const normalized = this.result?.normalized;
      if (!normalized) return [];
      return [
        ["URL", normalized.url],
        ["Origen", normalized.origin],
        ["Host", normalized.host],
        ["Puerto", normalized.port],
        ["Ruta", normalized.path],
      ].map(([label, value]) => ({ label, value: value || "N/D" }));
    },
    hasDns() {
      return Boolean(this.result?.dns);
    },
    headers() {
      return (this.result?.http?.headers || []).slice(0, 18);
    },
    securityChecks() {
      return this.result?.security?.checks || [];
    },
    redirectSummary() {
      const redirects = this.result?.http?.redirects || [];
      if (!redirects.length) return "Sin cadena de redirección.";
      return redirects.map((item) => `${item.status} -> ${item.to}`).join(" | ");
    },
    reputationCards() {
      const reputation = this.result?.reputation;
      if (!reputation) return [];
      return [
        this.reputationCard("URLHaus", reputation.urlhaus, this.urlHausNote(reputation.urlhaus)),
        this.reputationCard("urlscan.io", reputation.urlscan, `${reputation.urlscan?.total || 0} resultados públicos`),
        this.reputationCard("VirusTotal", reputation.virustotal, this.integrationNote(reputation.virustotal)),
        this.reputationCard("AbuseIPDB", reputation.abuseIpDb, this.integrationNote(reputation.abuseIpDb)),
        this.reputationCard("Safe Browsing", reputation.safeBrowsing, this.integrationNote(reputation.safeBrowsing)),
      ];
    },
    publicFileRows() {
      const files = this.result?.publicFiles || {};
      return Object.entries(files).map(([key, value]) => ({ key, value }));
    },
    endpointRows() {
      const endpoints = this.result?.endpoints || {};
      return [
        ...(endpoints.links || []),
        ...(endpoints.scripts || []),
        ...(endpoints.forms || []),
      ].slice(0, 80);
    },
    toolRows() {
      return this.result?.tools || [];
    },
  },
  watch: {
    toolKey: {
      immediate: true,
      handler() {
        this.result = null;
        this.error = "";
        if (this.tool?.noTarget) {
          this.runTool();
        }
      },
    },
  },
  methods: {
    async ensureSession() {
      if (this.$store.getters.isPortfolioMode) {
        throw new Error("Modo portfolio activo: inicia sesión con credenciales para ejecutar herramientas.");
      }
      if (!this.$store.getters.hasAppAccess) {
        this.$router.push({ name: "login" });
        throw new Error("Inicia sesión para ejecutar herramientas");
      }
    },
    async runTool() {
      this.loading = true;
      this.error = "";
      try {
        await this.ensureSession();
        if (this.tool.noTarget) {
          this.result = await caligoApi.request(this.tool.endpoint);
        } else {
          this.result = await caligoApi.request(this.tool.endpoint, {
            method: "POST",
            body: JSON.stringify({
              target: this.target,
              allowPrivateNetworks: this.allowPrivateNetworks,
            }),
          });
        }
      } catch (error) {
        this.error = error.message || "No se pudo ejecutar la herramienta";
      } finally {
        this.loading = false;
      }
    },
    recordsFor(key) {
      return this.result?.dns?.[key]?.records || [];
    },
    shortRecords(key) {
      const records = this.recordsFor(key).map((item) => item.data);
      if (!records.length) return "Sin registros visibles.";
      return records.slice(0, 3).join(" | ");
    },
    reputationCard(name, source, note) {
      return {
        name,
        status: source?.success ? "Activo" : source?.status || "Sin datos",
        note: note || source?.error || "Fuente consultada por el backend.",
      };
    },
    urlHausNote(source) {
      const status = source?.raw?.query_status;
      if (status === "ok") return "Coincidencia encontrada. Revisar inmediatamente.";
      if (status === "no_results") return "Sin coincidencias en URLHaus.";
      return source?.error || "Consulta URLHaus ejecutada.";
    },
    integrationNote(source) {
      if (!source) return "Sin respuesta.";
      if (source.status === "not_configured") return `${source.envVar} no configurada.`;
      if (source.success) return "Fuente consultada correctamente.";
      return source.error || source.message || "No disponible.";
    },
  },
};
</script>
