<template>
  <section class="home-hero" aria-labelledby="home-title">
    <AsciiDescent />
    <HomeToolRail />

    <div class="home-command" aria-labelledby="home-title">
      <section class="home-command-panel">
        <header class="home-command-panel__intro">
          <span class="eyebrow">Caligo runtime</span>
          <h1 id="home-title">Laboratorio operativo</h1>
          <p>
            Consola web para orquestar motores reales de ciberseguridad, conservar contexto entre vistas y exportar
            evidencia técnica desde un entorno controlado.
          </p>

          <div class="home-command-panel__chips" aria-label="Resumen de plataforma">
            <span><strong>{{ guideToolCount }}</strong> herramientas</span>
            <span><strong>{{ platformGuide.length }}</strong> módulos</span>
            <span><strong>{{ activeToolGroups }}</strong> motores</span>
          </div>
        </header>

        <aside class="home-command-panel__session-card" aria-label="Control de sesión">
          <header>
            <span>Control de sesión</span>
            <strong>{{ runtimeState }}</strong>
          </header>

          <dl class="home-command-panel__session">
            <div v-for="item in sessionItems" :key="item.label">
              <dt>{{ item.key }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </aside>

        <nav class="home-command-panel__modules" aria-label="Módulos principales">
          <RouterLink v-for="module in platformGuide" :key="module.id" :to="{ name: module.routeName }">
            <strong>{{ module.title }}</strong>
            <span>{{ module.tools.length }} tools</span>
          </RouterLink>
        </nav>
      </section>
    </div>
  </section>
</template>

<script>
import AsciiDescent from "@/components/AsciiDescent.vue";
import HomeToolRail from "@/components/HomeToolRail.vue";
import { guideToolCount, platformGuide } from "@/data/platformGuide";
import { caligoApi } from "@/services/caligoApi";
import { resolveClientIp, resolveServerIp } from "@/utils/networkIdentity";

export default {
  name: "HomeHero",
  components: {
    AsciiDescent,
    HomeToolRail,
  },
  data() {
    return {
      clientPublicIp: "",
      networkIdentity: null,
    };
  },
  computed: {
    activeToolGroups() {
      return new Set(platformGuide.flatMap((section) => section.tools.map((tool) => tool.engine.split(" ")[0]))).size;
    },
    apiBaseUrl() {
      return this.$store.state.apiBaseUrl?.replace(/^https?:\/\//, "") || "sin configurar";
    },
    clientIp() {
      return resolveClientIp(this.networkIdentity, this.clientPublicIp);
    },
    currentUser() {
      return this.$store.state.user?.username || caligoApi.getStoredUser()?.username || "operador";
    },
    guideToolCount() {
      return guideToolCount;
    },
    labMode() {
      return this.$store.getters.isPortfolioMode ? "Demo protegida" : "Authorized lab";
    },
    platformGuide() {
      return platformGuide;
    },
    runtimeState() {
      return this.$store.getters.isPortfolioMode ? "Demo" : "Operativo";
    },
    serverIp() {
      return resolveServerIp(this.networkIdentity);
    },
    sessionState() {
      if (this.$store.getters.isPortfolioMode) return "Acceso demo";
      return caligoApi.getStoredToken() ? "JWT activo" : "Sin sesión";
    },
    sessionItems() {
      return [
        { label: "Sesión", key: "session", value: this.sessionState },
        { label: "Usuario", key: "user", value: this.currentUser },
        { label: "Modo", key: "mode", value: this.labMode },
        { label: "Backend", key: "backend", value: this.apiBaseUrl },
        { label: "IP servidor", key: "server.ip", value: this.serverIp || "..." },
        { label: "IP cliente", key: "client.ip", value: this.clientIp || "..." },
      ];
    },
  },
  mounted() {
    this.refreshRuntimeIdentity();
  },
  methods: {
    async refreshRuntimeIdentity() {
      await Promise.allSettled([this.loadNetworkIdentity(), this.loadClientPublicIp()]);
    },
    async loadNetworkIdentity() {
      if (!caligoApi.getStoredToken()) return;
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
        this.clientPublicIp = "";
      }
    },
  },
};
</script>
