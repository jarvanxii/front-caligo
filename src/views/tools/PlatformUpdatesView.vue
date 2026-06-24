<template>
  <section class="platform-settings platform-updates-page" aria-labelledby="platform-updates-title">
    <header class="platform-settings__hero">
      <div>
        <span class="platform-settings__eyebrow">Caligo // servidor</span>
        <h1 id="platform-updates-title">Inventario y actualizaciones</h1>
        <p>
          Versiones detectadas en el servidor, herramientas planificadas y mantenimiento
          controlado desde endpoints tokenizados.
        </p>
      </div>
      <aside class="platform-settings__status" aria-live="polite">
        <span>Estado</span>
        <strong>{{ installedToolCount }} / {{ updateToolRows.length }}</strong>
        <small v-if="serverToolsGeneratedAt">lectura {{ formattedGeneratedAt }}</small>
        <small v-else>inventario pendiente</small>
      </aside>
    </header>

    <div class="platform-updates-page__console">
      <span>{{ installedToolCount }} detectadas</span>
      <span>{{ plannedToolCount }} planificadas</span>
      <span>{{ updateToolRows.length }} registradas</span>
      <button type="button" :disabled="serverToolsLoading" @click="loadServerTools">
        {{ serverToolsLoading ? "Leyendo..." : "Refrescar inventario" }}
      </button>
    </div>

    <section class="platform-updates-page__toolbar" aria-label="Filtros de inventario">
      <label>
        <span>Filtrar</span>
        <input v-model.trim="serverToolFilter" type="search" placeholder="Hydra, Metasploit, Nmap..." />
      </label>

      <div class="platform-updates-page__filters">
        <button type="button" :class="{ 'is-active': activeToolGroup === 'all' }" @click="activeToolGroup = 'all'">
          Todas
        </button>
        <button
          v-for="group in toolGroups"
          :key="group"
          type="button"
          :class="{ 'is-active': activeToolGroup === group }"
          @click="activeToolGroup = group"
        >
          {{ displayToolGroup(group) }}
        </button>
      </div>
    </section>

    <div v-if="serverToolsError" class="platform-updates-page__notice platform-updates-page__notice--error">
      {{ serverToolsError }}
    </div>

    <div
      v-if="updateResult"
      class="platform-updates-page__notice"
      :class="{ 'platform-updates-page__notice--error': updateResult.status === 'failed' }"
    >
      <div>
        <strong>{{ updateResult.label || updateResult.id }}</strong>
        <span>{{ updateResult.status === "completed" ? "actualizada" : "no se pudo actualizar" }}</span>
      </div>
      <details v-if="updateResult.output" class="platform-updates-page__output">
        <summary>Ver salida técnica</summary>
        <pre>{{ updateResult.output }}</pre>
      </details>
    </div>

    <div v-if="serverToolsLoading && !serverTools.length" class="platform-updates-page__loading">
      Leyendo inventario del servidor...
    </div>

    <section v-if="criticalServerTools.length" class="platform-updates-page__priority" aria-label="Herramientas principales">
      <header>
        <span>Herramientas principales</span>
        <small>Versiones instaladas ahora mismo en el servidor</small>
      </header>
      <div class="platform-updates-page__priority-grid">
        <article
          v-for="tool in criticalServerTools"
          :key="tool.id"
          class="platform-updates-page__priority-tool"
          :style="toolCssVars(tool)"
          :class="{ 'is-missing': !tool.installed, 'is-updating': updatingToolId === tool.id }"
        >
          <div>
            <span class="platform-updates-page__logo" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
              <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
              <strong v-else>{{ toolMark(tool) }}</strong>
            </span>
            <span>
              <small>{{ displayToolGroup(tool.group) }}</small>
              <strong>{{ tool.label }}</strong>
              <em>{{ versionText(tool) }}</em>
            </span>
          </div>
          <button type="button" :disabled="!tool.updateSupported || Boolean(updatingToolId)" @click="updateServerTool(tool)">
            {{ updateButtonLabel(tool) }}
          </button>
        </article>
      </div>
    </section>

    <div v-if="!serverToolsLoading && !filteredServerTools.length" class="platform-updates-page__loading">
      No hay herramientas que coincidan con el filtro.
    </div>

    <section v-else class="platform-updates-page__groups" aria-label="Inventario completo">
      <header class="platform-updates-page__list-head">
        <span>Inventario completo</span>
        <small>{{ filteredServerTools.length }} visibles</small>
      </header>

      <section v-for="group in groupedServerTools" :key="group.name" class="platform-updates-page__group">
        <div class="platform-updates-page__group-title">
          <span>{{ displayToolGroup(group.name) }}</span>
          <small>{{ group.tools.length }}</small>
        </div>

        <article
          v-for="tool in group.tools"
          :key="tool.id"
          class="platform-updates-page__tool"
          :style="toolCssVars(tool)"
          :class="{ 'is-missing': !tool.installed, 'is-updating': updatingToolId === tool.id }"
        >
          <div class="platform-updates-page__tool-main">
            <span class="platform-updates-page__logo" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
              <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
              <strong v-else>{{ toolMark(tool) }}</strong>
            </span>
            <span class="platform-updates-page__status-dot" aria-hidden="true"></span>
            <div>
              <h2>{{ tool.label }}</h2>
              <p>{{ tool.description }}</p>
            </div>
          </div>

          <div class="platform-updates-page__version">
            <span>Versión</span>
            <strong>{{ versionText(tool) }}</strong>
            <small v-if="tool.path">{{ tool.path }}</small>
            <small v-else>{{ tool.status }}</small>
          </div>

          <button
            class="platform-updates-page__update"
            type="button"
            :disabled="!tool.updateSupported || Boolean(updatingToolId)"
            @click="updateServerTool(tool)"
          >
            {{ updateButtonLabel(tool) }}
          </button>
        </article>
      </section>
    </section>
  </section>
</template>

<script>
import { toolCatalog } from "@/data/toolCatalog";
import { toolCssVars, toolMark } from "@/data/toolBranding";
import { toolLogo } from "@/data/toolLogos";
import { caligoApi } from "@/services/caligoApi";

const PRIORITY_TOOL_IDS = [
  "nmap",
  "openvas",
  "metasploit",
  "hydra",
  "nuclei",
  "searchsploit",
  "nikto",
  "sqlmap",
  "sherlock",
  "theharvester",
  "john",
  "hashcat",
  "wireguard",
  "openvpn",
  "spiderfoot",
  "trufflehog",
];

export default {
  name: "PlatformUpdatesView",
  data() {
    return {
      serverTools: [],
      serverToolsGeneratedAt: "",
      serverToolsLoading: false,
      serverToolsError: "",
      updatingToolId: "",
      updateResult: null,
      serverToolFilter: "",
      activeToolGroup: "all",
      priorityToolIds: PRIORITY_TOOL_IDS,
    };
  },
  computed: {
    sortedServerTools() {
      return [...this.updateToolRows].sort((left, right) => {
        const groupDiff = this.moduleRank(left.moduleKey) - this.moduleRank(right.moduleKey);
        if (groupDiff !== 0) return groupDiff;
        const toolDiff = this.toolRank(left.id) - this.toolRank(right.id);
        if (toolDiff !== 0) return toolDiff;
        return (left.label || "").localeCompare(right.label || "", "es", { sensitivity: "base" });
      });
    },
    filteredServerTools() {
      const query = this.serverToolFilter.toLowerCase();
      return this.sortedServerTools.filter((tool) => {
        const matchesGroup = this.activeToolGroup === "all" || tool.group === this.activeToolGroup;
        const haystack = `${tool.label} ${tool.id} ${tool.binary} ${tool.group} ${tool.description}`.toLowerCase();
        return matchesGroup && (!query || haystack.includes(query));
      });
    },
    criticalServerTools() {
      const byId = new Map(this.updateToolRows.map((tool) => [tool.catalogId || tool.id, tool]));
      return this.priorityToolIds.map((id) => byId.get(id)).filter(Boolean);
    },
    toolGroups() {
      return [...new Set(this.sortedServerTools.map((tool) => tool.group || "Servidor"))]
        .sort((left, right) => this.groupNameRank(left) - this.groupNameRank(right));
    },
    groupedServerTools() {
      const groups = new Map();
      this.filteredServerTools.forEach((tool) => {
        const groupName = tool.group || "Servidor";
        if (!groups.has(groupName)) groups.set(groupName, []);
        groups.get(groupName).push(tool);
      });
      return Array.from(groups.entries()).map(([name, tools]) => ({ name, tools }));
    },
    installedToolCount() {
      return this.updateToolRows.filter((tool) => tool.installed).length;
    },
    plannedToolCount() {
      return this.updateToolRows.filter((tool) => !tool.serverInventory).length;
    },
    updateToolRows() {
      const serverTools = this.serverTools || [];
      const coveredServerIndexes = new Set();
      const catalogRows = toolCatalog.map((tool) => {
        const match = this.findServerToolForCatalog(tool, serverTools, coveredServerIndexes);
        if (match?.index !== undefined) coveredServerIndexes.add(match.index);
        const serverTool = match?.tool || null;
        const requiresServer = !/browser/i.test(tool.command || "") && !/backend spring/i.test(tool.command || "");
        return {
          id: tool.id,
          catalogId: tool.id,
          updateId: serverTool?.id || tool.serverId || tool.id,
          serverId: tool.serverId || tool.id,
          label: tool.label,
          name: tool.label,
          mark: tool.code,
          group: tool.moduleLabel || tool.moduleKey,
          moduleKey: tool.moduleKey,
          binary: serverTool?.binary || tool.command,
          description: tool.purpose,
          routeName: tool.routeName,
          logoId: tool.logoId || tool.id,
          serverInventory: Boolean(serverTool),
          installed: Boolean(serverTool?.installed),
          version: serverTool?.version || "",
          path: serverTool?.path || "",
          updateSupported: Boolean(serverTool?.updateSupported),
          localOnly: !requiresServer,
          planned: !serverTool && requiresServer,
          status: serverTool
            ? serverTool.status || (serverTool.installed ? "detectada" : "no instalada")
            : requiresServer
              ? "pendiente de conector"
              : "local / backend",
        };
      });

      const extraRows = serverTools
        .map((serverTool, index) => ({ serverTool, index }))
        .filter(({ index }) => !coveredServerIndexes.has(index))
        .map(({ serverTool }) => ({
          id: serverTool.id,
          catalogId: serverTool.id,
          updateId: serverTool.id,
          serverId: serverTool.id,
          label: serverTool.label || serverTool.id,
          name: serverTool.label || serverTool.id,
          mark: String(serverTool.label || serverTool.id).slice(0, 3).toUpperCase(),
          group: serverTool.group || "Servidor",
          moduleKey: "servidor",
          binary: serverTool.binary || serverTool.id,
          description: serverTool.description || "Herramienta detectada por el inventario del servidor.",
          routeName: "home",
          logoId: serverTool.id,
          serverInventory: true,
          installed: Boolean(serverTool?.installed),
          version: serverTool?.version || "",
          path: serverTool?.path || "",
          updateSupported: Boolean(serverTool?.updateSupported),
          localOnly: false,
          planned: false,
          status: serverTool.status || (serverTool.installed ? "detectada" : "no instalada"),
        }));

      return [...catalogRows, ...extraRows];
    },
    formattedGeneratedAt() {
      if (!this.serverToolsGeneratedAt) return "";
      return new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(this.serverToolsGeneratedAt));
    },
  },
  mounted() {
    this.loadServerTools();
  },
  methods: {
    toolCssVars,
    toolLogo,
    toolMark,
    async loadServerTools() {
      this.serverToolsLoading = true;
      this.serverToolsError = "";
      try {
        if (!caligoApi.getStoredToken()) {
          this.serverTools = [];
          this.serverToolsGeneratedAt = "";
          this.activeToolGroup = "all";
          this.serverToolsError = "Inicia sesión con credenciales para leer versiones y ejecutar actualizaciones.";
          return;
        }
        const payload = await caligoApi.request("/api/system/tools");
        this.serverTools = payload?.tools || [];
        this.serverToolsGeneratedAt = payload?.generatedAt || "";
        this.activeToolGroup = "all";
      } catch (error) {
        this.serverToolsError = error?.message || "No se pudo leer el inventario del servidor";
      } finally {
        this.serverToolsLoading = false;
      }
    },
    async updateServerTool(tool) {
      if (!tool?.updateId || this.updatingToolId || !tool.updateSupported) return;
      this.updatingToolId = tool.id;
      this.updateResult = null;
      this.serverToolsError = "";
      try {
        const payload = await caligoApi.request(`/api/system/tools/${encodeURIComponent(tool.updateId)}/update`, {
          method: "POST",
        });
        this.updateResult = payload;
        await this.loadServerTools();
      } catch (error) {
        this.updateResult = {
          id: tool.id,
          label: tool.label,
          status: "failed",
          output: error?.message || "No se pudo actualizar la herramienta",
        };
      } finally {
        this.updatingToolId = "";
      }
    },
    groupRank(group) {
      return {
        OSINT: 10,
        SCAN: 20,
        XPLOIT: 30,
        NETWORK: 40,
        CODING: 50,
        TOOLS: 60,
        Reconocimiento: 20,
        Vulnerabilidades: 30,
        Redes: 40,
        Codificacion: 50,
        Codificación: 50,
        Esteganografia: 50,
        Esteganografía: 50,
        Reversing: 50,
        Contrasenas: 60,
        Contraseñas: 60,
        Utilidades: 60,
        URLs: 70,
      }[group] ?? 99;
    },
    moduleRank(moduleKey) {
      return {
        osint: 10,
        scan: 20,
        xploit: 30,
        network: 40,
        coding: 50,
        tools: 60,
        reconocimiento: 20,
        vulnerabilidades: 30,
        redes: 40,
        codificacion: 50,
        esteganografia: 50,
        reversing: 50,
        contrasenas: 60,
        passwords: 60,
        utilidades: 60,
        servidor: 90,
      }[moduleKey] ?? this.groupRank(moduleKey);
    },
    groupNameRank(group) {
      const tool = this.updateToolRows.find((item) => item.group === group);
      return tool ? this.moduleRank(tool.moduleKey) : this.groupRank(group);
    },
    displayToolGroup(group) {
      return {
        Contrasenas: "TOOLS",
        Contraseñas: "TOOLS",
        Esteganografia: "CODING",
        Esteganografía: "CODING",
        Codificacion: "CODING",
        Codificación: "CODING",
        Reconocimiento: "SCAN",
        Vulnerabilidades: "XPLOIT",
        Redes: "NETWORK",
        Utilidades: "TOOLS",
        Reversing: "CODING",
      }[group] || group;
    },
    versionText(tool) {
      if (tool.version) return tool.version;
      if (tool.localOnly) return "Local / sin paquete";
      if (tool.installed) return "Sin versión detectada";
      if (tool.serverInventory) return "No instalada";
      return "Planificada";
    },
    updateButtonLabel(tool) {
      if (this.updatingToolId === tool.id) return "Actualizando...";
      if (tool.updateSupported) return "Actualizar";
      if (tool.localOnly) return "Local";
      if (!tool.serverInventory) return "Pendiente";
      return "Bloqueada";
    },
    findServerToolForCatalog(tool, serverTools, consumedIndexes = new Set()) {
      const candidates = [tool.id, tool.serverId, tool.command, tool.command?.split("/")[0]]
        .filter(Boolean)
        .map((value) => this.normalizeToolKey(value));

      const exactIndex = serverTools.findIndex((serverTool, index) => {
        if (consumedIndexes.has(index)) return false;
        const values = [serverTool.id, serverTool.binary, serverTool.label]
          .filter(Boolean)
          .map((value) => this.normalizeToolKey(value));
        return values.some((value) => candidates.includes(value));
      });

      if (exactIndex !== -1) return { tool: serverTools[exactIndex], index: exactIndex };
      return null;
    },
    normalizeToolKey(value) {
      return String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    },
    toolRank(id) {
      const index = this.priorityToolIds.indexOf(id);
      return index === -1 ? 99 : index;
    },
  },
};
</script>
