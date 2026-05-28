# Repository Guidelines

## Project Structure & Module Organization

This is the Vue 3 frontend for Caligo. It is a Vite app using Vue Router and
Vuex. Route-level screens live in `src/views`; shared interface pieces live in
`src/components`; global state starts in `src/store`; routes are defined in
`src/router`; static media and global CSS live under `src/assets`.

The current first screen is the login view. The home view contains the fixed
header and Caligo ASCII/terminal-style presentation area. Keep visual assets in
`src/assets/images` and global styling in `src/assets/styles/main.css`.

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
marketing-oriented. Header modules currently map to OpenVAS, Metasploit, URLs,
Contraseñas and Esteganografía; keep naming aligned with the backend module
codes when wiring API data.

Frontend work is normally tested locally with Vite. Do not deploy this frontend
unless the user explicitly asks for a frontend deploy. When backend behavior is
changed from the paired `back-caligo` repository, the backend should be
committed, pushed and deployed to the LAN server so this local frontend can test
against a live API.

Do not commit `.env.local`; use it only for the local API target. Before changing
the LAN API host, check the intended Caligo server IP because previous project
context has used `192.168.0.253`, while the credentials file maps
`192.168.0.254` to another application server.

## Commit & Pull Request Guidelines

This repo has no commit history yet. Use short Spanish descriptive commits and
keep frontend changes separate from `back-caligo`.
