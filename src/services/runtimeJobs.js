const PREFIX = "caligo.runtime.job.";
const RUNNING_STATUSES = new Set(["QUEUED", "RUNNING"]);

function storageKey(scope) {
  return `${PREFIX}${scope}`;
}

export function isRuntimeJobRunning(job) {
  return RUNNING_STATUSES.has(String(job?.status || "").toUpperCase());
}

export function rememberRuntimeJob(scope, id) {
  if (!scope || !id) return;
  localStorage.setItem(storageKey(scope), String(id));
}

export function rememberedRuntimeJob(scope) {
  return localStorage.getItem(storageKey(scope)) || "";
}

export function forgetRuntimeJob(scope) {
  localStorage.removeItem(storageKey(scope));
}
