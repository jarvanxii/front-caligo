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
            <span>Guía</span>
            <h2 id="guide-modal-title">Mapa de herramientas</h2>
            <p>Explicación breve y técnica de cada utilidad integrada, agrupada por las opciones del header.</p>
            <button type="button" aria-label="Cerrar guía" @click="$emit('close')">×</button>
          </header>

          <details v-for="section in platformGuide" :key="section.id" class="guide-modal__group" :open="section.id === 'reconocimiento'">
            <summary>
              <span>{{ section.title }}</span>
              <small>{{ section.tools.length }} herramientas</small>
            </summary>

            <ul>
              <li v-for="tool in section.tools" :key="tool.id">
                <RouterLink :to="{ name: tool.routeName }" @click="$emit('close')">
                  <span class="guide-modal__tool-name">{{ tool.name }}</span>
                  <span class="guide-modal__tool-copy">
                    <strong>{{ tool.purpose }}</strong>
                    <small>{{ tool.engine }} · Entrada: {{ tool.input }}</small>
                  </span>
                </RouterLink>
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
};
</script>
