<template>
  <section class="home-view">
    <section class="home-hero" aria-labelledby="home-title">
      <AsciiDescent />

      <div class="home-command" aria-labelledby="home-title">
        <div class="home-command__copy">
          <span class="eyebrow">Centro operativo</span>
          <h1 id="home-title">Superficie, acceso y evidencia bajo control.</h1>
          <p>
            Una cabina local para lanzar herramientas de seguridad desde el servidor,
            revisar resultados y moverte entre fases sin perder trazabilidad.
          </p>
          <div class="home-command__stats" aria-label="Resumen del laboratorio">
            <span><strong>22</strong> herramientas</span>
            <span><strong>JWT</strong> activo</span>
            <span><strong>LAN</strong> backend</span>
          </div>
          <div class="home-command__actions">
            <RouterLink class="home-action home-action--primary" :to="{ name: 'reconocimiento' }">
              Abrir reconocimiento
            </RouterLink>
            <RouterLink class="home-action" :to="{ name: 'vulnerabilidades' }">
              Validar hallazgos
            </RouterLink>
          </div>
        </div>

        <aside class="home-status-board" aria-label="Estado del laboratorio">
          <div class="home-status-board__top">
            <span>caligo://runtime</span>
            <strong>Operativo</strong>
          </div>

          <div class="home-status-board__grid">
            <div>
              <span>API</span>
              <strong>{{ apiBaseUrl }}</strong>
            </div>
            <div>
              <span>Sesion</span>
              <strong>{{ currentUser }}</strong>
            </div>
            <div>
              <span>Modo</span>
              <strong>Authorized lab</strong>
            </div>
            <div>
              <span>Salida</span>
              <strong>Jobs y PDF</strong>
            </div>
          </div>

          <ol class="home-status-board__flow" aria-label="Flujo de trabajo">
            <li v-for="step in workflow" :key="step.code">
              <span>{{ step.code }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <small>{{ step.detail }}</small>
              </div>
            </li>
          </ol>

          <div class="home-status-board__trace">
            <span>scope.locked</span>
            <span>audit.enabled</span>
            <span>server.tools.synced</span>
          </div>
        </aside>
      </div>
    </section>

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
import AsciiDescent from "@/components/AsciiDescent.vue";

export default {
  name: "HomeView",
  components: {
    AsciiDescent,
  },
  computed: {
    ...mapGetters({
      modules: "availableModules",
    }),
    apiBaseUrl() {
      return this.$store.state.apiBaseUrl?.replace(/^https?:\/\//, "") || "sin configurar";
    },
    currentUser() {
      return this.$store.state.user?.username || "sin sesion";
    },
    workflow() {
      return [
        { code: "01", title: "Reconocimiento", detail: "URLs, DNS, Nmap y OpenVAS." },
        { code: "02", title: "Validacion", detail: "Metasploit e Hydra bajo alcance." },
        { code: "03", title: "Evidencia", detail: "Resultados, trazas e informes." },
      ];
    },
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
