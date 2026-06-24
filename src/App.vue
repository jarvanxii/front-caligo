<template>
  <AppHeader v-if="!$route.meta.hideHeader" />
  <AppSidebar v-if="!$route.meta.hideHeader && !$route.meta.hideSidebar" />
  <main
    :class="appShellClasses"
  >
    <PortfolioAccessNotice v-if="showPortfolioNotice" />
    <div class="app-shell__route" :class="{ 'app-shell__route--locked': showPortfolioNotice }">
      <router-view v-slot="{ Component, route }">
        <KeepAlive v-if="shouldCacheRoute(route)">
          <component :is="Component" :key="route.name || route.fullPath" />
        </KeepAlive>
        <component v-else :is="Component" :key="route.name || route.fullPath" />
      </router-view>
    </div>
  </main>
  <PrivacyFooter />
</template>

<script>
import { defineAsyncComponent } from "vue";

const UNCACHED_ROUTE_NAMES = new Set([
  "home",
  "osint",
  "scan",
  "xploit",
  "network",
  "coding",
  "tools",
  "reconocimiento",
  "vulnerabilidades",
  "contrasenas",
  "passwords",
  "codificacion",
  "redes",
  "redesUtilidades",
  "utilidades",
]);

const AppHeader = defineAsyncComponent(() => import("@/components/AppHeader.vue"));
const AppSidebar = defineAsyncComponent(() => import("@/components/AppSidebar.vue"));
const PortfolioAccessNotice = defineAsyncComponent(() => import("@/components/PortfolioAccessNotice.vue"));
const PrivacyFooter = defineAsyncComponent(() => import("@/components/PrivacyFooter.vue"));

export default {
  name: "App",
  components: {
    AppHeader,
    AppSidebar,
    PortfolioAccessNotice,
    PrivacyFooter,
  },
  computed: {
    appShellClasses() {
      return [
        "app-shell",
        this.activeModuleClass,
        {
          "app-shell--with-header": !this.$route.meta.hideHeader,
          "app-shell--with-sidebar": !this.$route.meta.hideHeader && !this.$route.meta.hideSidebar,
          "app-shell--auth": this.$route.meta.authLayout,
          "app-shell--portfolio": this.showPortfolioNotice,
        },
      ];
    },
    showPortfolioNotice() {
      return this.$store.getters.isPortfolioMode && !this.$route.meta.authLayout && this.$route.name !== "home";
    },
    activeModuleClass() {
      const key = this.activeModuleKey();
      if (!key) {
        return "";
      }
      return `app-shell--module-${this.toKebabCase(key)}`;
    },
  },
  methods: {
    shouldCacheRoute(route) {
      return !route.meta.authLayout && !UNCACHED_ROUTE_NAMES.has(route.name) && this.$store.getters.hasAppAccess;
    },
    activeModuleKey() {
      if (this.$route.meta.authLayout || this.$route.name === "home") {
        return "";
      }

      if (this.$route.meta?.moduleKey) {
        return this.$route.meta.moduleKey;
      }

      const path = this.$route.path || "";
      const categories = [
        ["/urls", "scan"],
        ["/nmap", "scan"],
        ["/openvas", "scan"],
        ["/scan", "scan"],
        ["/reconocimiento", "scan"],
        ["/osint", "osint"],
        ["/metasploit", "xploit"],
        ["/fuerza-bruta", "xploit"],
        ["/xploit", "xploit"],
        ["/vulnerabilidades", "xploit"],
        ["/tools", "tools"],
        ["/contrasenas", "tools"],
        ["/passwords", "tools"],
        ["/utilidades", "tools"],
        ["/coding", "coding"],
        ["/codificacion", "coding"],
        ["/esteganografia", "coding"],
        ["/reversing", "coding"],
        ["/network", "network"],
        ["/redes", "network"],
        ["/redes-utilidades", "network"],
      ];
      return categories.find(([prefix]) => path.startsWith(prefix))?.[1] || this.$route.name || "";
    },
    toKebabCase(value) {
      return String(value)
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
    },
  },
};
</script>
