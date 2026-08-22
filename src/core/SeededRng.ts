/** Fixed galaxy seed so every voyage of the same sector is identical. */
export const GALAXY_SEED = 20260821;

export function hash32(n: number): number {
  let x = (n + GALAXY_SEED) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  x = (x ^ (x >>> 16)) >>> 0;
  return x;
}

export function rand01(index: number, salt = 0): number {
  return hash32(index * 374761393 + salt * 668265263) / 4294967296;
}

export function randRange(index: number, salt: number, min: number, max: number): number {
  return min + rand01(index, salt) * (max - min);
}

export function randInt(index: number, salt: number, min: number, max: number): number {
  return Math.floor(randRange(index, salt, min, max + 1 - 1e-9));
}

export function pick<T>(index: number, salt: number, items: T[]): T {
  return items[Math.floor(rand01(index, salt) * items.length) % items.length];
}

export function chance(index: number, salt: number, p: number): boolean {
  return rand01(index, salt) < p;
}
