<template>
  <section class="ascii-descent" :class="{ 'is-awakening': booting }" aria-label="Letras ASCII de Caligo">
    <div class="ascii-descent__frame">
      <div class="ascii-descent__meta ascii-descent__meta--top" aria-hidden="true">
        <span>CALIGO / SEC-LAB</span>
        <span>AUTHORIZED RANGE</span>
      </div>
      <div class="control-illusion" aria-hidden="true">
        <div class="control-illusion__rain">
          <span
            v-for="column in rainColumns"
            :key="column.id"
            class="control-illusion__drop"
            :style="column.style"
          >{{ column.value }}</span>
        </div>
        <div class="control-illusion__phrase" aria-hidden="true">
          <span
            v-for="letter in controlLetters"
            :key="letter.id"
            class="control-illusion__letter"
            :class="{ 'is-space': letter.value === ' ' }"
            :style="letter.style"
          >{{ letter.value === " " ? "\u00A0" : letter.value }}</span>
        </div>
      </div>
      <div class="ascii-descent__lockup" aria-hidden="true">
        <div v-if="booting" class="ascii-descent__streams">
          <span
            v-for="stream in matrixStreams"
            :key="stream.id"
            class="ascii-descent__stream"
            :style="stream.style"
          >{{ stream.value }}</span>
        </div>
        <pre class="ascii-descent__art ascii-descent__word" @animationend.self="finishBoot">{{ wordText }}</pre>
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
const HASH_POSITIONS = WORD_LINES.flatMap((line, lineIndex) =>
  Array.from(line).flatMap((value, charIndex) => (value === "#" ? [`${lineIndex}-${charIndex}`] : [])),
);
const SPARK_INTERVAL_MS = 360;
const CONTROL_PHRASE = "CONTROL IS AN ILLUSION";
const SIGNAL_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_-+*:=|";
const RAIN_COLUMN_COUNT = 24;
const MATRIX_STREAM_COUNT = 15;
const MATRIX_STREAM_ROWS = 14;
const CONTROL_FAULT_ZONES = [2, 0, 4, 1, 3, 2];

function seededUnit(index, salt) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export default {
  name: "AsciiDescent",
  data() {
    return {
      booting: true,
      activeHashSpark: "",
      hashSparkTimer: null,
      matrixStreams: this.buildMatrixStreams(),
      rainColumns: this.buildRainColumns(),
      controlLetters: this.buildControlLetters(),
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
    }
  },
  beforeUnmount() {
    window.clearInterval(this.hashSparkTimer);
  },
  methods: {
    finishBoot(event) {
      if (event?.animationName && event.animationName !== "asciiWordMaterialize") return;
      if (!this.booting) return;
      this.booting = false;
      this.jumpHashSpark();
      this.hashSparkTimer = window.setInterval(this.jumpHashSpark, SPARK_INTERVAL_MS);
    },
    buildMatrixStreams() {
      const coordinates = HASH_POSITIONS.map((position) => {
        const [lineIndex, charIndex] = position.split("-").map(Number);
        return { lineIndex, charIndex };
      });

      return Array.from({ length: MATRIX_STREAM_COUNT }, (_, index) => {
        const minX = Math.floor((index / MATRIX_STREAM_COUNT) * WORD_WIDTH);
        const maxX = Math.ceil(((index + 1) / MATRIX_STREAM_COUNT) * WORD_WIDTH);
        const candidates = coordinates.filter(({ charIndex }) => charIndex >= minX && charIndex < maxX);
        const pool = candidates.length ? candidates : coordinates;
        const landing = pool[Math.floor(seededUnit(index, 89) * pool.length)];
        const value = this.matrixStreamValue(index);
        const top = (landing.lineIndex - MATRIX_STREAM_ROWS + 1) * 0.82;
        const delay = 0.2 + seededUnit(index, 97) * 2.2;
        const duration = 12.8 + seededUnit(index, 101) * 3.6;
        const fall = 190 + seededUnit(index, 103) * 120;
        const drift = Math.round((seededUnit(index, 107) - 0.5) * 38);

        return {
          id: `matrix-stream-${index}`,
          value,
          style: {
            "--stream-x": `${landing.charIndex}ch`,
            "--stream-y": `${top.toFixed(2)}em`,
            "--stream-delay": `${delay.toFixed(2)}s`,
            "--stream-duration": `${duration.toFixed(2)}s`,
            "--stream-fall": `-${Math.round(fall)}px`,
            "--stream-drift": `${drift}px`,
            "--stream-drift-mid": `${Math.round(drift * 0.62)}px`,
            "--stream-drift-low": `${Math.round(drift * 0.28)}px`,
          },
        };
      });
    },
    matrixStreamValue(streamIndex) {
      return Array.from({ length: MATRIX_STREAM_ROWS }, (_, rowIndex) => {
        if (rowIndex === MATRIX_STREAM_ROWS - 1) return "#";
        const glyphIndex = (streamIndex * 13 + rowIndex * 7) % SIGNAL_GLYPHS.length;
        return SIGNAL_GLYPHS[glyphIndex];
      }).join("\n");
    },
    buildControlLetters() {
      const chars = Array.from(CONTROL_PHRASE);
      const revealOrder = chars
        .map((_, index) => ({ index, sort: seededUnit(index, 41) }))
        .sort((left, right) => left.sort - right.sort);
      const revealRankByIndex = new Map(revealOrder.map((entry, rank) => [entry.index, rank]));

      return chars.map((value, index) => {
        const revealRank = revealRankByIndex.get(index) ?? index;
        const zone = CONTROL_FAULT_ZONES[Math.floor((index / Math.max(1, chars.length)) * CONTROL_FAULT_ZONES.length)];
        const letterDelay = 1.75 + revealRank * 0.13 + seededUnit(index, 7) * 0.85;
        const faultDelay = 18 + zone * 5.8 + seededUnit(index, 13) * 2.6;
        const faultCycle = 46 + zone * 7 + seededUnit(index, 19) * 9;
        const fallDrift = Math.round((seededUnit(index, 23) - 0.5) * 32);

        return {
          id: `control-${index}`,
          value,
          style: {
            "--letter-delay": `${letterDelay.toFixed(2)}s`,
            "--fault-delay": `${faultDelay.toFixed(2)}s`,
            "--fault-cycle": `${faultCycle.toFixed(2)}s`,
            "--fall-drift": `${fallDrift}px`,
          },
        };
      });
    },
    buildRainColumns() {
      return Array.from({ length: RAIN_COLUMN_COUNT }, (_, index) => {
        const glyphs = Array.from({ length: 7 + (index % 4) }, (_, glyphIndex) =>
          SIGNAL_GLYPHS[(index * 7 + glyphIndex * 3) % SIGNAL_GLYPHS.length],
        ).join("\n");
        const x = Math.round((4 + seededUnit(index, 2) * 92) * 100) / 100;
        const delay = 0.2 + seededUnit(index, 5) * 3.1;
        const duration = 3.8 + seededUnit(index, 8) * 2.4;
        const drift = Math.round((seededUnit(index, 13) - 0.5) * 38);
        return {
          id: `signal-${index}`,
          value: glyphs,
          style: {
            "--drop-x": `${x}%`,
            "--drop-delay": `${delay.toFixed(2)}s`,
            "--drop-duration": `${duration.toFixed(2)}s`,
            "--drop-drift": `${drift}px`,
          },
        };
      });
    },
    jumpHashSpark() {
      const nextIndex = Math.floor(Math.random() * HASH_POSITIONS.length);
      this.activeHashSpark = HASH_POSITIONS[nextIndex];
    },
  },
};
</script>
