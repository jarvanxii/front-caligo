<template>
  <IdentityWorkbench :mode="mode" />
</template>

<script>
import IdentityWorkbench from "@/components/IdentityWorkbench.vue";

export default {
  name: "WhoamiView",
  components: {
    IdentityWorkbench,
  },
  props: {
    mode: {
      type: String,
      default: "combined",
    },
  },
};
</script>
