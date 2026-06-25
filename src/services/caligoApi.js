const API_BASE_URL = (import.meta.env.VITE_CALIGO_API_BASE_URL || "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 12000;
const TOKEN_KEY = "caligo.jwt";
const USER_KEY = "caligo.user";
const ACCESS_MODE_KEY = "caligo.accessMode";

const PORTFOLIO_USER = {
  username: "Portfolio",
  displayName: "Acceso sin usuario",
  role: "portfolio",
};

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredAccessMode() {
  return localStorage.getItem(ACCESS_MODE_KEY) || (getStoredToken() ? "authenticated" : "");
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeSession(session) {
  if (!session?.accessToken) return;
  localStorage.setItem(ACCESS_MODE_KEY, "authenticated");
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user || null));
}

export function storePortfolioSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.setItem(ACCESS_MODE_KEY, "portfolio");
  localStorage.setItem(USER_KEY, JSON.stringify(PORTFOLIO_USER));
  return {
    accessMode: "portfolio",
    accessToken: null,
    user: PORTFOLIO_USER,
  };
}

export function clearSession() {
  localStorage.removeItem(ACCESS_MODE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isPortfolioSession() {
  return getStoredAccessMode() === "portfolio";
}

function assertOperationalAccess() {
  if (isPortfolioSession()) {
    throw new Error("Modo portfolio activo: las herramientas reales están bloqueadas hasta iniciar sesión con credenciales.");
  }
}

function parsePayload(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function requestJson(path, options = {}, { includeAuth = true, requireOperationalAccess = true } = {}) {
  if (requireOperationalAccess) {
    assertOperationalAccess();
  }
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  const token = includeAuth ? getStoredToken() : "";
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    throw new Error(timedOut ? "El backend de Caligo no respondió a tiempo" : "No se pudo conectar con el backend de Caligo");
  } finally {
    window.clearTimeout(timeout);
  }

  const text = await response.text();
  const payload = parsePayload(text);
  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText || "Error de API";
    throw new Error(message);
  }
  return payload;
}

export async function apiRequest(path, options = {}) {
  return requestJson(path, options);
}

export async function downloadApiFile(path, filename) {
  assertOperationalAccess();
  const headers = {
    Accept: "application/pdf",
  };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }
    const message = payload?.message || payload?.error || response.statusText || "No se pudo descargar el informe";
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function login(username, password) {
  const session = await requestJson(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    { includeAuth: false, requireOperationalAccess: false },
  );
  storeSession(session);
  return session;
}

export async function ensureLocalSession() {
  assertOperationalAccess();
  if (getStoredToken()) {
    return {
      accessToken: getStoredToken(),
      user: getStoredUser(),
    };
  }
  throw new Error("Sesión no iniciada");
}

export const caligoApi = {
  baseUrl: API_BASE_URL,
  login,
  ensureLocalSession,
  request: apiRequest,
  download: downloadApiFile,
  clearSession,
  getStoredAccessMode,
  getStoredToken,
  getStoredUser,
  isPortfolioSession,
  storePortfolioSession,
};
