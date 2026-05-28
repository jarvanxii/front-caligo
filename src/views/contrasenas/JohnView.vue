<template>
  <PasswordCrackWorkbench tool="john" />
</template>

<script>
import PasswordCrackWorkbench from "@/components/PasswordCrackWorkbench.vue";

export default {
  name: "JohnView",
  components: {
    PasswordCrackWorkbench,
  },
};
</script>
