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
        <pre class="ascii-descent__art ascii-descent__word"><span
          v-for="(line, lineIndex) in renderedWordLines"
          :key="`word-line-${lineIndex}`"
          class="ascii-descent__line"
        ><span
          v-for="(char, charIndex) in line"
          :key="`word-char-${lineIndex}-${charIndex}`"
          :class="[
            'ascii-descent__char',
            `ascii-descent__char--${char.tone}`,
            {
              'ascii-descent__char--spark': char.spark,
              'ascii-descent__char--spark-orange': char.spark && char.sparkTone === 'orange',
            },
          ]"
        >{{ char.value }}</span></span></pre>
      </div>
      <div class="ascii-descent__meta ascii-descent__meta--bottom" aria-hidden="true">
        <span>TRACE ENABLED</span>
        <span>CONTROLLED MODE</span>
      </div>
    </div>
  </section>
</template>

<script>
const WORD_BAND_WIDTH = 38;
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
const BOOT_DIM_MS = 3800;
const CONTROL_PHRASE = "CONTROL IS AN ILLUSION";
const SIGNAL_GLYPHS = "01#/_-+*:=|CALIGO";
const RAIN_COLUMN_COUNT = 54;
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
      activeHashSparkTone: "orange",
      hashSparkTimer: null,
      bootTimer: null,
      rainColumns: this.buildRainColumns(),
      controlLetters: this.buildControlLetters(),
    };
  },
  computed: {
    renderedWordLines() {
      return WORD_LINES.map((line, lineIndex) =>
        Array.from(line.padEnd(WORD_WIDTH)).map((value, charIndex) => ({
          value,
          tone: this.toneForWordCharacter(value, charIndex),
          spark: this.isActiveHashSpark(value, lineIndex, charIndex),
          sparkTone: this.activeHashSparkTone,
        })),
      );
    },
  },
  mounted() {
    this.jumpHashSpark();
    this.hashSparkTimer = window.setInterval(this.jumpHashSpark, SPARK_INTERVAL_MS);
    this.bootTimer = window.setTimeout(() => {
      this.booting = false;
    }, BOOT_DIM_MS);
  },
  beforeUnmount() {
    window.clearInterval(this.hashSparkTimer);
    window.clearTimeout(this.bootTimer);
  },
  methods: {
    buildControlLetters() {
      const chars = Array.from(CONTROL_PHRASE);
      const revealOrder = chars
        .map((_, index) => ({ index, sort: seededUnit(index, 41) }))
        .sort((left, right) => left.sort - right.sort);
      const revealRankByIndex = new Map(revealOrder.map((entry, rank) => [entry.index, rank]));

      return chars.map((value, index) => {
        const revealRank = revealRankByIndex.get(index) ?? index;
        const zone = CONTROL_FAULT_ZONES[Math.floor((index / Math.max(1, chars.length)) * CONTROL_FAULT_ZONES.length)];
        const letterDelay = 0.5 + revealRank * 0.105 + seededUnit(index, 7) * 0.55;
        const faultDelay = 10.5 + zone * 1.35;
        const faultDuration = 24 + zone * 2.4;
        const fallDrift = Math.round((seededUnit(index, 23) - 0.5) * 32);

        return {
          id: `control-${index}`,
          value,
          style: {
            "--letter-delay": `${letterDelay.toFixed(2)}s`,
            "--fault-delay": `${faultDelay.toFixed(2)}s`,
            "--fault-duration": `${faultDuration.toFixed(2)}s`,
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
        const delay = 0.22 + seededUnit(index, 5) * 2.35;
        const duration = 2 + seededUnit(index, 8) * 1.35;
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
    toneForWordCharacter(value, charIndex) {
      if (value === " ") return "space";
      return `word-${Math.min(5, Math.floor(charIndex / WORD_BAND_WIDTH))}`;
    },
    isActiveHashSpark(value, lineIndex, charIndex) {
      if (value !== "#") return false;
      return `${lineIndex}-${charIndex}` === this.activeHashSpark;
    },
    jumpHashSpark() {
      const nextIndex = Math.floor(Math.random() * HASH_POSITIONS.length);
      this.activeHashSpark = HASH_POSITIONS[nextIndex];
      this.activeHashSparkTone = "orange";
    },
  },
};
</script>
