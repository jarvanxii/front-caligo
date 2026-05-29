<template>
  <section class="home-hero" aria-labelledby="home-title">
    <AsciiDescent />

    <div class="home-command" aria-labelledby="home-title">
      <section class="home-command__copy">
        <span class="eyebrow">Centro operativo</span>
        <h1 id="home-title">Herramientas reales. Presentación segura. Evidencia trazable.</h1>
        <p>
          Un laboratorio black hat controlado para enseñar arquitectura, operación y criterio técnico: backend con motores
          reales, frontend navegable, trabajos persistentes y salida preparada para auditoría.
        </p>

        <nav class="home-command__logo-strip" aria-label="Accesos rápidos a herramientas principales">
          <RouterLink
            v-for="tool in toolHighlights"
            :key="tool.id"
            :style="toolCssVars(tool)"
            :title="tool.label"
            :to="{ name: tool.routeName }"
          >
            <span aria-hidden="true">{{ toolMark(tool) }}</span>
            <strong>{{ tool.label }}</strong>
          </RouterLink>
        </nav>

        <div class="home-command__stats" aria-label="Resumen del laboratorio">
          <span><strong>{{ guideToolCount }}</strong> herramientas</span>
          <span><strong>{{ sessionMode }}</strong> acceso</span>
          <span><strong>LAN</strong> backend</span>
        </div>
      </section>

      <aside class="home-status-board" aria-label="Estado del laboratorio">
        <div class="home-status-board__top">
          <span>caligo://runtime</span>
          <strong>{{ runtimeState }}</strong>
        </div>

        <div class="home-status-board__grid">
          <div>
            <span>API</span>
            <strong>{{ apiBaseUrl }}</strong>
          </div>
          <div>
            <span>Sesión</span>
            <strong>{{ currentUser }}</strong>
          </div>
          <div>
            <span>Modo</span>
            <strong>{{ labMode }}</strong>
          </div>
          <div>
            <span>Salida</span>
            <strong>Jobs y PDF</strong>
          </div>
        </div>

        <div class="home-status-board__modules" aria-label="Módulos principales">
          <RouterLink v-for="module in moduleLinks" :key="module.id" :to="{ name: module.routeName }">
            <span>{{ module.tools.length }}</span>
            <strong>{{ module.title }}</strong>
            <small>{{ module.eyebrow }}</small>
          </RouterLink>
        </div>

        <div class="home-status-board__trace">
          <span>scope.locked</span>
          <span>audit.enabled</span>
          <span>server.tools.synced</span>
        </div>
      </aside>
    </div>
  </section>
</template>

<script>
import AsciiDescent from "@/components/AsciiDescent.vue";
import { guideToolCount, platformGuide, toolLogoRail } from "@/data/platformGuide";
import { toolCssVars, toolMark } from "@/data/toolBranding";

export default {
  name: "HomeHero",
  components: {
    AsciiDescent,
  },
  computed: {
    apiBaseUrl() {
      return this.$store.state.apiBaseUrl?.replace(/^https?:\/\//, "") || "sin configurar";
    },
    currentUser() {
      return this.$store.state.user?.username || "sin sesión";
    },
    guideToolCount() {
      return guideToolCount;
    },
    labMode() {
      return this.$store.getters.isPortfolioMode ? "Portfolio seguro" : "Authorized lab";
    },
    moduleLinks() {
      return platformGuide;
    },
    runtimeState() {
      return this.$store.getters.isPortfolioMode ? "Demo segura" : "Operativo";
    },
    sessionMode() {
      return this.$store.getters.isPortfolioMode ? "Demo" : "JWT";
    },
    toolHighlights() {
      const ids = ["nmap", "openvas", "metasploit", "hydra", "nuclei", "sqlmap", "hashcat", "wireguard"];
      return ids.map((id) => toolLogoRail.find((tool) => tool.id === id)).filter(Boolean);
    },
  },
  methods: {
    toolCssVars,
    toolMark,
  },
};
</script>
