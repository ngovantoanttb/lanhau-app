import React from 'react';

interface EndScreenProps {
  onRestart: () => void;
  onHome: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ onRestart, onHome }) => {
  return (
    <div className="screen active">
      <svg className="end-icon" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" fill="#f2b705" />
      </svg>
      <h1 className="brand-title" style={{ fontSize: '34px' }}>HẾT BÀI RỒI!</h1>
      <p className="brand-sub">
        Cả bàn đã đi qua hết thử thách hãy cùng nhau cạn 1 ly. Xáo lại bộ bài để chơi tiếp round mới nhé.
      </p>
      <button className="btn btn-start" onClick={onRestart}>Xáo bài, chơi lại</button>
      <button className="btn btn-ghost" onClick={onHome}>Thoát về màn hình chính</button>
    </div>
  );
};
