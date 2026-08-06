import { useState, useEffect } from 'react';
import type { ModeType, ScreenType } from './types';
import { supabase } from './lib/supabase';
import { Splash } from './components/Splash';
import { ModeSelect } from './components/ModeSelect';
import { HowToPlay } from './components/HowToPlay';
import { GameScreen } from './components/GameScreen';
import { EndScreen } from './components/EndScreen';
import { AdminAuth } from './components/AdminAuth';
import { AdminDashboard } from './components/AdminDashboard';

export function App() {
  const [screen, setScreen] = useState<ScreenType>('splash');
  const [selectedMode, setSelectedMode] = useState<ModeType>('friends');

  useEffect(() => {
    const checkAdminQuery = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isAdminQuery = 
        urlParams.has('admin') || 
        window.location.hash.includes('admin') || 
        window.location.pathname.endsWith('/admin') ||
        window.location.pathname === '/admin';

      if (isAdminQuery) {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profile } = await supabase
              .from('admin_profiles')
              .select('is_approved')
              .eq('id', session.user.id)
              .single();

            if (profile && profile.is_approved) {
              setScreen('adminDashboard');
            } else {
              await supabase.auth.signOut();
              setScreen('adminAuth');
            }
          } else {
            setScreen('adminAuth');
          }
        } else {
          setScreen('adminAuth');
        }
      }
    };

    checkAdminQuery();
  }, []);

  const handleSelectMode = (mode: ModeType) => {
    setSelectedMode(mode);
    setScreen('game');
  };

  const handleAdminAuthSuccess = () => {
    setScreen('adminDashboard');
  };

  const handleAdminLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setScreen('splash');
  };

  return (
    <div className="app">
      {screen === 'splash' && (
        <Splash onNavigate={(s) => setScreen(s)} />
      )}

      {screen === 'mode' && (
        <ModeSelect
          onSelectMode={handleSelectMode}
          onBack={() => setScreen('splash')}
        />
      )}

      {screen === 'how' && (
        <HowToPlay onBack={() => setScreen('splash')} />
      )}

      {screen === 'game' && (
        <GameScreen
          mode={selectedMode}
          onExit={() => setScreen('splash')}
          onEndGame={() => setScreen('end')}
        />
      )}

      {screen === 'end' && (
        <EndScreen
          onRestart={() => setScreen('game')}
          onHome={() => setScreen('splash')}
        />
      )}

      {screen === 'adminAuth' && (
        <AdminAuth
          onSuccess={handleAdminAuthSuccess}
          onBackHome={() => setScreen('splash')}
        />
      )}

      {screen === 'adminDashboard' && (
        <AdminDashboard
          onLogout={handleAdminLogout}
          onExit={() => setScreen('splash')}
        />
      )}
    </div>
  );
}

export default App;
