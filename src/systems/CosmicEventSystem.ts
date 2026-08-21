export type CosmicEventType = 'METEOR_SHOWER' | 'NEBULA_FLARE' | 'VOID_ECLIPSE';

export interface CosmicEvent {
  id: CosmicEventType;
  name: string;
  buffDescription: string;
  colorClass: string;
}

export class CosmicEventSystem {
  public static getActiveEvent(): CosmicEvent {
    // Determine event based on current hour to simulate limited-time rotation
    const hour = new Date().getHours();
    if (hour % 3 === 0) {
      return { id: 'METEOR_SHOWER', name: 'Meteor Shower', buffDescription: '+50% Star Value', colorClass: 'from-amber-500/20 to-orange-500/5 text-amber-400' };
    } else if (hour % 3 === 1) {
      return { id: 'NEBULA_FLARE', name: 'Nebula Flare', buffDescription: '2x Power-Up Drops', colorClass: 'from-sky-500/20 to-indigo-500/5 text-sky-400' };
    } else {
      return { id: 'VOID_ECLIPSE', name: 'Void Eclipse', buffDescription: 'Double XP Earned', colorClass: 'from-purple-500/20 to-fuchsia-500/5 text-purple-400' };
    }
  }
}
