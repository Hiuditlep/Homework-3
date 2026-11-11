import React, { useState, useEffect, useId, useMemo } from 'react';
import type { RelationshipPhase, EffortSignal } from './hen-ho-khong-yeu-spec';

export function SituationshipAnalyzer() {
  const [phase, setPhase] = useState<RelationshipPhase>('FRIENDS');
  const [efforts, setEfforts] = useState<EffortSignal[]>([]);
  const [ghostingAlert, setGhostingAlert] = useState<string>('');
  const [isWaitingForRep, setIsWaitingForRep] = useState(false);

  const inputId = useId();

  // 1. Asymmetric Effort Reducer (Derived State)
  const { emScore, aidoScore } = useMemo(() => {
    let em = 0;
    let aido = 0;
    efforts.forEach(e => {
      if (e.actor === 'EM') em += e.steps * e.multiplier;
      if (e.actor === 'AI_DO') aido += e.steps * e.multiplier;
    });
    return { emScore: em, aidoScore: aido };
  }, [efforts]);

  // Cảnh báo Red-Flag dựa trên độ lệch nỗ lực
  const isRedFlag = phase === 'DATING_NO_LOVE' && emScore > aidoScore * 5;

  // 2. 'Seen Không Rep' Ghosting Timer & AbortController
  useEffect(() => {
    if (!isWaitingForRep || phase === 'GHOSTED_EXIT') return;

    const abortController = new AbortController();
    
    const timer = setTimeout(() => {
      if (!abortController.signal.aborted) {
        setGhostingAlert('🚩 Red-Flag: Đã seen 5s không rep! Khuyên bạn nên tự trọng (Self-Respect Exit) và quay xe.');
        setPhase('GHOSTED_EXIT');
        setIsWaitingForRep(false);
      }
    }, 5000);

    return () => {
      abortController.abort(); // Dọn dẹp memory (Garbage Collection) khi Component unmount hoặc đổi state
      clearTimeout(timer);
    };
  }, [isWaitingForRep, phase]);

  const handleAddEffort = (actor: 'EM' | 'AI_DO') => {
    const newEffort: EffortSignal = {
      id: Date.now().toString(),
      actor,
      // Em cố 100 lần (trọng số 0.1), Ai đó 1 phần (trọng số 50.0)
      steps: actor === 'EM' ? 100 : 1,
      multiplier: actor === 'EM' ? 0.1 : 50.0 
    };
    setEfforts(prev => [...prev, newEffort]);
    
    if (phase === 'FRIENDS') setPhase('DATING_NO_LOVE');
    if (actor === 'AI_DO' && isWaitingForRep) {
      setIsWaitingForRep(false);
      setGhostingAlert('May quá, người ta rep rồi!');
    }
  };

  const handleSendMessage = () => {
    if (phase === 'GHOSTED_EXIT') return;
    setIsWaitingForRep(true);
    setGhostingAlert('Đã gửi tin nhắn... Đang đếm ngược 5s chờ rep!');
  };

  return (
    <div style={{ maxWidth: '375px', margin: '0 auto', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '16px', background: '#fff', color: '#111827', fontFamily: 'sans-serif', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '20px', textAlign: 'center', color: '#be123c', marginBottom: '24px' }}>💔 Hẹn Hò Nhưng Không Yêu</h2>
      
      <div style={{ marginBottom: '24px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
        <span style={{ color: '#4b5563', fontSize: '14px' }}>Trạng thái MQH: </span><br/>
        <strong style={{ color: phase === 'GHOSTED_EXIT' ? '#be123c' : '#1d4ed8', fontSize: '18px' }}>{phase}</strong>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => handleAddEffort('EM')} disabled={phase === 'GHOSTED_EXIT'} style={{ flex: 1, padding: '12px', background: '#fb7185', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Em cố 100 lần
        </button>
        <button onClick={() => handleAddEffort('AI_DO')} disabled={phase === 'GHOSTED_EXIT'} style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Ai đó 1 phần
        </button>
      </div>

      <div style={{ marginBottom: '24px', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 8px 0' }}>Tổng nỗ lực của Em: <strong style={{ color: '#fb7185' }}>{emScore.toFixed(1)}</strong></p>
        <p style={{ margin: 0 }}>Tổng nỗ lực Ai Đó: <strong style={{ color: '#3b82f6' }}>{aidoScore.toFixed(1)}</strong></p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label htmlFor={inputId} style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Thử nhắn tin xem sao:</label>
        <button 
          id={inputId}
          onClick={handleSendMessage} 
          disabled={isWaitingForRep || phase === 'GHOSTED_EXIT'}
          style={{ width: '100%', padding: '12px', background: isWaitingForRep ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isWaitingForRep ? 'Đang chờ Seen (5s)...' : 'Gửi tin nhắn "Anh đang làm gì đó?" 💬'}
        </button>
      </div>

      {/* 3. Accessible Red-Flag Alert & Visual Status */}
      <div style={{ padding: '12px', borderRadius: '8px', background: isRedFlag || ghostingAlert.includes('Red-Flag') ? '#ffe4e6' : '#f0fdf4', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
        <output role="status" aria-live="polite" style={{ color: isRedFlag || ghostingAlert.includes('Red-Flag') ? '#e11d48' : '#15803d', fontWeight: '600', fontSize: '14px', lineHeight: '1.5' }}>
          {ghostingAlert}
          {!ghostingAlert && isRedFlag && '🚩 Red-Flag: Nỗ lực quá lệch pha! Tỉnh táo lại đi bạn ơi, mây tầng nào gặp mây tầng đó!'}
          {!ghostingAlert && !isRedFlag && phase !== 'GHOSTED_EXIT' && 'Mọi thứ đang bình thường...'}
        </output>
      </div>
    </div>
  );
}