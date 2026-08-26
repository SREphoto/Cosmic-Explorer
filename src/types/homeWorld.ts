/**
 * Home World types — planet sphere home screen, wide POV scenes (town &
 * building interiors), NPCs and the starter task chain.
 *
 * Direction: DESIGN_INTERACTION_MODEL.md, DESIGN_TOWN_AND_NPC_SYSTEM.md,
 * GAME_SYSTEMS_PLAN.md (locked).
 */

export type SceneId =
  | 'street'
  | 'hangar'
  | 'shop'
  | 'gym'
  | 'greenhouse'
  | 'bank'
  | 'warehouse'
  | 'trophy'
  | 'command';

export type HotspotKind = 'door' | 'npc' | 'object';

export interface HotspotDef {
  id: string;
  kind: HotspotKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** For doors: which scene it leads to (or 'exit' for interiors). */
  to?: SceneId | 'exit';
  /** For npc hotspots. */
  npcId?: string;
}

export interface NpcDef {
  id: string;
  name: string;
  icon: string;
  role: string;
  /** Ambient dialogue pool, cycled on repeat taps. */
  lines: string[];
}

export interface SceneActionDef {
  id: string;
  label: string;
  icon: string;
  /** Primary actions glow. */
  primary?: boolean;
}

export interface SceneDef {
  id: SceneId;
  name: string;
  icon: string;
  /** Virtual scene width (viewport is 640). */
  width: number;
  kind: 'street' | 'interior';
  palette: {
    skyTop: string;
    skyBottom: string;
    ground: string;
    accent: string;
  };
  npcs: { npcId: string; x: number }[];
  hotspots: HotspotDef[];
  actions: SceneActionDef[];
  ambience: string;
}

/** A location physically attached to the planet sphere surface. */
export interface PlanetLocationDef {
  id: string;
  name: string;
  icon: string;
  /** Latitude in degrees (+north). */
  lat: number;
  /** Longitude in degrees. */
  lon: number;
  /** Enters a scene; null = locked "future district" slot. */
  sceneId: SceneId | null;
  lockedHint?: string;
  color: string;
}

export type TaskCondition =
  | { type: 'VISIT_SCENE'; sceneId: SceneId }
  | { type: 'LAUNCH_RUN' }
  | { type: 'OPEN_GARDEN_CONSOLE' };

export interface TaskDef {
  id: string;
  giverNpcId: string;
  title: string;
  text: string;
  condition: TaskCondition;
  rewardStarDust: number;
  rewardStars: number;
}

export interface HomeWorldSaveState {
  townName?: string;
  foundedAt?: number;
  completedTaskIds: string[];
  currentTaskId?: string | null;
  npcTalkCounts?: Record<string, number>;
  lastVisitedSceneId?: SceneId;
  /** Secrets the player has discovered across the town scenes. */
  discoveredSecretIds?: string[];
}
