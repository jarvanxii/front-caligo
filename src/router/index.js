import { createRouter, createWebHistory } from "vue-router";
import { catalogToolRoutes } from "@/data/toolCatalog";
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
const AssetfinderView = () => import("@/views/reconocimiento/AssetfinderView.vue");
const DnsenumView = () => import("@/views/reconocimiento/DnsenumView.vue");
const DnsreconView = () => import("@/views/reconocimiento/DnsreconView.vue");
const FierceView = () => import("@/views/reconocimiento/FierceView.vue");
const FpingView = () => import("@/views/reconocimiento/FpingView.vue");
const OsintView = () => import("@/views/osint/OsintView.vue");
const ProfileSearchView = () => import("@/views/osint/ProfileSearchView.vue");
const SherlockView = () => import("@/views/osint/SherlockView.vue");
const MaigretView = () => import("@/views/osint/MaigretView.vue");
const SocialAnalyzerView = () => import("@/views/osint/SocialAnalyzerView.vue");
const HoleheView = () => import("@/views/osint/HoleheView.vue");
const TheHarvesterView = () => import("@/views/osint/TheHarvesterView.vue");
const EmailExposureView = () => import("@/views/osint/EmailExposureView.vue");
const PhoneLookupView = () => import("@/views/osint/PhoneLookupView.vue");
const DomainContactsView = () => import("@/views/osint/DomainContactsView.vue");
const GitDumperView = () => import("@/views/osint/GitDumperView.vue");
const SpiderFootView = () => import("@/views/osint/SpiderFootView.vue");
const TruffleHogView = () => import("@/views/osint/TruffleHogView.vue");
const PasswordExposureView = () => import("@/views/osint/PasswordExposureView.vue");
const MetadataExposureView = () => import("@/views/osint/MetadataExposureView.vue");
const PublicFilesExposureView = () => import("@/views/osint/PublicFilesExposureView.vue");
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
const NetworksView = () => import("@/views/redes/NetworksView.vue");
const UtilitiesView = () => import("@/views/utilidades/UtilitiesView.vue");
const WhoamiView = () => import("@/views/utilidades/WhoamiView.vue");
const VpnsView = () => import("@/views/redes/VpnsView.vue");
const ModuleCatalogView = () => import("@/views/tools/ModuleCatalogView.vue");
const CatalogToolView = () => import("@/views/tools/CatalogToolView.vue");
const PlatformGuideView = () => import("@/views/tools/PlatformGuideView.vue");
const PlatformUpdatesView = () => import("@/views/tools/PlatformUpdatesView.vue");

const legacyToolRedirects = [
  ["/openvas", "openvas"],
  ["/metasploit", "metasploit"],
  ["/urls", "urls"],
  ["/urls/resolver-dns", "urlsDnsResolver"],
  ["/urls/inspector", "urlsInspector"],
  ["/urls/seguridad-http", "urlsHttpSecurity"],
  ["/urls/tls", "urlsTls"],
  ["/urls/reputacion", "urlsReputation"],
  ["/urls/historial", "urlsHistory"],
  ["/urls/archivos-publicos", "urlsPublicFiles"],
  ["/urls/endpoints", "urlsEndpoints"],
  ["/urls/herramientas-locales", "urlsLocalTools"],
  ["/nmap", "nmap"],
  ["/osint/personas", "osintProfileSearch"],
  ["/osint/sherlock", "osintSherlock"],
  ["/osint/maigret", "osintMaigret"],
  ["/osint/social-analyzer", "osintSocialAnalyzer"],
  ["/osint/holehe", "osintHolehe"],
  ["/osint/theharvester", "osintTheHarvester"],
  ["/osint/contacto/email-exposure", "osintEmailExposure"],
  ["/osint/contacto/phone-lookup", "osintPhoneLookup"],
  ["/osint/contacto/domain-contacts", "osintDomainContacts"],
  ["/osint/documentos/git-dumper", "osintGitDumper"],
  ["/osint/identidad/spiderfoot", "osintSpiderFoot"],
  ["/osint/documentos/trufflehog", "osintTruffleHog"],
  ["/osint/brechas/password", "osintPasswordExposure"],
  ["/osint/documentos/metadatos", "osintMetadataExposure"],
  ["/osint/documentos/archivos-publicos", "osintPublicFiles"],
  ["/contrasenas/john", "passwordsJohn"],
  ["/contrasenas/hashcat", "passwordsHashcat"],
  ["/contrasenas/identificador", "passwordsIdentifier"],
  ["/contrasenas/crunch", "passwordsCrunch"],
  ["/contrasenas/cewl", "passwordsCewl"],
  ["/contrasenas/wordlists", "passwordsWordlists"],
  ["/fuerza-bruta", "fuerzaBruta"],
  ["/vulnerabilidades/nuclei", "vulnerabilidadesNuclei"],
  ["/vulnerabilidades/searchsploit", "vulnerabilidadesSearchsploit"],
  ["/vulnerabilidades/nikto", "vulnerabilidadesNikto"],
  ["/vulnerabilidades/sqlmap", "vulnerabilidadesSqlmap"],
  ["/esteganografia/analizador", "stegoAnalyze"],
  ["/esteganografia/metadatos/analizador", "stegoMetadataAnalyze"],
  ["/esteganografia/metadatos/editor", "stegoMetadataEditor"],
  ["/esteganografia/incrustar", "stegoEmbed"],
  ["/esteganografia/extraer", "stegoExtract"],
  ["/utilidades/identidad/whoami-local", "networkWhoamiLocal"],
  ["/utilidades/identidad/whoami-server", "networkWhoamiServer"],
  ["/redes/vpns/wireguard", "networkVpnsWireguard"],
  ["/redes/vpns/openvpn", "networkVpnsOpenvpn"],
];

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
    path: "/settings/guide",
    name: "platformGuide",
    component: PlatformGuideView,
    meta: {
      hideSidebar: true,
      moduleKey: "tools",
    },
  },
  {
    path: "/settings/updates",
    name: "platformUpdates",
    component: PlatformUpdatesView,
    meta: {
      hideSidebar: true,
      moduleKey: "tools",
    },
  },
  {
    path: "/scan",
    name: "scan",
    component: ReconnaissanceView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/reconocimiento",
    name: "reconocimiento",
    redirect: { name: "scan" },
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/openvas",
    name: "openvas",
    component: OpenvasView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/metasploit",
    name: "metasploit",
    component: MetasploitView,
    meta: {
      moduleKey: "xploit",
    },
  },
  {
    path: "/tool/caligo-intel",
    name: "urls",
    component: UrlsView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/dns-resolver",
    name: "urlsDnsResolver",
    component: UrlDnsResolverView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/url-inspector",
    name: "urlsInspector",
    component: UrlInspectorView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/http-security",
    name: "urlsHttpSecurity",
    component: UrlHttpSecurityView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/tls-certificate",
    name: "urlsTls",
    component: UrlTlsView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/url-reputation",
    name: "urlsReputation",
    component: UrlReputationView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/url-history",
    name: "urlsHistory",
    component: UrlHistoryView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/url-public-files",
    name: "urlsPublicFiles",
    component: UrlPublicFilesView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/url-endpoints",
    name: "urlsEndpoints",
    component: UrlEndpointsView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/url-local-tools",
    name: "urlsLocalTools",
    component: UrlLocalToolsView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/nmap",
    name: "nmap",
    component: NmapView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/assetfinder",
    name: "assetfinder",
    component: AssetfinderView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/dnsenum",
    name: "dnsenum",
    component: DnsenumView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/dnsrecon",
    name: "dnsrecon",
    component: DnsreconView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/fierce",
    name: "fierce",
    component: FierceView,
    meta: {
      moduleKey: "scan",
    },
  },
  {
    path: "/tool/fping",
    name: "fping",
    component: FpingView,
    meta: {
      moduleKey: "scan",
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
    path: "/tool/caligo-people",
    name: "osintProfileSearch",
    component: ProfileSearchView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/sherlock",
    name: "osintSherlock",
    component: SherlockView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/maigret",
    name: "osintMaigret",
    component: MaigretView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/social-analyzer",
    name: "osintSocialAnalyzer",
    component: SocialAnalyzerView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/holehe",
    name: "osintHolehe",
    component: HoleheView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/theharvester",
    name: "osintTheHarvester",
    component: TheHarvesterView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/email-exposure",
    name: "osintEmailExposure",
    component: EmailExposureView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/phone-lookup",
    name: "osintPhoneLookup",
    component: PhoneLookupView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/domain-contacts",
    name: "osintDomainContacts",
    component: DomainContactsView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/git-dumper",
    name: "osintGitDumper",
    component: GitDumperView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/spiderfoot",
    name: "osintSpiderFoot",
    component: SpiderFootView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/trufflehog",
    name: "osintTruffleHog",
    component: TruffleHogView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/password-exposure",
    name: "osintPasswordExposure",
    component: PasswordExposureView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/metadata-exposure",
    name: "osintMetadataExposure",
    component: MetadataExposureView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/tool/public-files",
    name: "osintPublicFiles",
    component: PublicFilesExposureView,
    meta: {
      moduleKey: "osint",
    },
  },
  {
    path: "/xploit",
    name: "xploit",
    component: VulnerabilitiesView,
    meta: {
      moduleKey: "xploit",
    },
  },
  {
    path: "/vulnerabilidades",
    name: "vulnerabilidades",
    redirect: { name: "xploit" },
    meta: {
      moduleKey: "xploit",
    },
  },
  {
    path: "/tools",
    name: "tools",
    component: UtilitiesView,
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/passwords",
    name: "passwords",
    component: PasswordsView,
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/contrasenas",
    redirect: { name: "passwords" },
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/john",
    name: "passwordsJohn",
    component: JohnView,
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/hashcat",
    name: "passwordsHashcat",
    component: HashcatView,
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/hashid",
    name: "passwordsIdentifier",
    component: HashIdentifierView,
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/crunch",
    name: "passwordsCrunch",
    component: CrunchView,
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/cewl",
    name: "passwordsCewl",
    component: CewlView,
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/wordlists",
    name: "passwordsWordlists",
    component: WordlistsView,
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/hydra",
    name: "fuerzaBruta",
    component: BruteForceView,
    meta: {
      moduleKey: "xploit",
    },
  },
  {
    path: "/tool/nuclei",
    name: "vulnerabilidadesNuclei",
    component: NucleiView,
    meta: {
      moduleKey: "xploit",
    },
  },
  {
    path: "/tool/searchsploit",
    name: "vulnerabilidadesSearchsploit",
    component: SearchsploitView,
    meta: {
      moduleKey: "xploit",
    },
  },
  {
    path: "/tool/nikto",
    name: "vulnerabilidadesNikto",
    component: NiktoView,
    meta: {
      moduleKey: "xploit",
    },
  },
  {
    path: "/tool/sqlmap",
    name: "vulnerabilidadesSqlmap",
    component: SqlmapView,
    meta: {
      moduleKey: "xploit",
    },
  },
  {
    path: "/esteganografia",
    name: "esteganografia",
    component: SteganographyView,
    meta: {
      moduleKey: "coding",
    },
  },
  {
    path: "/tool/stego-analyze",
    name: "stegoAnalyze",
    component: StegoAnalyzeView,
    meta: {
      moduleKey: "coding",
    },
  },
  {
    path: "/tool/metadata-analyzer",
    name: "stegoMetadataAnalyze",
    component: StegoMetadataAnalyzeView,
    meta: {
      moduleKey: "coding",
    },
  },
  {
    path: "/tool/metadata-editor",
    name: "stegoMetadataEditor",
    component: StegoMetadataEditorView,
    meta: {
      moduleKey: "coding",
    },
  },
  {
    path: "/tool/stego-embed",
    name: "stegoEmbed",
    component: StegoEmbedView,
    meta: {
      moduleKey: "coding",
    },
  },
  {
    path: "/tool/stego-extract",
    name: "stegoExtract",
    component: StegoExtractView,
    meta: {
      moduleKey: "coding",
    },
  },
  {
    path: "/redes-utilidades",
    name: "redesUtilidades",
    redirect: { name: "network" },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/network",
    name: "network",
    component: NetworksView,
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/redes",
    name: "redes",
    redirect: { name: "network" },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/utilidades",
    name: "utilidades",
    redirect: { name: "tools" },
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/utilidades/identidad/whoami",
    name: "networkWhoami",
    redirect: { name: "networkWhoamiLocal" },
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/redes-utilidades/identidad/whoami",
    redirect: { name: "networkWhoamiLocal" },
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/whoami-local",
    name: "networkWhoamiLocal",
    component: WhoamiView,
    props: {
      mode: "local",
    },
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/redes-utilidades/identidad/whoami-local",
    redirect: { name: "networkWhoamiLocal" },
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/tool/whoami-server",
    name: "networkWhoamiServer",
    component: WhoamiView,
    props: {
      mode: "server",
    },
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/redes-utilidades/identidad/whoami-server",
    redirect: { name: "networkWhoamiServer" },
    meta: {
      moduleKey: "tools",
    },
  },
  {
    path: "/redes/vpns",
    name: "networkVpns",
    redirect: { name: "networkVpnsWireguard" },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/redes-utilidades/identidad/vpns",
    redirect: { name: "networkVpnsWireguard" },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/redes-utilidades/vpns",
    redirect: { name: "networkVpnsWireguard" },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/tool/wireguard",
    name: "networkVpnsWireguard",
    component: VpnsView,
    props: {
      initialProtocol: "wireguard",
    },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/redes-utilidades/vpns/wireguard",
    redirect: { name: "networkVpnsWireguard" },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/tool/openvpn",
    name: "networkVpnsOpenvpn",
    component: VpnsView,
    props: {
      initialProtocol: "openvpn",
    },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/redes-utilidades/vpns/openvpn",
    redirect: { name: "networkVpnsOpenvpn" },
    meta: {
      moduleKey: "network",
    },
  },
  {
    path: "/coding",
    name: "coding",
    component: EncodingView,
    meta: {
      moduleKey: "coding",
    },
  },
  {
    path: "/codificacion",
    name: "codificacion",
    redirect: { name: "coding" },
    meta: {
      moduleKey: "coding",
    },
  },
  {
    path: "/reversing",
    name: "reversing",
    component: ModuleCatalogView,
    meta: {
      moduleKey: "coding",
    },
  },
  ...legacyToolRedirects.map(([path, routeName]) => ({
    path,
    redirect: { name: routeName },
  })),
  ...catalogToolRoutes.map((tool) => ({
    path: tool.path,
    name: tool.routeName,
    component: CatalogToolView,
    props: {
      toolId: tool.id,
    },
    meta: {
      moduleKey: tool.moduleKey,
      toolId: tool.id,
    },
  })),
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
});

router.beforeEach((to) => {
  const hasSession = Boolean(store.getters.hasAppAccess || getStoredToken());
  if (to.name === "login") {
    return hasSession ? { name: "home" } : true;
  }
  return hasSession ? true : { name: "login" };
});

export default router;
