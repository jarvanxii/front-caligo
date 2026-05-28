<template>
  <section class="scanner-workspace" :class="`scanner-workspace--${tool}`" aria-labelledby="scanner-title">
    <div class="scanner-workspace__shell">
      <header class="scanner-workspace__header">
        <div>
          <span class="eyebrow">{{ copy.eyebrow }}</span>
          <h1 id="scanner-title">{{ copy.title }}</h1>
          <p>{{ copy.summary }}</p>
        </div>

        <aside class="scanner-engine" :class="{ 'is-ready': engineReady }" aria-label="Estado del motor">
          <span>{{ engineLabel }}</span>
          <strong>{{ engineReady ? "Operativo" : "Pendiente" }}</strong>
          <small>{{ engineMessage }}</small>
        </aside>
      </header>

      <div class="scanner-layout">
        <form class="scanner-console" @submit.prevent="startScan">
          <header class="scanner-console__head">
            <span>Parámetros</span>
            <strong>{{ tool.toUpperCase() }}</strong>
          </header>

          <label for="scanner-target">Objetivo autorizado</label>
          <input
            id="scanner-target"
            v-model.trim="form.target"
            type="text"
            autocomplete="off"
            spellcheck="false"
            :placeholder="copy.placeholder"
          />

          <template v-if="isNmap">
            <div class="scanner-field-grid">
              <label>
                Perfil
                <select v-model="form.profile">
                  <option v-for="item in nmapProfiles" :key="optionValue(item)" :value="optionValue(item)">
                    {{ optionLabel(item) }}
                  </option>
                </select>
              </label>

              <label>
                Tipo
                <select v-model="form.scanType">
                  <option v-for="item in nmapScanTypes" :key="optionValue(item)" :value="optionValue(item)">
                    {{ optionLabel(item) }}
                  </option>
                </select>
              </label>

              <label>
                Puertos
                <select v-model="form.portMode">
                  <option v-for="item in nmapPortModes" :key="optionValue(item)" :value="optionValue(item)">
                    {{ optionLabel(item) }}
                  </option>
                </select>
              </label>

              <label>
                Timing
                <select v-model="form.timing">
                  <option v-for="item in nmapTimings" :key="item" :value="item">{{ item }}</option>
                </select>
              </label>
            </div>

            <div class="scanner-field-grid scanner-field-grid--ports">
              <label v-if="form.portMode === 'custom'">
                Lista
                <input v-model.trim="form.ports" type="text" placeholder="22,80,443,8000-9000" />
              </label>

              <label v-else-if="form.portMode === 'top'">
                Top ports
                <input v-model.number="form.topPorts" type="number" min="10" max="5000" step="10" />
              </label>

              <label>
                Reintentos
                <input v-model.number="form.maxRetries" type="number" min="0" max="10" step="1" />
              </label>
            </div>

            <div class="scanner-switch-grid">
              <label class="scanner-switch">
                <input v-model="form.serviceDetection" type="checkbox" />
                <span>Versiones</span>
              </label>
              <label class="scanner-switch">
                <input v-model="form.defaultScripts" type="checkbox" />
                <span>NSE seguro</span>
              </label>
              <label class="scanner-switch">
                <input v-model="form.osDetection" type="checkbox" />
                <span>OS detect</span>
              </label>
              <label class="scanner-switch">
                <input v-model="form.noPing" type="checkbox" />
                <span>-Pn</span>
              </label>
              <label class="scanner-switch">
                <input v-model="form.traceroute" type="checkbox" />
                <span>Traceroute</span>
              </label>
            </div>
          </template>

          <template v-else>
            <div class="scanner-field-grid">
              <label>
                Perfil
                <select v-model="form.profile">
                  <option v-for="item in openVasProfiles" :key="optionValue(item)" :value="optionValue(item)">
                    {{ optionLabel(item) }}
                  </option>
                </select>
              </label>

              <label>
                Port list
                <select v-model="form.portList">
                  <option v-for="item in openVasPortLists" :key="optionValue(item)" :value="optionValue(item)">
                    {{ optionLabel(item) }}
                  </option>
                </select>
              </label>

              <label>
                Alive test
                <select v-model="form.aliveTest">
                  <option v-for="item in openVasAliveTests" :key="optionValue(item)" :value="optionValue(item)">
                    {{ optionLabel(item) }}
                  </option>
                </select>
              </label>

              <label>
                Scanner
                <select v-model="form.scanner">
                  <option v-for="item in openVasScanners" :key="optionValue(item)" :value="optionValue(item)">
                    {{ optionLabel(item) }}
                  </option>
                </select>
              </label>
            </div>
          </template>

          <button type="submit" :disabled="starting || !canStart">
            {{ startButtonLabel }}
          </button>

          <p v-if="error" class="scanner-error">{{ error }}</p>
          <p v-else-if="capabilityError" class="scanner-warning">{{ capabilityError }}</p>
        </form>

        <section class="scanner-run" aria-label="Ejecución">
          <header class="scanner-run__head">
            <span>{{ job?.status || "READY" }}</span>
            <strong>{{ progress }}%</strong>
          </header>

          <div class="scanner-progress" aria-label="Progreso">
            <span :style="{ width: `${progress}%` }"></span>
          </div>

          <dl class="scanner-run__meta">
            <div>
              <dt>Fase</dt>
              <dd>{{ job?.phase || "Esperando parámetros" }}</dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>{{ durationLabel }}</dd>
            </div>
            <div>
              <dt>Objetivo</dt>
              <dd>{{ job?.target || form.target || "N/D" }}</dd>
            </div>
          </dl>

          <div v-if="job?.command" class="scanner-command">
            <span>Comando</span>
            <code>{{ job.command }}</code>
          </div>

          <div v-if="logLines.length" class="scanner-log">
            <span>Traza</span>
            <pre>{{ logLines.join("\n") }}</pre>
          </div>

          <div class="scanner-actions">
            <button class="scanner-download" type="button" :disabled="!reportAvailable || downloadingReport" @click="downloadReport">
              {{ reportButtonLabel }}
            </button>
          </div>
        </section>
      </div>

      <section v-if="isNmap && nmapSummary" class="scanner-results scanner-results--summary">
        <article>
          <span>Hosts</span>
          <strong>{{ nmapSummary.hosts || 0 }}</strong>
        </article>
        <article>
          <span>Open</span>
          <strong>{{ nmapSummary.openPorts || 0 }}</strong>
        </article>
        <article>
          <span>Filtered</span>
          <strong>{{ nmapSummary.filteredPorts || 0 }}</strong>
        </article>
        <article>
          <span>Closed</span>
          <strong>{{ nmapSummary.closedPorts || 0 }}</strong>
        </article>
      </section>

      <section v-if="isNmap && nmapPorts.length" class="scanner-panel">
        <header>
          <span>NMAP</span>
          <h2>Puertos detectados</h2>
        </header>
        <div class="scanner-table">
          <div class="scanner-table__row scanner-table__row--head">
            <span>Host</span>
            <span>Puerto</span>
            <span>Estado</span>
            <span>Servicio</span>
          </div>
          <div v-for="item in nmapPorts" :key="`${item.address}-${item.protocol}-${item.port}`" class="scanner-table__row">
            <code>{{ item.address }}</code>
            <strong>{{ item.protocol }}/{{ item.port }}</strong>
            <span :class="`scanner-state scanner-state--${item.state}`">{{ item.state }}</span>
            <span>{{ serviceLabel(item) }}</span>
          </div>
        </div>
      </section>

      <section v-if="!isNmap && openVasSummary" class="scanner-results scanner-results--summary scanner-results--openvas">
        <article>
          <span>Críticos</span>
          <strong>{{ openVasSummary.critical || 0 }}</strong>
        </article>
        <article>
          <span>Altos</span>
          <strong>{{ openVasSummary.high || 0 }}</strong>
        </article>
        <article>
          <span>Medios</span>
          <strong>{{ openVasSummary.medium || 0 }}</strong>
        </article>
        <article>
          <span>Max CVSS</span>
          <strong>{{ openVasSummary.maxSeverity || 0 }}</strong>
        </article>
      </section>

      <section v-if="!isNmap && openVasFindings.length" class="scanner-panel">
        <header>
          <span>OPENVAS</span>
          <h2>Hallazgos</h2>
        </header>
        <div class="scanner-table scanner-table--findings">
          <div class="scanner-table__row scanner-table__row--head">
            <span>Severidad</span>
            <span>Host</span>
            <span>Puerto</span>
            <span>Hallazgo</span>
          </div>
          <div v-for="finding in openVasFindings" :key="finding.id || `${finding.host}-${finding.name}`" class="scanner-table__row">
            <strong :class="severityClass(finding.severity)">{{ finding.severity || "0.0" }}</strong>
            <code>{{ finding.host || "N/D" }}</code>
            <span>{{ finding.port || "N/D" }}</span>
            <span>{{ finding.name || "Sin nombre" }}</span>
          </div>
        </div>
      </section>

      <section v-if="!isNmap && openVasFindings.length" class="scanner-panel">
        <header>
          <span>OPENVAS</span>
          <h2>Detalle priorizado</h2>
        </header>
        <div class="scanner-finding-details">
          <article v-for="finding in openVasFindings.slice(0, 6)" :key="`detail-${finding.id || finding.name}`">
            <div>
              <strong>{{ finding.name || "Hallazgo sin nombre" }}</strong>
              <span :class="severityClass(finding.severity)">CVSS {{ finding.severity || "0.0" }}</span>
            </div>
            <p>{{ finding.description || "Sin descripción técnica disponible." }}</p>
            <small>{{ finding.host || "N/D" }} / {{ finding.port || "N/D" }} / {{ finding.threat || "Info" }}</small>
          </article>
        </div>
      </section>

      <section v-if="resultError" class="scanner-panel scanner-panel--error">
        <header>
          <span>ERROR</span>
          <h2>Salida del motor</h2>
        </header>
        <p>{{ resultError }}</p>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { forgetRuntimeJob, isRuntimeJobRunning, rememberedRuntimeJob, rememberRuntimeJob } from "@/services/runtimeJobs";

export default {
  name: "ScannerWorkbench",
  props: {
    tool: {
      type: String,
      required: true,
      validator: (value) => ["nmap", "openvas"].includes(value),
    },
  },
  data() {
    return {
      capabilities: null,
      capabilityError: "",
      starting: false,
      downloadingReport: false,
      error: "",
      job: null,
      pollTimer: null,
      form: {
        target: "",
        profile: "",
        scanType: "tcp-connect",
        portMode: "top",
        ports: "22,80,443",
        topPorts: 1000,
        timing: "T3",
        serviceDetection: true,
        defaultScripts: false,
        osDetection: false,
        traceroute: false,
        noPing: false,
        maxRetries: 2,
        portList: "",
        scanner: "",
        aliveTest: "",
      },
    };
  },
  computed: {
    isNmap() {
      return this.tool === "nmap";
    },
    runtimeScope() {
      return `scanner.${this.tool}`;
    },
    copy() {
      return this.isNmap
        ? {
            eyebrow: "Reconocimiento / Puertos",
            title: "Nmap",
            summary: "Escaneo parametrizado desde el backend con perfiles, puertos, timing, scripts controlados y progreso de ejecución.",
            placeholder: "192.168.0.1 o 192.168.0.0/24",
          }
        : {
            eyebrow: "Reconocimiento / Vulnerabilidades",
            title: "OpenVAS",
            summary: "Orquestación de tareas Greenbone con perfil, port list, alive test y seguimiento del progreso GMP.",
            placeholder: "192.168.0.50",
          };
    },
    engineReady() {
      return Boolean(this.capabilities?.available);
    },
    engineLabel() {
      return this.isNmap ? "Nmap CLI" : "Greenbone GMP";
    },
    engineMessage() {
      if (!this.capabilities) return "Comprobando motor";
      return this.capabilities.message || this.capabilities.setupState || this.capabilities.binary || "Listo";
    },
    canStart() {
      return this.engineReady && this.form.target && !this.isRunning;
    },
    isRunning() {
      return ["QUEUED", "RUNNING"].includes(this.job?.status);
    },
    startButtonLabel() {
      if (this.starting) return "Lanzando";
      if (this.isRunning) return "En ejecución";
      return this.isNmap ? "Ejecutar Nmap" : "Crear tarea OpenVAS";
    },
    reportAvailable() {
      return Boolean(this.job?.id && !this.isRunning && this.job?.result);
    },
    reportButtonLabel() {
      if (this.downloadingReport) return "Generando PDF";
      return this.reportAvailable ? "Descargar PDF" : "PDF disponible al terminar";
    },
    progress() {
      return Math.max(0, Math.min(100, Number(this.job?.progress || 0)));
    },
    durationLabel() {
      const ms = this.job?.durationMs;
      if (!ms) return "0s";
      if (ms < 1000) return `${ms}ms`;
      const seconds = Math.round(ms / 1000);
      if (seconds < 60) return `${seconds}s`;
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    },
    result() {
      return this.job?.result || null;
    },
    resultError() {
      return this.job?.error || this.result?.error || this.result?.parseError || "";
    },
    logLines() {
      return (this.job?.logs || []).slice(-8);
    },
    nmapProfiles() {
      return this.capabilities?.profiles || [];
    },
    nmapScanTypes() {
      return this.capabilities?.scanTypes || [];
    },
    nmapPortModes() {
      return this.capabilities?.portModes || [];
    },
    nmapTimings() {
      return this.capabilities?.timings || ["T2", "T3", "T4"];
    },
    nmapSummary() {
      return this.result?.summary || null;
    },
    nmapPorts() {
      const rows = [];
      for (const host of this.result?.hosts || []) {
        for (const port of host.ports || []) {
          rows.push({
            address: host.address || "N/D",
            ...port,
          });
        }
      }
      return rows.slice(0, 120);
    },
    openVasProfiles() {
      return this.capabilities?.profiles || [];
    },
    openVasPortLists() {
      return this.capabilities?.portLists || [];
    },
    openVasAliveTests() {
      return this.capabilities?.aliveTests || [];
    },
    openVasScanners() {
      return this.capabilities?.scanners || [];
    },
    openVasFindings() {
      return this.result?.findings || [];
    },
    openVasSummary() {
      return this.result?.summary || null;
    },
  },
  watch: {
    tool: {
      immediate: true,
      handler() {
        this.reset();
        this.loadCapabilities();
        this.restoreActiveJob();
      },
    },
  },
  beforeUnmount() {
    this.stopPolling();
  },
  methods: {
    reset() {
      this.stopPolling();
      this.capabilities = null;
      this.capabilityError = "";
      this.error = "";
      this.job = null;
      this.form = {
        target: this.isNmap ? "192.168.0.1" : "192.168.0.50",
        profile: this.isNmap ? "standard" : "Full and fast",
        scanType: "tcp-connect",
        portMode: "top",
        ports: "22,80,443",
        topPorts: 1000,
        timing: "T3",
        serviceDetection: true,
        defaultScripts: false,
        osDetection: false,
        traceroute: false,
        noPing: false,
        maxRetries: 2,
        portList: "All IANA assigned TCP",
        scanner: "OpenVAS Default",
        aliveTest: "Scan Config Default",
      };
    },
    async ensureSession() {
      if (!this.$store.getters.isAuthenticated) {
        this.$router.push({ name: "login" });
        throw new Error("Inicia sesión para ejecutar herramientas");
      }
    },
    async loadCapabilities() {
      this.capabilityError = "";
      try {
        await this.ensureSession();
        this.capabilities = await caligoApi.request(`/api/recon/${this.tool}/capabilities`);
        this.applyCapabilityDefaults();
      } catch (error) {
        this.capabilityError = error.message || "No se pudo consultar el motor";
      }
    },
    applyCapabilityDefaults() {
      const defaults = this.capabilities?.defaults || {};
      this.form = {
        ...this.form,
        ...defaults,
        target: this.form.target || defaults.target || (this.isNmap ? "192.168.0.1" : "192.168.0.50"),
      };
      if (!this.isNmap) {
        this.form.profile = this.validOptionValue(this.openVasProfiles, this.form.profile);
        this.form.portList = this.validOptionValue(this.openVasPortLists, this.form.portList);
        this.form.scanner = this.validOptionValue(this.openVasScanners, this.form.scanner);
        this.form.aliveTest = this.validOptionValue(this.openVasAliveTests, this.form.aliveTest);
      }
    },
    async startScan() {
      this.error = "";
      this.starting = true;
      try {
        await this.ensureSession();
        const endpoint = `/api/recon/${this.tool}/scans`;
        const payload = this.isNmap ? this.nmapPayload() : this.openVasPayload();
        this.job = await caligoApi.request(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        rememberRuntimeJob(this.runtimeScope, this.job.id);
        this.startPolling();
      } catch (error) {
        this.error = error.message || "No se pudo iniciar el escaneo";
      } finally {
        this.starting = false;
      }
    },
    nmapPayload() {
      return {
        target: this.form.target,
        profile: this.form.profile,
        scanType: this.form.scanType,
        portMode: this.form.portMode,
        ports: this.form.ports,
        topPorts: this.form.topPorts,
        timing: this.form.timing,
        serviceDetection: this.form.serviceDetection,
        defaultScripts: this.form.defaultScripts,
        osDetection: this.form.osDetection,
        traceroute: this.form.traceroute,
        noPing: this.form.noPing,
        maxRetries: this.form.maxRetries,
      };
    },
    openVasPayload() {
      return {
        target: this.form.target,
        profile: this.form.profile,
        portList: this.form.portList,
        scanner: this.form.scanner,
        aliveTest: this.form.aliveTest,
      };
    },
    async restoreActiveJob() {
      const id = rememberedRuntimeJob(this.runtimeScope);
      if (!id) return;
      try {
        await this.ensureSession();
        this.job = await caligoApi.request(`/api/recon/${this.tool}/scans/${id}`);
        this.form.target = this.job.target || this.form.target;
        if (isRuntimeJobRunning(this.job)) {
          this.startPolling();
        }
      } catch {
        forgetRuntimeJob(this.runtimeScope);
      }
    },
    startPolling() {
      this.stopPolling();
      this.pollTimer = window.setInterval(this.refreshJob, 2000);
      this.refreshJob();
    },
    stopPolling() {
      if (this.pollTimer) {
        window.clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    async refreshJob() {
      if (!this.job?.id) return;
      try {
        this.job = await caligoApi.request(`/api/recon/${this.tool}/scans/${this.job.id}`);
        if (!isRuntimeJobRunning(this.job)) {
          this.stopPolling();
        }
      } catch (error) {
        this.error = error.message || "No se pudo refrescar el job";
        forgetRuntimeJob(this.runtimeScope);
        this.stopPolling();
      }
    },
    async downloadReport() {
      if (!this.reportAvailable) return;
      this.error = "";
      this.downloadingReport = true;
      try {
        await this.ensureSession();
        const filename = `caligo-${this.tool}-${this.safeFilePart(this.job.target || "scan")}.pdf`;
        await caligoApi.download(`/api/recon/${this.tool}/scans/${this.job.id}/report.pdf`, filename);
      } catch (error) {
        this.error = error.message || "No se pudo descargar el PDF";
      } finally {
        this.downloadingReport = false;
      }
    },
    optionValue(item) {
      return item?.value || item?.name || item?.id || "";
    },
    validOptionValue(items, currentValue) {
      if (!items.length) return currentValue || "";
      const current = String(currentValue || "");
      const exact = items.find((item) => [item.value, item.name, item.id, item.label].filter(Boolean).includes(current));
      return this.optionValue(exact || items[0]);
    },
    optionLabel(item) {
      return item?.label || item?.name || item?.value || item?.id || "N/D";
    },
    serviceLabel(item) {
      return [item.service, item.product, item.version].filter(Boolean).join(" ") || "N/D";
    },
    severityClass(value) {
      const severity = Number(value || 0);
      if (severity >= 7) return "scanner-severity scanner-severity--high";
      if (severity >= 4) return "scanner-severity scanner-severity--medium";
      return "scanner-severity scanner-severity--low";
    },
    safeFilePart(value) {
      return String(value || "scan").replace(/[^a-z0-9_.-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "scan";
    },
  },
};
</script>
