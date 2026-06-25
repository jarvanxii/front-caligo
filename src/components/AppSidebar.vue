<template>
  <aside v-if="currentPage" class="app-sidebar" :class="sidebarThemeClass" aria-label="Utilidades de la vista">
    <div class="app-sidebar__top">
      <span class="app-sidebar__kicker">Utilidades</span>
      <strong>{{ currentPage.navLabel }}</strong>
      <small>{{ currentPage.signal }}</small>
    </div>

    <nav class="app-sidebar__nav" :aria-label="`Utilidades de ${currentPage.navLabel}`">
      <template v-for="item in navigationItems" :key="item.id">
        <div
          v-if="item.type === 'section'"
          class="app-sidebar__section"
          :class="{ 'is-open': isSectionOpen(item), 'has-active': isSectionActive(item) }"
        >
          <button
            class="app-sidebar__section-toggle"
            type="button"
            :aria-expanded="isSectionOpen(item)"
            :aria-controls="sectionPanelId(item.id)"
            @click="toggleSection(item)"
          >
            <span class="app-sidebar__text">
              <strong>{{ item.label }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <span class="app-sidebar__section-meta">
              <span class="app-sidebar__count">{{ item.utilities.length }}</span>
              <span class="app-sidebar__chevron" aria-hidden="true"></span>
            </span>
          </button>

          <Transition name="sidebar-section">
            <div v-show="isSectionOpen(item)" :id="sectionPanelId(item.id)" class="app-sidebar__section-items">
              <template v-for="utility in item.utilities" :key="utility.id">
                <RouterLink
                  v-if="utility.routeName"
                  class="app-sidebar__link"
                  :class="{ 'is-active': isRouteActive(utility.routeName) }"
                  :to="{ name: utility.routeName }"
                >
                  <span class="app-sidebar__text">
                    <strong>{{ utility.label }}</strong>
                    <small>{{ utility.description }}</small>
                  </span>
                  <span class="app-sidebar__index">{{ utility.code }}</span>
                </RouterLink>

                <a
                  v-else
                  class="app-sidebar__link"
                  :class="{ 'is-active': isHashActive(`#${utility.id}`) }"
                  :href="`#${utility.id}`"
                >
                  <span class="app-sidebar__text">
                    <strong>{{ utility.label }}</strong>
                    <small>{{ utility.description }}</small>
                  </span>
                  <span class="app-sidebar__index">{{ utility.code }}</span>
                </a>
              </template>
            </div>
          </Transition>
        </div>

        <RouterLink
          v-else-if="item.routeName"
          class="app-sidebar__link"
          :class="{ 'is-active': isRouteActive(item.routeName) }"
          :to="{ name: item.routeName }"
        >
          <span class="app-sidebar__text">
            <strong>{{ item.label }}</strong>
            <small>{{ item.description }}</small>
          </span>
          <span class="app-sidebar__index">{{ item.code }}</span>
        </RouterLink>

        <a
          v-else
          class="app-sidebar__link"
          :class="{ 'is-active': isHashActive(`#${item.id}`) }"
          :href="`#${item.id}`"
        >
          <span class="app-sidebar__text">
            <strong>{{ item.label }}</strong>
            <small>{{ item.description }}</small>
          </span>
          <span class="app-sidebar__index">{{ item.code }}</span>
        </a>
      </template>
    </nav>

  </aside>
</template>

<script>
import { modulePageList } from "@/data/modulePages";

export default {
  name: "AppSidebar",
  data() {
    return {
      activeHash: "#module-overview",
      isMobileSidebar: false,
      openSectionId: "",
      sidebarMediaQuery: null,
    };
  },
  computed: {
    currentPage() {
      const moduleKey = this.$route.meta?.moduleKey || this.$route.name;
      return modulePageList.find((module) => module.key === moduleKey || module.routeName === moduleKey);
    },
    utilities() {
      return this.currentPage?.utilities ?? [];
    },
    navigationItems() {
      const sections = this.currentPage?.sidebarSections ?? [];

      if (sections.length > 0) {
        return sections.map((section) => ({
          ...section,
          type: "section",
          utilities: section.utilities ?? [],
        }));
      }

      return this.utilities.map((utility) => ({
        ...utility,
        type: "utility",
      }));
    },
    sidebarThemeClass() {
      const moduleKey = this.$route.meta?.moduleKey || this.currentPage?.key || this.$route.name;
      const themeByModule = {
        osint: "osint",
        scan: "scan",
        xploit: "xploit",
        network: "network",
        coding: "coding",
        tools: "tools",
        reconocimiento: "scan",
        vulnerabilidades: "xploit",
        contrasenas: "tools",
        passwords: "tools",
        codificacion: "coding",
        esteganografia: "coding",
        redes: "network",
        utilidades: "tools",
        redesUtilidades: "network",
        reversing: "coding",
      };
      return `app-sidebar--${themeByModule[moduleKey] || this.currentPage?.accent || "green"}`;
    },
  },
  watch: {
    "$route.fullPath"() {
      this.syncActiveHash();
    },
  },
  mounted() {
    this.sidebarMediaQuery = window.matchMedia?.("(max-width: 760px)") || null;
    this.isMobileSidebar = Boolean(this.sidebarMediaQuery?.matches);
    this.sidebarMediaQuery?.addEventListener?.("change", this.handleSidebarMediaChange);
    this.syncActiveHash();
    this.syncOpenSection();
    window.addEventListener("hashchange", this.syncActiveHash);
  },
  beforeUnmount() {
    this.sidebarMediaQuery?.removeEventListener?.("change", this.handleSidebarMediaChange);
    window.removeEventListener("hashchange", this.syncActiveHash);
  },
  methods: {
    isRouteActive(routeName) {
      return this.$route.name === routeName;
    },
    isUtilityActive(utility) {
      if (utility.routeName) {
        return this.isRouteActive(utility.routeName);
      }

      return this.isHashActive(`#${utility.id}`);
    },
    isSectionActive(section) {
      return section.utilities.some((utility) => this.isUtilityActive(utility));
    },
    isSectionOpen(section) {
      return this.openSectionId === section.id;
    },
    toggleSection(section) {
      this.openSectionId = this.isSectionOpen(section) ? "" : section.id;
    },
    sectionPanelId(id) {
      return `${id}-items`;
    },
    isHashActive(hash) {
      if (hash === "#module-overview") {
        return this.activeHash === "" || this.activeHash === "#module-overview";
      }
      return this.activeHash === hash;
    },
    handleSidebarMediaChange(event) {
      this.isMobileSidebar = event.matches;
      if (this.isMobileSidebar) {
        this.openSectionId = "";
        return;
      }
      this.syncOpenSection();
    },
    syncActiveHash() {
      this.activeHash = window.location.hash || "#module-overview";
      this.syncOpenSection();
    },
    syncOpenSection() {
      if (this.isMobileSidebar) {
        const sectionExists = this.navigationItems.some((item) => item.type === "section" && item.id === this.openSectionId);
        if (!sectionExists) {
          this.openSectionId = "";
        }
        return;
      }
      const activeSection = this.navigationItems.find((item) => item.type === "section" && this.isSectionActive(item));
      this.openSectionId = activeSection?.id || "";
    },
  },
};
</script>
