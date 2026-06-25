# Repository Guidelines

## Project Structure & Module Organization

This is the Vue 3 frontend for Caligo. It is a Vite app using Vue Router and
Vuex. Route-level screens live in `src/views`; shared interface pieces live in
`src/components`; global state starts in `src/store`; routes are defined in
`src/router`; static media and global CSS live under `src/assets`.

The current first screen is the login view, which also exposes a portfolio/demo
entry with real tools blocked until JWT login. The home view contains the fixed
header and Caligo ASCII/terminal-style presentation area. Keep visual assets in
`src/assets/images` and global styling in the imported files under
`src/assets/styles`.

## Shared Caligo Context

The paired backend lives at `C:\Users\Jarva\Desktop\git-repos\back-caligo`.
Remotes are `https://github.com/jarvanxii/front-caligo.git` and
`https://github.com/jarvanxii/back-caligo.git`. The assigned LAN host is
Servidor 2, `192.168.0.253`, with frontend files expected under
`/var/www/caligo/front` and backend files under `/var/www/caligo/back`.
Caligo coexists there with Thorondor and Iberia 2084; do not use Servidor 1
de La Pipa de Gandalf unless the user explicitly asks.

Operational credentials stay outside Git in
`C:\Users\Jarva\Desktop\OPERACION AGENTICA.md`, section `SERVIDOR 2`. This
document is consult-only: use it for authorized operations, but never edit it,
print secrets, copy them into a repo or paste them into responses.

## Build, Test, and Development Commands

Use `npm install` for first setup.

```powershell
npm run dev
npm run serve
npm run build
npm run preview
```

`dev` and `serve` both start Vite on `0.0.0.0`. `build` creates the production
bundle in `dist/`. There is no test script in `package.json`; use
`npm run build` as the current verification command.

## Coding Style & Naming Conventions

Components use Vue single-file components with PascalCase filenames such as
`AppHeader.vue` and `LoginView.vue`. Keep route views under `src/views` and
small reusable UI under `src/components`. The project currently has no ESLint or
Prettier config, so match the existing SFC formatting and keep CSS in the
existing global stylesheet unless a component already owns scoped styles.

## Agent Instructions

Do not commit generated `dist/`, `node_modules/`, local Vite logs, `.env` files,
or `backups/`. Keep the interface dark, modern and operational rather than
marketing-oriented. Header modules are driven by `src/data/modulePages.js`:
`osint`, `scan`, `xploit`, `network`, `coding` and `tools`, with legacy redirects
kept in `src/router/index.js`; keep labels and API wiring aligned with backend
module and tool codes.

Frontend work is normally tested locally with Vite. Do not deploy this frontend
unless the user explicitly asks for a frontend deploy. When backend behavior is
changed from the paired `back-caligo` repository, the backend should be
committed, pushed and deployed to the LAN server so this local frontend can test
against a live API.

Do not commit `.env.local`; use it only for the local API target. Before changing
the LAN API host, check the intended Caligo server IP because previous project
context has used `192.168.0.253`, while the operation document maps
`192.168.0.254` to another application server.

The browser must not execute offensive tools directly. Route active or sensitive
operations through JWT-protected backend jobs with authorized scope, server-side
limits, audit trail and redacted logs.

## Commit & Pull Request Guidelines

Recent history uses short Spanish descriptive commits such as `Integra vistas
OSINT`, `Corrige textos y guia visual de Caligo` and `Limpia vistas pendientes
de Caligo`. Keep frontend changes separate from `back-caligo`.
