<template>
  <section class="home-view">
    <section class="home-hero" aria-labelledby="home-title">
      <AsciiDescent />

      <div class="home-view__hero">
        <div class="home-view__copy">
          <span class="eyebrow">Laboratorio de ciberseguridad controlada</span>
          <h1 id="home-title">Caligo</h1>
          <p>
            Una consola web para centralizar analisis, codificacion, esteganografia y
            herramientas ofensivas en entornos seguros.
          </p>
          <div class="home-view__metrics" aria-label="Resumen del laboratorio">
            <span><strong>05</strong> modulos base</span>
            <span><strong>Lab</strong> aislado</span>
            <span><strong>Trace</strong> activo</span>
          </div>
          <div class="home-view__actions">
            <a class="primary-action" href="#openvas">Abrir OpenVAS</a>
            <a class="secondary-action" href="#modulos">Ver modulos</a>
          </div>
        </div>

        <aside class="signal-panel" aria-label="Estado inicial del laboratorio">
          <div class="signal-panel__header">
            <span>Estado</span>
            <strong>Scaffold activo</strong>
          </div>
          <dl>
            <div>
              <dt>Frontend</dt>
              <dd>Vue 3</dd>
            </div>
            <div>
              <dt>Rutas</dt>
              <dd>Vue Router</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>Vuex</dd>
            </div>
          </dl>
          <div class="signal-panel__trace" aria-label="Traza del sistema">
            <span>scope: authorized-lab</span>
            <span>mode: controlled</span>
            <span>audit: enabled</span>
          </div>
        </aside>
      </div>
    </section>

    <section id="modulos" class="module-section" aria-labelledby="module-section-title">
      <div class="section-heading">
        <span class="eyebrow">Primer mapa de trabajo</span>
        <h2 id="module-section-title">Modulos previstos</h2>
      </div>

      <div class="module-grid">
        <article v-for="module in modules" :id="module.key" :key="module.key" class="module-card">
          <span>{{ module.status }}</span>
          <h3>{{ module.name }}</h3>
          <p>{{ moduleDescriptions[module.key] }}</p>
        </article>
      </div>
    </section>

    <section id="operaciones" class="operations-band" aria-label="Principios operativos">
      <article>
        <span>01</span>
        <strong>Entornos permitidos</strong>
        <p>Las acciones se limitaran a laboratorios, rangos autorizados y activos definidos.</p>
      </article>
      <article>
        <span>02</span>
        <strong>Trazabilidad</strong>
        <p>Cada ejecucion debera dejar registro, parametros y resultado verificable.</p>
      </article>
      <article>
        <span>03</span>
        <strong>Aislamiento</strong>
        <p>Las herramientas pesadas viviran en workers separados del panel principal.</p>
      </article>
    </section>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import AsciiDescent from "@/components/AsciiDescent.vue";

export default {
  name: "HomeView",
  components: {
    AsciiDescent,
  },
  computed: {
    ...mapGetters({
      modules: "availableModules",
    }),
    moduleDescriptions() {
      return {
        openvas: "Orquestacion futura de escaneos Greenbone/OpenVAS con resultados normalizados.",
        metasploit: "Lanzamiento controlado de verificaciones y laboratorios de explotacion autorizados.",
        urls: "Analisis, normalizacion y comprobacion de URLs, endpoints y superficies web.",
        contrasenas: "Laboratorio controlado para John, Hashcat y gestion segura de hashes.",
        esteganografia: "Herramientas para ocultacion, extraccion, encoding y transformaciones de datos.",
      };
    },
  },
};
</script>
