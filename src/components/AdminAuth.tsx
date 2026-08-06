import React, { useState } from 'react';
import { supabase, activeSupabaseUrl, activeSupabaseKey, saveSupabaseConfig } from '../lib/supabase';

interface AdminAuthProps {
  onSuccess: () => void;
  onBackHome: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onSuccess, onBackHome }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'warning' } | null>(null);

  const [showConfig, setShowConfig] = useState(false);
  const [cfgUrl, setCfgUrl] = useState(activeSupabaseUrl || '');
  const [cfgKey, setCfgKey] = useState(activeSupabaseKey || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ text: 'Vui lòng nhập đầy đủ Email và Mật khẩu!', type: 'error' });
      return;
    }

    if (!supabase) {
      setMessage({ text: 'Chưa kết nối Supabase API! Vui lòng cấu hình URL & Key bên dưới.', type: 'error' });
      setShowConfig(true);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // KIỂM TRA PHÊ DUYỆT CỦA ADMIN
        const { data: profile } = await supabase
          .from('admin_profiles')
          .select('is_approved')
          .eq('id', data.user.id)
          .single();

        if (!profile || !profile.is_approved) {
          await supabase.auth.signOut();
          setMessage({
            text: '❌ Tài khoản của bạn chưa được Admin phê duyệt! Vui lòng liên hệ Admin để cấp quyền đăng nhập.',
            type: 'error'
          });
          return;
        }

        setMessage({ text: 'Đăng nhập thành công!', type: 'success' });
        setTimeout(() => onSuccess(), 500);
      } else {
        // ĐĂNG KÝ TÀI KHOẢN MỚI
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          const { count } = await supabase.from('admin_profiles').select('*', { count: 'exact', head: true });
          const autoApprove = count === 0;

          await supabase.from('admin_profiles').insert([
            { id: data.user.id, email: email, is_approved: autoApprove }
          ]);

          if (autoApprove) {
            setMessage({
              text: '🎉 Bạn là Admin đầu tiên nên được duyệt tự động! Chuyển sang Đăng nhập ngay.',
              type: 'success'
            });
          } else {
            setMessage({
              text: '⌛ Đăng ký thành công! Tài khoản của bạn đang chờ Admin phê duyệt mới được đăng nhập.',
              type: 'warning'
            });
          }
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Thao tác thất bại!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = () => {
    if (cfgUrl && cfgKey) {
      saveSupabaseConfig(cfgUrl, cfgKey);
    } else {
      alert('Vui lòng nhập cả URL và Anon Key.');
    }
  };

  return (
    <div className="screen active">
      <div className="admin-card">
        <div className="brand-eyebrow">Cổng Quản Trị</div>
        <h2 style={{ fontFamily: "'Baloo 2'", color: 'var(--amber)', margin: '5px 0 15px 0' }}>
          ĐĂNG NHẬP / ĐĂNG KÝ
        </h2>

        <div className="admin-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setMessage(null); }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setMessage(null); }}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Admin</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              required
            />
          </div>

          {message && (
            <div style={{
              fontSize: '13px',
              color: message.type === 'error' ? '#ff7b7b' : message.type === 'warning' ? '#ffd23f' : '#7bff95',
              marginBottom: '10px',
              minHeight: '18px',
              lineHeight: '1.4'
            }}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-start"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
          >
            {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản (Chờ Duyệt)')}
          </button>
        </form>

        <div style={{ marginTop: '15px', borderTop: '1px dashed rgba(246,236,216,0.2)', paddingTop: '12px' }}>
          

          {showConfig && (
            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              <div className="form-group">
                <label style={{ fontSize: '11px' }}>Supabase URL</label>
                <input
                  type="text"
                  value={cfgUrl}
                  onChange={(e) => setCfgUrl(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="https://xyz.supabase.co"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '11px' }}>Supabase Anon Key</label>
                <input
                  type="text"
                  value={cfgKey}
                  onChange={(e) => setCfgKey(e.target.value)}
                  className="form-control"
                  style={{ fontSize: '12px' }}
                  placeholder="eyJhbGciOi..."
                />
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleSaveConfig}
                style={{ background: 'var(--amber)', color: '#000', fontWeight: 'bold' }}
              >
                Lưu Cấu Hình
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: '15px' }}
          onClick={onBackHome}
        >
          ← Quay lại Trang Chủ
        </button>
      </div>
    </div>
  );
};
