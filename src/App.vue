<template>
  <AppHeader v-if="!$route.meta.hideHeader" />
  <main
    :class="[
      'app-shell',
      {
        'app-shell--with-header': !$route.meta.hideHeader,
        'app-shell--auth': $route.meta.authLayout,
      },
    ]"
  >
    <router-view />
  </main>
  <PrivacyFooter />
</template>

<script>
import { defineAsyncComponent } from "vue";

const AppHeader = defineAsyncComponent(() => import("@/components/AppHeader.vue"));
const PrivacyFooter = defineAsyncComponent(() => import("@/components/PrivacyFooter.vue"));

export default {
  name: "App",
  components: {
    AppHeader,
    PrivacyFooter,
  },
};
</script>
