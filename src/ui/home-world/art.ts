/**
 * Tiny async image cache for canvas layers.
 * Canvas render loops call getArtImage() every frame; once the browser has
 * decoded the asset the next frame simply paints it (progressive upgrade —
 * procedural fallbacks keep rendering until then, and forever if the art
 * fails to load).
 */
const cache = new Map<string, HTMLImageElement>();

export function getArtImage(url: string): HTMLImageElement | null {
  let img = cache.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    cache.set(url, img);
  }
  return img;
}

export function artReady(img: HTMLImageElement | null): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}
