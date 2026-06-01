import { db } from '@/lib/supabase';
import type { GameMode } from '@/store/gameStore';

export interface RoomPlayer {
  id: string;
  name: string;
  score: number;
  consecutiveGives: number;
  consecutiveGains: number;
  lastScoreChange: number;
}

export interface RoomRound {
  id: string;
  scoreChanges: Record<string, number>;
  giverId?: string;
  timestamp: number;
}

export interface RoomData {
  roomId: string;
  gameMode: GameMode;
  baseScore: number;
  players: RoomPlayer[];
  rounds: RoomRound[];
  isGameOver: boolean;
  createdAt: number;
}

const TABLE = 'rooms';

function wrapData(id: string, data: RoomData) {
  return { id, data, updated_at: new Date().toISOString() };
}

export async function createRoom(
  roomId: string,
  gameMode: GameMode,
  baseScore: number,
  creatorName: string,
): Promise<string> {
  const players: RoomPlayer[] = [
    { id: 'p1', name: creatorName, score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
    { id: 'p2', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
    { id: 'p3', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
    { id: 'p4', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
  ];

  const roomData: RoomData = {
    roomId,
    gameMode,
    baseScore,
    players,
    rounds: [],
    isGameOver: false,
    createdAt: Date.now(),
  };

  await db.from(TABLE).insert(wrapData(roomId, roomData));
  return roomId;
}

export async function joinRoom(
  roomId: string,
  playerName: string,
): Promise<{ playerId: string; roomData: RoomData } | null> {
  const row = await db.from(TABLE).select('data').eq('id', roomId).single();
  if (!row) return null;

  const roomData: RoomData = row.data;
  if (roomData.isGameOver) return null;

  const emptyIndex = roomData.players.findIndex(
    (p) => p.name === '等待加入' || p.name.startsWith('玩家'),
  );
  if (emptyIndex === -1) return null;

  const playerId = roomData.players[emptyIndex].id;
  roomData.players[emptyIndex].name = playerName;

  await db.from(TABLE).update(wrapData(roomId, roomData)).eq('id', roomId);

  return { playerId, roomData };
}

export async function fetchRoom(roomId: string): Promise<RoomData | null> {
  const row = await db.from(TABLE).select('data').eq('id', roomId).single();
  if (!row) return null;
  return row.data as RoomData;
}

export async function recordRoundToSupabase(
  roomId: string,
  players: RoomPlayer[],
  round: RoomRound,
): Promise<void> {
  const row = await db.from(TABLE).select('data').eq('id', roomId).single();
  if (!row) return;

  const roomData: RoomData = row.data;
  roomData.players = players;
  roomData.rounds = [...(roomData.rounds || []), round];

  await db.from(TABLE).update(wrapData(roomId, roomData)).eq('id', roomId);
}

export async function endRoomGame(roomId: string): Promise<void> {
  const row = await db.from(TABLE).select('data').eq('id', roomId).single();
  if (!row) return;

  const roomData: RoomData = row.data;
  roomData.isGameOver = true;

  await db.from(TABLE).update(wrapData(roomId, roomData)).eq('id', roomId);
}

export async function resetRoomGame(
  roomId: string,
  players: RoomPlayer[],
): Promise<void> {
  const resetPlayers = players.map((p) => ({
    ...p,
    score: 0,
    consecutiveGives: 0,
    consecutiveGains: 0,
    lastScoreChange: 0,
  }));

  const row = await db.from(TABLE).select('data').eq('id', roomId).single();
  if (!row) return;

  const roomData: RoomData = row.data;
  roomData.players = resetPlayers;
  roomData.rounds = [];
  roomData.isGameOver = false;

  await db.from(TABLE).update(wrapData(roomId, roomData)).eq('id', roomId);
}

export async function leaveRoomFromSupabase(
  roomId: string,
  playerId: string,
): Promise<void> {
  const row = await db.from(TABLE).select('data').eq('id', roomId).single();
  if (!row) return;

  const roomData: RoomData = row.data;
  const playerIndex = parseInt(playerId.replace('p', '')) - 1;
  if (playerIndex >= 0 && playerIndex < roomData.players.length) {
    roomData.players[playerIndex] = {
      id: roomData.players[playerIndex].id,
      name: '等待加入',
      score: 0,
      consecutiveGives: 0,
      consecutiveGains: 0,
      lastScoreChange: 0,
    };
  }

  await db.from(TABLE).update(wrapData(roomId, roomData)).eq('id', roomId);
}
