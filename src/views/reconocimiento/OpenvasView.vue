<template>
  <ScannerWorkbench tool="openvas" />
</template>

<script>
import ScannerWorkbench from "@/components/ScannerWorkbench.vue";

export default {
  name: "OpenvasView",
  components: {
    ScannerWorkbench,
  },
};
</script>
