import React, { useState, useEffect } from 'react';
import type { CardPrompt, ModeType, Suit } from '../types';
import { fetchQuestionsByMode } from '../lib/supabase';

interface GameScreenProps {
  mode: ModeType;
  onExit: () => void;
  onEndGame: () => void;
}

const SUITS: Suit[] = [
  { name: 'CƠ', symbol: '♥' },
  { name: 'RÔ', symbol: '♦' },
  { name: 'CHUỒN', symbol: '♣' },
  { name: 'BÍCH', symbol: '♠' }
];

export const GameScreen: React.FC<GameScreenProps> = ({ mode, onExit, onEndGame }) => {
  const [deck, setDeck] = useState<CardPrompt[]>([]);
  const [drawnCount, setDrawnCount] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<CardPrompt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initDeck = async () => {
    setLoading(true);
    const { prompts } = await fetchQuestionsByMode(mode);

    const generatedDeck: CardPrompt[] = (prompts || []).map((promptText, idx) => ({
      suit: SUITS[idx % 4],
      prompt: promptText,
      id: idx
    }));

    const shuffled = [...generatedDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setDeck(shuffled);
    setDrawnCount(0);
    setIsFlipped(false);
    setCurrentCard(null);
    setLoading(false);
  };

  useEffect(() => {
    initDeck();
  }, [mode]);

  const drawCard = (targetDeck: CardPrompt[] = deck, currentDrawn: number = drawnCount) => {
    if (currentDrawn >= targetDeck.length) {
      onEndGame();
      return;
    }
    const card = targetDeck[currentDrawn];
    setCurrentCard(card);
    setDrawnCount(currentDrawn + 1);
  };

  const handleCardClick = () => {
    if (!isFlipped) {
      if (currentCard === null) {
        drawCard();
      }
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  };

  const handleNextCard = () => {
    if (drawnCount >= deck.length && isFlipped) {
      onEndGame();
      return;
    }

    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        drawCard();
        setIsFlipped(true);
      }, 280);
    } else {
      drawCard();
      setIsFlipped(true);
    }
  };

  const handleShuffle = async () => {
    setIsFlipped(false);
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 500);
    await initDeck();
  };

  const remaining = Math.max(0, deck.length - drawnCount);

  return (
    <div className="screen active">
      <div className="hud">
        <button className="hud-btn" onClick={onExit}>✕ Thoát</button>
        <div className={`mode-tag ${mode === 'couple' ? 'couple' : ''}`}>
          {mode === 'couple' ? '💕 Bạn tình' : '🍻 Bạn nhậu'}
        </div>
        <div className="deck-count">
          {loading ? 'Đang tải...' : `${remaining} lá`}
        </div>
      </div>

      <div className="table">
        <div className="stage">
          <div
            className={`card ${isFlipped ? 'flipped' : ''} ${isShuffling ? 'shuffling' : ''}`}
            onClick={handleCardClick}
          >
            <div className="face face-back">
              <div className="face-back-inner">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="#f2b705" />
                </svg>
              </div>
            </div>
            <div className="face face-front">
              <div className="suit-tag">
                {currentCard ? `${currentCard.suit.symbol} ${currentCard.suit.name}` : '♥ CƠ'}
              </div>
              <div className="prompt">
                {currentCard ? currentCard.prompt : 'Chạm vào lá bài để bắt đầu'}
              </div>
            </div>
          </div>
        </div>

        <div className="hint">
          {!isFlipped
            ? 'Chạm vào lá bài để lật'
            : 'Chạm để úp lại, hoặc bấm mũi tên để rút lá tiếp'}
        </div>

        <div className="controls">
          <button className="icon-btn" onClick={handleShuffle} title="Xáo bài">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f6ecd8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l5 5M4 20l16-16M4 9V4h5M15 4h5v5M15 20l5-5" />
            </svg>
          </button>
          <button className="icon-btn" onClick={handleNextCard} title="Rút lá tiếp theo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f6ecd8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
