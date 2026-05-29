<template>
  <OsintExposureWorkbench tool-key="passwordExposure" />
</template>

<script>
import OsintExposureWorkbench from "@/components/OsintExposureWorkbench.vue";

export default {
  name: "PasswordExposureView",
  components: {
    OsintExposureWorkbench,
  },
};
</script>
