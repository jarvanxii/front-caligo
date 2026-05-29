const API_BASE_URL = import.meta.env.VITE_CALIGO_API_BASE_URL || "http://192.168.0.253:8080";
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

export async function apiRequest(path, options = {}) {
  assertOperationalAccess();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText || "Error de API";
    throw new Error(message);
  }
  return payload;
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
  const session = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
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
