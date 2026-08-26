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
};

export const simIcon = (id: string): string | undefined =>
  FACTION_ICONS[id] || REGION_ICONS[id];
