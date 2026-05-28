<template>
  <AppHeader v-if="!$route.meta.hideHeader" />
  <AppSidebar v-if="!$route.meta.hideHeader && !$route.meta.hideSidebar" />
  <main
    :class="[
      'app-shell',
      {
        'app-shell--with-header': !$route.meta.hideHeader,
        'app-shell--with-sidebar': !$route.meta.hideHeader && !$route.meta.hideSidebar,
        'app-shell--auth': $route.meta.authLayout,
      },
    ]"
  >
    <router-view v-slot="{ Component, route }">
      <KeepAlive v-if="shouldCacheRoute(route)">
        <component :is="Component" :key="route.name || route.fullPath" />
      </KeepAlive>
      <component v-else :is="Component" :key="route.name || route.fullPath" />
    </router-view>
  </main>
  <PrivacyFooter />
</template>

<script>
import { defineAsyncComponent } from "vue";

const AppHeader = defineAsyncComponent(() => import("@/components/AppHeader.vue"));
const AppSidebar = defineAsyncComponent(() => import("@/components/AppSidebar.vue"));
const PrivacyFooter = defineAsyncComponent(() => import("@/components/PrivacyFooter.vue"));

export default {
  name: "App",
  components: {
    AppHeader,
    AppSidebar,
    PrivacyFooter,
  },
  methods: {
    shouldCacheRoute(route) {
      return !route.meta.authLayout && this.$store.getters.isAuthenticated;
    },
  },
};
</script>
