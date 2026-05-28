<template>
  <VulnerabilityToolWorkbench tool-key="sqlmap" />
</template>

<script>
import VulnerabilityToolWorkbench from "@/components/VulnerabilityToolWorkbench.vue";

export default {
  name: "SqlmapView",
  components: {
    VulnerabilityToolWorkbench,
  },
};
</script>
