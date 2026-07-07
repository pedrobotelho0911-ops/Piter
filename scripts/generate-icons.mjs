// Gera os ícones PNG do PWA sem nenhuma dependência externa:
// desenha num buffer RGBA e codifica o PNG à mão (zlib é nativo do Node).
// Uso: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PASTA_PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const FUNDO = [0x11, 0x11, 0x1b];
const SUPERFICIE = [0x1e, 0x1e, 0x2e];
const ROXO = [0xa7, 0x8b, 0xfa];
const VERDE = [0x4a, 0xde, 0x80];

// ---- Codificação PNG ----

const TABELA_CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = TABELA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pedaco(tipo, dados) {
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dados]);
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([tamanho, corpo, crc]);
}

function codificarPNG(tamanho, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tamanho, 0);
  ihdr.writeUInt32BE(tamanho, 4);
  ihdr[8] = 8; // 8 bits por canal
  ihdr[9] = 6; // RGBA

  // Cada linha do PNG começa com o byte do filtro (0 = nenhum).
  const bruto = Buffer.alloc(tamanho * (tamanho * 4 + 1));
  for (let y = 0; y < tamanho; y++) {
    rgba.copy(bruto, y * (tamanho * 4 + 1) + 1, y * tamanho * 4, (y + 1) * tamanho * 4);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pedaco("IHDR", ihdr),
    pedaco("IDAT", deflateSync(bruto, { level: 9 })),
    pedaco("IEND", Buffer.alloc(0)),
  ]);
}

// ---- Desenho ----

function distanciaRetanguloRedondo(x, y, cx, cy, meia, raio) {
  const dx = Math.max(Math.abs(x - cx) - (meia - raio), 0);
  const dy = Math.max(Math.abs(y - cy) - (meia - raio), 0);
  return Math.hypot(dx, dy) - raio;
}

function distanciaSegmento(x, y, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * abx + (y - ay) * aby) / (abx * abx + aby * aby)));
  return Math.hypot(x - (ax + t * abx), y - (ay + t * aby));
}

function desenharIcone(tamanho) {
  const rgba = Buffer.alloc(tamanho * tamanho * 4);
  const centro = tamanho / 2;
  const meia = tamanho * 0.37;
  const raio = tamanho * 0.15;
  const borda = Math.max(1.5, tamanho * 0.022);
  const espessura = tamanho * 0.07;

  // O "check" da marca, em coordenadas relativas ao tamanho.
  const a = [tamanho * 0.31, tamanho * 0.53];
  const b = [tamanho * 0.45, tamanho * 0.66];
  const c = [tamanho * 0.7, tamanho * 0.36];

  const misturar = (base, cor, cobertura) => [
    base[0] + (cor[0] - base[0]) * cobertura,
    base[1] + (cor[1] - base[1]) * cobertura,
    base[2] + (cor[2] - base[2]) * cobertura,
  ];
  const cobertura = (distancia) => Math.max(0, Math.min(1, 0.5 - distancia));

  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      let cor = FUNDO;

      const dExterno = distanciaRetanguloRedondo(px, py, centro, centro, meia, raio);
      cor = misturar(cor, ROXO, cobertura(dExterno));
      const dInterno = distanciaRetanguloRedondo(px, py, centro, centro, meia - borda, raio - borda);
      cor = misturar(cor, SUPERFICIE, cobertura(dInterno));

      const dCheck =
        Math.min(
          distanciaSegmento(px, py, a[0], a[1], b[0], b[1]),
          distanciaSegmento(px, py, b[0], b[1], c[0], c[1]),
        ) - espessura;
      cor = misturar(cor, VERDE, cobertura(dCheck));

      const i = (y * tamanho + x) * 4;
      rgba[i] = Math.round(cor[0]);
      rgba[i + 1] = Math.round(cor[1]);
      rgba[i + 2] = Math.round(cor[2]);
      rgba[i + 3] = 255; // opaco (fundo cobre tudo, bom pra ícone maskable)
    }
  }
  return rgba;
}

const ARQUIVOS = [
  ["favicon.png", 64],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];

for (const [nome, tamanho] of ARQUIVOS) {
  const caminho = join(PASTA_PUBLIC, nome);
  writeFileSync(caminho, codificarPNG(tamanho, desenharIcone(tamanho)));
  console.log(`gerado ${nome} (${tamanho}x${tamanho})`);
}
