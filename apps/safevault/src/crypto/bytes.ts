import { CryptoError } from './errors';

/**
 * Byte helpers with no dependency on TextEncoder/atob (not guaranteed on every
 * Hermes build). Decoders are strict: malformed input throws instead of being
 * silently "repaired", which matters for authenticated data.
 */

export function utf8Encode(text: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i++;
      } else code = 0xfffd;
    } else if (code >= 0xd800 && code <= 0xdfff) code = 0xfffd; // lone surrogate
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    else if (code < 0x10000) out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    else out.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 63), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
  }
  return Uint8Array.from(out);
}

export function utf8Decode(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  const cont = (k: number) => {
    const b = bytes[k];
    if (b === undefined || (b & 0xc0) !== 0x80) throw new CryptoError('malformed');
    return b & 63;
  };
  while (i < bytes.length) {
    const b = bytes[i]!;
    let code: number;
    if (b < 0x80) {
      code = b;
      i += 1;
    } else if ((b & 0xe0) === 0xc0) {
      code = ((b & 31) << 6) | cont(i + 1);
      if (code < 0x80) throw new CryptoError('malformed');
      i += 2;
    } else if ((b & 0xf0) === 0xe0) {
      code = ((b & 15) << 12) | (cont(i + 1) << 6) | cont(i + 2);
      if (code < 0x800) throw new CryptoError('malformed');
      i += 3;
    } else if ((b & 0xf8) === 0xf0) {
      code = ((b & 7) << 18) | (cont(i + 1) << 12) | (cont(i + 2) << 6) | cont(i + 3);
      if (code < 0x10000 || code > 0x10ffff) throw new CryptoError('malformed');
      i += 4;
    } else throw new CryptoError('malformed');
    if (code >= 0x10000) {
      code -= 0x10000;
      out += String.fromCharCode(0xd800 + (code >> 10), 0xdc00 + (code & 1023));
    } else out += String.fromCharCode(code);
  }
  return out;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP = (() => {
  const t = new Int16Array(128).fill(-1);
  for (let i = 0; i < B64.length; i++) t[B64.charCodeAt(i)] = i;
  return t;
})();

export function toBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]! + (b === undefined ? '=' : B64[(n >> 6) & 63]!) + (c === undefined ? '=' : B64[n & 63]!);
  }
  return out;
}

export function fromBase64(text: string): Uint8Array {
  if (typeof text !== 'string' || text.length % 4 !== 0) throw new CryptoError('malformed');
  const pad = text.endsWith('==') ? 2 : text.endsWith('=') ? 1 : 0;
  const out = new Uint8Array((text.length / 4) * 3 - pad);
  let o = 0;
  for (let i = 0; i < text.length; i += 4) {
    const v = [0, 1, 2, 3].map((k) => {
      const ch = text.charCodeAt(i + k);
      if (ch === 61 && i + 4 === text.length && k >= 4 - pad) return 0; // trailing "="
      const d = ch < 128 ? B64_LOOKUP[ch]! : -1;
      if (d < 0) throw new CryptoError('malformed');
      return d;
    });
    const n = (v[0]! << 18) | (v[1]! << 12) | (v[2]! << 6) | v[3]!;
    if (o < out.length) out[o++] = (n >> 16) & 255;
    if (o < out.length) out[o++] = (n >> 8) & 255;
    if (o < out.length) out[o++] = n & 255;
  }
  return out;
}

export function toHex(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** Constant-time comparison (no early exit on the first differing byte). */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/**
 * Overwrites key material in place. JavaScript gives no guarantee that the engine
 * never copied the buffer, but zeroing the buffers we own removes the obvious copies.
 */
export function wipe(...buffers: (Uint8Array | null | undefined)[]): void {
  for (const b of buffers) b?.fill(0);
}
