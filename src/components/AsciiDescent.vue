<template>
  <section class="ascii-descent" :class="{ 'is-awakening': booting, 'is-settling': settling }" aria-label="Letras ASCII de Caligo">
    <div class="ascii-descent__frame">
      <div class="ascii-descent__meta ascii-descent__meta--top" aria-hidden="true">
        <span>CALIGO / SEC-LAB</span>
        <span>AUTHORIZED RANGE</span>
      </div>
      <canvas v-if="matrixVisible" ref="matrixCanvas" class="ascii-descent__matrix-canvas"></canvas>
      <div class="ascii-descent__lockup" aria-hidden="true">
        <pre class="ascii-descent__art ascii-descent__word" @animationend.self="finishBoot">{{ wordText }}</pre>
        <div class="control-illusion" aria-hidden="true">
          <div
            v-for="phrase in controlPhrases"
            :key="phrase.key"
            class="control-illusion__phrase"
            :class="`control-illusion__phrase--${phrase.tone}`"
            :data-phrase="phrase.text"
            aria-hidden="true"
          >
            {{ phrase.text }}
          </div>
        </div>
        <span
          v-if="activeSparkStyle"
          class="ascii-descent__spark-overlay"
          :style="activeSparkStyle"
        >#</span>
      </div>
      <div class="ascii-descent__meta ascii-descent__meta--bottom" aria-hidden="true">
        <span>TRACE ENABLED</span>
        <span>CONTROLLED MODE</span>
      </div>
    </div>
  </section>
</template>

<script>
const WORD_LINES = [
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw`                                                         #                                                                            ##`,
  String.raw`      ###########################                      #####                         #####                                          ####                   #########################                   #####################`,
  String.raw`    ############################                      #######                        #####                                         #####                 #########################                   #########################`,
  String.raw`  ############################                       ##########                      #####                                        ######               #########################                    ###########################`,
  String.raw`########                                           #############                     #####                                        ######              #######                                     #######                ########`,
  String.raw`######                                            ###############                    #####                                        ######             #######       #################             #######                   ######`,
  String.raw`#####                                            #######   ########                  #####                                        ######             #####         ##################            ######                     #####`,
  String.raw`#####                                          ########     ########                 #####                                        ######             #####           ################            ######                     #####`,
  String.raw`######                                        ########       ########                #####                                        ######             ######           ###############            ######                    ######`,
  String.raw`########                                    ########           ########              #####                                        ######             ########                  ######             #######                ########`,
  String.raw`  ##############################           ########             ########             ############################                 ######               ##############################              ############################`,
  String.raw`   ############################           ########               #########           ##############################               ######                 ############################                ########################`,
  String.raw`     ########################           ########                   ########          ###############################              ####                     ##########################                  ####################`,
  String.raw`                                        ##                               ##                                                        #`,
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw``,
  String.raw``,
];
const WORD_WIDTH = Math.max(...WORD_LINES.map((line) => line.length));
const HASH_COORDINATES = WORD_LINES.flatMap((line, lineIndex) =>
  Array.from(line).flatMap((value, charIndex) => (value === "#" ? [{ lineIndex, charIndex }] : [])),
);
const HASH_POSITIONS = WORD_LINES.flatMap((line, lineIndex) =>
  Array.from(line).flatMap((value, charIndex) => (value === "#" ? [`${lineIndex}-${charIndex}`] : [])),
);
const MATRIX_GLYPHS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ\uFF8A\uFF90\uFF8B\uFF70\uFF73\uFF7C\uFF85\uFF93\uFF86\uFF7B\uFF9C\uFF82\uFF75\uFF98\uFF71\uFF8E\uFF83\uFF8F\uFF79\uFF92\uFF74\uFF76\uFF77\uFF91\uFF95\uFF97\uFF7E\uFF88\uFF7D\uFF80\uFF87\uFF8D";
const MATRIX_FRAME_MS = 50;
const MATRIX_CELL_SIZE = 11;
const ASCII_BUILD_MS = 8600;
const MATRIX_SETTLE_MS = 1100;
const SPARK_INTERVAL_MS = 360;
const CONTROL_PHRASES = [
  {
    key: "control",
    text: "CONTROL IS AN ILLUSION",
    tone: "primary",
  },
];

function seededUnit(index, salt) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export default {
  name: "AsciiDescent",
  data() {
    return {
      booting: true,
      settling: false,
      matrixVisible: true,
      activeHashSpark: "",
      controlPhrases: CONTROL_PHRASES,
      hashSparkTimer: null,
      settleTimer: null,
    };
  },
  computed: {
    wordText() {
      return WORD_LINES.join("\n");
    },
    activeSparkStyle() {
      if (!this.activeHashSpark) return null;
      const [lineIndex, charIndex] = this.activeHashSpark.split("-").map(Number);
      if (!Number.isFinite(lineIndex) || !Number.isFinite(charIndex)) return null;

      return {
        "--spark-x": `${charIndex}ch`,
        "--spark-y": `${(lineIndex * 0.82).toFixed(2)}em`,
      };
    },
  },
  mounted() {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      this.finishBoot();
      return;
    }
    this.$nextTick(this.startMatrixRain);
  },
  activated() {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      this.finishBoot();
      return;
    }
    if (this.booting && this.matrixVisible) {
      this.$nextTick(this.startMatrixRain);
      return;
    }
    if (!this.booting && this.shouldKeepMatrixRain()) {
      this.matrixVisible = true;
      this.$nextTick(this.startMatrixRain);
    }
    this.startHashSpark();
  },
  deactivated() {
    this.stopMatrixRain();
    this.stopHashSpark();
    window.clearTimeout(this.settleTimer);
    this.settleTimer = null;
    if (!this.booting) {
      this.settling = false;
      this.matrixVisible = false;
    }
  },
  beforeUnmount() {
    this.stopMatrixRain();
    this.stopHashSpark();
    window.clearTimeout(this.settleTimer);
  },
  methods: {
    finishBoot(event) {
      if (event?.animationName && event.animationName !== "asciiWordMatrixBuild") return;
      if (!this.booting) return;
      this.booting = false;
      this.settling = true;
      this.settleTimer = window.setTimeout(() => {
        this.settling = false;
        if (this.shouldKeepMatrixRain()) {
          this.startHashSpark();
          return;
        }
        this.matrixVisible = false;
        this.stopMatrixRain();
        this.startHashSpark();
      }, MATRIX_SETTLE_MS);
    },
    shouldKeepMatrixRain() {
      return Boolean(window.matchMedia?.("(max-width: 760px)").matches);
    },
    startHashSpark() {
      if (this.booting || this.hashSparkTimer) return;
      this.jumpHashSpark();
      this.hashSparkTimer = window.setInterval(this.jumpHashSpark, SPARK_INTERVAL_MS);
    },
    stopHashSpark() {
      window.clearInterval(this.hashSparkTimer);
      this.hashSparkTimer = null;
    },
    jumpHashSpark() {
      const nextIndex = Math.floor(Math.random() * HASH_POSITIONS.length);
      this.activeHashSpark = HASH_POSITIONS[nextIndex];
    },
    startMatrixRain() {
      this.stopMatrixRain();
      const canvas = this.$refs.matrixCanvas;
      if (!canvas) return;

      this.matrixCanvas = canvas;
      this.matrixContext = canvas.getContext("2d", { alpha: true });
      if (!this.matrixContext) return;

      this.matrixBootStartedAt = performance.now();
      this.resizeMatrixRain();
      this.matrixResizeObserver = new ResizeObserver(this.resizeMatrixRain);
      this.matrixResizeObserver.observe(canvas);
      this.matrixLastFrame = 0;
      this.matrixFrame = window.requestAnimationFrame(this.renderMatrixRain);
    },
    stopMatrixRain() {
      if (this.matrixFrame) {
        window.cancelAnimationFrame(this.matrixFrame);
        this.matrixFrame = 0;
      }
      this.matrixResizeObserver?.disconnect();
      this.matrixResizeObserver = null;
      this.matrixColumns = [];
      this.matrixTargetCells = [];
      this.matrixContext = null;
      this.matrixCanvas = null;
    },
    resizeMatrixRain() {
      const canvas = this.matrixCanvas || this.$refs.matrixCanvas;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const columns = Math.max(8, Math.ceil(rect.width / MATRIX_CELL_SIZE));
      const rows = Math.max(6, Math.ceil(rect.height / MATRIX_CELL_SIZE));
      this.matrixCellSize = MATRIX_CELL_SIZE * dpr;
      this.matrixRows = rows;
      this.matrixTargetCells = this.buildMatrixTargetCells(canvas);

      if (!this.matrixColumns || this.matrixColumns.length !== columns) {
        this.matrixColumns = Array.from({ length: columns }, (_, index) => ({
          y: -Math.floor(seededUnit(index, 151) * rows),
          speed: 0.72 + seededUnit(index, 157) * 0.74,
          length: 5 + Math.floor(seededUnit(index, 163) * 9),
          resetChance: 0.025 + seededUnit(index, 167) * 0.03,
        }));
      }

      const context = this.matrixContext;
      if (context) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, rect.width, rect.height);
      }
    },
    buildMatrixTargetCells(canvas) {
      const word = canvas.parentElement?.querySelector(".ascii-descent__word");
      if (!word) return [];

      const canvasRect = canvas.getBoundingClientRect();
      const wordRect = word.getBoundingClientRect();
      const wordStyle = window.getComputedStyle(word);
      const fontSize = Number.parseFloat(wordStyle.fontSize) || 7.24;
      const lineHeight = Number.parseFloat(wordStyle.lineHeight) || fontSize * 0.82;
      const charWidth = wordRect.width / Math.max(1, WORD_WIDTH);
      const originX = wordRect.left - canvasRect.left;
      const originY = wordRect.top - canvasRect.top;

      const asciiCells = HASH_COORDINATES.map(({ lineIndex, charIndex }, index) => {
        const vertical = lineIndex / Math.max(1, WORD_LINES.length - 1);
        const lateral = Math.abs(charIndex / Math.max(1, WORD_WIDTH - 1) - 0.5);
        return {
          value: "#",
          x: originX + charIndex * charWidth,
          y: originY + lineIndex * lineHeight,
          fontSize,
          lineHeight,
          revealAt: 0.08 + vertical * 0.66 + lateral * 0.06 + seededUnit(index, 211) * 0.16,
          flicker: seededUnit(index, 223),
        };
      });
      const phraseCells = this.buildMatrixPhraseCells(canvas, asciiCells.length);
      return [...asciiCells, ...phraseCells];
    },
    buildMatrixPhraseCells(canvas, offset) {
      const phrases = Array.from(canvas.parentElement.querySelectorAll(".control-illusion__phrase") || []);
      if (!phrases.length) return [];

      const canvasRect = canvas.getBoundingClientRect();
      return phrases.flatMap((phrase, phraseIndex) => {
        const phraseRect = phrase.getBoundingClientRect();
        const phraseStyle = window.getComputedStyle(phrase);
        const fontSize = Number.parseFloat(phraseStyle.fontSize) || 11;
        const lineHeight = Number.parseFloat(phraseStyle.lineHeight) || fontSize;
        const text = phrase.dataset.phrase || phrase.textContent.trim() || "";
        const chars = Array.from(text);
        const charWidth = phraseRect.width / Math.max(1, chars.length);
        const originX = phraseRect.left - canvasRect.left;
        const originY = phraseRect.top - canvasRect.top;
        const revealBase = 0.72 + phraseIndex * 0.045;

        return chars.flatMap((value, index) => {
          if (value === " ") return [];
          return {
            value,
            x: originX + index * charWidth + charWidth * 0.06,
            y: originY,
            fontSize,
            lineHeight,
            revealAt: revealBase + seededUnit(index + phraseIndex * 53, 239) * 0.13,
            flicker: seededUnit(index + offset + phraseIndex * 97, 241),
          };
        });
      });
    },
    renderMatrixRain(timestamp) {
      if (!this.matrixVisible || !this.matrixContext || !this.matrixCanvas) return;

      this.matrixFrame = window.requestAnimationFrame(this.renderMatrixRain);
      if (timestamp - this.matrixLastFrame < MATRIX_FRAME_MS) return;
      this.matrixLastFrame = timestamp;

      const context = this.matrixContext;
      const canvas = this.matrixCanvas;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      context.fillStyle = "rgba(1, 7, 6, 0.18)";
      context.fillRect(0, 0, width, height);
      context.font = `900 ${MATRIX_CELL_SIZE}px "Cascadia Mono", Consolas, monospace`;
      context.textAlign = "center";
      context.textBaseline = "top";

      this.matrixColumns.forEach((column, columnIndex) => {
        const x = columnIndex * MATRIX_CELL_SIZE + MATRIX_CELL_SIZE * 0.5;

        for (let tailIndex = 0; tailIndex < column.length; tailIndex += 1) {
          const row = Math.floor(column.y - tailIndex);
          if (row < 0 || row > this.matrixRows) continue;

          const alpha = Math.max(0, 1 - tailIndex / column.length);
          if (tailIndex === 0) {
            context.fillStyle = "rgba(232, 255, 238, 0.95)";
            context.shadowColor = "rgba(210, 255, 220, 0.55)";
            context.shadowBlur = 8;
          } else {
            context.fillStyle = `rgba(0, 255, 65, ${Math.max(0.08, alpha * 0.52).toFixed(3)})`;
            context.shadowColor = "rgba(0, 255, 65, 0.24)";
            context.shadowBlur = 4;
          }

          context.fillText(this.randomMatrixGlyph(), x, row * MATRIX_CELL_SIZE);
        }

        column.y += column.speed;
        if (column.y - column.length > this.matrixRows && Math.random() < column.resetChance) {
          column.y = -Math.floor(Math.random() * this.matrixRows * 0.6);
          column.speed = 0.72 + Math.random() * 0.74;
          column.length = 5 + Math.floor(Math.random() * 9);
        }
      });

      this.renderMatrixAsciiBuild(context, timestamp);
      context.shadowBlur = 0;
    },
    renderMatrixAsciiBuild(context, timestamp) {
      if (!this.matrixTargetCells?.length) return;

      const progress = Math.min(1, (timestamp - this.matrixBootStartedAt) / ASCII_BUILD_MS);
      let activeFontSize = 0;

      context.textAlign = "left";
      context.textBaseline = "top";
      context.shadowColor = "rgba(0, 255, 95, 0.48)";
      context.shadowBlur = 7;

      this.matrixTargetCells.forEach((cell) => {
        const age = progress - cell.revealAt;
        if (age < 0) {
          if (age > -0.035 && cell.flicker > 0.74) {
            if (cell.fontSize !== activeFontSize) {
              activeFontSize = cell.fontSize;
              context.font = `900 ${cell.fontSize}px "Cascadia Mono", Consolas, monospace`;
            }
            context.fillStyle = "rgba(185, 255, 205, 0.42)";
            context.fillText(this.randomMatrixGlyph(), cell.x, cell.y);
          }
          return;
        }

        if (cell.fontSize !== activeFontSize) {
          activeFontSize = cell.fontSize;
          context.font = `900 ${cell.fontSize}px "Cascadia Mono", Consolas, monospace`;
        }

        const alpha = Math.min(1, age / 0.09);
        const pulse = 0.82 + Math.sin((progress * 36 + cell.flicker * 8) * Math.PI) * 0.08;
        context.fillStyle = `rgba(0, 255, 95, ${(alpha * pulse).toFixed(3)})`;
        context.fillText(cell.value, cell.x, cell.y - cell.lineHeight * 0.04);
      });
    },
    randomMatrixGlyph() {
      return MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)];
    },
  },
};
</script>
