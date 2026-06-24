<template>
  <section class="home-guide" aria-labelledby="home-guide-title">
    <header class="home-guide__header">
      <span class="eyebrow">Guía operativa</span>
      <h2 id="home-guide-title">Guía operativa</h2>
    </header>

    <section class="home-guide__groups" aria-label="Resumen de herramientas">
      <article
        v-for="section in platformGuide"
        :key="section.id"
        class="home-guide__group"
        :class="`home-guide__group--${section.id}`"
      >
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
import { platformGuide } from "@/data/platformGuide";
import { toolCssVars, toolMark } from "@/data/toolBranding";
import { toolLogo } from "@/data/toolLogos";

export default {
  name: "HomeGuideDeck",
  computed: {
    platformGuide() {
      return platformGuide;
    },
  },
  methods: {
    toolCssVars,
    toolMark,
    toolLogo,
  },
};
</script>
