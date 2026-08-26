/**
 * Generated icon art for sim-layer entities. Entities without an entry
 * (e.g. Ash Legion crest — coming next art batch) keep their emoji icon.
 */
import heartland from '../../assets/art/icons/region-verdant.png';
import peaks from '../../assets/art/icons/region-crystal.png';
import belt from '../../assets/art/icons/region-forge.png';
import coast from '../../assets/art/icons/region-coast.png';
import spire from '../../assets/art/icons/region-spire.png';
import wastes from '../../assets/art/icons/region-obsidian.png';
import luminari from '../../assets/art/icons/faction-luminari.png';
import verdantCircle from '../../assets/art/icons/faction-verdant-circle.png';
import tradeGuild from '../../assets/art/icons/faction-trade-guild.png';
import voidRaiders from '../../assets/art/icons/faction-void-raiders.png';
import ashLegion from '../../assets/art/icons/faction-ash-legion.png';
import defenseAegis from '../../assets/art/icons/defense-aegis.png';
import defenseTurret from '../../assets/art/icons/defense-turretgrid.png';
import defenseSensor from '../../assets/art/icons/defense-sensor.png';
import structSolar from '../../assets/art/icons/struct-solar.png';
import structHydro from '../../assets/art/icons/struct-hydro.png';
import structExtractor from '../../assets/art/icons/struct-extractor.png';
import structFoundry from '../../assets/art/icons/struct-foundry.png';
import structHabitat from '../../assets/art/icons/struct-habitat.png';
import structLab from '../../assets/art/icons/struct-lab.png';
import structBeacon from '../../assets/art/icons/struct-beacon.png';
import structScrubber from '../../assets/art/icons/struct-scrubber.png';
import structGrove from '../../assets/art/icons/struct-grove.png';
import structTurret from '../../assets/art/icons/struct-turret.png';

export const REGION_ICONS: Record<string, string> = {
  heartland,
  peaks,
  belt,
  coast,
  spire,
  wastes,
};

export const FACTION_ICONS: Record<string, string> = {
  LUMINARI: luminari,
  VERDANT_CIRCLE: verdantCircle,
  TRADE_GUILD: tradeGuild,
  VOID_RAIDERS: voidRaiders,
  ASH_LEGION: ashLegion,
};

export const DEFENSE_ICONS: Record<string, string> = {
  aegis: defenseAegis,
  turretGrid: defenseTurret,
  sensorArray: defenseSensor,
};

export const simIcon = (id: string): string | undefined =>
  FACTION_ICONS[id] || REGION_ICONS[id] || STRUCTURE_ICONS[id] || DEFENSE_ICONS[id];

export const STRUCTURE_ICONS: Record<string, string> = {
  SOLAR_ARRAY: structSolar,
  HYDRO_FARM: structHydro,
  EXTRACTOR: structExtractor,
  FOUNDRY: structFoundry,
  HABITAT_DOME: structHabitat,
  RESEARCH_LAB: structLab,
  TRADE_BEACON: structBeacon,
  SCRUBBER: structScrubber,
  GROVE: structGrove,
  TURRET_POD: structTurret,
};
