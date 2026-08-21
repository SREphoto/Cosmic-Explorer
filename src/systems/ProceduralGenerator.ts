import { Collectible } from '../entities/Collectible';
import { Planet } from '../entities/Planet';
import { PowerUp } from '../entities/PowerUp';
import { ConstellationData, PlanetType } from '../types/game';
import { CHECKPOINT_PLANETS, LEVEL_BIOMES, ZODIAC_CONSTELLATIONS } from '../core/Config';

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
      altitudeTier: level.levelNumber
    });

    planets.push(startPlanet);
    this.highestGeneratedY = startY;

    // Generate upcoming world ahead of start with spacious distances
    this.generateUpTo(startY - 4200, planets, collectibles, powerUps);
  }

  public generateUpTo(targetY: number, planets: Planet[], collectibles: Collectible[], powerUps: PowerUp[]) {
    while (this.highestGeneratedY > targetY) {
      const lastPlanet = planets[planets.length - 1];
      this.totalPlanetsGenerated++;
      const currentPlanetIndex = this.totalPlanetsGenerated;

      // Vertical distance between planets spaced out for expansive, thrilling gravity leaps
      const verticalGap = 520 + Math.random() * 260;
      let nextY = lastPlanet.y - verticalGap;
      const altitude = Math.abs(nextY);

      // Check if this exact planet index is a Milestone Checkpoint Planet
      const checkpointCandidate = CHECKPOINT_PLANETS.find(
        (cp) => cp.targetPlanetIndex === currentPlanetIndex
      );

      let isGoalCheckpoint = false;
      let checkpointInfo = checkpointCandidate;

      if (checkpointCandidate) {
        isGoalCheckpoint = true;
      }

      // X positions span across wide viewport allowing dramatic sideways gravitational jumps
      const minX = -this.screenWidth * 0.35;
      const maxX = this.screenWidth * 1.35;
      let nextX = minX + Math.random() * (maxX - minX);

      // Staggered offsets so planets are spread out
      if (Math.abs(nextX - lastPlanet.x) < 180) {
        const shift = 220 + Math.random() * 140;
        nextX = lastPlanet.x > this.screenWidth / 2 ? lastPlanet.x - shift : lastPlanet.x + shift;
        nextX = Math.max(minX, Math.min(maxX, nextX));
      }

      // Altitude and Level determination
      const level = ProceduralGenerator.getLevelForPlanetIndex(currentPlanetIndex);
      const isLevelFinalPlanet = currentPlanetIndex === level.maxPlanetIndex;
      if (isLevelFinalPlanet) {
        isGoalCheckpoint = true;
      }

      // Dark Planet check (18% chance for non-checkpoint planets from Level 2 onwards)
      const isDark = !isGoalCheckpoint && level.levelNumber >= 2 && Math.random() < (level.levelNumber >= 4 ? 0.24 : 0.16);
      const isSun = !isGoalCheckpoint && !isDark && Math.random() < 0.14;
      const isRingedGiant = !isGoalCheckpoint && !isDark && !isSun && Math.random() < 0.20;
      const isAntimatter = !isGoalCheckpoint && !isDark && level.levelNumber >= 5 && Math.random() < 0.15;

      let type: PlanetType = level.featuredTypes[Math.floor(Math.random() * level.featuredTypes.length)];
      if (isGoalCheckpoint && checkpointInfo) {
        type = checkpointInfo.planetType;
      } else if (isAntimatter) {
        type = 'ANTIMATTER';
      } else if (isDark) {
        type = 'DARK';
      } else if (isSun) {
        type = 'SUN';
      } else if (isRingedGiant) {
        type = 'RINGED_GIANT';
      }

      // Colors by Type
      let color = '#16a34a';
      let secondaryColor = '#4ade80';
      let atmosphereColor = '#38bdf8';
      let ringColor = 'rgba(56, 189, 248, 0.45)';

      if (isGoalCheckpoint && checkpointInfo) {
        color = checkpointInfo.primaryColor;
        secondaryColor = checkpointInfo.secondaryColor;
        atmosphereColor = checkpointInfo.atmosphereColor;
        ringColor = checkpointInfo.ringColor || 'rgba(250, 204, 21, 0.6)';
      } else if (type === 'DARK') {
        color = '#1e1b4b';
        secondaryColor = '#581c87';
        atmosphereColor = '#c084fc';
        ringColor = 'rgba(168, 85, 247, 0.5)';
      } else if (type === 'ANTIMATTER') {
        color = '#3b0764';
        secondaryColor = '#e11d48';
        atmosphereColor = '#f43f5e';
        ringColor = 'rgba(244, 63, 94, 0.75)';
      } else if (type === 'RINGED_GIANT') {
        color = '#1e293b';
        secondaryColor = '#6366f1';
        atmosphereColor = '#818cf8';
        ringColor = 'rgba(129, 140, 248, 0.8)';
      } else if (type === 'CRYSTAL') {
        color = '#7c3aed';
        secondaryColor = '#c084fc';
        atmosphereColor = '#e879f9';
        ringColor = 'rgba(192, 132, 252, 0.5)';
      } else if (type === 'NEON') {
        color = '#0284c7';
        secondaryColor = '#38bdf8';
        atmosphereColor = '#67e8f9';
        ringColor = 'rgba(56, 189, 248, 0.55)';
      } else if (type === 'MAGMA') {
        color = '#b91c1c';
        secondaryColor = '#f97316';
        atmosphereColor = '#fbbf24';
        ringColor = 'rgba(249, 115, 22, 0.5)';
      } else if (type === 'CELESTIAL_SANCTUARY') {
        color = '#eab308';
        secondaryColor = '#fef08a';
        atmosphereColor = '#fde047';
        ringColor = 'rgba(254, 240, 138, 0.7)';
      } else if (type === 'SUN') {
        color = '#f59e0b';
        secondaryColor = '#fef08a';
        atmosphereColor = '#fde047';
      } else if (type === 'MECH') {
        color = '#78350f';
        secondaryColor = '#ca8a04';
        atmosphereColor = '#fef08a';
        ringColor = 'rgba(234, 179, 8, 0.45)';
      } else if (type === 'PLASMA' || type === 'ICE') {
        color = '#0284c7';
        secondaryColor = '#e0f2fe';
        atmosphereColor = '#bae6fd';
        ringColor = 'rgba(224, 242, 254, 0.55)';
      } else if (type === 'ASTEROID') {
        color = '#d97706';
        secondaryColor = '#fef3c7';
        atmosphereColor = '#fde047';
        ringColor = 'rgba(253, 224, 71, 0.45)';
      }

      // Radius
      let radius = 75 + Math.random() * 45;
      if (isGoalCheckpoint) {
        radius = 120; // Grand Milestone Checkpoint Planet
      } else if (isSun || isCelestialOrSun(type) || type === 'RINGED_GIANT') {
        radius = 150 + Math.random() * 45;
      } else if (Math.random() < 0.3) {
        radius = 115 + Math.random() * 35;
      }

      const mass = Math.pow(radius / 70, 1.75) * (isSun ? 3.5 : 1.25);
      const hasRing = isGoalCheckpoint || type === 'RINGED_GIANT' || (!isSun && Math.random() < 0.45);

      // Surface Decorations & Props
      const decorations: { angle: number; type: any; size: number }[] = [];

      if (isGoalCheckpoint) {
        decorations.push({ angle: 0, type: 'CHECKPOINT_BEACON', size: 14 });
        decorations.push({ angle: Math.PI * 0.75, type: 'TELESCOPE', size: 10 });
        decorations.push({ angle: Math.PI * 1.5, type: 'HOUSE', size: 14 });
      } else if (type === 'DARK') {
        decorations.push({ angle: Math.random() * Math.PI, type: 'DARK_CRYSTAL', size: 12 });
        decorations.push({ angle: Math.random() * Math.PI + Math.PI, type: 'DARK_CRYSTAL', size: 14 });
        decorations.push({ angle: Math.random() * Math.PI * 2, type: 'SPIKE', size: 11 });
      } else if (type === 'ANTIMATTER') {
        decorations.push({ angle: Math.random() * Math.PI * 2, type: 'RUNES', size: 14 });
        decorations.push({ angle: Math.random() * Math.PI * 2, type: 'CRYSTAL', size: 12 });
      } else {
        decorations.push({ angle: Math.random() * Math.PI, type: 'CRATER', size: 6 + Math.random() * 6 });
        decorations.push({ angle: Math.random() * Math.PI * 2, type: 'CRATER', size: 5 + Math.random() * 5 });

        // Biome specific props
        if (type === 'GRASS') {
          if (Math.random() < 0.6) decorations.push({ angle: Math.random() * Math.PI * 2, type: 'DAISY', size: 6 });
          if (Math.random() < 0.5) decorations.push({ angle: Math.random() * Math.PI * 2, type: 'TREE', size: 10 });
          if (Math.random() < 0.3) decorations.push({ angle: Math.random() * Math.PI * 2, type: 'HOUSE', size: 12 });
        } else if (type === 'MAGMA' && Math.random() < 0.6) {
          decorations.push({ angle: Math.random() * Math.PI * 2, type: 'LAVA_VENT', size: 10 });
        } else if (type === 'CRYSTAL' && Math.random() < 0.7) {
          decorations.push({ angle: Math.random() * Math.PI * 2, type: 'CRYSTAL', size: 11 });
        } else if (!isSun && Math.random() < 0.4) {
          const haz = Math.random() < 0.5 ? 'SPIKE' : 'URCHIN';
          decorations.push({ angle: Math.random() * Math.PI * 2, type: haz, size: 10 });
        }
      }

      const planet = new Planet({
        id: isGoalCheckpoint && checkpointInfo ? `checkpoint_${checkpointInfo.id}` : `planet_${currentPlanetIndex}`,
        x: nextX,
        y: nextY,
        radius,
        mass,
        angularVelocity: 1.5 + Math.random() * 1.2,
        rotationDirection: Math.random() > 0.5 ? 1 : -1,
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
        altitudeTier: level.levelNumber
      });

      planets.push(planet);

      // Star Arc
      this.spawnStarArc(lastPlanet, planet, collectibles);

      // Diamond spawning (22% chance)
      if (Math.random() < 0.22) {
        collectibles.push(
          new Collectible({
            id: `diamond_${currentPlanetIndex}`,
            x: (lastPlanet.x + planet.x) / 2 + (Math.random() - 0.5) * 70,
            y: (lastPlanet.y + planet.y) / 2,
            type: 'DIAMOND',
            radius: 12
          })
        );
      }

      // PowerUp spawning (22% chance)
      if (currentPlanetIndex > 1 && Math.random() < 0.22) {
        const rand = Math.random();
        const ptype = rand < 0.35 ? 'MAGNET' : rand < 0.70 ? 'COMET' : 'REWIND';
        powerUps.push(
          new PowerUp({
            id: `powerup_${currentPlanetIndex}`,
            x: planet.x + (Math.random() - 0.5) * 80,
            y: planet.y - planet.radius - 55,
            type: ptype,
            duration: 5.0
          })
        );
      }

      this.highestGeneratedY = nextY;
    }
  }

  private spawnStarArc(p1: Planet, p2: Planet, collectibles: Collectible[]) {
    const starCount = 5 + Math.floor(Math.random() * 3);
    for (let i = 1; i <= starCount; i++) {
      const t = i / (starCount + 1);
      const arcOffset = Math.sin(t * Math.PI) * 36;
      const x = p1.x + (p2.x - p1.x) * t + arcOffset;
      const y = p1.y + (p2.y - p1.y) * t;

      collectibles.push(
        new Collectible({
          id: `star_${p1.id}_${i}`,
          x,
          y,
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
    const cutoffY = minY + 2000;

    for (let i = planets.length - 1; i >= 1; i--) {
      if (planets[i].y > cutoffY) {
        planets.splice(i, 1);
      }
    }

    for (let i = collectibles.length - 1; i >= 0; i--) {
      if (collectibles[i].y > cutoffY) {
        collectibles.splice(i, 1);
      }
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
      if (powerUps[i].y > cutoffY) {
        powerUps.splice(i, 1);
      }
    }
  }
}

function isCelestialOrSun(t: PlanetType): boolean {
  return t === 'SUN' || t === 'CELESTIAL_SANCTUARY';
}
