<template>
  <ScannerWorkbench tool="nmap" />
</template>

<script>
import ScannerWorkbench from "@/components/ScannerWorkbench.vue";

export default {
  name: "NmapView",
  components: {
    ScannerWorkbench,
  },
};
</script>
