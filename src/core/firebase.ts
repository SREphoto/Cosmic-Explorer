import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
export type { User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { UserSavedData } from '../types/game';
import { RoomData, PlayerOnlineState, TrapInfo } from '../types/multiplayer';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);

const googleProvider = new GoogleAuthProvider();

export class FirebaseService {
  /**
   * Listen to Auth state changes
   */
  public static onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Sign In with Google
   */
  public static async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await this.syncUserProfile(result.user);
      }
      return result.user;
    } catch (error) {
      console.warn('Google Sign-in failed or cancelled:', error);
      throw error;
    }
  }

  /**
   * Sign In with Email and Password
   */
  public static async signInWithEmail(email: string, pass: string): Promise<User | null> {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await this.syncUserProfile(res.user);
      }
      return res.user;
    } catch (error) {
      console.warn('Email sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Register with Email and Password
   */
  public static async registerWithEmail(email: string, pass: string, displayName?: string): Promise<User | null> {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user && displayName) {
        await updateProfile(res.user, { displayName });
      }
      if (res.user) {
        await this.syncUserProfile(res.user);
      }
      return res.user;
    } catch (error) {
      console.warn('Email registration failed:', error);
      throw error;
    }
  }

  /**
   * Sign In Anonymously (Guest Mode)
   */
  public static async signInGuest(): Promise<User | null> {
    try {
      const result = await firebaseSignInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.warn('Guest sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Sign Out
   */
  public static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.warn('Sign out failed:', error);
    }
  }

  /**
   * Sync User Profile metadata to Firestore
   */
  public static async syncUserProfile(user: User, stats?: Partial<UserSavedData>): Promise<void> {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const dataToSave = {
        userId: user.uid,
        displayName: user.displayName || (user.isAnonymous ? 'Cosmic Guest' : 'Explorer'),
        photoURL: user.photoURL || '',
        email: user.email || '',
        lastActiveAt: new Date().toISOString(),
        ...(stats?.highScore ? { highScore: stats.highScore } : {}),
        ...(stats?.maxAltitudeOverall ? { maxAltitudeOverall: stats.maxAltitudeOverall } : {}),
        ...(stats?.playerLevel ? { playerLevel: stats.playerLevel } : {}),
        ...(stats?.totalPlanetsAllTime ? { totalPlanetsAllTime: stats.totalPlanetsAllTime } : {})
      };
      await setDoc(userRef, dataToSave, { merge: true });
    } catch (e) {
      console.warn('Failed to sync user profile:', e);
    }
  }

  /**
   * Save Game State to Cloud Firestore
   */
  public static async saveGameToCloud(userId: string, savedData: UserSavedData): Promise<boolean> {
    try {
      const saveRef = doc(db, 'saves', userId);
      await setDoc(saveRef, {
        userId,
        savedData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('Cloud save failed:', e);
      return false;
    }
  }

  /**
   * Load Game State from Cloud Firestore
   */
  public static async loadGameFromCloud(userId: string): Promise<UserSavedData | null> {
    try {
      const saveRef = doc(db, 'saves', userId);
      const snap = await getDoc(saveRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.savedData as UserSavedData;
      }
      return null;
    } catch (e) {
      console.warn('Cloud load failed:', e);
      return null;
    }
  }

  /**
   * Submit High Score to Global Leaderboard
   */
  public static async submitLeaderboard(entry: {
    userId: string;
    displayName: string;
    photoURL?: string;
    score: number;
    altitude: number;
    maxCombo: number;
    costumeId: string;
    rocketSkinId: string;
  }): Promise<void> {
    try {
      const entryRef = doc(db, 'leaderboards', entry.userId);
      await setDoc(entryRef, {
        ...entry,
        timestamp: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to submit leaderboard entry:', e);
    }
  }

  /**
   * Fetch Top High Scores
   */
  public static async getTopScores(limitCount = 20) {
    try {
      const q = query(collection(db, 'leaderboards'), orderBy('score', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.warn('Failed to fetch leaderboard:', e);
      return [];
    }
  }

  // ==========================================
  // 1V1 MULTIPLAYER ROOMS & LIVE SYNC
  // ==========================================

  /**
   * Generate random 5-character room code (e.g., "ASTRO")
   */
  public static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new 1v1 multiplayer match room
   */
  public static async createMatchRoom(
    hostUser: User,
    mode: 'BATTLE' | 'RACE',
    initialState: Partial<PlayerOnlineState>
  ): Promise<RoomData> {
    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const roomCode = this.generateRoomCode();
    const seed = Math.floor(Math.random() * 1000000);

    const hostParticipant = {
      userId: hostUser.uid,
      displayName: hostUser.displayName || 'Cosmic Host',
      photoURL: hostUser.photoURL || '',
      color: '#38bdf8' // Cyan
    };

    const hostFullState: PlayerOnlineState = {
      userId: hostUser.uid,
      displayName: hostParticipant.displayName,
      photoURL: hostParticipant.photoURL,
      costumeId: initialState.costumeId || 'ASTRONAUT',
      rocketSkinId: initialState.rocketSkinId || 'APOLLO',
      color: hostParticipant.color,
      currentPlanetIndex: 0,
      altitude: 0,
      score: 0,
      shields: 100,
      trapsAvailable: 3,
      planetsClaimedCount: 0,
      isReady: true,
      lastPing: Date.now(),
      ...initialState
    };

    const room: RoomData = {
      id: roomId,
      roomCode,
      mode,
      status: 'WAITING',
      host: hostParticipant,
      guest: null,
      seed,
      targetAltitude: mode === 'RACE' ? 3500 : 2500,
      claimedPlanets: {},
      traps: {},
      hostState: hostFullState,
      guestState: null,
      events: [
        {
          id: 'ev_' + Date.now(),
          type: 'EMOTE',
          message: `${hostParticipant.displayName} created a ${mode} room!`,
          timestamp: Date.now(),
          userId: hostUser.uid
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const roomRef = doc(db, 'rooms', roomId);
    await setDoc(roomRef, room);
    return room;
  }

  /**
   * Find and join room by 5-letter Room Code
   */
  public static async joinRoomByCode(
    roomCode: string,
    guestUser: User,
    initialState: Partial<PlayerOnlineState>
  ): Promise<RoomData | null> {
    try {
      const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const foundDoc = snap.docs.find(d => {
        const data = d.data() as RoomData;
        return data.roomCode?.toUpperCase() === roomCode.toUpperCase() && data.status === 'WAITING';
      });

      if (!foundDoc) {
        return null;
      }

      const roomData = foundDoc.data() as RoomData;
      if (roomData.host.userId === guestUser.uid) {
        return roomData; // Host re-joining
      }

      const guestParticipant = {
        userId: guestUser.uid,
        displayName: guestUser.displayName || 'Cosmic Challenger',
        photoURL: guestUser.photoURL || '',
        color: '#f43f5e' // Rose
      };

      const guestFullState: PlayerOnlineState = {
        userId: guestUser.uid,
        displayName: guestParticipant.displayName,
        photoURL: guestParticipant.photoURL,
        costumeId: initialState.costumeId || 'ASTRONAUT',
        rocketSkinId: initialState.rocketSkinId || 'APOLLO',
        color: guestParticipant.color,
        currentPlanetIndex: 0,
        altitude: 0,
        score: 0,
        shields: 100,
        trapsAvailable: 3,
        planetsClaimedCount: 0,
        isReady: true,
        lastPing: Date.now(),
        ...initialState
      };

      const roomRef = doc(db, 'rooms', roomData.id);
      await updateDoc(roomRef, {
        guest: guestParticipant,
        guestState: guestFullState,
        status: 'STARTING',
        countdownSeconds: 3,
        updatedAt: Date.now(),
        events: [
          ...(roomData.events || []),
          {
            id: 'ev_' + Date.now(),
            type: 'EMOTE',
            message: `${guestParticipant.displayName} entered the arena! Match starting!`,
            timestamp: Date.now(),
            userId: guestUser.uid
          }
        ]
      });

      return {
        ...roomData,
        guest: guestParticipant,
        guestState: guestFullState,
        status: 'STARTING',
        countdownSeconds: 3
      };
    } catch (e) {
      console.warn('Failed to join room by code:', e);
      throw e;
    }
  }

  /**
   * Listen to real-time room updates via onSnapshot
   */
  public static subscribeToRoom(roomId: string, onUpdate: (room: RoomData | null) => void): () => void {
    const roomRef = doc(db, 'rooms', roomId);
    return onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as RoomData);
      } else {
        onUpdate(null);
      }
    }, (err) => {
      console.warn('Room listener error:', err);
    });
  }

  /**
   * Update real-time player telemetry during match (auto-detects host vs guest)
   */
  public static async updatePlayerState(
    roomId: string,
    userId: string,
    playerState: Partial<PlayerOnlineState>
  ): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;
      const currentData = snap.data() as RoomData;
      const isHost = currentData.host.userId === userId;
      const field = isHost ? 'hostState' : 'guestState';
      const existingState = isHost ? currentData.hostState : currentData.guestState;

      await updateDoc(roomRef, {
        [field]: {
          ...existingState,
          ...playerState,
          lastPing: Date.now()
        },
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to update telemetry:', e);
    }
  }

  /**
   * Update real-time player telemetry during match (legacy)
   */
  public static async updateMatchTelemetry(
    roomId: string, 
    userId: string, 
    isHost: boolean, 
    playerState: Partial<PlayerOnlineState>
  ): Promise<void> {
    return this.updatePlayerState(roomId, userId, playerState);
  }

  /**
   * Claim a planet in Battle Mode
   */
  public static async claimPlanet(roomId: string, planetId: string, userId: string, userName?: string): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as RoomData;

      const currentClaimed = room.claimedPlanets || {};
      if (currentClaimed[planetId] === userId) return; // Already claimed by this user

      const updatedClaimed = { ...currentClaimed, [planetId]: userId };
      const displayName = userName || (room.host.userId === userId ? room.host.displayName : room.guest?.displayName) || 'Explorer';
      
      // Update claimed count for host/guest
      const isHost = room.host.userId === userId;
      const stateKey = isHost ? 'hostState' : 'guestState';

      const newClaimCount = Object.values(updatedClaimed).filter(uid => uid === userId).length;

      await updateDoc(roomRef, {
        claimedPlanets: updatedClaimed,
        [`${stateKey}.planetsClaimedCount`]: newClaimCount,
        events: [
          ...(room.events || []).slice(-15),
          {
            id: 'ev_' + Date.now(),
            type: 'CLAIM',
            message: `${displayName} claimed Planet #${planetId}!`,
            timestamp: Date.now(),
            userId
          }
        ],
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to claim planet:', e);
    }
  }

  /**
   * Deploy an orbital trap on a claimed planet
   */
  public static async deployTrap(roomId: string, planetId: string, trapType: TrapInfo['type'], userId: string, userName?: string): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as RoomData;

      const displayName = userName || (room.host.userId === userId ? room.host.displayName : room.guest?.displayName) || 'Explorer';

      const trapInfo: TrapInfo = {
        id: 'trap_' + Date.now(),
        planetId,
        type: trapType,
        placedBy: userId,
        deployedBy: userId,
        createdAt: Date.now()
      };

      const updatedTraps = { ...(room.traps || {}), [planetId]: trapInfo };
      const isHost = room.host.userId === userId;
      const stateKey = isHost ? 'hostState' : 'guestState';
      const userState = isHost ? room.hostState : room.guestState;
      const trapsLeft = Math.max(0, (userState?.trapsAvailable || 1) - 1);

      await updateDoc(roomRef, {
        traps: updatedTraps,
        [`${stateKey}.trapsAvailable`]: trapsLeft,
        events: [
          ...(room.events || []).slice(-15),
          {
            id: 'ev_' + Date.now(),
            type: 'TRAP_TRIGGER',
            message: `${displayName} deployed an orbital ${trapType.replace('_', ' ')}!`,
            timestamp: Date.now(),
            userId
          }
        ],
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to deploy trap:', e);
    }
  }

  /**
   * Detonate trap on planet
   */
  public static async detonateTrap(roomId: string, planetId: string, detonatedByUserId: string): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as RoomData;

      const trap = room.traps?.[planetId];
      if (!trap) return;

      const remainingTraps = { ...room.traps };
      delete remainingTraps[planetId];

      await updateDoc(roomRef, {
        traps: remainingTraps,
        events: [
          ...(room.events || []).slice(-15),
          {
            id: 'ev_' + Date.now(),
            type: 'SHIELD_HIT',
            message: `Orbital trap triggered on Planet #${planetId}!`,
            timestamp: Date.now(),
            userId: detonatedByUserId
          }
        ],
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to detonate trap:', e);
    }
  }

  /**
   * End match and declare winner
   */
  public static async endMatch(roomId: string, winnerId: string, winnerName: string): Promise<void> {
    return this.finishMatch(roomId, winnerId, winnerName);
  }

  /**
   * Trigger trap damage when opponent enters trapped planet
   */
  public static async triggerTrapDamage(roomId: string, planetId: string, victimId: string, victimName: string, damage = 25): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as RoomData;

      const trap = room.traps?.[planetId];
      if (!trap || trap.placedBy === victimId) return;

      // Remove consumed trap
      const remainingTraps = { ...room.traps };
      delete remainingTraps[planetId];

      const isHostVictim = room.host.userId === victimId;
      const victimState = isHostVictim ? room.hostState : room.guestState;
      const newShields = Math.max(0, (victimState?.shields || 100) - damage);

      const isGameOver = newShields <= 0;
      const winnerId = isGameOver ? trap.placedBy : undefined;
      const winnerName = isGameOver ? (trap.placedBy === room.host.userId ? room.host.displayName : room.guest?.displayName) : undefined;

      await updateDoc(roomRef, {
        traps: remainingTraps,
        [`${isHostVictim ? 'hostState' : 'guestState'}.shields`]: newShields,
        ...(isGameOver ? { status: 'FINISHED', winnerId, winnerName } : {}),
        events: [
          ...(room.events || []).slice(-15),
          {
            id: 'ev_' + Date.now(),
            type: 'SHIELD_HIT',
            message: `${victimName} detonated a ${trap.type.replace('_', ' ')}! (-${damage}% Shields)`,
            timestamp: Date.now(),
            userId: victimId
          }
        ],
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to trigger trap damage:', e);
    }
  }

  /**
   * Finish match and declare winner
   */
  public static async finishMatch(roomId: string, winnerId: string, winnerName: string): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        status: 'FINISHED',
        winnerId,
        winnerName,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to finish match:', e);
    }
  }

  /**
   * Leave / close room
   */
  public static async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as RoomData;

      if (room.host.userId === userId) {
        // Host leaving -> terminate room
        await deleteDoc(roomRef);
      } else {
        // Guest leaving -> reset to waiting
        await updateDoc(roomRef, {
          guest: null,
          guestState: null,
          status: 'WAITING',
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      console.warn('Failed to leave room:', e);
    }
  }

  /**
   * Submit score to Daily Global Leaderboard
   */
  public static async submitDailyScore(
    userId: string,
    displayName: string,
    photoURL: string,
    score: number,
    maxAltitude: number,
    planetsVisited: number,
    levelReached: number = 1
  ): Promise<boolean> {
    try {
      const todayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const entryRef = doc(db, 'daily_leaderboards', todayKey, 'entries', userId);

      // Check existing daily entry to only update if higher
      const existingSnap = await getDoc(entryRef);
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        if (existingData.score >= score) {
          return false; // Already has equal or higher score today
        }
      }

      await setDoc(entryRef, {
        userId,
        displayName: displayName || 'Cosmic Explorer',
        photoURL: photoURL || '',
        score,
        maxAltitude: Math.floor(maxAltitude),
        planetsVisited,
        levelReached,
        dateKey: todayKey,
        submittedAt: Date.now()
      }, { merge: true });

      return true;
    } catch (e) {
      console.warn('Failed to submit daily score:', e);
      return false;
    }
  }

  /**
   * Fetch Daily Global Leaderboard rankings
   */
  public static async getDailyLeaderboard(
    dateKey: string = new Date().toISOString().split('T')[0],
    maxLimit: number = 25
  ): Promise<any[]> {
    try {
      const entriesRef = collection(db, 'daily_leaderboards', dateKey, 'entries');
      const q = query(entriesRef, orderBy('score', 'desc'), limit(maxLimit));
      const snap = await getDocs(q);
      const results: any[] = [];
      snap.forEach((d) => {
        results.push({ id: d.id, ...d.data() });
      });
      return results;
    } catch (e) {
      console.warn('Failed to fetch daily leaderboard:', e);
      return [];
    }
  }

  /**
   * Save Home Planet sanctuary base to Firestore
   */
  public static async saveHomePlanet(userId: string, homePlanet: any): Promise<boolean> {
    try {
      const docRef = doc(db, 'home_planets', userId);
      await setDoc(docRef, {
        ...homePlanet,
        userId,
        lastSavedAt: Date.now()
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('Failed to save home planet to cloud:', e);
      return false;
    }
  }

  /**
   * Load Home Planet sanctuary base from Firestore
   */
  public static async loadHomePlanet(userId: string): Promise<any | null> {
    try {
      const docRef = doc(db, 'home_planets', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.warn('Failed to load home planet from cloud:', e);
      return null;
    }
  }
}
