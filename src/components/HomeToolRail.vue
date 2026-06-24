<template>
  <section class="home-stack-showcase" aria-label="Herramientas integradas">
    <nav
      ref="toolRail"
      class="home-tool-rail"
      :class="{ 'is-dragging': railDragging, 'is-moving': railMoved }"
      aria-label="Herramientas integradas"
      @pointerdown="startRailDrag"
      @pointermove="moveRailDrag"
      @pointerup="endRailDrag"
      @pointercancel="endRailDrag"
      @click.capture="guardRailClick"
    >
      <RouterLink
        v-for="{ tool, key } in animatedToolRail"
        :key="key"
        :style="toolCssVars(tool)"
        :title="tool.label"
        :to="toolTarget(tool)"
        :aria-label="`Abrir ${tool.label}`"
        draggable="false"
      >
        <span class="home-tool-rail__logo" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
          <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
          <strong v-else>{{ toolMark(tool) }}</strong>
        </span>
        <span class="home-tool-rail__meta">
          <strong>{{ tool.label }}</strong>
          <small>{{ tool.group }}</small>
        </span>
      </RouterLink>
    </nav>
  </section>
</template>

<script>
import { toolLogoRail } from "@/data/platformGuide";
import { toolCssVars, toolMark } from "@/data/toolBranding";
import { toolLogo } from "@/data/toolLogos";

const RAIL_COPIES = 3;
const RAIL_SPEED = 34;

export default {
  name: "HomeToolRail",
  data() {
    return {
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
    toolLogoRail() {
      return toolLogoRail;
    },
    availableRouteNames() {
      return new Set(this.$router.getRoutes().map((route) => route.name).filter(Boolean));
    },
    animatedToolRail() {
      return Array.from({ length: RAIL_COPIES }, (_, copyIndex) =>
        this.toolLogoRail.map((tool, toolIndex) => ({
          tool,
          key: `${tool.id}-${tool.routeName}-${copyIndex}-${toolIndex}`,
        })),
      ).flat();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.resetToolRail();
      this.startToolRailAnimation();
    });
    window.addEventListener("resize", this.resetToolRail, { passive: true });
  },
  activated() {
    this.$nextTick(() => {
      this.resetToolRail();
      this.startToolRailAnimation();
    });
  },
  deactivated() {
    this.endRailDrag({});
    this.stopToolRailAnimation();
  },
  beforeUnmount() {
    this.removeDragListeners();
    this.stopToolRailAnimation();
    window.removeEventListener("resize", this.resetToolRail);
  },
  methods: {
    toolCssVars,
    toolMark,
    toolLogo,
    toolTarget(tool) {
      if (tool.routeName && this.availableRouteNames.has(tool.routeName)) {
        return { name: tool.routeName };
      }
      if (tool.path) {
        return tool.path;
      }
      return `/tool/${tool.id}`;
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
      window.addEventListener("pointermove", this.moveRailDrag, { passive: false });
      window.addEventListener("pointerup", this.endRailDrag, { passive: true });
      window.addEventListener("pointercancel", this.endRailDrag, { passive: true });
    },
    moveRailDrag(event) {
      if (!this.railDragging || this.railPointerId !== event.pointerId) return;
      this.moveRailTo(event.clientX);
      if (this.railMoved) {
        event.preventDefault();
      }
    },
    moveRailTo(clientX) {
      const rail = this.$refs.toolRail;
      if (!rail) return;
      const deltaX = clientX - this.railDragStartX;
      if (Math.abs(deltaX) > 4) {
        this.railMoved = true;
      }
      rail.scrollLeft = this.railDragStartScroll - deltaX;
      this.normalizeToolRail();
    },
    endRailDrag(event) {
      if (!this.railDragging) return;
      if (event.pointerId !== undefined && this.railPointerId !== event.pointerId) return;
      this.removeDragListeners();
      this.railDragging = false;
      this.railPointerId = null;
      this.railLastFrame = performance.now();
      window.setTimeout(() => {
        this.railMoved = false;
      }, 80);
    },
    removeDragListeners() {
      window.removeEventListener("pointermove", this.moveRailDrag);
      window.removeEventListener("pointerup", this.endRailDrag);
      window.removeEventListener("pointercancel", this.endRailDrag);
    },
    guardRailClick(event) {
      if (!this.railMoved) return;
      event.preventDefault();
      event.stopPropagation();
    },
  },
};
</script>
