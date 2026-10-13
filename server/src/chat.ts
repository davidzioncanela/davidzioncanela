import { createClient, type Client } from '@libsql/client';
import type { ChatMessage } from '../../src/lib/protocol.js';

// Histórico do chat da cidade: Turso quando configurado, senão só em memória
const HISTORY = 50;
let db: Client | null = null;
const memory: ChatMessage[] = [];

export async function initChat() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    console.log('[chat] TURSO_DATABASE_URL não definido: histórico só em memória');
    return;
  }
  db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  await db.execute(`CREATE TABLE IF NOT EXISTS town_chat (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    name TEXT NOT NULL,
    character TEXT NOT NULL,
    text TEXT NOT NULL,
    at INTEGER NOT NULL
  )`);
  console.log('[chat] histórico salvo no Turso');
}

export async function saveMessage(msg: ChatMessage) {
  memory.push(msg);
  if (memory.length > HISTORY) memory.shift();
  if (!db) return;
  try {
    await db.execute({
      sql: 'INSERT INTO town_chat (id, sender, name, character, text, at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [msg.id, msg.from, msg.name, msg.character, msg.text, msg.at],
    });
  } catch (err) {
    console.error('[chat] falha ao salvar mensagem', err);
  }
}

export async function recentMessages(): Promise<ChatMessage[]> {
  if (!db) return [...memory];
  try {
    const res = await db.execute({ sql: 'SELECT id, sender, name, character, text, at FROM town_chat ORDER BY at DESC LIMIT ?', args: [HISTORY] });
    return res.rows
      .map((r) => ({ id: String(r.id), from: String(r.sender), name: String(r.name), character: String(r.character) as ChatMessage['character'], text: String(r.text), at: Number(r.at) }))
      .reverse();
  } catch (err) {
    console.error('[chat] falha ao ler histórico', err);
    return [...memory];
  }
}
