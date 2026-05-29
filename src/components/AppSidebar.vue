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
      openSections: {},
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
        reconocimiento: "reconocimiento",
        osint: "osint",
        vulnerabilidades: "vulnerabilidades",
        contrasenas: "contrasenas",
        codificacion: "codificacion",
        esteganografia: "esteganografia",
        redes: "redes",
        utilidades: "utilidades",
        redesUtilidades: "redes",
        reversing: "reversing",
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
    this.syncActiveHash();
    window.addEventListener("hashchange", this.syncActiveHash);
  },
  beforeUnmount() {
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
      if (typeof this.openSections[section.id] === "boolean") {
        return this.openSections[section.id];
      }

      return this.isSectionActive(section);
    },
    toggleSection(section) {
      this.openSections = {
        ...this.openSections,
        [section.id]: !this.isSectionOpen(section),
      };
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
    syncActiveHash() {
      this.activeHash = window.location.hash || "#module-overview";
    },
  },
};
</script>
