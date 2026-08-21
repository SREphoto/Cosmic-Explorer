import type { PlanetType } from '../types/game';

const REV = 'v4';

export const PLANET_SPRITES: Record<PlanetType, string> = {
  GRASS: `/sprites/planets/grass.png?${REV}`,
  ASTEROID: `/sprites/planets/asteroid.png?${REV}`,
  MECH: `/sprites/planets/mech.png?${REV}`,
  PLASMA: `/sprites/planets/plasma.png?${REV}`,
  SUN: `/sprites/planets/sun.png?${REV}`,
  STANDARD: `/sprites/planets/standard.png?${REV}`,
  ICE: `/sprites/planets/ice.png?${REV}`,
  MAGMA: `/sprites/planets/magma.png?${REV}`,
  CRYSTAL: `/sprites/planets/crystal.png?${REV}`,
  DARK: `/sprites/planets/dark.png?${REV}`,
  NEON: `/sprites/planets/neon.png?${REV}`,
  CELESTIAL_SANCTUARY: `/sprites/planets/celestial.png?${REV}`,
  ANTIMATTER: `/sprites/planets/antimatter.png?${REV}`,
  RINGED_GIANT: `/sprites/planets/ringed.png?${REV}`,
  OCEAN: `/sprites/planets/ocean.png?${REV}`,
  DESERT: `/sprites/planets/desert.png?${REV}`,
  JUNGLE: `/sprites/planets/jungle.png?${REV}`,
  STORM: `/sprites/planets/storm.png?${REV}`,
  TOXIC: `/sprites/planets/toxic.png?${REV}`,
  MOON: `/sprites/planets/moon.png?${REV}`,
  AURORA: `/sprites/planets/aurora.png?${REV}`,
  FUNGAL: `/sprites/planets/fungal.png?${REV}`,
  CLOUD: `/sprites/planets/cloud.png?${REV}`,
  NEBULA: `/sprites/planets/nebula.png?${REV}`,
};

export const BIOME_SPRITES: Record<string, string> = {
  VERDANT: `/sprites/planets/grass.png?${REV}`,
  CRYSTALLINE: `/sprites/planets/crystal.png?${REV}`,
  CYBER: `/sprites/planets/neon.png?${REV}`,
  NEBULA: `/sprites/planets/nebula.png?${REV}`,
  VOLCANIC: `/sprites/planets/magma.png?${REV}`,
  GLACIAL: `/sprites/planets/ice.png?${REV}`,
};

export const FURNITURE_SPRITES: Record<string, string> = {
  FURN_FIREPIT: `/sprites/furniture/firepit.png?${REV}`,
  FURN_TELESCOPE: `/sprites/furniture/telescope.png?${REV}`,
  FURN_HAMMOCK: `/sprites/furniture/hammock.png?${REV}`,
  FURN_LANTERNS: `/sprites/furniture/lanterns.png?${REV}`,
  FURN_CRYSTAL_FOUNTAIN: `/sprites/furniture/fountain.png?${REV}`,
  FURN_HOLOGRAM_EMITTER: `/sprites/furniture/hologram.png?${REV}`,
  FURN_CHIMES: `/sprites/furniture/chimes.png?${REV}`,
  FURN_ROVER: `/sprites/furniture/rover.png?${REV}`,
  FURN_QUANTUM_ORB: `/sprites/furniture/quantum_orb.png?${REV}`,
  FURN_STARGATE_ARCH: `/sprites/furniture/stargate.png?${REV}`,
  FURN_ANTIGRAV_BONSAI: `/sprites/furniture/bonsai.png?${REV}`,
  FURN_AURA_MONOLITH: `/sprites/furniture/monolith.png?${REV}`,
  FURN_CELESTIAL_THRONE: `/sprites/furniture/throne.png?${REV}`,
  FURN_NEBULA_AQUARIUM: `/sprites/furniture/aquarium.png?${REV}`,
  FURN_CRYSTAL_SPIRE: `/sprites/furniture/spire.png?${REV}`,
  FURN_NOMAD_TENT: `/sprites/furniture/nomad_tent.png?${REV}`,
  FURN_STAR_GLOBE: `/sprites/furniture/orrery.png?${REV}`,
  FURN_VOID_LANTERN: `/sprites/furniture/void_lantern.png?${REV}`,
  FURN_COMET_BED: `/sprites/furniture/comet_bed.png?${REV}`,
  FURN_AURORA_CURTAIN: `/sprites/furniture/aurora_curtain.png?${REV}`,
  FURN_METEOR_GRILL: `/sprites/furniture/meteor_grill.png?${REV}`,
  FURN_CRYSTAL_HARP: `/sprites/furniture/crystal_harp.png?${REV}`,
  FURN_ORBIT_POOL: `/sprites/furniture/orbit_pool.png?${REV}`,
  FURN_STAR_MAP: `/sprites/furniture/star_map.png?${REV}`,
  FURN_MOON_GATE: `/sprites/furniture/moon_gate.png?${REV}`,
  FURN_PLASMA_HEARTH: `/sprites/furniture/plasma_hearth.png?${REV}`,
  FURN_GARDEN_OBELISK: `/sprites/furniture/garden_obelisk.png?${REV}`,
  FURN_WISHING_WELL: `/sprites/furniture/wishing_well.png?${REV}`,
  FURN_CRYSTAL_BOOKSHELF: `/sprites/furniture/crystal_bookshelf.png?${REV}`,
  FURN_NEBULA_WINDMILL: `/sprites/furniture/nebula_windmill.png?${REV}`,
  FURN_SOLAR_SUNDIAL: `/sprites/furniture/solar_sundial.png?${REV}`,
  FURN_MOSAIC_BENCH: `/sprites/furniture/mosaic_bench.png?${REV}`,
};

export const HABITAT_SPRITES: Record<number, string> = {
  1: `/sprites/habitat/tent.png?${REV}`,
  2: `/sprites/habitat/cabin.png?${REV}`,
  3: `/sprites/habitat/biodome.png?${REV}`,
  4: `/sprites/habitat/villa.png?${REV}`,
  5: `/sprites/habitat/citadel.png?${REV}`,
  6: `/sprites/habitat/sanctuary.png?${REV}`,
  7: `/sprites/habitat/palace.png?${REV}`,
  8: `/sprites/habitat/worldtree.png?${REV}`,
};

export const STORAGE_SPRITE = `/sprites/habitat/vault.png?${REV}`;

export const PLANT_SPRITES: Record<string, string> = {
  STAR_DAISY: `/sprites/plants/star_daisy.png?${REV}`,
  MOON_ORCHID: `/sprites/plants/moon_orchid.png?${REV}`,
  VOID_ROSE: `/sprites/plants/void_rose.png?${REV}`,
  LUMEN_FRUIT: `/sprites/plants/lumen_fruit.png?${REV}`,
  COSMIC_LOTUS: `/sprites/plants/cosmic_lotus.png?${REV}`,
  NEBULA_FERN: `/sprites/plants/nebula_fern.png?${REV}`,
  SOLAR_CACTUS: `/sprites/plants/solar_cactus.png?${REV}`,
  AURORA_IVY: `/sprites/plants/aurora_ivy.png?${REV}`,
  FROST_BLOSSOM: `/sprites/plants/frost_blossom.png?${REV}`,
};

export const TOOL_SPRITES: Record<string, string> = {
  GRAVITON_PICKAXE: `/sprites/tools/pickaxe.png?${REV}`,
  STARLIGHT_CAN: `/sprites/tools/watering_can.png?${REV}`,
  BIO_SCANNER_MK2: `/sprites/tools/scanner.png?${REV}`,
  SOLAR_WELDER: `/sprites/tools/welder.png?${REV}`,
  VOID_COMPASS: `/sprites/tools/void_compass.png?${REV}`,
  STAR_SICKLE: `/sprites/tools/star_sickle.png?${REV}`,
  GRAVITON_HAMMER: `/sprites/tools/graviton_hammer.png?${REV}`,
  PRISM_SPYGLASS: `/sprites/tools/prism_spyglass.png?${REV}`,
};

export const RESOURCE_SPRITES = {
  timber: `/sprites/resources/timber.png?${REV}`,
  quartz: `/sprites/resources/quartz.png?${REV}`,
  alloys: `/sprites/resources/alloys.png?${REV}`,
  plasma: `/sprites/resources/plasma.png?${REV}`,
  stardust: `/sprites/resources/stardust.png?${REV}`,
  diamond: `/sprites/resources/diamond.png?${REV}`,
};

export const COLLECTIBLE_SPRITES = {
  STAR: `/sprites/items/star.png?${REV}`,
  DIAMOND: `/sprites/items/diamond.png?${REV}`,
};

const ALL_SRCS: string[] = [
  ...Object.values(PLANET_SPRITES),
  ...Object.values(BIOME_SPRITES),
  ...Object.values(FURNITURE_SPRITES),
  ...Object.values(HABITAT_SPRITES),
  STORAGE_SPRITE,
  ...Object.values(PLANT_SPRITES),
  ...Object.values(TOOL_SPRITES),
  ...Object.values(RESOURCE_SPRITES),
  ...Object.values(COLLECTIBLE_SPRITES),
];

class SpriteAtlas {
  private cache = new Map<string, HTMLImageElement>();

  get(src: string | undefined | null): HTMLImageElement | null {
    if (!src) return null;
    let img = this.cache.get(src);
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      this.cache.set(src, img);
    }
    if (img.complete && img.naturalWidth > 0) return img;
    return null;
  }

  planet(type: PlanetType): HTMLImageElement | null {
    return this.get(PLANET_SPRITES[type]);
  }

  biome(id: string): HTMLImageElement | null {
    return this.get(BIOME_SPRITES[id]);
  }

  furniture(id: string): HTMLImageElement | null {
    return this.get(FURNITURE_SPRITES[id]);
  }

  habitat(tier: number): HTMLImageElement | null {
    return this.get(HABITAT_SPRITES[tier] || HABITAT_SPRITES[1]);
  }

  plant(type: string): HTMLImageElement | null {
    return this.get(PLANT_SPRITES[type]);
  }

  tool(id: string): HTMLImageElement | null {
    return this.get(TOOL_SPRITES[id]);
  }

  preloadAll(): void {
    for (const src of ALL_SRCS) {
      this.get(src);
    }
  }
}

export const spriteAtlas = new SpriteAtlas();

if (typeof window !== 'undefined') {
  spriteAtlas.preloadAll();
}

export function drawCenteredSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  size: number
): boolean {
  if (!img) return false;
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  return true;
}
