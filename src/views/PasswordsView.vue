<template>
  <ModuleWorkspace :page="page" />
</template>

<script>
import ModuleWorkspace from "@/components/ModuleWorkspace.vue";
import { modulePages } from "@/data/modulePages";

export default {
  name: "PasswordsView",
  components: {
    ModuleWorkspace,
  },
  data() {
    return {
      page: modulePages.contrasenas,
    };
  },
};
</script>

