import { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useGameStore } from '@/store/gameStore';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScoreModal({ isOpen, onClose }: ScoreModalProps) {
  const gameMode = useGameStore(s => s.gameMode);
  const players = useGameStore(s => s.players);
  const myPlayerId = useGameStore(s => s.myPlayerId);
  const baseScore = useGameStore(s => s.baseScore);
  const recordRound = useGameStore(s => s.recordRound);

  const [roundData, setRoundData] = useState({
    winners: [] as string[],
    fan: 1,
    scores: {} as Record<string, number>,
  });

  const resetForm = () => {
    setRoundData({
      winners: [],
      fan: 1,
      scores: {},
    });
  };

  const toggleWinner = (playerId: string) => {
    setRoundData(prev => ({
      ...prev,
      winners: prev.winners.includes(playerId)
        ? prev.winners.filter(id => id !== playerId)
        : [...prev.winners, playerId],
    }));
  };

  const adjustFan = (delta: number) => {
    setRoundData(prev => ({
      ...prev,
      fan: Math.max(1, prev.fan + delta),
    }));
  };

  const updateScore = (playerId: string, value: string) => {
    const num = parseInt(value) || 0;
    setRoundData(prev => ({
      ...prev,
      scores: { ...prev.scores, [playerId]: Math.max(0, num) },
    }));
  };

  const incrementScore = (playerId: string, delta: number) => {
    setRoundData(prev => ({
      ...prev,
      scores: { ...prev.scores, [playerId]: Math.max(0, (prev.scores[playerId] || 0) + delta) },
    }));
  };

  const getMultiplierPreview = () => {
    const winAmount = (baseScore || 10) * roundData.fan;
    const result: Record<string, number> = {};
    players.forEach(p => {
      if (roundData.winners.includes(p.id)) {
        result[p.id] = winAmount * (players.length - roundData.winners.length);
      } else {
        result[p.id] = -winAmount * roundData.winners.length;
      }
    });
    return result;
  };

  const canConfirm = () => {
    if (gameMode === 'multiplier') {
      return roundData.winners.length > 0;
    }
    const hasAnyScore = Object.values(roundData.scores).some(v => v > 0);
    return hasAnyScore;
  };

  const handleConfirm = () => {
    if (!canConfirm()) return;

    if (gameMode === 'multiplier') {
      const scoreChanges: Record<string, number> = {};
      const winAmount = (baseScore || 10) * roundData.fan;
      players.forEach(p => {
        if (roundData.winners.includes(p.id)) {
          scoreChanges[p.id] = winAmount * (players.length - roundData.winners.length);
        } else {
          scoreChanges[p.id] = -winAmount * roundData.winners.length;
        }
      });
      recordRound(scoreChanges, myPlayerId || undefined);
    } else {
      recordRound(roundData.scores, myPlayerId || undefined);
    }
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const preview = gameMode === 'multiplier' ? getMultiplierPreview() : null;

  return (
    <View style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <View style={{
        backgroundColor: '#fff',
        borderRadius: '24px',
        width: '90%',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <View style={{
          background: 'linear-gradient(135deg, #4F8EF7, #2563EB)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
        }}>
          <View>
            <Text style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>记录本局</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>
              {gameMode === 'multiplier' ? '番数倍率制' : '累计总分制'}
            </Text>
          </View>
          <View style={{
            width: '32px',
            height: '32px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }} onClick={() => { resetForm(); onClose(); }}>
            <Text style={{ color: '#fff', fontSize: '16px' }}>✕</Text>
          </View>
        </View>

        <ScrollView scrollY style={{ padding: '20px', flex: 1 }}>
          {gameMode === 'multiplier' ? (
            <>
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>选择赢家</Text>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {players.map(p => {
                  const isMe = p.id === myPlayerId;
                  const isSelected = roundData.winners.includes(p.id);
                  return (
                    <View
                      key={p.id}
                      style={{
                        width: '48%',
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: isSelected && !isMe ? '#EFF6FF' : isMe ? '#E5E7EB' : '#F5F7FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: isSelected && !isMe ? '#2563EB' : 'transparent',
                        opacity: isMe ? 0.5 : 1,
                      }}
                      onClick={() => { if (!isMe) toggleWinner(p.id); }}
                    >
                      <Text style={{ fontSize: '15px', color: isMe ? '#999' : '#333', fontWeight: '500' }}>
                        {p.name}
                      </Text>
                      {isSelected && !isMe && (
                        <Text style={{ position: 'absolute', top: '4px', right: '8px', color: '#2563EB', fontSize: '16px', fontWeight: 'bold' }}>✓</Text>
                      )}
                    </View>
                  );
                })}
              </View>

              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>番数</Text>
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                <View style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => adjustFan(-1)}>
                  <Text style={{ fontSize: '20px', color: '#333', fontWeight: 'bold' }}>-</Text>
                </View>
                <Text style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563EB', minWidth: '60px', textAlign: 'center' }}>{roundData.fan}</Text>
                <View style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => adjustFan(1)}>
                  <Text style={{ fontSize: '20px', color: '#333', fontWeight: 'bold' }}>+</Text>
                </View>
              </View>

              {preview && (
                <View style={{ background: 'linear-gradient(135deg, #4F8EF7, #2563EB)', borderRadius: '16px', padding: '16px' }}>
                  <Text style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>分数预览</Text>
                  {players.map(p => (
                    <View key={p.id} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', paddingBottom: '6px' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>{p.name}</Text>
                      <Text style={{ fontSize: '16px', fontWeight: 'bold', color: preview[p.id] >= 0 ? '#4ADE80' : '#FCA5A5' }}>
                        {preview[p.id] >= 0 ? '+' : ''}{preview[p.id]}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              {players.map(p => {
                const isMe = p.id === myPlayerId;
                return (
                  <View key={p.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: '10px', paddingBottom: '10px', borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: '#F0F0F0' }}>
                    <Text style={{ fontSize: '14px', color: '#333', fontWeight: '500', marginRight: '6px', flexShrink: 0 }}>{p.name}</Text>
                    {isMe ? (
                      <Text style={{ fontSize: '11px', color: '#999' }}>(不能给自己加分)</Text>
                    ) : (
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <Input
                          style={{ width: '52px', height: '28px', backgroundColor: '#fff', borderWidth: '1px', borderStyle: 'solid', borderColor: '#2563EB', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#333' }}
                          type='number'
                          value={String(roundData.scores[p.id] || 0)}
                          onInput={e => updateScore(p.id, e.detail.value)}
                        />
                        <View style={{ width: '30px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #4F8EF7, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onClick={() => incrementScore(p.id, 1)}>
                          <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '600' }}>+1</Text>
                        </View>
                        <View style={{ width: '34px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #4F8EF7, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onClick={() => incrementScore(p.id, 10)}>
                          <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '600' }}>+10</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        <View style={{ display: 'flex', flexDirection: 'row', gap: '12px', padding: '20px', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: '#F0F0F0' }}>
          <View style={{ flex: 1, height: '44px', borderRadius: '12px', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { resetForm(); onClose(); }}>
            <Text style={{ fontSize: '15px', color: '#666', fontWeight: '500' }}>取消</Text>
          </View>
          <View style={{
            flex: 1,
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F8EF7, #2563EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canConfirm() ? 1 : 0.4,
          }} onClick={handleConfirm}>
            <Text style={{ fontSize: '15px', color: '#fff', fontWeight: '600' }}>确认记录</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
