<template>
  <section class="home-guide" aria-labelledby="home-guide-title">
    <section class="home-command-center" aria-label="Presentación de Caligo">
      <div class="home-command-center__copy">
        <span class="eyebrow">Stack de laboratorio</span>
        <h2 id="home-guide-title">Una consola para reconocimiento, validación, OSINT y evidencia técnica.</h2>
        <p>
          Caligo centraliza herramientas reales del servidor en una interfaz navegable: cada módulo conserva contexto,
          parámetros y resultados para que el laboratorio pueda enseñarse como producto sin perder rigor operativo.
        </p>
        <div class="home-command-center__metrics" aria-label="Resumen de integración">
          <span><strong>{{ guideToolCount }}</strong> herramientas</span>
          <span><strong>{{ platformGuide.length }}</strong> módulos</span>
          <span><strong>{{ activeToolGroups }}</strong> motores server/local</span>
        </div>
      </div>

      <section class="home-session" aria-label="Control de sesión">
        <header class="home-session__head">
          <span>Control de sesión</span>
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
    </section>

    <section class="home-stack-showcase" aria-label="Herramientas integradas">
      <header class="home-stack-showcase__head">
        <span>Programas integrados</span>
        <p>Logos oficiales versionados desde Kali Tools cuando existen; las utilidades internas conservan marca Caligo.</p>
      </header>

      <nav
        ref="toolRail"
        class="home-tool-rail"
        :class="{ 'is-dragging': railDragging }"
        aria-label="Herramientas integradas"
        @pointerdown="startRailDrag"
        @pointermove="moveRailDrag"
        @pointerup="endRailDrag"
        @pointercancel="endRailDrag"
        @mousedown="startRailMouseDrag"
        @mousemove="moveRailMouseDrag"
        @mouseup="endRailMouseDrag"
        @mouseleave="endRailDrag"
        @click.capture="guardRailClick"
        >
          <RouterLink
            v-for="{ tool, key } in animatedToolRail"
            :key="key"
            :style="toolCssVars(tool)"
            :title="tool.label"
            :to="{ name: tool.routeName }"
            draggable="false"
        >
          <span class="home-tool-rail__logo" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
            <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
            <strong v-else>{{ tool.mark }}</strong>
          </span>
          <span class="home-tool-rail__meta">
            <strong>{{ tool.label }}</strong>
            <small>{{ tool.group }}</small>
          </span>
        </RouterLink>
      </nav>
    </section>

    <header class="home-guide__header">
      <span class="eyebrow">Guía operativa</span>
      <h2>Mapa de capacidades</h2>
      <p>Lectura rápida para recruiters y equipos técnicos: qué motor hay detrás, qué entrada acepta y qué aporta cada vista.</p>
    </header>

    <section class="home-guide__groups" aria-label="Resumen de herramientas">
      <article v-for="section in platformGuide" :key="section.id" class="home-guide__group">
        <header class="home-guide__group-head">
          <span class="home-guide__group-kicker">{{ section.eyebrow }}</span>
          <RouterLink :to="{ name: section.routeName }">{{ section.title }}</RouterLink>
          <p>{{ section.summary }}</p>
          <small>{{ section.tools.length }} herramientas / {{ section.workflow }}</small>
        </header>

        <ul>
          <li v-for="tool in section.tools" :key="tool.id">
            <RouterLink class="home-guide__tool-link" :style="toolCssVars(tool)" :to="{ name: tool.routeName }">
              <span class="home-guide__tool-logo" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
                <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
                <strong v-else>{{ toolMark(tool) }}</strong>
              </span>
              <span class="home-guide__tool-name">
                <strong>{{ tool.name }}</strong>
                <small>{{ tool.engine }}</small>
              </span>
              <span class="home-guide__tool-copy">
                <strong>{{ tool.purpose }}</strong>
                <small>Entrada: {{ tool.input }}</small>
                <em>{{ tool.usage }}</em>
              </span>
              <span class="home-guide__tool-action">Abrir</span>
            </RouterLink>
          </li>
        </ul>
      </article>
    </section>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { guideToolCount, platformGuide, toolLogoRail } from "@/data/platformGuide";
import { toolCssVars, toolMark } from "@/data/toolBranding";
import { toolLogo } from "@/data/toolLogos";
import { resolveClientIp, resolveServerIp } from "@/utils/networkIdentity";

const RAIL_COPIES = 3;
const RAIL_SPEED = 34;

export default {
  name: "HomeGuideDeck",
  data() {
    return {
      networkIdentity: null,
      clientPublicIp: "",
      railAnimationFrame: 0,
      railLastFrame: 0,
      railCycleWidth: 0,
      railPointerId: null,
      railDragStartX: 0,
      railDragStartScroll: 0,
      railDragging: false,
      railMoved: false,
    };
  },
  computed: {
    platformGuide() {
      return platformGuide;
    },
    guideToolCount() {
      return guideToolCount;
    },
    toolLogoRail() {
      return toolLogoRail;
    },
    animatedToolRail() {
      return Array.from({ length: RAIL_COPIES }, (_, copyIndex) =>
        this.toolLogoRail.map((tool, toolIndex) => ({
          tool,
          key: `${tool.id}-${tool.routeName}-${copyIndex}-${toolIndex}`,
        })),
      ).flat();
    },
    activeToolGroups() {
      return new Set(platformGuide.flatMap((section) => section.tools.map((tool) => tool.engine.split(" ")[0]))).size;
    },
    sessionState() {
      if (this.$store.getters.isPortfolioMode) return "Modo portfolio";
      return caligoApi.getStoredToken() ? "JWT activo" : "Sin sesión";
    },
    sessionSignal() {
      if (this.$store.getters.isPortfolioMode) return "Herramientas bloqueadas";
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
        { label: "Modo", value: this.$store.getters.isPortfolioMode ? "Portfolio seguro" : "Authorized lab" },
        { label: "Usuario", value: this.userLabel },
        { label: "Backend", value: this.backendHost },
        { label: "IP servidor", value: this.serverIp || "..." },
        { label: "IP cliente", value: this.clientIp || "..." },
      ];
    },
  },
  mounted() {
    this.refreshSessionControl();
    this.$nextTick(() => {
      this.resetToolRail();
      this.startToolRailAnimation();
    });
    window.addEventListener("resize", this.resetToolRail, { passive: true });
  },
  beforeUnmount() {
    this.stopToolRailAnimation();
    window.removeEventListener("resize", this.resetToolRail);
  },
  methods: {
    toolCssVars,
    toolMark,
    toolLogo,
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
    resetToolRail() {
      const rail = this.$refs.toolRail;
      if (!rail || !this.toolLogoRail.length) return;
      this.railCycleWidth = rail.scrollWidth / RAIL_COPIES;
      if (this.railCycleWidth > 0 && (rail.scrollLeft < 1 || rail.scrollLeft >= this.railCycleWidth * 2)) {
        rail.scrollLeft = this.railCycleWidth;
      }
    },
    startToolRailAnimation() {
      this.stopToolRailAnimation();
      this.railLastFrame = performance.now();
      const tick = (timestamp) => {
        const rail = this.$refs.toolRail;
        if (rail && this.railCycleWidth > 0 && !this.railDragging) {
          const elapsed = Math.min(timestamp - this.railLastFrame, 48);
          rail.scrollLeft += (RAIL_SPEED * elapsed) / 1000;
          this.normalizeToolRail();
        }
        this.railLastFrame = timestamp;
        this.railAnimationFrame = requestAnimationFrame(tick);
      };
      this.railAnimationFrame = requestAnimationFrame(tick);
    },
    stopToolRailAnimation() {
      if (!this.railAnimationFrame) return;
      cancelAnimationFrame(this.railAnimationFrame);
      this.railAnimationFrame = 0;
    },
    normalizeToolRail() {
      const rail = this.$refs.toolRail;
      if (!rail || this.railCycleWidth <= 0) return;
      while (rail.scrollLeft >= this.railCycleWidth * 2) {
        rail.scrollLeft -= this.railCycleWidth;
      }
      while (rail.scrollLeft < this.railCycleWidth * 0.5) {
        rail.scrollLeft += this.railCycleWidth;
      }
    },
    startRailDrag(event) {
      const rail = this.$refs.toolRail;
      if (!rail || event.button !== 0 || this.railPointerId !== null) return;
      this.railPointerId = event.pointerId;
      this.railDragStartX = event.clientX;
      this.railDragStartScroll = rail.scrollLeft;
      this.railDragging = true;
      this.railMoved = false;
      rail.setPointerCapture?.(event.pointerId);
    },
    startRailMouseDrag(event) {
      const rail = this.$refs.toolRail;
      if (!rail || event.button !== 0 || this.railPointerId !== null) return;
      this.railPointerId = "mouse";
      this.railDragStartX = event.clientX;
      this.railDragStartScroll = rail.scrollLeft;
      this.railDragging = true;
      this.railMoved = false;
    },
    moveRailDrag(event) {
      if (!this.railDragging || this.railPointerId !== event.pointerId) return;
      const rail = this.$refs.toolRail;
      if (!rail) return;
      const deltaX = event.clientX - this.railDragStartX;
      if (Math.abs(deltaX) > 4) {
        this.railMoved = true;
      }
      rail.scrollLeft = this.railDragStartScroll - deltaX;
      this.normalizeToolRail();
      event.preventDefault();
    },
    moveRailMouseDrag(event) {
      if (!this.railDragging || this.railPointerId !== "mouse") return;
      const rail = this.$refs.toolRail;
      if (!rail) return;
      const deltaX = event.clientX - this.railDragStartX;
      if (Math.abs(deltaX) > 4) {
        this.railMoved = true;
      }
      rail.scrollLeft = this.railDragStartScroll - deltaX;
      this.normalizeToolRail();
      event.preventDefault();
    },
    endRailDrag(event) {
      if (!this.railDragging) return;
      const rail = this.$refs.toolRail;
      rail?.releasePointerCapture?.(event.pointerId);
      this.railDragging = false;
      this.railPointerId = null;
      this.railLastFrame = performance.now();
      window.setTimeout(() => {
        this.railMoved = false;
      }, 80);
    },
    endRailMouseDrag() {
      if (!this.railDragging || this.railPointerId !== "mouse") return;
      this.endRailDrag({});
    },
    guardRailClick(event) {
      if (!this.railMoved) return;
      event.preventDefault();
      event.stopPropagation();
    },
  },
};
</script>
