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

      <button
        class="app-header__menu-toggle"
        :class="{ 'is-open': mobileMenuOpen }"
        type="button"
        aria-label="Abrir navegacion"
        aria-haspopup="menu"
        :aria-expanded="mobileMenuOpen.toString()"
        aria-controls="app-header-mobile-menu"
        @click="toggleMobileMenu"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
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
              :class="{ 'is-danger': item.action === 'logout', 'is-route': item.routeName }"
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

      <Transition name="header-menu">
        <div
          v-if="mobileMenuOpen"
          id="app-header-mobile-menu"
          class="app-header__mobile-menu"
          role="menu"
          aria-label="Navegacion principal"
        >
          <RouterLink
            v-for="item in navItems"
            :key="`mobile-${item.key}`"
            :class="{ 'is-active': isNavActive(item) }"
            :to="{ name: item.routeName }"
            :title="item.fullLabel"
            role="menuitem"
            @click="closeMobileMenu"
          >
            <span>{{ item.label }}</span>
            <small>{{ item.fullLabel }}</small>
          </RouterLink>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script>
import wordmarkUrl from "@/assets/images/caligo-wordmark.png";
import { mainModulePages } from "@/data/modulePages";
import { caligoApi } from "@/services/caligoApi";
import { resolveClientIp, resolveServerIp } from "@/utils/networkIdentity";

export default {
  name: "AppHeader",
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
      mobileMenuOpen: false,
      settingsItems: [
        { key: "preferences", label: "Preferencias" },
        { key: "security", label: "Seguridad" },
        { key: "guide", label: "Guía", routeName: "platformGuide" },
        { key: "users", label: "Usuarios" },
        { key: "administration", label: "Administración" },
        { key: "configuration", label: "Configuración" },
        { key: "updates", label: "Actualizaciones", routeName: "platformUpdates" },
        { key: "logout", label: "Cerrar Sesión", action: "logout" },
      ],
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
  },
  watch: {
    $route() {
      this.closeSettings();
      this.closeMobileMenu();
    },
  },
  methods: {
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
        // La IP publica del navegador es informativa; la IP observada por backend sigue disponible.
      }
    },
    isNavActive(item) {
      return this.$route.name === item.routeName || this.$route.meta?.moduleKey === item.key;
    },
    toggleSettings() {
      this.closeMobileMenu();
      this.settingsOpen = !this.settingsOpen;
    },
    closeSettings() {
      this.settingsOpen = false;
    },
    toggleMobileMenu() {
      this.closeSettings();
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    },
    onDocumentClick(event) {
      const clickedInsideHeader = this.$el.contains(event.target);
      const clickedInsideSettings = this.$refs.settingsMenu?.contains(event.target);

      if (this.settingsOpen && !clickedInsideSettings) {
        this.closeSettings();
      }
      if (this.mobileMenuOpen && !clickedInsideHeader) {
        this.closeMobileMenu();
      }
    },
    onDocumentKeydown(event) {
      if (event.key === "Escape") {
        this.closeMobileMenu();
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

      if (item.routeName) {
        this.closeSettings();
        if (this.$route.name !== item.routeName) {
          this.$router.push({ name: item.routeName });
        }
        return;
      }

      this.closeSettings();
    },
  },
};
</script>
