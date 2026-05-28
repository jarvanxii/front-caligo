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
        >
          {{ item.label }}
        </RouterLink>
      </div>

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
                  Ã—
                </button>
              </div>
            </header>

            <div class="settings-updates__summary" aria-live="polite">
              <span>{{ installedToolCount }} instaladas</span>
              <span>{{ serverTools.length }} registradas</span>
              <span v-if="serverToolsGeneratedAt">Lectura {{ formattedGeneratedAt }}</span>
            </div>

            <div v-if="serverTools.length" class="settings-updates__toolbar">
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
                  {{ group }}
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
                <summary>Ver salida tecnica</summary>
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
                  :class="{ 'is-missing': !tool.installed, 'is-updating': updatingToolId === tool.id }"
                >
                  <div>
                    <span>{{ tool.group }}</span>
                    <strong>{{ tool.label }}</strong>
                    <small>{{ tool.version || (tool.installed ? "Sin version detectada" : "No instalada") }}</small>
                  </div>
                  <button
                    type="button"
                    :disabled="!tool.updateSupported || Boolean(updatingToolId)"
                    @click="updateServerTool(tool)"
                  >
                    {{ updatingToolId === tool.id ? "Actualizando..." : "Actualizar" }}
                  </button>
                </article>
              </div>
            </section>

            <div v-if="!serverToolsLoading && !filteredServerTools.length" class="settings-updates__loading">
              No hay herramientas que coincidan con el filtro.
            </div>

            <div v-else-if="serverTools.length" class="settings-updates__groups">
              <div class="settings-updates__list-head">
                <span>Inventario completo</span>
                <small>{{ filteredServerTools.length }} visibles</small>
              </div>
              <section v-for="group in groupedServerTools" :key="group.name" class="settings-updates__group">
                <div class="settings-updates__group-title">
                  <span>{{ group.name }}</span>
                  <small>{{ group.tools.length }}</small>
                </div>

                <article
                  v-for="tool in group.tools"
                  :key="tool.id"
                  class="settings-updates__tool"
                  :class="{ 'is-missing': !tool.installed, 'is-updating': updatingToolId === tool.id }"
                >
                  <div class="settings-updates__tool-main">
                    <span class="settings-updates__status-dot" aria-hidden="true"></span>
                    <div>
                      <h3>{{ tool.label }}</h3>
                      <p>{{ tool.description }}</p>
                    </div>
                  </div>

                  <div class="settings-updates__version">
                    <span>Version</span>
                    <strong>{{ tool.version || (tool.installed ? "Sin version detectada" : "No instalada") }}</strong>
                    <small v-if="tool.path">{{ tool.path }}</small>
                  </div>

                  <button
                    class="settings-updates__update"
                    type="button"
                    :disabled="!tool.updateSupported || Boolean(updatingToolId)"
                    @click="updateServerTool(tool)"
                  >
                    {{ updatingToolId === tool.id ? "Actualizando..." : "Actualizar" }}
                  </button>
                </article>
              </section>
            </div>
          </div>
        </section>
      </Transition>
    </Teleport>
  </header>
</template>

<script>
import wordmarkUrl from "@/assets/images/caligo-wordmark.png";
import { mainModulePages } from "@/data/modulePages";
import { caligoApi } from "@/services/caligoApi";

export default {
  name: "AppHeader",
  data() {
    return {
      wordmarkUrl,
      navItems: mainModulePages.map((module) => ({
        key: module.key,
        label: module.navLabel,
        routeName: module.routeName,
      })),
      settingsOpen: false,
      settingsItems: [
        { key: "preferences", label: "Preferencias" },
        { key: "security", label: "Seguridad" },
        { key: "users", label: "Usuarios" },
        { key: "administration", label: "AdministraciÃ³n" },
        { key: "configuration", label: "ConfiguraciÃ³n" },
        { key: "updates", label: "Actualizaciones" },
        { key: "logout", label: "Cerrar SesiÃ³n", action: "logout" },
      ],
      updatesModalOpen: false,
      serverTools: [],
      serverToolsGeneratedAt: "",
      serverToolsLoading: false,
      serverToolsError: "",
      updatingToolId: "",
      updateResult: null,
      serverToolFilter: "",
      activeToolGroup: "all",
      priorityToolIds: ["metasploit", "hydra", "nuclei", "searchsploit", "nikto", "sqlmap", "nmap", "openvas", "john", "hashcat"],
    };
  },
  computed: {
    sortedServerTools() {
      return [...this.serverTools].sort((left, right) => {
        const groupDiff = this.groupRank(left.group) - this.groupRank(right.group);
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
      const byId = new Map(this.serverTools.map((tool) => [tool.id, tool]));
      return this.priorityToolIds.map((id) => byId.get(id)).filter(Boolean);
    },
    toolGroups() {
      return [...new Set(this.sortedServerTools.map((tool) => tool.group || "Servidor"))]
        .sort((left, right) => this.groupRank(left) - this.groupRank(right));
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
      return this.serverTools.filter((tool) => tool.installed).length;
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
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onDocumentClick);
    document.removeEventListener("keydown", this.onDocumentKeydown);
    document.body.classList.remove("settings-updates-open");
  },
  watch: {
    $route() {
      this.closeSettings();
    },
    updatesModalOpen(value) {
      document.body.classList.toggle("settings-updates-open", value);
    },
  },
  methods: {
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
      this.closeSettings();
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
      if (!tool?.id || this.updatingToolId) {
        return;
      }
      this.updatingToolId = tool.id;
      this.updateResult = null;
      this.serverToolsError = "";
      try {
        const payload = await caligoApi.request(`/api/system/tools/${tool.id}/update`, {
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
        Vulnerabilidades: 20,
        "Fuerza bruta": 30,
        Contrasenas: 40,
        Esteganografia: 50,
        URLs: 60,
      }[group] ?? 99;
    },
    toolRank(id) {
      const index = this.priorityToolIds.indexOf(id);
      return index === -1 ? 99 : index;
    },
  },
};
</script>

