import React from 'react';
import type { ScreenType } from '../types';

interface SplashProps {
  onNavigate: (screen: ScreenType) => void;
}

export const Splash: React.FC<SplashProps> = ({ onNavigate }) => {
  return (
    <div className="screen active">
      <div className="brand-eyebrow">Trò chơi bàn nhậu</div>
      <div className="splash-cards">
        <div className="splash-card">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" fill="#f2b705" />
          </svg>
        </div>
        <div className="splash-card">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#f2b705" />
          </svg>
        </div>
        <div className="splash-card">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="#f2b705" />
          </svg>
        </div>
      </div>
      <h1 className="brand-title">LÁ<span>NHẬU</span></h1>
      <p className="brand-sub">Rút một lá, làm theo lệnh, cụng ly. Ai ngán thì… uống.</p>
      <button className="btn btn-start" onClick={() => onNavigate('mode')}>Bắt đầu chơi</button>
      <button className="btn btn-ghost" onClick={() => onNavigate('how')}>Luật chơi là gì?</button>
      <div className="footnote">
        <div>🍻 Chơi vui là chính — uống có chừng mực, đừng ép ai quá sức nhé.</div>
      </div>
    </div>
  );
};
