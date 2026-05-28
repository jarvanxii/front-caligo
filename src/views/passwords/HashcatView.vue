<template>
  <PasswordCrackWorkbench tool="hashcat" />
</template>

<script>
import PasswordCrackWorkbench from "@/components/PasswordCrackWorkbench.vue";

export default {
  name: "HashcatView",
  components: {
    PasswordCrackWorkbench,
  },
};
</script>
