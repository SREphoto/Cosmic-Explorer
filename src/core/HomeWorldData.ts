/**
 * Home World data — the planet sphere locations, the town street, building
 * interiors, the NPC cast, dialogue and the starter task chain.
 *
 * Procedural art for now: scenes are drawn by PovSceneView from these defs;
 * every scene is intentionally wider than the screen so panning feels good
 * and new content can be appended later (per DESIGN_TOWN_AND_NPC_SYSTEM.md).
 */

import {
  SceneDef,
  SceneId,
  NpcDef,
  PlanetLocationDef,
  TaskDef,
} from '../types/homeWorld';

// ---------------------------------------------------------------------------
// Planet sphere locations (physically attached to the surface)
// ---------------------------------------------------------------------------

export const PLANET_LOCATIONS: PlanetLocationDef[] = [
  {
    id: 'town',
    name: 'Hearth Row',
    icon: '🏘️',
    lat: 12,
    lon: 0,
    sceneId: 'street',
    color: '#fbbf24',
  },
  {
    id: 'hangar',
    name: 'Launch Hangar',
    icon: '🚀',
    lat: 34,
    lon: -58,
    sceneId: 'hangar',
    color: '#38bdf8',
  },
  {
    id: 'greenhouse',
    name: 'Starlight Greenhouse',
    icon: '🪴',
    lat: -24,
    lon: 62,
    sceneId: 'greenhouse',
    color: '#34d399',
  },
  {
    id: 'farmland',
    name: 'Farmland District',
    icon: '🌾',
    lat: -38,
    lon: 152,
    sceneId: null,
    lockedHint: 'Farming district — coming soon',
    color: '#a3e635',
  },
  {
    id: 'industrial',
    name: 'Industrial District',
    icon: '🏭',
    lat: 24,
    lon: 168,
    sceneId: null,
    lockedHint: 'Industrial district — coming soon',
    color: '#fb923c',
  },
  {
    id: 'research',
    name: 'Research District',
    icon: '🔭',
    lat: -8,
    lon: -148,
    sceneId: null,
    lockedHint: 'Research district — coming soon',
    color: '#e879f9',
  },
];

// ---------------------------------------------------------------------------
// NPC cast
// ---------------------------------------------------------------------------

export const NPC_DEFS: NpcDef[] = [
  {
    id: 'quest_giver',
    name: 'Elder Juno',
    icon: '🧓',
    role: 'Town Guide',
    lines: [
      'Welcome home, Commander. This little rock is ours to grow.',
      'Every voyage you fly brings something back to Hearth Row.',
      'The townsfolk talk of nothing but your last jump. Make it a good story!',
      'A town is only as warm as the people who keep coming back to it.',
      'Check the notice board often — there is always something to do.',
    ],
  },
  {
    id: 'mechanic',
    name: 'Nova',
    icon: '👩‍🔧',
    role: 'Mechanic',
    lines: [
      'Ship is fueled and grumpy about it. Ready when you are.',
      'I tuned the thrusters while you were out. She purrs now.',
      'You jump, I fix. That is the deal, Commander.',
      'The void is cold. My wrenches are colder. Back to work!',
    ],
  },
  {
    id: 'shopkeeper',
    name: 'Bargo',
    icon: '🧔',
    role: 'Shopkeeper',
    lines: [
      'Fresh stock fell off a wormhole this morning. Totally legal!',
      'Buy something pretty — the planet deserves decorations.',
      'Prices? Fair. My margins? Also fair. Coincidence? Never.',
      'Rumor is the Ash sectors are paying top dust for quartz.',
    ],
  },
  {
    id: 'trainer',
    name: 'Coach Vega',
    icon: '💪',
    role: 'Trainer',
    lines: [
      'One more orbit! Then one more after that!',
      'Leg day is every day when you live on a small planet.',
      'Upgrades are just push-ups for your ship.',
      'Champions are built in the Gym. Trophies are polished next door.',
    ],
  },
  {
    id: 'gardener',
    name: 'Seren',
    icon: '👩‍🌾',
    role: 'Gardener',
    lines: [
      'The star-daisies bloom brighter after a good voyage.',
      'Plants listen, you know. I tell them about your jumps.',
      'Harvest when the glow is ripe — never sooner.',
      'Green hands, green planet. That is the whole philosophy.',
    ],
  },
  {
    id: 'teller',
    name: 'Mr. Quill',
    icon: '🤵',
    role: 'Bank Teller',
    lines: [
      'Deposits are eternal. Withdrawals require paperwork.',
      'Your vault is precisely as tidy as I am. Very.',
      'Star Dust appreciates in charm, if not in value.',
      'The Bank thanks you for your continued solvency.',
    ],
  },
  {
    id: 'keeper',
    name: 'Mira',
    icon: '📋',
    role: 'Warehouse Keeper',
    lines: [
      'Aisle one: timber. Aisle two: quartz. Aisle three: my patience.',
      'Everything is inventoried, labeled, and alphabetized twice.',
      'Bring me supplies from your voyages. I will make them count.',
    ],
  },
  {
    id: 'curator',
    name: 'Doc Laurel',
    icon: '🏅',
    role: 'Curator',
    lines: [
      'Every medal tells a jump. Every jump tells a story.',
      'The Hall has room for more of your glory, Commander.',
      'Polish earned the display case. Twice.',
    ],
  },
  {
    id: 'officer',
    name: 'Commander Orion',
    icon: '🧑‍✈️',
    role: 'Planetary Officer',
    lines: [
      'The Command Center tracks every breath of this world.',
      'Growth, resources, the atmosphere itself — all on my screens.',
      'A wise commander reviews the planetary report between voyages.',
    ],
  },
  {
    id: 'townsfolk_1',
    name: 'Pip',
    icon: '🧒',
    role: 'Townsfolk',
    lines: [
      'When I grow up I want to jump planets like you!',
      'I saw a comet yesterday. It waved. Probably.',
      'My dad says your hangar rocket is the loudest thing since the volcano.',
    ],
  },
  {
    id: 'townsfolk_2',
    name: 'Old Tansy',
    icon: '👵',
    role: 'Townsfolk',
    lines: [
      'Back in my day we orbited uphill both ways.',
      'The dusk on this planet never gets old, dear.',
      'Bring the town something shiny, hmm?',
    ],
  },
];

export const npcById = (id: string): NpcDef => NPC_DEFS.find((n) => n.id === id) || NPC_DEFS[0];

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const STREET_ACTIONS: SceneDef['actions'] = [];

export const SCENE_DEFS: Record<SceneId, SceneDef> = {
  street: {
    id: 'street',
    name: 'Hearth Row — Main Street',
    icon: '🏘️',
    width: 2300,
    kind: 'street',
    palette: { skyTop: '#1e1b4b', skyBottom: '#7c2d12', ground: '#3f2d20', accent: '#fbbf24' },
    npcs: [
      { npcId: 'quest_giver', x: 950 },
      { npcId: 'townsfolk_1', x: 350 },
      { npcId: 'townsfolk_2', x: 1620 },
    ],
    hotspots: [
      { id: 'door_shop', kind: 'door', x: 180, y: 210, w: 200, h: 170, to: 'shop' },
      { id: 'door_bank', kind: 'door', x: 440, y: 210, w: 200, h: 170, to: 'bank' },
      { id: 'door_gym', kind: 'door', x: 700, y: 210, w: 200, h: 170, to: 'gym' },
      { id: 'door_trophy', kind: 'door', x: 960, y: 210, w: 200, h: 170, to: 'trophy' },
      { id: 'door_greenhouse', kind: 'door', x: 1220, y: 210, w: 200, h: 170, to: 'greenhouse' },
      { id: 'door_warehouse', kind: 'door', x: 1480, y: 210, w: 200, h: 170, to: 'warehouse' },
      { id: 'door_hangar', kind: 'door', x: 1740, y: 190, w: 240, h: 190, to: 'hangar' },
      { id: 'door_command', kind: 'door', x: 2020, y: 210, w: 200, h: 170, to: 'command' },
      { id: 'npc_quest_giver', kind: 'npc', x: 925, y: 300, w: 70, h: 90, npcId: 'quest_giver' },
      { id: 'npc_townsfolk_1', kind: 'npc', x: 325, y: 300, w: 70, h: 90, npcId: 'townsfolk_1' },
      { id: 'npc_townsfolk_2', kind: 'npc', x: 1595, y: 300, w: 70, h: 90, npcId: 'townsfolk_2' },
      { id: 'board', kind: 'object', x: 645, y: 268, w: 52, h: 112 },
    ],
    actions: STREET_ACTIONS,
    ambience: 'Lanterns flicker along Hearth Row as dusk settles over your world.',
  },
  hangar: {
    id: 'hangar',
    name: 'Launch Hangar',
    icon: '🚀',
    width: 1300,
    kind: 'interior',
    palette: { skyTop: '#0c1526', skyBottom: '#1e3a5f', ground: '#243447', accent: '#38bdf8' },
    npcs: [{ npcId: 'mechanic', x: 820 }],
    hotspots: [
      { id: 'exit', kind: 'door', x: 40, y: 200, w: 120, h: 190, to: 'exit' },
      { id: 'npc_mechanic', kind: 'npc', x: 795, y: 290, w: 70, h: 90, npcId: 'mechanic' },
      { id: 'ship', kind: 'object', x: 480, y: 190, w: 220, h: 200 },
    ],
    actions: [
      { id: 'launch', label: 'Launch Voyage', icon: '🚀', primary: true },
      { id: 'arena', label: '1v1 Arena', icon: '⚔️' },
      { id: 'wardrobe', label: 'Hangar Rack (Costumes)', icon: '🧥' },
      { id: 'map', label: 'Sector Map', icon: '🗺️' },
    ],
    ambience: 'Fuel lines hum. Your rocket waits under the work lights.',
  },
  shop: {
    id: 'shop',
    name: 'Bargo’s Parts Store',
    icon: '🛒',
    width: 1200,
    kind: 'interior',
    palette: { skyTop: '#2a1a3e', skyBottom: '#4a2c5e', ground: '#3b2440', accent: '#c084fc' },
    npcs: [{ npcId: 'shopkeeper', x: 600 }],
    hotspots: [
      { id: 'exit', kind: 'door', x: 40, y: 200, w: 120, h: 190, to: 'exit' },
      { id: 'npc_shopkeeper', kind: 'npc', x: 575, y: 290, w: 70, h: 90, npcId: 'shopkeeper' },
    ],
    actions: [
      { id: 'decor_shop', label: 'Browse Decor & Wares', icon: '🛍️', primary: true },
      { id: 'traveler', label: 'Check for Travelers', icon: '🛸' },
    ],
    ambience: 'Shelves glitter with parts, relics and questionable bargains.',
  },
  gym: {
    id: 'gym',
    name: 'The Gravity Gym',
    icon: '🏋️',
    width: 1200,
    kind: 'interior',
    palette: { skyTop: '#1c1917', skyBottom: '#44403c', ground: '#292524', accent: '#f59e0b' },
    npcs: [{ npcId: 'trainer', x: 620 }],
    hotspots: [
      { id: 'exit', kind: 'door', x: 40, y: 200, w: 120, h: 190, to: 'exit' },
      { id: 'npc_trainer', kind: 'npc', x: 595, y: 290, w: 70, h: 90, npcId: 'trainer' },
    ],
    actions: [{ id: 'upgrades', label: 'Train & Upgrade', icon: '⚡', primary: true }],
    ambience: 'Weights clank. Motivational posters defy gravity.',
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Starlight Greenhouse',
    icon: '🪴',
    width: 1300,
    kind: 'interior',
    palette: { skyTop: '#052e16', skyBottom: '#14532d', ground: '#1a2e1a', accent: '#4ade80' },
    npcs: [{ npcId: 'gardener', x: 700 }],
    hotspots: [
      { id: 'exit', kind: 'door', x: 40, y: 200, w: 120, h: 190, to: 'exit' },
      { id: 'npc_gardener', kind: 'npc', x: 675, y: 290, w: 70, h: 90, npcId: 'gardener' },
    ],
    actions: [{ id: 'garden_console', label: 'Tend the Garden', icon: '🌱', primary: true }],
    ambience: 'Warm light filters through the glass dome. Everything smells of growth.',
  },
  bank: {
    id: 'bank',
    name: 'First Stellar Bank',
    icon: '🏦',
    width: 1200,
    kind: 'interior',
    palette: { skyTop: '#1e293b', skyBottom: '#334155', ground: '#26303d', accent: '#fbbf24' },
    npcs: [{ npcId: 'teller', x: 610 }],
    hotspots: [
      { id: 'exit', kind: 'door', x: 40, y: 200, w: 120, h: 190, to: 'exit' },
      { id: 'npc_teller', kind: 'npc', x: 585, y: 290, w: 70, h: 90, npcId: 'teller' },
    ],
    actions: [{ id: 'treasury', label: 'View Treasury', icon: '💰', primary: true }],
    ambience: 'Marble counters, polite silence, extremely organized coins.',
  },
  warehouse: {
    id: 'warehouse',
    name: 'Supply Warehouse',
    icon: '📦',
    width: 1200,
    kind: 'interior',
    palette: { skyTop: '#292018', skyBottom: '#4a3826', ground: '#33281c', accent: '#fb923c' },
    npcs: [{ npcId: 'keeper', x: 620 }],
    hotspots: [
      { id: 'exit', kind: 'door', x: 40, y: 200, w: 120, h: 190, to: 'exit' },
      { id: 'npc_keeper', kind: 'npc', x: 595, y: 290, w: 70, h: 90, npcId: 'keeper' },
    ],
    actions: [{ id: 'vault', label: 'Open Supply Vault', icon: '🗄️', primary: true }],
    ambience: 'Crates stacked with geometric perfection. Somewhere, a clipboard squeaks.',
  },
  trophy: {
    id: 'trophy',
    name: 'Hall of Honors',
    icon: '🏆',
    width: 1200,
    kind: 'interior',
    palette: { skyTop: '#27170a', skyBottom: '#57380f', ground: '#3a2610', accent: '#facc15' },
    npcs: [{ npcId: 'curator', x: 610 }],
    hotspots: [
      { id: 'exit', kind: 'door', x: 40, y: 200, w: 120, h: 190, to: 'exit' },
      { id: 'npc_curator', kind: 'npc', x: 585, y: 290, w: 70, h: 90, npcId: 'curator' },
    ],
    actions: [
      { id: 'medals', label: 'Medal Chest', icon: '🎖️', primary: true },
      { id: 'badges', label: 'Achievement Badges', icon: '🏅' },
    ],
    ambience: 'Gold glimmers on velvet. Your deeds, framed.',
  },
  command: {
    id: 'command',
    name: 'Planetary Command Center',
    icon: '🛰️',
    width: 1300,
    kind: 'interior',
    palette: { skyTop: '#0f172a', skyBottom: '#1e3a8a', ground: '#172033', accent: '#22d3ee' },
    npcs: [{ npcId: 'officer', x: 720 }],
    hotspots: [
      { id: 'exit', kind: 'door', x: 40, y: 200, w: 120, h: 190, to: 'exit' },
      { id: 'npc_officer', kind: 'npc', x: 695, y: 290, w: 70, h: 90, npcId: 'officer' },
    ],
    actions: [{ id: 'sim_console', label: 'Open Planetary Operations', icon: '🪐', primary: true }],
    ambience: 'Screens track growth, atmosphere and threats across your whole world.',
  },
};

// ---------------------------------------------------------------------------
// Starter task chain (NPC-driven momentum loop)
// ---------------------------------------------------------------------------

export const TASK_CHAIN: TaskDef[] = [
  {
    id: 't1_meet_nova',
    giverNpcId: 'quest_giver',
    title: 'Meet the Mechanic',
    text: 'Welcome home! Head east to the Launch Hangar and introduce yourself to Nova, our mechanic.',
    condition: { type: 'VISIT_SCENE', sceneId: 'hangar' },
    rewardStarDust: 20,
    rewardStars: 10,
  },
  {
    id: 't2_first_launch',
    giverNpcId: 'mechanic',
    title: 'First Voyage',
    text: 'Your ship is fueled and waiting. Launch a voyage from the Hangar and bring something home!',
    condition: { type: 'LAUNCH_RUN' },
    rewardStarDust: 30,
    rewardStars: 15,
  },
  {
    id: 't3_meet_seren',
    giverNpcId: 'quest_giver',
    title: 'The Gardener’s Request',
    text: 'Seren the Gardener asked for you. Find her at the Starlight Greenhouse on the street.',
    condition: { type: 'VISIT_SCENE', sceneId: 'greenhouse' },
    rewardStarDust: 20,
    rewardStars: 10,
  },
  {
    id: 't4_tend_garden',
    giverNpcId: 'gardener',
    title: 'Green Hands',
    text: 'Open the garden console and tend to the plots — plant something, or harvest what is ripe.',
    condition: { type: 'OPEN_GARDEN_CONSOLE' },
    rewardStarDust: 30,
    rewardStars: 15,
  },
  {
    id: 't5_command_report',
    giverNpcId: 'quest_giver',
    title: 'State of the Planet',
    text: 'Commander Orion wants to show you the new Planetary Command Center. Visit it at the far end of the street.',
    condition: { type: 'VISIT_SCENE', sceneId: 'command' },
    rewardStarDust: 40,
    rewardStars: 20,
  },
];

export const taskById = (id: string | null | undefined): TaskDef | undefined =>
  TASK_CHAIN.find((t) => t.id === id);

export const nextTaskAfter = (completedIds: string[]): TaskDef | undefined =>
  TASK_CHAIN.find((t) => !completedIds.includes(t.id));
