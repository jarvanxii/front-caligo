<template>
  <Teleport to="body">
    <Transition name="settings-modal">
      <section
        v-if="open"
        class="guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        @click.self="$emit('close')"
      >
        <section class="guide-modal__panel">
          <header class="guide-modal__header">
            <span>Guía técnica</span>
            <h2 id="guide-modal-title">Manual operativo de Caligo</h2>
            <p>
              Cada herramienta ocupa una ficha completa: qué problema resuelve, qué motor se ejecuta por debajo,
              cómo se usa desde la interfaz y qué salida debes esperar.
            </p>
            <button type="button" aria-label="Cerrar guía" @click="$emit('close')">×</button>
          </header>

          <details v-for="section in platformGuide" :key="section.id" class="guide-modal__group" :open="section.id === 'reconocimiento'">
            <summary>
              <span>
                <strong>{{ section.title }}</strong>
                <em>{{ section.eyebrow }}</em>
              </span>
              <small>{{ section.tools.length }} herramientas</small>
            </summary>

            <div class="guide-modal__group-intro">
              <p>{{ section.summary }}</p>
              <span>{{ section.workflow }}</span>
            </div>

            <ul class="guide-modal__tools">
              <li v-for="tool in section.tools" :key="tool.id">
                <article class="guide-modal__tool-card" :style="toolCssVars(tool)">
                  <header class="guide-modal__tool-head">
                    <span class="guide-modal__tool-mark" :class="{ 'has-logo': toolLogo(tool) }" aria-hidden="true">
                      <img v-if="toolLogo(tool)" :src="toolLogo(tool)" alt="" loading="lazy" />
                      <strong v-else>{{ toolMark(tool) }}</strong>
                    </span>

                    <span class="guide-modal__tool-title">
                      <small>{{ tool.engine }}</small>
                      <strong>{{ tool.name }}</strong>
                    </span>

                    <RouterLink class="guide-modal__tool-open" :to="{ name: tool.routeName }" @click="$emit('close')">
                      Abrir herramienta
                    </RouterLink>
                  </header>

                  <p class="guide-modal__tool-objective">{{ tool.guide?.objective || tool.purpose }}</p>

                  <section class="guide-modal__tool-meta" aria-label="Ficha técnica">
                    <div>
                      <span>Entrada esperada</span>
                      <p>{{ tool.input }}</p>
                    </div>
                    <div>
                      <span>Para qué sirve</span>
                      <p>{{ tool.purpose }}</p>
                    </div>
                  </section>

                  <section class="guide-modal__tool-stack">
                    <span>Programas y motores por debajo</span>
                    <ul>
                      <li v-for="program in guideList(tool, 'programs')" :key="program">{{ program }}</li>
                    </ul>
                  </section>

                  <section class="guide-modal__tool-flow">
                    <h3>Cómo se usa</h3>
                    <ol>
                      <li v-for="step in guideList(tool, 'howToUse')" :key="step">{{ step }}</li>
                    </ol>
                  </section>

                  <section class="guide-modal__tool-output">
                    <div>
                      <h3>Qué devuelve</h3>
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
        </section>
      </section>
    </Transition>
  </Teleport>
</template>

<script>
import { platformGuide } from "@/data/platformGuide";
import { toolCssVars, toolMark } from "@/data/toolBranding";
import { toolLogo } from "@/data/toolLogos";

export default {
  name: "GuideModal",
  props: {
    open: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["close"],
  computed: {
    platformGuide() {
      return platformGuide;
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
      if (key === "output") return ["Resultado técnico interpretado por Caligo y salida del motor cuando está disponible."];
      if (key === "notes") return ["Usa la herramienta únicamente dentro del alcance autorizado."];
      return [];
    },
  },
};
</script>
