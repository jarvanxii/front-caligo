<template>
  <ModuleWorkspace :page="page" />
</template>

<script>
import ModuleWorkspace from "@/components/ModuleWorkspace.vue";
import { modulePages } from "@/data/modulePages";

export default {
  name: "ModuleCatalogView",
  components: {
    ModuleWorkspace,
  },
  computed: {
    page() {
      return modulePages[this.$route.meta?.moduleKey] || modulePages.reconocimiento;
    },
  },
};
</script>
