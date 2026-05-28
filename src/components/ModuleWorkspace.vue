<template>
  <section
    id="module-overview"
    class="module-workspace"
    :class="`module-workspace--${page.accent}`"
    :aria-labelledby="`${page.key}-title`"
  >
    <div class="module-workspace__frame">
      <header class="module-workspace__header">
        <div class="module-workspace__identity">
          <span class="module-workspace__eyebrow">{{ page.eyebrow }}</span>
          <h1 :id="`${page.key}-title`">{{ page.title }}</h1>
          <p>{{ page.summary }}</p>
        </div>

        <dl class="module-workspace__status" aria-label="Estado del modulo">
          <div>
            <dt>Estado</dt>
            <dd>{{ page.status }}</dd>
          </div>
          <div>
            <dt>Senal</dt>
            <dd>{{ page.signal }}</dd>
          </div>
        </dl>
      </header>

      <dl class="module-workspace__stats" aria-label="Resumen tecnico">
        <div v-for="stat in page.stats" :key="stat[0]">
          <dt>{{ stat[0] }}</dt>
          <dd>{{ stat[1] }}</dd>
        </div>
      </dl>

      <div class="module-workspace__terminal" aria-label="Flujo y focos de trabajo">
        <section class="module-workspace__panel">
          <header>
            <span>Pipeline</span>
            <code>{{ page.key }}</code>
          </header>
          <ol>
            <li v-for="(stage, index) in page.stages" :key="stage">
              <span>{{ formatIndex(index) }}</span>
              <strong>{{ stage }}</strong>
            </li>
          </ol>
        </section>

        <section class="module-workspace__panel">
          <header>
            <span>Foco</span>
            <code>scope</code>
          </header>
          <ul>
            <li v-for="(item, index) in page.focus" :key="item">
              <span>{{ formatIndex(index) }}</span>
              <strong>{{ item }}</strong>
            </li>
          </ul>
        </section>
      </div>

      <section v-if="localUtilities.length" class="module-workspace__tools" aria-label="Herramientas locales de la vista">
        <article v-for="utility in localUtilities" :id="utility.id" :key="utility.id" class="module-workspace__tool-row">
          <code>{{ utility.code }}</code>
          <strong>{{ utility.label }}</strong>
          <span>{{ utility.description }}</span>
        </article>
      </section>
    </div>
  </section>
</template>

<script>
export default {
  name: "ModuleWorkspace",
  props: {
    page: {
      type: Object,
      required: true,
    },
  },
  computed: {
    localUtilities() {
      return (this.page.utilities ?? []).filter((utility) => !utility.routeName);
    },
  },
  methods: {
    formatIndex(index) {
      return String(index + 1).padStart(2, "0");
    },
  },
};
</script>
