<template>
  <header class="app-header">
    <nav class="app-header__nav" aria-label="Navegacion principal">
      <RouterLink class="app-header__brand" :to="{ name: 'home' }" aria-label="Ir al inicio">
        <img :src="wordmarkUrl" alt="Caligo" />
      </RouterLink>

      <div class="app-header__links">
        <RouterLink
          v-for="item in navItems"
          :key="item.key"
          :class="{ 'is-active': isNavActive(item) }"
          :to="{ name: item.routeName }"
          :title="item.fullLabel"
        >
          {{ item.label }}
        </RouterLink>
      </div>

      <button
        class="app-header__ip-monitor"
        type="button"
        title="Refrescar identidad de red"
        aria-label="Refrescar IP cliente y servidor"
        @click="refreshNetworkIdentity"
      >
        <span>
          <small>IP SERVIDOR:</small>
          <strong>{{ serverIpLabel }}</strong>
        </span>
        <span>
          <small>IP CLIENTE:</small>
          <strong>{{ clientIpLabel }}</strong>
        </span>
      </button>

      <div ref="settingsMenu" class="app-header__settings-wrap">
        <button
          class="app-header__settings"
          :class="{ 'is-open': settingsOpen }"
          type="button"
          aria-label="Abrir ajustes"
          aria-haspopup="menu"
          :aria-expanded="settingsOpen.toString()"
          title="Ajustes"
          @click="toggleSettings"
        >
          <span class="app-header__settings-mark" aria-hidden="true"></span>
        </button>

        <Transition name="settings-menu">
          <div v-if="settingsOpen" class="app-header__settings-menu" role="menu" aria-label="Ajustes de Caligo">
            <button
              v-for="item in settingsItems"
              :key="item.key"
              class="app-header__settings-item"
              :class="{ 'is-danger': item.action === 'logout' }"
              type="button"
              role="menuitem"
              @click="handleSettingsItem(item)"
            >
              <span>{{ item.label }}</span>
              <span class="app-header__settings-indicator" aria-hidden="true"></span>
            </button>
          </div>
        </Transition>
      </div>
    </nav>

    <Teleport to="body">
      <Transition name="settings-modal">
        <section
          v-if="updatesModalOpen"
          class="settings-updates"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-updates-title"
          @click.self="closeUpdatesModal"
        >
          <div class="settings-updates__panel">
            <header class="settings-updates__header">
              <div>
                <span class="settings-updates__eyebrow">Servidor Caligo</span>
                <h2 id="settings-updates-title">Actualizaciones</h2>
                <p>Versiones detectadas en el servidor y mantenimiento controlado de herramientas.</p>
              </div>
              <div class="settings-updates__actions">
                <button class="settings-updates__ghost" type="button" :disabled="serverToolsLoading" @click="loadServerTools">
                  Refrescar
                </button>
                <button class="settings-updates__close" type="button" aria-label="Cerrar actualizaciones" @click="closeUpdatesModal">
                  ×
                </button>
              </div>
            </header>

            <div class="settings-updates__summary" aria-live="polite">
              <span>{{ installedToolCount }} detectadas</span>
              <span>{{ updateToolRows.length }} registradas</span>
              <span>{{ plannedToolCount }} planificadas</span>
              <span v-if="serverToolsGeneratedAt">Lectura {{ formattedGeneratedAt }}</span>
            </div>

            <div v-if="updateToolRows.length" class="settings-updates__toolbar">
              <label>
                <span>Filtrar</span>
                <input v-model.trim="serverToolFilter" type="search" placeholder="Hydra, Metasploit, Nmap..." />
              </label>
              <div class="settings-updates__filters" aria-label="Filtrar por familia">
                <button
                  type="button"
                  :class="{ 'is-active': activeToolGroup === 'all' }"
                  @click="activeToolGroup = 'all'"
                >
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
            </div>

            <div v-if="serverToolsError" class="settings-updates__notice settings-updates__notice--error">
              {{ serverToolsError }}
            </div>

            <div v-if="updateResult" class="settings-updates__notice" :class="{ 'settings-updates__notice--error': updateResult.status === 'failed' }">
              <div>
                <strong>{{ updateResult.label || updateResult.id }}</strong>
                <span>{{ updateResult.status === "completed" ? "actualizada" : "no se pudo actualizar" }}</span>
              </div>
              <details v-if="updateResult.output" class="settings-updates__output">
                <summary>Ver salida técnica</summary>
                <pre>{{ updateResult.output }}</pre>
              </details>
            </div>

            <div v-if="serverToolsLoading && !serverTools.length" class="settings-updates__loading">
              Leyendo inventario del servidor...
            </div>

            <section v-if="criticalServerTools.length" class="settings-updates__priority" aria-label="Herramientas principales">
              <div class="settings-updates__priority-head">
                <span>Herramientas principales</span>
                <small>Versiones instaladas ahora mismo en el servidor</small>
              </div>

              <div class="settings-updates__priority-grid">
                <article
                  v-for="tool in criticalServerTools"
                  :key="tool.id"
                  class="settings-updates__priority-tool"
                  :style="toolCssVars(tool)"
                  :class="{ 'is-missing': !tool.installed, 'is-updating': updatingToolId === tool.id }"
                >
                  <div class="settings-updates__priority-main">
                    <span class="settings-updates__tool-logo" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
                      <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
                      <strong v-else>{{ toolMark(tool) }}</strong>
                    </span>
                    <div>
                      <span>{{ displayToolGroup(tool.group) }}</span>
                      <strong>{{ tool.label }}</strong>
                      <small>{{ versionText(tool) }}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    :disabled="!tool.updateSupported || Boolean(updatingToolId)"
                    @click="updateServerTool(tool)"
                  >
                    {{ updateButtonLabel(tool) }}
                  </button>
                </article>
              </div>
            </section>

            <div v-if="!serverToolsLoading && !filteredServerTools.length" class="settings-updates__loading">
              No hay herramientas que coincidan con el filtro.
            </div>

            <div v-else-if="updateToolRows.length" class="settings-updates__groups">
              <div class="settings-updates__list-head">
                <span>Inventario completo</span>
                <small>{{ filteredServerTools.length }} visibles</small>
              </div>
              <section v-for="group in groupedServerTools" :key="group.name" class="settings-updates__group">
                <div class="settings-updates__group-title">
                  <span>{{ displayToolGroup(group.name) }}</span>
                  <small>{{ group.tools.length }}</small>
                </div>

                <article
                  v-for="tool in group.tools"
                  :key="tool.id"
                  class="settings-updates__tool"
                  :style="toolCssVars(tool)"
                  :class="{ 'is-missing': !tool.installed, 'is-updating': updatingToolId === tool.id }"
                >
                  <div class="settings-updates__tool-main">
                    <span class="settings-updates__tool-logo" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
                      <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
                      <strong v-else>{{ toolMark(tool) }}</strong>
                    </span>
                    <span class="settings-updates__status-dot" aria-hidden="true"></span>
                    <div>
                      <h3>{{ tool.label }}</h3>
                      <p>{{ tool.description }}</p>
                    </div>
                  </div>

                  <div class="settings-updates__version">
                    <span>Versión</span>
                    <strong>{{ versionText(tool) }}</strong>
                    <small v-if="tool.path">{{ tool.path }}</small>
                    <small v-else>{{ tool.status }}</small>
                  </div>

                  <button
                    class="settings-updates__update"
                    type="button"
                    :disabled="!tool.updateSupported || Boolean(updatingToolId)"
                    @click="updateServerTool(tool)"
                  >
                    {{ updateButtonLabel(tool) }}
                  </button>
                </article>
              </section>
            </div>
          </div>
        </section>
      </Transition>
    </Teleport>

    <GuideModal :open="guideModalOpen" @close="closeGuideModal" />
  </header>
</template>

<script>
import GuideModal from "@/components/GuideModal.vue";
import wordmarkUrl from "@/assets/images/caligo-wordmark.png";
import { mainModulePages } from "@/data/modulePages";
import { toolCatalog } from "@/data/toolCatalog";
import { toolCssVars, toolMark } from "@/data/toolBranding";
import { toolLogo } from "@/data/toolLogos";
import { caligoApi } from "@/services/caligoApi";
import { resolveClientIp, resolveServerIp } from "@/utils/networkIdentity";

export default {
  name: "AppHeader",
  components: {
    GuideModal,
  },
  data() {
    return {
      wordmarkUrl,
      navItems: mainModulePages.map((module) => ({
        key: module.key,
        label: module.headerLabel || module.navLabel,
        fullLabel: module.navLabel,
        routeName: module.routeName,
      })),
      settingsOpen: false,
      settingsItems: [
        { key: "preferences", label: "Preferencias" },
        { key: "security", label: "Seguridad" },
        { key: "guide", label: "Guía" },
        { key: "users", label: "Usuarios" },
        { key: "administration", label: "Administración" },
        { key: "configuration", label: "Configuración" },
        { key: "updates", label: "Actualizaciones" },
        { key: "logout", label: "Cerrar Sesión", action: "logout" },
      ],
      guideModalOpen: false,
      updatesModalOpen: false,
      serverTools: [],
      serverToolsGeneratedAt: "",
      serverToolsLoading: false,
      serverToolsError: "",
      updatingToolId: "",
      updateResult: null,
      serverToolFilter: "",
      activeToolGroup: "all",
      priorityToolIds: ["nmap", "openvas", "metasploit", "hydra", "nuclei", "searchsploit", "nikto", "sqlmap", "sherlock", "theharvester", "john", "hashcat", "wireguard", "openvpn"],
      networkIdentity: null,
      clientPublicIp: "",
      networkIdentityTimer: null,
    };
  },
  computed: {
    serverIpLabel() {
      return resolveServerIp(this.networkIdentity) || "...";
    },
    clientIpLabel() {
      return resolveClientIp(this.networkIdentity, this.clientPublicIp) || "...";
    },
    sortedServerTools() {
      return [...this.updateToolRows].sort((left, right) => {
        const groupDiff = this.moduleRank(left.moduleKey) - this.moduleRank(right.moduleKey);
        if (groupDiff !== 0) {
          return groupDiff;
        }
        const toolDiff = this.toolRank(left.id) - this.toolRank(right.id);
        if (toolDiff !== 0) {
          return toolDiff;
        }
        return (left.label || "").localeCompare(right.label || "");
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
        if (!groups.has(groupName)) {
          groups.set(groupName, []);
        }
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
        const match = this.findServerToolForCatalog(tool, serverTools);
        if (match?.index !== undefined) {
          coveredServerIndexes.add(match.index);
        }
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
          installed: Boolean(serverTool.installed),
          version: serverTool.version || "",
          path: serverTool.path || "",
          updateSupported: Boolean(serverTool.updateSupported),
          localOnly: false,
          planned: false,
          status: serverTool.status || (serverTool.installed ? "detectada" : "no instalada"),
        }));

      return [...catalogRows, ...extraRows];
    },
    formattedGeneratedAt() {
      if (!this.serverToolsGeneratedAt) {
        return "";
      }
      return new Intl.DateTimeFormat("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(this.serverToolsGeneratedAt));
    },
  },
  mounted() {
    document.addEventListener("click", this.onDocumentClick);
    document.addEventListener("keydown", this.onDocumentKeydown);
    window.addEventListener("caligo:network-identity-changed", this.refreshNetworkIdentity);
    this.refreshNetworkIdentity();
    this.networkIdentityTimer = window.setInterval(this.refreshNetworkIdentity, 30000);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onDocumentClick);
    document.removeEventListener("keydown", this.onDocumentKeydown);
    window.removeEventListener("caligo:network-identity-changed", this.refreshNetworkIdentity);
    window.clearInterval(this.networkIdentityTimer);
    document.body.classList.remove("settings-updates-open");
  },
  watch: {
    $route() {
      this.closeSettings();
      this.closeGuideModal();
    },
    updatesModalOpen(value) {
      document.body.classList.toggle("settings-updates-open", value);
    },
  },
  methods: {
    toolCssVars,
    toolLogo,
    toolMark,
    async refreshNetworkIdentity() {
      await Promise.allSettled([
        this.loadNetworkIdentity(),
        this.loadClientPublicIp(),
      ]);
    },
    async loadNetworkIdentity() {
      if (!caligoApi.getStoredToken()) {
        return;
      }
      try {
        this.networkIdentity = await caligoApi.request("/api/network/identity");
      } catch {
        this.networkIdentity = null;
      }
    },
    async loadClientPublicIp() {
      try {
        const response = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (/^[0-9a-fA-F:.]{3,80}$/.test(payload?.ip || "")) {
          this.clientPublicIp = payload.ip;
        }
      } catch {
        // Public client IP is best-effort; the backend-observed IP remains available.
      }
    },
    isNavActive(item) {
      return this.$route.name === item.routeName || this.$route.meta?.moduleKey === item.key;
    },
    toggleSettings() {
      this.settingsOpen = !this.settingsOpen;
    },
    closeSettings() {
      this.settingsOpen = false;
    },
    onDocumentClick(event) {
      if (!this.settingsOpen || this.$refs.settingsMenu?.contains(event.target)) {
        return;
      }
      this.closeSettings();
    },
    onDocumentKeydown(event) {
      if (event.key === "Escape") {
        if (this.updatesModalOpen) {
          this.closeUpdatesModal();
          return;
        }
        if (this.guideModalOpen) {
          this.closeGuideModal();
          return;
        }
        this.closeSettings();
      }
    },
    handleSettingsItem(item) {
      if (item.action === "logout") {
        this.$store.dispatch("logout");
        this.closeSettings();
        this.$router.push({ name: "login" });
        return;
      }
      if (item.key === "updates") {
        this.openUpdatesModal();
        return;
      }
      if (item.key === "guide") {
        this.openGuideModal();
        return;
      }
      this.closeSettings();
    },
    openGuideModal() {
      this.closeSettings();
      this.guideModalOpen = true;
    },
    closeGuideModal() {
      this.guideModalOpen = false;
    },
    async openUpdatesModal() {
      this.closeSettings();
      this.updatesModalOpen = true;
      await this.loadServerTools();
    },
    closeUpdatesModal() {
      if (this.updatingToolId) {
        return;
      }
      this.updatesModalOpen = false;
    },
    async loadServerTools() {
      this.serverToolsLoading = true;
      this.serverToolsError = "";
      try {
        if (!caligoApi.getStoredToken()) {
          this.serverTools = [];
          this.serverToolsGeneratedAt = "";
          this.activeToolGroup = "all";
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
      if (!tool?.updateId || this.updatingToolId || !tool.updateSupported) {
        return;
      }
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
        Reconocimiento: 10,
        OSINT: 15,
        Vulnerabilidades: 20,
        "Fuerza bruta": 30,
        Contrasenas: 40,
        Contraseñas: 40,
        Codificacion: 45,
        Codificación: 45,
        Esteganografia: 50,
        Esteganografía: 50,
        Redes: 55,
        Utilidades: 60,
        Reversing: 65,
        URLs: 70,
      }[group] ?? 99;
    },
    moduleRank(moduleKey) {
      return {
        reconocimiento: 10,
        osint: 15,
        vulnerabilidades: 20,
        contrasenas: 30,
        codificacion: 40,
        esteganografia: 50,
        redes: 60,
        utilidades: 70,
        reversing: 80,
        servidor: 90,
      }[moduleKey] ?? this.groupRank(moduleKey);
    },
    groupNameRank(group) {
      const tool = this.updateToolRows.find((item) => item.group === group);
      return tool ? this.moduleRank(tool.moduleKey) : this.groupRank(group);
    },
    displayToolGroup(group) {
      return {
        Contrasenas: "Contraseñas",
        Esteganografia: "Esteganografía",
        Codificacion: "Codificación",
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
      const candidates = [
        tool.id,
        tool.serverId,
        tool.command,
        tool.command?.split("/")[0],
      ]
        .filter(Boolean)
        .map((value) => this.normalizeToolKey(value));

      const exactIndex = serverTools.findIndex((serverTool, index) => {
        if (consumedIndexes.has(index)) return false;
        const values = [serverTool.id, serverTool.binary, serverTool.label]
          .filter(Boolean)
          .map((value) => this.normalizeToolKey(value));
        return values.some((value) => candidates.includes(value));
      });

      if (exactIndex !== -1) {
        return { tool: serverTools[exactIndex], index: exactIndex };
      }

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

