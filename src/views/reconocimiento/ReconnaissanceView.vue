<template>
  <ModuleWorkspace :page="page" />
</template>

<script>
import ModuleWorkspace from "@/components/ModuleWorkspace.vue";
import { modulePages } from "@/data/modulePages";

export default {
  name: "ReconnaissanceView",
  components: {
    ModuleWorkspace,
  },
  data() {
    return {
      page: modulePages.reconocimiento,
    };
  },
};
</script>
