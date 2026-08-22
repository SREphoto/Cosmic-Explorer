import { Collectible } from '../entities/Collectible';
import { Planet } from '../entities/Planet';
import { PowerUp } from '../entities/PowerUp';
import { ConstellationData, DigSite, PlanetType } from '../types/game';
import { CHECKPOINT_PLANETS, LEVEL_BIOMES, ZODIAC_CONSTELLATIONS } from '../core/Config';
import { chance, pick, rand01, randRange } from '../core/SeededRng';

export class ProceduralGenerator {
  public highestGeneratedY: number = 0;
  public screenWidth: number = 480;
  public totalPlanetsGenerated: number = 0;

  // Level & Biome Helper by Planet Index
  public static getLevelForPlanetIndex(planetIndex: number) {
    const level = LEVEL_BIOMES.find(
      (b) => planetIndex >= b.minPlanetIndex && planetIndex <= b.maxPlanetIndex
    ) || LEVEL_BIOMES[LEVEL_BIOMES.length - 1];
    return level;
  }

  // Zodiac Constellation Helper by Planet Index
  public static getConstellationForPlanetIndex(planetIndex: number): ConstellationData {
    const zodiac = ZODIAC_CONSTELLATIONS.find(
      (z) => planetIndex >= z.minPlanetIndex && planetIndex <= z.maxPlanetIndex
    ) || ZODIAC_CONSTELLATIONS[ZODIAC_CONSTELLATIONS.length - 1];
    return zodiac;
  }

  // Altitude Biome Tier Helper
  public static getAltitudeBiome(altitude: number, planetIndex: number = 1): { tier: number; name: string; types: PlanetType[] } {
    const level = ProceduralGenerator.getLevelForPlanetIndex(planetIndex);
    return {
      tier: level.levelNumber,
      name: level.name,
      types: level.featuredTypes
    };
  }

  public init(screenWidth: number) {
    this.screenWidth = screenWidth;
    this.highestGeneratedY = 0;
    this.totalPlanetsGenerated = 0;
  }

  public generateInitialCluster(
    planets: Planet[],
    collectibles: Collectible[],
    powerUps: PowerUp[],
    startCheckpointId: string = 'CHECKPOINT_EARTH'
  ) {
    planets.length = 0;
    collectibles.length = 0;
    powerUps.length = 0;

    const startCheckpoint = CHECKPOINT_PLANETS.find((c) => c.id === startCheckpointId) || CHECKPOINT_PLANETS[0];
    const startY = startCheckpoint.y;
    this.totalPlanetsGenerated = startCheckpoint.targetPlanetIndex;

    const level = ProceduralGenerator.getLevelForPlanetIndex(this.totalPlanetsGenerated);

    // Create Starting Checkpoint Planet
    const startPlanet = new Planet({
      id: `checkpoint_${startCheckpoint.id}`,
      x: this.screenWidth / 2,
      y: startY,
      radius: 105,
      mass: 2.2,
      angularVelocity: 1.8,
      rotationDirection: 1,
      type: startCheckpoint.planetType,
      color: startCheckpoint.primaryColor,
      secondaryColor: startCheckpoint.secondaryColor,
      atmosphereColor: startCheckpoint.atmosphereColor,
      surfaceDecorations: [
        { angle: 0, type: 'CHECKPOINT_BEACON', size: 12 },
        { angle: 1.2, type: 'TREE', size: 10 },
        { angle: 2.4, type: 'HOUSE', size: 12 },
        { angle: 3.6, type: 'TELESCOPE', size: 10 },
        { angle: 4.8, type: 'DAISY', size: 7 }
      ],
      visited: true,
      hasRing: true,
      ringColor: startCheckpoint.ringColor,
      isCheckpoint: true,
      checkpointId: startCheckpoint.id,
      checkpointName: startCheckpoint.name,
      altitudeTier: level.levelNumber,
      digSites: buildDigSites(1, startCheckpoint.planetType, 105)
    });

    planets.push(startPlanet);
    planets.push(this.spawnMoon(startPlanet, Math.max(1, startCheckpoint.targetPlanetIndex || 1), 0));
    this.highestGeneratedY = startY;

    // Generate upcoming world ahead of start with spacious distances
    this.generateUpTo(startY - 4200, planets, collectibles, powerUps);
  }

  public generateUpTo(targetY: number, planets: Planet[], collectibles: Collectible[], powerUps: PowerUp[]) {
    while (this.highestGeneratedY > targetY) {
      const lastMain = [...planets].reverse().find((pl) => !pl.isMoon && !pl.isSecret) || planets[planets.length - 1];
      this.totalPlanetsGenerated++;
      const i = this.totalPlanetsGenerated;

      const checkpointCandidate = CHECKPOINT_PLANETS.find((cp) => cp.targetPlanetIndex === i);
      let isGoalCheckpoint = !!checkpointCandidate;
      const checkpointInfo = checkpointCandidate;

      const minX = -this.screenWidth * 0.35;
      const maxX = this.screenWidth * 1.35;
      let nextX = minX + rand01(i, 1) * (maxX - minX);

      if (Math.abs(nextX - lastMain.x) < 180) {
        const shift = 220 + rand01(i, 2) * 140;
        nextX = lastMain.x > this.screenWidth / 2 ? lastMain.x - shift : lastMain.x + shift;
        nextX = Math.max(minX, Math.min(maxX, nextX));
      }

      const level = ProceduralGenerator.getLevelForPlanetIndex(i);
      const isLevelFinalPlanet = i === level.maxPlanetIndex;
      if (isLevelFinalPlanet) isGoalCheckpoint = true;

      const isDark = !isGoalCheckpoint && level.levelNumber >= 2 && chance(i, 3, level.levelNumber >= 4 ? 0.24 : 0.16);
      const isSun = !isGoalCheckpoint && !isDark && chance(i, 4, 0.12);
      const isRingedGiant = !isGoalCheckpoint && !isDark && !isSun && chance(i, 5, 0.16);
      const isAntimatter = !isGoalCheckpoint && !isDark && level.levelNumber >= 5 && chance(i, 6, 0.12);
      const isMoonlet = !isGoalCheckpoint && !isDark && !isSun && chance(i, 7, 0.12);
      const isStormGiant = !isGoalCheckpoint && !isDark && !isSun && !isMoonlet && level.levelNumber >= 3 && chance(i, 8, 0.10);

      let type: PlanetType = level.featuredTypes[Math.floor(rand01(i, 9) * level.featuredTypes.length)];
      if (isGoalCheckpoint && checkpointInfo) type = checkpointInfo.planetType;
      else if (isAntimatter) type = 'ANTIMATTER';
      else if (isDark) type = 'DARK';
      else if (isSun) type = 'SUN';
      else if (isStormGiant) type = 'STORM';
      else if (isRingedGiant) type = 'RINGED_GIANT';
      else if (isMoonlet) type = 'MOON';

      const palette = paletteForPlanet(type);
      let color = palette.color;
      let secondaryColor = palette.secondaryColor;
      let atmosphereColor = palette.atmosphereColor;
      let ringColor = palette.ringColor;
      if (isGoalCheckpoint && checkpointInfo) {
        color = checkpointInfo.primaryColor;
        secondaryColor = checkpointInfo.secondaryColor;
        atmosphereColor = checkpointInfo.atmosphereColor;
        ringColor = checkpointInfo.ringColor || 'rgba(250, 204, 21, 0.6)';
      }

      const radius = pickPlanetRadius(type, isGoalCheckpoint, i);
      const mass = Math.pow(radius / 70, 1.75) * (isSun || type === 'STORM' ? 3.5 : type === 'MOON' ? 0.55 : 1.25);
      const hasRing =
        isGoalCheckpoint ||
        type === 'RINGED_GIANT' ||
        type === 'STORM' ||
        (!isSun && type !== 'MOON' && chance(i, 10, 0.38));

      const verticalGap = lastMain.radius + radius + 280 + rand01(i, 11) * 180;
      const nextY = lastMain.y - verticalGap;
      const minSep = lastMain.radius + radius + 48;
      if (Math.abs(nextX - lastMain.x) < minSep) {
        const shift = minSep + 40 + rand01(i, 12) * 80;
        nextX = lastMain.x > this.screenWidth / 2 ? lastMain.x - shift : lastMain.x + shift;
        nextX = Math.max(minX, Math.min(maxX, nextX));
      }

      const decorations = buildDecorations(i, type, isGoalCheckpoint);
      const digSites = buildDigSites(i, type, radius);

      const planet = new Planet({
        id: isGoalCheckpoint && checkpointInfo ? `checkpoint_${checkpointInfo.id}` : `planet_${i}`,
        x: nextX,
        y: nextY,
        radius,
        mass,
        angularVelocity: 1.5 + rand01(i, 20) * 1.2,
        rotationDirection: chance(i, 21, 0.5) ? 1 : -1,
        type,
        color,
        secondaryColor,
        atmosphereColor,
        hasRing,
        ringColor,
        surfaceDecorations: decorations,
        visited: false,
        isCheckpoint: isGoalCheckpoint,
        checkpointId: checkpointInfo?.id,
        checkpointName: checkpointInfo ? `${checkpointInfo.name} (Planet #${checkpointInfo.targetPlanetIndex})` : undefined,
        isLevelGoal: isLevelFinalPlanet,
        levelGoalNumber: level.levelNumber,
        isDark: type === 'DARK',
        altitudeTier: level.levelNumber,
        pathLane: 'MAIN',
        digSites
      });

      planets.push(planet);
      this.spawnStarArc(lastMain, planet, collectibles, i);

      if (chance(i, 22, 0.22)) {
        collectibles.push(
          new Collectible({
            id: `diamond_${i}`,
            x: (lastMain.x + planet.x) / 2 + (rand01(i, 23) - 0.5) * 70,
            y: (lastMain.y + planet.y) / 2,
            type: 'DIAMOND',
            radius: 12
          })
        );
      }

      if (i > 1 && chance(i, 24, 0.22)) {
        const r = rand01(i, 25);
        const ptype = r < 0.35 ? 'MAGNET' : r < 0.7 ? 'COMET' : 'REWIND';
        powerUps.push(
          new PowerUp({
            id: `powerup_${i}`,
            x: planet.x + (rand01(i, 26) - 0.5) * 80,
            y: planet.y - planet.radius - 55,
            type: ptype,
            duration: 5.0
          })
        );
      }

      const moonCount = isGoalCheckpoint ? 2 : chance(i, 30, 0.55) ? 1 : chance(i, 31, 0.2) ? 2 : 0;
      for (let m = 0; m < moonCount; m++) {
        planets.push(this.spawnMoon(planet, i, m));
      }

      // Secret side-path every 7 worlds, reachable by riding a long-orbit moon
      if (!isGoalCheckpoint && i >= 6 && i % 7 === 0) {
        const side = chance(i, 40, 0.5) ? 1 : -1;
        const secret = this.spawnSecretPlanet(planet, i, side);
        planets.push(secret);
        planets.push(this.spawnBridgeMoon(planet, secret, i));
        this.spawnStarArc(planet, secret, collectibles, i + 900);
        collectibles.push(
          new Collectible({
            id: `secret_diamond_${i}`,
            x: (planet.x + secret.x) / 2,
            y: (planet.y + secret.y) / 2,
            type: 'DIAMOND',
            radius: 13
          })
        );
      }

      this.highestGeneratedY = nextY;
    }
  }

  private spawnMoon(parent: Planet, index: number, slot: number): Planet {
    const orbitRadius = parent.radius + 68 + randRange(index, 50 + slot, 24, 90);
    const moonRadius = 18 + randRange(index, 52 + slot, 8, 22);
    const pal = paletteForPlanet('MOON');
    return new Planet({
      id: `moon_${index}_${slot}`,
      x: parent.x + orbitRadius,
      y: parent.y,
      radius: moonRadius,
      mass: Math.pow(moonRadius / 70, 1.75) * 0.45,
      angularVelocity: 1.2 + rand01(index, 53 + slot),
      rotationDirection: chance(index, 54 + slot, 0.5) ? 1 : -1,
      type: 'MOON',
      color: pal.color,
      secondaryColor: pal.secondaryColor,
      atmosphereColor: pal.atmosphereColor,
      surfaceDecorations: [{ angle: rand01(index, 55 + slot) * Math.PI * 2, type: 'CRATER', size: 5 }],
      visited: false,
      isMoon: true,
      parentPlanetId: parent.id,
      orbitRadius,
      orbitAngle: rand01(index, 56 + slot) * Math.PI * 2,
      orbitSpeed: (0.35 + rand01(index, 57 + slot) * 0.55) * (chance(index, 58 + slot, 0.5) ? 1 : -1),
      pathLane: 'MAIN',
      altitudeTier: parent.altitudeTier,
      digSites: buildDigSites(index * 10 + slot, 'MOON', moonRadius)
    });
  }

  private spawnBridgeMoon(parent: Planet, secret: Planet, index: number): Planet {
    const dx = secret.x - parent.x;
    const dy = secret.y - parent.y;
    const dist = Math.hypot(dx, dy);
    const orbitRadius = Math.max(parent.radius + 90, dist * 0.52);
    const pal = paletteForPlanet('MOON');
    return new Planet({
      id: `bridge_moon_${index}`,
      x: parent.x + orbitRadius,
      y: parent.y,
      radius: 24,
      mass: 0.4,
      angularVelocity: 1.4,
      rotationDirection: 1,
      type: 'MOON',
      color: pal.color,
      secondaryColor: '#f9a8d4',
      atmosphereColor: '#f472b6',
      hasRing: true,
      ringColor: 'rgba(244, 114, 182, 0.55)',
      surfaceDecorations: [{ angle: 0, type: 'CRATER', size: 6 }],
      visited: false,
      isMoon: true,
      parentPlanetId: parent.id,
      orbitRadius,
      orbitAngle: Math.atan2(dy, dx),
      orbitSpeed: 0.42,
      pathLane: 'SECRET',
      altitudeTier: parent.altitudeTier
    });
  }

  private spawnSecretPlanet(anchor: Planet, index: number, side: number): Planet {
    const type = pick(index, 41, ['CRYSTAL', 'NEBULA', 'AURORA', 'ANTIMATTER', 'CELESTIAL_SANCTUARY'] as PlanetType[]);
    const pal = paletteForPlanet(type);
    const radius = 54 + randRange(index, 42, 0, 28);
    return new Planet({
      id: `secret_${index}`,
      x: anchor.x + side * (360 + randRange(index, 43, 0, 90)),
      y: anchor.y - 20 - randRange(index, 44, 0, 50),
      radius,
      mass: Math.pow(radius / 70, 1.75) * 1.1,
      angularVelocity: 1.3 + rand01(index, 45),
      rotationDirection: side > 0 ? -1 : 1,
      type,
      color: pal.color,
      secondaryColor: pal.secondaryColor,
      atmosphereColor: pal.atmosphereColor,
      hasRing: true,
      ringColor: pal.ringColor,
      surfaceDecorations: [{ angle: 0.4, type: 'CRYSTAL', size: 10 }],
      visited: false,
      isSecret: true,
      secretRevealed: false,
      pathLane: 'SECRET',
      altitudeTier: anchor.altitudeTier,
      digSites: buildDigSites(index + 500, type, radius)
    });
  }

  private spawnStarArc(p1: Planet, p2: Planet, collectibles: Collectible[], seed: number) {
    const starCount = 5 + Math.floor(rand01(seed, 60) * 3);
    for (let n = 1; n <= starCount; n++) {
      const t = n / (starCount + 1);
      const arcOffset = Math.sin(t * Math.PI) * 36;
      collectibles.push(
        new Collectible({
          id: `star_${p1.id}_${n}`,
          x: p1.x + (p2.x - p1.x) * t + arcOffset,
          y: p1.y + (p2.y - p1.y) * t,
          type: 'STAR',
          radius: 9
        })
      );
    }
  }

  public cleanupFarObjects(
    minY: number,
    planets: Planet[],
    collectibles: Collectible[],
    powerUps: PowerUp[]
  ) {
    const cutoffY = minY + 2200;
    const keep = new Set<string>();
    planets.forEach((pl) => {
      if (pl.y <= cutoffY) keep.add(pl.id);
    });
    planets.forEach((pl) => {
      if (pl.parentPlanetId && keep.has(pl.id)) keep.add(pl.parentPlanetId);
      if (pl.isSecret && !keep.has(pl.id)) {
        const near = planets.some((o) => !o.isSecret && Math.hypot(o.x - pl.x, o.y - pl.y) < 520 && keep.has(o.id));
        if (near) keep.add(pl.id);
      }
    });
    for (let i = planets.length - 1; i >= 1; i--) {
      if (!keep.has(planets[i].id) && planets[i].y > cutoffY) planets.splice(i, 1);
    }
    for (let i = collectibles.length - 1; i >= 0; i--) {
      if (collectibles[i].y > cutoffY) collectibles.splice(i, 1);
    }
    for (let i = powerUps.length - 1; i >= 0; i--) {
      if (powerUps[i].y > cutoffY) powerUps.splice(i, 1);
    }
  }
}

function isCelestialOrSun(t: PlanetType): boolean {
  return t === 'SUN' || t === 'CELESTIAL_SANCTUARY';
}

function pickPlanetRadius(type: PlanetType, isGoal: boolean, index = 1): number {
  if (isGoal) return 112 + rand01(index, 70) * 20;
  if (isCelestialOrSun(type)) return 148 + rand01(index, 71) * 58;
  const roll = rand01(index, 72);
  switch (type) {
    case 'MOON':
      return roll < 0.6 ? 26 + rand01(index, 73) * 16 : 42 + rand01(index, 74) * 20;
    case 'ASTEROID':
      return roll < 0.45 ? 32 + rand01(index, 73) * 18 : 52 + rand01(index, 74) * 26;
    case 'STORM':
    case 'RINGED_GIANT':
      return roll < 0.4 ? 148 + rand01(index, 73) * 32 : 186 + rand01(index, 74) * 58;
    case 'CLOUD':
    case 'AURORA':
      return 128 + rand01(index, 73) * 52;
    case 'OCEAN':
    case 'JUNGLE':
    case 'DESERT':
      return roll < 0.22 ? 50 + rand01(index, 73) * 22 : 76 + rand01(index, 74) * 44;
    case 'TOXIC':
    case 'FUNGAL':
    case 'NEBULA':
      return roll < 0.3 ? 46 + rand01(index, 73) * 22 : 70 + rand01(index, 74) * 40;
    default:
      if (roll < 0.16) return 34 + rand01(index, 73) * 22;
      if (roll < 0.68) return 70 + rand01(index, 74) * 40;
      if (roll < 0.88) return 112 + rand01(index, 75) * 30;
      return 148 + rand01(index, 76) * 42;
  }
}

function buildDecorations(i: number, type: PlanetType, isGoal: boolean): { angle: number; type: any; size: number }[] {
  const decorations: { angle: number; type: any; size: number }[] = [];
  if (isGoal) {
    decorations.push({ angle: 0, type: 'CHECKPOINT_BEACON', size: 14 });
    decorations.push({ angle: Math.PI * 0.75, type: 'TELESCOPE', size: 10 });
    decorations.push({ angle: Math.PI * 1.5, type: 'HOUSE', size: 14 });
  } else if (type === 'DARK') {
    decorations.push({ angle: rand01(i, 80) * Math.PI, type: 'DARK_CRYSTAL', size: 12 });
    decorations.push({ angle: rand01(i, 81) * Math.PI + Math.PI, type: 'DARK_CRYSTAL', size: 14 });
    decorations.push({ angle: rand01(i, 82) * Math.PI * 2, type: 'SPIKE', size: 11 });
  } else if (type === 'ANTIMATTER') {
    decorations.push({ angle: rand01(i, 80) * Math.PI * 2, type: 'RUNES', size: 14 });
    decorations.push({ angle: rand01(i, 81) * Math.PI * 2, type: 'CRYSTAL', size: 12 });
  } else {
    decorations.push({ angle: rand01(i, 80) * Math.PI, type: 'CRATER', size: 6 + rand01(i, 83) * 6 });
    decorations.push({ angle: rand01(i, 81) * Math.PI * 2, type: 'CRATER', size: 5 + rand01(i, 84) * 5 });
    if (type === 'GRASS' || type === 'JUNGLE') {
      if (chance(i, 85, 0.6)) decorations.push({ angle: rand01(i, 86) * Math.PI * 2, type: 'DAISY', size: 6 });
      if (chance(i, 87, 0.5)) decorations.push({ angle: rand01(i, 88) * Math.PI * 2, type: 'TREE', size: 10 });
    } else if (type === 'MAGMA' && chance(i, 85, 0.6)) {
      decorations.push({ angle: rand01(i, 86) * Math.PI * 2, type: 'LAVA_VENT', size: 10 });
    } else if ((type === 'CRYSTAL' || type === 'NEBULA') && chance(i, 85, 0.7)) {
      decorations.push({ angle: rand01(i, 86) * Math.PI * 2, type: 'CRYSTAL', size: 11 });
    }
  }
  return decorations;
}

function buildDigSites(i: number, type: PlanetType, _radius: number): DigSite[] {
  const spec = digSpecFor(type);
  const count = 2 + (chance(i, 90, 0.5) ? 1 : 0) + (chance(i, 91, 0.3) ? 1 : 0);
  const sites: DigSite[] = [];
  for (let n = 0; n < count; n++) {
    sites.push({
      id: `dig_${i}_${n}`,
      angle: ((n + rand01(i, 92 + n)) / count) * Math.PI * 2,
      resource: spec.resource,
      amount: spec.amount + Math.floor(rand01(i, 93 + n) * 4),
      requiredTool: spec.tool,
      harvested: false
    });
  }
  return sites;
}

function digSpecFor(type: PlanetType): { resource: DigSite['resource']; amount: number; tool: string } {
  switch (type) {
    case 'GRASS':
    case 'JUNGLE':
    case 'STANDARD':
      return { resource: 'timber', amount: 6, tool: 'STAR_SICKLE' };
    case 'CRYSTAL':
    case 'ICE':
    case 'MOON':
    case 'ASTEROID':
      return { resource: 'quartz', amount: 5, tool: 'GRAVITON_PICKAXE' };
    case 'MECH':
      return { resource: 'alloys', amount: 5, tool: 'GRAVITON_HAMMER' };
    case 'MAGMA':
    case 'SUN':
    case 'PLASMA':
    case 'STORM':
      return { resource: 'plasma', amount: 4, tool: 'SOLAR_WELDER' };
    default:
      return { resource: 'starDust', amount: 8, tool: 'VOID_COMPASS' };
  }
}

function paletteForPlanet(type: PlanetType): {
  color: string;
  secondaryColor: string;
  atmosphereColor: string;
  ringColor: string;
} {
  switch (type) {
    case 'DARK':
      return { color: '#1e1b4b', secondaryColor: '#581c87', atmosphereColor: '#c084fc', ringColor: 'rgba(168, 85, 247, 0.5)' };
    case 'ANTIMATTER':
      return { color: '#3b0764', secondaryColor: '#e11d48', atmosphereColor: '#f43f5e', ringColor: 'rgba(244, 63, 94, 0.75)' };
    case 'RINGED_GIANT':
      return { color: '#1e293b', secondaryColor: '#6366f1', atmosphereColor: '#818cf8', ringColor: 'rgba(129, 140, 248, 0.8)' };
    case 'CRYSTAL':
      return { color: '#7c3aed', secondaryColor: '#c084fc', atmosphereColor: '#e879f9', ringColor: 'rgba(192, 132, 252, 0.5)' };
    case 'NEON':
      return { color: '#0284c7', secondaryColor: '#38bdf8', atmosphereColor: '#67e8f9', ringColor: 'rgba(56, 189, 248, 0.55)' };
    case 'MAGMA':
      return { color: '#b91c1c', secondaryColor: '#f97316', atmosphereColor: '#fbbf24', ringColor: 'rgba(249, 115, 22, 0.5)' };
    case 'CELESTIAL_SANCTUARY':
      return { color: '#eab308', secondaryColor: '#fef08a', atmosphereColor: '#fde047', ringColor: 'rgba(254, 240, 138, 0.7)' };
    case 'SUN':
      return { color: '#f59e0b', secondaryColor: '#fef08a', atmosphereColor: '#fde047', ringColor: 'rgba(253, 224, 71, 0.45)' };
    case 'MECH':
      return { color: '#78350f', secondaryColor: '#ca8a04', atmosphereColor: '#fef08a', ringColor: 'rgba(234, 179, 8, 0.45)' };
    case 'PLASMA':
    case 'ICE':
      return { color: '#0284c7', secondaryColor: '#e0f2fe', atmosphereColor: '#bae6fd', ringColor: 'rgba(224, 242, 254, 0.55)' };
    case 'ASTEROID':
      return { color: '#d97706', secondaryColor: '#fef3c7', atmosphereColor: '#fde047', ringColor: 'rgba(253, 224, 71, 0.45)' };
    case 'OCEAN':
      return { color: '#0369a1', secondaryColor: '#38bdf8', atmosphereColor: '#7dd3fc', ringColor: 'rgba(125, 211, 252, 0.5)' };
    case 'DESERT':
      return { color: '#c2410c', secondaryColor: '#fdba74', atmosphereColor: '#fb923c', ringColor: 'rgba(251, 146, 60, 0.45)' };
    case 'JUNGLE':
      return { color: '#166534', secondaryColor: '#4ade80', atmosphereColor: '#86efac', ringColor: 'rgba(74, 222, 128, 0.4)' };
    case 'STORM':
      return { color: '#9a3412', secondaryColor: '#fb923c', atmosphereColor: '#fdba74', ringColor: 'rgba(253, 186, 116, 0.55)' };
    case 'TOXIC':
      return { color: '#3f6212', secondaryColor: '#a3e635', atmosphereColor: '#d9f99d', ringColor: 'rgba(163, 230, 53, 0.45)' };
    case 'MOON':
      return { color: '#64748b', secondaryColor: '#cbd5e1', atmosphereColor: '#94a3b8', ringColor: 'rgba(148, 163, 184, 0.35)' };
    case 'AURORA':
      return { color: '#1e3a8a', secondaryColor: '#22c55e', atmosphereColor: '#67e8f9', ringColor: 'rgba(103, 232, 249, 0.55)' };
    case 'FUNGAL':
      return { color: '#6b21a8', secondaryColor: '#e879f9', atmosphereColor: '#c4b5fd', ringColor: 'rgba(232, 121, 249, 0.5)' };
    case 'CLOUD':
      return { color: '#c2410c', secondaryColor: '#fed7aa', atmosphereColor: '#ffedd5', ringColor: 'rgba(254, 215, 170, 0.5)' };
    case 'NEBULA':
      return { color: '#9d174d', secondaryColor: '#f0abfc', atmosphereColor: '#f9a8d4', ringColor: 'rgba(240, 171, 252, 0.55)' };
    default:
      return { color: '#16a34a', secondaryColor: '#4ade80', atmosphereColor: '#38bdf8', ringColor: 'rgba(56, 189, 248, 0.45)' };
  }
}
