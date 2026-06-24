# Caligo Frontend

Frontend Vue 3 de Caligo. La aplicaciÃ³n funciona como cabina de mando para los mÃ³dulos de ciberseguridad y se conecta al backend Spring local mediante JWT.

Los mÃ³dulos mÃ¡s avanzados ahora mismo estÃ¡n en **Reconocimiento**, **OSINT**, **Vulnerabilidades**, **ContraseÃ±as**, **Redes** y **Utilidades**. Reconocimiento agrupa Caligo Intel, Nmap, OpenVAS y reconocimiento web/TLS. OSINT integra Caligo People, Sherlock, Maigret, Social Analyzer, Holehe, theHarvester, git-dumper y utilidades de exposiciÃ³n autorizada para contacto, brechas y documentos pÃºblicos contra endpoints JWT. Vulnerabilidades agrupa Metasploit, Hydra, Nuclei, Searchsploit, Nikto, sqlmap, Medusa/Ncrack y laboratorios AD/Cloud. ContraseÃ±as integra John the Ripper, Hashcat, hashID, Crunch, CeWL e inventario de wordlists del servidor. Redes queda para VPNs, captura, trÃ¡fico, pivoting, WiFi y Bluetooth; Utilidades queda para identidad local/servidor, conectividad bÃ¡sica y sockets.

## Stack

- Vue 3.
- Vite.
- Vue Router.
- Vuex.
- CSS global en `src/assets/styles/main.css`.
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
      styles/main.css
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

## EjecuciÃ³n local

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
| `VITE_CALIGO_API_BASE_URL` | `http://192.168.0.253:8080` | URL base del backend Spring. |

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

## Login local

El login pide usuario y contraseÃ±a contra `/api/auth/login`. No hay acceso silencioso ni credenciales por defecto desde el frontend.

En el entorno del servidor 2 existe el usuario bootstrap operativo `Gandalf`; la contraseÃ±a no se versiona y su valor en MariaDB se guarda como BCrypt.

El JWT se guarda en `localStorage`:

- `caligo.jwt`
- `caligo.user`

Las peticiones protegidas se envÃ­an con:

```text
Authorization: Bearer <token>
```

## MÃ³dulos del header

Orden actual:

1. Reconocimiento
2. OSINT
3. Vulnerabilidades
4. ContraseÃ±as
5. CodificaciÃ³n
6. EsteganografÃ­a
7. Redes
8. Utilidades
9. Reversing

`Home` no muestra barra lateral. El resto de vistas muestran una barra lateral contextual con herramientas Ãºtiles, sin entrada de resumen o panorÃ¡mica. La barra lateral soporta secciones desplegables mediante `sidebarSections` en `src/data/modulePages.js`, manteniendo `utilities` como lista plana para las tarjetas internas del mÃ³dulo.

Las herramientas de `URLs`, `Nmap`, `OpenVAS` y `testssl.sh` cuelgan de `Reconocimiento`; `Caligo People`, `Sherlock`, `Maigret`, `Social Analyzer`, `Holehe`, `theHarvester`, `Email Exposure`, `Phone Lookup`, `Domain Contacts`, `Password Exposure`, `Metadata Exposure`, `Public Files` y `git-dumper` cuelgan de `OSINT`; `Metasploit`, `Hydra`, `Nuclei`, `Searchsploit`, `Nikto`, `sqlmap`, `Medusa`, `Ncrack`, `Impacket`, `NetExec`, `BloodHound`, `Certipy`, `Kerbrute` y `enum4linux-ng` cuelgan de `Vulnerabilidades`; `WireGuard`, `OpenVPN`, captura de trÃ¡fico, pivoting, proxies, WiFi y Bluetooth cuelgan de `Redes`; `WHOAMI`, `Ping`, `Traceroute`, `MTR`, `Netcat` y `Socat` cuelgan de `Utilidades`. En `Reconocimiento`, `URLs` queda como `Caligo Intel` para evitar duplicar las herramientas que ya ejecuta el anÃ¡lisis inteligente.

El header muestra, junto a la ruleta de ajustes, dos lecturas de identidad:

- `IP SERVIDOR`: IP pÃºblica de salida del backend Caligo, leÃ­da desde `/api/network/identity`.
- `IP CLIENTE`: IP pÃºblica del navegador si `api.ipify.org` responde; si no, se mantiene la IP observada por el backend.

La lectura se refresca al cargar, cada 30 segundos y cuando la vista de VPN emite cambios de tÃºnel.

## Ajustes y actualizaciones

La ruleta del header abre el menÃº de ajustes. La opciÃ³n **Actualizaciones**
muestra un modal con el inventario de herramientas del servidor, su versiÃ³n
actual y un botÃ³n de actualizaciÃ³n por herramienta.

Endpoints usados:

| Uso | Endpoint |
| --- | --- |
| Inventario versionado | `GET /api/system/tools` |
| Actualizar herramienta | `POST /api/system/tools/{id}/update` |

El inventario incluye tambiÃ©n herramientas de red/VPN cuando el backend las detecta: `wireguard`, `openvpn` y `resolvconf`.

Las actualizaciones se ejecutan en el backend con una allowlist cerrada y
requieren usuario `ADMIN`. Si el servidor no tiene permisos `sudo -n` para el
mantenimiento de paquetes, el modal mostrara el fallo devuelto por el backend.

## URLs dentro de Reconocimiento

Vista principal agregada:

```text
src/views/UrlsView.vue
```

Vistas por herramienta:

```text
src/views/urls/UrlDnsResolverView.vue
src/views/urls/UrlInspectorView.vue
src/views/urls/UrlHttpSecurityView.vue
src/views/urls/UrlTlsView.vue
src/views/urls/UrlReputationView.vue
src/views/urls/UrlHistoryView.vue
src/views/urls/UrlPublicFilesView.vue
src/views/urls/UrlEndpointsView.vue
src/views/urls/UrlLocalToolsView.vue
```

Servicio API:

```text
src/services/caligoApi.js
```

Utilidades visibles dentro del desplegable `URLs` de la barra lateral de Reconocimiento:

- Caligo Intel

Las vistas URL individuales siguen existiendo como piezas internas, pero no se muestran en la barra lateral porque `Caligo Intel` ya une DNS, parser, HTTP, TLS, reputaciÃ³n, historial, archivos pÃºblicos, endpoints y herramientas locales.

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
| Caligo People | `/osint/personas` |
| Sherlock | `/osint/sherlock` |
| Maigret | `/osint/maigret` |
| Social Analyzer | `/osint/social-analyzer` |
| Holehe | `/osint/holehe` |
| theHarvester | `/osint/theharvester` |
| Email Exposure | `/osint/contacto/email-exposure` |
| Phone Lookup | `/osint/contacto/phone-lookup` |
| Domain Contacts | `/osint/contacto/domain-contacts` |
| Password Exposure | `/osint/brechas/password` |
| Metadata Exposure | `/osint/documentos/metadatos` |
| Public Files | `/osint/documentos/archivos-publicos` |
| git-dumper | `/tool/git-dumper` |
| SpiderFoot | `/tool/spiderfoot` |
| TruffleHog | `/tool/trufflehog` |

`Caligo People` acepta nombre real, pista opcional y plataformas para devolver candidatos pÃºblicos de LinkedIn y redes sociales. `Email Exposure`, `Domain Contacts`, `git-dumper`, `SpiderFoot` y `TruffleHog` tienen interfaz propia, no workbench genÃ©rico: cada una muestra controles, presets, salida y mÃ©tricas adaptadas a su funciÃ³n. Las herramientas CLI se ejecutan en el servidor y usan jobs persistentes: puedes cambiar de vista y volver a la herramienta para recuperar progreso, logs y resultados.

Las herramientas de exposiciÃ³n autorizada usan `OsintExposureWorkbench`: cada vista tiene formulario propio, confirmaciÃ³n de alcance, salida persistente en `localStorage` y render de hallazgos, recursos, consultas y recomendaciones. No estÃ¡n diseÃ±adas para descubrir datos privados de terceros: trabajan con datos aportados por el usuario, dominios autorizados o comprobaciones defensivas de exposiciÃ³n.

Endpoints usados:

| Uso | Endpoint |
| --- | --- |
| Inventario OSINT | `GET /api/osint/capabilities` |
| BÃºsqueda por nombre | `POST /api/osint/profile-search/search` |
| Sherlock | `POST /api/osint/sherlock/runs` |
| Maigret | `POST /api/osint/maigret/runs` |
| Social Analyzer | `POST /api/osint/social-analyzer/runs` |
| Holehe | `POST /api/osint/holehe/runs` |
| theHarvester | `POST /api/osint/theharvester/runs` |
| git-dumper | `POST /api/osint/git-dumper/runs` |
| SpiderFoot | `POST /api/osint/spiderfoot/runs` |
| TruffleHog | `POST /api/osint/trufflehog/runs` |
| Estado job | `GET /api/osint/{tool}/runs/{id}` |
| Capacidades de exposiciÃ³n | `GET /api/osint/exposure/capabilities` |
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
| Redes | `/redes` |
| WireGuard | `/redes/vpns/wireguard` |
| OpenVPN | `/redes/vpns/openvpn` |

`Redes` concentra operativa de salida y trÃ¡fico: VPNs, captura, anÃ¡lisis PCAP,
proxies, pivoting, WiFi y Bluetooth. `VPNs` lee perfiles WireGuard/OpenVPN del servidor, permite elegir perfil por
proveedor/paÃ­s/ciudad si los metadatos existen, conecta/desconecta mediante el
backend y refresca automÃ¡ticamente las IPs del header al cambiar el tÃºnel.

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
| Utilidades | `/utilidades` |
| WHOAMI Local | `/utilidades/identidad/whoami-local` |
| WHOAMI Server | `/utilidades/identidad/whoami-server` |

`WHOAMI` adapta la utilidad de **La Identidad de Gollum** al estilo Caligo y queda separada en dos lecturas: la local mide navegador, pantalla, permisos, storage, cookies, WebGL, media devices e IP pÃºblica del cliente; la de servidor mide IP pÃºblica del backend, interfaces, cabeceras observadas, sistema y estado VPN. Las utilidades de conectividad (`Ping`, `Traceroute`, `MTR`, `Netcat`, `Socat`) se mantienen como vistas de catÃ¡logo hasta conectar endpoints especÃ­ficos.

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
src/views/NmapView.vue
src/views/OpenvasView.vue
src/components/ScannerWorkbench.vue
```

Endpoints:

| Herramienta | Ruta frontend | Endpoint capacidades | Endpoint job |
| --- | --- | --- | --- |
| Nmap | `/nmap` | `GET /api/recon/nmap/capabilities` | `POST /api/recon/nmap/scans`, `GET /api/recon/nmap/scans/{id}` y `GET /api/recon/nmap/scans/{id}/report.pdf` |
| OpenVAS | `/openvas` | `GET /api/recon/openvas/capabilities` | `POST /api/recon/openvas/scans`, `GET /api/recon/openvas/scans/{id}` y `GET /api/recon/openvas/scans/{id}/report.pdf` |

La vista no ejecuta herramientas en navegador. Siempre:

- Garantiza JWT con el login local.
- Consulta capacidades del backend.
- Permite parametrizar perfiles, puertos, timing y opciones.
- Crea un job en backend.
- Hace polling del job para barra de progreso real.
- Muestra resultados normalizados cuando el backend los devuelve.
- Permite descargar un PDF de resultados al terminar el job.

Nmap expone perfil, tipo de escaneo, modo de puertos, top ports/lista custom, timing, detecciÃ³n de versiones, NSE seguro, OS detect, `-Pn`, traceroute y reintentos.

OpenVAS expone perfil Greenbone, port list y alive test. Si GVM todavÃ­a no tiene feeds, socket o credenciales, la pantalla lo muestra como motor pendiente en vez de lanzar una tarea falsa.
Cuando el backend devuelve entidades reales de GVM, la vista respeta los defaults
del servidor para evitar seleccionar por accidente scanners no vÃ¡lidos como `CVE`
en tareas OpenVAS normales.

## Hydra dentro de Vulnerabilidades

Vista:

```text
src/views/BruteForceView.vue
src/components/HydraWorkbench.vue
```

Ruta:

```text
/fuerza-bruta
```

Endpoints:

| Uso | Endpoint |
| --- | --- |
| Capacidades, servicios y wordlists | `GET /api/bruteforce/hydra/capabilities` |
| Crear ejecuciÃ³n | `POST /api/bruteforce/hydra/runs` |
| Polling de job | `GET /api/bruteforce/hydra/runs/{id}` |
| Historial de usuario | `GET /api/bruteforce/hydra/runs` |

La pantalla permite:

- Seleccionar servicio Hydra, puerto y SSL/TLS.
- Usar usuario Ãºnico, lista pegada o wordlist del servidor.
- Usar password Ãºnica, lista pegada, wordlist del servidor o combo `login:password`.
- Configurar `http-post-form`/`http-get-form` con ruta, parÃ¡metros y condiciÃ³n `F=`/`S=`.
- Ajustar tareas, timeout, espera, parada al encontrar, loop de usuarios y verbose.
- Ver progreso, comando redaccionado, trazas en vivo, historial y credenciales vÃ¡lidas encontradas.

Las passwords no se muestran en el preview del comando ni en logs; los resultados encontrados se muestran enmascarados hasta que el usuario decide revelarlos.

## ValidaciÃ³n y Web dentro de Vulnerabilidades

Vistas:

```text
src/views/vulnerabilities/NucleiView.vue
src/views/vulnerabilities/SearchsploitView.vue
src/views/vulnerabilities/NiktoView.vue
src/views/vulnerabilities/SqlmapView.vue
src/components/VulnerabilityToolWorkbench.vue
```

Rutas y endpoints:

| Herramienta | Ruta frontend | Endpoint principal |
| --- | --- | --- |
| Nuclei | `/vulnerabilidades/nuclei` | `POST /api/vulnerabilities/nuclei/runs` |
| Searchsploit | `/vulnerabilidades/searchsploit` | `GET/POST /api/vulnerabilities/searchsploit/search` |
| Nikto | `/vulnerabilidades/nikto` | `POST /api/vulnerabilities/nikto/runs` |
| sqlmap | `/vulnerabilidades/sqlmap` | `POST /api/vulnerabilities/sqlmap/runs` |

Endpoints comunes:

| Uso | Endpoint |
| --- | --- |
| Capacidades e inventario | `GET /api/vulnerabilities/capabilities` |
| Historial de Nuclei/Nikto/sqlmap | `GET /api/vulnerabilities/{tool}/runs` |
| Polling de job persistente | `GET /api/vulnerabilities/{tool}/runs/{id}` |

Nuclei, Nikto y sqlmap crean jobs persistentes en el backend. Searchsploit solo consulta la base local de Exploit-DB y no toca el objetivo. El backend bloquea URLs externas si `CALIGO_VULNERABILITIES_ALLOW_EXTERNAL_TARGETS=false`.

## ContraseÃ±as

Vistas:

```text
src/views/passwords/JohnView.vue
src/views/passwords/HashcatView.vue
src/views/passwords/HashIdentifierView.vue
src/views/passwords/CrunchView.vue
src/views/passwords/CewlView.vue
src/views/passwords/WordlistsView.vue
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
| John the Ripper | `/contrasenas/john` | `POST /api/passwords/john/runs` |
| Hashcat | `/contrasenas/hashcat` | `POST /api/passwords/hashcat/runs` |
| Identificador | `/contrasenas/identificador` | `POST /api/passwords/identify` |
| Crunch | `/contrasenas/crunch` | `POST /api/passwords/crunch/generate` |
| CeWL | `/contrasenas/cewl` | `POST /api/passwords/cewl/generate` |
| Wordlists | `/contrasenas/wordlists` | `GET /api/passwords/wordlists` |

Endpoints comunes:

| Uso | Endpoint |
| --- | --- |
| Capacidades, formatos, modos y wordlists | `GET /api/passwords/capabilities` |
| Historial de John/Hashcat/Crunch/CeWL | `GET /api/passwords/{tool}/runs` |
| Polling de job persistente | `GET /api/passwords/{tool}/runs/{id}` |

La pantalla de John permite elegir formato, pegar hashes y usar wordlists del servidor o una lista temporal. Hashcat permite modo de hash, ataque por diccionario o mÃ¡scara y formato `user:hash`. Crunch genera diccionarios acotados en el servidor. CeWL genera wordlists desde URLs autorizadas por la polÃ­tica del backend. El inventario de wordlists sÃ³lo muestra ficheros bajo raÃ­ces permitidas.

## EsteganografÃ­a

Vistas:

```text
src/views/steganography/StegoAnalyzeView.vue
src/views/steganography/StegoMetadataAnalyzeView.vue
src/views/steganography/StegoMetadataEditorView.vue
src/views/steganography/StegoEmbedView.vue
src/views/steganography/StegoExtractView.vue
src/components/SteganographyWorkbench.vue
```

Rutas:

| Herramienta | Ruta frontend | Motor |
| --- | --- | --- |
| Caligo Analyze | `/esteganografia/analizador` | Browser local |
| Metadata Analyzer | `/esteganografia/metadatos/analizador` | Browser local |
| Metadata Editor | `/esteganografia/metadatos/editor` | Browser local |
| Caligo Embed | `/esteganografia/incrustar` | Browser local |
| Caligo Extract | `/esteganografia/extraer` | Browser local |

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

Las herramientas OSINT server-side que no son jobs guardan Ãºltimo formulario no sensible y Ãºltimo resultado en `localStorage`; los campos marcados como sensibles, como la contraseÃ±a de `Password Exposure`, no se persisten.

### AnÃ¡lisis inteligente de URLs

Ruta frontend:

```text
/urls
```

Endpoint:

```text
POST /api/urls/intelligent-analysis
```

Une todas las herramientas del apartado en un informe Ãºnico y simplificado.

### Vistas y endpoints

| Herramienta | Ruta frontend | Endpoint |
| --- | --- | --- |
| AnÃ¡lisis inteligente de URLs | `/urls` | `POST /api/urls/intelligent-analysis` |
| Resolver DNS | `/urls/resolver-dns` | `POST /api/urls/dns-resolver` |
| Inspector URL | `/urls/inspector` | `POST /api/urls/inspector` |
| Seguridad HTTP | `/urls/seguridad-http` | `POST /api/urls/http-security` |
| TLS y certificado | `/urls/tls` | `POST /api/urls/tls-certificate` |
| ReputaciÃ³n | `/urls/reputacion` | `POST /api/urls/reputation` |
| Historial pÃºblico | `/urls/historial` | `POST /api/urls/history` |
| Archivos pÃºblicos | `/urls/archivos-publicos` | `POST /api/urls/public-files` |
| Endpoints pasivos | `/urls/endpoints` | `POST /api/urls/endpoints` |
| Herramientas locales | `/urls/herramientas-locales` | `GET /api/urls/local-tools` |

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
- ReputaciÃ³n.
- RDAP, crt.sh y Wayback.
- Archivos pÃºblicos.
- Endpoints pasivos.
- Herramientas locales detectadas.

### Rangos privados

La opciÃ³n **Permitir rangos privados para laboratorio local** envÃ­a:

```json
{
  "allowPrivateNetworks": true
}
```

Debe activarse sÃ³lo para objetivos internos o laboratorios autorizados. Por defecto el backend bloquea loopback, link-local y redes privadas para evitar SSRF.

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

No hay test runner configurado todavÃ­a. El build de Vite es la comprobaciÃ³n principal.

## Notas de seguridad

- El frontend no ejecuta herramientas ofensivas directamente.
- Todas las llamadas de URLs pasan por backend con JWT.
- Las API keys nunca deben vivir en Vue; se configuran en el backend.
- La ejecuciÃ³n futura de herramientas activas debe ir por jobs, permisos, rate limit y auditorÃ­a.
- No se debe versionar `.env`, tokens, claves ni resultados sensibles.
