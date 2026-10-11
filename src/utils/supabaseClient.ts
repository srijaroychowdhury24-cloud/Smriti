import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GameScoreRecord, GardenFlower, GameLevelStatus } from '../types';

const metaEnv = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Persist a cognitive gameplay score to Supabase in background
 */
export async function saveScoreToSupabase(record: {
  gameType: string;
  score: number;
  matches: number;
  moves: number;
  accuracy: number;
  timeSpentSec: number;
  difficulty: string;
  language: string;
  timestamp: string;
}): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('scores').insert([
      {
        game_type: record.gameType,
        score: record.score,
        matches: record.matches,
        moves: record.moves,
        accuracy: record.accuracy,
        time_spent_sec: record.timeSpentSec,
        difficulty: record.difficulty,
        language: record.language,
        timestamp: record.timestamp,
      },
    ]);

    if (error) {
      console.warn('Supabase save score error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase network error saving score:', err);
    return false;
  }
}

/**
 * Fetch cloud cognitive history records from Supabase
 */
export async function fetchScoresFromSupabase(): Promise<GameScoreRecord[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Supabase fetch scores error:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id || `cloud-${Date.now()}`,
      gameType: row.game_type,
      score: row.score,
      matches: row.matches,
      moves: row.moves,
      accuracy: row.accuracy,
      timeSpentSec: row.time_spent_sec,
      difficulty: row.difficulty,
      language: row.language,
      timestamp: Date.now(),
      dateFormatted: row.timestamp,
    }));
  } catch (err) {
    console.warn('Supabase network error fetching scores:', err);
    return null;
  }
}

/**
 * Sync bloomed botanical garden flower to Supabase
 */
export async function syncGardenFlowerToSupabase(flower: GardenFlower): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('garden_flowers').upsert({
      day: flower.day,
      flower_name: flower.flowerName,
      symbol: flower.symbol,
      color: flower.color,
      meaning: flower.meaning,
      bloomed: flower.bloomed,
      unlocked_at: flower.unlockedAt || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase sync flower error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync flower network error:', err);
    return false;
  }
}

/**
 * Sync game level stars and high score progression to Supabase
 */
export async function syncGameProgressToSupabase(
  gameId: string,
  level: number,
  stars: number,
  highScore: number
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('game_progress').upsert({
      id: `${gameId}_${level}`,
      game_id: gameId,
      level,
      stars,
      unlocked: true,
      high_score: highScore,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase progress sync error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase progress sync network error:', err);
    return false;
  }
}
