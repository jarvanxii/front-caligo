<template>
  <section class="vpn-workbench" :class="`vpn-workbench--${protocolKey}`" aria-labelledby="vpn-title">
    <div class="vpn-workbench__shell">
      <ToolHeroHeader
        :tool-id="protocolKey"
        :title="protocolTitle"
        eyebrow="Redes / VPNs"
        :summary="protocolDescription"
        title-id="vpn-title"
        :meta="heroMeta"
      />

      <div class="vpn-command-bar" aria-label="Controles de conexión VPN">
        <button type="button" class="vpn-action-button vpn-action-button--ghost" :disabled="loading" @click="loadAll">
          {{ loading ? "Refrescando" : "Refrescar" }}
        </button>
        <button
          type="button"
          class="vpn-action-button vpn-action-button--primary"
          :disabled="Boolean(actionBusy) || !selectedProfileId || !helperReady"
          @click="connect"
        >
          {{ actionBusy === "connect" ? "Conectando" : "Conectar ruta" }}
        </button>
        <button type="button" class="vpn-action-button vpn-action-button--danger" :disabled="Boolean(actionBusy) || !helperReady" @click="disconnect">
          {{ actionBusy === "disconnect" ? "Desconectando" : "Desconectar" }}
        </button>

        <div class="vpn-command-bar__selection">
          <span>Ruta preparada</span>
          <strong>{{ selectedProfile ? selectedProfile.label : "Sin perfil seleccionado" }}</strong>
        </div>
      </div>

      <section class="vpn-status-grid">
        <article class="identity-card identity-card--signal">
          <span>Túnel</span>
          <strong :class="vpnActive ? 'tone-success' : 'tone-neutral'">{{ vpnActive ? "Activo" : "Inactivo" }}</strong>
          <small>{{ activeProfilesLabel }}</small>
        </article>
        <article class="identity-card identity-card--signal">
          <span>Destino</span>
          <strong>{{ selectedCountry || "Libre" }}</strong>
          <small>{{ selectedProvider || "Cualquier proveedor" }}{{ selectedCity ? ` / ${selectedCity}` : "" }}</small>
        </article>
        <article class="identity-card identity-card--signal">
          <span>Perfiles</span>
          <strong>{{ profiles.length }}</strong>
          <small>{{ providerOptions.length }} proveedores / {{ countryOptions.length }} países</small>
        </article>
        <article class="identity-card identity-card--signal">
          <span>Última acción</span>
          <strong>{{ operationResult?.status || "Sin cambios" }}</strong>
          <small>{{ operationResult?.action || "Esperando orden" }}</small>
        </article>
      </section>

      <section class="vpn-control-grid">
        <article class="identity-panel vpn-locator-panel">
          <header>
            <span>Destino</span>
            <strong>Proveedor, país y ciudad</strong>
          </header>

          <div class="vpn-filter-block">
            <div class="vpn-filter-block__head">
              <span>Proveedor</span>
              <button type="button" :disabled="!selectedProvider" @click="selectProvider('')">Todos</button>
            </div>
            <div class="vpn-chip-row">
              <button
                v-for="provider in providerOptions"
                :key="provider.label"
                type="button"
                class="vpn-filter-chip"
                :class="{ 'is-active': selectedProvider === provider.label }"
                @click="selectProvider(provider.label)"
              >
                <strong>{{ provider.label }}</strong>
                <small>{{ provider.count }}</small>
              </button>
            </div>
          </div>

          <div class="vpn-map-card" :class="{ 'is-empty': !profiles.length }">
            <div class="vpn-map-card__scanline" aria-hidden="true"></div>
            <div class="vpn-route-readout">
              <span>{{ protocolTitle }}</span>
              <strong>{{ selectedCountry || "Selecciona país" }}</strong>
              <small>{{ selectedProvider || "Proveedor abierto" }}{{ selectedCity ? ` / ${selectedCity}` : " / ciudad automática" }}</small>
            </div>

            <div v-if="countryOptions.length" class="vpn-country-grid" aria-label="Selección de país">
              <button
                v-for="country in countryOptions"
                :key="country.label"
                type="button"
                class="vpn-country-node"
                :class="{ 'is-active': selectedCountry === country.label }"
                @click="selectCountry(country.label)"
              >
                <span>{{ country.code }}</span>
                <strong>{{ country.label }}</strong>
                <small>{{ country.count }} perfiles</small>
              </button>
            </div>

            <p v-else class="vpn-empty">{{ emptyProfilesMessage }}</p>
          </div>

          <div v-if="cityOptions.length" class="vpn-filter-block">
            <div class="vpn-filter-block__head">
              <span>Ciudad</span>
              <button type="button" :disabled="!selectedCity" @click="selectCity('')">Automática</button>
            </div>
            <div class="vpn-chip-row">
              <button
                v-for="city in cityOptions"
                :key="city.label"
                type="button"
                class="vpn-filter-chip vpn-filter-chip--city"
                :class="{ 'is-active': selectedCity === city.label }"
                @click="selectCity(city.label)"
              >
                <strong>{{ city.label }}</strong>
                <small>{{ city.count }}</small>
              </button>
            </div>
          </div>

          <button v-if="hasActiveFilters" type="button" class="vpn-clear-filter" @click="clearFilters">
            Limpiar filtros de ubicación
          </button>
        </article>

        <article class="identity-panel vpn-connect-panel">
          <header>
            <span>Ruta activa</span>
            <strong>{{ helperReady ? "Control disponible" : "Helper pendiente" }}</strong>
          </header>

          <div v-if="selectedProfile" class="vpn-route-card" :class="{ 'is-connected': isProfileActive(selectedProfile) }">
            <div class="vpn-route-card__dial" aria-hidden="true">
              <span>{{ profileInitials(selectedProfile) }}</span>
            </div>
            <div class="vpn-route-card__body">
              <span>{{ selectedProfile.protocol }}</span>
              <strong>{{ selectedProfile.label }}</strong>
              <small>{{ selectedProfile.description || routeDescription(selectedProfile) }}</small>
            </div>
            <dl>
              <div>
                <dt>Proveedor</dt>
                <dd>{{ profileProvider(selectedProfile) }}</dd>
              </div>
              <div>
                <dt>País</dt>
                <dd>{{ profileCountry(selectedProfile) }}</dd>
              </div>
              <div>
                <dt>Ciudad</dt>
                <dd>{{ profileCity(selectedProfile) }}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{{ isProfileActive(selectedProfile) ? "Conectado" : "Preparado" }}</dd>
              </div>
            </dl>
            <div class="vpn-route-actions">
              <button
                type="button"
                class="vpn-action-button vpn-action-button--primary"
                :disabled="Boolean(actionBusy) || !helperReady"
                @click="connect"
              >
                {{ actionBusy === "connect" ? "Conectando" : "Conectar ahora" }}
              </button>
              <button type="button" class="vpn-action-button vpn-action-button--ghost" :disabled="Boolean(actionBusy)" @click="disconnect">
                {{ actionBusy === "disconnect" ? "Cerrando" : "Cerrar túnel" }}
              </button>
            </div>
          </div>

          <div v-else class="vpn-profile-detail">
            <span>Sin selección</span>
            <strong>Elige una ruta disponible</strong>
            <small>{{ emptySelectionMessage }}</small>
          </div>

          <p v-if="error" class="identity-error">{{ error }}</p>
        </article>
      </section>

      <section class="identity-panel identity-panel--wide">
        <header>
          <span>Perfiles disponibles</span>
          <strong>{{ filteredProfiles.length }} / {{ profiles.length }}</strong>
        </header>
        <div v-if="filteredProfiles.length" class="vpn-profile-grid">
          <button
            v-for="profile in filteredProfiles"
            :key="profile.id"
            type="button"
            class="vpn-profile-card"
            :class="{ 'is-active': selectedProfileId === profile.id, 'is-connected': isProfileActive(profile) }"
            @click="selectProfile(profile)"
          >
            <span>{{ profileProvider(profile) }} / {{ profile.protocol }}</span>
            <strong>{{ profile.label }}</strong>
            <small>{{ profileCountry(profile) }}{{ profile.city ? ` / ${profile.city}` : "" }}</small>
            <em>{{ isProfileActive(profile) ? "Conectado" : "Disponible" }}</em>
          </button>
        </div>
        <p v-else class="vpn-empty">{{ profiles.length ? "No hay perfiles que coincidan con esos filtros." : emptyProfilesMessage }}</p>
      </section>

      <section class="identity-panel identity-panel--wide vpn-provider-board">
        <header>
          <span>Proveedores recomendados</span>
          <strong>Privacidad operativa</strong>
        </header>
        <div class="vpn-provider-list">
          <article v-for="provider in providerHints" :key="provider.name">
            <span>{{ provider.protocols }}</span>
            <strong>{{ provider.name }}</strong>
            <small>{{ provider.description }}</small>
            <em>{{ provider.status }}</em>
          </article>
        </div>
      </section>

      <details class="identity-panel identity-panel--wide vpn-technical">
        <summary>
          <span>Salida técnica</span>
          <strong>{{ operationResult?.exitCode ?? vpnStatus.exitCode ?? "N/D" }}</strong>
        </summary>
        <pre>{{ technicalOutput }}</pre>
      </details>
    </div>
  </section>
</template>

<script>
import { caligoApi } from "@/services/caligoApi";
import ToolHeroHeader from "@/components/ToolHeroHeader.vue";

export default {
  name: "VpnWorkbench",
  components: {
    ToolHeroHeader,
  },
  props: {
    initialProtocol: {
      type: String,
      default: "wireguard",
    },
  },
  data() {
    return {
      loading: false,
      actionBusy: "",
      selectedProfileId: "",
      selectedProvider: "",
      selectedCountry: "",
      selectedCity: "",
      profilePayload: null,
      vpnStatus: {},
      operationResult: null,
      error: "",
    };
  },
  computed: {
    protocolKey() {
      return this.initialProtocol === "openvpn" ? "openvpn" : "wireguard";
    },
    protocolTitle() {
      return this.protocolKey === "openvpn" ? "OpenVPN" : "WireGuard";
    },
    protocolDescription() {
      if (this.protocolKey === "openvpn") {
        return "Control visual de perfiles OpenVPN cargados en el servidor Caligo, con selección por proveedor, país, ciudad y estado de conexión.";
      }
      return "Control visual de perfiles WireGuard cargados en el servidor Caligo, con selección por proveedor, país, ciudad y estado de conexión.";
    },
    heroMeta() {
      return [
        { label: "Helper", value: this.helperReady ? "Operativo" : "Pendiente" },
        { label: "Perfiles", value: this.profiles.length },
        { label: "Destino", value: this.selectedCountry || "Libre" },
      ];
    },
    emptySelectionMessage() {
      return `Elige un perfil ${this.protocolTitle} desde el mapa de ubicaciones o desde las tarjetas disponibles.`;
    },
    emptyProfilesMessage() {
      const extension = this.protocolKey === "openvpn" ? ".ovpn" : ".conf";
      return `No hay perfiles ${this.protocolTitle} detectados. Carga ficheros ${extension} en el directorio permitido del servidor y añade metadatos de proveedor, país y ciudad cuando estén disponibles.`;
    },
    allProfiles() {
      return this.profilePayload?.profiles || [];
    },
    profiles() {
      return this.allProfiles.filter((profile) => String(profile.protocol || "").toLowerCase() === this.protocolKey);
    },
    filteredProfiles() {
      return this.profiles.filter((profile) => {
        const providerMatches = !this.selectedProvider || this.profileProvider(profile) === this.selectedProvider;
        const countryMatches = !this.selectedCountry || this.profileCountry(profile) === this.selectedCountry;
        const cityMatches = !this.selectedCity || this.profileCity(profile) === this.selectedCity;
        return providerMatches && countryMatches && cityMatches;
      });
    },
    providerOptions() {
      return this.groupProfilesBy((profile) => this.profileProvider(profile));
    },
    countryOptions() {
      const scoped = this.profiles.filter((profile) => !this.selectedProvider || this.profileProvider(profile) === this.selectedProvider);
      return this.groupProfileCollection(scoped, (profile) => this.profileCountry(profile)).map((country) => ({
        ...country,
        code: this.locationCode(country.label),
      }));
    },
    cityOptions() {
      const scoped = this.profiles.filter((profile) => {
        const providerMatches = !this.selectedProvider || this.profileProvider(profile) === this.selectedProvider;
        const countryMatches = !this.selectedCountry || this.profileCountry(profile) === this.selectedCountry;
        return providerMatches && countryMatches;
      });
      if (!scoped.some((profile) => Boolean(String(profile.city || "").trim()))) {
        return [];
      }
      return this.groupProfileCollection(scoped, (profile) => this.profileCity(profile));
    },
    hasActiveFilters() {
      return Boolean(this.selectedProvider || this.selectedCountry || this.selectedCity);
    },
    providerHints() {
      const providers = this.profilePayload?.providers?.length ? this.profilePayload.providers : this.defaultProviderHints;
      return providers.filter((provider) => String(provider.protocols || "").toLowerCase().includes(this.protocolKey));
    },
    defaultProviderHints() {
      return [
        {
          name: "Mullvad",
          protocols: "WireGuard/OpenVPN",
          description: "Perfiles centrados en privacidad, selección por país y rotación sencilla de servidores.",
          status: "Importa perfiles del proveedor",
        },
        {
          name: "Proton VPN",
          protocols: "WireGuard/OpenVPN",
          description: "Perfiles por país, Secure Core cuando el proveedor lo permita y buena cobertura regional.",
          status: "Importa perfiles del proveedor",
        },
        {
          name: "IVPN",
          protocols: "WireGuard/OpenVPN",
          description: "Proveedor orientado a privacidad con perfiles limpios para túneles de laboratorio.",
          status: "Importa perfiles del proveedor",
        },
      ];
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
      return this.vpnActive ? "Túnel activo" : "Sin perfiles activos";
    },
    statusMessage() {
      if (this.loading) return "Leyendo perfiles";
      if (this.vpnStatus?.message) return this.vpnStatus.message;
      if (!this.helperReady) return "Helper o sudo NOPASSWD pendiente";
      return this.vpnActive ? this.activeProfilesLabel : "Listo para conectar";
    },
    technicalOutput() {
      return JSON.stringify({
        protocol: this.protocolKey,
        status: this.vpnStatus,
        profiles: this.profilePayload,
        operation: this.operationResult,
      }, null, 2);
    },
  },
  watch: {
    initialProtocol() {
      this.clearFilters();
      this.syncSelectedProfile();
    },
    selectedProvider() {
      this.syncLocationFilters();
      this.syncSelectedProfile();
    },
    selectedCountry() {
      this.syncLocationFilters();
      this.syncSelectedProfile();
    },
    selectedCity() {
      this.syncSelectedProfile();
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
        this.syncSelectedProfile();
      } catch (error) {
        this.error = this.apiErrorMessage(error, "No se pudieron leer los perfiles VPN");
      } finally {
        this.loading = false;
      }
    },
    syncSelectedProfile() {
      if (this.selectedProfile && this.filteredProfiles.some((profile) => profile.id === this.selectedProfileId)) {
        return;
      }
      this.selectedProfileId = this.filteredProfiles[0]?.id || "";
    },
    syncLocationFilters() {
      if (this.selectedCountry && !this.countryOptions.some((country) => country.label === this.selectedCountry)) {
        this.selectedCountry = "";
      }
      if (!this.selectedCity) return;
      if (!this.cityOptions.some((city) => city.label === this.selectedCity)) {
        this.selectedCity = "";
      }
    },
    selectProvider(provider) {
      this.selectedProvider = provider;
    },
    selectCountry(country) {
      this.selectedCountry = this.selectedCountry === country ? "" : country;
    },
    selectCity(city) {
      this.selectedCity = this.selectedCity === city ? "" : city;
    },
    selectProfile(profile) {
      this.selectedProfileId = profile?.id || "";
      if (profile) {
        this.selectedProvider = this.profileProvider(profile);
        this.selectedCountry = this.profileCountry(profile);
        this.selectedCity = String(profile.city || "").trim() ? this.profileCity(profile) : "";
      }
    },
    clearFilters() {
      this.selectedProvider = "";
      this.selectedCountry = "";
      this.selectedCity = "";
    },
    profileProvider(profile) {
      return String(profile?.provider || "").trim() || "Custom";
    },
    profileCountry(profile) {
      return String(profile?.country || "").trim() || "Sin país";
    },
    profileCity(profile) {
      return String(profile?.city || "").trim() || "Automática";
    },
    routeDescription(profile) {
      return `${this.profileProvider(profile)} enruta el tráfico del servidor por ${this.profileCountry(profile)} con perfil ${this.protocolTitle}.`;
    },
    profileInitials(profile) {
      const provider = this.profileProvider(profile).slice(0, 1);
      const country = this.profileCountry(profile).slice(0, 1);
      return `${provider}${country}`.toUpperCase();
    },
    locationCode(label) {
      const value = String(label || "").replace(/[^a-zA-ZÀ-ÿ]/g, "").slice(0, 2);
      return (value || "VPN").toUpperCase();
    },
    groupProfilesBy(selector) {
      return this.groupProfileCollection(this.profiles, selector);
    },
    groupProfileCollection(collection, selector) {
      const groups = new Map();
      collection.forEach((profile) => {
        const label = selector(profile);
        groups.set(label, (groups.get(label) || 0) + 1);
      });
      return Array.from(groups.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => a.label.localeCompare(b.label, "es"));
    },
    isProfileActive(profile) {
      const activeProfiles = this.vpnStatus?.profiles;
      if (!Array.isArray(activeProfiles) || !activeProfiles.length || !profile) {
        return false;
      }
      const activeTokens = activeProfiles.map((value) => String(value || "").toLowerCase());
      const candidates = [profile.id, profile.name, profile.label, profile.path]
        .map((value) => String(value || "").toLowerCase())
        .filter(Boolean);
      return candidates.some((candidate) =>
        activeTokens.some((token) => token.includes(candidate) || candidate.includes(token)),
      );
    },
    apiErrorMessage(error, fallback) {
      const message = error?.message || fallback;
      if (/forbidden|403/i.test(message)) {
        return "Acceso denegado por la API. Inicia sesión con credenciales operativas para controlar VPNs reales.";
      }
      return message;
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
        this.error = this.apiErrorMessage(error, "No se pudo conectar la VPN");
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
        this.error = this.apiErrorMessage(error, "No se pudo desconectar la VPN");
      } finally {
        this.actionBusy = "";
        await this.loadAll();
      }
    },
  },
};
</script>
