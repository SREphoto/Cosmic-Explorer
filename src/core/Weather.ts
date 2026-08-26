/**
 * Deterministic town weather. A global schedule (3-minute segments) so every
 * screen sees the same sky at the same moment; no state to persist.
 */
export type WeatherKind = 'CLEAR' | 'RAIN' | 'SNOW' | 'AURORA' | 'METEORS' | 'FOG';

export const WEATHER_META: Record<WeatherKind, { icon: string; label: string }> = {
  CLEAR: { icon: '🌙', label: 'Clear Dusk' },
  RAIN: { icon: '🌧️', label: 'Star Rain' },
  SNOW: { icon: '❄️', label: 'Comet Snow' },
  AURORA: { icon: '🌌', label: 'Aurora' },
  METEORS: { icon: '☄️', label: 'Meteor Shower' },
  FOG: { icon: '🌫️', label: 'Nebula Fog' },
};

const CYCLE: WeatherKind[] = ['CLEAR', 'CLEAR', 'RAIN', 'AURORA', 'CLEAR', 'SNOW', 'FOG', 'METEORS', 'CLEAR', 'RAIN'];

export function weatherAt(ts: number): WeatherKind {
  const seg = Math.floor(ts / 180000); // 3 min
  const h = Math.sin(seg * 127.1) * 43758.5453;
  const r = h - Math.floor(h);
  return CYCLE[Math.floor(r * CYCLE.length) % CYCLE.length];
}
