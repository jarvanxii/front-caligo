const TOOL_PALETTE = {
  "caligo-intel": ["#7dd3fc", "rgba(125, 211, 252, 0.22)", "CI"],
  nmap: ["#60a5fa", "rgba(96, 165, 250, 0.24)", "NMAP"],
  openvas: ["#86efac", "rgba(134, 239, 172, 0.23)", "GVM"],
  metasploit: ["#f87171", "rgba(248, 113, 113, 0.22)", "MSF"],
  hydra: ["#fb923c", "rgba(251, 146, 60, 0.22)", "HYD"],
  nuclei: ["#a78bfa", "rgba(167, 139, 250, 0.24)", "NUC"],
  searchsploit: ["#facc15", "rgba(250, 204, 21, 0.2)", "EDB"],
  nikto: ["#fda4af", "rgba(253, 164, 175, 0.2)", "NKT"],
  sqlmap: ["#e879f9", "rgba(232, 121, 249, 0.2)", "SQL"],
  "caligo-people": ["#38bdf8", "rgba(56, 189, 248, 0.2)", "PPL"],
  "social-analyzer": ["#22d3ee", "rgba(34, 211, 238, 0.2)", "SOC"],
  sherlock: ["#93c5fd", "rgba(147, 197, 253, 0.2)", "SH"],
  maigret: ["#c4b5fd", "rgba(196, 181, 253, 0.2)", "MG"],
  holehe: ["#f0abfc", "rgba(240, 171, 252, 0.18)", "HH"],
  theharvester: ["#67e8f9", "rgba(103, 232, 249, 0.18)", "TH"],
  "email-exposure": ["#a5b4fc", "rgba(165, 180, 252, 0.2)", "EML"],
  "phone-lookup": ["#38bdf8", "rgba(56, 189, 248, 0.18)", "TEL"],
  "domain-contacts": ["#22d3ee", "rgba(34, 211, 238, 0.18)", "DOM"],
  "password-exposure": ["#fb7185", "rgba(251, 113, 133, 0.2)", "PWD"],
  "metadata-exposure": ["#c084fc", "rgba(192, 132, 252, 0.2)", "META"],
  "public-files": ["#67e8f9", "rgba(103, 232, 249, 0.18)", "PUB"],
  "git-dumper": ["#38bdf8", "rgba(56, 189, 248, 0.2)", "GIT"],
  spiderfoot: ["#60a5fa", "rgba(96, 165, 250, 0.2)", "SPF"],
  trufflehog: ["#fb7185", "rgba(251, 113, 133, 0.18)", "TRF"],
  hashid: ["#fef08a", "rgba(254, 240, 138, 0.18)", "HID"],
  john: ["#fbbf24", "rgba(251, 191, 36, 0.2)", "JTR"],
  hashcat: ["#f97316", "rgba(249, 115, 22, 0.2)", "HCT"],
  wordlists: ["#fde68a", "rgba(253, 230, 138, 0.16)", "WL"],
  crunch: ["#fed7aa", "rgba(254, 215, 170, 0.18)", "CR"],
  cewl: ["#fdba74", "rgba(253, 186, 116, 0.18)", "CW"],
  base64: ["#5eead4", "rgba(94, 234, 212, 0.18)", "B64"],
  "url-html": ["#99f6e4", "rgba(153, 246, 228, 0.18)", "URL"],
  hexdump: ["#2dd4bf", "rgba(45, 212, 191, 0.18)", "HEX"],
  "caligo-analyze": ["#c084fc", "rgba(192, 132, 252, 0.2)", "ANL"],
  "metadata-analyzer": ["#a78bfa", "rgba(167, 139, 250, 0.2)", "META"],
  exiftool: ["#a78bfa", "rgba(167, 139, 250, 0.2)", "EXIF"],
  "metadata-editor": ["#d8b4fe", "rgba(216, 180, 254, 0.2)", "EDIT"],
  "caligo-embed": ["#c084fc", "rgba(192, 132, 252, 0.2)", "LSB+"],
  "caligo-extract": ["#ddd6fe", "rgba(221, 214, 254, 0.18)", "LSB-"],
  whoami: ["#34d399", "rgba(52, 211, 153, 0.2)", "WHO"],
  wireguard: ["#60a5fa", "rgba(96, 165, 250, 0.2)", "WG"],
  openvpn: ["#fb923c", "rgba(251, 146, 60, 0.2)", "OVPN"],
  ping: ["#86efac", "rgba(134, 239, 172, 0.16)", "PING"],
  traceroute: ["#7dd3fc", "rgba(125, 211, 252, 0.16)", "TR"],
  netcat: ["#94a3b8", "rgba(148, 163, 184, 0.16)", "NC"],
  "python-http": ["#facc15", "rgba(250, 204, 21, 0.16)", "PY"],
};

export function toolPalette(tool = {}) {
  return TOOL_PALETTE[tool.id] || TOOL_PALETTE[tool.routeName] || ["#b8f7ef", "rgba(184, 247, 239, 0.18)", tool.mark || String(tool.name || "CAL").slice(0, 3).toUpperCase()];
}

export function toolCssVars(tool = {}) {
  const [accent, glow] = toolPalette(tool);
  return {
    "--tool-accent": accent,
    "--tool-glow": glow,
  };
}

export function toolMark(tool = {}) {
  return toolPalette(tool)[2];
}
