import { createRouter, createWebHistory } from "vue-router";
import { getStoredToken } from "@/services/caligoApi";
import store from "@/store";

const HomeView = () => import("@/views/HomeView.vue");
const LoginView = () => import("@/views/LoginView.vue");
const ReconnaissanceView = () => import("@/views/ReconnaissanceView.vue");
const OsintView = () => import("@/views/OsintView.vue");
const VulnerabilitiesView = () => import("@/views/VulnerabilitiesView.vue");
const OpenvasView = () => import("@/views/OpenvasView.vue");
const MetasploitView = () => import("@/views/MetasploitView.vue");
const UrlsView = () => import("@/views/UrlsView.vue");
const UrlDnsResolverView = () => import("@/views/urls/UrlDnsResolverView.vue");
const UrlInspectorView = () => import("@/views/urls/UrlInspectorView.vue");
const UrlHttpSecurityView = () => import("@/views/urls/UrlHttpSecurityView.vue");
const UrlTlsView = () => import("@/views/urls/UrlTlsView.vue");
const UrlReputationView = () => import("@/views/urls/UrlReputationView.vue");
const UrlHistoryView = () => import("@/views/urls/UrlHistoryView.vue");
const UrlPublicFilesView = () => import("@/views/urls/UrlPublicFilesView.vue");
const UrlEndpointsView = () => import("@/views/urls/UrlEndpointsView.vue");
const UrlLocalToolsView = () => import("@/views/urls/UrlLocalToolsView.vue");
const NmapView = () => import("@/views/NmapView.vue");
const PasswordsView = () => import("@/views/PasswordsView.vue");
const JohnView = () => import("@/views/passwords/JohnView.vue");
const HashcatView = () => import("@/views/passwords/HashcatView.vue");
const HashIdentifierView = () => import("@/views/passwords/HashIdentifierView.vue");
const CrunchView = () => import("@/views/passwords/CrunchView.vue");
const CewlView = () => import("@/views/passwords/CewlView.vue");
const WordlistsView = () => import("@/views/passwords/WordlistsView.vue");
const BruteForceView = () => import("@/views/BruteForceView.vue");
const NucleiView = () => import("@/views/vulnerabilities/NucleiView.vue");
const SearchsploitView = () => import("@/views/vulnerabilities/SearchsploitView.vue");
const NiktoView = () => import("@/views/vulnerabilities/NiktoView.vue");
const SqlmapView = () => import("@/views/vulnerabilities/SqlmapView.vue");
const SteganographyView = () => import("@/views/SteganographyView.vue");
const StegoAnalyzeView = () => import("@/views/steganography/StegoAnalyzeView.vue");
const StegoMetadataAnalyzeView = () => import("@/views/steganography/StegoMetadataAnalyzeView.vue");
const StegoMetadataEditorView = () => import("@/views/steganography/StegoMetadataEditorView.vue");
const StegoEmbedView = () => import("@/views/steganography/StegoEmbedView.vue");
const StegoExtractView = () => import("@/views/steganography/StegoExtractView.vue");
const NetworkUtilitiesView = () => import("@/views/NetworkUtilitiesView.vue");
const EncodingView = () => import("@/views/EncodingView.vue");

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
