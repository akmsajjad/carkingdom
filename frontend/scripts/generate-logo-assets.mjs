/**
 * Derives the shipped Car Kingdom logo assets from the master artwork.
 *
 * The master (`scripts/assets/car-kingdom-logo.png`) is a 500x500 RGBA badge:
 * a hexagonal shield, a red car silhouette, and the "CAR KINGDOM" /
 * "AUTO REPAIR LTD." wordmark, all on a transparent ground.
 *
 * The artwork is drawn LIGHT — its wordmark and hexagon are near-white (#fcfcfc
 * at the brightest, #ececec at the darkest edge), which is measurable and not a
 * matter of taste: the darkest pixel in the wordmark band has a relative
 * luminance of about 0.55. On a white background the wordmark and the hexagon
 * are therefore invisible, and only the red car survives. The mark is built for
 * a dark ground, which is what the site header, footer and mobile menu all are.
 *
 * One file is produced: the whole badge, light ink, trimmed. Every surface that
 * shows the logo is dark and every one of them shows the full badge, so there is
 * nothing to crop and no second ink to derive.
 *
 * A note for anyone tempted to reintroduce a crop: the badge's own wordmark is
 * set at 24px inside a 383px-tall lockup (6.3%), so it only becomes legible at
 * roughly 176px tall. A 44px header therefore shows the badge as a mark, not as
 * a readable name — that is inherent to the artwork, not to the sizing here.
 *
 * Trimmed of the master's asymmetric transparent margin (33px left, 24px right,
 * 62px top, 55px bottom), so the artwork sits flush in its box and the rendered
 * size is the artwork's size — which is what makes the header spacing
 * predictable rather than dependent on padding baked into a PNG.
 *
 * Run with: npm run logo
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.join(here, 'assets', 'car-kingdom-logo.png')
const OUT_DIR = path.join(here, '..', 'public', 'images', 'general')

const SIG = Buffer.from('89504e470d0a1a0a', 'hex')

let CRC_TABLE = null
function crcTable() {
  if (CRC_TABLE) return CRC_TABLE
  CRC_TABLE = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    CRC_TABLE[n] = c
  }
  return CRC_TABLE
}
function crc32(buf) {
  const t = crcTable()
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function decode(file) {
  const buf = fs.readFileSync(file)
  if (!buf.slice(0, 8).equals(SIG)) throw new Error(`${file} is not a PNG`)
  let off = 8
  let ihdr = null
  const idat = []
  let plte = null
  let trns = null
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.slice(off + 4, off + 8).toString('ascii')
    const data = buf.slice(off + 8, off + 8 + len)
    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      }
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'PLTE') plte = data
    else if (type === 'tRNS') trns = data
    else if (type === 'IEND') break
    off += 12 + len
  }
  if (ihdr.interlace !== 0) throw new Error('interlaced PNGs are not supported')
  if (ihdr.bitDepth !== 8) throw new Error(`bit depth ${ihdr.bitDepth} is not supported`)
  const { width: W, height: H, colorType } = ihdr
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType]
  const stride = W * ch
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const out = Buffer.alloc(H * stride)
  let pos = 0
  for (let y = 0; y < H; y++) {
    const ft = raw[pos++]
    const line = raw.slice(pos, pos + stride)
    pos += stride
    const cur = out.slice(y * stride, (y + 1) * stride)
    const prev = y > 0 ? out.slice((y - 1) * stride, y * stride) : Buffer.alloc(stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0
      const b = prev[x]
      const c = x >= ch ? prev[x - ch] : 0
      let v = line[x]
      if (ft === 1) v += a
      else if (ft === 2) v += b
      else if (ft === 3) v += (a + b) >> 1
      else if (ft === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      cur[x] = v & 0xff
    }
  }
  const data = Buffer.alloc(W * H * 4)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * stride + x * ch
      const o = (y * W + x) * 4
      if (colorType === 3) {
        const idx = out[i]
        data[o] = plte[idx * 3]
        data[o + 1] = plte[idx * 3 + 1]
        data[o + 2] = plte[idx * 3 + 2]
        data[o + 3] = trns && idx < trns.length ? trns[idx] : 255
      } else if (colorType === 0) {
        data[o] = data[o + 1] = data[o + 2] = out[i]
        data[o + 3] = 255
      } else if (colorType === 2) {
        data[o] = out[i]
        data[o + 1] = out[i + 1]
        data[o + 2] = out[i + 2]
        data[o + 3] = 255
      } else if (colorType === 4) {
        data[o] = data[o + 1] = data[o + 2] = out[i]
        data[o + 3] = out[i + 1]
      } else {
        data[o] = out[i]
        data[o + 1] = out[i + 1]
        data[o + 2] = out[i + 2]
        data[o + 3] = out[i + 3]
      }
    }
  return { width: W, height: H, data }
}

function encode(file, img) {
  const { width: W, height: H, data } = img
  const stride = W * 4
  const raw = Buffer.alloc(H * (stride + 1))
  for (let y = 0; y < H; y++) {
    raw[y * (stride + 1)] = 0
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0)
  ihdr.writeUInt32BE(H, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  fs.writeFileSync(
    file,
    Buffer.concat([
      SIG,
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  )
  return { width: W, height: H, bytes: fs.statSync(file).size }
}

/** Bounding box of everything with meaningful alpha. */
function bbox(img, threshold = 8) {
  const { width: W, height: H, data } = img
  let x0 = W
  let y0 = H
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > threshold) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  if (x1 < 0) throw new Error('the artwork is fully transparent')
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

function crop(img, box) {
  const { width: W, data } = img
  const out = Buffer.alloc(box.w * box.h * 4)
  for (let y = 0; y < box.h; y++) {
    data.copy(
      out,
      y * box.w * 4,
      ((box.y0 + y) * W + box.x0) * 4,
      ((box.y0 + y) * W + box.x0 + box.w) * 4,
    )
  }
  return { width: box.w, height: box.h, data: out }
}

const master = decode(SOURCE)
const box = bbox(master)
const trimmed = crop(master, box)

fs.mkdirSync(OUT_DIR, { recursive: true })

const written = [['logo-full-on-dark.png', trimmed]].map(([name, img]) => ({
  name,
  ...encode(path.join(OUT_DIR, name), img),
}))

console.log(`master    ${master.width}x${master.height}`)
console.log(`trimmed   ${box.w}x${box.h}`)
for (const w of written) {
  console.log(
    `${w.name.padEnd(24)} ${w.width}x${w.height}  ${(w.bytes / 1024).toFixed(1)} kB`,
  )
}
