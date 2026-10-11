/**
 * Adaptive Cognitive AI/ML Engine for Smriti
 * 
 * Implements Item Response Theory (IRT) and dynamic Bayesian / Elo cognitive rating
 * to assess patient latent cognitive ability (θ), reaction latency, cognitive fatigue index,
 * and Dynamic Difficulty Adjustment (DDA).
 */

export interface CognitiveMetricTrial {
  timestamp: number;
  gameId: string;
  level: number;
  latencyMs: number;
  isCorrect: boolean;
  attempts: number;
}

export interface AdaptiveCognitiveProfile {
  latentAbility: number; // θ parameter, typically -3.0 to +3.0 (baseline 0.0)
  overallAccuracy: number; // 0 - 100%
  averageLatencyMs: number; // moving average reaction time
  cognitiveFatigueIndex: number; // 0.0 (fresh) to 1.0 (fatigued)
  cognitiveVelocity: number; // rate of change in ability over recent sessions
  pacingMultiplier: number; // 0.75x (gentler, more time) to 1.25x (brisk)
  adaptiveHintThresholdMs: number; // dynamic latency before gentle Mimi hint
  fatigueWarning: boolean;
  recommendedNextActivity: {
    activityType: 'game' | 'garden' | 'breathing' | 'reminders';
    gameId?: string;
    level?: number;
    reason: {
      en: string;
      bn: string;
      hi: string;
      as: string;
    };
  };
  recentTrials: CognitiveMetricTrial[];
  lastUpdated: string;
}

const STORAGE_KEY = 'smriti_adaptive_ml_profile_v1';

const DEFAULT_PROFILE: AdaptiveCognitiveProfile = {
  latentAbility: 0.15,
  overallAccuracy: 88,
  averageLatencyMs: 2400,
  cognitiveFatigueIndex: 0.12,
  cognitiveVelocity: 0.04,
  pacingMultiplier: 1.0,
  adaptiveHintThresholdMs: 4500,
  fatigueWarning: false,
  recommendedNextActivity: {
    activityType: 'game',
    gameId: 'cultural-match',
    level: 1,
    reason: {
      en: 'Gentle cultural symbols to awaken morning memory recall.',
      bn: 'সকালের সতেজ স্মৃতিশক্তি জাগিয়ে তুলতে সহজ সাংস্কৃতিক প্রতীক।',
      hi: 'प्रातःकाल की स्मृति को जागृत करने हेतु सहज सांस्कृतिक प्रतीक।',
      as: 'ৰাতিপুৱাৰ সতেজ স্মৃতিশক্তি সজীৱ কৰি তুলিবলৈ সহজ সাংস্কৃতিক প্রতীক।'
    }
  },
  recentTrials: [],
  lastUpdated: new Date().toISOString()
};

export function loadAdaptiveProfile(): AdaptiveCognitiveProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveAdaptiveProfile(profile: AdaptiveCognitiveProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save adaptive cognitive profile:', err);
  }
}

/**
 * Item Response Theory (IRT) probability of success:
 * P(correct | θ, b) = 1 / (1 + exp(-1.7 * (θ - b)))
 * where θ is patient ability, b is item difficulty.
 */
export function estimateSuccessProbability(ability: number, itemDifficulty: number): number {
  return 1 / (1 + Math.exp(-1.7 * (ability - itemDifficulty)));
}

/**
 * Record a trial in real-time during game play and update the ML model.
 */
export function recordAdaptiveTrial(trial: {
  gameId: string;
  level: number;
  latencyMs: number;
  isCorrect: boolean;
  attempts?: number;
}): AdaptiveCognitiveProfile {
  const current = loadAdaptiveProfile();
  const attempts = trial.attempts ?? (trial.isCorrect ? 1 : 2);

  const newTrial: CognitiveMetricTrial = {
    timestamp: Date.now(),
    gameId: trial.gameId,
    level: trial.level,
    latencyMs: Math.max(300, trial.latencyMs),
    isCorrect: trial.isCorrect,
    attempts
  };

  // Keep last 40 trials for moving metrics
  const updatedTrials = [newTrial, ...current.recentTrials].slice(0, 40);

  // 1. Moving Average Latency
  const totalLatency = updatedTrials.reduce((sum, t) => sum + t.latencyMs, 0);
  const averageLatencyMs = Math.round(totalLatency / updatedTrials.length);

  // 2. Accuracy Calculation
  const correctCount = updatedTrials.filter(t => t.isCorrect).length;
  const overallAccuracy = Math.round((correctCount / updatedTrials.length) * 100);

  // 3. Estimate Level Difficulty parameter b (-2.0 for lvl 1, up to +2.5 for lvl 10)
  const itemDifficulty = -1.8 + (trial.level - 1) * 0.45;

  // 4. Update Latent Ability θ using Bayesian update step:
  const expectedP = estimateSuccessProbability(current.latentAbility, itemDifficulty);
  const actualOutcome = trial.isCorrect ? 1.0 : 0.0;
  const learningRate = 0.15; // K-factor adaptation step
  const abilityDelta = learningRate * (actualOutcome - expectedP);
  const newLatentAbility = parseFloat(
    Math.max(-3.0, Math.min(3.0, current.latentAbility + abilityDelta)).toFixed(3)
  );

  // 5. Cognitive Velocity (trend of last 10 trials vs previous 10)
  let cognitiveVelocity = 0.0;
  if (updatedTrials.length >= 10) {
    const recent5 = updatedTrials.slice(0, 5).filter(t => t.isCorrect).length / 5;
    const older5 = updatedTrials.slice(5, 10).filter(t => t.isCorrect).length / 5;
    cognitiveVelocity = parseFloat((recent5 - older5).toFixed(2));
  }

  // 6. Cognitive Fatigue Index Calculation:
  // Detect latency drift (recent trials taking significantly longer than base) and error streaks
  let cognitiveFatigueIndex = 0.1;
  if (updatedTrials.length >= 6) {
    const last3Latency = updatedTrials.slice(0, 3).reduce((s, t) => s + t.latencyMs, 0) / 3;
    const baselineLatency = updatedTrials.slice(3).reduce((s, t) => s + t.latencyMs, 0) / (updatedTrials.length - 3);
    const latencyInflationRatio = last3Latency / Math.max(500, baselineLatency);
    
    // Check consecutive errors
    const recentErrors = updatedTrials.slice(0, 4).filter(t => !t.isCorrect).length;

    cognitiveFatigueIndex = Math.min(1.0, Math.max(0.0, 
      (latencyInflationRatio - 1.0) * 0.4 + (recentErrors / 4) * 0.6
    ));
  }
  cognitiveFatigueIndex = parseFloat(cognitiveFatigueIndex.toFixed(2));
  const fatigueWarning = cognitiveFatigueIndex >= 0.65;

  // 7. Dynamic Pacing Multiplier
  // If player is quick and accurate, pace can be slightly brisker (up to 1.15x).
  // If player shows hesitation or latency, slow down to 0.8x for calming space.
  let pacingMultiplier = 1.0;
  if (averageLatencyMs < 1800 && overallAccuracy > 90) {
    pacingMultiplier = 1.15;
  } else if (averageLatencyMs > 3200 || cognitiveFatigueIndex > 0.5) {
    pacingMultiplier = 0.82;
  }

  // 8. Adaptive Hint Threshold: Proactively offer gentle voice hint if trial takes 1.6x average
  const adaptiveHintThresholdMs = Math.max(3000, Math.round(averageLatencyMs * 1.6));

  // 9. Recommend next activity
  let recommendedNextActivity = current.recommendedNextActivity;
  if (fatigueWarning) {
    recommendedNextActivity = {
      activityType: 'breathing',
      reason: {
        en: 'Mild cognitive fatigue detected. A 2-minute calming breathing session will refresh mental energy.',
        bn: 'সামান্য মানসিক ক্লান্তি লক্ষ্য করা গেছে। ২ মিনিটের স্নিগ্ধ শ্বাস-প্রশ্বাস মনকে আবার শান্ত করবে।',
        hi: 'हल्की मानसिक थकान के संकेत। २ मिनट का शांत प्राणायाम ऊर्जा पुनः लौटाएगा।',
        as: 'সামান্য মানসিক ক্লান্তি অনুভৱ হৈছে। ২ মিনিটৰ শান্ত উশাহ-নিশাহে মনক সতেজ কৰি তুলিব।'
      }
    };
  } else if (overallAccuracy >= 85 && newLatentAbility > 0.5) {
    recommendedNextActivity = {
      activityType: 'game',
      gameId: trial.gameId,
      level: Math.min(10, trial.level + 1),
      reason: {
        en: `High recall confidence! Ready for Level ${Math.min(10, trial.level + 1)}.`,
        bn: `উচ্চ আত্মবিশ্বাস! ধাপ ${Math.min(10, trial.level + 1)}-এর জন্য সম্পূর্ণ প্রস্তুত।`,
        hi: `उत्कृष्ट स्मरण क्षमता! स्तर ${Math.min(10, trial.level + 1)} के लिए तैयार।`,
        as: `অপূৰ্ব আত্মবিশ্বাস! স্তৰ ${Math.min(10, trial.level + 1)}ৰ বাবে সাজু।`
      }
    };
  } else {
    recommendedNextActivity = {
      activityType: 'garden',
      reason: {
        en: 'A serene stroll through the Mindful Botanical Garden to ground memories.',
        bn: 'স্মৃতি প্রস্ফুটিত করতে শান্ত বাগান ভ্রমণের স্নিগ্ধ মুহূর্ত।',
        hi: 'स्मृति को पोषित करने हेतु सुखद वाटिका भ्रमण।',
        as: 'স্মৃতি সজীৱ কৰিবলৈ শান্ত উদ্যান ভ্ৰমণৰ এটি স্নিগ্ধ মুহূৰ্ত।'
      }
    };
  }

  const updatedProfile: AdaptiveCognitiveProfile = {
    latentAbility: newLatentAbility,
    overallAccuracy,
    averageLatencyMs,
    cognitiveFatigueIndex,
    cognitiveVelocity,
    pacingMultiplier,
    adaptiveHintThresholdMs,
    fatigueWarning,
    recommendedNextActivity,
    recentTrials: updatedTrials,
    lastUpdated: new Date().toISOString()
  };

  saveAdaptiveProfile(updatedProfile);
  return updatedProfile;
}
