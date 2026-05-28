<template>
  <section class="vpn-workbench" aria-labelledby="vpn-title">
    <div class="vpn-workbench__shell">
      <header class="identity-head">
        <div>
          <span class="eyebrow">Redes / Identidad</span>
          <h1 id="vpn-title">VPNs</h1>
          <p>
            Control de tuneles WireGuard/OpenVPN cargados en el servidor Caligo. Los perfiles
            se descubren en rutas allowlisted y se activan mediante helper con sudo limitado.
          </p>
        </div>

        <aside class="identity-status" :class="{ 'is-ready': helperReady, 'is-warning': !helperReady }">
          <span>VPN helper</span>
          <strong>{{ helperReady ? "Operativo" : "Pendiente" }}</strong>
          <small>{{ statusMessage }}</small>
        </aside>
      </header>

      <div class="identity-actions">
        <button type="button" :disabled="loading" @click="loadAll">
          {{ loading ? "Refrescando" : "Refrescar" }}
        </button>
        <button type="button" :disabled="actionBusy || !selectedProfileId" @click="connect">
          {{ actionBusy === "connect" ? "Conectando" : "Conectar perfil" }}
        </button>
        <button type="button" :disabled="Boolean(actionBusy)" @click="disconnect">
          {{ actionBusy === "disconnect" ? "Desconectando" : "Desconectar" }}
        </button>
      </div>

      <section class="vpn-status-grid">
        <article class="identity-card identity-card--signal">
          <span>Estado</span>
          <strong :class="vpnActive ? 'tone-success' : 'tone-neutral'">{{ vpnActive ? "Activa" : "Sin tunel" }}</strong>
          <small>{{ activeProfilesLabel }}</small>
        </article>
        <article class="identity-card identity-card--signal">
          <span>Helper</span>
          <strong>{{ helperReady ? "Disponible" : "No disponible" }}</strong>
          <small>{{ vpnStatus.helper || "caligo-vpn-control" }}</small>
        </article>
        <article class="identity-card identity-card--signal">
          <span>Perfiles</span>
          <strong>{{ profiles.length }}</strong>
          <small>WireGuard/OpenVPN detectados</small>
        </article>
        <article class="identity-card identity-card--signal">
          <span>Ultima accion</span>
          <strong>{{ operationResult?.status || "Sin cambios" }}</strong>
          <small>{{ operationResult?.action || "Esperando orden" }}</small>
        </article>
      </section>

      <section class="vpn-grid">
        <article class="identity-panel">
          <header>
            <span>Perfil</span>
            <strong>Seleccion</strong>
          </header>

          <label class="vpn-select-label">
            Perfil disponible
            <select v-model="selectedProfileId">
              <option value="">Selecciona un perfil</option>
              <option v-for="profile in profiles" :key="profile.id" :value="profile.id">
                {{ profile.label }} · {{ profile.protocol }}
              </option>
            </select>
          </label>

          <div class="vpn-profile-detail">
            <template v-if="selectedProfile">
              <span>{{ selectedProfile.provider }}</span>
              <strong>{{ selectedProfile.country || "Sin pais" }}{{ selectedProfile.city ? ` / ${selectedProfile.city}` : "" }}</strong>
              <small>{{ selectedProfile.description }}</small>
              <code>{{ selectedProfile.path }}</code>
            </template>
            <p v-else>Los perfiles se cargan desde el servidor y permiten parametrizar proveedor, pais, ciudad y protocolo mediante metadatos JSON.</p>
          </div>

          <p v-if="error" class="identity-error">{{ error }}</p>
        </article>

        <article class="identity-panel">
          <header>
            <span>Proveedores recomendados</span>
            <strong>Privacidad</strong>
          </header>
          <div class="vpn-provider-list">
            <article v-for="provider in providerHints" :key="provider.name">
              <span>{{ provider.protocols }}</span>
              <strong>{{ provider.name }}</strong>
              <small>{{ provider.description }}</small>
              <em>{{ provider.status }}</em>
            </article>
          </div>
        </article>
      </section>

      <section class="identity-panel identity-panel--wide">
        <header>
          <span>Perfiles detectados</span>
          <strong>{{ profiles.length }}</strong>
        </header>
        <div v-if="profiles.length" class="vpn-profile-grid">
          <button
            v-for="profile in profiles"
            :key="profile.id"
            type="button"
            class="vpn-profile-card"
            :class="{ 'is-active': selectedProfileId === profile.id }"
            @click="selectedProfileId = profile.id"
          >
            <span>{{ profile.protocol }}</span>
            <strong>{{ profile.label }}</strong>
            <small>{{ profile.provider }} · {{ profile.country || "custom" }}</small>
          </button>
        </div>
        <p v-else class="vpn-empty">
          No hay perfiles cargados. Copia ficheros `.conf` en WireGuard o `.ovpn` en OpenVPN y añade metadatos opcionales en JSON.
        </p>
      </section>

      <section class="identity-panel identity-panel--wide">
        <header>
          <span>Salida tecnica</span>
          <strong>{{ operationResult?.exitCode ?? vpnStatus.exitCode ?? "N/D" }}</strong>
        </header>
        <pre>{{ technicalOutput }}</pre>
      </section>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";

export default {
  name: "VpnWorkbench",
  data() {
    return {
      loading: false,
      actionBusy: "",
      selectedProfileId: "",
      profilePayload: null,
      vpnStatus: {},
      operationResult: null,
      error: "",
    };
  },
  computed: {
    profiles() {
      return this.profilePayload?.profiles || [];
    },
    providerHints() {
      return this.profilePayload?.providers || [];
    },
    selectedProfile() {
      return this.profiles.find((profile) => profile.id === this.selectedProfileId) || null;
    },
    helperReady() {
      return Boolean(this.vpnStatus?.available);
    },
    vpnActive() {
      return Boolean(this.vpnStatus?.active);
    },
    activeProfilesLabel() {
      const profiles = this.vpnStatus?.profiles;
      if (Array.isArray(profiles) && profiles.length) {
        return profiles.join(", ");
      }
      return this.vpnActive ? "Tunel activo" : "Sin perfiles activos";
    },
    statusMessage() {
      if (this.loading) return "Leyendo perfiles";
      if (this.vpnStatus?.message) return this.vpnStatus.message;
      if (!this.helperReady) return "Helper o sudo NOPASSWD pendiente";
      return this.vpnActive ? this.activeProfilesLabel : "Listo para conectar";
    },
    technicalOutput() {
      return JSON.stringify({
        status: this.vpnStatus,
        profiles: this.profilePayload,
        operation: this.operationResult,
      }, null, 2);
    },
  },
  mounted() {
    this.loadAll();
  },
  methods: {
    async loadAll() {
      this.loading = true;
      this.error = "";
      try {
        const payload = await caligoApi.request("/api/network/vpn/profiles");
        this.profilePayload = payload;
        this.vpnStatus = payload?.status || {};
        if (!this.selectedProfileId && this.profiles.length) {
          this.selectedProfileId = this.profiles[0].id;
        }
      } catch (error) {
        this.error = error?.message || "No se pudieron leer los perfiles VPN";
      } finally {
        this.loading = false;
      }
    },
    async connect() {
      if (!this.selectedProfileId || this.actionBusy) return;
      this.actionBusy = "connect";
      this.error = "";
      try {
        const payload = await caligoApi.request("/api/network/vpn/connect", {
          method: "POST",
          body: JSON.stringify({ profileId: this.selectedProfileId }),
        });
        this.operationResult = payload;
        this.vpnStatus = payload?.vpn || this.vpnStatus;
        window.dispatchEvent(new CustomEvent("caligo:network-identity-changed"));
      } catch (error) {
        this.error = error?.message || "No se pudo conectar la VPN";
      } finally {
        this.actionBusy = "";
        await this.loadAll();
      }
    },
    async disconnect() {
      if (this.actionBusy) return;
      this.actionBusy = "disconnect";
      this.error = "";
      try {
        const payload = await caligoApi.request("/api/network/vpn/disconnect", {
          method: "POST",
          body: JSON.stringify(this.selectedProfileId ? { profileId: this.selectedProfileId } : {}),
        });
        this.operationResult = payload;
        this.vpnStatus = payload?.vpn || this.vpnStatus;
        window.dispatchEvent(new CustomEvent("caligo:network-identity-changed"));
      } catch (error) {
        this.error = error?.message || "No se pudo desconectar la VPN";
      } finally {
        this.actionBusy = "";
        await this.loadAll();
      }
    },
  },
};
</script>
