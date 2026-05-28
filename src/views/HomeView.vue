<template>
  <section class="home-view">
    <HomeHero />
    <HomeGuideDeck />
  </section>
</template>

<script>
import HomeGuideDeck from "@/components/HomeGuideDeck.vue";
import HomeHero from "@/components/HomeHero.vue";

export default {
  name: "HomeView",
  components: {
    HomeGuideDeck,
    HomeHero,
  },
};
</script>
