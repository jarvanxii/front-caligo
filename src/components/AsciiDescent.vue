<template>
  <section class="ascii-descent" aria-label="Letras ASCII de Caligo">
    <div class="ascii-descent__frame">
      <div class="ascii-descent__meta ascii-descent__meta--top" aria-hidden="true">
        <span>CALIGO / SEC-LAB</span>
        <span>AUTHORIZED RANGE</span>
      </div>
      <div class="ascii-descent__lockup" aria-hidden="true">
        <pre class="ascii-descent__art ascii-descent__word"><span
          v-for="(line, lineIndex) in renderedWordLines"
          :key="`word-line-${lineIndex}`"
          class="ascii-descent__line"
        ><span
          v-for="(char, charIndex) in line"
          :key="`word-char-${lineIndex}-${charIndex}`"
          :class="['ascii-descent__char', `ascii-descent__char--${char.tone}`]"
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

export default {
  name: "AsciiDescent",
  computed: {
    renderedWordLines() {
      return WORD_LINES.map((line) =>
        Array.from(line.padEnd(WORD_WIDTH)).map((value, charIndex) => ({
          value,
          tone: this.toneForWordCharacter(value, charIndex),
        })),
      );
    },
  },
  methods: {
    toneForWordCharacter(value, charIndex) {
      if (value === " ") return "space";
      return `word-${Math.min(5, Math.floor(charIndex / WORD_BAND_WIDTH))}`;
    },
  },
};
</script>
