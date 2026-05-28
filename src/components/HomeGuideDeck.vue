<template>
  <section class="home-guide" aria-labelledby="home-guide-title">
    <section class="home-session" aria-label="Control de sesión">
      <header class="home-session__head">
        <span>Control operativo</span>
        <strong>{{ sessionState }}</strong>
        <small>{{ sessionSignal }}</small>
      </header>

      <dl class="home-session__grid">
        <div v-for="item in sessionItems" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>
    </section>

    <nav class="home-tool-rail" aria-label="Herramientas integradas">
      <RouterLink v-for="tool in toolLogoRail" :key="tool.id" :to="{ name: tool.routeName }" :title="tool.label">
        <strong>{{ tool.mark }}</strong>
        <span>{{ tool.label }}</span>
      </RouterLink>
    </nav>

    <header class="home-guide__header">
      <span class="eyebrow">Guía operativa</span>
      <h2 id="home-guide-title">Herramientas por módulo</h2>
      <p>Mapa técnico de Caligo: qué ejecuta cada módulo, qué entrada espera y para qué sirve dentro del laboratorio.</p>
    </header>

    <section class="home-guide__groups" aria-label="Resumen de herramientas">
      <article v-for="section in platformGuide" :key="section.id" class="home-guide__group">
        <header>
          <span>{{ section.eyebrow }}</span>
          <RouterLink :to="{ name: section.routeName }">{{ section.title }}</RouterLink>
        </header>

        <ul>
          <li v-for="tool in section.tools" :key="tool.id">
            <RouterLink :to="{ name: tool.routeName }">
              <span class="home-guide__tool-name">
                <strong>{{ tool.name }}</strong>
                <small>{{ tool.engine }}</small>
              </span>
              <span class="home-guide__tool-copy">
                <strong>{{ tool.purpose }}</strong>
                <small>Entrada: {{ tool.input }}</small>
                <em>{{ tool.usage }}</em>
              </span>
            </RouterLink>
          </li>
        </ul>
      </article>
    </section>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { platformGuide, toolLogoRail } from "@/data/platformGuide";
import { resolveClientIp, resolveServerIp } from "@/utils/networkIdentity";

export default {
  name: "HomeGuideDeck",
  data() {
    return {
      networkIdentity: null,
      clientPublicIp: "",
    };
  },
  computed: {
    platformGuide() {
      return platformGuide;
    },
    toolLogoRail() {
      return toolLogoRail;
    },
    sessionState() {
      return caligoApi.getStoredToken() ? "JWT activo" : "Sin sesión";
    },
    sessionSignal() {
      return this.serverIp ? "Servidor visible" : "Esperando identidad";
    },
    userLabel() {
      return this.$store.state.user?.username || caligoApi.getStoredUser()?.username || "operador";
    },
    backendHost() {
      return caligoApi.baseUrl.replace(/^https?:\/\//, "");
    },
    serverIp() {
      return resolveServerIp(this.networkIdentity);
    },
    clientIp() {
      return resolveClientIp(this.networkIdentity, this.clientPublicIp);
    },
    sessionItems() {
      return [
        { label: "Acceso", value: this.sessionState },
        { label: "Modo", value: "Authorized lab" },
        { label: "Usuario", value: this.userLabel },
        { label: "Backend", value: this.backendHost },
        { label: "IP servidor", value: this.serverIp || "..." },
        { label: "IP cliente", value: this.clientIp || "..." },
      ];
    },
  },
  mounted() {
    this.refreshSessionControl();
  },
  methods: {
    async refreshSessionControl() {
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
