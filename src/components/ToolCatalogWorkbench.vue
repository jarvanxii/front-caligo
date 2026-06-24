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
            <strong>En desarrollo</strong>
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
              <dd>{{ serverStateLabel }}</dd>
            </div>
          </dl>
        </article>

        <article class="catalog-tool__panel catalog-tool__notice">
          <header>
            <span>Estado</span>
            <strong>Controles retirados</strong>
          </header>

          <div class="catalog-tool__notice-body">
            <span class="catalog-tool__notice-mark" aria-hidden="true">{{ tool.code }}</span>
            <div>
              <h2>Apartado en desarrollo</h2>
              <p>
                Esta pantalla todavía no ejecuta acciones reales desde Caligo. He quitado los campos
                y botones hasta que el conector del backend esté listo.
              </p>
            </div>
          </div>

          <dl class="catalog-tool__dev-status">
            <div>
              <dt>Programa</dt>
              <dd>{{ tool.command }}</dd>
            </div>
            <div>
              <dt>Conector</dt>
              <dd>Pendiente</dd>
            </div>
            <div>
              <dt>Inventario</dt>
              <dd>{{ serverStateLabel }}</dd>
            </div>
          </dl>

          <p class="catalog-tool__server-note">{{ serverHint }}</p>
        </article>
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
    };
  },
  computed: {
    tool() {
      return findCatalogTool(this.toolId) || {
        id: "unknown",
        label: "Herramienta",
        code: "LAB",
        moduleKey: "tools",
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
    versionLabel() {
      if (this.serverTool?.version) return this.serverTool.version;
      if (this.serverTool && !this.serverTool.installed) return "No detectada en servidor";
      return "Sin conector activo";
    },
    heroMeta() {
      return [
        { label: "Estado", value: "En desarrollo" },
        { label: "Programa", value: this.tool.command },
        { label: "Versión", value: this.versionLabel },
      ];
    },
    serverStateLabel() {
      if (!this.inventoryLoaded) return "Comprobando inventario";
      if (this.serverTool) return this.installed ? "Instalada" : "No detectada";
      return "Sin inventario específico";
    },
    serverHint() {
      if (!this.inventoryLoaded) return "Caligo está consultando el inventario del servidor.";
      if (this.serverTool?.installed) {
        return "El binario existe en el servidor. La vista se activará cuando tenga operativa real.";
      }
      if (this.serverTool) {
        return "Antes de activar esta pantalla hay que instalar o declarar el programa en el servidor.";
      }
      return "Esta herramienta aún no aparece en el inventario del backend.";
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
  },
};
</script>
