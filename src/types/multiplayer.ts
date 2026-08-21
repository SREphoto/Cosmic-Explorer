export type MultiplayerMode = 'BATTLE' | 'RACE';

export type RoomStatus = 'WAITING' | 'STARTING' | 'COUNTDOWN' | 'ACTIVE' | 'FINISHED' | 'ABANDONED';

export type TrapType = 'PLASMA_MINE' | 'GRAVITY_REVERSAL' | 'SOLAR_EMP' | 'ASTEROID_HAZARD';

export interface TrapInfo {
  id: string;
  planetId: string;
  type: TrapType;
  placedBy: string; // userId
  deployedBy?: string; // fallback alias
  createdAt: number;
}

export interface PlayerOnlineState {
  userId: string;
  displayName: string;
  photoURL?: string;
  costumeId: string;
  rocketSkinId: string;
  color: string;
  currentPlanetIndex: number;
  altitude: number;
  score: number;
  shields: number; // 0-100 in Battle
  trapsAvailable: number;
  planetsClaimedCount: number;
  isReady: boolean;
  lastPing: number;
  isFinished?: boolean;
  finishTime?: number;
  x?: number;
  y?: number;
  currentPlanetId?: string | null;
  isAttached?: boolean;
}

export interface RoomParticipant {
  userId: string;
  displayName: string;
  photoURL?: string;
  color: string; // e.g. '#38bdf8' (Cyan) vs '#f43f5e' (Rose)
}

export interface RoomData {
  id: string;
  roomCode: string;
  mode: MultiplayerMode;
  status: RoomStatus;
  host: RoomParticipant;
  guest?: RoomParticipant | null;
  seed: number;
  targetAltitude: number; // e.g. 3500 for Race
  winnerId?: string;
  winnerName?: string;
  countdownSeconds?: number;
  claimedPlanets: Record<string, string>; // planetId -> userId
  traps: Record<string, TrapInfo>; // planetId -> TrapInfo
  hostState: PlayerOnlineState;
  guestState?: PlayerOnlineState | null;
  events: {
    id: string;
    type: 'CLAIM' | 'TRAP_TRIGGER' | 'SHIELD_HIT' | 'WARP_RACE' | 'EMOTE';
    message: string;
    timestamp: number;
    userId: string;
  }[];
  createdAt: number;
  updatedAt: number;
}
