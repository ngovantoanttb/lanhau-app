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
              d="M12 21s-7-4.35-9.5-8.5C.9 9.2 2.7 6 6 6c2 0 3.3 1.1 4 2.2C10.7 7.1 12 6 14 6c3.3 0 5.1 3.2 3.5 6.5C19 16.65 12 21 12 21z"
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
      <div className="footnote">🍻 Chơi vui là chính — uống có chừng mực, đừng ép ai quá sức nhé.</div>
    </div>
  );
};
