<template>
  <VpnWorkbench :initial-protocol="initialProtocol" />
</template>

<script>
import VpnWorkbench from "@/components/VpnWorkbench.vue";

export default {
  name: "VpnsView",
  components: {
    VpnWorkbench,
  },
  props: {
    initialProtocol: {
      type: String,
      default: "wireguard",
    },
  },
};
</script>
