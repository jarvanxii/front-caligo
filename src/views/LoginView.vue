<template>
  <section class="login-view" aria-label="Acceso a Caligo">
    <MatrixRain />
    <div class="login-shell">
      <form class="login-panel" @submit.prevent="enter">
        <div class="login-logo-stage" aria-hidden="true">
          <span class="login-logo-orbit login-logo-orbit--outer"></span>
          <span class="login-logo-orbit login-logo-orbit--inner"></span>
          <span class="login-logo-glow"></span>
          <img class="login-logo" src="@/assets/images/logo-login.png" alt="" />
        </div>
        <img class="login-wordmark" src="@/assets/images/caligo-wordmark.png" alt="Caligo" />
        <span class="eyebrow">Acceso restringido</span>
        <label for="username">Usuario</label>
        <input id="username" v-model.trim="username" type="text" placeholder="hacker" autocomplete="username" />

        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" placeholder="password123" autocomplete="current-password" />

        <p v-if="error" class="login-panel__error">{{ error }}</p>
        <button type="submit" :disabled="loading" :aria-busy="loading.toString()">
          {{ loading ? "Validando" : "Acceder" }}
        </button>

        <div class="login-portfolio-access" aria-label="Acceso de demostración sin usuario">
          <span>Modo portfolio</span>
          <button type="button" :disabled="portfolioLoading || loading" @click="enterPortfolio">
            {{ portfolioLoading ? "Abriendo demostración" : "ACCESO SIN USUARIO" }}
          </button>
        </div>
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
  data() {
    return {
      username: "",
      password: "",
      loading: false,
      portfolioLoading: false,
      error: "",
    };
  },
  methods: {
    async enter() {
      this.loading = true;
      this.error = "";
      try {
        if (!this.username || !this.password) {
          throw new Error("Introduce usuario y contraseña");
        }
        await this.$store.dispatch("login", {
          username: this.username,
          password: this.password,
        });
        this.$router.push({ name: "home" });
      } catch (error) {
        this.error = error.message || "No se pudo entrar en Caligo";
      } finally {
        this.loading = false;
      }
    },
    async enterPortfolio() {
      this.portfolioLoading = true;
      this.error = "";
      try {
        await this.$store.dispatch("enterPortfolio");
        this.$router.push({ name: "home" });
      } catch (error) {
        this.error = error.message || "No se pudo abrir el modo portfolio";
      } finally {
        this.portfolioLoading = false;
      }
    },
  },
};
</script>
