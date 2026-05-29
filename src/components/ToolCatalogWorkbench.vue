<template>
  <section class="catalog-tool" :class="`catalog-tool--${tool.moduleKey}`" aria-labelledby="catalog-tool-title">
    <div class="catalog-tool__shell">
      <ToolHeroHeader
        :tool="tool"
        :tool-id="tool.id"
        :title="tool.label"
        :eyebrow="`${tool.moduleLabel} / ${sectionLabel}`"
        :summary="tool.purpose"
        title-id="catalog-tool-title"
        :meta="heroMeta"
      />

      <section class="catalog-tool__control">
        <article class="catalog-tool__panel catalog-tool__panel--primary">
          <header>
            <span>Operativa</span>
            <strong>{{ tool.implemented ? "Conector activo" : "Conector pendiente" }}</strong>
          </header>

          <p>{{ tool.usage }}</p>

          <dl class="catalog-tool__facts">
            <div>
              <dt>Programa servidor</dt>
              <dd>{{ tool.command }}</dd>
            </div>
            <div>
              <dt>Ruta Caligo</dt>
              <dd>{{ tool.path }}</dd>
            </div>
            <div>
              <dt>Estado servidor</dt>
              <dd>{{ serverTool ? (installed ? "Instalada" : "No detectada") : "Sin inventario" }}</dd>
            </div>
          </dl>
        </article>

        <form class="catalog-tool__panel" @submit.prevent="simulateRun">
          <header>
            <span>Parámetros</span>
            <strong>{{ tool.code }}</strong>
          </header>

          <label>
            Objetivo o entrada autorizada
            <input v-model.trim="form.target" type="text" autocomplete="off" spellcheck="false" placeholder="dominio, IP, URL, fichero o hash" />
          </label>

          <label>
            Perfil de ejecución
            <select v-model="form.profile">
              <option value="safe">Seguro / pasivo</option>
              <option value="standard">Estándar</option>
              <option value="deep">Profundo controlado</option>
            </select>
          </label>

          <label>
            Notas de alcance
            <textarea v-model.trim="form.scope" rows="4" spellcheck="false" placeholder="Describe el laboratorio, cliente interno o rango autorizado."></textarea>
          </label>

          <label class="catalog-tool__switch">
            <input v-model="form.authorized" type="checkbox" />
            <span>Confirmo que el objetivo pertenece a un entorno autorizado.</span>
          </label>

          <button type="submit" :disabled="!canPrepareRun">
            Preparar ejecución
          </button>
        </form>
      </section>

      <section class="catalog-tool__panel catalog-tool__panel--wide">
        <header>
          <span>Plan de integración</span>
          <strong>{{ prepared ? "Listo para backend" : "Esperando parámetros" }}</strong>
        </header>

        <div class="catalog-tool__execution">
          <article>
            <span>Entrada esperada</span>
            <strong>{{ form.target || "Objetivo autorizado" }}</strong>
            <small>{{ form.scope || "Define alcance antes de activar ejecución real." }}</small>
          </article>
          <article>
            <span>Backend necesario</span>
            <strong>Endpoint JWT + job persistente</strong>
            <small>Validación de alcance, rate limit, redacción de secretos y salida normalizada.</small>
          </article>
          <article>
            <span>Persistencia</span>
            <strong>Vuex / job id</strong>
            <small>La vista conservará estado al navegar, igual que Nmap, OpenVAS e Hydra.</small>
          </article>
        </div>

        <pre>{{ commandPreview }}</pre>
      </section>
    </div>
  </section>
</template>

<script>
import { findCatalogTool } from "@/data/toolCatalog";
import { caligoApi } from "@/services/caligoApi";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

const sectionLabels = {
  dns: "DNS / Dominios",
  discovery: "Hosts / Puertos",
  webRecon: "Web Recon",
  snmpNetbios: "LAN",
  identity: "Identidad",
  usernames: "Usernames",
  contact: "Contacto",
  breaches: "Brechas",
  documents: "Documentos",
  validation: "Validación",
  webVuln: "Web",
  exploit: "Explotación",
  access: "Acceso",
  privesc: "PrivEsc",
  cracking: "Cracking",
  wordlists: "Wordlists",
  encoders: "Codificadores",
  crypto: "Cripto",
  analysis: "Análisis",
  metadata: "Metadatos",
  payloads: "Payloads",
  whoami: "WHOAMI",
  vpns: "VPNs",
  diagnostics: "Diagnóstico",
  traffic: "Tráfico",
  pivot: "Pivoting",
  wirelessWifi: "WiFi",
  bluetooth: "Bluetooth",
  disk: "Disco",
  memory: "Memoria",
  windowsForensics: "Windows",
  malware: "IOC",
  binaries: "Binarios",
  mobile: "Android",
  firmware: "Firmware",
  cloudAd: "AD / Cloud",
};

export default {
  name: "ToolCatalogWorkbench",
  components: {
    ToolHeroHeader,
  },
  props: {
    toolId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      serverTools: [],
      inventoryLoaded: false,
      prepared: false,
      form: {
        target: "",
        profile: "safe",
        scope: "",
        authorized: false,
      },
    };
  },
  computed: {
    tool() {
      return findCatalogTool(this.toolId) || {
        id: "unknown",
        label: "Herramienta",
        code: "LAB",
        moduleKey: "utilidades",
        moduleLabel: "Caligo",
        section: "diagnostics",
        command: "backend",
        purpose: "Herramienta no encontrada en el catálogo.",
        usage: "Vuelve al menú lateral y selecciona una herramienta registrada.",
        path: this.$route.path,
      };
    },
    sectionLabel() {
      return sectionLabels[this.tool.section] || this.tool.section;
    },
    serverTool() {
      const serverId = this.tool.serverId || this.tool.id;
      return this.serverTools.find((item) => item.id === serverId || item.binary === this.tool.command);
    },
    installed() {
      return Boolean(this.serverTool?.installed);
    },
    statusLabel() {
      if (this.tool.implemented) return "Operativo";
      if (!this.inventoryLoaded) return "Comprobando";
      return this.installed ? "Instalada" : "Planificada";
    },
    versionLabel() {
      if (this.serverTool?.version) return this.serverTool.version;
      if (this.serverTool && !this.serverTool.installed) return "No detectada en servidor";
      return this.tool.implemented ? "Endpoint funcional" : "Vista preparada";
    },
    heroMeta() {
      return [
        { label: "Estado", value: this.statusLabel },
        { label: "Programa", value: this.tool.command },
        { label: "Version", value: this.versionLabel },
      ];
    },
    canPrepareRun() {
      return Boolean(this.form.target && this.form.authorized);
    },
    commandPreview() {
      const payload = {
        tool: this.tool.id,
        command: this.tool.command,
        status: this.tool.implemented ? "implemented" : "planned",
        profile: this.form.profile,
        target: this.form.target || "<objetivo-autorizado>",
        scope: this.form.scope || "<alcance>",
        requiredBackend: {
          endpoint: this.tool.endpoint || `/api/catalog/${this.tool.id}/runs`,
          auth: "JWT",
          persistence: "job-id",
          safeguards: ["scope validation", "rate limit", "output redaction", "audit log"],
        },
      };
      return JSON.stringify(payload, null, 2);
    },
  },
  mounted() {
    this.loadInventory();
  },
  methods: {
    async loadInventory() {
      try {
        const payload = await caligoApi.request("/api/system/tools");
        this.serverTools = payload?.tools || [];
      } catch {
        this.serverTools = [];
      } finally {
        this.inventoryLoaded = true;
      }
    },
    simulateRun() {
      this.prepared = true;
    },
  },
};
</script>
