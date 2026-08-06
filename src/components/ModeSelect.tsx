import React from 'react';
import type { ModeType } from '../types';

interface ModeSelectProps {
  onSelectMode: (mode: ModeType) => void;
  onBack: () => void;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({ onSelectMode, onBack }) => {
  return (
    <div className="screen active">
      <div className="brand-eyebrow">Chọn kiểu chơi</div>
      <h1 className="brand-title" style={{ fontSize: '34px' }}>CHƠI VỚI AI?</h1>
      <p className="brand-sub">Mỗi kiểu là một bộ thử thách khác nhau.</p>
      <div className="mode-grid">
        <button className="mode-card friends" onClick={() => onSelectMode('friends')}>
          <div className="mode-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke="#f2b705" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="mode-text-title">Bạn nhậu / Bạn bè</div>
            <div className="mode-text-sub">Thử thách vui, cụng ly, trò chuyện xôm tụ cả bàn.</div>
          </div>
        </button>
        <button className="mode-card couple" onClick={() => onSelectMode('couple')}>
          <span className="mode-badge">18+</span>
          <div className="mode-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"
                fill="#ff6f91" />
            </svg>
          </div>
          <div>
            <div className="mode-text-title">Bạn tình / Người yêu</div>
            <div className="mode-text-sub">Thử thách lãng mạn, thân mật, chỉ dành cho 2 người từ 18 tuổi.</div>
          </div>
        </button>
      </div>
      <button className="btn btn-ghost" onClick={onBack}>← Quay lại</button>
    </div>
  );
};
