import { catalogLogoRail, toolCatalog } from "@/data/toolCatalog";

const moduleOrder = ["osint", "scan", "xploit", "network", "coding", "tools"];

const moduleMeta = {
  osint: {
    title: "OSINT",
    routeName: "osint",
    eyebrow: "Inteligencia abierta",
    summary: "Correlaciona información pública: identidades, perfiles, emails, dominios, brechas, repositorios y documentos expuestos.",
    workflow: "Parte de datos públicos o autorizados, cruza fuentes y valida falsos positivos manualmente.",
  },
  scan: {
    title: "SCAN",
    routeName: "scan",
    eyebrow: "Mapeo de superficie",
    summary: "Convierte URLs, dominios, hosts y rangos autorizados en superficie técnica priorizada.",
    workflow: "Normaliza objetivo, resuelve identidad, descubre servicios y prepara validación posterior.",
  },
  xploit: {
    title: "XPLOIT",
    routeName: "xploit",
    eyebrow: "Validación ofensiva",
    summary: "Agrupa CVEs, auditoría web, explotación controlada, fuerza bruta autorizada, AD/Cloud y post-explotación.",
    workflow: "Selecciona hallazgo, configura técnica, limita alcance y conserva evidencia de la prueba.",
  },
  network: {
    title: "NETWORK",
    routeName: "network",
    eyebrow: "Tráfico y rutas",
    summary: "Opera VPNs, proxies y rutas de salida desde el servidor sin mezclar utilidades de hardware o LAN local.",
    workflow: "Elige ruta, activa túnel, verifica salida y cierra procesos al terminar.",
  },
  coding: {
    title: "CODING",
    routeName: "coding",
    eyebrow: "Transformación y artefactos",
    summary: "Codifica, decodifica, transforma, oculta, extrae y analiza datos y artefactos de laboratorio.",
    workflow: "Carga entrada, detecta formato, transforma o analiza y exporta evidencia reproducible.",
  },
  tools: {
    title: "TOOLS",
    routeName: "tools",
    eyebrow: "Utilidades transversales",
    summary: "Agrupa identidad local/servidor, hashes, cracking offline, wordlists, inventario y soporte operativo.",
    workflow: "Prepara material auxiliar, comprueba entorno y reutiliza resultados entre módulos.",
  },
};

const priorityLogoRail = [
  { id: "metasploit", mark: "MSF", label: "Metasploit", group: "XPLOIT", routeName: "metasploit" },
  { id: "nmap", mark: "NMAP", label: "Nmap", group: "SCAN", routeName: "nmap" },
  { id: "openvas", mark: "GVM", label: "OpenVAS", group: "SCAN", routeName: "openvas" },
  { id: "nuclei", mark: "NUC", label: "Nuclei", group: "XPLOIT", routeName: "vulnerabilidadesNuclei" },
  { id: "sqlmap", mark: "SQL", label: "sqlmap", group: "XPLOIT", routeName: "vulnerabilidadesSqlmap" },
  { id: "hydra", mark: "HYDRA", label: "Hydra", group: "XPLOIT", routeName: "fuerzaBruta" },
  { id: "hashcat", mark: "HCT", label: "Hashcat", group: "TOOLS", routeName: "passwordsHashcat" },
  { id: "john", mark: "JTR", label: "John the Ripper", group: "TOOLS", routeName: "passwordsJohn" },
  { id: "searchsploit", mark: "EDB", label: "Searchsploit", group: "XPLOIT", routeName: "vulnerabilidadesSearchsploit" },
  { id: "nikto", mark: "NKT", label: "Nikto", group: "XPLOIT", routeName: "vulnerabilidadesNikto" },
  { id: "sherlock", mark: "SH", label: "Sherlock", group: "OSINT", routeName: "osintSherlock" },
  { id: "theharvester", mark: "TH", label: "theHarvester", group: "OSINT", routeName: "osintTheHarvester" },
  { id: "wireguard", mark: "WG", label: "WireGuard", group: "NETWORK", routeName: "networkVpnsWireguard" },
  { id: "openvpn", mark: "OVPN", label: "OpenVPN", group: "NETWORK", routeName: "networkVpnsOpenvpn" },
  { id: "cyberchef", mark: "CCF", label: "CyberChef", group: "CODING", routeName: "catalogCyberchef" },
  { id: "steghide", mark: "STH", label: "Steghide", group: "CODING", routeName: "catalogSteghide" },
];

const railImportanceOrder = [
  "metasploit",
  "nmap",
  "openvas",
  "nuclei",
  "sqlmap",
  "hydra",
  "hashcat",
  "john",
  "searchsploit",
  "nikto",
  "masscan",
  "rustscan",
  "httpx",
  "amass",
  "subfinder",
  "assetfinder",
  "dnsrecon",
  "dnsenum",
  "fierce",
  "fping",
  "theharvester",
  "sherlock",
  "spiderfoot",
  "maltego",
  "maigret",
  "social-analyzer",
  "holehe",
  "trufflehog",
  "ffuf",
  "feroxbuster",
  "gobuster",
  "dirsearch",
  "wpscan",
  "bloodhound",
  "netexec",
  "impacket",
  "wireguard",
  "openvpn",
  "cyberchef",
  "steghide",
  "exiftool",
  "zsteg",
  "cewl",
  "crunch",
  "wordlists",
  "openssl",
  "netcat",
  "socat",
  "tor",
  "proxychains",
];

const railImportanceRank = new Map(railImportanceOrder.map((id, index) => [id, index]));

function logoRailRank(tool) {
  return railImportanceRank.get(tool.id) ?? 1000;
}

function sortLogoRail(tools) {
  return [...tools].sort((first, second) => {
    const rankDelta = logoRailRank(first) - logoRailRank(second);
    if (rankDelta !== 0) return rankDelta;
    return first.label.localeCompare(second.label, "es", { sensitivity: "base" });
  });
}

function guideFor(tool) {
  return {
    id: tool.id,
    label: tool.label,
    name: tool.label,
    serverId: tool.serverId,
    logoId: tool.logoId || tool.id,
    routeName: tool.routeName,
    engine: tool.command,
    input: tool.implemented
      ? "Objetivo, perfil, fichero o parámetros validados por la vista."
      : "Objetivo autorizado o parámetros propios de la herramienta antes de habilitar el conector.",
    purpose: tool.purpose,
    usage: tool.usage,
    guide: {
      objective: tool.purpose,
      programs: [tool.command],
      howToUse: [
        tool.usage,
        "Confirma siempre que el objetivo pertenece al laboratorio o a un alcance autorizado.",
        tool.implemented
          ? "Ejecuta desde la vista dedicada; Caligo conserva estado cuando la herramienta usa jobs persistentes."
          : "La vista existe como punto de entrada y debe conectarse a un endpoint tokenizado antes de ejecutar acciones reales.",
      ],
      output: [
        "Parámetros normalizados y estado operativo.",
        "Salida técnica, evidencia o resumen accionable cuando exista conector.",
        "Errores de validación, permisos o disponibilidad del binario en el servidor.",
      ],
      notes: [
        tool.implemented ? "Herramienta operativa o parcialmente operativa en Caligo." : "Pendiente de conector backend funcional.",
      ],
    },
  };
}

function uniqueBy(items, selector) {
  const seen = new Set();
  return items.filter((item) => {
    const key = selector(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const platformGuide = moduleOrder
  .map((moduleKey) => {
    const meta = moduleMeta[moduleKey];
    const tools = toolCatalog.filter((tool) => tool.moduleKey === moduleKey).map(guideFor);
    return {
      id: moduleKey,
      ...meta,
      tools,
    };
  })
  .filter((section) => section.tools.length);

export const toolLogoRail = uniqueBy([...priorityLogoRail, ...sortLogoRail(catalogLogoRail)], (tool) => `${tool.id}:${tool.routeName}`);

export const guideToolCount = platformGuide.reduce((count, section) => count + section.tools.length, 0);
