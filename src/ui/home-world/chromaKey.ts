/**
 * Chroma-key pipeline for AI-generated character sprites.
 *
 * The image model can't be trusted to emit real alpha channels, so sprites are
 * authored on flat chroma-key green (#00FF00) and keyed out once, at load time,
 * into an offscreen canvas with true transparency (plus edge feathering and
 * green-spill removal). Render loops just drawImage() the result.
 */
import { getArtImage, artReady } from './art';

const processed = new Map<string, HTMLCanvasElement | null>();

export function getChromaSprite(url: string): HTMLCanvasElement | null {
  if (processed.has(url)) return processed.get(url) || null;
  const img = getArtImage(url);
  if (!artReady(img)) return null; // still decoding — retry next frame

  try {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const cx = c.getContext('2d', { willReadFrequently: true });
    if (!cx) throw new Error('no 2d context');
    cx.drawImage(img, 0, 0);
    const id = cx.getImageData(0, 0, c.width, c.height);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const dist = Math.sqrt(r * r + (g - 255) * (g - 255) + b * b);
      if (dist < 170) {
        if (dist < 120) {
          d[i + 3] = 0; // solid key green -> fully transparent
        } else {
          // feather band: partial alpha + despill green fringe
          const a = (dist - 120) / 50;
          d[i + 3] = Math.min(d[i + 3], Math.round(255 * a));
          d[i + 1] = Math.min(g, Math.max(r, b) + 30);
        }
      }
    }
    cx.putImageData(id, 0, 0);
    processed.set(url, c);
    return c;
  } catch {
    processed.set(url, null); // poison — never retry (e.g. tainted canvas)
    return null;
  }
}
