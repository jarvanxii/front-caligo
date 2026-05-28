<template>
  <section class="home-view">
    <HomeHero />

    <section id="modulos" class="home-tooldeck" aria-labelledby="module-section-title">
      <header class="home-section-head">
        <div>
          <span class="eyebrow">Dominios de trabajo</span>
          <h2 id="module-section-title">Herramientas organizadas por fase</h2>
        </div>
        <p>Entra por el objetivo: descubrir, validar, transformar o analizar artefactos.</p>
      </header>

      <div class="home-toolgrid">
        <RouterLink
          v-for="module in modules"
          :id="module.key"
          :key="module.key"
          :to="{ name: module.routeName }"
          class="home-toolcard"
        >
          <span class="home-toolcard__status" :class="{ 'is-operational': module.status === 'operativo' }">
            {{ module.status }}
          </span>
          <strong>{{ module.name }}</strong>
          <p>{{ module.description }}</p>
          <span class="home-toolcard__enter">Entrar</span>
        </RouterLink>
      </div>
    </section>

    <section id="operaciones" class="home-ops" aria-label="Principios operativos">
      <article v-for="principle in principles" :key="principle.code">
        <span>{{ principle.code }}</span>
        <strong>{{ principle.title }}</strong>
        <p>{{ principle.detail }}</p>
      </article>
    </section>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import HomeHero from "@/components/HomeHero.vue";

export default {
  name: "HomeView",
  components: {
    HomeHero,
  },
  computed: {
    ...mapGetters({
      modules: "availableModules",
    }),
    principles() {
      return [
        { code: "scope", title: "Alcance cerrado", detail: "Objetivos privados, rangos autorizados y validacion previa en backend." },
        { code: "trace", title: "Ejecucion auditable", detail: "Jobs con usuario, parametros, progreso y salida tecnica conservada." },
        { code: "ops", title: "Herramientas reales", detail: "El navegador orquesta; el servidor ejecuta motores instalados y controlados." },
      ];
    },
  },
};
</script>
