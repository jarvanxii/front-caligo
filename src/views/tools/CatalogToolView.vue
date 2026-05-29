<template>
  <ToolCatalogWorkbench :tool-id="toolId" />
</template>

<script>
import ToolCatalogWorkbench from "@/components/ToolCatalogWorkbench.vue";

export default {
  name: "CatalogToolView",
  components: {
    ToolCatalogWorkbench,
  },
  props: {
    toolId: {
      type: String,
      required: true,
    },
  },
};
</script>
