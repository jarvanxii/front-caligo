import { createRouter, createWebHistory } from "vue-router";
import { getStoredToken } from "@/services/caligoApi";
import store from "@/store";

const HomeView = () => import("@/views/HomeView.vue");
const LoginView = () => import("@/views/LoginView.vue");
const ReconnaissanceView = () => import("@/views/reconocimiento/ReconnaissanceView.vue");
const UrlsView = () => import("@/views/reconocimiento/UrlsView.vue");
const UrlDnsResolverView = () => import("@/views/reconocimiento/urls/UrlDnsResolverView.vue");
const UrlInspectorView = () => import("@/views/reconocimiento/urls/UrlInspectorView.vue");
const UrlHttpSecurityView = () => import("@/views/reconocimiento/urls/UrlHttpSecurityView.vue");
const UrlTlsView = () => import("@/views/reconocimiento/urls/UrlTlsView.vue");
const UrlReputationView = () => import("@/views/reconocimiento/urls/UrlReputationView.vue");
const UrlHistoryView = () => import("@/views/reconocimiento/urls/UrlHistoryView.vue");
const UrlPublicFilesView = () => import("@/views/reconocimiento/urls/UrlPublicFilesView.vue");
const UrlEndpointsView = () => import("@/views/reconocimiento/urls/UrlEndpointsView.vue");
const UrlLocalToolsView = () => import("@/views/reconocimiento/urls/UrlLocalToolsView.vue");
const NmapView = () => import("@/views/reconocimiento/NmapView.vue");
const OpenvasView = () => import("@/views/reconocimiento/OpenvasView.vue");
const OsintView = () => import("@/views/osint/OsintView.vue");
const ProfileSearchView = () => import("@/views/osint/ProfileSearchView.vue");
const SherlockView = () => import("@/views/osint/SherlockView.vue");
const MaigretView = () => import("@/views/osint/MaigretView.vue");
const SocialAnalyzerView = () => import("@/views/osint/SocialAnalyzerView.vue");
const HoleheView = () => import("@/views/osint/HoleheView.vue");
const TheHarvesterView = () => import("@/views/osint/TheHarvesterView.vue");
const VulnerabilitiesView = () => import("@/views/vulnerabilidades/VulnerabilitiesView.vue");
const MetasploitView = () => import("@/views/vulnerabilidades/MetasploitView.vue");
const BruteForceView = () => import("@/views/vulnerabilidades/BruteForceView.vue");
const NucleiView = () => import("@/views/vulnerabilidades/NucleiView.vue");
const SearchsploitView = () => import("@/views/vulnerabilidades/SearchsploitView.vue");
const NiktoView = () => import("@/views/vulnerabilidades/NiktoView.vue");
const SqlmapView = () => import("@/views/vulnerabilidades/SqlmapView.vue");
const PasswordsView = () => import("@/views/contrasenas/PasswordsView.vue");
const JohnView = () => import("@/views/contrasenas/JohnView.vue");
const HashcatView = () => import("@/views/contrasenas/HashcatView.vue");
const HashIdentifierView = () => import("@/views/contrasenas/HashIdentifierView.vue");
const CrunchView = () => import("@/views/contrasenas/CrunchView.vue");
const CewlView = () => import("@/views/contrasenas/CewlView.vue");
const WordlistsView = () => import("@/views/contrasenas/WordlistsView.vue");
const EncodingView = () => import("@/views/codificacion/EncodingView.vue");
const SteganographyView = () => import("@/views/esteganografia/SteganographyView.vue");
const StegoAnalyzeView = () => import("@/views/esteganografia/StegoAnalyzeView.vue");
const StegoMetadataAnalyzeView = () => import("@/views/esteganografia/StegoMetadataAnalyzeView.vue");
const StegoMetadataEditorView = () => import("@/views/esteganografia/StegoMetadataEditorView.vue");
const StegoEmbedView = () => import("@/views/esteganografia/StegoEmbedView.vue");
const StegoExtractView = () => import("@/views/esteganografia/StegoExtractView.vue");
const NetworkUtilitiesView = () => import("@/views/redes-utilidades/NetworkUtilitiesView.vue");
const WhoamiView = () => import("@/views/redes-utilidades/WhoamiView.vue");
const VpnsView = () => import("@/views/redes-utilidades/VpnsView.vue");

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: {
      hideHeader: true,
      authLayout: true,
    },
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
    meta: {
      hideHeader: false,
      hideSidebar: true,
    },
  },
  {
    path: "/reconocimiento",
    name: "reconocimiento",
    component: ReconnaissanceView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/openvas",
    name: "openvas",
    component: OpenvasView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/metasploit",
    name: "metasploit",
    component: MetasploitView,
    meta: {
      moduleKey: "vulnerabilidades",
    },
  },
  {
    path: "/urls",
    name: "urls",
    component: UrlsView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/resolver-dns",
    name: "urlsDnsResolver",
    component: UrlDnsResolverView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/inspector",
    name: "urlsInspector",
    component: UrlInspectorView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/seguridad-http",
    name: "urlsHttpSecurity",
    component: UrlHttpSecurityView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/tls",
    name: "urlsTls",
    component: UrlTlsView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/reputacion",
    name: "urlsReputation",
    component: UrlReputationView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/historial",
    name: "urlsHistory",
    component: UrlHistoryView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/archivos-publicos",
    name: "urlsPublicFiles",
    component: UrlPublicFilesView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/endpoints",
    name: "urlsEndpoints",
    component: UrlEndpointsView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/urls/herramientas-locales",
    name: "urlsLocalTools",
    component: UrlLocalToolsView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/nmap",
    name: "nmap",
    component: NmapView,
    meta: {
      moduleKey: "reconocimiento",
    },
  },
  {
    path: "/osint",
    name: "osint",
    component: OsintView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/osint/personas",
    name: "osintProfileSearch",
    component: ProfileSearchView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/osint/sherlock",
    name: "osintSherlock",
    component: SherlockView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/osint/maigret",
    name: "osintMaigret",
    component: MaigretView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/osint/social-analyzer",
    name: "osintSocialAnalyzer",
    component: SocialAnalyzerView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/osint/holehe",
    name: "osintHolehe",
    component: HoleheView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/osint/theharvester",
    name: "osintTheHarvester",
    component: TheHarvesterView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/vulnerabilidades",
    name: "vulnerabilidades",
    component: VulnerabilitiesView,
    meta: {
      moduleKey: "vulnerabilidades",
    },
  },
  {
    path: "/contrasenas",
    name: "contrasenas",
    component: PasswordsView,
    meta: {
      moduleKey: "contrasenas",
    },
  },
  {
    path: "/contrasenas/john",
    name: "passwordsJohn",
    component: JohnView,
    meta: {
      moduleKey: "contrasenas",
    },
  },
  {
    path: "/contrasenas/hashcat",
    name: "passwordsHashcat",
    component: HashcatView,
    meta: {
      moduleKey: "contrasenas",
    },
  },
  {
    path: "/contrasenas/identificador",
    name: "passwordsIdentifier",
    component: HashIdentifierView,
    meta: {
      moduleKey: "contrasenas",
    },
  },
  {
    path: "/contrasenas/crunch",
    name: "passwordsCrunch",
    component: CrunchView,
    meta: {
      moduleKey: "contrasenas",
    },
  },
  {
    path: "/contrasenas/cewl",
    name: "passwordsCewl",
    component: CewlView,
    meta: {
      moduleKey: "contrasenas",
    },
  },
  {
    path: "/contrasenas/wordlists",
    name: "passwordsWordlists",
    component: WordlistsView,
    meta: {
      moduleKey: "contrasenas",
    },
  },
  {
    path: "/fuerza-bruta",
    name: "fuerzaBruta",
    component: BruteForceView,
    meta: {
      moduleKey: "vulnerabilidades",
    },
  },
  {
    path: "/vulnerabilidades/nuclei",
    name: "vulnerabilidadesNuclei",
    component: NucleiView,
    meta: {
      moduleKey: "vulnerabilidades",
    },
  },
  {
    path: "/vulnerabilidades/searchsploit",
    name: "vulnerabilidadesSearchsploit",
    component: SearchsploitView,
    meta: {
      moduleKey: "vulnerabilidades",
    },
  },
  {
    path: "/vulnerabilidades/nikto",
    name: "vulnerabilidadesNikto",
    component: NiktoView,
    meta: {
      moduleKey: "vulnerabilidades",
    },
  },
  {
    path: "/vulnerabilidades/sqlmap",
    name: "vulnerabilidadesSqlmap",
    component: SqlmapView,
    meta: {
      moduleKey: "vulnerabilidades",
    },
  },
  {
    path: "/esteganografia",
    name: "esteganografia",
    component: SteganographyView,
    meta: {
      moduleKey: "esteganografia",
    },
  },
  {
    path: "/esteganografia/analizador",
    name: "stegoAnalyze",
    component: StegoAnalyzeView,
    meta: {
      moduleKey: "esteganografia",
    },
  },
  {
    path: "/esteganografia/metadatos/analizador",
    name: "stegoMetadataAnalyze",
    component: StegoMetadataAnalyzeView,
    meta: {
      moduleKey: "esteganografia",
    },
  },
  {
    path: "/esteganografia/metadatos/editor",
    name: "stegoMetadataEditor",
    component: StegoMetadataEditorView,
    meta: {
      moduleKey: "esteganografia",
    },
  },
  {
    path: "/esteganografia/incrustar",
    name: "stegoEmbed",
    component: StegoEmbedView,
    meta: {
      moduleKey: "esteganografia",
    },
  },
  {
    path: "/esteganografia/extraer",
    name: "stegoExtract",
    component: StegoExtractView,
    meta: {
      moduleKey: "esteganografia",
    },
  },
  {
    path: "/redes-utilidades",
    name: "redesUtilidades",
    component: NetworkUtilitiesView,
    meta: {
      moduleKey: "redesUtilidades",
    },
  },
  {
    path: "/redes-utilidades/identidad/whoami",
    name: "networkWhoami",
    component: WhoamiView,
    meta: {
      moduleKey: "redesUtilidades",
    },
  },
  {
    path: "/redes-utilidades/identidad/vpns",
    name: "networkVpns",
    component: VpnsView,
    meta: {
      moduleKey: "redesUtilidades",
    },
  },
  {
    path: "/codificacion",
    name: "codificacion",
    component: EncodingView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
});

router.beforeEach((to) => {
  const hasSession = Boolean(store.state.token || getStoredToken());
  if (to.name === "login") {
    return hasSession ? { name: "home" } : true;
  }
  return hasSession ? true : { name: "login" };
});

export default router;
