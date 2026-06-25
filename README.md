# Caligo Frontend

Frontend Vue 3 de Caligo. La aplicación funciona como cabina de mando para los módulos de ciberseguridad y se conecta al backend Spring local mediante JWT.

La navegación principal actual se organiza en **OSINT**, **SCAN**, **XPLOIT**, **NETWORK**, **CODING** y **TOOLS**. `SCAN` agrupa Caligo Intel, Nmap, OpenVAS/GVM y reconocimiento DNS/web. `XPLOIT` agrupa Metasploit, Hydra, Nuclei, Searchsploit, Nikto, sqlmap y catálogo AD/Cloud. `TOOLS` concentra WHOAMI, John, Hashcat, hashID, Crunch, CeWL y wordlists. `NETWORK` queda para VPNs y operativa de red; `CODING` une codificación, esteganografía, metadatos y reversing de catálogo. Las rutas antiguas en español siguen como redirecciones de compatibilidad, pero las rutas canónicas de herramienta son `/tool/...`.

## Stack

- Vue 3.
- Vite.
- Vue Router.
- Vuex.
- CSS global segmentado en `src/assets/styles/*.css` e importado desde `src/main.js`.
- API REST local contra `back-caligo`.

## Estructura

```text
front-caligo/
  index.html
  public/
    favicon.png
  src/
    assets/
      images/
      styles/
    components/
      AppHeader.vue
      AppSidebar.vue
      AsciiDescent.vue
      MatrixRain.vue
      ModuleWorkspace.vue
      PrivacyFooter.vue
      HydraWorkbench.vue
      HashIdentifierWorkbench.vue
      PasswordCrackWorkbench.vue
      ScannerWorkbench.vue
      OsintToolWorkbench.vue
      OsintExposureWorkbench.vue
      VulnerabilityToolWorkbench.vue
      WordlistGeneratorWorkbench.vue
      WordlistInventory.vue
    data/
      modulePages.js
      osintTools.js
      osintExposureTools.js
      vulnerabilityTools.js
    router/
      index.js
    services/
      caligoApi.js
    store/
      index.js
    views/
      HomeView.vue
      LoginView.vue
      reconocimiento/
        ReconnaissanceView.vue
        UrlsView.vue
        NmapView.vue
        OpenvasView.vue
        urls/
      osint/
        OsintView.vue
        ProfileSearchView.vue
        SherlockView.vue
        MaigretView.vue
        SocialAnalyzerView.vue
        HoleheView.vue
        TheHarvesterView.vue
        EmailExposureView.vue
        PhoneLookupView.vue
        DomainContactsView.vue
        PasswordExposureView.vue
        MetadataExposureView.vue
        PublicFilesExposureView.vue
      vulnerabilidades/
        VulnerabilitiesView.vue
        MetasploitView.vue
        BruteForceView.vue
        NucleiView.vue
        SearchsploitView.vue
        NiktoView.vue
        SqlmapView.vue
      contrasenas/
        PasswordsView.vue
        JohnView.vue
        HashcatView.vue
        HashIdentifierView.vue
        CrunchView.vue
        CewlView.vue
        WordlistsView.vue
      codificacion/
        EncodingView.vue
      esteganografia/
        SteganographyView.vue
        StegoAnalyzeView.vue
        StegoMetadataAnalyzeView.vue
        StegoMetadataEditorView.vue
        StegoEmbedView.vue
        StegoExtractView.vue
      redes/
        NetworksView.vue
        VpnsView.vue
      utilidades/
        UtilitiesView.vue
        WhoamiView.vue
```

## Ejecución local

Instalar dependencias:

```powershell
cd C:\Users\Jarva\Desktop\git-repos\front-caligo
npm install
```

Arrancar Vite:

```powershell
npm run dev
```

Frontend local:

```text
http://localhost:5173
http://192.168.0.17:5174
```

Backend esperado:

```text
http://localhost:8080
http://192.168.0.253:8080
```

## Variables

| Variable | Default | Uso |
| --- | --- | --- |
| `VITE_CALIGO_API_BASE_URL` | mismo origen | URL base del backend Spring. Si se deja vacía, el frontend llama a `/api/...` en el mismo dominio. |

Ejemplo:

```powershell
$env:VITE_CALIGO_API_BASE_URL="http://localhost:8080"
npm run dev
```

Para probar contra el backend desplegado en el servidor 2:

```powershell
$env:VITE_CALIGO_API_BASE_URL="http://192.168.0.253:8080"
npm run dev -- --host 0.0.0.0 --port 5174
```

En producción no configures esta variable si Nginx o Cloudflare Tunnel publican el backend bajo `/api` en el mismo dominio del front. Así el acceso no depende de una IP LAN fija ni provoca llamadas cruzadas desde HTTPS a HTTP.

## Login local

El login pide usuario y contraseña contra `/api/auth/login`. También existe un acceso demo/portfolio sin token para revisar la interfaz; en ese modo las herramientas reales quedan bloqueadas hasta iniciar sesión con credenciales.

En el entorno del servidor 2 existe el usuario bootstrap operativo `Gandalf`; la contraseña no se versiona y su valor en MariaDB se guarda como BCrypt.

El JWT se guarda en `localStorage`:

- `caligo.jwt`
- `caligo.user`

Las peticiones protegidas se envían con:

```text
Authorization: Bearer <token>
```

## Módulos del header

Orden actual desde `src/data/modulePages.js`:

1. OSINT
2. SCAN
3. XPLOIT
4. NETWORK
5. CODING
6. TOOLS

`Home` no muestra barra lateral. El resto de vistas muestran una barra lateral contextual generada desde `src/data/toolCatalog.js` y `src/data/modulePages.js`. `src/router/index.js` mantiene redirecciones heredadas como `/reconocimiento`, `/vulnerabilidades`, `/contrasenas`, `/codificacion`, `/esteganografia`, `/redes` y `/utilidades`, pero las rutas canónicas de herramientas usan `/tool/<id>`.

Los códigos visuales de cabecera no son los mismos que los códigos de módulo del backend: el backend sigue exponiendo herramientas como `urls`, `nmap`, `openvas`, `metasploit`, `nuclei`, `sqlmap`, `passwords`, `steganography`, etc. Al cablear APIs, usa siempre los endpoints y `serverId` definidos para la herramienta, no el nombre visible del módulo de cabecera.

El header muestra, junto a la ruleta de ajustes, dos lecturas de identidad:

- `IP SERVIDOR`: IP pública de salida del backend Caligo, leída desde `/api/network/identity`.
- `IP CLIENTE`: IP pública del navegador si `api.ipify.org` responde; si no, se mantiene la IP observada por el backend.

La lectura se refresca al cargar, cada 30 segundos y cuando la vista de VPN emite cambios de túnel.

## Ajustes y actualizaciones

La ruleta del header abre el menú de ajustes. La opción **Actualizaciones**
muestra un modal con el inventario de herramientas del servidor, su versión
actual y un botón de actualización por herramienta.

Endpoints usados:

| Uso | Endpoint |
| --- | --- |
| Inventario versionado | `GET /api/system/tools` |
| Actualizar herramienta | `POST /api/system/tools/{id}/update` |

El inventario incluye también herramientas de red/VPN cuando el backend las detecta: `wireguard`, `openvpn` y `resolvconf`.

Las actualizaciones se ejecutan en el backend con una allowlist cerrada y
requieren usuario `ADMIN`. Si el servidor no tiene permisos `sudo -n` para el
mantenimiento de paquetes, el modal mostrara el fallo devuelto por el backend.

## URLs dentro de Reconocimiento

Vista principal agregada:

```text
src/views/reconocimiento/UrlsView.vue
```

Vistas por herramienta:

```text
src/views/reconocimiento/urls/UrlDnsResolverView.vue
src/views/reconocimiento/urls/UrlInspectorView.vue
src/views/reconocimiento/urls/UrlHttpSecurityView.vue
src/views/reconocimiento/urls/UrlTlsView.vue
src/views/reconocimiento/urls/UrlReputationView.vue
src/views/reconocimiento/urls/UrlHistoryView.vue
src/views/reconocimiento/urls/UrlPublicFilesView.vue
src/views/reconocimiento/urls/UrlEndpointsView.vue
src/views/reconocimiento/urls/UrlLocalToolsView.vue
```

Servicio API:

```text
src/services/caligoApi.js
```

Utilidades visibles dentro del desplegable `DNS / Dominios` de la barra lateral de SCAN:

- Caligo Intel

Las vistas URL individuales siguen existiendo como piezas internas, pero no se muestran en la barra lateral porque `Caligo Intel` ya une DNS, parser, HTTP, TLS, reputación, historial, archivos públicos, endpoints y herramientas locales.

## OSINT

Vistas:

```text
src/views/osint/ProfileSearchView.vue
src/views/osint/SherlockView.vue
src/views/osint/MaigretView.vue
src/views/osint/SocialAnalyzerView.vue
src/views/osint/HoleheView.vue
src/views/osint/TheHarvesterView.vue
src/views/osint/EmailExposureView.vue
src/views/osint/PhoneLookupView.vue
src/views/osint/DomainContactsView.vue
src/views/osint/PasswordExposureView.vue
src/views/osint/MetadataExposureView.vue
src/views/osint/PublicFilesExposureView.vue
src/views/osint/GitDumperView.vue
src/views/osint/SpiderFootView.vue
src/views/osint/TruffleHogView.vue
src/components/OsintToolWorkbench.vue
src/components/OsintExposureWorkbench.vue
src/data/osintTools.js
src/data/osintExposureTools.js
```

Rutas:

| Vista | Ruta |
| --- | --- |
| Caligo People | `/tool/caligo-people` |
| Sherlock | `/tool/sherlock` |
| Maigret | `/tool/maigret` |
| Social Analyzer | `/tool/social-analyzer` |
| Holehe | `/tool/holehe` |
| theHarvester | `/tool/theharvester` |
| Email Exposure | `/tool/email-exposure` |
| Phone Lookup | `/tool/phone-lookup` |
| Domain Contacts | `/tool/domain-contacts` |
| Password Exposure | `/tool/password-exposure` |
| Metadata Exposure | `/tool/metadata-exposure` |
| Public Files | `/tool/public-files` |
| git-dumper | `/tool/git-dumper` |
| SpiderFoot | `/tool/spiderfoot` |
| TruffleHog | `/tool/trufflehog` |

`Caligo People` acepta nombre real, pista opcional y plataformas para devolver candidatos públicos de LinkedIn y redes sociales. `Email Exposure`, `Domain Contacts`, `git-dumper`, `SpiderFoot` y `TruffleHog` tienen interfaz propia, no workbench genérico: cada una muestra controles, presets, salida y métricas adaptadas a su función. Las herramientas CLI se ejecutan en el servidor y usan jobs persistentes: puedes cambiar de vista y volver a la herramienta para recuperar progreso, logs y resultados.

Las herramientas de exposición autorizada usan `OsintExposureWorkbench`: cada vista tiene formulario propio, confirmación de alcance, salida persistente en `localStorage` y render de hallazgos, recursos, consultas y recomendaciones. No están diseñadas para descubrir datos privados de terceros: trabajan con datos aportados por el usuario, dominios autorizados o comprobaciones defensivas de exposición.

Endpoints usados:

| Uso | Endpoint |
| --- | --- |
| Inventario OSINT | `GET /api/osint/capabilities` |
| Búsqueda por nombre | `POST /api/osint/profile-search/search` |
| Sherlock | `POST /api/osint/sherlock/runs` |
| Maigret | `POST /api/osint/maigret/runs` |
| Social Analyzer | `POST /api/osint/social-analyzer/runs` |
| Holehe | `POST /api/osint/holehe/runs` |
| theHarvester | `POST /api/osint/theharvester/runs` |
| git-dumper | `POST /api/osint/git-dumper/runs` |
| SpiderFoot | `POST /api/osint/spiderfoot/runs` |
| TruffleHog | `POST /api/osint/trufflehog/runs` |
| Estado job | `GET /api/osint/{tool}/runs/{id}` |
| Capacidades de exposición | `GET /api/osint/exposure/capabilities` |
| Email Exposure | `POST /api/osint/exposure/email` |
| Phone Lookup | `POST /api/osint/exposure/phone` |
| Domain Contacts | `POST /api/osint/exposure/domain-contacts` |
| Password Exposure | `POST /api/osint/exposure/password` |
| Metadata Exposure | `POST /api/osint/exposure/metadata` |
| Public Files | `POST /api/osint/exposure/public-files` |

## Redes

Vistas:

```text
src/views/redes/NetworksView.vue
src/views/redes/VpnsView.vue
src/components/VpnWorkbench.vue
```

Rutas:

| Vista | Ruta |
| --- | --- |
| NETWORK | `/network` |
| WireGuard | `/tool/wireguard` |
| OpenVPN | `/tool/openvpn` |

`Redes` concentra operativa de salida y tráfico: VPNs, captura, análisis PCAP,
proxies, pivoting, WiFi y Bluetooth. `VPNs` lee perfiles WireGuard/OpenVPN del servidor, permite elegir perfil por
proveedor/país/ciudad si los metadatos existen, conecta/desconecta mediante el
backend y refresca automáticamente las IPs del header al cambiar el túnel.

## Utilidades

Vistas:

```text
src/views/utilidades/UtilitiesView.vue
src/views/utilidades/WhoamiView.vue
src/components/IdentityWorkbench.vue
```

Rutas:

| Vista | Ruta |
| --- | --- |
| TOOLS | `/tools` |
| WHOAMI Local | `/tool/whoami-local` |
| WHOAMI Server | `/tool/whoami-server` |

`WHOAMI` adapta la utilidad de **La Identidad de Gollum** al estilo Caligo y queda separada en dos lecturas: la local mide navegador, pantalla, permisos, storage, cookies, WebGL, media devices e IP pública del cliente; la de servidor mide IP pública del backend, interfaces, cabeceras observadas, sistema y estado VPN. Las utilidades de conectividad (`Ping`, `Traceroute`, `MTR`, `Netcat`, `Socat`) se mantienen como vistas de catálogo hasta conectar endpoints específicos.

Endpoints usados:

| Uso | Endpoint |
| --- | --- |
| Identidad cliente/servidor | `GET /api/network/identity` |
| Estado VPN | `GET /api/network/vpn/status` |
| Perfiles VPN | `GET /api/network/vpn/profiles` |
| Conectar VPN | `POST /api/network/vpn/connect` |
| Desconectar VPN | `POST /api/network/vpn/disconnect` |

## Nmap y OpenVAS dentro de Reconocimiento

Vistas:

```text
src/views/reconocimiento/NmapView.vue
src/views/reconocimiento/OpenvasView.vue
src/components/ScannerWorkbench.vue
```

Endpoints:

| Herramienta | Ruta frontend | Endpoint capacidades | Endpoint job |
| --- | --- | --- | --- |
| Nmap | `/tool/nmap` | `GET /api/recon/nmap/capabilities` | `POST /api/recon/nmap/scans`, `GET /api/recon/nmap/scans/{id}` y `GET /api/recon/nmap/scans/{id}/report.pdf` |
| OpenVAS | `/tool/openvas` | `GET /api/recon/openvas/capabilities` | `POST /api/recon/openvas/scans`, `GET /api/recon/openvas/scans/{id}` y `GET /api/recon/openvas/scans/{id}/report.pdf` |

La vista no ejecuta herramientas en navegador. Siempre:

- Garantiza JWT con el login local.
- Consulta capacidades del backend.
- Permite parametrizar perfiles, puertos, timing y opciones.
- Crea un job en backend.
- Hace polling del job para barra de progreso real.
- Muestra resultados normalizados cuando el backend los devuelve.
- Permite descargar un PDF de resultados al terminar el job.

Nmap expone perfil, tipo de escaneo, modo de puertos, top ports/lista custom, timing, detección de versiones, NSE seguro, OS detect, `-Pn`, traceroute y reintentos.

OpenVAS expone perfil Greenbone, port list y alive test. Si GVM todavía no tiene feeds, socket o credenciales, la pantalla lo muestra como motor pendiente en vez de lanzar una tarea falsa.
Cuando el backend devuelve entidades reales de GVM, la vista respeta los defaults
del servidor para evitar seleccionar por accidente scanners no válidos como `CVE`
en tareas OpenVAS normales.

## Hydra dentro de Vulnerabilidades

Vista:

```text
src/views/vulnerabilidades/BruteForceView.vue
src/components/HydraWorkbench.vue
```

Ruta:

```text
/tool/hydra
```

Endpoints:

| Uso | Endpoint |
| --- | --- |
| Capacidades, servicios y wordlists | `GET /api/bruteforce/hydra/capabilities` |
| Crear ejecución | `POST /api/bruteforce/hydra/runs` |
| Polling de job | `GET /api/bruteforce/hydra/runs/{id}` |
| Historial de usuario | `GET /api/bruteforce/hydra/runs` |

La pantalla permite:

- Seleccionar servicio Hydra, puerto y SSL/TLS.
- Usar usuario único, lista pegada o wordlist del servidor.
- Usar password única, lista pegada, wordlist del servidor o combo `login:password`.
- Configurar `http-post-form`/`http-get-form` con ruta, parámetros y condición `F=`/`S=`.
- Ajustar tareas, timeout, espera, parada al encontrar, loop de usuarios y verbose.
- Ver progreso, comando redaccionado, trazas en vivo, historial y credenciales válidas encontradas.

Las passwords no se muestran en el preview del comando ni en logs; los resultados encontrados se muestran enmascarados hasta que el usuario decide revelarlos.

## Validación y Web dentro de Vulnerabilidades

Vistas:

```text
src/views/vulnerabilidades/NucleiView.vue
src/views/vulnerabilidades/SearchsploitView.vue
src/views/vulnerabilidades/NiktoView.vue
src/views/vulnerabilidades/SqlmapView.vue
src/components/VulnerabilityToolWorkbench.vue
```

Rutas y endpoints:

| Herramienta | Ruta frontend | Endpoint principal |
| --- | --- | --- |
| Nuclei | `/tool/nuclei` | `POST /api/vulnerabilities/nuclei/runs` |
| Searchsploit | `/tool/searchsploit` | `GET/POST /api/vulnerabilities/searchsploit/search` |
| Nikto | `/tool/nikto` | `POST /api/vulnerabilities/nikto/runs` |
| sqlmap | `/tool/sqlmap` | `POST /api/vulnerabilities/sqlmap/runs` |

Endpoints comunes:

| Uso | Endpoint |
| --- | --- |
| Capacidades e inventario | `GET /api/vulnerabilities/capabilities` |
| Historial de Nuclei/Nikto/sqlmap | `GET /api/vulnerabilities/{tool}/runs` |
| Polling de job persistente | `GET /api/vulnerabilities/{tool}/runs/{id}` |

Nuclei, Nikto y sqlmap crean jobs persistentes en el backend. Searchsploit solo consulta la base local de Exploit-DB y no toca el objetivo. El backend bloquea URLs externas si `CALIGO_VULNERABILITIES_ALLOW_EXTERNAL_TARGETS=false`.

## Contraseñas

Vistas:

```text
src/views/contrasenas/JohnView.vue
src/views/contrasenas/HashcatView.vue
src/views/contrasenas/HashIdentifierView.vue
src/views/contrasenas/CrunchView.vue
src/views/contrasenas/CewlView.vue
src/views/contrasenas/WordlistsView.vue
```

Componentes:

```text
src/components/PasswordCrackWorkbench.vue
src/components/HashIdentifierWorkbench.vue
src/components/WordlistGeneratorWorkbench.vue
src/components/WordlistInventory.vue
```

Rutas:

| Herramienta | Ruta frontend | Endpoint principal |
| --- | --- | --- |
| John the Ripper | `/tool/john` | `POST /api/passwords/john/runs` |
| Hashcat | `/tool/hashcat` | `POST /api/passwords/hashcat/runs` |
| Identificador | `/tool/hashid` | `POST /api/passwords/identify` |
| Crunch | `/tool/crunch` | `POST /api/passwords/crunch/generate` |
| CeWL | `/tool/cewl` | `POST /api/passwords/cewl/generate` |
| Wordlists | `/tool/wordlists` | `GET /api/passwords/wordlists` |

Endpoints comunes:

| Uso | Endpoint |
| --- | --- |
| Capacidades, formatos, modos y wordlists | `GET /api/passwords/capabilities` |
| Historial de John/Hashcat/Crunch/CeWL | `GET /api/passwords/{tool}/runs` |
| Polling de job persistente | `GET /api/passwords/{tool}/runs/{id}` |

La pantalla de John permite elegir formato, pegar hashes y usar wordlists del servidor o una lista temporal. Hashcat permite modo de hash, ataque por diccionario o máscara y formato `user:hash`. Crunch genera diccionarios acotados en el servidor. CeWL genera wordlists desde URLs autorizadas por la política del backend. El inventario de wordlists sólo muestra ficheros bajo raíces permitidas.

## Esteganografía

Vistas:

```text
src/views/esteganografia/StegoAnalyzeView.vue
src/views/esteganografia/StegoMetadataAnalyzeView.vue
src/views/esteganografia/StegoMetadataEditorView.vue
src/views/esteganografia/StegoEmbedView.vue
src/views/esteganografia/StegoExtractView.vue
src/components/SteganographyWorkbench.vue
```

Rutas:

| Herramienta | Ruta frontend | Motor |
| --- | --- | --- |
| Caligo Analyze | `/tool/stego-analyze` | Browser local |
| Metadata Analyzer | `/tool/metadata-analyzer` | Browser local |
| Metadata Editor | `/tool/metadata-editor` | Browser local |
| Caligo Embed | `/tool/stego-embed` | Browser local |
| Caligo Extract | `/tool/stego-extract` | Browser local |

El apartado `Metadatos` de la barra lateral contiene analizador y editor. El
analizador lee campos visibles de PNG `tEXt/iTXt/zTXt`, JPEG `COM/APP1`, PDF
Info y nombres de entradas ZIP. El editor escribe metadatos controlados en PNG
`tEXt`, inserta comentarios `COM` en JPEG o genera un sidecar JSON cuando el
formato no es seguro de reescribir desde el navegador.

## Persistencia de ejecuciones

Las herramientas largas no dependen de que la vista siga abierta. El backend guarda los jobs en MariaDB y el frontend recuerda el ultimo id activo por herramienta en `localStorage` usando `src/services/runtimeJobs.js`.

Scopes actuales:

```text
scanner.nmap
scanner.openvas
hydra.run
metasploit.discovery
vulnerabilities.nuclei
vulnerabilities.nikto
vulnerabilities.sqlmap
passwords.john
passwords.hashcat
passwords.crunch
passwords.cewl
caligo.osint.exposure.<tool>
```

Al volver a una vista, Caligo consulta el job recordado y reengancha el polling si sigue en `QUEUED` o `RUNNING`.

Las herramientas OSINT server-side que no son jobs guardan último formulario no sensible y último resultado en `localStorage`; los campos marcados como sensibles, como la contraseña de `Password Exposure`, no se persisten.

### Análisis inteligente de URLs

Ruta frontend:

```text
/tool/caligo-intel
```

Endpoint:

```text
POST /api/urls/intelligent-analysis
```

Une todas las herramientas del apartado en un informe único y simplificado.

### Vistas y endpoints

| Herramienta | Ruta frontend | Endpoint |
| --- | --- | --- |
| Análisis inteligente de URLs | `/tool/caligo-intel` | `POST /api/urls/intelligent-analysis` |
| Resolver DNS | `/tool/dns-resolver` | `POST /api/urls/dns-resolver` |
| Inspector URL | `/tool/url-inspector` | `POST /api/urls/inspector` |
| Seguridad HTTP | `/tool/http-security` | `POST /api/urls/http-security` |
| TLS y certificado | `/tool/tls-certificate` | `POST /api/urls/tls-certificate` |
| Reputación | `/tool/url-reputation` | `POST /api/urls/reputation` |
| Historial público | `/tool/url-history` | `POST /api/urls/history` |
| Archivos públicos | `/tool/url-public-files` | `POST /api/urls/public-files` |
| Endpoints pasivos | `/tool/url-endpoints` | `POST /api/urls/endpoints` |
| Herramientas locales | `/tool/url-local-tools` | `GET /api/urls/local-tools` |

Muestra:

- Score 0-100.
- Veredicto.
- URL normalizada.
- Indicadores de URL sospechosa.
- Query params.
- Status HTTP.
- Redirecciones.
- Cabeceras.
- Cookies.
- Checks de seguridad.
- Certificado TLS.
- Reputación.
- RDAP, crt.sh y Wayback.
- Archivos públicos.
- Endpoints pasivos.
- Herramientas locales detectadas.

### Rangos privados

La opción **Permitir rangos privados para laboratorio local** envía:

```json
{
  "allowPrivateNetworks": true
}
```

Debe activarse sólo para objetivos internos o laboratorios autorizados. Por defecto el backend bloquea loopback, link-local y redes privadas para evitar SSRF.

## Fuentes y herramientas del backend

La vista consume lo que entregue `back-caligo`:

- DNS mediante backend.
- HTTP con backend para evitar CORS del navegador.
- TLS desde el servidor.
- URLHaus.
- urlscan.io.
- VirusTotal si `CALIGO_VIRUSTOTAL_API_KEY` existe.
- AbuseIPDB si `CALIGO_ABUSEIPDB_API_KEY` existe.
- Safe Browsing si `CALIGO_SAFE_BROWSING_API_KEY` existe.
- RDAP.
- crt.sh.
- Wayback Machine.
- Inventario de `curl`, `openssl`, `whois`, `dig`, `nslookup`, `httpx`, `nuclei`, `katana`, `gau`, `subfinder`, `amass`, `ffuf`.

## Comandos

Desarrollo:

```powershell
npm run dev
```

Build:

```powershell
npm run build
```

Preview del build:

```powershell
npm run preview
```

## Verificacion

La verificacion actual del frontend es:

```powershell
npm run build
```

No hay test runner configurado todavía. El build de Vite es la comprobación principal.

## Notas de seguridad

- El frontend no ejecuta herramientas ofensivas directamente.
- Todas las llamadas de URLs pasan por backend con JWT.
- Las API keys nunca deben vivir en Vue; se configuran en el backend.
- La ejecución futura de herramientas activas debe ir por jobs, permisos, rate limit y auditoría.
- No se debe versionar `.env`, tokens, claves ni resultados sensibles.
