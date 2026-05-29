import { catalogLogoRail, toolCatalog } from "@/data/toolCatalog";

const moduleOrder = [
  "reconocimiento",
  "osint",
  "vulnerabilidades",
  "contrasenas",
  "codificacion",
  "esteganografia",
  "redes",
  "utilidades",
  "reversing",
];

const moduleMeta = {
  reconocimiento: {
    title: "Reconocimiento",
    routeName: "reconocimiento",
    eyebrow: "Mapeo de superficie",
    summary: "Convierte dominios, URLs, hosts y rangos autorizados en superficie técnica priorizada.",
    workflow: "Normaliza objetivo, resuelve identidad, descubre servicios y prepara la validación posterior.",
  },
  osint: {
    title: "OSINT",
    routeName: "osint",
    eyebrow: "Inteligencia abierta",
    summary: "Correlaciona información pública: identidades, perfiles, emails, dominios, brechas y documentos expuestos.",
    workflow: "Parte de datos públicos o autorizados, cruza fuentes y valida falsos positivos manualmente.",
  },
  vulnerabilidades: {
    title: "Vulnerabilidades",
    routeName: "vulnerabilidades",
    eyebrow: "Validación controlada",
    summary: "Agrupa CVEs, auditoría web, explotación, fuerza bruta autorizada y laboratorios AD/Cloud.",
    workflow: "Selecciona hallazgo, configura técnica, limita alcance y conserva evidencia de la prueba.",
  },
  contrasenas: {
    title: "Contraseñas",
    routeName: "contrasenas",
    eyebrow: "Hashes y diccionarios",
    summary: "Laboratorio offline para identificar hashes, generar wordlists y ejecutar cracking controlado.",
    workflow: "Identifica formato, prepara diccionario, ejecuta motor y documenta resultado sin exponer secretos.",
  },
  codificacion: {
    title: "Codificación",
    routeName: "codificacion",
    eyebrow: "Transformaciones",
    summary: "Utilidades para codificar, decodificar, transformar y verificar datos técnicos.",
    workflow: "Pega entrada, detecta formato, transforma localmente y compara salida.",
  },
  esteganografia: {
    title: "Esteganografía",
    routeName: "esteganografia",
    eyebrow: "Ocultación",
    summary: "Banco local para detectar, incrustar y extraer información oculta en artefactos de laboratorio.",
    workflow: "Carga muestra, inspecciona firmas, analiza metadatos y extrae o incrusta payloads controlados.",
  },
  redes: {
    title: "Redes",
    routeName: "redes",
    eyebrow: "Túneles y tráfico",
    summary: "Operativa de red para VPNs, captura de tráfico, pivoting, proxies, WiFi y Bluetooth.",
    workflow: "Elige ruta, activa túnel o captura, verifica salida y cierra procesos al terminar.",
  },
  utilidades: {
    title: "Utilidades",
    routeName: "utilidades",
    eyebrow: "Diagnóstico y entorno",
    summary: "Herramientas auxiliares para identidad, conectividad básica, sockets y comprobaciones rápidas.",
    workflow: "Compara cliente/servidor, valida conectividad y prueba sockets antes de lanzar modulos pesados.",
  },
  reversing: {
    title: "Reversing",
    routeName: "reversing",
    eyebrow: "Análisis binario",
    summary: "Laboratorio para binarios, APKs, firmware, debugging y análisis estático o dinámico.",
    workflow: "Identifica formato, extrae strings, analiza flujo y documenta comportamiento.",
  },
};

const priorityLogoRail = [
  { id: "nmap", mark: "NMAP", label: "Nmap", group: "Reconocimiento", routeName: "nmap" },
  { id: "openvas", mark: "GVM", label: "OpenVAS", group: "Reconocimiento", routeName: "openvas" },
  { id: "metasploit", mark: "MSF", label: "Metasploit", group: "Vulnerabilidades", routeName: "metasploit" },
  { id: "hydra", mark: "HYDRA", label: "Hydra", group: "Vulnerabilidades", routeName: "fuerzaBruta" },
  { id: "nuclei", mark: "NUC", label: "Nuclei", group: "Vulnerabilidades", routeName: "vulnerabilidadesNuclei" },
  { id: "sqlmap", mark: "SQL", label: "sqlmap", group: "Vulnerabilidades", routeName: "vulnerabilidadesSqlmap" },
  { id: "sherlock", mark: "SH", label: "Sherlock", group: "OSINT", routeName: "osintSherlock" },
  { id: "john", mark: "JTR", label: "John the Ripper", group: "Contraseñas", routeName: "passwordsJohn" },
  { id: "hashcat", mark: "HCT", label: "Hashcat", group: "Contraseñas", routeName: "passwordsHashcat" },
  { id: "wireguard", mark: "WG", label: "WireGuard", group: "Redes", routeName: "networkVpnsWireguard" },
  { id: "openvpn", mark: "OVPN", label: "OpenVPN", group: "Redes", routeName: "networkVpnsOpenvpn" },
  { id: "netcat", mark: "NC", label: "Netcat", group: "Utilidades", routeName: "catalogNetcat" },
];

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

export const toolLogoRail = uniqueBy([...priorityLogoRail, ...catalogLogoRail], (tool) => `${tool.id}:${tool.routeName}`);

export const guideToolCount = platformGuide.reduce((count, section) => count + section.tools.length, 0);
