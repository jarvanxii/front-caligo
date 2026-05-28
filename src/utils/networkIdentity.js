export function looksLikeIp(value) {
  return /^[0-9a-fA-F:.]{3,80}$/.test(String(value || "").trim());
}

export function firstUsableIp(...values) {
  for (const value of values.flat(Infinity)) {
    const text = String(value || "").trim();
    if (looksLikeIp(text)) {
      return text;
    }
  }
  return "";
}

export function resolveServerIp(identity) {
  const interfaces = identity?.server?.interfaces || [];
  const interfaceIps = Array.isArray(interfaces)
    ? interfaces.flatMap((item) => item?.addresses || [])
    : [];

  return firstUsableIp(
    identity?.server?.publicIp,
    identity?.serverPublicIp,
    identity?.publicIp,
    identity?.server?.ip,
    identity?.server?.address,
    identity?.server?.wanIp,
    identity?.vpn?.publicIp,
    interfaceIps,
  );
}

export function resolveClientIp(identity, browserPublicIp = "") {
  return firstUsableIp(
    browserPublicIp,
    identity?.client?.publicIp,
    identity?.clientPublicIp,
    identity?.client?.observedIp,
    identity?.client?.remoteAddr,
  );
}
