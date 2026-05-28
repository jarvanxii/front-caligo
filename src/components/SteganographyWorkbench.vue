<template>
  <section class="stego-workspace" :class="`stego-workspace--${toolKey}`" aria-labelledby="stego-title">
    <div class="stego-shell">
      <header class="stego-header">
        <div>
          <span class="eyebrow">{{ activeTool.eyebrow }}</span>
          <h1 id="stego-title">{{ activeTool.title }}</h1>
          <p>{{ activeTool.summary }}</p>
        </div>

        <aside class="stego-status" aria-label="Estado del laboratorio">
          <span>Caligo Stego</span>
          <strong>Local</strong>
          <small>Sin subir ficheros a terceros. El navegador procesa las muestras.</small>
        </aside>
      </header>

      <nav class="stego-tabs" aria-label="Herramientas de esteganografia">
        <RouterLink
          v-for="tool in tools"
          :key="tool.key"
          :class="{ 'is-active': tool.key === toolKey }"
          :to="{ name: tool.routeName }"
        >
          <span>{{ tool.code }}</span>
          <strong>{{ tool.label }}</strong>
        </RouterLink>
      </nav>

      <div class="stego-layout">
        <form v-if="toolKey === 'analyze'" class="stego-panel stego-console" @submit.prevent="analyzeFile">
          <header class="stego-panel__head">
            <span>Entrada</span>
            <strong>ANALYZE</strong>
          </header>

          <label>
            Fichero a analizar
            <input type="file" accept="*/*" @change="handleAnalyzeFile" />
          </label>

          <div v-if="analyze.file" class="stego-file-pill">
            <strong>{{ analyze.file.name }}</strong>
            <span>{{ formatBytes(analyze.file.size) }} / {{ analyze.file.type || "application/octet-stream" }}</span>
          </div>

          <div class="stego-actions">
            <button type="submit" :disabled="busy || !analyze.file">{{ busy ? "Analizando" : "Analizar muestra" }}</button>
            <button type="button" @click="clearAnalyze">Limpiar</button>
          </div>
        </form>

        <form v-else-if="toolKey === 'embed'" class="stego-panel stego-console" @submit.prevent="embedPayload">
          <header class="stego-panel__head">
            <span>Portador</span>
            <strong>EMBED</strong>
          </header>

          <label>
            Fichero portador
            <input type="file" accept="*/*" @change="handleEmbedCarrier" />
          </label>

          <div class="stego-field-grid">
            <label>
              Metodo
              <select v-model="embed.method">
                <option value="auto">Auto</option>
                <option value="image-lsb">Imagen LSB</option>
                <option value="png-text">PNG tEXt</option>
                <option value="append">Footer universal</option>
              </select>
            </label>

            <label>
              Payload
              <select v-model="embed.payloadSource">
                <option value="text">Texto</option>
                <option value="json">JSON</option>
                <option value="base64">Base64</option>
                <option value="file">Fichero</option>
              </select>
            </label>
          </div>

          <label v-if="embed.payloadSource === 'file'">
            Fichero a ocultar
            <input type="file" accept="*/*" @change="handleEmbedPayloadFile" />
          </label>

          <label v-if="embed.payloadSource !== 'file'">
            Datos a ocultar
            <textarea v-model="embed.payloadText" rows="7" spellcheck="false" :placeholder="payloadPlaceholder"></textarea>
          </label>

          <label>
            Nombre interno
            <input v-model.trim="embed.payloadName" type="text" autocomplete="off" spellcheck="false" placeholder="payload.txt" />
          </label>

          <div class="stego-actions">
            <button type="submit" :disabled="busy || !embed.carrier">{{ busy ? "Incrustando" : "Incrustar datos" }}</button>
            <button type="button" @click="fillEmbedExample">Ejemplo</button>
            <button type="button" @click="clearEmbed">Limpiar</button>
            <a v-if="embed.downloadUrl" :href="embed.downloadUrl" :download="embed.downloadName">Descargar</a>
          </div>
        </form>

        <form v-else class="stego-panel stego-console" @submit.prevent="extractPayload">
          <header class="stego-panel__head">
            <span>Entrada</span>
            <strong>EXTRACT</strong>
          </header>

          <label>
            Fichero con datos ocultos
            <input type="file" accept="*/*" @change="handleExtractFile" />
          </label>

          <div v-if="extract.file" class="stego-file-pill">
            <strong>{{ extract.file.name }}</strong>
            <span>{{ formatBytes(extract.file.size) }} / {{ extract.file.type || "application/octet-stream" }}</span>
          </div>

          <div class="stego-actions">
            <button type="submit" :disabled="busy || !extract.file">{{ busy ? "Extrayendo" : "Extraer payload" }}</button>
            <button type="button" @click="clearExtract">Limpiar</button>
            <a v-if="extract.downloadUrl" :href="extract.downloadUrl" :download="extract.downloadName">Descargar payload</a>
          </div>
        </form>

        <section class="stego-panel stego-result" aria-live="polite">
          <header class="stego-panel__head">
            <span>Resultado</span>
            <strong>{{ result?.verdict || "READY" }}</strong>
          </header>

          <div v-if="error" class="stego-alert">{{ error }}</div>

          <template v-else-if="result">
            <div class="stego-verdict" :class="`is-${result.tone}`">
              <span>{{ result.badge }}</span>
              <strong>{{ result.title }}</strong>
              <p>{{ result.body }}</p>
            </div>

            <div class="stego-metrics">
              <article v-for="metric in result.metrics" :key="metric.label">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}</strong>
                <small>{{ metric.note }}</small>
              </article>
            </div>

            <div class="stego-output-grid">
              <article v-for="panel in result.panels" :key="panel.title" class="stego-output">
                <header>
                  <span>{{ panel.badge }}</span>
                  <strong>{{ panel.title }}</strong>
                </header>
                <pre>{{ panel.content }}</pre>
                <button type="button" @click="copyText(panel.copyValue || panel.content)">Copiar</button>
              </article>
            </div>
          </template>

          <div v-else class="stego-empty">
            <span>{{ activeTool.code }}</span>
            <p>{{ activeTool.empty }}</p>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script>
const MAGIC_TEXT = "CALIGO_STEGO_V1";
const MAGIC_BYTES = textToBytes(MAGIC_TEXT);
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const CRC_TABLE = buildCrcTable();

const TOOLS = [
  {
    key: "analyze",
    routeName: "esteganografia",
    code: "META",
    label: "Analizador",
    eyebrow: "Esteganografia / Analisis",
    title: "Analizador de muestras",
    summary: "Inspeccion local de magic bytes, entropia, cadenas visibles, metadatos basicos, bytes anexos y paquetes Caligo.",
    empty: "Carga una muestra para obtener un perfil forense rapido.",
  },
  {
    key: "embed",
    routeName: "stegoEmbed",
    code: "LSB+",
    label: "Incrustar",
    eyebrow: "Esteganografia / Ocultacion",
    title: "Incrustar datos",
    summary: "Oculta texto, JSON, Base64 o ficheros completos mediante LSB de imagen, chunk PNG o footer universal.",
    empty: "Elige un portador y genera una muestra descargable.",
  },
  {
    key: "extract",
    routeName: "stegoExtract",
    code: "LSB-",
    label: "Extraer",
    eyebrow: "Esteganografia / Recuperacion",
    title: "Extraer payloads",
    summary: "Busca y recupera paquetes CALIGO_STEGO_V1 desde footer, PNG tEXt o LSB de imagen.",
    empty: "Carga una muestra generada por Caligo para recuperar su payload.",
  },
];

export default {
  name: "SteganographyWorkbench",
  props: {
    toolKey: {
      type: String,
      default: "analyze",
    },
  },
  data() {
    return {
      tools: TOOLS,
      busy: false,
      error: "",
      result: null,
      analyze: {
        file: null,
      },
      embed: {
        carrier: null,
        payloadFile: null,
        payloadSource: "text",
        payloadText: "",
        payloadName: "",
        method: "auto",
        downloadUrl: "",
        downloadName: "",
      },
      extract: {
        file: null,
        downloadUrl: "",
        downloadName: "",
      },
    };
  },
  computed: {
    activeTool() {
      return this.tools.find((tool) => tool.key === this.toolKey) || this.tools[0];
    },
    payloadPlaceholder() {
      if (this.embed.payloadSource === "json") {
        return '{ "lab": "caligo", "mensaje": "visible solo tras extraer" }';
      }
      if (this.embed.payloadSource === "base64") {
        return "SG9sYSBkZXNkZSBDYWxpZ28=";
      }
      return "Mensaje secreto de laboratorio";
    },
  },
  beforeUnmount() {
    this.revokeEmbedDownload();
    this.revokeExtractDownload();
  },
  methods: {
    handleAnalyzeFile(event) {
      this.analyze.file = event.target.files?.[0] || null;
      this.result = null;
      this.error = "";
    },
    handleEmbedCarrier(event) {
      this.embed.carrier = event.target.files?.[0] || null;
      this.result = null;
      this.error = "";
    },
    handleEmbedPayloadFile(event) {
      this.embed.payloadFile = event.target.files?.[0] || null;
    },
    handleExtractFile(event) {
      this.extract.file = event.target.files?.[0] || null;
      this.result = null;
      this.error = "";
    },
    async analyzeFile() {
      if (!this.analyze.file) return;
      this.busy = true;
      this.error = "";
      try {
        const file = this.analyze.file;
        const bytes = new Uint8Array(await file.arrayBuffer());
        const type = detectFileType(bytes, file);
        const entropy = byteEntropy(bytes);
        const strings = printableStrings(bytes);
        const container = collectContainerHints(bytes, type);
        const hash = await sha256Hex(bytes);
        const lsb = await analyzeImageLsb(file, type).catch(() => null);
        const rawPacket = extractPacketFromRawBytes(bytes);
        const pngPacket = type.label === "PNG" ? extractPacketFromPngText(bytes) : null;

        const findings = [
          rawPacket ? "Paquete Caligo localizado en bytes crudos o footer." : "",
          pngPacket ? "Paquete Caligo localizado en chunk PNG tEXt." : "",
          lsb?.hasPacket ? "Cabecera Caligo detectada en LSB de imagen." : "",
          container.appendedBytes > 0 ? `Bytes anexos tras fin de contenedor: ${formatBytes(container.appendedBytes)}.` : "",
          entropy > 7.85 && bytes.length > 4096 ? "Entropia muy alta: posible cifrado, compresion o datos aleatorios." : "",
          strings.some((line) => /password|secret|token|payload|stego|private/i.test(line)) ? "Cadenas visibles con terminos sensibles." : "",
          ...container.indicators,
        ].filter(Boolean);

        const risk = rawPacket || pngPacket || lsb?.hasPacket || container.appendedBytes > 128
          ? "high"
          : findings.length || entropy > 7.85
            ? "medium"
            : "low";

        this.result = {
          verdict: risk === "high" ? "ALTA" : risk === "medium" ? "MEDIA" : "BAJA",
          tone: risk === "high" ? "danger" : risk === "medium" ? "warning" : "success",
          badge: type.label,
          title: risk === "high" ? "Indicadores fuertes" : risk === "medium" ? "Revisar manualmente" : "Sin senales claras",
          body: risk === "high"
            ? "La muestra contiene senales compatibles con datos ocultos o estructura anexa."
            : risk === "medium"
              ? "Hay metadatos, entropia o cadenas que conviene revisar con herramientas nativas."
              : "No se detectan paquetes Caligo ni anomalias fuertes con las pruebas locales disponibles.",
          metrics: [
            { label: "Tipo", value: type.label, note: type.family },
            { label: "Tamano", value: formatBytes(file.size), note: "Fichero local" },
            { label: "Entropia", value: `${entropy.toFixed(2)}`, note: "bits/byte" },
            { label: "SHA-256", value: hash.slice(0, 12), note: "huella" },
          ],
          panels: [
            { title: "Hallazgos", badge: "scan", content: listText(findings.length ? findings : ["Sin hallazgos fuertes."]), copyValue: findings.join("\n") },
            { title: "Formato", badge: "fmt", content: listText([
              `Nombre: ${file.name}`,
              `MIME navegador: ${file.type || "N/D"}`,
              `Magic bytes: ${bytesToHex(bytes.slice(0, 16))}`,
              `SHA-256: ${hash}`,
              lsb ? `Imagen: ${lsb.width}x${lsb.height} / LSB unos ${(lsb.lsbRatio * 100).toFixed(2)}% / capacidad ${formatBytes(lsb.capacityBytes)}` : "",
              ...container.formatLines,
            ].filter(Boolean)) },
            { title: "Metadatos visibles", badge: "meta", content: listText(container.metadataLines.length ? container.metadataLines : ["Sin metadatos simples detectados."]) },
            { title: "Cadenas", badge: "ascii", content: listText(strings.length ? strings.slice(0, 60) : ["Sin cadenas imprimibles relevantes."]), copyValue: strings.join("\n") },
          ],
        };
      } catch (error) {
        this.error = error.message || "No se pudo analizar la muestra";
      } finally {
        this.busy = false;
      }
    },
    async embedPayload() {
      if (!this.embed.carrier) return;
      this.busy = true;
      this.error = "";
      try {
        this.revokeEmbedDownload();
        const carrier = this.embed.carrier;
        const carrierBytes = new Uint8Array(await carrier.arrayBuffer());
        const type = detectFileType(carrierBytes, carrier);
        const payload = await this.buildPayload();
        const packet = buildPacket(payload.bytes, {
          payloadName: payload.name,
          payloadMime: payload.mime,
          payloadSource: this.embed.payloadSource,
          carrierName: carrier.name,
          carrierType: type.label,
        });
        const method = await this.chooseEmbedMethod(carrier, carrierBytes, type, packet);
        let outputBytes = null;
        let outputBlob = null;
        let outputName = "";
        let capacityBytes = null;

        if (method === "image-lsb") {
          const image = await imageFileToCanvas(carrier);
          capacityBytes = lsbCapacityBytes(image.imageData);
          if (packet.length > capacityBytes) {
            throw new Error(`El paquete necesita ${formatBytes(packet.length)} y la imagen ofrece ${formatBytes(capacityBytes)} utiles.`);
          }
          writeLsbBytes(image.imageData, packet);
          image.context.putImageData(image.imageData, 0, 0);
          outputBlob = await canvasToPngBlob(image.canvas);
          outputName = outputFileName(carrier.name, "caligo-lsb", "png");
        } else if (method === "png-text") {
          if (type.label !== "PNG") throw new Error("PNG tEXt requiere un portador PNG valido.");
          outputBytes = insertPngTextPacket(carrierBytes, packet);
          outputBlob = new Blob([outputBytes], { type: "image/png" });
          outputName = outputFileName(carrier.name, "caligo-text", "png");
        } else {
          outputBytes = concatBytes(carrierBytes, packet);
          outputBlob = new Blob([outputBytes], { type: carrier.type || "application/octet-stream" });
          outputName = outputFileName(carrier.name, "caligo-footer", extensionFromName(carrier.name));
        }

        this.embed.downloadUrl = URL.createObjectURL(outputBlob);
        this.embed.downloadName = outputName;
        this.result = {
          verdict: "OK",
          tone: "success",
          badge: method,
          title: "Payload incrustado",
          body: `Se genero ${outputName} con formato ${MAGIC_TEXT}.`,
          metrics: [
            { label: "Portador", value: type.label, note: carrier.name },
            { label: "Payload", value: formatBytes(payload.bytes.length), note: payload.name },
            { label: "Metodo", value: method, note: this.embed.method === "auto" ? "auto" : "manual" },
            { label: "Capacidad", value: capacityBytes ? formatBytes(capacityBytes) : "N/D", note: "LSB" },
          ],
          panels: [
            { title: "Salida", badge: "file", content: listText([`Fichero: ${outputName}`, `Metodo: ${method}`, `Paquete: ${formatBytes(packet.length)}`, `CRC32: ${crc32Hex(payload.bytes)}`]) },
            { title: "Cabecera", badge: "json", content: JSON.stringify(parsePacket(packet).header, null, 2) },
            { title: "Payload", badge: this.embed.payloadSource, content: payload.preview, copyValue: payload.preview },
          ],
        };
      } catch (error) {
        this.error = error.message || "No se pudo incrustar el payload";
      } finally {
        this.busy = false;
      }
    },
    async extractPayload() {
      if (!this.extract.file) return;
      this.busy = true;
      this.error = "";
      try {
        this.revokeExtractDownload();
        const file = this.extract.file;
        const bytes = new Uint8Array(await file.arrayBuffer());
        const type = detectFileType(bytes, file);
        let extracted = extractPacketFromRawBytes(bytes) || (type.label === "PNG" ? extractPacketFromPngText(bytes) : null);
        let source = extracted ? extracted.source : "";

        if (!extracted && type.family === "image" && type.label !== "SVG") {
          const image = await imageFileToCanvas(file).catch(() => null);
          if (image) {
            extracted = readPacketFromImageLsb(image.imageData);
            source = extracted ? "image-lsb" : "";
          }
        }

        if (!extracted) {
          throw new Error("No se encontro paquete CALIGO_STEGO_V1 en footer, PNG tEXt ni LSB de imagen.");
        }

        const { header, payload } = extracted;
        const payloadName = safeFileName(header.payloadName || "caligo-payload.bin");
        const payloadMime = header.payloadMime || "application/octet-stream";
        this.extract.downloadUrl = URL.createObjectURL(new Blob([payload], { type: payloadMime }));
        this.extract.downloadName = payloadName;
        const textPreview = payloadToPreview(payload, header);

        this.result = {
          verdict: "OK",
          tone: extracted.crcOk ? "success" : "warning",
          badge: source,
          title: extracted.crcOk ? "Payload recuperado" : "Payload recuperado con CRC dudoso",
          body: extracted.crcOk ? "El CRC32 del payload coincide." : "El CRC32 no coincide o no estaba declarado.",
          metrics: [
            { label: "Origen", value: source, note: type.label },
            { label: "Payload", value: formatBytes(payload.length), note: payloadName },
            { label: "MIME", value: payloadMime.split(";")[0], note: header.payloadSource || "binary" },
            { label: "CRC32", value: extracted.crc || "N/D", note: extracted.crcOk ? "OK" : "revisar" },
          ],
          panels: [
            { title: "Payload", badge: "data", content: textPreview, copyValue: textPreview },
            { title: "Cabecera", badge: "meta", content: JSON.stringify(header, null, 2) },
            { title: "Hex", badge: "hex", content: bytesToHex(payload.slice(0, 256)), copyValue: bytesToHex(payload) },
          ],
        };
      } catch (error) {
        this.error = error.message || "No se pudo extraer el payload";
      } finally {
        this.busy = false;
      }
    },
    async buildPayload() {
      if (this.embed.payloadSource === "file") {
        if (!this.embed.payloadFile) throw new Error("Selecciona el fichero que quieres ocultar.");
        const file = this.embed.payloadFile;
        const bytes = new Uint8Array(await file.arrayBuffer());
        return {
          bytes,
          name: this.embed.payloadName || file.name || "payload.bin",
          mime: file.type || "application/octet-stream",
          preview: `Fichero: ${file.name}\nTamano: ${formatBytes(bytes.length)}\nMIME: ${file.type || "application/octet-stream"}`,
        };
      }

      if (!this.embed.payloadText.trim()) throw new Error("Introduce datos para ocultar.");
      if (this.embed.payloadSource === "base64") {
        const bytes = base64ToBytes(normalizeBase64(this.embed.payloadText));
        return {
          bytes,
          name: this.embed.payloadName || "payload.bin",
          mime: "application/octet-stream",
          preview: bytesToBase64(bytes).slice(0, 500),
        };
      }

      const text = this.embed.payloadSource === "json"
        ? JSON.stringify(JSON.parse(this.embed.payloadText), null, 2)
        : this.embed.payloadText;
      return {
        bytes: textToBytes(text),
        name: this.embed.payloadName || (this.embed.payloadSource === "json" ? "payload.json" : "payload.txt"),
        mime: this.embed.payloadSource === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8",
        preview: text,
      };
    },
    async chooseEmbedMethod(file, bytes, type, packet) {
      if (this.embed.method !== "auto") return this.embed.method;
      if (type.family === "image" && type.label !== "SVG") {
        try {
          const image = await imageFileToCanvas(file);
          if (packet.length <= lsbCapacityBytes(image.imageData)) return "image-lsb";
        } catch {
          // Continue with PNG text or footer.
        }
      }
      if (type.label === "PNG") return "png-text";
      return "append";
    },
    fillEmbedExample() {
      this.embed.payloadSource = "json";
      this.embed.payloadName = "caligo-lab.json";
      this.embed.payloadText = JSON.stringify({
        laboratorio: "Caligo",
        formato: MAGIC_TEXT,
        nota: "Primera version basada en el flujo de Feanor",
      }, null, 2);
    },
    clearAnalyze() {
      this.analyze.file = null;
      this.result = null;
      this.error = "";
    },
    clearEmbed() {
      this.revokeEmbedDownload();
      this.embed.carrier = null;
      this.embed.payloadFile = null;
      this.embed.payloadText = "";
      this.embed.payloadName = "";
      this.result = null;
      this.error = "";
    },
    clearExtract() {
      this.revokeExtractDownload();
      this.extract.file = null;
      this.result = null;
      this.error = "";
    },
    revokeEmbedDownload() {
      if (this.embed.downloadUrl) URL.revokeObjectURL(this.embed.downloadUrl);
      this.embed.downloadUrl = "";
      this.embed.downloadName = "";
    },
    revokeExtractDownload() {
      if (this.extract.downloadUrl) URL.revokeObjectURL(this.extract.downloadUrl);
      this.extract.downloadUrl = "";
      this.extract.downloadName = "";
    },
    copyText(value) {
      navigator.clipboard?.writeText(value || "");
    },
    formatBytes,
  },
};

function detectFileType(bytes, file) {
  const name = (file?.name || "").toLowerCase();
  const mime = file?.type || "";
  if (startsWith(bytes, PNG_SIGNATURE)) return { label: "PNG", family: "image", extension: "png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return { label: "JPEG", family: "image", extension: "jpg" };
  if (ascii(bytes, 0, 6).startsWith("GIF8")) return { label: "GIF", family: "image", extension: "gif" };
  if (ascii(bytes, 0, 2) === "BM") return { label: "BMP", family: "image", extension: "bmp" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WAVE") return { label: "WAV", family: "audio", extension: "wav" };
  if (ascii(bytes, 0, 4) === "%PDF") return { label: "PDF", family: "document", extension: "pdf" };
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) return { label: "ZIP", family: "archive", extension: "zip" };
  if (mime.startsWith("image/")) return { label: mime.split("/")[1]?.toUpperCase() || "IMAGE", family: "image", extension: extensionFromName(name) };
  if (mime.startsWith("audio/")) return { label: mime.split("/")[1]?.toUpperCase() || "AUDIO", family: "audio", extension: extensionFromName(name) };
  return { label: extensionFromName(name).toUpperCase() || "BIN", family: "binary", extension: extensionFromName(name) || "bin" };
}

function collectContainerHints(bytes, type) {
  const metadataLines = [];
  const formatLines = [];
  const indicators = [];
  let endOffset = bytes.length;

  if (type.label === "PNG") {
    const chunks = parsePngChunks(bytes);
    const iend = chunks.find((chunk) => chunk.type === "IEND");
    if (iend) endOffset = iend.end;
    formatLines.push(`PNG chunks: ${chunks.map((chunk) => chunk.type).join(", ")}`);
    chunks.filter((chunk) => ["tEXt", "iTXt", "zTXt"].includes(chunk.type)).forEach((chunk) => {
      metadataLines.push(`${chunk.type}: ${decodeTextChunk(chunk.data).slice(0, 280)}`);
    });
  }

  if (type.label === "JPEG") {
    const eoi = lastIndexOfSequence(bytes, [0xff, 0xd9]);
    if (eoi >= 0) endOffset = eoi + 2;
    for (const segment of parseJpegSegments(bytes)) {
      if (segment.marker === 0xe1) metadataLines.push("APP1: posible EXIF/XMP");
      if (segment.marker === 0xfe) metadataLines.push(`COM: ${ascii(segment.data, 0, Math.min(220, segment.data.length))}`);
    }
  }

  if (type.label === "PDF") {
    const eof = lastIndexOfSequence(bytes, textToBytes("%%EOF"));
    if (eof >= 0) endOffset = eof + 5;
    const text = bytesToLatin1(bytes.slice(0, Math.min(bytes.length, 6000)));
    const title = text.match(/\/Title\s*\(([^)]{1,180})\)/);
    const author = text.match(/\/Author\s*\(([^)]{1,180})\)/);
    if (title) metadataLines.push(`Title: ${title[1]}`);
    if (author) metadataLines.push(`Author: ${author[1]}`);
  }

  if (type.label === "ZIP") {
    const names = zipCentralDirectoryNames(bytes);
    if (names.length) {
      metadataLines.push(...names.slice(0, 20).map((name) => `ZIP entry: ${name}`));
    }
    formatLines.push(`ZIP entries visibles: ${names.length}`);
  }

  const appendedBytes = Math.max(0, bytes.length - endOffset);
  if (appendedBytes > 0) indicators.push("Contenido despues del final logico del contenedor.");
  return { metadataLines, formatLines, indicators, appendedBytes };
}

async function analyzeImageLsb(file, type) {
  if (type.family !== "image" || type.label === "SVG") return null;
  const { imageData, width, height } = await imageFileToCanvas(file);
  let ones = 0;
  let bits = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    ones += imageData.data[i] & 1;
    ones += imageData.data[i + 1] & 1;
    ones += imageData.data[i + 2] & 1;
    bits += 3;
  }
  const prefix = readLsbBytes(imageData, MAGIC_BYTES.length);
  return {
    width,
    height,
    capacityBytes: lsbCapacityBytes(imageData),
    lsbRatio: bits ? ones / bits : 0,
    hasPacket: equalsBytes(prefix, MAGIC_BYTES),
  };
}

async function imageFileToCanvas(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("El navegador no puede decodificar esta imagen."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    return {
      canvas,
      context,
      width: canvas.width,
      height: canvas.height,
      imageData: context.getImageData(0, 0, canvas.width, canvas.height),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function buildPacket(payload, header) {
  const headerBytes = textToBytes(JSON.stringify({
    ...header,
    version: 1,
    createdBy: "Caligo",
    createdAt: new Date().toISOString(),
    payloadSize: payload.length,
    crc32: crc32Hex(payload),
  }));
  return concatBytes(MAGIC_BYTES, uint32Bytes(headerBytes.length), uint32Bytes(payload.length), uint32Bytes(crc32(payload)), headerBytes, payload);
}

function parsePacket(packet) {
  if (!equalsBytes(packet.slice(0, MAGIC_BYTES.length), MAGIC_BYTES)) throw new Error("Cabecera Caligo no valida.");
  const headerLength = readUint32(packet, MAGIC_BYTES.length);
  const payloadLength = readUint32(packet, MAGIC_BYTES.length + 4);
  const expectedCrc = readUint32(packet, MAGIC_BYTES.length + 8);
  const headerStart = MAGIC_BYTES.length + 12;
  const payloadStart = headerStart + headerLength;
  const total = payloadStart + payloadLength;
  if (packet.length < total) throw new Error("Paquete incompleto.");
  const header = JSON.parse(bytesToUtf8(packet.slice(headerStart, payloadStart)));
  const payload = packet.slice(payloadStart, total);
  const actualCrc = crc32(payload);
  return {
    header,
    payload,
    total,
    crc: hex32(expectedCrc),
    crcOk: expectedCrc === actualCrc,
  };
}

function extractPacketFromRawBytes(bytes) {
  const index = lastIndexOfSequence(bytes, MAGIC_BYTES);
  if (index < 0) return null;
  const parsed = parsePacket(bytes.slice(index));
  return { ...parsed, source: index + parsed.total === bytes.length ? "footer" : "raw" };
}

function insertPngTextPacket(bytes, packet) {
  const chunks = parsePngChunks(bytes);
  const iend = chunks.find((chunk) => chunk.type === "IEND");
  if (!iend) throw new Error("PNG sin chunk IEND.");
  const keyword = textToLatin1("CaligoStego");
  const data = concatBytes(keyword, new Uint8Array([0]), textToLatin1(bytesToBase64(packet)));
  const chunk = makePngChunk("tEXt", data);
  return concatBytes(bytes.slice(0, iend.offset), chunk, bytes.slice(iend.offset));
}

function extractPacketFromPngText(bytes) {
  for (const chunk of parsePngChunks(bytes)) {
    if (!["tEXt", "iTXt"].includes(chunk.type)) continue;
    const text = decodeTextChunk(chunk.data);
    if (!text.startsWith("CaligoStego")) continue;
    const base64 = text.split(/\0|\s/, 2)[1] || text.replace(/^CaligoStego\0?/, "");
    try {
      return { ...parsePacket(base64ToBytes(base64)), source: "png-text" };
    } catch {
      return null;
    }
  }
  return null;
}

function writeLsbBytes(imageData, packet) {
  const capacity = lsbCapacityBytes(imageData);
  if (packet.length > capacity) throw new Error("El paquete no cabe en la imagen.");
  let bitIndex = 0;
  for (let i = 0; i < imageData.data.length && bitIndex < packet.length * 8; i += 4) {
    for (const channel of [0, 1, 2]) {
      if (bitIndex >= packet.length * 8) break;
      const byte = packet[Math.floor(bitIndex / 8)];
      const bit = (byte >> (7 - (bitIndex % 8))) & 1;
      imageData.data[i + channel] = (imageData.data[i + channel] & 0xfe) | bit;
      bitIndex += 1;
    }
  }
}

function readPacketFromImageLsb(imageData) {
  const prefixLength = MAGIC_BYTES.length + 12;
  const prefix = readLsbBytes(imageData, prefixLength);
  if (!equalsBytes(prefix.slice(0, MAGIC_BYTES.length), MAGIC_BYTES)) return null;
  const headerLength = readUint32(prefix, MAGIC_BYTES.length);
  const payloadLength = readUint32(prefix, MAGIC_BYTES.length + 4);
  const total = prefixLength + headerLength + payloadLength;
  if (total > lsbCapacityBytes(imageData)) throw new Error("Cabecera LSB apunta a un paquete mayor que la capacidad.");
  return { ...parsePacket(readLsbBytes(imageData, total)), source: "image-lsb" };
}

function readLsbBytes(imageData, count) {
  const output = new Uint8Array(count);
  let bitIndex = 0;
  for (let i = 0; i < imageData.data.length && bitIndex < count * 8; i += 4) {
    for (const channel of [0, 1, 2]) {
      if (bitIndex >= count * 8) break;
      output[Math.floor(bitIndex / 8)] |= (imageData.data[i + channel] & 1) << (7 - (bitIndex % 8));
      bitIndex += 1;
    }
  }
  return output;
}

function lsbCapacityBytes(imageData) {
  return Math.floor((imageData.data.length / 4 * 3) / 8);
}

function parsePngChunks(bytes) {
  if (!startsWith(bytes, PNG_SIGNATURE)) return [];
  const chunks = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = readUint32(bytes, offset);
    const type = ascii(bytes, offset + 4, 4);
    const dataStart = offset + 8;
    const end = dataStart + length + 4;
    if (end > bytes.length) break;
    chunks.push({ type, offset, data: bytes.slice(dataStart, dataStart + length), end });
    offset = end;
    if (type === "IEND") break;
  }
  return chunks;
}

function makePngChunk(type, data) {
  const typeBytes = textToLatin1(type);
  const crc = crc32(concatBytes(typeBytes, data));
  return concatBytes(uint32Bytes(data.length), typeBytes, data, uint32Bytes(crc));
}

function parseJpegSegments(bytes) {
  const segments = [];
  let offset = 2;
  while (offset + 4 < bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + 2 + length > bytes.length) break;
    segments.push({ marker, data: bytes.slice(offset + 4, offset + 2 + length) });
    offset += 2 + length;
  }
  return segments;
}

function zipCentralDirectoryNames(bytes) {
  const names = [];
  for (let i = 0; i + 46 < bytes.length && names.length < 80; i += 1) {
    if (bytes[i] !== 0x50 || bytes[i + 1] !== 0x4b || bytes[i + 2] !== 0x01 || bytes[i + 3] !== 0x02) continue;
    const nameLength = bytes[i + 28] | (bytes[i + 29] << 8);
    const extraLength = bytes[i + 30] | (bytes[i + 31] << 8);
    const commentLength = bytes[i + 32] | (bytes[i + 33] << 8);
    const nameStart = i + 46;
    names.push(bytesToUtf8(bytes.slice(nameStart, nameStart + nameLength)));
    i = nameStart + nameLength + extraLength + commentLength - 1;
  }
  return names;
}

function printableStrings(bytes) {
  const text = bytesToLatin1(bytes);
  return (text.match(/[ -~]{5,}/g) || [])
    .filter((item) => /[A-Za-z0-9]/.test(item))
    .slice(0, 120);
}

function byteEntropy(bytes) {
  if (!bytes.length) return 0;
  const counts = new Array(256).fill(0);
  for (const byte of bytes) counts[byte] += 1;
  return counts.reduce((sum, count) => {
    if (!count) return sum;
    const p = count / bytes.length;
    return sum - p * Math.log2(p);
  }, 0);
}

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

function payloadToPreview(payload, header) {
  const mime = String(header.payloadMime || "");
  if (mime.startsWith("text/") || mime.includes("json") || header.payloadSource === "text" || header.payloadSource === "json") {
    return bytesToUtf8(payload);
  }
  return bytesToBase64(payload).slice(0, 1200);
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo exportar la imagen.")), "image/png");
  });
}

function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function crc32Hex(bytes) {
  return hex32(crc32(bytes));
}

function hex32(value) {
  return (value >>> 0).toString(16).padStart(8, "0");
}

function readUint32(bytes, offset) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function uint32Bytes(value) {
  return new Uint8Array([(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]);
}

function concatBytes(...arrays) {
  const total = arrays.reduce((sum, item) => sum + item.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const item of arrays) {
    output.set(item, offset);
    offset += item.length;
  }
  return output;
}

function startsWith(bytes, prefix) {
  if (bytes.length < prefix.length) return false;
  return prefix.every((byte, index) => bytes[index] === byte);
}

function equalsBytes(a, b) {
  if (a.length !== b.length) return false;
  return a.every((byte, index) => byte === b[index]);
}

function lastIndexOfSequence(bytes, sequence) {
  for (let i = bytes.length - sequence.length; i >= 0; i -= 1) {
    let ok = true;
    for (let j = 0; j < sequence.length; j += 1) {
      if (bytes[i + j] !== sequence[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  return -1;
}

function decodeTextChunk(data) {
  return bytesToLatin1(data).replace(/\0/g, " ");
}

function textToBytes(text) {
  return new TextEncoder().encode(text);
}

function textToLatin1(text) {
  return Uint8Array.from([...text].map((char) => char.charCodeAt(0) & 255));
}

function bytesToUtf8(bytes) {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function bytesToLatin1(bytes) {
  return [...bytes].map((byte) => String.fromCharCode(byte)).join("");
}

function ascii(bytes, offset, length) {
  return bytesToLatin1(bytes.slice(offset, offset + length));
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(i, i + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function normalizeBase64(value) {
  return value.trim().replace(/^data:[^,]+,/, "").replace(/\s+/g, "");
}

function extensionFromName(name) {
  const match = String(name || "").match(/\.([A-Za-z0-9]{1,8})$/);
  return match ? match[1].toLowerCase() : "bin";
}

function outputFileName(name, suffix, ext) {
  const base = safeFileName(String(name || "carrier").replace(/\.[^.]+$/, "")) || "carrier";
  return `${base}-${suffix}.${ext || "bin"}`;
}

function safeFileName(name) {
  return String(name || "payload.bin").replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120);
}

function formatBytes(value) {
  const size = Number(value || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function listText(lines) {
  return lines.map((line) => `> ${line}`).join("\n");
}
</script>
