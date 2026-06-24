const moduleLabels = {
  osint: "OSINT",
  scan: "SCAN",
  xploit: "XPLOIT",
  network: "NETWORK",
  coding: "CODING",
  tools: "TOOLS",
};

function normalizeModuleKey(moduleKey, section) {
  const moduleAliases = {
    reconocimiento: "scan",
    vulnerabilidades: "xploit",
    contrasenas: "tools",
    passwords: "tools",
    codificacion: "coding",
    esteganografia: "coding",
    redes: "network",
    utilidades: section === "diagnostics" ? "network" : "tools",
    reversing: "coding",
  };
  return moduleAliases[moduleKey] || moduleKey;
}

const sectionMeta = {
  dns: { code: "DNS", label: "DNS / Dominios", description: "Resolución, subdominios y superficie externa" },
  discovery: { code: "HOST", label: "Hosts / Puertos", description: "Descubrimiento activo y servicios expuestos" },
  webRecon: { code: "WEB", label: "Web Recon", description: "Fingerprint, crawlers y endpoints" },
  snmpNetbios: { code: "LAN", label: "LAN", description: "SNMP, NetBIOS y descubrimiento local" },
  identity: { code: "ID", label: "Identidad", description: "Personas, perfiles y correlación pública" },
  usernames: { code: "USR", label: "Usernames", description: "Alias reutilizados en servicios públicos" },
  contact: { code: "MAIL", label: "Contacto", description: "Emails, teléfonos aportados y dominios" },
  breaches: { code: "BR", label: "Brechas", description: "Exposición pública de emails y contraseñas" },
  documents: { code: "DOC", label: "Documentos", description: "Metadatos, repositorios y ficheros públicos" },
  validation: { code: "VAL", label: "Validación", description: "CVEs, plantillas y Exploit-DB" },
  webVuln: { code: "WEB", label: "Web", description: "Auditoría web, fuzzing e inyección" },
  exploit: { code: "EXP", label: "Explotación", description: "Frameworks, sesiones y payloads de laboratorio" },
  access: { code: "ACC", label: "Acceso", description: "Servicios, credenciales y pruebas controladas" },
  privesc: { code: "PRIV", label: "PrivEsc", description: "Escalada local y comprobaciones post-explotación" },
  cracking: { code: "CRK", label: "Cracking", description: "John, Hashcat y formatos de hash" },
  wordlists: { code: "WL", label: "Wordlists", description: "Diccionarios, reglas y generación acotada" },
  encoders: { code: "ENC", label: "Codificadores", description: "Base, URL, HTML, JWT y binarios" },
  crypto: { code: "CRY", label: "Cripto", description: "Hashes, certificados y primitivas OpenSSL" },
  analysis: { code: "AN", label: "Análisis", description: "Firmas, entropía y contenedores" },
  metadata: { code: "EXIF", label: "Metadatos", description: "Lectura y edición controlada" },
  payloads: { code: "LSB", label: "Payloads", description: "Ocultar, extraer y detectar datos" },
  whoami: { code: "WHO", label: "WHOAMI", description: "Identidad local y salida del servidor" },
  vpns: { code: "VPN", label: "VPNs", description: "WireGuard, OpenVPN y salida controlada" },
  diagnostics: { code: "NET", label: "Diagnóstico", description: "Conectividad, sockets y trazas" },
  traffic: { code: "PCAP", label: "Tráfico", description: "Captura, lectura y análisis de paquetes" },
  pivot: { code: "PVT", label: "Pivoting", description: "Túneles, proxies y movimiento en laboratorio" },
  wirelessWifi: { code: "WIFI", label: "WiFi", description: "Auditoría inalámbrica autorizada" },
  bluetooth: { code: "BT", label: "Bluetooth", description: "Enumeración y análisis de Bluetooth" },
  disk: { code: "DSK", label: "Disco", description: "Imágenes, carving y recuperación" },
  memory: { code: "MEM", label: "Memoria", description: "Volcado, análisis y artefactos RAM" },
  windowsForensics: { code: "WIN", label: "Windows", description: "Registry, eventos y artefactos Windows" },
  malware: { code: "IOC", label: "IOC", description: "Indicadores, YARA y triage de muestras" },
  binaries: { code: "BIN", label: "Binarios", description: "ELF, PE, strings y debugging" },
  mobile: { code: "APK", label: "Android", description: "APK, smali y análisis móvil" },
  firmware: { code: "FW", label: "Firmware", description: "Extracción y análisis de firmware" },
  cloudAd: { code: "AD", label: "AD / Cloud", description: "Kerberos, SMB, relay y nubes" },
};

const implemented = true;
const planned = false;

const tools = [
  tool("caligo-intel", "Caligo Intel", "AI", "reconocimiento", "dns", "Backend Spring", "Informe combinado de DNS, HTTP, TLS, reputación, histórico y endpoints.", "Introduce un dominio o URL autorizada y deja que Caligo agrupe las señales.", { routeName: "urls", implemented }),
  tool("nmap", "Nmap", "NMP", "reconocimiento", "discovery", "nmap", "Descubre hosts, puertos, servicios, versiones y scripts NSE seguros.", "Define objetivo, perfil, puertos y timing. El backend conserva el job y permite exportar PDF.", { routeName: "nmap", implemented, serverId: "nmap" }),
  tool("openvas", "OpenVAS / GVM", "GVM", "reconocimiento", "discovery", "gvm-cli", "Orquesta escaneos Greenbone con perfiles, port lists, alive tests y scanner.", "Selecciona parametrización GVM y consulta progreso real desde el backend.", { routeName: "openvas", implemented, serverId: "openvas" }),
  tool("masscan", "Masscan", "MSC", "reconocimiento", "discovery", "masscan", "Barrido de puertos de alta velocidad para inventario controlado.", "Úsalo solo en rangos propios, con rate limit estricto y ventana de pruebas definida."),
  tool("rustscan", "RustScan", "RST", "reconocimiento", "discovery", "rustscan", "Descubrimiento rápido de puertos con handoff posterior a Nmap.", "Primera pasada rápida sobre rangos de laboratorio antes de versionar servicios."),
  tool("fping", "fping", "FPN", "reconocimiento", "discovery", "fping", "Ping masivo para detectar hosts vivos de forma ligera.", "Úsalo antes de escaneos más profundos para reducir superficie.", { routeName: "fping", implemented, serverId: "fping" }),
  tool("dnsrecon", "DNSRecon", "DRC", "reconocimiento", "dns", "dnsrecon", "Enumera registros DNS, transferencias de zona y fuentes de dominio.", "Introduce dominio autorizado y selecciona técnicas pasivas o zona controlada.", { routeName: "dnsrecon", implemented, serverId: "dnsrecon" }),
  tool("dnsenum", "DNSEnum", "DEN", "reconocimiento", "dns", "dnsenum", "Enumeración DNS con fuerza bruta opcional de subdominios.", "Combina registros públicos y diccionarios acotados.", { routeName: "dnsenum", implemented, serverId: "dnsenum" }),
  tool("fierce", "Fierce", "FRC", "reconocimiento", "dns", "fierce", "Localiza subdominios y rangos relacionados por DNS.", "Útil para una fotografía inicial de dominios propios.", { routeName: "fierce", implemented, serverId: "fierce" }),
  tool("amass", "Amass", "AMS", "reconocimiento", "dns", "amass", "Mapeo OSINT de dominios, subdominios y relaciones.", "Usa fuentes pasivas y configura API keys cuando quieras cobertura profunda.", { serverId: "amass" }),
  tool("subfinder", "Subfinder", "SUB", "reconocimiento", "dns", "subfinder", "Descubrimiento pasivo rápido de subdominios.", "Ideal antes de httpx, nuclei o crawlers.", { serverId: "subfinder" }),
  tool("assetfinder", "assetfinder", "AST", "reconocimiento", "dns", "assetfinder", "Recolecta dominios y subdominios relacionados.", "Complementa Subfinder/Amass con fuentes rápidas.", { routeName: "assetfinder", implemented, serverId: "assetfinder" }),
  tool("httpx", "httpx", "HTX", "reconocimiento", "webRecon", "httpx", "Fingerprint HTTP masivo: tecnologías, títulos, códigos, TLS y probes.", "Alimenta con subdominios y filtra servicios web vivos.", { serverId: "httpx" }),
  tool("whatweb", "WhatWeb", "WW", "reconocimiento", "webRecon", "whatweb", "Identifica tecnologías, frameworks, servidores y plugins web.", "Ejecuta fingerprint no intrusivo sobre URLs autorizadas."),
  tool("wafw00f", "wafw00f", "WAF", "reconocimiento", "webRecon", "wafw00f", "Detecta WAF o controles de protección en aplicaciones web.", "Útil antes de fuzzing o validaciones web para ajustar intensidad."),
  tool("katana", "Katana", "KTN", "reconocimiento", "webRecon", "katana", "Crawler moderno para endpoints, JavaScript y rutas.", "Define profundidad y modo pasivo/activo según el alcance.", { serverId: "katana" }),
  tool("gau", "gau", "GAU", "reconocimiento", "webRecon", "gau", "Recolecta URLs históricas desde fuentes públicas.", "Úsalo para descubrir endpoints antiguos antes de validarlos.", { serverId: "gau" }),
  tool("waybackurls", "waybackurls", "WB", "reconocimiento", "webRecon", "waybackurls", "Extrae URLs archivadas de Wayback Machine.", "Complementa gau con rutas históricas de dominio."),
  tool("onesixtyone", "onesixtyone", "161", "reconocimiento", "snmpNetbios", "onesixtyone", "Enumeración SNMP por community strings controladas.", "Prueba comunidades de laboratorio contra equipos propios."),
  tool("snmpwalk", "snmpwalk", "SNW", "reconocimiento", "snmpNetbios", "snmpwalk", "Consulta árboles SNMP cuando existe comunidad autorizada.", "Extrae inventario y métricas sin tocar credenciales sensibles."),

  tool("caligo-people", "Caligo People", "PEO", "osint", "identity", "Backend Spring", "Búsqueda pública por nombre, LinkedIn y redes indexadas.", "Introduce nombre o alias y valida manualmente cada candidato.", { routeName: "osintProfileSearch", implemented }),
  tool("social-analyzer", "Social Analyzer", "SOC", "osint", "identity", "social-analyzer", "Correlaciona nombres, aliases y perfiles sociales.", "Ajusta cobertura y timeout para equilibrar ruido y profundidad.", { routeName: "osintSocialAnalyzer", implemented, serverId: "social-analyzer" }),
  tool("sherlock", "Sherlock", "SH", "osint", "usernames", "sherlock", "Enumera usernames en plataformas públicas.", "Introduce un alias exacto y revisa positivos manualmente.", { routeName: "osintSherlock", implemented, serverId: "sherlock" }),
  tool("maigret", "Maigret", "MG", "osint", "usernames", "maigret", "Cobertura profunda de usernames y perfiles OSINT.", "Úsalo cuando necesites más fuentes y scoring por plataforma.", { routeName: "osintMaigret", implemented, serverId: "maigret" }),
  tool("holehe", "Holehe", "HH", "osint", "contact", "holehe", "Comprueba uso público de emails en servicios online.", "Trabaja solo con emails propios o autorizados.", { routeName: "osintHolehe", implemented, serverId: "holehe" }),
  tool("theharvester", "theHarvester", "TH", "osint", "contact", "theHarvester", "Recolecta emails, hosts y fuentes públicas por dominio.", "Selecciona fuente y dominio autorizado para extraer superficie pública.", { routeName: "osintTheHarvester", implemented, serverId: "theharvester" }),
  tool("email-exposure", "Email Exposure", "EML", "osint", "contact", "Backend Spring", "Valida formato, dominio, MX y patrones profesionales autorizados.", "Introduce email o dominio propio y revisa exposición básica.", { routeName: "osintEmailExposure", implemented }),
  tool("phone-lookup", "Phone Lookup", "TEL", "osint", "contact", "Backend Spring", "Normaliza teléfonos aportados y documenta señales públicas seguras.", "No busca teléfonos privados: valida únicamente datos introducidos.", { routeName: "osintPhoneLookup", implemented }),
  tool("domain-contacts", "Domain Contacts", "DOM", "osint", "contact", "Backend Spring", "Extrae contactos publicados en dominios autorizados.", "Analiza security.txt, contacto, privacidad y páginas públicas.", { routeName: "osintDomainContacts", implemented }),
  tool("password-exposure", "Password Exposure", "PWD", "osint", "breaches", "Pwned Passwords", "Comprueba contraseñas expuestas con k-anonymity SHA-1.", "La contraseña no se envía en claro al servicio externo.", { routeName: "osintPasswordExposure", implemented }),
  tool("metadata-exposure", "Metadata Exposure", "META", "osint", "documents", "Backend Spring", "Inspecciona cabeceras y metadatos de documentos públicos.", "Introduce una URL pública autorizada y revisa señales filtradas.", { routeName: "osintMetadataExposure", implemented }),
  tool("public-files", "Public Files", "PUB", "osint", "documents", "Backend Spring", "Localiza robots, sitemap, security.txt y well-known.", "Úsalo como comprobación pasiva de exposición documental.", { routeName: "osintPublicFiles", implemented }),
  tool("spiderfoot", "SpiderFoot", "SPF", "osint", "identity", "spiderfoot", "Automatiza correlación OSINT multi-fuente con módulos configurables.", "Define target, perfil, módulos y tipos de evento; revisa siempre falsos positivos.", { routeName: "osintSpiderFoot", implemented, serverId: "spiderfoot" }),
  tool("git-dumper", "git-dumper", "GIT", "osint", "documents", "git-dumper", "Recupera repositorios .git expuestos en entornos autorizados.", "Solo debe usarse contra dominios propios o laboratorios.", { routeName: "osintGitDumper", implemented, serverId: "git-dumper" }),
  tool("trufflehog", "TruffleHog", "TRF", "osint", "documents", "trufflehog", "Detecta secretos en repositorios, históricos y artefactos.", "Escanea Git, GitHub o rutas permitidas del servidor con filtros visuales y salida redaccionada.", { routeName: "osintTruffleHog", implemented, serverId: "trufflehog" }),

  tool("metasploit", "Metasploit", "MSF", "vulnerabilidades", "exploit", "msfconsole / RPC", "Framework para módulos, payloads y sesiones de laboratorio.", "Escanea, selecciona módulo, configura payload y controla sesiones.", { routeName: "metasploit", implemented, serverId: "metasploit" }),
  tool("hydra", "Hydra", "HYD", "vulnerabilidades", "access", "hydra", "Validación controlada de credenciales contra servicios de laboratorio.", "Configura servicio, usuarios, wordlists y límites.", { routeName: "fuerzaBruta", implemented, serverId: "hydra" }),
  tool("nuclei", "Nuclei", "NUC", "vulnerabilidades", "validation", "nuclei", "Templates para CVEs, exposiciones y misconfiguraciones.", "Selecciona severidades, tags, rate limit y objetivo autorizado.", { routeName: "vulnerabilidadesNuclei", implemented, serverId: "nuclei" }),
  tool("searchsploit", "Searchsploit", "EDB", "vulnerabilidades", "validation", "searchsploit", "Búsqueda local en Exploit-DB por CVE, producto o versión.", "Introduce tecnología o CVE y valida manualmente aplicabilidad.", { routeName: "vulnerabilidadesSearchsploit", implemented, serverId: "searchsploit" }),
  tool("nikto", "Nikto", "NKT", "vulnerabilidades", "webVuln", "nikto", "Auditoría web de rutas, cabeceras y exposiciones conocidas.", "Configura host, puerto, SSL y tuning según el laboratorio.", { routeName: "vulnerabilidadesNikto", implemented, serverId: "nikto" }),
  tool("sqlmap", "sqlmap", "SQL", "vulnerabilidades", "webVuln", "sqlmap", "Validación guiada de inyección SQL.", "Configura URL, parámetro, método, cookies y nivel de riesgo.", { routeName: "vulnerabilidadesSqlmap", implemented, serverId: "sqlmap" }),
  tool("ffuf", "ffuf", "FF", "vulnerabilidades", "webVuln", "ffuf", "Fuzzing web rápido de rutas, parámetros, vhosts y contenido.", "Define FUZZ, wordlist, filtros y rate limit.", { serverId: "ffuf" }),
  tool("feroxbuster", "Feroxbuster", "FRX", "vulnerabilidades", "webVuln", "feroxbuster", "Descubrimiento recursivo de contenido web.", "Úsalo con wordlists acotadas y límites de profundidad."),
  tool("gobuster", "Gobuster", "GOB", "vulnerabilidades", "webVuln", "gobuster", "Fuzzing de directorios, DNS y vhosts.", "Elige modo, wordlist y extensiones de laboratorio."),
  tool("dirsearch", "dirsearch", "DRS", "vulnerabilidades", "webVuln", "dirsearch", "Fuzzing de rutas web con filtros y extensiones.", "Configura diccionario y códigos de estado relevantes."),
  tool("wpscan", "WPScan", "WPS", "vulnerabilidades", "webVuln", "wpscan", "Auditoría de WordPress, plugins, temas y versiones.", "Requiere objetivo WordPress autorizado y token opcional."),
  tool("joomscan", "JoomScan", "JMS", "vulnerabilidades", "webVuln", "joomscan", "Auditoría de Joomla y extensiones conocidas.", "Escanea sitios Joomla propios y documenta versiones."),
  tool("wapiti", "Wapiti", "WPT", "vulnerabilidades", "webVuln", "wapiti", "Scanner web para XSS, SQLi, LFI/RFI y configuraciones.", "Define alcance y módulos para no generar ruido innecesario."),
  tool("commix", "Commix", "CMX", "vulnerabilidades", "webVuln", "commix", "Validación de command injection en laboratorios.", "Introduce URL/parámetro controlado y limita técnicas."),
  tool("xsser", "XSSer", "XSS", "vulnerabilidades", "webVuln", "xsser", "Validación de XSS reflejado y vectores de prueba.", "Úsalo solo contra entornos propios con payloads inocuos."),
  tool("arjun", "Arjun", "ARJ", "vulnerabilidades", "webVuln", "arjun", "Descubre parámetros HTTP ocultos.", "Ejecuta contra endpoints concretos antes de sqlmap o pruebas manuales."),
  tool("testssl", "testssl.sh", "TLS", "reconocimiento", "webRecon", "testssl.sh", "Evalúa configuración TLS, ciphers y protocolos.", "Complementa Caligo TLS con un análisis profundo del servidor."),
  tool("linpeas", "LinPEAS", "LPE", "vulnerabilidades", "privesc", "linpeas.sh", "Enumeración local para escalada de privilegios en Linux.", "Post-explotación controlada en máquinas de laboratorio."),
  tool("winpeas", "WinPEAS", "WPE", "vulnerabilidades", "privesc", "winPEAS.exe", "Enumeración local para escalada de privilegios en Windows.", "Post-explotación controlada en máquinas Windows de laboratorio."),
  tool("chisel", "Chisel", "CHS", "redes", "pivot", "chisel", "Túneles TCP/HTTP para pivoting controlado.", "Gestiona túneles de laboratorio con puertos explícitos."),

  tool("john", "John the Ripper", "JTR", "contrasenas", "cracking", "john", "Auditoría offline de hashes con formatos John.", "Carga hashes autorizados, selecciona formato y wordlist.", { routeName: "passwordsJohn", implemented, serverId: "john" }),
  tool("hashcat", "Hashcat", "HCT", "contrasenas", "cracking", "hashcat", "Cracking acelerado por CPU/GPU con modos Hashcat.", "Selecciona modo, hash, ataque y diccionario.", { routeName: "passwordsHashcat", implemented, serverId: "hashcat" }),
  tool("hashid", "hashID", "HID", "contrasenas", "cracking", "hashid", "Identifica formatos probables de hash.", "Pega un hash y compara candidatos antes de crackear.", { routeName: "passwordsIdentifier", implemented, serverId: "hashid" }),
  tool("name-that-hash", "Name-That-Hash", "NTH", "contrasenas", "cracking", "nth", "Identificación avanzada de hashes.", "Complementa hashID cuando existan formatos ambiguos."),
  tool("wordlists", "SecLists", "WL", "contrasenas", "wordlists", "SecLists", "Inventario de wordlists permitidas en servidor.", "Elige listas por tipo: usuarios, passwords, fuzzing o servicios.", { routeName: "passwordsWordlists", implemented, serverId: "wordlists" }),
  tool("crunch", "Crunch", "CR", "contrasenas", "wordlists", "crunch", "Genera diccionarios acotados por longitud y charset.", "Define longitud, charset y límites para evitar explosión de tamaño.", { routeName: "passwordsCrunch", implemented, serverId: "crunch" }),
  tool("cewl", "CeWL", "CW", "contrasenas", "wordlists", "cewl", "Crea wordlists desde contenido web autorizado.", "Introduce URL propia, profundidad y filtros de longitud.", { routeName: "passwordsCewl", implemented, serverId: "cewl" }),
  tool("cupp", "CUPP", "CUP", "contrasenas", "wordlists", "cupp", "Genera diccionarios personalizados desde perfiles autorizados.", "Úsalo solo en auditorías internas con datos consentidos."),
  tool("rsmangler", "RSMangler", "RSM", "contrasenas", "wordlists", "rsmangler", "Aplica mutaciones a diccionarios base.", "Genera variantes controladas sin inflar listas sin límite."),

  tool("base-converter", "Base Converter", "B64", "codificacion", "encoders", "Browser", "Base64, Base32, Base16, URL, HTML y texto escapado.", "Convierte entradas locales sin enviar secretos al servidor."),
  tool("cyberchef", "CyberChef", "CCF", "codificacion", "encoders", "cyberchef", "Recetas de transformación, decodificación y análisis de datos.", "Construye pipelines reproducibles para strings y binarios."),
  tool("xxd", "xxd", "XXD", "codificacion", "encoders", "xxd", "Hexdump y reconstrucción de binarios.", "Inspecciona bytes y convierte hex a fichero controlado."),
  tool("openssl", "OpenSSL", "SSL", "codificacion", "crypto", "openssl", "Hashes, certificados, firmas y clientes TLS.", "Calcula fingerprints o valida certificados de laboratorio.", { serverId: "openssl" }),
  tool("hashdeep", "hashdeep", "HD", "codificacion", "crypto", "hashdeep", "Hashing recursivo e inventario de integridad.", "Genera manifests de evidencia o ficheros de laboratorio."),

  tool("stego-analyze", "Caligo Analyze", "ANL", "esteganografia", "analysis", "Browser", "Magic bytes, entropía, cadenas, bytes anexos y LSB.", "Carga muestra local y revisa señales técnicas.", { routeName: "stegoAnalyze", implemented }),
  tool("metadata-analyzer", "Metadata Analyzer", "META", "esteganografia", "metadata", "Browser / ExifTool", "Lectura local de PNG, JPEG, PDF y contenedores.", "Inspecciona metadatos visibles antes de publicar artefactos.", { routeName: "stegoMetadataAnalyze", implemented, serverId: "exiftool" }),
  tool("metadata-editor", "Metadata Editor", "EDIT", "esteganografia", "metadata", "Browser", "Inserta metadatos controlados o genera sidecar JSON.", "Edita solo copias de laboratorio.", { routeName: "stegoMetadataEditor", implemented }),
  tool("stego-embed", "Caligo Embed", "LSB+", "esteganografia", "payloads", "Browser", "Oculta texto o ficheros en LSB, PNG tEXt o footer.", "Genera muestras controladas para detección.", { routeName: "stegoEmbed", implemented }),
  tool("stego-extract", "Caligo Extract", "LSB-", "esteganografia", "payloads", "Browser", "Recupera paquetes Caligo desde footer, PNG tEXt o LSB.", "Carga muestra y extrae evidencia.", { routeName: "stegoExtract", implemented }),
  tool("exiftool", "ExifTool", "EXIF", "esteganografia", "metadata", "exiftool", "Extracción y edición de metadatos en múltiples formatos.", "Úsalo para inspeccionar y limpiar metadatos en ficheros autorizados.", { serverId: "exiftool" }),
  tool("steghide", "Steghide", "STH", "esteganografia", "payloads", "steghide", "Ocultación y extracción en JPEG/BMP/WAV/AU.", "Trabaja con passphrases de laboratorio.", { serverId: "steghide" }),
  tool("zsteg", "zsteg", "ZST", "esteganografia", "analysis", "zsteg", "Detección LSB en PNG/BMP.", "Analiza canales y planos de bits.", { serverId: "zsteg" }),
  tool("outguess", "OutGuess", "OUT", "esteganografia", "payloads", "outguess", "Stego estadístico para imágenes JPEG.", "Genera y extrae muestras controladas."),
  tool("stegseek", "Stegseek", "SSK", "esteganografia", "payloads", "stegseek", "Ataque de diccionario contra Steghide en laboratorio.", "Úsalo solo con ficheros propios y wordlists acotadas."),
  tool("pngcheck", "pngcheck", "PNG", "esteganografia", "analysis", "pngcheck", "Valida chunks y estructura de PNG.", "Detecta chunks sospechosos o datos anexos."),

  tool("whoami-local", "WHOAMI Local", "LOC", "utilidades", "whoami", "Browser", "Huella del navegador local: pantalla, permisos, storage, WebGL y red del cliente.", "Mide únicamente el entorno donde se abre el front.", { routeName: "networkWhoamiLocal", implemented }),
  tool("whoami-server", "WHOAMI Server", "SRV", "utilidades", "whoami", "Backend Spring", "Identidad del servidor: IP pública, interfaces, cabeceras observadas y VPN.", "Consulta el backend sin mezclar métricas de pantalla del navegador.", { routeName: "networkWhoamiServer", implemented }),
  tool("wireguard", "WireGuard", "WG", "redes", "vpns", "wg", "Túneles WireGuard para salida controlada del servidor.", "Selecciona perfil, país/proveedor si existe y conecta desde el backend.", { routeName: "networkVpnsWireguard", implemented, serverId: "wireguard" }),
  tool("openvpn", "OpenVPN", "OVPN", "redes", "vpns", "openvpn", "Perfiles OpenVPN con selección de ubicación.", "Conecta o desconecta túneles gestionados por helper.", { routeName: "networkVpnsOpenvpn", implemented, serverId: "openvpn" }),
  tool("ping", "Ping", "PNG", "utilidades", "diagnostics", "ping", "Latencia y disponibilidad ICMP.", "Comprueba hosts autorizados antes de escanear."),
  tool("traceroute", "Traceroute", "TRC", "utilidades", "diagnostics", "traceroute", "Rutas y saltos hacia objetivos.", "Valida camino de red desde el servidor Caligo."),
  tool("mtr", "MTR", "MTR", "utilidades", "diagnostics", "mtr", "Traceroute continuo con pérdida y latencia.", "Úsalo para diagnóstico temporal de conectividad."),
  tool("netcat", "Netcat", "NC", "utilidades", "diagnostics", "nc", "Sockets, listeners y pruebas de conectividad.", "Abre pruebas puntuales en laboratorio y documenta puertos.", { serverId: "netcat" }),
  tool("socat", "socat", "SOC", "utilidades", "diagnostics", "socat", "Relay flexible de sockets, puertos y streams.", "Úsalo para pruebas controladas de conectividad."),
  tool("mitmproxy", "mitmproxy", "MITM", "redes", "traffic", "mitmproxy", "Proxy HTTP/S interceptable en laboratorios.", "Requiere certificados controlados y consentimiento del entorno."),
  tool("proxychains", "Proxychains", "PXC", "redes", "pivot", "proxychains", "Encadena tráfico de herramientas por proxies.", "Permite ejecutar CLI a través de túneles definidos."),
  tool("tor", "Tor", "TOR", "redes", "pivot", "tor", "Salida onion/proxy para pruebas de privacidad.", "Úsalo solo para comprobar salida y rutas de laboratorio."),
  tool("sshuttle", "sshuttle", "SHT", "redes", "pivot", "sshuttle", "VPN transparente por SSH.", "Conecta rangos propios sin configurar rutas manuales."),
  tool("ligolo-ng", "Ligolo-ng", "LGO", "redes", "pivot", "ligolo-ng", "Pivoting moderno por túneles de red.", "Gestiona agentes y rutas en laboratorio autorizado."),
  tool("radare2", "radare2", "R2", "reversing", "binaries", "r2", "Framework CLI de reversing y análisis binario.", "Inspecciona secciones, strings, imports y flujo."),
  tool("strings", "strings", "STR", "reversing", "binaries", "strings", "Extracción de cadenas imprimibles.", "Primera pasada rápida sobre binarios y memoria."),
  tool("objdump", "objdump", "OBJ", "reversing", "binaries", "objdump", "Cabeceras, símbolos y desensamblado.", "Genera vistas estáticas para análisis."),
  tool("ltrace", "ltrace", "LTR", "reversing", "binaries", "ltrace", "Traza llamadas a librerías.", "Observa comportamiento dinámico en sandbox."),
  tool("strace", "strace", "STRC", "reversing", "binaries", "strace", "Traza syscalls y ficheros.", "Diagnostica comportamiento de binarios controlados."),
  tool("impacket", "Impacket", "IMP", "vulnerabilidades", "cloudAd", "impacket-*", "Suite SMB, Kerberos, NTLM y herramientas AD.", "Úsalo en laboratorios Windows/AD propios."),
  tool("netexec", "NetExec", "NXC", "vulnerabilidades", "cloudAd", "nxc", "Enumeración y validación en SMB/LDAP/WinRM.", "Gestiona credenciales de laboratorio con alcance claro."),
  tool("bloodhound", "BloodHound", "BH", "vulnerabilidades", "cloudAd", "bloodhound", "Grafos de relaciones y rutas de ataque en AD.", "Ingiere datos SharpHound/Collectors de entorno autorizado."),
  tool("certipy", "Certipy", "CRT", "vulnerabilidades", "cloudAd", "certipy", "Auditoría de AD CS y certificados.", "Detecta plantillas vulnerables en dominios propios."),
  tool("kerbrute", "Kerbrute", "KRB", "vulnerabilidades", "cloudAd", "kerbrute", "Enumeración Kerberos y validación controlada.", "Limita usuarios y rate para no afectar DCs."),
  tool("enum4linux-ng", "enum4linux-ng", "E4L", "vulnerabilidades", "cloudAd", "enum4linux-ng", "Enumeración SMB/NetBIOS moderna.", "Extrae usuarios, shares y políticas en laboratorio."),
];

function tool(id, label, code, moduleKey, section, command, purpose, usage, options = {}) {
  const normalizedModuleKey = normalizeModuleKey(moduleKey, section);
  const routeName = options.routeName || toRouteName(id);
  return {
    id,
    label,
    code,
    moduleKey: normalizedModuleKey,
    moduleLabel: moduleLabels[normalizedModuleKey],
    section,
    command,
    purpose,
    usage,
    routeName,
    path: options.path || `/tool/${id}`,
    implemented: Boolean(options.implemented),
    serverId: options.serverId || id,
    status: options.implemented ? "Operativo" : "Pendiente de conector",
    endpoint: options.endpoint || "",
  };
}

function toRouteName(id) {
  return `catalog${id
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("")}`;
}

function groupBy(items, keyGetter) {
  return items.reduce((groups, item) => {
    const key = keyGetter(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

export const toolCatalog = tools;

export const catalogToolRoutes = tools
  .filter((item) => !item.implemented)
  .map((item) => ({
    id: item.id,
    path: item.path,
    routeName: item.routeName,
    moduleKey: item.moduleKey,
  }));

export const catalogSidebarSections = Object.entries(groupBy(tools, (item) => item.moduleKey)).reduce((acc, [moduleKey, moduleTools]) => {
  const sections = Object.entries(groupBy(moduleTools, (item) => item.section)).map(([sectionId, sectionTools]) => {
    const meta = sectionMeta[sectionId] || { code: sectionId.slice(0, 3).toUpperCase(), label: sectionId, description: "Herramientas" };
    return {
      id: `${moduleKey}-${sectionId}`,
      code: meta.code,
      label: meta.label,
      description: meta.description,
      defaultOpen: false,
      utilities: sectionTools.map((item) => ({
        id: item.id,
        routeName: item.routeName,
        code: item.code,
        label: item.label,
        description: item.purpose,
      })),
    };
  });
  acc[moduleKey] = sections;
  return acc;
}, {});

export const catalogUtilities = Object.entries(groupBy(tools, (item) => item.moduleKey)).reduce((acc, [moduleKey, moduleTools]) => {
  acc[moduleKey] = moduleTools.map((item) => ({
    id: item.id,
    routeName: item.routeName,
    code: item.code,
    label: item.label,
    description: item.purpose,
  }));
  return acc;
}, {});

export const catalogGuideSections = Object.entries(groupBy(tools.filter((item) => !item.implemented), (item) => item.moduleKey)).map(([moduleKey, moduleTools]) => ({
  id: `${moduleKey}-catalog`,
  title: `${moduleLabels[moduleKey]} / backlog Kali`,
  routeName: moduleKey,
  eyebrow: "Catálogo ampliado",
  summary: `Herramientas integradas como vistas propias dentro de ${moduleLabels[moduleKey]}.`,
  workflow: "Cada vista explica utilidad, entrada esperada, programa servidor y estado del conector antes de ejecutar nada.",
  tools: moduleTools.map((item) => ({
    id: item.id,
    name: item.label,
    routeName: item.routeName,
    engine: item.command,
    input: "Objetivo autorizado, fichero de laboratorio o parámetros propios de la herramienta.",
    purpose: item.purpose,
    usage: item.usage,
    guide: {
      objective: item.purpose,
      programs: [item.command],
      howToUse: [
        item.usage,
        "Actualmente la vista muestra el estado del apartado sin controles de ejecución.",
      ],
      output: [
        "Estado de disponibilidad del binario en el servidor.",
        "Aviso claro de desarrollo mientras no exista conector operativo.",
      ],
      notes: [
        "Pendiente de conector backend funcional.",
      ],
    },
  })),
}));

export const catalogLogoRail = tools.map((item) => ({
  id: item.serverId || item.id,
  mark: item.code,
  label: item.label,
  group: item.moduleLabel,
  routeName: item.routeName,
  path: item.path,
}));

export function findCatalogTool(id) {
  return tools.find((item) => item.id === id || item.routeName === id);
}
