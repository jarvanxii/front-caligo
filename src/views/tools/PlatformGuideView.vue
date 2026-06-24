<template>
  <section class="platform-settings platform-guide-page" aria-labelledby="platform-guide-title">
    <header class="platform-settings__hero">
      <div>
        <span class="platform-settings__eyebrow">Caligo // guía operativa</span>
        <h1 id="platform-guide-title">Manual técnico de la plataforma</h1>
        <p>
          Referencia navegable de cada módulo y herramienta: motor usado, entrada esperada,
          flujo de trabajo, salida útil y notas de operación.
        </p>
      </div>
      <aside class="platform-settings__status" aria-label="Resumen de guía">
        <span>Herramientas</span>
        <strong>{{ guideToolCount }}</strong>
        <small>{{ platformGuide.length }} módulos documentados</small>
      </aside>
    </header>

    <div class="platform-guide-page__sections">
      <details
        v-for="section in platformGuide"
        :key="section.id"
        class="platform-guide-page__section"
        :class="`platform-guide-page__section--${section.id}`"
        :open="section.id === 'osint'"
      >
        <summary>
          <span>
            <small>{{ section.eyebrow }}</small>
            <strong>{{ section.title }}</strong>
          </span>
          <em>{{ section.tools.length }} herramientas</em>
        </summary>

        <div class="platform-guide-page__section-intro">
          <p>{{ section.summary }}</p>
          <span>{{ section.workflow }}</span>
        </div>

        <ul class="platform-guide-page__tools">
          <li v-for="tool in section.tools" :key="tool.id">
            <article class="platform-guide-card" :style="toolCssVars(tool)">
              <header class="platform-guide-card__head">
                <span class="platform-guide-card__logo" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
                  <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
                  <strong v-else>{{ toolMark(tool) }}</strong>
                </span>

                <div class="platform-guide-card__title">
                  <small>{{ tool.engine }}</small>
                  <h2>{{ tool.name }}</h2>
                </div>

                <RouterLink class="platform-guide-card__open" :to="{ name: tool.routeName }">
                  Abrir
                </RouterLink>
              </header>

              <p class="platform-guide-card__objective">{{ tool.guide?.objective || tool.purpose }}</p>

              <div class="platform-guide-card__meta" aria-label="Ficha tecnica">
                <div>
                  <span>Entrada</span>
                  <p>{{ tool.input }}</p>
                </div>
                <div>
                  <span>Uso principal</span>
                  <p>{{ tool.purpose }}</p>
                </div>
              </div>

              <section class="platform-guide-card__block">
                <h3>Programas y motores por debajo</h3>
                <ul class="platform-guide-card__chips">
                  <li v-for="program in guideList(tool, 'programs')" :key="program">{{ program }}</li>
                </ul>
              </section>

              <section class="platform-guide-card__flow">
                <div>
                  <h3>Cómo se usa</h3>
                  <ol>
                    <li v-for="step in guideList(tool, 'howToUse')" :key="step">{{ step }}</li>
                  </ol>
                </div>
                <div>
                  <h3>Salida esperada</h3>
                  <ul>
                    <li v-for="item in guideList(tool, 'output')" :key="item">{{ item }}</li>
                  </ul>
                </div>
                <div>
                  <h3>Notas operativas</h3>
                  <ul>
                    <li v-for="note in guideList(tool, 'notes')" :key="note">{{ note }}</li>
                  </ul>
                </div>
              </section>
            </article>
          </li>
        </ul>
      </details>
    </div>
  </section>
</template>

<script>
import { guideToolCount, platformGuide } from "@/data/platformGuide";
import { toolCssVars, toolMark } from "@/data/toolBranding";
import { toolLogo } from "@/data/toolLogos";

export default {
  name: "PlatformGuideView",
  computed: {
    platformGuide() {
      return platformGuide;
    },
    guideToolCount() {
      return guideToolCount;
    },
  },
  methods: {
    toolCssVars,
    toolMark,
    toolLogo,
    guideList(tool, key) {
      const list = tool.guide?.[key];
      if (Array.isArray(list) && list.length) return list;
      if (key === "programs") return [tool.engine];
      if (key === "howToUse") return [tool.usage];
      if (key === "output") return ["Resultado técnico interpretado por Caligo y salida del motor cuando esté disponible."];
      if (key === "notes") return ["Usa la herramienta únicamente dentro del alcance autorizado."];
      return [];
    },
  },
};
</script>
