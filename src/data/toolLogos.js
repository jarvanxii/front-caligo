const svgLogoModules = import.meta.glob("../assets/images/tools/*.svg", {
  eager: true,
  import: "default",
  query: "?url",
});

const bitmapLogoModules = import.meta.glob("../assets/images/tools/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
  query: "?url",
});

const logoModules = {
  ...svgLogoModules,
  ...bitmapLogoModules,
};

const logoById = Object.fromEntries(
  Object.entries(logoModules).map(([path, url]) => {
    const id = path.split("/").pop().replace(/\.(svg|png|jpe?g|webp)$/i, "");
    return [id, url];
  }),
);

const LOGO_ALIASES = {
  "base-converter": "cyberchef",
  binwalk: "binwalk-reversing",
  "browser-exiftool": "exiftool",
  "linpeas-sh": "linpeas",
  "metadata-analyzer": "exiftool",
  "metadata-editor": "exiftool",
  "msfconsole-rpc": "metasploit",
  "name-that-hash": "hashid",
  gvm: "openvas",
  openvas: "openvas",
  exploitdb: "searchsploit",
  "the-harvester": "theharvester",
  "the-harvester-cli": "theharvester",
  "john-the-ripper": "john",
  seclists: "wordlists",
  "sec-lists": "wordlists",
  tshark: "wireshark",
  "winpeas-exe": "winpeas",
};

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toolLogo(tool = {}) {
  const candidates = [
    tool.logoId,
    tool.id,
    tool.serverId,
    tool.routeName,
    normalize(tool.name),
    normalize(tool.label),
    normalize(tool.serverId),
    normalize(tool.engine?.split("/")[0]),
    normalize(tool.command?.split("/")[0]),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const key = LOGO_ALIASES[candidate] || candidate;
    if (logoById[key]) {
      return logoById[key];
    }
  }

  return "";
}

export function hasToolLogo(tool = {}) {
  return Boolean(toolLogo(tool));
}
