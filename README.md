# Caligo Frontend

Frontend Vue 3 de Caligo. La aplicacion funciona como cabina de mando para los modulos de ciberseguridad y se conecta al backend Spring local mediante JWT.

Los modulos mas avanzados ahora mismo estan en **Reconocimiento**, **Vulnerabilidades**, **Contrasenas** y **Redes / Utilidades**. Reconocimiento agrupa Caligo Intel, Nmap y OpenVAS. Vulnerabilidades agrupa Metasploit, Hydra, Nuclei, Searchsploit, Nikto y sqlmap contra el backend Spring. Contrasenas integra John the Ripper, Hashcat, hashID, Crunch, CeWL e inventario de wordlists del servidor. Redes / Utilidades integra WHOAMI e interfaz VPN del servidor.

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
      VulnerabilityToolWorkbench.vue
      WordlistGeneratorWorkbench.vue
      WordlistInventory.vue
    data/
      modulePages.js
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
      ReconnaissanceView.vue
      OsintView.vue
      VulnerabilitiesView.vue
      UrlsView.vue
      OpenvasView.vue
      MetasploitView.vue
      BruteForceView.vue
      PasswordsView.vue
      vulnerabilities/
        NucleiView.vue
        SearchsploitView.vue
        NiktoView.vue
        SqlmapView.vue
      passwords/
        JohnView.vue
        HashcatView.vue
        HashIdentifierView.vue
        CrunchView.vue
        CewlView.vue
        WordlistsView.vue
      EncodingView.vue
      SteganographyView.vue
      network/
        WhoamiView.vue
        VpnsView.vue
```

## Ejecucion local

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

El login pide usuario y contraseña contra `/api/auth/login`. No hay acceso silencioso ni credenciales por defecto desde el frontend.

En el entorno del servidor 2 existe el usuario bootstrap operativo `Gandalf`; la contraseña no se versiona y su valor en MariaDB se guarda como BCrypt.

El JWT se guarda en `localStorage`:

- `caligo.jwt`
- `caligo.user`

Las peticiones protegidas se envian con:

```text
Authorization: Bearer <token>
```

## Modulos del header

Orden actual:

1. Reconocimiento
2. OSINT
3. Vulnerabilidades
4. Contraseñas
5. Codificacion
6. Esteganografia
7. Redes / Utilidades

`Home` no muestra barra lateral. El resto de vistas muestran una barra lateral contextual con herramientas utiles, sin entrada de resumen o panoramica. La barra lateral soporta secciones desplegables mediante `sidebarSections` en `src/data/modulePages.js`, manteniendo `utilities` como lista plana para las tarjetas internas del modulo.

Las herramientas de `URLs`, `Nmap` y `OpenVAS` cuelgan de `Reconocimiento`; `Metasploit`, `Hydra`, `Nuclei`, `Searchsploit`, `Nikto` y `sqlmap` cuelgan de `Vulnerabilidades`; `WHOAMI` y `VPNs` cuelgan de `Redes / Utilidades`. En `Reconocimiento`, `URLs` queda como `Caligo Intel` para evitar duplicar las herramientas que ya ejecuta el analisis inteligente.

El header muestra, junto a la ruleta de ajustes, dos lecturas de identidad:

- `IP SERVIDOR`: IP publica de salida del backend Caligo, leida desde `/api/network/identity`.
- `IP CLIENTE`: IP publica del navegador si `api.ipify.org` responde; si no, se mantiene la IP observada por el backend.

La lectura se refresca al cargar, cada 30 segundos y cuando la vista de VPN emite cambios de tunel.

## Ajustes y actualizaciones

La ruleta del header abre el menu de ajustes. La opcion **Actualizaciones**
muestra un modal con el inventario de herramientas del servidor, su version
actual y un boton de actualizacion por herramienta.

Endpoints usados:

| Uso | Endpoint |
| --- | --- |
| Inventario versionado | `GET /api/system/tools` |
| Actualizar herramienta | `POST /api/system/tools/{id}/update` |

El inventario incluye tambien herramientas de red/VPN cuando el backend las detecta: `wireguard`, `openvpn` y `resolvconf`.

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

Las vistas URL individuales siguen existiendo como piezas internas, pero no se muestran en la barra lateral porque `Caligo Intel` ya une DNS, parser, HTTP, TLS, reputacion, historial, archivos publicos, endpoints y herramientas locales.

## Redes / Utilidades

Vistas:

```text
src/views/network/WhoamiView.vue
src/views/network/VpnsView.vue
src/components/IdentityWorkbench.vue
src/components/VpnWorkbench.vue
```

Rutas:

| Vista | Ruta |
| --- | --- |
| WHOAMI | `/redes-utilidades/identidad/whoami` |
| VPNs | `/redes-utilidades/identidad/vpns` |

`WHOAMI` adapta la utilidad de **La Identidad de Gollum** al estilo Caligo:
navegador, sistema, permisos, storage, cookies, scripts, WebGL, media devices,
geolocalizacion opcional, IP publica del navegador, IP observada por el backend,
IP publica del servidor y estado VPN.

`VPNs` lee perfiles WireGuard/OpenVPN del servidor, permite elegir perfil por
proveedor/pais/ciudad si los metadatos existen, conecta/desconecta mediante el
backend y refresca automaticamente las IPs del header al cambiar el tunel.

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

Nmap expone perfil, tipo de escaneo, modo de puertos, top ports/lista custom, timing, deteccion de versiones, NSE seguro, OS detect, `-Pn`, traceroute y reintentos.

OpenVAS expone perfil Greenbone, port list y alive test. Si GVM todavia no tiene feeds, socket o credenciales, la pantalla lo muestra como motor pendiente en vez de lanzar una tarea falsa.
Cuando el backend devuelve entidades reales de GVM, la vista respeta los defaults
del servidor para evitar seleccionar por accidente scanners no validos como `CVE`
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
| Crear ejecucion | `POST /api/bruteforce/hydra/runs` |
| Polling de job | `GET /api/bruteforce/hydra/runs/{id}` |
| Historial de usuario | `GET /api/bruteforce/hydra/runs` |

La pantalla permite:

- Seleccionar servicio Hydra, puerto y SSL/TLS.
- Usar usuario unico, lista pegada o wordlist del servidor.
- Usar password unica, lista pegada, wordlist del servidor o combo `login:password`.
- Configurar `http-post-form`/`http-get-form` con ruta, parametros y condicion `F=`/`S=`.
- Ajustar tareas, timeout, espera, parada al encontrar, loop de usuarios y verbose.
- Ver progreso, comando redaccionado, trazas en vivo, historial y credenciales validas encontradas.

Las passwords no se muestran en el preview del comando ni en logs; los resultados encontrados se muestran enmascarados hasta que el usuario decide revelarlos.

## Validacion y Web dentro de Vulnerabilidades

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

## Contrasenas

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

La pantalla de John permite elegir formato, pegar hashes y usar wordlists del servidor o una lista temporal. Hashcat permite modo de hash, ataque por diccionario o mascara y formato `user:hash`. Crunch genera diccionarios acotados en el servidor. CeWL genera wordlists desde URLs autorizadas por la politica del backend. El inventario de wordlists solo muestra ficheros bajo raices permitidas.

## Esteganografia

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
```

Al volver a una vista, Caligo consulta el job recordado y reengancha el polling si sigue en `QUEUED` o `RUNNING`.

### Analisis inteligente de URLs

Ruta frontend:

```text
/urls
```

Endpoint:

```text
POST /api/urls/intelligent-analysis
```

Une todas las herramientas del apartado en un informe unico y simplificado.

### Vistas y endpoints

| Herramienta | Ruta frontend | Endpoint |
| --- | --- | --- |
| Analisis inteligente de URLs | `/urls` | `POST /api/urls/intelligent-analysis` |
| Resolver DNS | `/urls/resolver-dns` | `POST /api/urls/dns-resolver` |
| Inspector URL | `/urls/inspector` | `POST /api/urls/inspector` |
| Seguridad HTTP | `/urls/seguridad-http` | `POST /api/urls/http-security` |
| TLS y certificado | `/urls/tls` | `POST /api/urls/tls-certificate` |
| Reputacion | `/urls/reputacion` | `POST /api/urls/reputation` |
| Historial publico | `/urls/historial` | `POST /api/urls/history` |
| Archivos publicos | `/urls/archivos-publicos` | `POST /api/urls/public-files` |
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
- Reputacion.
- RDAP, crt.sh y Wayback.
- Archivos publicos.
- Endpoints pasivos.
- Herramientas locales detectadas.

### Rangos privados

La opcion **Permitir rangos privados para laboratorio local** envia:

```json
{
  "allowPrivateNetworks": true
}
```

Debe activarse solo para objetivos internos o laboratorios autorizados. Por defecto el backend bloquea loopback, link-local y redes privadas para evitar SSRF.

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

No hay test runner configurado todavia. El build de Vite es la comprobacion principal.

## Notas de seguridad

- El frontend no ejecuta herramientas ofensivas directamente.
- Todas las llamadas de URLs pasan por backend con JWT.
- Las API keys nunca deben vivir en Vue; se configuran en el backend.
- La ejecucion futura de herramientas activas debe ir por jobs, permisos, rate limit y auditoria.
- No se debe versionar `.env`, tokens, claves ni resultados sensibles.
