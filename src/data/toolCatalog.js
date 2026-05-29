const modulePaths = {
  reconocimiento: "reconocimiento",
  osint: "osint",
  vulnerabilidades: "vulnerabilidades",
  contrasenas: "contrasenas",
  codificacion: "codificacion",
  esteganografia: "esteganografia",
  redes: "redes",
  utilidades: "utilidades",
  reversing: "reversing",
};

const moduleLabels = {
  reconocimiento: "Reconocimiento",
  osint: "OSINT",
  vulnerabilidades: "Vulnerabilidades",
  contrasenas: "ContraseÃ±as",
  codificacion: "CodificaciÃ³n",
  esteganografia: "EsteganografÃ­a",
  redes: "Redes",
  utilidades: "Utilidades",
  reversing: "Reversing",
};

const sectionMeta = {
  dns: { code: "DNS", label: "DNS / Dominios", description: "ResoluciÃ³n, subdominios y superficie externa" },
  discovery: { code: "HOST", label: "Hosts / Puertos", description: "Descubrimiento activo y servicios expuestos" },
  webRecon: { code: "WEB", label: "Web Recon", description: "Fingerprint, crawlers y endpoints" },
  snmpNetbios: { code: "LAN", label: "LAN", description: "SNMP, NetBIOS y descubrimiento local" },
  identity: { code: "ID", label: "Identidad", description: "Personas, perfiles y correlaciÃ³n pÃºblica" },
  usernames: { code: "USR", label: "Usernames", description: "Alias reutilizados en servicios pÃºblicos" },
  contact: { code: "MAIL", label: "Contacto", description: "Emails, telÃ©fonos aportados y dominios" },
  breaches: { code: "BR", label: "Brechas", description: "ExposiciÃ³n pÃºblica de emails y contraseÃ±as" },
  documents: { code: "DOC", label: "Documentos", description: "Metadatos, repositorios y ficheros pÃºblicos" },
  validation: { code: "VAL", label: "ValidaciÃ³n", description: "CVEs, plantillas y Exploit-DB" },
  webVuln: { code: "WEB", label: "Web", description: "AuditorÃ­a web, fuzzing e inyecciÃ³n" },
  exploit: { code: "EXP", label: "ExplotaciÃ³n", description: "Frameworks, sesiones y payloads de laboratorio" },
  access: { code: "ACC", label: "Acceso", description: "Servicios, credenciales y pruebas controladas" },
  privesc: { code: "PRIV", label: "PrivEsc", description: "Escalada local y comprobaciones post-explotaciÃ³n" },
  cracking: { code: "CRK", label: "Cracking", description: "John, Hashcat y formatos de hash" },
  wordlists: { code: "WL", label: "Wordlists", description: "Diccionarios, reglas y generaciÃ³n acotada" },
  encoders: { code: "ENC", label: "Codificadores", description: "Base, URL, HTML, JWT y binarios" },
  crypto: { code: "CRY", label: "Cripto", description: "Hashes, certificados y primitivas OpenSSL" },
  analysis: { code: "AN", label: "AnÃ¡lisis", description: "Firmas, entropÃ­a y contenedores" },
  metadata: { code: "EXIF", label: "Metadatos", description: "Lectura y ediciÃ³n controlada" },
  payloads: { code: "LSB", label: "Payloads", description: "Ocultar, extraer y detectar datos" },
  whoami: { code: "WHO", label: "WHOAMI", description: "Identidad local y salida del servidor" },
  vpns: { code: "VPN", label: "VPNs", description: "WireGuard, OpenVPN y salida controlada" },
  diagnostics: { code: "NET", label: "DiagnÃ³stico", description: "Conectividad, sockets y trazas" },
  traffic: { code: "PCAP", label: "TrÃ¡fico", description: "Captura, lectura y anÃ¡lisis de paquetes" },
  pivot: { code: "PVT", label: "Pivoting", description: "TÃºneles, proxies y movimiento en laboratorio" },
  wirelessWifi: { code: "WIFI", label: "WiFi", description: "AuditorÃ­a inalÃ¡mbrica autorizada" },
  bluetooth: { code: "BT", label: "Bluetooth", description: "EnumeraciÃ³n y anÃ¡lisis de Bluetooth" },
  disk: { code: "DSK", label: "Disco", description: "ImÃ¡genes, carving y recuperaciÃ³n" },
  memory: { code: "MEM", label: "Memoria", description: "Volcado, anÃ¡lisis y artefactos RAM" },
  windowsForensics: { code: "WIN", label: "Windows", description: "Registry, eventos y artefactos Windows" },
  malware: { code: "IOC", label: "IOC", description: "Indicadores, YARA y triage de muestras" },
  binaries: { code: "BIN", label: "Binarios", description: "ELF, PE, strings y debugging" },
  mobile: { code: "APK", label: "Android", description: "APK, smali y anÃ¡lisis mÃ³vil" },
  firmware: { code: "FW", label: "Firmware", description: "ExtracciÃ³n y anÃ¡lisis de firmware" },
  cloudAd: { code: "AD", label: "AD / Cloud", description: "Kerberos, SMB, relay y nubes" },
};

const implemented = true;
const planned = false;

const tools = [
  tool("caligo-intel", "Caligo Intel", "AI", "reconocimiento", "dns", "Backend Spring", "Informe combinado de DNS, HTTP, TLS, reputaciÃ³n, histÃ³rico y endpoints.", "Introduce un dominio o URL autorizada y deja que Caligo agrupe las seÃ±ales.", { routeName: "urls", implemented }),
  tool("nmap", "Nmap", "NMP", "reconocimiento", "discovery", "nmap", "Descubre hosts, puertos, servicios, versiones y scripts NSE seguros.", "Define objetivo, perfil, puertos y timing. El backend conserva el job y permite exportar PDF.", { routeName: "nmap", implemented, serverId: "nmap" }),
  tool("openvas", "OpenVAS / GVM", "GVM", "reconocimiento", "discovery", "gvm-cli", "Orquesta escaneos Greenbone con perfiles, port lists, alive tests y scanner.", "Selecciona parametrizaciÃ³n GVM y consulta progreso real desde el backend.", { routeName: "openvas", implemented, serverId: "openvas" }),
  tool("masscan", "Masscan", "MSC", "reconocimiento", "discovery", "masscan", "Barrido de puertos de alta velocidad para inventario controlado.", "Ãšsalo sÃ³lo en rangos propios, con rate limit estricto y ventana de pruebas definida."),
  tool("rustscan", "RustScan", "RST", "reconocimiento", "discovery", "rustscan", "Descubrimiento rÃ¡pido de puertos con handoff posterior a Nmap.", "Primera pasada rÃ¡pida sobre rangos de laboratorio antes de versionar servicios."),
  tool("netdiscover", "Netdiscover", "NDS", "reconocimiento", "snmpNetbios", "netdiscover", "Descubre hosts en LAN mediante ARP.", "Ãštil para inventario local cuando trabajas dentro de una red de laboratorio."),
  tool("arp-scan", "arp-scan", "ARP", "reconocimiento", "snmpNetbios", "arp-scan", "EnumeraciÃ³n ARP precisa de vecinos de red.", "Selecciona interfaz o rango local y revisa MAC, vendor y latencia."),
  tool("fping", "fping", "FPN", "reconocimiento", "discovery", "fping", "Ping masivo para detectar hosts vivos de forma ligera.", "Ãšsalo antes de escaneos mÃ¡s profundos para reducir superficie."),
  tool("dnsrecon", "DNSRecon", "DRC", "reconocimiento", "dns", "dnsrecon", "Enumera registros DNS, transferencias de zona y fuentes de dominio.", "Introduce dominio autorizado y selecciona tÃ©cnicas pasivas o zona controlada."),
  tool("dnsenum", "DNSEnum", "DEN", "reconocimiento", "dns", "dnsenum", "EnumeraciÃ³n DNS con fuerza bruta opcional de subdominios.", "Combina registros pÃºblicos y diccionarios acotados."),
  tool("fierce", "Fierce", "FRC", "reconocimiento", "dns", "fierce", "Localiza subdominios y rangos relacionados por DNS.", "Ãštil para una fotografÃ­a inicial de dominios propios."),
  tool("amass", "Amass", "AMS", "reconocimiento", "dns", "amass", "Mapeo OSINT de dominios, subdominios y relaciones.", "Usa fuentes pasivas y configura API keys cuando quieras cobertura profunda.", { serverId: "amass" }),
  tool("subfinder", "Subfinder", "SUB", "reconocimiento", "dns", "subfinder", "Descubrimiento pasivo rÃ¡pido de subdominios.", "Ideal antes de httpx, nuclei o crawlers.", { serverId: "subfinder" }),
  tool("assetfinder", "assetfinder", "AST", "reconocimiento", "dns", "assetfinder", "Recolecta dominios y subdominios relacionados.", "Complementa Subfinder/Amass con fuentes rÃ¡pidas."),
  tool("httpx", "httpx", "HTX", "reconocimiento", "webRecon", "httpx", "Fingerprint HTTP masivo: tecnologÃ­as, tÃ­tulos, cÃ³digos, TLS y probes.", "Alimenta con subdominios y filtra servicios web vivos.", { serverId: "httpx" }),
  tool("whatweb", "WhatWeb", "WW", "reconocimiento", "webRecon", "whatweb", "Identifica tecnologÃ­as, frameworks, servidores y plugins web.", "Ejecuta fingerprint no intrusivo sobre URLs autorizadas."),
  tool("wafw00f", "wafw00f", "WAF", "reconocimiento", "webRecon", "wafw00f", "Detecta WAF o controles de protecciÃ³n en aplicaciones web.", "Ãštil antes de fuzzing o validaciones web para ajustar intensidad."),
  tool("katana", "Katana", "KTN", "reconocimiento", "webRecon", "katana", "Crawler moderno para endpoints, JavaScript y rutas.", "Define profundidad y modo pasivo/activo segÃºn el alcance.", { serverId: "katana" }),
  tool("gau", "gau", "GAU", "reconocimiento", "webRecon", "gau", "Recolecta URLs histÃ³ricas desde fuentes pÃºblicas.", "Ãšsalo para descubrir endpoints antiguos antes de validarlos.", { serverId: "gau" }),
  tool("waybackurls", "waybackurls", "WB", "reconocimiento", "webRecon", "waybackurls", "Extrae URLs archivadas de Wayback Machine.", "Complementa gau con rutas histÃ³ricas de dominio."),
  tool("nbtscan", "nbtscan", "NBT", "reconocimiento", "snmpNetbios", "nbtscan", "Enumera nombres NetBIOS en redes Windows.", "Ãšsalo en LAN autorizada para identificar hosts y dominios."),
  tool("onesixtyone", "onesixtyone", "161", "reconocimiento", "snmpNetbios", "onesixtyone", "EnumeraciÃ³n SNMP por community strings controladas.", "Prueba comunidades de laboratorio contra equipos propios."),
  tool("snmpwalk", "snmpwalk", "SNW", "reconocimiento", "snmpNetbios", "snmpwalk", "Consulta Ã¡rboles SNMP cuando existe comunidad autorizada.", "Extrae inventario y mÃ©tricas sin tocar credenciales sensibles."),

  tool("caligo-people", "Caligo People", "PEO", "osint", "identity", "Backend Spring", "BÃºsqueda pÃºblica por nombre, LinkedIn y redes indexadas.", "Introduce nombre o alias y valida manualmente cada candidato.", { routeName: "osintProfileSearch", implemented }),
  tool("social-analyzer", "Social Analyzer", "SOC", "osint", "identity", "social-analyzer", "Correlaciona nombres, aliases y perfiles sociales.", "Ajusta cobertura y timeout para equilibrar ruido y profundidad.", { routeName: "osintSocialAnalyzer", implemented, serverId: "social-analyzer" }),
  tool("sherlock", "Sherlock", "SH", "osint", "usernames", "sherlock", "Enumera usernames en plataformas pÃºblicas.", "Introduce un alias exacto y revisa positivos manualmente.", { routeName: "osintSherlock", implemented, serverId: "sherlock" }),
  tool("maigret", "Maigret", "MG", "osint", "usernames", "maigret", "Cobertura profunda de usernames y perfiles OSINT.", "Ãšsalo cuando necesites mÃ¡s fuentes y scoring por plataforma.", { routeName: "osintMaigret", implemented, serverId: "maigret" }),
  tool("holehe", "Holehe", "HH", "osint", "contact", "holehe", "Comprueba uso pÃºblico de emails en servicios online.", "Trabaja sÃ³lo con emails propios o autorizados.", { routeName: "osintHolehe", implemented, serverId: "holehe" }),
  tool("theharvester", "theHarvester", "TH", "osint", "contact", "theHarvester", "Recolecta emails, hosts y fuentes pÃºblicas por dominio.", "Selecciona fuente y dominio autorizado para extraer superficie pÃºblica.", { routeName: "osintTheHarvester", implemented, serverId: "theharvester" }),
  tool("email-exposure", "Email Exposure", "EML", "osint", "contact", "Backend Spring", "Valida formato, dominio, MX y patrones profesionales autorizados.", "Introduce email o dominio propio y revisa exposiciÃ³n bÃ¡sica.", { routeName: "osintEmailExposure", implemented }),
  tool("phone-lookup", "Phone Lookup", "TEL", "osint", "contact", "Backend Spring", "Normaliza telÃ©fonos aportados y documenta seÃ±ales pÃºblicas seguras.", "No busca telÃ©fonos privados: valida Ãºnicamente datos introducidos.", { routeName: "osintPhoneLookup", implemented }),
  tool("domain-contacts", "Domain Contacts", "DOM", "osint", "contact", "Backend Spring", "Extrae contactos publicados en dominios autorizados.", "Analiza security.txt, contacto, privacidad y pÃ¡ginas pÃºblicas.", { routeName: "osintDomainContacts", implemented }),
  tool("email-breach", "Email Breach", "HIBP", "osint", "breaches", "Have I Been Pwned", "Consulta brechas pÃºblicas para emails propios o autorizados.", "Requiere clave HIBP en backend para resultados completos.", { routeName: "osintEmailBreach", implemented }),
  tool("password-exposure", "Password Exposure", "PWD", "osint", "breaches", "Pwned Passwords", "Comprueba contraseÃ±as expuestas con k-anonymity SHA-1.", "La contraseÃ±a no se envÃ­a en claro al servicio externo.", { routeName: "osintPasswordExposure", implemented }),
  tool("metadata-exposure", "Metadata Exposure", "META", "osint", "documents", "Backend Spring", "Inspecciona cabeceras y metadatos de documentos pÃºblicos.", "Introduce una URL pÃºblica autorizada y revisa seÃ±ales filtradas.", { routeName: "osintMetadataExposure", implemented }),
  tool("public-files", "Public Files", "PUB", "osint", "documents", "Backend Spring", "Localiza robots, sitemap, security.txt y well-known.", "Ãšsalo como comprobaciÃ³n pasiva de exposiciÃ³n documental.", { routeName: "osintPublicFiles", implemented }),
  tool("spiderfoot", "SpiderFoot", "SPF", "osint", "identity", "spiderfoot", "Automatiza correlaciÃ³n OSINT multi-fuente con mÃ³dulos configurables.", "Define target y mÃ³dulos pasivos; revisa siempre falsos positivos."),
  tool("recon-ng", "Recon-ng", "RNG", "osint", "identity", "recon-ng", "Framework modular OSINT para dominios, contactos y hosts.", "Configura workspaces y fuentes antes de lanzar mÃ³dulos."),
  tool("maltego", "Maltego", "MLT", "osint", "identity", "maltego", "AnÃ¡lisis grÃ¡fico de entidades, relaciones y transforms OSINT.", "Se integra como herramienta externa asistida desde Caligo."),
  tool("git-dumper", "git-dumper", "GIT", "osint", "documents", "git-dumper", "Recupera repositorios .git expuestos en entornos autorizados.", "SÃ³lo debe usarse contra dominios propios o laboratorios."),
  tool("trufflehog", "TruffleHog", "TRF", "osint", "documents", "trufflehog", "Detecta secretos en repositorios, histÃ³ricos y artefactos.", "Escanea repos propios para reducir exposiciÃ³n accidental."),

  tool("metasploit", "Metasploit", "MSF", "vulnerabilidades", "exploit", "msfconsole / RPC", "Framework para mÃ³dulos, payloads y sesiones de laboratorio.", "Escanea, selecciona mÃ³dulo, configura payload y controla sesiones.", { routeName: "metasploit", implemented, serverId: "metasploit" }),
  tool("hydra", "Hydra", "HYD", "vulnerabilidades", "access", "hydra", "ValidaciÃ³n controlada de credenciales contra servicios de laboratorio.", "Configura servicio, usuarios, wordlists y lÃ­mites.", { routeName: "fuerzaBruta", implemented, serverId: "hydra" }),
  tool("nuclei", "Nuclei", "NUC", "vulnerabilidades", "validation", "nuclei", "Templates para CVEs, exposiciones y misconfiguraciones.", "Selecciona severidades, tags, rate limit y objetivo autorizado.", { routeName: "vulnerabilidadesNuclei", implemented, serverId: "nuclei" }),
  tool("searchsploit", "Searchsploit", "EDB", "vulnerabilidades", "validation", "searchsploit", "BÃºsqueda local en Exploit-DB por CVE, producto o versiÃ³n.", "Introduce tecnologÃ­a o CVE y valida manualmente aplicabilidad.", { routeName: "vulnerabilidadesSearchsploit", implemented, serverId: "searchsploit" }),
  tool("nikto", "Nikto", "NKT", "vulnerabilidades", "webVuln", "nikto", "AuditorÃ­a web de rutas, cabeceras y exposiciones conocidas.", "Configura host, puerto, SSL y tuning segÃºn el laboratorio.", { routeName: "vulnerabilidadesNikto", implemented, serverId: "nikto" }),
  tool("sqlmap", "sqlmap", "SQL", "vulnerabilidades", "webVuln", "sqlmap", "ValidaciÃ³n guiada de inyecciÃ³n SQL.", "Configura URL, parÃ¡metro, mÃ©todo, cookies y nivel de riesgo.", { routeName: "vulnerabilidadesSqlmap", implemented, serverId: "sqlmap" }),
  tool("ffuf", "ffuf", "FF", "vulnerabilidades", "webVuln", "ffuf", "Fuzzing web rÃ¡pido de rutas, parÃ¡metros, vhosts y contenido.", "Define FUZZ, wordlist, filtros y rate limit.", { serverId: "ffuf" }),
  tool("feroxbuster", "Feroxbuster", "FRX", "vulnerabilidades", "webVuln", "feroxbuster", "Descubrimiento recursivo de contenido web.", "Ãšsalo con wordlists acotadas y lÃ­mites de profundidad."),
  tool("gobuster", "Gobuster", "GOB", "vulnerabilidades", "webVuln", "gobuster", "Fuzzing de directorios, DNS y vhosts.", "Elige modo, wordlist y extensiones de laboratorio."),
  tool("dirb", "DIRB", "DRB", "vulnerabilidades", "webVuln", "dirb", "Descubrimiento clÃ¡sico de directorios y archivos.", "Ãštil como baseline simple en servidores web propios."),
  tool("dirsearch", "dirsearch", "DRS", "vulnerabilidades", "webVuln", "dirsearch", "Fuzzing de rutas web con filtros y extensiones.", "Configura diccionario y cÃ³digos de estado relevantes."),
  tool("wpscan", "WPScan", "WPS", "vulnerabilidades", "webVuln", "wpscan", "AuditorÃ­a de WordPress, plugins, temas y versiones.", "Requiere objetivo WordPress autorizado y token opcional."),
  tool("joomscan", "JoomScan", "JMS", "vulnerabilidades", "webVuln", "joomscan", "AuditorÃ­a de Joomla y extensiones conocidas.", "Escanea sitios Joomla propios y documenta versiones."),
  tool("wapiti", "Wapiti", "WPT", "vulnerabilidades", "webVuln", "wapiti", "Scanner web para XSS, SQLi, LFI/RFI y configuraciones.", "Define alcance y mÃ³dulos para no generar ruido innecesario."),
  tool("commix", "Commix", "CMX", "vulnerabilidades", "webVuln", "commix", "ValidaciÃ³n de command injection en laboratorios.", "Introduce URL/parÃ¡metro controlado y limita tÃ©cnicas."),
  tool("xsser", "XSSer", "XSS", "vulnerabilidades", "webVuln", "xsser", "ValidaciÃ³n de XSS reflejado y vectores de prueba.", "Ãšsalo sÃ³lo contra entornos propios con payloads inocuos."),
  tool("arjun", "Arjun", "ARJ", "vulnerabilidades", "webVuln", "arjun", "Descubre parÃ¡metros HTTP ocultos.", "Ejecuta contra endpoints concretos antes de sqlmap o pruebas manuales."),
  tool("testssl", "testssl.sh", "TLS", "reconocimiento", "webRecon", "testssl.sh", "EvalÃºa configuraciÃ³n TLS, ciphers y protocolos.", "Complementa Caligo TLS con un anÃ¡lisis profundo del servidor."),
  tool("linpeas", "LinPEAS", "LPE", "vulnerabilidades", "privesc", "linpeas.sh", "EnumeraciÃ³n local para escalada de privilegios en Linux.", "Post-explotaciÃ³n controlada en mÃ¡quinas de laboratorio."),
  tool("winpeas", "WinPEAS", "WPE", "vulnerabilidades", "privesc", "winPEAS.exe", "EnumeraciÃ³n local para escalada de privilegios en Windows.", "Post-explotaciÃ³n controlada en mÃ¡quinas Windows de laboratorio."),
  tool("chisel", "Chisel", "CHS", "redes", "pivot", "chisel", "TÃºneles TCP/HTTP para pivoting controlado.", "Gestiona tÃºneles de laboratorio con puertos explÃ­citos."),

  tool("john", "John the Ripper", "JTR", "contrasenas", "cracking", "john", "AuditorÃ­a offline de hashes con formatos John.", "Carga hashes autorizados, selecciona formato y wordlist.", { routeName: "passwordsJohn", implemented, serverId: "john" }),
  tool("hashcat", "Hashcat", "HCT", "contrasenas", "cracking", "hashcat", "Cracking acelerado por CPU/GPU con modos Hashcat.", "Selecciona modo, hash, ataque y diccionario.", { routeName: "passwordsHashcat", implemented, serverId: "hashcat" }),
  tool("hashid", "hashID", "HID", "contrasenas", "cracking", "hashid", "Identifica formatos probables de hash.", "Pega un hash y compara candidatos antes de crackear.", { routeName: "passwordsIdentifier", implemented, serverId: "hashid" }),
  tool("name-that-hash", "Name-That-Hash", "NTH", "contrasenas", "cracking", "nth", "IdentificaciÃ³n avanzada de hashes.", "Complementa hashID cuando existan formatos ambiguos."),
  tool("wordlists", "SecLists", "WL", "contrasenas", "wordlists", "SecLists", "Inventario de wordlists permitidas en servidor.", "Elige listas por tipo: usuarios, passwords, fuzzing o servicios.", { routeName: "passwordsWordlists", implemented, serverId: "wordlists" }),
  tool("crunch", "Crunch", "CR", "contrasenas", "wordlists", "crunch", "Genera diccionarios acotados por longitud y charset.", "Define longitud, charset y lÃ­mites para evitar explosiÃ³n de tamaÃ±o.", { routeName: "passwordsCrunch", implemented, serverId: "crunch" }),
  tool("cewl", "CeWL", "CW", "contrasenas", "wordlists", "cewl", "Crea wordlists desde contenido web autorizado.", "Introduce URL propia, profundidad y filtros de longitud.", { routeName: "passwordsCewl", implemented, serverId: "cewl" }),
  tool("cupp", "CUPP", "CUP", "contrasenas", "wordlists", "cupp", "Genera diccionarios personalizados desde perfiles autorizados.", "Ãšsalo sÃ³lo en auditorÃ­as internas con datos consentidos."),
  tool("rsmangler", "RSMangler", "RSM", "contrasenas", "wordlists", "rsmangler", "Aplica mutaciones a diccionarios base.", "Genera variantes controladas sin inflar listas sin lÃ­mite."),
  tool("medusa", "Medusa", "MED", "vulnerabilidades", "access", "medusa", "Pruebas de credenciales en mÃºltiples servicios.", "Alternativa a Hydra para protocolos concretos en laboratorio."),
  tool("ncrack", "Ncrack", "NCK", "vulnerabilidades", "access", "ncrack", "AuditorÃ­a de autenticaciÃ³n de red.", "EvalÃºa credenciales dÃ©biles con lÃ­mites de velocidad."),

  tool("base-converter", "Base Converter", "B64", "codificacion", "encoders", "Browser", "Base64, Base32, Base16, URL, HTML y texto escapado.", "Convierte entradas locales sin enviar secretos al servidor.", { routeName: "codificacion", implemented }),
  tool("cyberchef", "CyberChef", "CCF", "codificacion", "encoders", "cyberchef", "Recetas de transformaciÃ³n, decodificaciÃ³n y anÃ¡lisis de datos.", "Construye pipelines reproducibles para strings y binarios."),
  tool("xxd", "xxd", "XXD", "codificacion", "encoders", "xxd", "Hexdump y reconstrucciÃ³n de binarios.", "Inspecciona bytes y convierte hex a fichero controlado."),
  tool("jq", "jq", "JQ", "codificacion", "encoders", "jq", "Procesamiento JSON desde consola.", "Filtra respuestas API y normaliza salidas de herramientas."),
  tool("yq", "yq", "YQ", "codificacion", "encoders", "yq", "Procesamiento YAML/XML/TOML.", "Ãštil para manifiestos, Kubernetes y configs."),
  tool("openssl", "OpenSSL", "SSL", "codificacion", "crypto", "openssl", "Hashes, certificados, firmas y clientes TLS.", "Calcula fingerprints o valida certificados de laboratorio.", { serverId: "openssl" }),
  tool("hashdeep", "hashdeep", "HD", "codificacion", "crypto", "hashdeep", "Hashing recursivo e inventario de integridad.", "Genera manifests de evidencia o ficheros de laboratorio."),

  tool("stego-analyze", "Caligo Analyze", "ANL", "esteganografia", "analysis", "Browser", "Magic bytes, entropÃ­a, cadenas, bytes anexos y LSB.", "Carga muestra local y revisa seÃ±ales tÃ©cnicas.", { routeName: "stegoAnalyze", implemented }),
  tool("metadata-analyzer", "Metadata Analyzer", "META", "esteganografia", "metadata", "Browser / ExifTool", "Lectura local de PNG, JPEG, PDF y contenedores.", "Inspecciona metadatos visibles antes de publicar artefactos.", { routeName: "stegoMetadataAnalyze", implemented, serverId: "exiftool" }),
  tool("metadata-editor", "Metadata Editor", "EDIT", "esteganografia", "metadata", "Browser", "Inserta metadatos controlados o genera sidecar JSON.", "Edita sÃ³lo copias de laboratorio.", { routeName: "stegoMetadataEditor", implemented }),
  tool("stego-embed", "Caligo Embed", "LSB+", "esteganografia", "payloads", "Browser", "Oculta texto o ficheros en LSB, PNG tEXt o footer.", "Genera muestras controladas para detecciÃ³n.", { routeName: "stegoEmbed", implemented }),
  tool("stego-extract", "Caligo Extract", "LSB-", "esteganografia", "payloads", "Browser", "Recupera paquetes Caligo desde footer, PNG tEXt o LSB.", "Carga muestra y extrae evidencia.", { routeName: "stegoExtract", implemented }),
  tool("exiftool", "ExifTool", "EXIF", "esteganografia", "metadata", "exiftool", "ExtracciÃ³n y ediciÃ³n de metadatos en mÃºltiples formatos.", "Ãšsalo para inspeccionar y limpiar metadatos en ficheros autorizados.", { serverId: "exiftool" }),
  tool("steghide", "Steghide", "STH", "esteganografia", "payloads", "steghide", "OcultaciÃ³n y extracciÃ³n en JPEG/BMP/WAV/AU.", "Trabaja con passphrases de laboratorio.", { serverId: "steghide" }),
  tool("zsteg", "zsteg", "ZST", "esteganografia", "analysis", "zsteg", "DetecciÃ³n LSB en PNG/BMP.", "Analiza canales y planos de bits.", { serverId: "zsteg" }),
  tool("outguess", "OutGuess", "OUT", "esteganografia", "payloads", "outguess", "Stego estadÃ­stico para imÃ¡genes JPEG.", "Genera y extrae muestras controladas."),
  tool("stegseek", "Stegseek", "SSK", "esteganografia", "payloads", "stegseek", "Ataque de diccionario contra Steghide en laboratorio.", "Ãšsalo sÃ³lo con ficheros propios y wordlists acotadas."),
  tool("pngcheck", "pngcheck", "PNG", "esteganografia", "analysis", "pngcheck", "Valida chunks y estructura de PNG.", "Detecta chunks sospechosos o datos anexos."),

  tool("whoami-local", "WHOAMI Local", "LOC", "utilidades", "whoami", "Browser", "Huella del navegador local: pantalla, permisos, storage, WebGL y red del cliente.", "Mide Ãºnicamente el entorno donde se abre el front.", { routeName: "networkWhoamiLocal", implemented }),
  tool("whoami-server", "WHOAMI Server", "SRV", "utilidades", "whoami", "Backend Spring", "Identidad del servidor: IP pÃºblica, interfaces, cabeceras observadas y VPN.", "Consulta el backend sin mezclar mÃ©tricas de pantalla del navegador.", { routeName: "networkWhoamiServer", implemented }),
  tool("wireguard", "WireGuard", "WG", "redes", "vpns", "wg", "TÃºneles WireGuard para salida controlada del servidor.", "Selecciona perfil, paÃ­s/proveedor si existe y conecta desde el backend.", { routeName: "networkVpnsWireguard", implemented, serverId: "wireguard" }),
  tool("openvpn", "OpenVPN", "OVPN", "redes", "vpns", "openvpn", "Perfiles OpenVPN con selecciÃ³n de ubicaciÃ³n.", "Conecta o desconecta tÃºneles gestionados por helper.", { routeName: "networkVpnsOpenvpn", implemented, serverId: "openvpn" }),
  tool("ping", "Ping", "PNG", "utilidades", "diagnostics", "ping", "Latencia y disponibilidad ICMP.", "Comprueba hosts autorizados antes de escanear."),
  tool("traceroute", "Traceroute", "TRC", "utilidades", "diagnostics", "traceroute", "Rutas y saltos hacia objetivos.", "Valida camino de red desde el servidor Caligo."),
  tool("mtr", "MTR", "MTR", "utilidades", "diagnostics", "mtr", "Traceroute continuo con pÃ©rdida y latencia.", "Ãšsalo para diagnÃ³stico temporal de conectividad."),
  tool("netcat", "Netcat", "NC", "utilidades", "diagnostics", "nc", "Sockets, listeners y pruebas de conectividad.", "Abre pruebas puntuales en laboratorio y documenta puertos.", { serverId: "netcat" }),
  tool("socat", "socat", "SOC", "utilidades", "diagnostics", "socat", "Relay flexible de sockets, puertos y streams.", "Ãšsalo para pruebas controladas de conectividad."),
  tool("tcpdump", "tcpdump", "TCP", "redes", "traffic", "tcpdump", "Captura de paquetes desde interfaces del servidor.", "Aplica filtros BPF y exporta PCAPs acotados."),
  tool("tshark", "tshark", "TSH", "redes", "traffic", "tshark", "AnÃ¡lisis CLI de PCAPs y protocolos.", "Resume conversaciones, hosts y protocolos sin abrir Wireshark."),
  tool("wireshark", "Wireshark", "WS", "redes", "traffic", "wireshark", "AnÃ¡lisis grÃ¡fico de trÃ¡fico.", "Se usarÃ¡ como visor asistido de PCAPs exportados."),
  tool("mitmproxy", "mitmproxy", "MITM", "redes", "traffic", "mitmproxy", "Proxy HTTP/S interceptable en laboratorios.", "Requiere certificados controlados y consentimiento del entorno."),
  tool("bettercap", "bettercap", "BCP", "redes", "traffic", "bettercap", "Framework MITM y red local para laboratorio.", "SÃ³lo en redes propias con objetivos de prueba."),
  tool("responder", "Responder", "RSP", "redes", "traffic", "responder", "AnÃ¡lisis y simulaciÃ³n LLMNR/NBT-NS en laboratorio.", "Ãšsalo para evaluar exposiciÃ³n de redes Windows propias."),
  tool("proxychains", "Proxychains", "PXC", "redes", "pivot", "proxychains", "Encadena trÃ¡fico de herramientas por proxies.", "Permite ejecutar CLI a travÃ©s de tÃºneles definidos."),
  tool("tor", "Tor", "TOR", "redes", "pivot", "tor", "Salida onion/proxy para pruebas de privacidad.", "Ãšsalo sÃ³lo para comprobar salida y rutas de laboratorio."),
  tool("sshuttle", "sshuttle", "SHT", "redes", "pivot", "sshuttle", "VPN transparente por SSH.", "Conecta rangos propios sin configurar rutas manuales."),
  tool("ligolo-ng", "Ligolo-ng", "LGO", "redes", "pivot", "ligolo-ng", "Pivoting moderno por tÃºneles de red.", "Gestiona agentes y rutas en laboratorio autorizado."),
  tool("aircrack-ng", "Aircrack-ng", "AIR", "redes", "wirelessWifi", "aircrack-ng", "Suite WiFi para captura, anÃ¡lisis y auditorÃ­a WPA.", "Requiere adaptador monitor y redes propias."),
  tool("kismet", "Kismet", "KSM", "redes", "wirelessWifi", "kismet", "DetecciÃ³n inalÃ¡mbrica WiFi/Bluetooth/SDR.", "Inventario pasivo de redes autorizadas."),
  tool("wifite", "Wifite", "WFT", "redes", "wirelessWifi", "wifite", "Automatiza auditorÃ­as WiFi en entornos propios.", "Ãšsalo sÃ³lo con permiso explÃ­cito de la red."),
  tool("bluetoothctl", "bluetoothctl", "BT", "redes", "bluetooth", "bluetoothctl", "EnumeraciÃ³n y gestiÃ³n Bluetooth local.", "Audita dispositivos propios cercanos."),

  tool("ghidra", "Ghidra", "GHD", "reversing", "binaries", "ghidra", "Desensamblado y decompilaciÃ³n de binarios.", "Carga binarios de laboratorio y revisa funciones crÃ­ticas."),
  tool("radare2", "radare2", "R2", "reversing", "binaries", "r2", "Framework CLI de reversing y anÃ¡lisis binario.", "Inspecciona secciones, strings, imports y flujo."),
  tool("gdb", "GDB", "GDB", "reversing", "binaries", "gdb", "Debugging nativo de binarios.", "Ejecuta muestras controladas con breakpoints y registros."),
  tool("strings", "strings", "STR", "reversing", "binaries", "strings", "ExtracciÃ³n de cadenas imprimibles.", "Primera pasada rÃ¡pida sobre binarios y memoria."),
  tool("objdump", "objdump", "OBJ", "reversing", "binaries", "objdump", "Cabeceras, sÃ­mbolos y desensamblado.", "Genera vistas estÃ¡ticas para anÃ¡lisis."),
  tool("ltrace", "ltrace", "LTR", "reversing", "binaries", "ltrace", "Traza llamadas a librerÃ­as.", "Observa comportamiento dinÃ¡mico en sandbox."),
  tool("strace", "strace", "STRC", "reversing", "binaries", "strace", "Traza syscalls y ficheros.", "Diagnostica comportamiento de binarios controlados."),
  tool("apktool", "apktool", "APK", "reversing", "mobile", "apktool", "Decodifica recursos y smali de APK.", "Analiza aplicaciones Android propias o de laboratorio."),
  tool("jadx", "JADX", "JDX", "reversing", "mobile", "jadx", "DecompilaciÃ³n Java/Kotlin de APK.", "Revisa cÃ³digo fuente reconstruido de muestras autorizadas."),
  tool("binwalk-reversing", "Binwalk", "BNW", "reversing", "firmware", "binwalk", "Firmas, extracciÃ³n y anÃ¡lisis de firmware.", "Extrae sistemas de ficheros y blobs embebidos.", { serverId: "binwalk" }),
  tool("firmwalker", "firmwalker", "FWK", "reversing", "firmware", "firmwalker", "Busca secretos y rutas interesantes en firmware extraÃ­do.", "Complementa binwalk tras extracciÃ³n."),
  tool("impacket", "Impacket", "IMP", "vulnerabilidades", "cloudAd", "impacket-*", "Suite SMB, Kerberos, NTLM y herramientas AD.", "Ãšsalo en laboratorios Windows/AD propios."),
  tool("netexec", "NetExec", "NXC", "vulnerabilidades", "cloudAd", "nxc", "EnumeraciÃ³n y validaciÃ³n en SMB/LDAP/WinRM.", "Gestiona credenciales de laboratorio con alcance claro."),
  tool("bloodhound", "BloodHound", "BH", "vulnerabilidades", "cloudAd", "bloodhound", "Grafos de relaciones y rutas de ataque en AD.", "Ingiere datos SharpHound/Collectors de entorno autorizado."),
  tool("certipy", "Certipy", "CRT", "vulnerabilidades", "cloudAd", "certipy", "AuditorÃ­a de AD CS y certificados.", "Detecta plantillas vulnerables en dominios propios."),
  tool("kerbrute", "Kerbrute", "KRB", "vulnerabilidades", "cloudAd", "kerbrute", "EnumeraciÃ³n Kerberos y validaciÃ³n controlada.", "Limita usuarios y rate para no afectar DCs."),
  tool("enum4linux-ng", "enum4linux-ng", "E4L", "vulnerabilidades", "cloudAd", "enum4linux-ng", "EnumeraciÃ³n SMB/NetBIOS moderna.", "Extrae usuarios, shares y polÃ­ticas en laboratorio."),
];

function tool(id, label, code, moduleKey, section, command, purpose, usage, options = {}) {
  const routeName = options.routeName || toRouteName(id);
  return {
    id,
    label,
    code,
    moduleKey,
    moduleLabel: moduleLabels[moduleKey],
    section,
    command,
    purpose,
    usage,
    routeName,
    path: options.path || `/${modulePaths[moduleKey]}/${section}/${id}`,
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
  eyebrow: "CatÃ¡logo ampliado",
  summary: `Herramientas integradas como vistas propias dentro de ${moduleLabels[moduleKey]}.`,
  workflow: "Cada vista explica utilidad, entrada esperada, programa servidor y estado del conector antes de ejecutar nada.",
  tools: moduleTools.map((item) => ({
    id: item.id,
    name: item.label,
    routeName: item.routeName,
    engine: item.command,
    input: "Objetivo autorizado, fichero de laboratorio o parÃ¡metros propios de la herramienta.",
    purpose: item.purpose,
    usage: item.usage,
    guide: {
      objective: item.purpose,
      programs: [item.command],
      howToUse: [
        item.usage,
        "Confirma el alcance autorizado antes de activar ejecuciÃ³n real en backend.",
        "Cuando el conector estÃ© habilitado, Caligo conservarÃ¡ parÃ¡metros, estado y salida para poder cambiar de vista sin perder el trabajo.",
      ],
      output: [
        "Estado de disponibilidad del binario en el servidor.",
        "ParÃ¡metros normalizados y comando previsto.",
        "Salida tÃ©cnica o evidencia exportable cuando exista conector operativo.",
      ],
      notes: [
        "Vista creada como punto de entrada del laboratorio. La ejecuciÃ³n real debe conectarse con endpoint tokenizado y validaciÃ³n de alcance.",
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
}));

export function findCatalogTool(id) {
  return tools.find((item) => item.id === id || item.routeName === id);
}

