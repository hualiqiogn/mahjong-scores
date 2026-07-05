import { insertRow, getRow, updateRow } from '@/lib/supabase';
import type { GameMode } from '@/store/gameStore';

const TABLE = 'rooms';

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
  id: string;
  game_mode: GameMode;
  base_score: number;
  players: RoomPlayer[];
  rounds: RoomRound[];
  is_game_over: boolean;
  created_at: number;
  updated_at: number;
}

/** 将 RoomData 转换为数据库列格式（snake_case） */
function toDB(roomId: string, data: {
  gameMode: GameMode;
  baseScore: number;
  players: RoomPlayer[];
  rounds: RoomRound[];
  isGameOver: boolean;
}): RoomData {
  return {
    id: roomId,
    game_mode: data.gameMode,
    base_score: data.baseScore,
    players: data.players,
    rounds: data.rounds,
    is_game_over: data.isGameOver,
    created_at: Date.now(),
    updated_at: Date.now(),
  };
}

/** 创建房间 */
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

  const row = toDB(roomId, {
    gameMode,
    baseScore,
    players,
    rounds: [],
    isGameOver: false,
  });

  await insertRow(TABLE, row);
  return roomId;
}

/** 通过房间号获取房间 */
export async function fetchRoom(roomId: string): Promise<RoomData | null> {
  return getRow<RoomData>(TABLE, roomId);
}

/** 加入房间 */
export async function joinRoom(
  roomId: string,
  playerName: string,
): Promise<{ roomData: RoomData } | null> {
  const doc = await fetchRoom(roomId);
  if (!doc) return null;

  if (doc.is_game_over) return null;

  const players = [...doc.players];
  const emptyIndex = players.findIndex(
    (p) => p.name === '等待加入' || p.name.startsWith('玩家'),
  );
  if (emptyIndex === -1) return null;

  players[emptyIndex] = {
    ...players[emptyIndex],
    name: playerName,
  };

  await updateRow(TABLE, roomId, {
    players,
    updated_at: Date.now(),
  });

  return { roomData: { ...doc, players } };
}

/** 记录一局得分 */
export async function recordRoundToCloud(
  roomId: string,
  players: RoomPlayer[],
  rounds: RoomRound[],
): Promise<void> {
  await updateRow(TABLE, roomId, {
    players,
    rounds,
    updated_at: Date.now(),
  });
}

/** 结束游戏 */
export async function endRoomGame(roomId: string): Promise<void> {
  await updateRow(TABLE, roomId, {
    is_game_over: true,
    updated_at: Date.now(),
  });
}

/** 重置游戏 */
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
  await updateRow(TABLE, roomId, {
    players: resetPlayers,
    rounds: [],
    is_game_over: false,
    updated_at: Date.now(),
  });
}

/** 玩家离开房间 */
export async function leaveRoomFromCloud(
  roomId: string,
  playerId: string,
): Promise<void> {
  const doc = await fetchRoom(roomId);
  if (!doc) return;
  const players = [...doc.players];
  const playerIndex = parseInt(playerId.replace('p', '')) - 1;
  if (playerIndex >= 0 && playerIndex < players.length) {
    players[playerIndex] = {
      id: players[playerIndex].id,
      name: '等待加入',
      score: 0,
      consecutiveGives: 0,
      consecutiveGains: 0,
      lastScoreChange: 0,
    };
  }
  await updateRow(TABLE, roomId, {
    players,
    updated_at: Date.now(),
  });
}
