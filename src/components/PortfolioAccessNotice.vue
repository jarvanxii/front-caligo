<template>
  <section class="portfolio-access-notice" aria-label="Modo portfolio sin token">
    <div class="portfolio-access-notice__signal">
      <span></span>
      <strong>DEMO</strong>
    </div>
    <div class="portfolio-access-notice__copy">
      <span>Acceso sin token</span>
      <p>
        Vista preparada para revisión técnica y recruiting. Puedes explorar arquitectura, flujos y pantallas, pero la ejecución
        real de herramientas queda bloqueada hasta iniciar sesión con credenciales.
      </p>
    </div>
    <router-link class="portfolio-access-notice__link" :to="{ name: 'home' }">Volver al portfolio</router-link>
  </section>
</template>

<script>
export default {
  name: "PortfolioAccessNotice",
};
</script>
