import React from 'react';

interface HowToPlayProps {
  onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  return (
    <div className="screen active">
      <div className="brand-eyebrow">Cách chơi</div>
      <h1 className="brand-title" style={{ fontSize: '32px' }}>3 BƯỚC</h1>
      <p className="brand-sub" style={{ maxWidth: '340px', textAlign: 'left', marginTop: '18px' }}>
        <b style={{ color: 'var(--amber)' }}>1.</b> Người chơi lần lượt chạm vào lá bài để lật mở.<br /><br />
        <b style={{ color: 'var(--amber)' }}>2.</b> Đọc to thử thách trên lá bài và làm theo — có thể là uống, kể chuyện, thách đố cả bàn...<br /><br />
        <b style={{ color: 'var(--amber)' }}>3.</b> Hết bài thì bấm xáo bài để chơi lại từ đầu.
      </p>
      <button className="btn btn-start" onClick={onBack}>Đã hiểu, chơi thôi</button>
    </div>
  );
};
