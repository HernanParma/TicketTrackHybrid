import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const size = 1024;
const background = [0xe7, 0xec, 0xe8, 255];
const tile = [0x7e, 0xd3, 0xf0, 255];
const ink = [0x07, 0x38, 0x2e, 255];

const glyphs = {
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  r: ['00000', '00000', '01110', '01001', '01000', '01000', '01000'],
  a: ['00000', '00000', '01110', '00001', '01111', '10001', '01111'],
  c: ['00000', '00000', '01110', '10000', '10000', '10001', '01110'],
  k: ['00000', '01000', '01001', '01010', '01100', '01010', '01001'],
};

function crc32(buffer) {
  let c = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    c ^= buffer[i];
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function setPixel(pixels, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const index = (y * size + x) * 4;
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
  pixels[index + 3] = color[3];
}

function fill(pixels, color) {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
    pixels[i + 3] = color[3];
  }
}

function roundRect(pixels, left, top, side, radius, color) {
  const right = left + side;
  const bottom = top + side;
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      let inside = true;
      if (x < left + radius && y < top + radius) {
        const dx = x - (left + radius);
        const dy = y - (top + radius);
        inside = dx * dx + dy * dy <= radius * radius;
      } else if (x >= right - radius && y < top + radius) {
        const dx = x - (right - radius - 1);
        const dy = y - (top + radius);
        inside = dx * dx + dy * dy <= radius * radius;
      } else if (x < left + radius && y >= bottom - radius) {
        const dx = x - (left + radius);
        const dy = y - (bottom - radius - 1);
        inside = dx * dx + dy * dy <= radius * radius;
      } else if (x >= right - radius && y >= bottom - radius) {
        const dx = x - (right - radius - 1);
        const dy = y - (bottom - radius - 1);
        inside = dx * dx + dy * dy <= radius * radius;
      }
      if (inside) setPixel(pixels, x, y, color);
    }
  }
}

function textWidth(text, scale) {
  return text.length * 6 * scale - scale;
}

function drawText(pixels, text, originX, originY, scale) {
  let cursor = originX;
  for (const char of text) {
    const rows = glyphs[char];
    if (!rows) continue;
    rows.forEach((row, rowIndex) => {
      for (let col = 0; col < row.length; col += 1) {
        if (row[col] !== '1') continue;
        for (let dy = 0; dy < scale; dy += 1) {
          for (let dx = 0; dx < scale; dx += 1) {
            setPixel(pixels, cursor + col * scale + dx, originY + rowIndex * scale + dy, ink);
          }
        }
      }
    });
    cursor += 6 * scale;
  }
}

const pixels = Buffer.alloc(size * size * 4);
fill(pixels, background);
const side = 760;
const left = Math.round((size - side) / 2);
roundRect(pixels, left, left, side, 150, tile);

const scale = 16;
const lineHeight = 7 * scale;
const gap = 22;
const block = lineHeight * 2 + gap;
const top = left + Math.round((side - block) / 2);
const first = 'TICKET';
const second = 'Track';
drawText(pixels, first, left + Math.round((side - textWidth(first, scale)) / 2), top, scale);
drawText(pixels, second, left + Math.round((side - textWidth(second, scale)) / 2), top + lineHeight + gap, scale);

const output = png(size, size, pixels);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const icon = path.join(root, 'assets', 'images', 'icon.png');
fs.writeFileSync(icon, output);
fs.writeFileSync(path.join(root, 'assets', 'images', 'android-icon-foreground.png'), output);
fs.writeFileSync(path.join(root, 'assets', 'images', 'favicon.png'), output);
fs.writeFileSync(path.join(root, 'assets', 'images', 'splash-icon.png'), output);
console.log('icon', icon, output.length);
