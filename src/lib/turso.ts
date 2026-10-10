import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error('TURSO_DATABASE_URL is not set');
}
if (!authToken) {
  throw new Error('TURSO_AUTH_TOKEN is not set');
}

export const turso = createClient({
  url,
  authToken,
});

// Schema para salvar progresso e pontuações em produção
export async function initializeDatabase() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS game_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      score INTEGER DEFAULT 0,
      lives INTEGER DEFAULT 3,
      collected_coins INTEGER DEFAULT 0,
      powerups_unlocked TEXT,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS high_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      level_reached INTEGER NOT NULL,
      time_played INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function saveProgress({
  playerName,
  level,
  score,
  lives,
  collectedCoins,
  powerupsUnlocked,
}: {
  playerName: string;
  level: number;
  score: number;
  lives: number;
  collectedCoins: number;
  powerupsUnlocked?: string[];
}) {
  const powerupsJson = powerupsUnlocked ? JSON.stringify(powerupsUnlocked) : null;
  
  await turso.execute(
    `INSERT INTO game_progress (player_name, level, score, lives, collected_coins, powerups_unlocked, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(player_name) DO UPDATE SET
       level = excluded.level,
       score = excluded.score,
       lives = excluded.lives,
       collected_coins = excluded.collected_coins,
       powerups_unlocked = excluded.powerups_unlocked,
       updated_at = CURRENT_TIMESTAMP`,
    [playerName, level, score, lives, collectedCoins, powerupsJson]
  );
}

export async function saveHighScore({
  playerName,
  score,
  levelReached,
  timePlayed,
}: {
  playerName: string;
  score: number;
  levelReached: number;
  timePlayed?: number;
}) {
  await turso.execute(
    `INSERT INTO high_scores (player_name, score, level_reached, time_played)
     VALUES (?, ?, ?, ?)`,
    [playerName, score, levelReached, timePlayed || 0]
  );
}

export async function getHighScores(limit = 10) {
  const result = await turso.execute(
    `SELECT * FROM high_scores ORDER BY score DESC, created_at DESC LIMIT ?`,
    [limit]
  );
  return result.rows;
}

export async function getProgress(playerName: string) {
  const result = await turso.execute(
    `SELECT * FROM game_progress WHERE player_name = ?`,
    [playerName]
  );
  return result.rows[0];
}
