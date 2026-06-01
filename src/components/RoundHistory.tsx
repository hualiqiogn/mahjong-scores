import { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useGameStore } from '@/store/gameStore';

const PAGE_SIZE = 5;

interface RoundHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoundHistoryModal({ isOpen, onClose }: RoundHistoryModalProps) {
  const rounds = useGameStore(s => s.rounds);
  const players = useGameStore(s => s.players);
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rounds.length / PAGE_SIZE));

  const pagedRounds = useMemo(() => {
    const reversed = [...rounds].reverse();
    const start = (currentPage - 1) * PAGE_SIZE;
    return reversed.slice(start, start + PAGE_SIZE);
  }, [rounds, currentPage]);

  const getRoundNum = (idx: number) => {
    return rounds.length - ((currentPage - 1) * PAGE_SIZE + idx);
  };

  const toggleExpand = (roundId: string) => {
    setExpandedRound(prev => (prev === roundId ? null : roundId));
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const getPlayerName = (id: string) => {
    return players.find(p => p.id === id)?.name || id;
  };

  if (!isOpen) return null;

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
        overflow: 'hidden',
      }}>
        <View style={{
          background: 'linear-gradient(135deg, #4F8EF7, #2563EB)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>对局记录</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', marginLeft: '10px' }}>
              <Text style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>{rounds.length}局</Text>
            </View>
          </View>
          <View style={{
            width: '32px',
            height: '32px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }} onClick={onClose}>
            <Text style={{ color: '#fff', fontSize: '16px' }}>✕</Text>
          </View>
        </View>

        <ScrollView scrollY style={{ flex: 1, padding: '16px', minHeight: 0 }}>
          {rounds.length === 0 ? (
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingVertical: '40px' }}>
              <Text style={{ fontSize: '48px', marginBottom: '12px' }}>🐟</Text>
              <Text style={{ fontSize: '16px', color: '#666', fontWeight: '500', marginBottom: '6px' }}>暂无记录</Text>
              <Text style={{ fontSize: '13px', color: '#999' }}>点击下方按钮开始记录</Text>
            </View>
          ) : (
            pagedRounds.map((round, idx) => {
              const roundNum = getRoundNum(idx);
              const isExpanded = expandedRound === round.id;
              return (
                <View key={round.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden' }}>
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '12px 4px 12px 12px' }} onClick={() => toggleExpand(round.id)}>
                    <View style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4F8EF7, #2563EB)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '8px',
                      flexShrink: 0,
                    }}>
                      <Text style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>{roundNum}</Text>
                    </View>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#333', flex: 1 }}>第{roundNum}局</Text>
                    <Text style={{ fontSize: '12px', color: '#999', marginRight: '6px', flexShrink: 0 }}>{formatTime(round.timestamp)}</Text>
                    <Text style={{ fontSize: '11px', color: '#999', flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</Text>
                  </View>

                  {isExpanded && (
                    <View style={{ padding: '0 12px 12px 12px' }}>
                      {players.map((p, pIdx) => {
                        const change = round.scoreChanges[p.id] || 0;
                        return (
                          <View key={p.id} style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            backgroundColor: change >= 0 ? '#F0FDF4' : '#FEF2F2',
                            marginBottom: pIdx < players.length - 1 ? '6px' : 0,
                          }}>
                            <Text style={{ fontSize: '13px', color: '#333', fontWeight: '500', flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>{getPlayerName(p.id)}</Text>
                            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: change >= 0 ? '#16A34A' : '#DC2626', flexShrink: 0 }}>
                              {change >= 0 ? '+' : ''}{change}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {totalPages > 1 && (
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: '#F0F0F0',
            flexShrink: 0,
          }}>
            <View
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                paddingHorizontal: '16px',
                paddingVertical: '8px',
                borderRadius: '8px',
                backgroundColor: currentPage <= 1 ? '#F0F0F0' : '#EFF6FF',
                marginRight: '12px',
              }}
            >
              <Text style={{ fontSize: '13px', color: currentPage <= 1 ? '#CCC' : '#2563EB', fontWeight: '600' }}>上一页</Text>
            </View>
            <Text style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{currentPage} / {totalPages}</Text>
            <View
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{
                paddingHorizontal: '16px',
                paddingVertical: '8px',
                borderRadius: '8px',
                backgroundColor: currentPage >= totalPages ? '#F0F0F0' : '#EFF6FF',
                marginLeft: '12px',
              }}
            >
              <Text style={{ fontSize: '13px', color: currentPage >= totalPages ? '#CCC' : '#2563EB', fontWeight: '600' }}>下一页</Text>
            </View>
          </View>
        )}

        <View style={{ display: 'flex', flexDirection: 'row', padding: '16px', borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: '#F0F0F0', flexShrink: 0 }}>
          <View style={{ flex: 1, height: '44px', borderRadius: '12px', backgroundColor: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <Text style={{ fontSize: '15px', color: '#666', fontWeight: '500' }}>关闭</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
