import type { CosmicGadgetId, CostumeId, PlanetType, PowerUpType, RocketSkinId } from '../types/game';

const REV = 'v8';
const SPR = `${String(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')}sprites`;

export const PLANET_SPRITES: Record<PlanetType, string> = {
  GRASS: `${SPR}/planets/grass.png?${REV}`,
  ASTEROID: `${SPR}/planets/asteroid.png?${REV}`,
  MECH: `${SPR}/planets/mech.png?${REV}`,
  PLASMA: `${SPR}/planets/plasma.png?${REV}`,
  SUN: `${SPR}/planets/sun.png?${REV}`,
  STANDARD: `${SPR}/planets/standard.png?${REV}`,
  ICE: `${SPR}/planets/ice.png?${REV}`,
  MAGMA: `${SPR}/planets/magma.png?${REV}`,
  CRYSTAL: `${SPR}/planets/crystal.png?${REV}`,
  DARK: `${SPR}/planets/dark.png?${REV}`,
  NEON: `${SPR}/planets/neon.png?${REV}`,
  CELESTIAL_SANCTUARY: `${SPR}/planets/celestial.png?${REV}`,
  ANTIMATTER: `${SPR}/planets/antimatter.png?${REV}`,
  RINGED_GIANT: `${SPR}/planets/ringed.png?${REV}`,
  OCEAN: `${SPR}/planets/ocean.png?${REV}`,
  DESERT: `${SPR}/planets/desert.png?${REV}`,
  JUNGLE: `${SPR}/planets/jungle.png?${REV}`,
  STORM: `${SPR}/planets/storm.png?${REV}`,
  TOXIC: `${SPR}/planets/toxic.png?${REV}`,
  MOON: `${SPR}/planets/moon.png?${REV}`,
  AURORA: `${SPR}/planets/aurora.png?${REV}`,
  FUNGAL: `${SPR}/planets/fungal.png?${REV}`,
  CLOUD: `${SPR}/planets/cloud.png?${REV}`,
  NEBULA: `${SPR}/planets/nebula.png?${REV}`,
};

export const BIOME_SPRITES: Record<string, string> = {
  VERDANT: `${SPR}/planets/grass.png?${REV}`,
  CRYSTALLINE: `${SPR}/planets/crystal.png?${REV}`,
  CYBER: `${SPR}/planets/neon.png?${REV}`,
  NEBULA: `${SPR}/planets/nebula.png?${REV}`,
  VOLCANIC: `${SPR}/planets/magma.png?${REV}`,
  GLACIAL: `${SPR}/planets/ice.png?${REV}`,
};

export const COSTUME_SPRITES: Record<CostumeId, string> = {
  ASTRONAUT: `${SPR}/characters/astronaut.png?${REV}`,
  PIRATE: `${SPR}/characters/pirate.png?${REV}`,
  PRINCESS: `${SPR}/characters/princess.png?${REV}`,
  FOOTBALLER: `${SPR}/characters/footballer.png?${REV}`,
  NINJA: `${SPR}/characters/ninja.png?${REV}`,
  ALIEN: `${SPR}/characters/alien.png?${REV}`,
  CYBER: `${SPR}/characters/cyber.png?${REV}`,
  SOLAR_SOVEREIGN: `${SPR}/characters/solar_sovereign.png?${REV}`,
  STELLA_MAGE: `${SPR}/characters/stella_mage.png?${REV}`,
  CRYO_ARCHON: `${SPR}/characters/cryo_archon.png?${REV}`,
  VOID_RANGER: `${SPR}/characters/void_ranger.png?${REV}`,
  NEBULA_DANCER: `${SPR}/characters/nebula_dancer.png?${REV}`,
  STAR_KNIGHT: `${SPR}/characters/star_knight.png?${REV}`,
  COMET_ACE: `${SPR}/characters/comet_ace.png?${REV}`,
  AURORA_SEER: `${SPR}/characters/aurora_seer.png?${REV}`,
  LUNAR_MONK: `${SPR}/characters/lunar_monk.png?${REV}`,
  STORM_PILOT: `${SPR}/characters/storm_pilot.png?${REV}`,
  PHOENIX_HEIR: `${SPR}/characters/phoenix_heir.png?${REV}`,
  QUANTUM_THIEF: `${SPR}/characters/quantum_thief.png?${REV}`,
};

export const COSTUME_FLIGHT_SPRITES: Partial<Record<CostumeId, string>> = {
  ASTRONAUT: `${SPR}/characters/astronaut_flight.png?${REV}`,
};

export const ROCKET_SPRITES: Record<RocketSkinId, string> = {
  APOLLO: `${SPR}/rockets/apollo.png?${REV}`,
  NEON_CYBER: `${SPR}/rockets/neon_cyber.png?${REV}`,
  GOLDEN_FLARE: `${SPR}/rockets/golden_flare.png?${REV}`,
  DRAGON_FIRE: `${SPR}/rockets/dragon_fire.png?${REV}`,
  ALIEN_ION: `${SPR}/rockets/alien_ion.png?${REV}`,
  VOID_DRAKE: `${SPR}/rockets/void_drake.png?${REV}`,
  STARLIGHT_SAIL: `${SPR}/rockets/starlight_sail.png?${REV}`,
  PHOENIX_CORE: `${SPR}/rockets/phoenix_core.png?${REV}`,
  AURORA_WING: `${SPR}/rockets/aurora_wing.png?${REV}`,
  ICE_LANCE: `${SPR}/rockets/ice_lance.png?${REV}`,
  CLOCKWORK: `${SPR}/rockets/clockwork.png?${REV}`,
  TITAN_FORGE: `${SPR}/rockets/titan_forge.png?${REV}`,
  NEBULA_DRIVE: `${SPR}/rockets/nebula_drive.png?${REV}`,
};

export const GEAR_SPRITES: Record<string, string> = {
  HELMET_DEFAULT: `${SPR}/gear/helmet_default.png?${REV}`,
  HELMET_CHRONO: `${SPR}/gear/helmet_chrono.png?${REV}`,
  HELMET_FROST: `${SPR}/gear/helmet_frost.png?${REV}`,
  HELMET_ASTRAL: `${SPR}/gear/helmet_astral.png?${REV}`,
  HELMET_VOID: `${SPR}/gear/helmet_frost.png?${REV}`,
  HELMET_AURORA: `${SPR}/gear/helmet_astral.png?${REV}`,
  SUIT_DEFAULT: `${SPR}/gear/suit_default.png?${REV}`,
  SUIT_NANOTECH: `${SPR}/gear/suit_nanotech.png?${REV}`,
  SUIT_VULCAN: `${SPR}/gear/suit_vulcan.png?${REV}`,
  SUIT_CELESTIAL: `${SPR}/gear/suit_celestial.png?${REV}`,
  SUIT_HARVEST: `${SPR}/gear/suit_celestial.png?${REV}`,
  SUIT_VOIDWALK: `${SPR}/gear/suit_nanotech.png?${REV}`,
  THRUSTER_DEFAULT: `${SPR}/gear/thruster_default.png?${REV}`,
  THRUSTER_CYBER: `${SPR}/gear/thruster_default.png?${REV}`,
  THRUSTER_DARK_MATTER: `${SPR}/gear/thruster_dark.png?${REV}`,
  THRUSTER_PRISMATIC: `${SPR}/gear/thruster_dark.png?${REV}`,
  THRUSTER_AURORA: `${SPR}/gear/thruster_dark.png?${REV}`,
  RELIC_DEFAULT: `${SPR}/gear/relic_default.png?${REV}`,
  RELIC_CHRONOS: `${SPR}/gear/relic_chronos.png?${REV}`,
  RELIC_ASTRAEA: `${SPR}/gear/relic_chronos.png?${REV}`,
  GEAR_SCARF_RED: `${SPR}/gear/scarf_red.png?${REV}`,
  GEAR_CHRONO_CLOCK: `${SPR}/gear/chrono_clock.png?${REV}`,
  GEAR_CHRONO_ASTROLABE: `${SPR}/gear/chrono_clock.png?${REV}`,
  GEAR_STAR_AMULET: `${SPR}/gear/star_amulet.png?${REV}`,
  GEAR_STAR_AMULET_PLUS: `${SPR}/gear/star_amulet.png?${REV}`,
  GEAR_PRISMATIC_CAPE: `${SPR}/gear/prismatic_cape.png?${REV}`,
  GEAR_VOID_CLOAK: `${SPR}/gear/prismatic_cape.png?${REV}`,
};

export const POWERUP_SPRITES: Record<PowerUpType | 'JETPACK', string> = {
  MAGNET: `${SPR}/powerups/magnet.png?${REV}`,
  COMET: `${SPR}/powerups/comet.png?${REV}`,
  REWIND: `${SPR}/powerups/rewind.png?${REV}`,
  JETPACK: `${SPR}/powerups/jetpack.png?${REV}`,
};

export const GADGET_SPRITES: Record<CosmicGadgetId, string> = {
  VOID_FLARE: `${SPR}/gadgets/void_flare.png?${REV}`,
  STAR_BURST: `${SPR}/gadgets/star_burst.png?${REV}`,
  ICE_SHELL: `${SPR}/gadgets/ice_shell.png?${REV}`,
  DIAMOND_PRISM: `${SPR}/gadgets/diamond_prism.png?${REV}`,
  ORBITAL_BEACON: `${SPR}/gadgets/orbital_beacon.png?${REV}`,
  MAGNET_CORE: `${SPR}/gadgets/magnet_core.png?${REV}`,
  SOLAR_CELL: `${SPR}/gadgets/solar_cell.png?${REV}`,
  GRAVITY_HOOK: `${SPR}/gadgets/gravity_hook.png?${REV}`,
  PHOENIX_CHARM: `${SPR}/gadgets/phoenix_charm.png?${REV}`,
};

export const FURNITURE_SPRITES: Record<string, string> = {
  FURN_FIREPIT: `${SPR}/furniture/firepit.png?${REV}`,
  FURN_TELESCOPE: `${SPR}/furniture/telescope.png?${REV}`,
  FURN_HAMMOCK: `${SPR}/furniture/hammock.png?${REV}`,
  FURN_LANTERNS: `${SPR}/furniture/lanterns.png?${REV}`,
  FURN_CRYSTAL_FOUNTAIN: `${SPR}/furniture/fountain.png?${REV}`,
  FURN_HOLOGRAM_EMITTER: `${SPR}/furniture/hologram.png?${REV}`,
  FURN_CHIMES: `${SPR}/furniture/chimes.png?${REV}`,
  FURN_ROVER: `${SPR}/furniture/rover.png?${REV}`,
  FURN_QUANTUM_ORB: `${SPR}/furniture/quantum_orb.png?${REV}`,
  FURN_STARGATE_ARCH: `${SPR}/furniture/stargate.png?${REV}`,
  FURN_ANTIGRAV_BONSAI: `${SPR}/furniture/bonsai.png?${REV}`,
  FURN_AURA_MONOLITH: `${SPR}/furniture/monolith.png?${REV}`,
  FURN_CELESTIAL_THRONE: `${SPR}/furniture/throne.png?${REV}`,
  FURN_NEBULA_AQUARIUM: `${SPR}/furniture/aquarium.png?${REV}`,
  FURN_CRYSTAL_SPIRE: `${SPR}/furniture/spire.png?${REV}`,
  FURN_NOMAD_TENT: `${SPR}/furniture/nomad_tent.png?${REV}`,
  FURN_STAR_GLOBE: `${SPR}/furniture/orrery.png?${REV}`,
  FURN_VOID_LANTERN: `${SPR}/furniture/void_lantern.png?${REV}`,
  FURN_COMET_BED: `${SPR}/furniture/comet_bed.png?${REV}`,
  FURN_AURORA_CURTAIN: `${SPR}/furniture/aurora_curtain.png?${REV}`,
  FURN_METEOR_GRILL: `${SPR}/furniture/meteor_grill.png?${REV}`,
  FURN_CRYSTAL_HARP: `${SPR}/furniture/crystal_harp.png?${REV}`,
  FURN_ORBIT_POOL: `${SPR}/furniture/orbit_pool.png?${REV}`,
  FURN_STAR_MAP: `${SPR}/furniture/star_map.png?${REV}`,
  FURN_MOON_GATE: `${SPR}/furniture/moon_gate.png?${REV}`,
  FURN_PLASMA_HEARTH: `${SPR}/furniture/plasma_hearth.png?${REV}`,
  FURN_GARDEN_OBELISK: `${SPR}/furniture/garden_obelisk.png?${REV}`,
  FURN_WISHING_WELL: `${SPR}/furniture/wishing_well.png?${REV}`,
  FURN_CRYSTAL_BOOKSHELF: `${SPR}/furniture/crystal_bookshelf.png?${REV}`,
  FURN_NEBULA_WINDMILL: `${SPR}/furniture/nebula_windmill.png?${REV}`,
  FURN_SOLAR_SUNDIAL: `${SPR}/furniture/solar_sundial.png?${REV}`,
  FURN_MOSAIC_BENCH: `${SPR}/furniture/mosaic_bench.png?${REV}`,
  FURN_GRAVITY_HAMMOCK: `${SPR}/furniture/gravity_hammock.png?${REV}`,
  FURN_RADIO_TELESCOPE: `${SPR}/furniture/radio_telescope.png?${REV}`,
  FURN_PLASMA_COFFEE: `${SPR}/furniture/plasma_coffee.png?${REV}`,
  FURN_CONSTELLATION_RUG: `${SPR}/furniture/constellation_rug.png?${REV}`,
  FURN_MOON_SCULPTURE: `${SPR}/furniture/moon_sculpture.png?${REV}`,
  FURN_SOLAR_BENCH: `${SPR}/furniture/solar_bench.png?${REV}`,
  FURN_CRYSTAL_RAINCHAIN: `${SPR}/furniture/crystal_rainchain.png?${REV}`,
  FURN_NEBULA_BIRDHOUSE: `${SPR}/furniture/nebula_birdhouse.png?${REV}`,
  FURN_ANTIMATTER_LAMP: `${SPR}/furniture/antimatter_lamp.png?${REV}`,
  FURN_COMET_VANE: `${SPR}/furniture/comet_vane.png?${REV}`,
  FURN_STAR_MAILBOX: `${SPR}/furniture/star_mailbox.png?${REV}`,
  FURN_KOI_POND: `${SPR}/furniture/koi_pond.png?${REV}`,
  FURN_VOID_GONG: `${SPR}/furniture/void_gong.png?${REV}`,
  FURN_AURORA_SAIL: `${SPR}/furniture/aurora_sail.png?${REV}`,
  FURN_METEOR_ANVIL: `${SPR}/furniture/meteor_anvil.png?${REV}`,
  FURN_SEED_VAULT: `${SPR}/furniture/seed_vault.png?${REV}`,
};

export const HABITAT_SPRITES: Record<number, string> = {
  1: `${SPR}/habitat/tent.png?${REV}`,
  2: `${SPR}/habitat/cabin.png?${REV}`,
  3: `${SPR}/habitat/biodome.png?${REV}`,
  4: `${SPR}/habitat/villa.png?${REV}`,
  5: `${SPR}/habitat/citadel.png?${REV}`,
  6: `${SPR}/habitat/sanctuary.png?${REV}`,
  7: `${SPR}/habitat/palace.png?${REV}`,
  8: `${SPR}/habitat/worldtree.png?${REV}`,
};

export const STORAGE_SPRITE = `${SPR}/habitat/vault.png?${REV}`;

export const PLANT_SPRITES: Record<string, string> = {
  STAR_DAISY: `${SPR}/plants/star_daisy.png?${REV}`,
  MOON_ORCHID: `${SPR}/plants/moon_orchid.png?${REV}`,
  VOID_ROSE: `${SPR}/plants/void_rose.png?${REV}`,
  LUMEN_FRUIT: `${SPR}/plants/lumen_fruit.png?${REV}`,
  COSMIC_LOTUS: `${SPR}/plants/cosmic_lotus.png?${REV}`,
  NEBULA_FERN: `${SPR}/plants/nebula_fern.png?${REV}`,
  SOLAR_CACTUS: `${SPR}/plants/solar_cactus.png?${REV}`,
  AURORA_IVY: `${SPR}/plants/aurora_ivy.png?${REV}`,
  FROST_BLOSSOM: `${SPR}/plants/frost_blossom.png?${REV}`,
};

export const TOOL_SPRITES: Record<string, string> = {
  GRAVITON_PICKAXE: `${SPR}/tools/pickaxe.png?${REV}`,
  STARLIGHT_CAN: `${SPR}/tools/watering_can.png?${REV}`,
  BIO_SCANNER_MK2: `${SPR}/tools/scanner.png?${REV}`,
  SOLAR_WELDER: `${SPR}/tools/welder.png?${REV}`,
  VOID_COMPASS: `${SPR}/tools/void_compass.png?${REV}`,
  STAR_SICKLE: `${SPR}/tools/star_sickle.png?${REV}`,
  GRAVITON_HAMMER: `${SPR}/tools/graviton_hammer.png?${REV}`,
  PRISM_SPYGLASS: `${SPR}/tools/prism_spyglass.png?${REV}`,
};

export const RESOURCE_SPRITES = {
  timber: `${SPR}/resources/timber.png?${REV}`,
  quartz: `${SPR}/resources/quartz.png?${REV}`,
  alloys: `${SPR}/resources/alloys.png?${REV}`,
  plasma: `${SPR}/resources/plasma.png?${REV}`,
  stardust: `${SPR}/resources/stardust.png?${REV}`,
  diamond: `${SPR}/resources/diamond.png?${REV}`,
};

export const COSTUME_WALK_FRAMES: Record<CostumeId, string[]> = Object.fromEntries(
  (Object.keys(COSTUME_SPRITES) as CostumeId[]).map((id) => {
    const file = id.toLowerCase();
    return [id, [0, 1, 2, 3, 4, 5, 6, 7].map((n) => `${SPR}/characters/${file}_walk_${n}.png?${REV}`)];
  })
) as Record<CostumeId, string[]>;

export const COLLECTIBLE_SPRITES = {
  STAR: `${SPR}/items/star.png?${REV}`,
  DIAMOND: `${SPR}/items/diamond.png?${REV}`,
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
  ...Object.values(COSTUME_WALK_FRAMES).flat(),
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

  costume(id: CostumeId, pose: 'idle' | 'flight' | 'walk' = 'idle', frame = 0): HTMLImageElement | null {
    if (pose === 'walk') {
      const frames = COSTUME_WALK_FRAMES[id];
      if (frames && frames.length) {
        const img = this.get(frames[frame % frames.length]);
        if (img) return img;
      }
    }
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
