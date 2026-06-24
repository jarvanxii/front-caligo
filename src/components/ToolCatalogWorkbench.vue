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
            <strong>Conector pendiente</strong>
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
            <span>En desarrollo</span>
            <strong>Formulario desactivado</strong>
          </header>

          <div class="catalog-tool__notice-body">
            <span class="catalog-tool__notice-mark" aria-hidden="true">{{ tool.code }}</span>
            <div>
              <h2>Este apartado todavía no funciona desde Caligo.</h2>
              <p>
                La herramienta está registrada en el catálogo, pero aún no tiene un conector operativo,
                validaciones de alcance ni job persistente en el backend. Para evitar falsas expectativas,
                el formulario queda apagado hasta completar esa integración.
              </p>
            </div>
          </div>

          <dl class="catalog-tool__dev-status">
            <div>
              <dt>Conector</dt>
              <dd>Pendiente</dd>
            </div>
            <div>
              <dt>Servidor</dt>
              <dd>{{ serverStateLabel }}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section class="catalog-tool__panel catalog-tool__panel--wide">
        <header>
          <span>Plan de integración</span>
          <strong>Bloqueado hasta backend</strong>
        </header>

        <div class="catalog-tool__execution">
          <article>
            <span>Estado visible</span>
            <strong>Desarrollo activo</strong>
            <small>El usuario ve una explicación clara en lugar de un formulario que no ejecuta nada real.</small>
          </article>
          <article>
            <span>Backend necesario</span>
            <strong>Endpoint JWT + job persistente</strong>
            <small>Validación de alcance, rate limit, redacción de secretos y salida normalizada.</small>
          </article>
          <article>
            <span>Programa servidor</span>
            <strong>{{ serverStateLabel }}</strong>
            <small>{{ serverHint }}</small>
          </article>
        </div>

        <ol class="catalog-tool__roadmap" aria-label="Siguientes pasos técnicos">
          <li v-for="item in roadmapItems" :key="item.title">
            <span>{{ item.step }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.copy }}</p>
            </div>
          </li>
        </ol>
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
        return "El binario existe en el servidor, pero falta exponerlo con una operativa segura.";
      }
      if (this.serverTool) {
        return "Primero habrá que instalarlo o declararlo correctamente antes de crear la ejecución.";
      }
      return "Esta herramienta aún no está mapeada en el inventario técnico del backend.";
    },
    roadmapItems() {
      return [
        {
          step: "01",
          title: "Contrato de ejecución",
          copy: `Definir /api/catalog/${this.tool.id}/runs o moverla a un módulo operativo existente.`,
        },
        {
          step: "02",
          title: "Guardarraíles",
          copy: "Añadir alcance autorizado, límites de intensidad, auditoría y salida sin secretos.",
        },
        {
          step: "03",
          title: "Interfaz real",
          copy: "Reactivar el formulario sólo cuando el job, historial y errores estén conectados al backend.",
        },
      ];
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
