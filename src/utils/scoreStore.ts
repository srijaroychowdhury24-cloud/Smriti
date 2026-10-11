import { GameScoreRecord, Language } from '../types';
import { saveScoreToSupabase } from './supabaseClient';

const STORAGE_KEY = 'smriti_cognitive_scores_v1';

export function getStoredScores(): GameScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with friendly baseline sample if empty so the Caregiver Dashboard isn't barren on first launch
      const sampleRecords: GameScoreRecord[] = [
        {
          id: 'seed-1',
          timestamp: Date.now() - 86400000 * 2,
          dateFormatted: new Date(Date.now() - 86400000 * 2).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          gameType: 'Cultural Memory Match',
          score: 420,
          matches: 4,
          moves: 6,
          accuracy: 88,
          timeSpentSec: 42,
          difficulty: 'gentle',
          language: 'bn',
        },
        {
          id: 'seed-2',
          timestamp: Date.now() - 86400000,
          dateFormatted: new Date(Date.now() - 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          gameType: 'Cultural Memory Match',
          score: 550,
          matches: 4,
          moves: 5,
          accuracy: 94,
          timeSpentSec: 36,
          difficulty: 'adaptive',
          language: 'hi',
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleRecords));
      return sampleRecords;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load scores from storage', e);
    return [];
  }
}

export function saveScoreRecord(record: Omit<GameScoreRecord, 'id' | 'timestamp' | 'dateFormatted'>): GameScoreRecord {
  const scores = getStoredScores();
  const now = new Date();
  const newRecord: GameScoreRecord = {
    ...record,
    id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    dateFormatted: now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated = [newRecord, ...scores].slice(0, 50); // keep last 50
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save score', e);
  }

  // Cloud backup to Supabase (safe background async)
  saveScoreToSupabase({
    gameType: newRecord.gameType,
    score: newRecord.score,
    matches: newRecord.matches,
    moves: newRecord.moves,
    accuracy: newRecord.accuracy,
    timeSpentSec: newRecord.timeSpentSec,
    difficulty: newRecord.difficulty,
    language: newRecord.language,
    timestamp: newRecord.dateFormatted,
  }).catch((err) => console.warn('Supabase async sync notice:', err));

  return newRecord;
}

export function clearStoredScores(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear scores', e);
  }
}

export interface ScoreSummaryStats {
  totalSessions: number;
  highScore: number;
  avgAccuracy: number;
  totalMatches: number;
  latestScore: number;
}

export function computeScoreSummary(scores: GameScoreRecord[]): ScoreSummaryStats {
  if (!scores || scores.length === 0) {
    return {
      totalSessions: 0,
      highScore: 0,
      avgAccuracy: 0,
      totalMatches: 0,
      latestScore: 0,
    };
  }

  const totalSessions = scores.length;
  const highScore = Math.max(...scores.map((s) => s.score));
  const avgAccuracy = Math.round(
    scores.reduce((acc, s) => acc + s.accuracy, 0) / totalSessions
  );
  const totalMatches = scores.reduce((acc, s) => acc + s.matches, 0);
  const latestScore = scores[0].score;

  return {
    totalSessions,
    highScore,
    avgAccuracy,
    totalMatches,
    latestScore,
  };
}
