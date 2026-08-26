import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Star, Gem, Sparkles, Edit3, FileText, HelpCircle, User } from 'lucide-react';
import { UserSavedData } from '../../types/game';
import { HomeWorldSaveState, PlanetLocationDef, SceneId } from '../../types/homeWorld';
import { SCENE_DEFS, npcById, taskById, nextTaskAfter, SECRET_DEFS } from '../../core/HomeWorldData';
import { NPC_PORTRAITS } from './portraits';
import { weatherAt, WEATHER_META } from '../../core/Weather';
import { StorageManager } from '../../core/Storage';
import { audioEngine } from '../../core/AudioEngine';
import { showToast } from '../Toast';
import { PlanetSphereView } from './PlanetSphereView';
import { PovSceneView } from './PovSceneView';
import { HomePlanetScreen } from '../HomePlanetScreen';

type View = { mode: 'planet' } | { mode: 'scene'; sceneId: SceneId } | { mode: 'sim' };

interface HomeWorldScreenProps {
  savedData: UserSavedData;
  onStartGame: () => void;
  onOpenHomePlanet: () => void;
  onOpenMultiplayer: () => void;
  onOpenWardrobe: () => void;
  onOpenUpgrades: () => void;
  onOpenAchievements: () => void;
  onOpenQuests: () => void;
  onOpenMedalChest: () => void;
  onOpenLogin: () => void;
  onOpenDocs: () => void;
  onOpenTutorial: () => void;
  onOpenMap: () => void;
  onUpdateSavedData: (updated: UserSavedData) => void;
}

const DEFAULT_HOME_WORLD: HomeWorldSaveState = {
  townName: 'Sanctuary Prime',
  foundedAt: 0,
  completedTaskIds: [],
  currentTaskId: 't1_meet_nova',
  npcTalkCounts: {},
};

export const HomeWorldScreen: React.FC<HomeWorldScreenProps> = ({
  savedData,
  onStartGame,
  onOpenHomePlanet,
  onOpenMultiplayer,
  onOpenWardrobe,
  onOpenUpgrades,
  onOpenAchievements,
  onOpenQuests,
  onOpenMedalChest,
  onOpenLogin,
  onOpenDocs,
  onOpenTutorial,
  onOpenMap,
  onUpdateSavedData,
}) => {
  const homeWorld: HomeWorldSaveState = {
    ...DEFAULT_HOME_WORLD,
    foundedAt: savedData.planetSim?.createdAt || Date.now(),
    ...(savedData.homeWorld || {}),
  };
  const townName = homeWorld.townName || savedData.homePlanet?.name || 'Sanctuary Prime';

  const [view, setView] = useState<View>({ mode: 'planet' });
  const [overlay, setOverlay] = useState(0); // 0 = clear, 1 = black
  const [leaving, setLeaving] = useState(false); // planet zoom-out anim
  const [dialogue, setDialogue] = useState<{ npcId: string; text: string; taskTitle?: string } | null>(null);
  const [weather, setWeather] = useState(() => weatherAt(Date.now()));
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  // Town weather ticker
  useEffect(() => {
    const id = window.setInterval(() => setWeather(weatherAt(Date.now())), 20000);
    return () => clearInterval(id);
  }, []);

  // Living town: gentle theme music + weather ambience while home
  useEffect(() => {
    const kick = () => audioEngine.startTownMusic();
    window.addEventListener('pointerdown', kick, { once: true });
    return () => {
      window.removeEventListener('pointerdown', kick);
      audioEngine.stopTownMusic();
      audioEngine.setWeatherAmbience('none');
    };
  }, []);

  useEffect(() => {
    audioEngine.setWeatherAmbience(
      weather === 'RAIN' ? 'rain' : weather === 'FOG' || weather === 'SNOW' ? 'wind' : 'none'
    );
  }, [weather]);

  const later = (fn: () => void, ms: number) => timeoutsRef.current.push(setTimeout(fn, ms));

  // -------------------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------------------
  const persist = useCallback(
    (patch: Partial<UserSavedData>) => {
      const updated = StorageManager.saveData(patch);
      onUpdateSavedData(updated);
      return updated;
    },
    [onUpdateSavedData]
  );

  const saveHomeWorld = useCallback(
    (hw: Partial<HomeWorldSaveState>) => {
      const current: HomeWorldSaveState = { ...DEFAULT_HOME_WORLD, ...(savedData.homeWorld || {}) };
      persist({ homeWorld: { ...current, ...hw } });
    },
    [persist, savedData.homeWorld]
  );

  // -------------------------------------------------------------------------
  // Tasks
  // -------------------------------------------------------------------------
  const currentTask = taskById(homeWorld.currentTaskId);
  const taskGiver = currentTask ? npcById(currentTask.giverNpcId) : null;

  const fireEvent = useCallback(
    (event: { type: 'VISIT_SCENE'; sceneId: SceneId } | { type: 'LAUNCH_RUN' } | { type: 'OPEN_GARDEN_CONSOLE' }) => {
      const hw: HomeWorldSaveState = { ...DEFAULT_HOME_WORLD, ...(savedData.homeWorld || {}) };
      const task = taskById(hw.currentTaskId);
      if (!task) return;
      const c = task.condition;
      const match =
        (c.type === 'VISIT_SCENE' && event.type === 'VISIT_SCENE' && c.sceneId === event.sceneId) ||
        (c.type === 'LAUNCH_RUN' && event.type === 'LAUNCH_RUN') ||
        (c.type === 'OPEN_GARDEN_CONSOLE' && event.type === 'OPEN_GARDEN_CONSOLE');
      if (!match) return;

      const completed = [...hw.completedTaskIds, task.id];
      const next = nextTaskAfter(completed);
      const balance = savedData.totalStarDust || savedData.starDustCurrency || 0;
      persist({
        homeWorld: { ...hw, completedTaskIds: completed, currentTaskId: next ? next.id : null },
        totalStarDust: balance + task.rewardStarDust,
        starDustCurrency: balance + task.rewardStarDust,
        totalStarDustAllTime: (savedData.totalStarDustAllTime || 0) + task.rewardStarDust,
        totalStars: (savedData.totalStars || 0) + task.rewardStars,
        totalStarsAllTime: (savedData.totalStarsAllTime || 0) + task.rewardStars,
      });
      audioEngine.playQuestClear();
      showToast(
        'QUEST_COMPLETE',
        `Task Complete — ${task.title}`,
        `${npcById(task.giverNpcId).name} rewards you: +${task.rewardStarDust} Star Dust, +${task.rewardStars} Stars!`
      );
    },
    [persist, savedData]
  );

  // -------------------------------------------------------------------------
  // Cinematic transitions (locked sequence: zoom → black → scene fades up)
  // -------------------------------------------------------------------------
  const enterScene = useCallback(
    (sceneId: SceneId) => {
      audioEngine.playMenuSelect();
      setDialogue(null);
      setOverlay(1);
      if (viewRef.current.mode === 'planet') setLeaving(true);
      later(() => {
        setView({ mode: 'scene', sceneId });
        setLeaving(false);
        fireEvent({ type: 'VISIT_SCENE', sceneId });
        later(() => setOverlay(0), 80);
      }, 460);
    },
    [fireEvent]
  );

  const exitToPlanet = useCallback(() => {
    audioEngine.playMenuClick();
    setDialogue(null);
    setOverlay(1);
    later(() => {
      setView({ mode: 'planet' });
      later(() => setOverlay(0), 80);
    }, 380);
  }, []);

  const enterLocation = useCallback(
    (loc: PlanetLocationDef) => {
      if (!loc.sceneId) {
        audioEngine.playPowerUpExpired();
        showToast('GENERIC', loc.name, loc.lockedHint || 'This district is not built yet.');
        return;
      }
      enterScene(loc.sceneId);
    },
    [enterScene]
  );

  const openSimConsole = useCallback(() => {
    audioEngine.playMenuSelect();
    setDialogue(null);
    setOverlay(1);
    later(() => {
      setView({ mode: 'sim' });
      later(() => setOverlay(0), 80);
    }, 380);
  }, []);

  const backToStreetFromSim = useCallback(() => {
    audioEngine.playMenuClick();
    setOverlay(1);
    later(() => {
      setView({ mode: 'scene', sceneId: 'command' });
      later(() => setOverlay(0), 80);
    }, 380);
  }, []);

  // -------------------------------------------------------------------------
  // Dialogue & NPCs
  // -------------------------------------------------------------------------
  const handleTalk = useCallback(
    (npcId: string) => {
      audioEngine.playClick();
      const npc = npcById(npcId);
      const hw: HomeWorldSaveState = { ...DEFAULT_HOME_WORLD, ...(savedData.homeWorld || {}) };
      const task = taskById(hw.currentTaskId);

      if (task && task.giverNpcId === npcId) {
        setDialogue({ npcId, text: task.text, taskTitle: task.title });
        return;
      }

      const count = hw.npcTalkCounts?.[npcId] || 0;
      const line = npc.lines[count % npc.lines.length];
      saveHomeWorld({ npcTalkCounts: { ...(hw.npcTalkCounts || {}), [npcId]: count + 1 } });
      setDialogue({ npcId, text: line });
    },
    [savedData.homeWorld, saveHomeWorld]
  );

  // -------------------------------------------------------------------------
  // Scene actions → existing game systems
  // -------------------------------------------------------------------------
  const handleAction = useCallback(
    (actionId: string) => {
      audioEngine.playMenuClick();
      switch (actionId) {
        case 'launch':
          fireEvent({ type: 'LAUNCH_RUN' });
          onStartGame();
          break;
        case 'arena':
          onOpenMultiplayer();
          break;
        case 'wardrobe':
          onOpenWardrobe();
          break;
        case 'map':
          onOpenMap();
          break;
        case 'upgrades':
          onOpenUpgrades();
          break;
        case 'medals':
          onOpenMedalChest();
          break;
        case 'badges':
          onOpenAchievements();
          break;
        case 'garden_console':
          fireEvent({ type: 'OPEN_GARDEN_CONSOLE' });
          onOpenHomePlanet();
          break;
        case 'decor_shop':
        case 'traveler':
        case 'vault':
          onOpenHomePlanet();
          break;
        case 'treasury': {
          const balance = savedData.totalStarDust || savedData.starDustCurrency || 0;
          showToast(
            'GENERIC',
            'First Stellar Bank',
            `Treasury: ${balance.toLocaleString()} Star Dust · ${(savedData.totalStars || 0).toLocaleString()} Stars · ${(savedData.totalDiamonds || 0).toLocaleString()} Diamonds. Securely held.`
          );
          break;
        }
        case 'sim_console':
          openSimConsole();
          break;
        case 'board':
          onOpenQuests();
          break;
        default:
          break;
      }
    },
    [fireEvent, onStartGame, onOpenMultiplayer, onOpenWardrobe, onOpenMap, onOpenUpgrades, onOpenMedalChest, onOpenAchievements, onOpenHomePlanet, onOpenQuests, openSimConsole, savedData]
  );

  // -------------------------------------------------------------------------
  // Rename
  // -------------------------------------------------------------------------
  const handleSaveRename = () => {
    const name = renameValue.trim();
    if (!name) return;
    saveHomeWorld({ townName: name });
    if (savedData.homePlanet) {
      persist({ homePlanet: { ...savedData.homePlanet, name } });
    }
    audioEngine.playUnlockSound();
    showToast('SUCCESS', 'Renamed', `Your home is now known as ${name}.`);
    setIsRenaming(false);
  };

  // -------------------------------------------------------------------------
  // Secrets
  // -------------------------------------------------------------------------
  const handleSecretFound = useCallback(
    (secretId: string) => {
      const def = SECRET_DEFS.find((s) => s.id === secretId);
      if (!def) return;
      const hw: HomeWorldSaveState = { ...DEFAULT_HOME_WORLD, ...(savedData.homeWorld || {}) };
      if ((hw.discoveredSecretIds || []).includes(secretId)) return;
      const balance = savedData.totalStarDust || savedData.starDustCurrency || 0;
      persist({
        homeWorld: { ...hw, discoveredSecretIds: [...(hw.discoveredSecretIds || []), secretId] },
        totalStarDust: balance + def.starDust,
        starDustCurrency: balance + def.starDust,
        totalStarDustAllTime: (savedData.totalStarDustAllTime || 0) + def.starDust,
        totalStars: (savedData.totalStars || 0) + def.stars,
        totalStarsAllTime: (savedData.totalStarsAllTime || 0) + def.stars,
      });
      audioEngine.playPowerUpCollect();
      showToast(
        'SUCCESS',
        `Secret discovered — ${def.name}`,
        `${def.lore} (+${def.starDust} Star Dust${def.stars ? `, +${def.stars} Star` : ''})`
      );
    },
    [persist, savedData]
  );

  const starDustBalance = savedData.totalStarDust || savedData.starDustCurrency || 0;
  const foundedDate = homeWorld.foundedAt
    ? new Date(homeWorld.foundedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const scene = view.mode === 'scene' ? SCENE_DEFS[view.sceneId] : null;

  // Per-building music mood
  useEffect(() => {
    const mood: 'warm' | 'bright' | 'low' =
      view.mode === 'scene' && scene
        ? ['hangar', 'command', 'warehouse'].includes(scene.id)
          ? 'low'
          : scene.id === 'greenhouse'
            ? 'bright'
            : 'warm'
        : 'warm';
    audioEngine.setTownMood(mood);
  }, [view.mode, scene?.id]);
  const taskNpcIds = currentTask ? [currentTask.giverNpcId] : [];
  const dialogueNpc = dialogue ? npcById(dialogue.npcId) : null;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-slate-950 text-white ui-interactive overflow-hidden select-none">
      {/* ---------------------------- PLANET VIEW --------------------------- */}
      {view.mode === 'planet' && (
        <div
          className={`relative flex-1 flex flex-col transition-transform duration-500 ease-in ${
            leaving ? 'scale-[1.9] opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* Top chrome — minimal, the planet is the UI */}
          <div className="shrink-0 flex items-center justify-between px-2.5 pt-2 z-10">
            <div className="flex items-center gap-1.5">
              <span className="bg-slate-900/85 border border-slate-800 px-2 py-1 rounded-full text-[10px] font-bold text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {savedData.totalStars.toLocaleString()}
              </span>
              <span className="bg-slate-900/85 border border-slate-800 px-2 py-1 rounded-full text-[10px] font-bold text-sky-300 flex items-center gap-1">
                <Gem className="w-3 h-3 fill-sky-400 text-sky-400" /> {(savedData.totalDiamonds || 0).toLocaleString()}
              </span>
              <span className="bg-slate-900/85 border border-slate-800 px-2 py-1 rounded-full text-[10px] font-bold text-yellow-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" /> {starDustBalance.toLocaleString()}
              </span>
              <span
                className="bg-slate-900/85 border border-slate-800 px-2 py-1 rounded-full text-[10px] font-bold text-slate-300 flex items-center gap-1"
                title="Town weather"
              >
                <span>{WEATHER_META[weather].icon}</span> {WEATHER_META[weather].label}
              </span>
              <span
                className="bg-slate-900/85 border border-slate-800 px-2 py-1 rounded-full text-[10px] font-bold text-amber-200/90 flex items-center gap-1"
                title="Secrets discovered"
              >
                🔎 {(homeWorld.discoveredSecretIds || []).length}/{SECRET_DEFS.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { audioEngine.playMenuClick(); onOpenTutorial(); }}
                className="bg-slate-900/85 border border-slate-800 p-1.5 rounded-full text-slate-400 hover:text-white transition"
                title="Guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { audioEngine.playMenuClick(); onOpenDocs(); }}
                className="bg-slate-900/85 border border-slate-800 p-1.5 rounded-full text-slate-400 hover:text-white transition"
                title="Settings & Nexus"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { audioEngine.playMenuClick(); onOpenLogin(); }}
                className="bg-slate-900/85 border border-slate-800 p-1.5 rounded-full text-indigo-300 hover:text-white transition"
                title="Account"
              >
                <User className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* The sphere */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-1">
            <PlanetSphereView pollution={savedData.planetSim?.pollution || 0} townName={townName} onEnterLocation={enterLocation} />
          </div>

          {/* Bottom hints + identity */}
          <div className="shrink-0 pb-2 px-3 space-y-1 z-10">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <span>Founded {foundedDate}</span>
              <button
                onClick={() => { audioEngine.playClick(); setRenameValue(townName); setIsRenaming(true); }}
                className="text-slate-500 hover:text-white transition"
                title="Rename your world"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500">
              Drag to spin your world · tap a place to visit it
            </p>
          </div>
        </div>
      )}

      {/* ----------------------------- POV SCENE ---------------------------- */}
      {view.mode === 'scene' && scene && (
        <div className="flex-1 min-h-0 flex flex-col px-2 pt-2 pb-1.5 overflow-y-auto">
          <PovSceneView
            scene={scene}
            taskNpcIds={taskNpcIds}
            discoveredSecretIds={homeWorld.discoveredSecretIds || []}
            onEnterScene={(id) => enterScene(id)}
            onExit={scene.kind === 'street' ? exitToPlanet : () => enterScene('street')}
            onTalk={handleTalk}
            onAction={handleAction}
            onSecretFound={handleSecretFound}
          />

          {/* dialogue box */}
          {dialogue && dialogueNpc && (
            <div className="mt-2 bg-slate-900/95 border border-slate-700 rounded-2xl p-3 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {NPC_PORTRAITS[dialogueNpc.id] ? (
                    <img
                      src={NPC_PORTRAITS[dialogueNpc.id]}
                      alt={dialogueNpc.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    dialogueNpc.icon
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{dialogueNpc.name}</span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider">{dialogueNpc.role}</span>
                    {dialogue.taskTitle && (
                      <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full px-2 py-0.5 uppercase">
                        Task: {dialogue.taskTitle}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">“{dialogue.text}”</p>
                </div>
                <button
                  onClick={() => { audioEngine.playClick(); setDialogue(null); }}
                  className="text-slate-500 hover:text-white text-xs font-bold px-2 py-1 shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* current task tracker */}
          {currentTask && !dialogue && (
            <div className="mt-2 bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-sm">📜</span>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider block">
                  Current task — {taskGiver?.name}
                </span>
                <p className="text-[10px] text-slate-300 truncate">{currentTask.title}: {currentTask.text}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------- SIM CONSOLE ---------------------------- */}
      {view.mode === 'sim' && (
        <div className="absolute inset-0 z-30">
          <HomePlanetScreen
            savedData={savedData}
            onStartGame={onStartGame}
            onOpenHomePlanet={onOpenHomePlanet}
            onOpenMultiplayer={onOpenMultiplayer}
            onOpenWardrobe={onOpenWardrobe}
            onOpenUpgrades={onOpenUpgrades}
            onOpenAchievements={onOpenAchievements}
            onOpenQuests={() => {}}
            onOpenMedalChest={onOpenMedalChest}
            onOpenLogin={onOpenLogin}
            onOpenDocs={onOpenDocs}
            onOpenTutorial={onOpenTutorial}
            onOpenMap={onOpenMap}
            onUpdateSavedData={onUpdateSavedData}
            onBack={backToStreetFromSim}
          />
        </div>
      )}

      {/* ------------------------- Rename overlay --------------------------- */}
      {isRenaming && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-sm space-y-3">
            <h3 className="text-sm font-bold text-white">Name Your World</h3>
            <p className="text-[11px] text-slate-400">
              This name appears on your planet and in town. Server-unique names arrive with the social update.
            </p>
            <input
              type="text"
              value={renameValue}
              maxLength={24}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-sky-500"
              placeholder="e.g. Planet Solara"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveRename}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition"
              >
                Save Name
              </button>
              <button
                onClick={() => setIsRenaming(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- Cinematic black transition -------------------- */}
      <div
        className="absolute inset-0 z-50 bg-black pointer-events-none"
        style={{
          opacity: overlay,
          transition: overlay === 1 ? 'opacity 400ms ease-in' : 'opacity 700ms ease-out',
        }}
      />
    </div>
  );
};
