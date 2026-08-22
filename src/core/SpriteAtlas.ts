import type { CosmicGadgetId, CostumeId, PlanetType, PowerUpType, RocketSkinId } from '../types/game';

const REV = 'v6';

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

export const COSTUME_SPRITES: Record<CostumeId, string> = {
  ASTRONAUT: `/sprites/characters/astronaut.png?${REV}`,
  PIRATE: `/sprites/characters/pirate.png?${REV}`,
  PRINCESS: `/sprites/characters/princess.png?${REV}`,
  FOOTBALLER: `/sprites/characters/footballer.png?${REV}`,
  NINJA: `/sprites/characters/ninja.png?${REV}`,
  ALIEN: `/sprites/characters/alien.png?${REV}`,
  CYBER: `/sprites/characters/cyber.png?${REV}`,
  SOLAR_SOVEREIGN: `/sprites/characters/solar_sovereign.png?${REV}`,
  STELLA_MAGE: `/sprites/characters/stella_mage.png?${REV}`,
  CRYO_ARCHON: `/sprites/characters/cryo_archon.png?${REV}`,
  VOID_RANGER: `/sprites/characters/void_ranger.png?${REV}`,
  NEBULA_DANCER: `/sprites/characters/nebula_dancer.png?${REV}`,
  STAR_KNIGHT: `/sprites/characters/star_knight.png?${REV}`,
  COMET_ACE: `/sprites/characters/comet_ace.png?${REV}`,
  AURORA_SEER: `/sprites/characters/aurora_seer.png?${REV}`,
  LUNAR_MONK: `/sprites/characters/lunar_monk.png?${REV}`,
  STORM_PILOT: `/sprites/characters/storm_pilot.png?${REV}`,
  PHOENIX_HEIR: `/sprites/characters/phoenix_heir.png?${REV}`,
  QUANTUM_THIEF: `/sprites/characters/quantum_thief.png?${REV}`,
};

export const COSTUME_FLIGHT_SPRITES: Partial<Record<CostumeId, string>> = {
  ASTRONAUT: `/sprites/characters/astronaut_flight.png?${REV}`,
};

export const ROCKET_SPRITES: Record<RocketSkinId, string> = {
  APOLLO: `/sprites/rockets/apollo.png?${REV}`,
  NEON_CYBER: `/sprites/rockets/neon_cyber.png?${REV}`,
  GOLDEN_FLARE: `/sprites/rockets/golden_flare.png?${REV}`,
  DRAGON_FIRE: `/sprites/rockets/dragon_fire.png?${REV}`,
  ALIEN_ION: `/sprites/rockets/alien_ion.png?${REV}`,
  VOID_DRAKE: `/sprites/rockets/void_drake.png?${REV}`,
  STARLIGHT_SAIL: `/sprites/rockets/starlight_sail.png?${REV}`,
  PHOENIX_CORE: `/sprites/rockets/phoenix_core.png?${REV}`,
  AURORA_WING: `/sprites/rockets/aurora_wing.png?${REV}`,
  ICE_LANCE: `/sprites/rockets/ice_lance.png?${REV}`,
  CLOCKWORK: `/sprites/rockets/clockwork.png?${REV}`,
  TITAN_FORGE: `/sprites/rockets/titan_forge.png?${REV}`,
  NEBULA_DRIVE: `/sprites/rockets/nebula_drive.png?${REV}`,
};

export const GEAR_SPRITES: Record<string, string> = {
  HELMET_DEFAULT: `/sprites/gear/helmet_default.png?${REV}`,
  HELMET_CHRONO: `/sprites/gear/helmet_chrono.png?${REV}`,
  HELMET_FROST: `/sprites/gear/helmet_frost.png?${REV}`,
  HELMET_ASTRAL: `/sprites/gear/helmet_astral.png?${REV}`,
  HELMET_VOID: `/sprites/gear/helmet_frost.png?${REV}`,
  HELMET_AURORA: `/sprites/gear/helmet_astral.png?${REV}`,
  SUIT_DEFAULT: `/sprites/gear/suit_default.png?${REV}`,
  SUIT_NANOTECH: `/sprites/gear/suit_nanotech.png?${REV}`,
  SUIT_VULCAN: `/sprites/gear/suit_vulcan.png?${REV}`,
  SUIT_CELESTIAL: `/sprites/gear/suit_celestial.png?${REV}`,
  SUIT_HARVEST: `/sprites/gear/suit_celestial.png?${REV}`,
  SUIT_VOIDWALK: `/sprites/gear/suit_nanotech.png?${REV}`,
  THRUSTER_DEFAULT: `/sprites/gear/thruster_default.png?${REV}`,
  THRUSTER_CYBER: `/sprites/gear/thruster_default.png?${REV}`,
  THRUSTER_DARK_MATTER: `/sprites/gear/thruster_dark.png?${REV}`,
  THRUSTER_PRISMATIC: `/sprites/gear/thruster_dark.png?${REV}`,
  THRUSTER_AURORA: `/sprites/gear/thruster_dark.png?${REV}`,
  RELIC_DEFAULT: `/sprites/gear/relic_default.png?${REV}`,
  RELIC_CHRONOS: `/sprites/gear/relic_chronos.png?${REV}`,
  RELIC_ASTRAEA: `/sprites/gear/relic_chronos.png?${REV}`,
  GEAR_SCARF_RED: `/sprites/gear/scarf_red.png?${REV}`,
  GEAR_CHRONO_CLOCK: `/sprites/gear/chrono_clock.png?${REV}`,
  GEAR_CHRONO_ASTROLABE: `/sprites/gear/chrono_clock.png?${REV}`,
  GEAR_STAR_AMULET: `/sprites/gear/star_amulet.png?${REV}`,
  GEAR_STAR_AMULET_PLUS: `/sprites/gear/star_amulet.png?${REV}`,
  GEAR_PRISMATIC_CAPE: `/sprites/gear/prismatic_cape.png?${REV}`,
  GEAR_VOID_CLOAK: `/sprites/gear/prismatic_cape.png?${REV}`,
};

export const POWERUP_SPRITES: Record<PowerUpType | 'JETPACK', string> = {
  MAGNET: `/sprites/powerups/magnet.png?${REV}`,
  COMET: `/sprites/powerups/comet.png?${REV}`,
  REWIND: `/sprites/powerups/rewind.png?${REV}`,
  JETPACK: `/sprites/powerups/jetpack.png?${REV}`,
};

export const GADGET_SPRITES: Record<CosmicGadgetId, string> = {
  VOID_FLARE: `/sprites/gadgets/void_flare.png?${REV}`,
  STAR_BURST: `/sprites/gadgets/star_burst.png?${REV}`,
  ICE_SHELL: `/sprites/gadgets/ice_shell.png?${REV}`,
  DIAMOND_PRISM: `/sprites/gadgets/diamond_prism.png?${REV}`,
  ORBITAL_BEACON: `/sprites/gadgets/orbital_beacon.png?${REV}`,
  MAGNET_CORE: `/sprites/gadgets/magnet_core.png?${REV}`,
  SOLAR_CELL: `/sprites/gadgets/solar_cell.png?${REV}`,
  GRAVITY_HOOK: `/sprites/gadgets/gravity_hook.png?${REV}`,
  PHOENIX_CHARM: `/sprites/gadgets/phoenix_charm.png?${REV}`,
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
  FURN_GRAVITY_HAMMOCK: `/sprites/furniture/gravity_hammock.png?${REV}`,
  FURN_RADIO_TELESCOPE: `/sprites/furniture/radio_telescope.png?${REV}`,
  FURN_PLASMA_COFFEE: `/sprites/furniture/plasma_coffee.png?${REV}`,
  FURN_CONSTELLATION_RUG: `/sprites/furniture/constellation_rug.png?${REV}`,
  FURN_MOON_SCULPTURE: `/sprites/furniture/moon_sculpture.png?${REV}`,
  FURN_SOLAR_BENCH: `/sprites/furniture/solar_bench.png?${REV}`,
  FURN_CRYSTAL_RAINCHAIN: `/sprites/furniture/crystal_rainchain.png?${REV}`,
  FURN_NEBULA_BIRDHOUSE: `/sprites/furniture/nebula_birdhouse.png?${REV}`,
  FURN_ANTIMATTER_LAMP: `/sprites/furniture/antimatter_lamp.png?${REV}`,
  FURN_COMET_VANE: `/sprites/furniture/comet_vane.png?${REV}`,
  FURN_STAR_MAILBOX: `/sprites/furniture/star_mailbox.png?${REV}`,
  FURN_KOI_POND: `/sprites/furniture/koi_pond.png?${REV}`,
  FURN_VOID_GONG: `/sprites/furniture/void_gong.png?${REV}`,
  FURN_AURORA_SAIL: `/sprites/furniture/aurora_sail.png?${REV}`,
  FURN_METEOR_ANVIL: `/sprites/furniture/meteor_anvil.png?${REV}`,
  FURN_SEED_VAULT: `/sprites/furniture/seed_vault.png?${REV}`,
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
  ...Object.values(COSTUME_SPRITES),
  ...Object.values(COSTUME_FLIGHT_SPRITES),
  ...Object.values(ROCKET_SPRITES),
  ...Object.values(GEAR_SPRITES),
  ...Object.values(POWERUP_SPRITES),
  ...Object.values(GADGET_SPRITES),
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

  costume(id: CostumeId, pose: 'idle' | 'flight' = 'idle'): HTMLImageElement | null {
    if (pose === 'flight') {
      const flight = this.get(COSTUME_FLIGHT_SPRITES[id]);
      if (flight) return flight;
    }
    return this.get(COSTUME_SPRITES[id]);
  }

  rocket(id: RocketSkinId): HTMLImageElement | null {
    return this.get(ROCKET_SPRITES[id]);
  }

  gear(id: string): HTMLImageElement | null {
    return this.get(GEAR_SPRITES[id]);
  }

  powerup(type: PowerUpType | 'JETPACK'): HTMLImageElement | null {
    return this.get(POWERUP_SPRITES[type]);
  }

  gadget(id: CosmicGadgetId): HTMLImageElement | null {
    return this.get(GADGET_SPRITES[id]);
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
