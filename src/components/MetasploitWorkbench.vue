<template>
  <section class="msf-workbench" aria-labelledby="msf-title">
    <div class="msf-shell">
      <ToolHeroHeader
        tool-id="metasploit"
        title="Mesa de operación"
        eyebrow="Vulnerabilidades / Metasploit"
        summary="Descubre servicios, selecciona módulos, lanza payloads en laboratorio y controla sesiones activas desde un solo panel."
        title-id="msf-title"
        :logo-tools="['metasploit', 'nmap']"
        :meta="heroMeta"
      />

      <div class="msf-dashboard">
        <form class="msf-panel msf-discovery" @submit.prevent="startDiscovery">
          <header class="msf-panel__head">
            <span>Discovery</span>
            <strong>Nmap + MSF</strong>
          </header>

          <label>
            Objetivo autorizado
            <input v-model.trim="discovery.target" type="text" autocomplete="off" spellcheck="false" placeholder="192.168.0.50" />
          </label>

          <div class="msf-form-grid">
            <label>
              Perfil
              <select v-model="discovery.profile">
                <option value="quick">Rápido</option>
                <option value="standard">Estándar</option>
                <option value="service">Servicios</option>
                <option value="web">Web expuesta</option>
              </select>
            </label>

            <label>
              Puertos
              <select v-model="discovery.portMode">
                <option value="custom">Lista controlada</option>
                <option value="top">Top ports</option>
              </select>
            </label>
          </div>

          <label v-if="discovery.portMode === 'custom'">
            Lista
            <input v-model.trim="discovery.ports" type="text" autocomplete="off" spellcheck="false" placeholder="21,22,80,445,8080" />
          </label>

          <div v-else class="msf-form-grid">
            <label>
              Top ports
              <input v-model.number="discovery.topPorts" type="number" min="10" max="5000" step="10" />
            </label>

            <label>
              Timing
              <select v-model="discovery.timing">
                <option value="T2">T2</option>
                <option value="T3">T3</option>
                <option value="T4">T4</option>
              </select>
            </label>
          </div>

          <div class="msf-switches">
            <label>
              <input v-model="discovery.serviceDetection" type="checkbox" />
              <span>Versiones</span>
            </label>
            <label>
              <input v-model="discovery.defaultScripts" type="checkbox" />
              <span>NSE seguro</span>
            </label>
            <label>
              <input v-model="discovery.noPing" type="checkbox" />
              <span>-Pn</span>
            </label>
          </div>

          <button type="submit" :disabled="discovering || !discovery.target">
            {{ discovering ? "Escaneando" : "Escanear y recomendar" }}
          </button>

          <div v-if="nmapJob" class="msf-progress">
            <div>
              <span>{{ nmapJob.status }}</span>
              <strong>{{ nmapProgress }}%</strong>
            </div>
            <i :style="{ width: `${nmapProgress}%` }"></i>
            <small>{{ nmapJob.phase || "Preparando motor" }}</small>
          </div>

          <p v-if="error" class="msf-alert">{{ error }}</p>
        </form>

        <section class="msf-panel msf-map" aria-label="Mapa de hosts">
          <header class="msf-panel__head">
            <span>Mapa</span>
            <strong>{{ hosts.length }} hosts / {{ sessionCount }} sesiones</strong>
          </header>

          <div v-if="hosts.length" class="msf-host-grid">
            <article
              v-for="host in hosts"
              :key="host.address"
              class="msf-host"
              :class="{ 'is-owned': isOwned(host), 'is-selected': selectedTarget === host.address }"
              @click="selectHost(host)"
            >
              <div class="msf-host__icon" aria-hidden="true">
                <span></span>
              </div>
              <div>
                <strong>{{ host.address }}</strong>
                <small>{{ openPortSummary(host) }}</small>
              </div>
              <em>{{ isOwned(host) ? "PAYLOAD ACTIVO" : "sin sesión" }}</em>
            </article>
          </div>

          <div v-else class="msf-empty">
            <span>Sin superficie cargada</span>
            <p>Lanza un discovery o selecciona un módulo manualmente.</p>
          </div>
        </section>

        <section class="msf-panel msf-recommendations" aria-label="Recomendaciones">
          <header class="msf-panel__head">
            <span>Módulos sugeridos</span>
            <strong>{{ recommendations.length }}</strong>
          </header>

          <div class="msf-search">
            <select v-model="moduleSearch.type">
              <option value="exploit">Exploit</option>
              <option value="auxiliary">Auxiliary</option>
              <option value="payload">Payload</option>
              <option value="post">Post</option>
            </select>
            <input v-model.trim="moduleSearch.query" type="text" placeholder="smb ms17, tomcat, ftp..." @keyup.enter="searchModules" />
            <button type="button" :disabled="searchingModules" @click="searchModules">Buscar</button>
          </div>

          <div class="msf-rec-list">
            <button
              v-for="item in visibleRecommendations"
              :key="`${item.target}-${item.port}-${item.module}`"
              type="button"
              :class="{ 'is-active': selectedModuleKey === moduleKey(item.type, item.module, item.target, item.port) }"
              @click="selectRecommendation(item)"
            >
              <span>{{ item.type }} / {{ item.port || "auto" }}</span>
              <strong>{{ compactModule(item.module) }}</strong>
              <small>{{ item.reason || item.service || "Módulo compatible con el servicio detectado." }}</small>
            </button>
          </div>

          <div v-if="searchedModules.length" class="msf-module-results">
            <button
              v-for="module in searchedModules"
              :key="module.fullname || module.name"
              type="button"
              @click="selectSearchedModule(module)"
            >
              <strong>{{ module.fullname || module.name }}</strong>
              <span>{{ module.rank || module.type || "module" }}</span>
            </button>
          </div>

          <div v-if="!visibleRecommendations.length && !searchedModules.length" class="msf-empty msf-empty--compact">
            <span>Sin módulos cargados</span>
            <p>Ejecuta discovery o busca manualmente por servicio, CVE o nombre del módulo.</p>
          </div>
        </section>

        <section class="msf-panel msf-executor" aria-label="Ejecución">
          <header class="msf-panel__head">
            <span>Composer</span>
            <strong>{{ execution.moduleType || "manual" }}</strong>
          </header>

          <div class="msf-form-grid">
            <label>
              Tipo
              <select v-model="execution.moduleType">
                <option value="exploit">exploit</option>
                <option value="auxiliary">auxiliary</option>
                <option value="post">post</option>
              </select>
            </label>
            <label>
              RPORT
              <input v-model.number="execution.rport" type="number" min="1" max="65535" />
            </label>
          </div>

          <label>
            Módulo
            <input v-model.trim="execution.moduleName" type="text" autocomplete="off" spellcheck="false" placeholder="exploit/multi/handler" />
          </label>

          <label>
            Objetivo
            <input v-model.trim="execution.target" type="text" autocomplete="off" spellcheck="false" placeholder="192.168.0.50" />
          </label>

          <label>
            Payload
            <select v-model="execution.payload">
              <option value="">Sin payload explicito</option>
              <option v-for="payload in payloadOptions" :key="payload.value" :value="payload.value">{{ payload.label }}</option>
            </select>
          </label>

          <div class="msf-form-grid">
            <label>
              LHOST
              <input v-model.trim="execution.lhost" type="text" autocomplete="off" spellcheck="false" placeholder="192.168.0.253" />
            </label>
            <label>
              LPORT
              <input v-model.number="execution.lport" type="number" min="1" max="65535" />
            </label>
          </div>

          <label>
            Opciones JSON
            <textarea v-model="execution.optionsText" spellcheck="false" rows="5" placeholder='{"TARGETURI":"/"}'></textarea>
          </label>

          <button type="button" :disabled="executing || !canExecute" @click="executeModule">
            {{ executing ? "Lanzando" : "Ejecutar módulo" }}
          </button>

          <div v-if="moduleInfo" class="msf-module-info">
            <span>{{ moduleInfo.name }}</span>
            <small>{{ moduleDescription }}</small>
          </div>

          <div v-if="executeJob" class="msf-job-card" :class="`is-${String(executeJob.status || '').toLowerCase()}`">
            <span>{{ executeJob.status }}</span>
            <strong>{{ executeJob.phase }}</strong>
            <code>{{ executeJob.command }}</code>
          </div>
        </section>

        <section class="msf-panel msf-sessions" aria-label="Sesiones">
          <header class="msf-panel__head">
            <span>Sesiones</span>
            <strong>{{ sessionCount }}</strong>
          </header>

          <div v-if="sessions.length" class="msf-session-list">
            <article v-for="session in sessions" :key="session.id" class="msf-session">
              <header>
                <div>
                  <strong>#{{ session.id }} {{ session.type || "session" }}</strong>
                  <small>{{ sessionHost(session) }} / {{ session.info || session.via_exploit || "sin detalle" }}</small>
                </div>
                <button type="button" @click="stopSession(session.id)">Cerrar</button>
              </header>

              <form @submit.prevent="sendSessionCommand(session.id)">
                <input v-model.trim="sessionCommands[session.id]" type="text" autocomplete="off" spellcheck="false" placeholder="whoami, sysinfo, pwd..." />
                <button type="submit">Enviar</button>
              </form>

              <pre v-if="sessionOutputs[session.id]">{{ sessionOutputs[session.id] }}</pre>
            </article>
          </div>

          <div v-else class="msf-empty">
            <span>Sin sesiones</span>
            <p>Las máquinas comprometidas aparecerán aquí y se marcarán en el mapa.</p>
          </div>
        </section>
      </div>

      <section class="msf-panel msf-remote-ops" aria-label="Operativa sobre sesiones">
        <header class="msf-remote-head">
          <div>
            <span>Post-explotacion</span>
            <strong>{{ activeSession ? `Sesión #${activeSession.id}` : "sin sesión activa" }}</strong>
          </div>
          <small>{{ activeSession ? sessionHost(activeSession) : "Esperando payload Meterpreter" }}</small>
        </header>

        <div v-if="sessions.length" class="msf-ops-grid">
          <aside class="msf-session-picker" aria-label="Selección de sesión">
            <button
              v-for="session in sessions"
              :key="session.id"
              type="button"
              :class="{ 'is-active': selectedSessionId === String(session.id), 'is-meterpreter': isMeterpreter(session) }"
              @click="selectSessionForOps(session)"
            >
              <span>#{{ session.id }} {{ session.type || "session" }}</span>
              <strong>{{ sessionHost(session) }}</strong>
              <small>{{ session.info || session.via_exploit || "payload activo" }}</small>
            </button>
          </aside>

          <section class="msf-file-browser">
            <header class="msf-browser-head">
              <div>
                <span>Explorador remoto</span>
                <strong>{{ remoteWorkspace.currentPath || "N/D" }}</strong>
              </div>
              <button type="button" :disabled="remoteBusy || !activeSession || !isMeterpreter(activeSession)" @click="loadRemoteWorkspace(remoteWorkspace.currentPath)">
                Refrescar
              </button>
            </header>

            <form class="msf-pathbar" @submit.prevent="loadRemoteWorkspace(remotePath)">
              <input v-model.trim="remotePath" type="text" autocomplete="off" spellcheck="false" placeholder="., /home/user, C:\\Users\\Public" />
              <button type="submit" :disabled="remoteBusy || !activeSession || !isMeterpreter(activeSession)">Ir</button>
            </form>

            <div class="msf-fs-actions">
              <form @submit.prevent="createRemoteFolder">
                <input v-model.trim="remoteNewFolder" type="text" autocomplete="off" spellcheck="false" placeholder="Nueva carpeta en la ruta actual" />
                <button type="submit" :disabled="remoteBusy || !remoteNewFolder || !activeSession || !isMeterpreter(activeSession)">Crear</button>
              </form>

              <div v-if="focusedRemoteEntry?.name" class="msf-fs-selection">
                <div>
                  <span>Selección</span>
                  <strong>{{ focusedRemoteEntry.name }}</strong>
                </div>
                <button type="button" :disabled="remoteBusy" @click="openFocusedEntry">{{ focusedRemoteEntry.directory ? "Abrir" : "Leer" }}</button>
                <button type="button" :disabled="remoteBusy" @click="copyFocusedPath">Copiar ruta</button>
                <button type="button" :disabled="remoteBusy" @click="deleteFocusedEntry">Borrar</button>
              </div>

              <form v-if="focusedRemoteEntry?.name" @submit.prevent="renameFocusedEntry">
                <input v-model.trim="remoteRenamePath" type="text" autocomplete="off" spellcheck="false" placeholder="Ruta destino o nuevo nombre" />
                <button type="submit" :disabled="remoteBusy || !remoteRenamePath">Renombrar</button>
              </form>
            </div>

            <p v-if="remoteError" class="msf-alert">{{ remoteError }}</p>
            <p v-else-if="activeSession && !isMeterpreter(activeSession)" class="msf-alert">El explorador gráfico requiere una sesión Meterpreter. Usa la consola para sesiones shell.</p>

            <div v-if="remoteEntries.length" class="msf-file-list">
              <button type="button" @click="loadRemoteWorkspace(parentPath(remoteWorkspace.currentPath))">
                <span>dir</span>
                <strong>..</strong>
                <small>subir nivel</small>
              </button>
              <button
                v-for="entry in remoteEntries"
                :key="`${entry.name}-${entry.sizeLabel}-${entry.modified}`"
                type="button"
                :class="{ 'is-directory': entry.directory, 'is-active': focusedRemoteEntry?.name === entry.name }"
                @click="selectRemoteEntry(entry)"
              >
                <span>{{ entry.directory ? "dir" : "file" }}</span>
                <strong>{{ entry.name }}</strong>
                <small>{{ entry.directory ? "directorio" : formatBytes(entry.size) }} {{ entry.modified }}</small>
              </button>
            </div>

            <div v-else class="msf-empty msf-empty--compact">
              <span>{{ remoteBusy ? "Leyendo" : "Sin listado" }}</span>
              <p>{{ remoteBusy ? "Consultando la sesión Meterpreter." : "Selecciona una sesión Meterpreter o carga una ruta." }}</p>
            </div>
          </section>

          <section class="msf-remote-console">
            <header class="msf-browser-head">
              <div>
                <span>Consola activa</span>
                <strong>{{ activeSession ? sessionHost(activeSession) : "N/D" }}</strong>
              </div>
            </header>

            <div class="msf-quick-actions">
              <button
                v-for="command in quickCommands"
                :key="command.value"
                type="button"
                :disabled="!activeSession"
                @click="runQuickCommand(command.value)"
              >
                {{ command.label }}
              </button>
            </div>

            <form @submit.prevent="sendActiveSessionCommand">
              <input v-model.trim="activeCommand" type="text" autocomplete="off" spellcheck="false" placeholder="sysinfo, getuid, pwd, ls, whoami..." />
              <button type="submit" :disabled="!activeSession || !activeCommand">Enviar</button>
            </form>

            <pre>{{ activeSessionOutput || "La salida de consola aparecerá aquí." }}</pre>

            <div v-if="remoteFile.content" class="msf-file-preview">
              <header>
                <span>Fichero</span>
                <strong>{{ remoteFile.path }}</strong>
              </header>
              <pre>{{ remoteFile.content }}</pre>
              <div class="msf-preview-actions">
                <small v-if="remoteFile.truncated">Vista truncada para proteger la interfaz.</small>
                <button type="button" @click="downloadRemotePreview">Descargar vista</button>
              </div>
            </div>
          </section>
        </div>

        <div v-else class="msf-empty">
          <span>Sin payloads</span>
          <p>Cuando una sesión aparezca, podrás seleccionarla, navegar su sistema de ficheros y operar desde consola.</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import { forgetRuntimeJob, isRuntimeJobRunning, rememberedRuntimeJob, rememberRuntimeJob } from "@/services/runtimeJobs";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

const PRIVATE_TARGET = "192.168.0.50";
const DEFAULT_PORTS = "21,22,80,139,445,3306,5432,8000,8080,8443";

export default {
  name: "MetasploitWorkbench",
  components: {
    ToolHeroHeader,
  },
  data() {
    return {
      capabilities: null,
      error: "",
      discovering: false,
      executing: false,
      searchingModules: false,
      nmapJob: null,
      nmapPollTimer: null,
      executePollTimer: null,
      sessionPollTimer: null,
      hosts: [],
      recommendations: [],
      searchedModules: [],
      moduleInfo: null,
      selectedModuleKey: "",
      selectedTarget: "",
      executeJob: null,
      sessions: [],
      selectedSessionId: "",
      sessionCommands: {},
      sessionOutputs: {},
      activeCommand: "",
      remotePath: "",
      remoteNewFolder: "",
      remoteRenamePath: "",
      remoteBusy: false,
      remoteError: "",
      remoteWorkspace: {
        currentPath: "",
        entries: [],
        raw: {},
      },
      focusedRemoteEntry: null,
      remoteFile: {
        path: "",
        content: "",
        truncated: false,
      },
      quickCommands: [
        { label: "sysinfo", value: "sysinfo" },
        { label: "getuid", value: "getuid" },
        { label: "pwd", value: "pwd" },
        { label: "ps", value: "ps" },
        { label: "ipconfig", value: "ipconfig" },
        { label: "route", value: "route" },
      ],
      discovery: {
        target: PRIVATE_TARGET,
        profile: "service",
        portMode: "custom",
        ports: DEFAULT_PORTS,
        topPorts: 200,
        timing: "T3",
        serviceDetection: true,
        defaultScripts: false,
        noPing: true,
      },
      moduleSearch: {
        type: "exploit",
        query: "",
      },
      execution: {
        moduleType: "exploit",
        moduleName: "exploit/multi/handler",
        target: PRIVATE_TARGET,
        payload: "generic/shell_reverse_tcp",
        rport: 0,
        lhost: "192.168.0.253",
        lport: 4444,
        optionsText: "{}",
      },
    };
  },
  computed: {
    rpcReady() {
      return Boolean(this.capabilities?.available);
    },
    discoveryJobScope() {
      return "metasploit.discovery";
    },
    executeJobScope() {
      return "metasploit.execute";
    },
    rpcMessage() {
      if (!this.capabilities) return "Comprobando servicio";
      return this.capabilities.message || "RPC listo para laboratorio";
    },
    heroMeta() {
      return [
        { label: "RPC", value: this.rpcReady ? "Operativo" : "Pendiente" },
        { label: "Objetivo", value: this.selectedTarget || this.execution.target || this.discovery.target },
        { label: "Sesiones", value: `${this.sessionCount} / ${this.ownedHostCount} hosts` },
      ];
    },
    payloadOptions() {
      const dynamicPayloads = this.modulePayloadOptions();
      return dynamicPayloads.length ? dynamicPayloads : this.capabilities?.payloads || [];
    },
    nmapProgress() {
      return Math.max(0, Math.min(100, Number(this.nmapJob?.progress || 0)));
    },
    sessionCount() {
      return this.sessions.length;
    },
    ownedHostCount() {
      return this.hosts.filter((host) => this.isOwned(host)).length;
    },
    selectedModuleLabel() {
      if (!this.execution.moduleName) return "Módulo manual";
      return this.compactModule(this.execution.moduleName);
    },
    activeSession() {
      return this.sessions.find((session) => String(session.id) === this.selectedSessionId) || this.sessions[0] || null;
    },
    activeSessionOutput() {
      return this.activeSession ? this.sessionOutputs[this.activeSession.id] || "" : "";
    },
    remoteEntries() {
      return this.remoteWorkspace.entries || [];
    },
    focusedRemotePath() {
      return this.focusedRemoteEntry ? this.pathForEntry(this.focusedRemoteEntry) : "";
    },
    visibleRecommendations() {
      return this.recommendations.slice(0, 24);
    },
    canExecute() {
      return this.execution.moduleType && this.execution.moduleName && this.execution.target && this.rpcReady;
    },
    moduleDescription() {
      const info = this.moduleInfo?.info || {};
      return info.description || info.name || "Información del módulo cargada desde Metasploit.";
    },
  },
  mounted() {
    this.loadCapabilities();
    this.restoreRuntimeJobs();
    this.refreshSessions();
    this.sessionPollTimer = window.setInterval(this.refreshSessions, 5000);
  },
  beforeUnmount() {
    this.stopNmapPolling();
    this.stopExecutePolling();
    if (this.sessionPollTimer) {
      window.clearInterval(this.sessionPollTimer);
    }
  },
  methods: {
    async ensureSession() {
      if (this.$store.getters.isPortfolioMode) {
        throw new Error("Modo portfolio activo: inicia sesión con credenciales para ejecutar herramientas.");
      }
      if (!this.$store.getters.hasAppAccess) {
        this.$router.push({ name: "login" });
        throw new Error("Inicia sesión para usar Metasploit");
      }
    },
    async loadCapabilities() {
      try {
        await this.ensureSession();
        this.capabilities = await caligoApi.request("/api/metasploit/capabilities");
        const defaults = this.capabilities?.defaults || {};
        this.execution.lhost = defaults.lhost || this.execution.lhost;
        this.execution.lport = defaults.lport || this.execution.lport;
        this.execution.payload = defaults.payload || this.execution.payload;
      } catch (error) {
        this.error = error.message || "No se pudo consultar Metasploit";
      }
    },
    async startDiscovery() {
      this.error = "";
      this.discovering = true;
      this.hosts = [];
      this.recommendations = [];
      try {
        await this.ensureSession();
        this.nmapJob = await caligoApi.request("/api/recon/nmap/scans", {
          method: "POST",
          body: JSON.stringify({
            target: this.discovery.target,
            profile: this.discovery.profile,
            scanType: "tcp-connect",
            portMode: this.discovery.portMode,
            ports: this.discovery.ports,
            topPorts: this.discovery.topPorts,
            timing: this.discovery.timing,
            serviceDetection: this.discovery.serviceDetection,
            defaultScripts: this.discovery.defaultScripts,
            osDetection: false,
            traceroute: false,
            noPing: this.discovery.noPing,
            maxRetries: 2,
          }),
        });
        rememberRuntimeJob(this.discoveryJobScope, this.nmapJob.id);
        this.startNmapPolling();
      } catch (error) {
        this.error = error.message || "No se pudo lanzar discovery";
        this.discovering = false;
      }
    },
    async restoreRuntimeJobs() {
      await this.restoreDiscoveryJob();
      await this.restoreExecuteJob();
    },
    async restoreDiscoveryJob() {
      const id = rememberedRuntimeJob(this.discoveryJobScope);
      if (!id) return;
      try {
        await this.ensureSession();
        this.nmapJob = await caligoApi.request(`/api/recon/nmap/scans/${id}`);
        this.discovery.target = this.nmapJob.target || this.discovery.target;
        if (isRuntimeJobRunning(this.nmapJob)) {
          this.discovering = true;
          this.startNmapPolling();
          return;
        }
        this.discovering = false;
        this.hosts = this.normalizeHosts(this.nmapJob.result?.hosts || []);
        await this.loadRecommendations();
      } catch {
        forgetRuntimeJob(this.discoveryJobScope);
      }
    },
    async restoreExecuteJob() {
      const id = rememberedRuntimeJob(this.executeJobScope);
      if (!id) return;
      try {
        await this.ensureSession();
        this.executeJob = await caligoApi.request(`/api/metasploit/jobs/${id}`);
        if (isRuntimeJobRunning(this.executeJob)) {
          this.startExecutePolling(id);
        }
      } catch {
        forgetRuntimeJob(this.executeJobScope);
      }
    },
    startNmapPolling() {
      this.stopNmapPolling();
      this.nmapPollTimer = window.setInterval(this.refreshNmapJob, 1800);
      this.refreshNmapJob();
    },
    stopNmapPolling() {
      if (this.nmapPollTimer) {
        window.clearInterval(this.nmapPollTimer);
        this.nmapPollTimer = null;
      }
    },
    async refreshNmapJob() {
      if (!this.nmapJob?.id) return;
      try {
        this.nmapJob = await caligoApi.request(`/api/recon/nmap/scans/${this.nmapJob.id}`);
        if (!isRuntimeJobRunning(this.nmapJob)) {
          this.stopNmapPolling();
          this.discovering = false;
          this.hosts = this.normalizeHosts(this.nmapJob.result?.hosts || []);
          await this.loadRecommendations();
        }
      } catch (error) {
        this.error = error.message || "No se pudo leer el discovery";
        this.discovering = false;
        forgetRuntimeJob(this.discoveryJobScope);
        this.stopNmapPolling();
      }
    },
    async loadRecommendations() {
      if (!this.hosts.length) return;
      try {
        const response = await caligoApi.request("/api/metasploit/recommendations", {
          method: "POST",
          body: JSON.stringify({
            target: this.discovery.target,
            hosts: this.hosts,
          }),
        });
        this.recommendations = response.recommendations || [];
        this.sessions = response.sessions || this.sessions;
        if (this.recommendations.length) {
          this.selectRecommendation(this.recommendations[0]);
        }
      } catch (error) {
        this.error = error.message || "No se pudieron generar recomendaciones";
      }
    },
    normalizeHosts(hosts) {
      return hosts
        .filter((host) => host.address)
        .map((host) => ({
          ...host,
          ports: (host.ports || []).filter((port) => String(port.state || "").toLowerCase() === "open"),
        }))
        .filter((host) => host.ports.length);
    },
    selectHost(host) {
      this.selectedTarget = host.address;
      this.execution.target = host.address;
    },
    selectRecommendation(item) {
      this.selectedModuleKey = this.moduleKey(item.type, item.module, item.target, item.port);
      this.execution.moduleType = item.type || "exploit";
      this.execution.moduleName = item.module || "";
      this.execution.target = item.target || this.discovery.target;
      this.execution.rport = Number(item.port || 0);
      this.execution.payload = item.payload || (item.type === "exploit" ? this.execution.payload : "");
      this.execution.optionsText = "{}";
      this.selectedTarget = this.execution.target;
      this.loadModuleInfo();
    },
    async searchModules() {
      if (!this.moduleSearch.query) return;
      this.searchingModules = true;
      try {
        const query = encodeURIComponent(this.moduleSearch.query);
        const type = encodeURIComponent(this.moduleSearch.type);
        const response = await caligoApi.request(`/api/metasploit/module-catalog?query=${query}&type=${type}`);
        this.searchedModules = response.modules || [];
      } catch (error) {
        this.error = error.message || "No se pudo buscar el módulo";
      } finally {
        this.searchingModules = false;
      }
    },
    selectSearchedModule(module) {
      const type = module.type || this.moduleSearch.type;
      const name = module.fullname || module.name || "";
      this.execution.moduleType = type;
      this.execution.moduleName = name.startsWith(`${type}/`) ? name : `${type}/${name}`;
      this.selectedModuleKey = this.moduleKey(type, this.execution.moduleName, this.execution.target, this.execution.rport);
      this.loadModuleInfo();
    },
    async loadModuleInfo() {
      if (!this.execution.moduleType || !this.execution.moduleName || !this.rpcReady) return;
      try {
        const type = encodeURIComponent(this.execution.moduleType);
        const name = encodeURIComponent(this.execution.moduleName);
        this.moduleInfo = await caligoApi.request(`/api/metasploit/modules/info?type=${type}&name=${name}`);
        const payloads = this.modulePayloadOptions();
        const selectedPayloadExists = payloads.some((payload) => payload.value === this.execution.payload);
        if (this.execution.moduleType === "exploit" && payloads.length && !selectedPayloadExists) {
          this.execution.payload = payloads[0].value;
        }
      } catch {
        this.moduleInfo = null;
      }
    },
    async executeModule() {
      this.error = "";
      this.executing = true;
      try {
        await this.ensureSession();
        const response = await caligoApi.request("/api/metasploit/modules/execute", {
          method: "POST",
          body: JSON.stringify({
            moduleType: this.execution.moduleType,
            moduleName: this.execution.moduleName,
            target: this.execution.target,
            payload: this.execution.payload || null,
            rport: Number(this.execution.rport || 0) || null,
            lhost: this.execution.lhost || null,
            lport: Number(this.execution.lport || 0) || null,
            options: this.parseOptions(),
          }),
        });
        this.executeJob = response;
        rememberRuntimeJob(this.executeJobScope, response.id);
        this.startExecutePolling(response.id);
        window.setTimeout(this.refreshSessions, 1500);
        window.setTimeout(this.refreshSessions, 5000);
      } catch (error) {
        this.error = error.message || "No se pudo ejecutar el módulo";
      } finally {
        this.executing = false;
      }
    },
    parseOptions() {
      const raw = this.execution.optionsText.trim();
      if (!raw || raw === "{}") return {};
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error("Opciones JSON no válidas");
      }
    },
    async refreshSessions() {
      try {
        await this.ensureSession();
        const response = await caligoApi.request("/api/metasploit/sessions");
        this.sessions = response.sessions || [];
        if (!this.selectedSessionId && this.sessions.length) {
          this.selectedSessionId = String(this.sessions[0].id);
        }
        if (this.selectedSessionId && !this.sessions.some((session) => String(session.id) === this.selectedSessionId)) {
          this.selectedSessionId = this.sessions.length ? String(this.sessions[0].id) : "";
          this.remoteWorkspace = { currentPath: "", entries: [], raw: {} };
          this.remoteFile = { path: "", content: "", truncated: false };
          this.focusedRemoteEntry = null;
          this.remoteRenamePath = "";
        }
      } catch {
        this.sessions = [];
      }
    },
    startExecutePolling(id) {
      this.stopExecutePolling();
      if (!id) return;
      this.executePollTimer = window.setInterval(() => this.refreshExecuteJob(id), 1800);
      this.refreshExecuteJob(id);
    },
    stopExecutePolling() {
      if (this.executePollTimer) {
        window.clearInterval(this.executePollTimer);
        this.executePollTimer = null;
      }
    },
    async refreshExecuteJob(id) {
      try {
        const response = await caligoApi.request(`/api/metasploit/jobs/${id}`);
        this.executeJob = response;
        if (!isRuntimeJobRunning(response)) {
          this.stopExecutePolling();
        }
      } catch {
        forgetRuntimeJob(this.executeJobScope);
        this.stopExecutePolling();
      }
    },
    async selectSessionForOps(session) {
      this.selectedSessionId = String(session.id);
      this.remoteError = "";
      this.remoteFile = { path: "", content: "", truncated: false };
      this.focusedRemoteEntry = null;
      this.remoteRenamePath = "";
      if (this.isMeterpreter(session)) {
        await this.loadRemoteWorkspace("");
      }
    },
    async loadRemoteWorkspace(path = "") {
      if (!this.activeSession || !this.isMeterpreter(this.activeSession)) return;
      this.remoteBusy = true;
      this.remoteError = "";
      try {
        const response = await caligoApi.request(`/api/metasploit/sessions/${this.activeSession.id}/fs/list`, {
          method: "POST",
          body: JSON.stringify({ path: path || "" }),
        });
        this.remoteWorkspace = {
          currentPath: response.currentPath || path || "",
          entries: response.entries || [],
          raw: response.raw || {},
        };
        this.remotePath = this.remoteWorkspace.currentPath;
        this.focusedRemoteEntry = null;
        this.remoteRenamePath = "";
      } catch (error) {
        this.remoteError = error.message || "No se pudo listar la ruta remota";
      } finally {
        this.remoteBusy = false;
      }
    },
    selectRemoteEntry(entry) {
      if (!entry?.name || entry.name === ".") return;
      this.focusedRemoteEntry = entry;
      this.remoteRenamePath = this.pathForEntry(entry);
    },
    async openFocusedEntry() {
      if (!this.focusedRemoteEntry) return;
      await this.openRemoteEntry(this.focusedRemoteEntry);
    },
    async openRemoteEntry(entry) {
      if (!entry?.name || entry.name === ".") return;
      const path = this.pathForEntry(entry);
      if (entry.directory) {
        await this.loadRemoteWorkspace(path);
        return;
      }
      await this.readRemoteFile(path);
    },
    async createRemoteFolder() {
      if (!this.remoteNewFolder || !this.activeSession || !this.isMeterpreter(this.activeSession)) return;
      const path = this.pathForName(this.remoteNewFolder);
      await this.remoteMutation("mkdir", { path });
      this.remoteNewFolder = "";
    },
    async deleteFocusedEntry() {
      if (!this.focusedRemoteEntry || !this.activeSession || !this.isMeterpreter(this.activeSession)) return;
      const path = this.focusedRemotePath;
      const ok = window.confirm(`¿Borrar en la sesión remota?\n\n${path}`);
      if (!ok) return;
      await this.remoteMutation("delete", { path, directory: Boolean(this.focusedRemoteEntry.directory) });
      this.remoteFile = { path: "", content: "", truncated: false };
    },
    async renameFocusedEntry() {
      if (!this.focusedRemoteEntry || !this.remoteRenamePath || !this.activeSession || !this.isMeterpreter(this.activeSession)) return;
      await this.remoteMutation("rename", {
        path: this.focusedRemotePath,
        targetPath: this.remoteRenamePath,
      });
      this.remoteFile = { path: "", content: "", truncated: false };
    },
    async remoteMutation(action, body) {
      this.remoteBusy = true;
      this.remoteError = "";
      try {
        const response = await caligoApi.request(`/api/metasploit/sessions/${this.activeSession.id}/fs/${action}`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        this.remoteWorkspace = {
          currentPath: response.currentPath || this.remoteWorkspace.currentPath || "",
          entries: response.entries || [],
          raw: response.raw || {},
        };
        this.remotePath = this.remoteWorkspace.currentPath;
        this.focusedRemoteEntry = null;
        this.remoteRenamePath = "";
        if (response.output) {
          this.sessionOutputs = {
            ...this.sessionOutputs,
            [this.activeSession.id]: response.output,
          };
        }
      } catch (error) {
        this.remoteError = error.message || "No se pudo ejecutar la operación remota";
      } finally {
        this.remoteBusy = false;
      }
    },
    async readRemoteFile(path) {
      if (!this.activeSession || !this.isMeterpreter(this.activeSession)) return;
      this.remoteBusy = true;
      this.remoteError = "";
      try {
        const response = await caligoApi.request(`/api/metasploit/sessions/${this.activeSession.id}/fs/read`, {
          method: "POST",
          body: JSON.stringify({ path, maxBytes: 65536 }),
        });
        this.remoteFile = {
          path: response.path || path,
          content: response.content || "",
          truncated: Boolean(response.truncated),
        };
      } catch (error) {
        this.remoteError = error.message || "No se pudo leer el fichero remoto";
      } finally {
        this.remoteBusy = false;
      }
    },
    async runQuickCommand(command) {
      this.activeCommand = command;
      await this.sendActiveSessionCommand();
    },
    async sendActiveSessionCommand() {
      if (!this.activeSession || !this.activeCommand) return;
      this.sessionCommands = {
        ...this.sessionCommands,
        [this.activeSession.id]: this.activeCommand,
      };
      await this.sendSessionCommand(this.activeSession.id);
      this.activeCommand = "";
      if (this.isMeterpreter(this.activeSession)) {
        window.setTimeout(() => this.loadRemoteWorkspace(this.remoteWorkspace.currentPath), 600);
      }
    },
    async sendSessionCommand(id) {
      const command = this.sessionCommands[id];
      if (!command) return;
      try {
        const response = await caligoApi.request(`/api/metasploit/sessions/${id}/command`, {
          method: "POST",
          body: JSON.stringify({ command }),
        });
        this.sessionOutputs = {
          ...this.sessionOutputs,
          [id]: this.formatSessionOutput(response.output),
        };
      } catch (error) {
        this.sessionOutputs = {
          ...this.sessionOutputs,
          [id]: error.message || "Comando rechazado",
        };
      }
    },
    async stopSession(id) {
      try {
        await caligoApi.request(`/api/metasploit/sessions/${id}`, { method: "DELETE" });
        await this.refreshSessions();
      } catch (error) {
        this.error = error.message || "No se pudo cerrar la sesión";
      }
    },
    isOwned(host) {
      return this.sessions.some((session) => this.sessionHost(session) === host.address);
    },
    isMeterpreter(session) {
      return String(session?.type || "").toLowerCase().includes("meterpreter");
    },
    sessionHost(session) {
      const raw = [session.session_host, session.target_host, session.tunnel_peer, session.peer, session.info].filter(Boolean).join(" ");
      const match = raw.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      return match ? match[0] : "desconocido";
    },
    pathForEntry(entry) {
      if (entry.name === "..") {
        return this.parentPath(this.remoteWorkspace.currentPath);
      }
      const base = this.remoteWorkspace.currentPath || "";
      if (!base || base === ".") return entry.name;
      const separator = base.includes("\\") ? "\\" : "/";
      return base.endsWith("\\") || base.endsWith("/") ? `${base}${entry.name}` : `${base}${separator}${entry.name}`;
    },
    parentPath(path) {
      const value = String(path || "").replace(/[\\/]+$/, "");
      if (!value || value === "." || /^[A-Za-z]:$/.test(value)) return value || ".";
      const slash = Math.max(value.lastIndexOf("/"), value.lastIndexOf("\\"));
      if (slash <= 0) {
        return value.includes(":") ? value.slice(0, slash + 1) : ".";
      }
      return value.slice(0, slash);
    },
    pathForName(name) {
      const value = String(name || "").trim();
      if (!value) return "";
      if (/^[A-Za-z]:[\\/]/.test(value) || value.startsWith("/") || value.startsWith("\\")) {
        return value;
      }
      const base = this.remoteWorkspace.currentPath || ".";
      const separator = base.includes("\\") ? "\\" : "/";
      return base.endsWith("\\") || base.endsWith("/") ? `${base}${value}` : `${base}${separator}${value}`;
    },
    openPortSummary(host) {
      const ports = (host.ports || []).slice(0, 5).map((port) => `${port.port}/${port.service || "tcp"}`);
      return ports.length ? ports.join("  ") : "sin puertos abiertos";
    },
    async copyFocusedPath() {
      if (!this.focusedRemotePath) return;
      try {
        await navigator.clipboard.writeText(this.focusedRemotePath);
      } catch {
        this.activeCommand = this.focusedRemotePath;
      }
    },
    downloadRemotePreview() {
      if (!this.remoteFile.content) return;
      const blob = new Blob([this.remoteFile.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${String(this.remoteFile.path || "caligo-remote-file").split(/[\\/]/).pop() || "caligo-remote-file"}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    },
    formatBytes(value) {
      const size = Number(value || 0);
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    },
    moduleKey(type, module, target, port) {
      return `${type}:${module}:${target}:${port || ""}`;
    },
    compactModule(module) {
      return String(module || "").replace(/^(exploit|auxiliary|payload|post)\//, "");
    },
    formatSessionOutput(output) {
      if (!output) return "";
      if (typeof output === "string") return output;
      return JSON.stringify(output, null, 2);
    },
    modulePayloadOptions() {
      const raw = this.moduleInfo?.payloads?.payloads || this.moduleInfo?.payloads || [];
      const payloads = Array.isArray(raw) ? raw : [];
      return payloads
        .map((payload) => (typeof payload === "string" ? payload : payload?.fullname || payload?.name || payload?.payload || ""))
        .filter(Boolean)
        .map((payload) => ({
          value: payload,
          label: payload.replace(/^payload\//, ""),
          description: "Payload compatible devuelto por Metasploit.",
        }));
    },
  },
};
</script>
