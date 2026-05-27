<template>
  <section class="login-view" aria-label="Acceso a Caligo">
    <MatrixRain />
    <div class="login-shell">
      <form class="login-panel" @submit.prevent="enterWithoutCredentials">
        <div class="login-logo-stage" aria-hidden="true">
          <span class="login-logo-orbit login-logo-orbit--outer"></span>
          <span class="login-logo-orbit login-logo-orbit--inner"></span>
          <span class="login-logo-glow"></span>
          <img class="login-logo" src="@/assets/images/logo-login.png" alt="" />
        </div>
        <img class="login-wordmark" src="@/assets/images/caligo-wordmark.png" alt="Caligo" />
        <span class="eyebrow">Acceso restringido</span>
        <label for="email">Correo</label>
        <input id="email" type="email" placeholder="analista@caligo.local" autocomplete="email" />

        <label for="password">Clave</label>
        <input id="password" type="password" placeholder="Clave de acceso" autocomplete="current-password" />

        <button type="submit">Acceder</button>
      </form>
    </div>
  </section>
</template>

<script>
import MatrixRain from "@/components/MatrixRain.vue";

export default {
  name: "LoginView",
  components: {
    MatrixRain,
  },
  methods: {
    enterWithoutCredentials() {
      this.$router.push({ name: "home" });
    },
  },
};
</script>
