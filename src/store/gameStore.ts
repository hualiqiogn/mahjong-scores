import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import {
  createRoom as supabaseCreateRoom,
  joinRoom as supabaseJoinRoom,
  recordRoundToSupabase,
  endRoomGame,
  resetRoomGame,
  leaveRoomFromSupabase,
  fetchRoom,
} from '@/services/roomService';
import type { RoomData, RoomPlayer, RoomRound } from '@/services/roomService';

export type GameMode = 'cumulative' | 'multiplier';

export interface Player {
  id: string;
  name: string;
  score: number;
  consecutiveGives: number;
  consecutiveGains: number;
  lastScoreChange: number;
}

export interface Round {
  id: string;
  scoreChanges: Record<string, number>;
  giverId?: string;
  timestamp: number;
}

const LOCAL_UPDATE_GRACE = 3000;

interface GameState {
  roomId: string;
  inRoom: boolean;
  players: Player[];
  myPlayerId: string | null;
  gameMode: GameMode;
  baseScore: number;
  rounds: Round[];
  isGameOver: boolean;
  _lastLocalUpdate: number;

  createRoom: (playerName: string, mode: GameMode, baseScore: number) => Promise<void>;
  joinRoom: (roomId: string, playerName: string) => Promise<boolean>;
  recordRound: (scoreChanges: Record<string, number>, giverId?: string) => void;
  endGame: () => void;
  resetGame: () => void;
  leaveGame: () => void;
  syncFromRemote: (data: RoomData) => void;
  pollRoomData: () => Promise<void>;
}

const generateRoomId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
  { id: 'p2', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
  { id: 'p3', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
  { id: 'p4', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
];

const taroStorage = {
  getItem: (name: string) => {
    try {
      const value = Taro.getStorageSync(name);
      if (!value) return null;
      return value;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value);
    } catch {}
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name);
    } catch {}
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      roomId: '',
      inRoom: false,
      players: DEFAULT_PLAYERS,
      myPlayerId: null,
      gameMode: 'cumulative',
      baseScore: 10,
      rounds: [],
      isGameOver: false,
      _lastLocalUpdate: 0,

      createRoom: async (playerName, mode, baseScore) => {
        const roomId = generateRoomId();
        await supabaseCreateRoom(roomId, mode, baseScore, playerName);

        set({
          roomId,
          inRoom: true,
          myPlayerId: 'p1',
          gameMode: mode,
          baseScore,
          players: [
            { id: 'p1', name: playerName, score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
            { id: 'p2', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
            { id: 'p3', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
            { id: 'p4', name: '等待加入', score: 0, consecutiveGives: 0, consecutiveGains: 0, lastScoreChange: 0 },
          ],
          _lastLocalUpdate: Date.now(),
        });
      },

      joinRoom: async (roomId, playerName) => {
        const result = await supabaseJoinRoom(roomId, playerName);
        if (!result) return false;

        const { playerId, roomData } = result;

        set({
          roomId,
          inRoom: true,
          myPlayerId: playerId,
          gameMode: roomData.gameMode,
          baseScore: roomData.baseScore,
          players: roomData.players,
          rounds: roomData.rounds || [],
          isGameOver: roomData.isGameOver,
          _lastLocalUpdate: 0,
        });

        return true;
      },

      recordRound: (scoreChanges, giverId) => {
        const state = get();
        const round: Round = {
          id: Date.now().toString(),
          scoreChanges,
          giverId,
          timestamp: Date.now(),
        };

        const updatedPlayers = state.players.map((player) => {
          let change = scoreChanges[player.id] || 0;

          if (state.gameMode === 'cumulative') {
            change = Math.max(0, change);
          }

          let newConsecutiveGives = player.consecutiveGives;
          let newConsecutiveGains = player.consecutiveGains;

          if (state.gameMode === 'cumulative') {
            const isGiver = player.id === giverId;
            const didGive =
              isGiver &&
              Object.entries(scoreChanges).some(
                ([pid, val]) => pid !== player.id && val > 0,
              );
            const didGain = change > 0;

            if (didGive && !didGain) {
              newConsecutiveGives = player.consecutiveGives + 1;
              newConsecutiveGains = 0;
            } else if (didGain && !didGive) {
              newConsecutiveGains = player.consecutiveGains + 1;
              newConsecutiveGives = 0;
            } else if (didGive && didGain) {
              newConsecutiveGives = player.consecutiveGives + 1;
              newConsecutiveGains = player.consecutiveGains + 1;
            }
          } else {
            if (change > 0) {
              newConsecutiveGains = player.consecutiveGains + 1;
              newConsecutiveGives = 0;
            } else if (change < 0) {
              newConsecutiveGives = player.consecutiveGives + 1;
              newConsecutiveGains = 0;
            }
          }

          return {
            ...player,
            score: player.score + change,
            consecutiveGives: newConsecutiveGives,
            consecutiveGains: newConsecutiveGains,
            lastScoreChange: change,
          };
        });

        set({
          players: updatedPlayers,
          rounds: [...state.rounds, round],
          _lastLocalUpdate: Date.now(),
        });

        if (state.roomId) {
          const roomRound: RoomRound = {
            id: round.id,
            scoreChanges: round.scoreChanges,
            giverId,
            timestamp: round.timestamp,
          };
          recordRoundToSupabase(state.roomId, updatedPlayers as RoomPlayer[], roomRound).catch(() => {});
        }
      },

      endGame: () => {
        set({ isGameOver: true, _lastLocalUpdate: Date.now() });
      },

      resetGame: () => {
        const state = get();
        const resetPlayers = state.players.map((p) => ({
          ...p,
          score: 0,
          consecutiveGives: 0,
          consecutiveGains: 0,
          lastScoreChange: 0,
        }));

        set({
          players: resetPlayers,
          rounds: [],
          isGameOver: false,
          _lastLocalUpdate: Date.now(),
        });
      },

      leaveGame: () => {
        const state = get();
        if (state.roomId && state.myPlayerId) {
          leaveRoomFromSupabase(state.roomId, state.myPlayerId).catch(() => {});
        }
        set({
          roomId: '',
          inRoom: false,
          players: DEFAULT_PLAYERS,
          myPlayerId: null,
          rounds: [],
          isGameOver: false,
          _lastLocalUpdate: 0,
        });
      },

      syncFromRemote: (data: RoomData) => {
        const state = get();
        const now = Date.now();
        if (now - state._lastLocalUpdate < LOCAL_UPDATE_GRACE) {
          return;
        }

        const remoteRounds = data.rounds || [];
        const localRoundCount = state.rounds.length;
        if (remoteRounds.length < localRoundCount) {
          return;
        }

        set({
          players: data.players,
          rounds: remoteRounds,
          gameMode: data.gameMode,
          baseScore: data.baseScore,
        });
      },

      pollRoomData: async () => {
        const { roomId } = get();
        if (!roomId) return;
        try {
          const data = await fetchRoom(roomId);
          if (data) {
            get().syncFromRemote(data);
          }
        } catch {}
      },
    }),
    {
      name: 'mahjong-scores',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        roomId: state.roomId,
        inRoom: state.inRoom,
        myPlayerId: state.myPlayerId,
        gameMode: state.gameMode,
        baseScore: state.baseScore,
        players: state.players,
        rounds: state.rounds,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            try {
              Taro.removeStorageSync('mahjong-scores');
            } catch {}
          }
        };
      },
    },
  ),
);
