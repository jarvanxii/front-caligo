<template>
  <canvas ref="canvas" class="matrix-rain-canvas" aria-hidden="true"></canvas>
</template>

<script>
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-/<>[]{}CALIGOOPENVASMETASPLOITURLS";

export default {
  name: "MatrixRain",
  data() {
    return {
      animationFrame: null,
      columns: [],
      context: null,
      fontSize: 18,
      lastFrame: 0,
      prefersReducedMotion: false,
      motionQuery: null,
    };
  },
  mounted() {
    this.context = this.$refs.canvas.getContext("2d");
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.prefersReducedMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener("change", this.handleMotionPreference);
    window.addEventListener("resize", this.resizeCanvas);
    this.resizeCanvas();
    this.start();
  },
  beforeUnmount() {
    this.stop();
    window.removeEventListener("resize", this.resizeCanvas);
    this.motionQuery?.removeEventListener("change", this.handleMotionPreference);
  },
  methods: {
    handleMotionPreference(event) {
      this.prefersReducedMotion = event.matches;
      this.start();
    },
    resizeCanvas() {
      const canvas = this.$refs.canvas;
      const host = canvas.parentElement || document.documentElement;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const columnCount = Math.ceil(width / this.fontSize);
      this.columns = Array.from({ length: columnCount }, () => Math.random() * (height / this.fontSize));
      this.paintBaseLayer();
    },
    start() {
      this.stop();
      this.paintBaseLayer();

      if (this.prefersReducedMotion) {
        this.paintStaticLayer();
        return;
      }

      this.animationFrame = requestAnimationFrame((time) => this.draw(time));
    },
    stop() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    },
    paintBaseLayer() {
      const canvas = this.$refs.canvas;
      this.context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      this.context.fillStyle = "rgba(4, 7, 7, 0.48)";
      this.context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    },
    paintStaticLayer() {
      const canvas = this.$refs.canvas;
      this.context.font = `${this.fontSize}px "Space Grotesk", monospace`;
      this.context.textBaseline = "top";

      this.columns.forEach((drop, index) => {
        const x = index * this.fontSize;
        const y = drop * this.fontSize;
        this.context.fillStyle = index % 6 === 0 ? "rgba(226, 232, 240, 0.42)" : "rgba(94, 234, 212, 0.36)";
        this.context.fillText(this.randomGlyph(), x, y);
      });
    },
    draw(time) {
      const frameDelay = 48;

      if (time - this.lastFrame < frameDelay) {
        this.animationFrame = requestAnimationFrame((nextTime) => this.draw(nextTime));
        return;
      }

      this.lastFrame = time;
      const canvas = this.$refs.canvas;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      this.context.fillStyle = "rgba(4, 7, 7, 0.08)";
      this.context.fillRect(0, 0, width, height);
      this.context.font = `${this.fontSize}px "Space Grotesk", monospace`;
      this.context.textBaseline = "top";

      this.columns.forEach((drop, index) => {
        const x = index * this.fontSize;
        const y = drop * this.fontSize;
        const isLeadGlyph = index % 9 === 0;
        this.context.fillStyle = isLeadGlyph ? "rgba(236, 253, 245, 0.92)" : "rgba(94, 234, 212, 0.64)";
        this.context.fillText(this.randomGlyph(), x, y);

        if (y > height && Math.random() > 0.974) {
          this.columns[index] = 0;
        } else {
          this.columns[index] += 0.82;
        }
      });

      this.animationFrame = requestAnimationFrame((nextTime) => this.draw(nextTime));
    },
    randomGlyph() {
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    },
  },
};
</script>
