<template>
  <header class="app-header">
    <nav class="app-header__nav" aria-label="Navegacion principal">
      <RouterLink class="app-header__brand" :to="{ name: 'home' }" aria-label="Ir al inicio">
        <img :src="wordmarkUrl" alt="Caligo" />
      </RouterLink>

      <div class="app-header__links">
        <a v-for="item in navItems" :key="item.id" :href="item.href">
          {{ item.label }}
        </a>
      </div>

      <button class="app-header__settings" type="button" aria-label="Abrir ajustes" title="Ajustes">
        <span aria-hidden="true">⚙</span>
      </button>
    </nav>
  </header>
</template>

<script>
import wordmarkUrl from "@/assets/images/caligo-wordmark.png";

export default {
  name: "AppHeader",
  data() {
    return {
      wordmarkUrl,
      navItems: [
        { id: "openvas", label: "OpenVAS", href: "#openvas" },
        { id: "metasploit", label: "Metasploit", href: "#metasploit" },
        { id: "urls", label: "URLs", href: "#urls" },
        { id: "contrasenas", label: "Contraseñas", href: "#contrasenas" },
        { id: "esteganografia", label: "Esteganografía", href: "#esteganografia" },
      ],
    };
  },
};
</script>
