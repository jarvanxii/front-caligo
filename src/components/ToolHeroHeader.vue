<template>
  <header class="tool-hero" :class="{ 'tool-hero--compact': compact }" :style="heroStyle">
    <div class="tool-hero__visual" aria-hidden="true">
      <div class="tool-hero__logo-stack">
        <span
          v-for="logo in logoItems"
          :key="logo.key"
          class="tool-hero__logo"
          :class="{ 'tool-hero__logo--fallback': !logo.src }"
        >
          <img v-if="logo.src" :src="logo.src" :alt="`${logo.label} logo`" />
          <strong v-else>{{ logo.mark }}</strong>
        </span>
      </div>
      <i></i>
    </div>

    <div class="tool-hero__body">
      <span class="tool-hero__eyebrow">{{ resolvedEyebrow }}</span>
      <h1 :id="titleId">{{ resolvedTitle }}</h1>
      <p>{{ resolvedSummary }}</p>
    </div>

    <dl v-if="visibleMeta.length" class="tool-hero__meta" aria-label="Datos de la herramienta">
      <div v-for="item in visibleMeta" :key="item.label">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </div>
    </dl>
  </header>
</template>

<script>
import { findCatalogTool, toolCatalog } from "@/data/toolCatalog";
import { toolCssVars, toolMark } from "@/data/toolBranding";
import { toolLogo } from "@/data/toolLogos";

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default {
  name: "ToolHeroHeader",
  props: {
    tool: {
      type: Object,
      default: () => ({}),
    },
    toolId: {
      type: String,
      default: "",
    },
    logoTools: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: "",
    },
    eyebrow: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    titleId: {
      type: String,
      default: undefined,
    },
    meta: {
      type: Array,
      default: () => [],
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    catalogTool() {
      return this.resolveTool(this.toolId || this.tool?.id || this.tool?.key || this.tool?.routeName || this.tool?.serverId);
    },
    primaryTool() {
      return {
        ...(this.catalogTool || {}),
        ...(this.tool || {}),
        id: this.catalogTool?.id || this.tool?.id || this.tool?.key || this.toolId,
        label: this.title || this.tool?.label || this.tool?.title || this.catalogTool?.label,
        command: this.tool?.command || this.catalogTool?.command,
      };
    },
    resolvedTitle() {
      return this.title || this.tool?.title || this.tool?.label || this.catalogTool?.label || "Herramienta";
    },
    resolvedEyebrow() {
      return this.eyebrow || this.tool?.eyebrow || this.catalogTool?.moduleLabel || "Caligo lab";
    },
    resolvedSummary() {
      return this.summary || this.tool?.summary || this.tool?.purpose || this.catalogTool?.purpose || "Interfaz operativa conectada al laboratorio Caligo.";
    },
    heroStyle() {
      return toolCssVars(this.primaryTool);
    },
    logoItems() {
      const refs = this.logoTools.length ? this.logoTools : [this.primaryTool];
      const seen = new Set();
      return refs
        .map((entry) => this.normalizeLogoTool(entry))
        .filter((entry) => {
          const key = entry.id || entry.serverId || entry.label || entry.command;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 4)
        .map((entry) => ({
          key: entry.id || entry.serverId || entry.label || entry.command,
          label: entry.label || entry.title || entry.name || entry.id || "Herramienta",
          src: toolLogo(entry),
          mark: toolMark(entry),
        }));
    },
    visibleMeta() {
      const base = [
        { label: "Motor", value: this.primaryTool.command || this.primaryTool.serverId || "Caligo" },
        { label: "Módulo", value: this.primaryTool.moduleLabel || this.moduleFromEyebrow },
      ];
      const ordered = this.meta.length ? [...this.meta, ...base] : base;
      const seen = new Set();
      return ordered
        .filter((item) => item && item.value !== undefined && item.value !== null && String(item.value).trim())
        .filter((item) => {
          const key = String(item.label).toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 4);
    },
    moduleFromEyebrow() {
      return String(this.resolvedEyebrow).split("/")[0]?.trim() || "Lab";
    },
  },
  methods: {
    resolveTool(ref) {
      if (!ref) return null;
      const value = typeof ref === "string" ? ref : ref.id || ref.key || ref.routeName || ref.serverId || ref.command || ref.label || ref.title;
      const normalized = normalize(value);
      return (
        findCatalogTool(value) ||
        toolCatalog.find((item) => {
          const candidates = [item.id, item.serverId, item.routeName, item.command, item.label].map(normalize);
          return candidates.includes(normalized);
        }) ||
        null
      );
    },
    normalizeLogoTool(entry) {
      if (typeof entry === "string") {
        return this.resolveTool(entry) || { id: entry, label: entry };
      }
      const catalog = this.resolveTool(entry);
      return {
        ...(catalog || {}),
        ...entry,
        id: catalog?.id || entry.id || entry.key || entry.serverId,
        label: entry.label || entry.title || catalog?.label,
        command: entry.command || catalog?.command,
      };
    },
  },
};
</script>
