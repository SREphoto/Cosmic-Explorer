import { audioEngine } from '../core/AudioEngine';
import { INITIAL_STAGES } from '../core/Config';
import { PlayerStats, StageQuest, UserSavedData } from '../types/game';

export class QuestSystem {
  public stages: StageQuest[];
  public currentStageIndex: number = 0;

  constructor(savedData: UserSavedData) {
    // Clone initial stages and apply completion state
    this.stages = JSON.parse(JSON.stringify(INITIAL_STAGES));
    this.currentStageIndex = savedData.currentStageIndex || 0;

    savedData.completedStageIds.forEach((id) => {
      const found = this.stages.find((s) => s.stageId === id);
      if (found) {
        found.completed = true;
        found.objectives.forEach((o) => {
          o.completed = true;
          o.currentCount = o.targetCount;
        });
      }
    });
  }

  public getCurrentStage(): StageQuest | null {
    if (this.currentStageIndex >= this.stages.length) {
      return this.stages[this.stages.length - 1];
    }
    return this.stages[this.currentStageIndex];
  }

  public updateMetrics(stats: PlayerStats): { stageCleared: boolean; rewardStars: number; rewardDiamonds: number } {
    const currentStage = this.getCurrentStage();
    if (!currentStage || currentStage.completed) {
      return { stageCleared: false, rewardStars: 0, rewardDiamonds: 0 };
    }

    let allCompleted = true;

    currentStage.objectives.forEach((obj) => {
      if (obj.completed) return;

      switch (obj.type) {
        case 'FULL_ROTATIONS':
          obj.currentCount = Math.max(obj.currentCount, Math.floor(stats.planetRotationsCurrent), stats.fullOrbitsCompleted);
          break;
        case 'CONSECUTIVE_PERFECT_JUMPS':
          obj.currentCount = Math.max(obj.currentCount, stats.consecutivePerfectJumps);
          break;
        case 'COLLECT_STARS_SINGLE_RUN':
          obj.currentCount = stats.starsCollected;
          break;
        case 'LAND_ON_SUNS':
          obj.currentCount = stats.sunsLandedCount;
          break;
        case 'REACH_ALTITUDE':
          obj.currentCount = Math.floor(stats.altitude);
          break;
        case 'COLLECT_DIAMONDS_SINGLE_RUN':
          obj.currentCount = stats.diamondsCollected;
          break;
        case 'USE_POWERUPS':
          obj.currentCount = stats.powerUpsUsedCount;
          break;
      }

      if (obj.currentCount >= obj.targetCount) {
        obj.currentCount = obj.targetCount;
        obj.completed = true;
      } else {
        allCompleted = false;
      }
    });

    if (allCompleted) {
      currentStage.completed = true;
      audioEngine.playQuestClear();

      const stars = currentStage.rewardStars;
      const diamonds = currentStage.rewardDiamonds;

      if (this.currentStageIndex < this.stages.length - 1) {
        this.currentStageIndex++;
      }

      return {
        stageCleared: true,
        rewardStars: stars,
        rewardDiamonds: diamonds
      };
    }

    return { stageCleared: false, rewardStars: 0, rewardDiamonds: 0 };
  }
}
