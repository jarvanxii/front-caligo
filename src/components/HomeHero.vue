<template>
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
            <span>Sesión</span>
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
</template>

<script>
import AsciiDescent from "@/components/AsciiDescent.vue";

export default {
  name: "HomeHero",
  components: {
    AsciiDescent,
  },
  computed: {
    apiBaseUrl() {
      return this.$store.state.apiBaseUrl?.replace(/^https?:\/\//, "") || "sin configurar";
    },
    currentUser() {
      return this.$store.state.user?.username || "sin sesión";
    },
    workflow() {
      return [
        { code: "01", title: "Reconocimiento", detail: "URLs, DNS, Nmap y OpenVAS." },
        { code: "02", title: "Validación", detail: "Metasploit e Hydra bajo alcance." },
        { code: "03", title: "Evidencia", detail: "Resultados, trazas e informes." },
      ];
    },
  },
};
</script>
