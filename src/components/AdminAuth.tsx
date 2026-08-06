import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Settings,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase, activeSupabaseUrl, activeSupabaseKey, saveSupabaseConfig } from '../lib/supabase';

interface AdminAuthProps {
  onSuccess: () => void;
  onBackHome: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onSuccess, onBackHome }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            text: 'Tài khoản của bạn chưa được Admin phê duyệt! Vui lòng liên hệ Admin để cấp quyền đăng nhập.',
            type: 'error',
          });
          return;
        }

        setMessage({ text: 'Đăng nhập thành công! Đang chuyển hướng...', type: 'success' });
        setTimeout(() => onSuccess(), 600);
      } else {
        // ĐĂNG KÝ TÀI KHOẢN MỚI
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          const { count } = await supabase.from('admin_profiles').select('*', { count: 'exact', head: true });
          const autoApprove = count === 0;

          await supabase.from('admin_profiles').insert([
            { id: data.user.id, email: email, is_approved: autoApprove },
          ]);

          if (autoApprove) {
            setMessage({
              text: 'Bạn là Admin đầu tiên nên được duyệt tự động! Chuyển sang Đăng nhập ngay.',
              type: 'success',
            });
          } else {
            setMessage({
              text: 'Đăng ký thành công! Tài khoản của bạn đang chờ Admin phê duyệt mới được đăng nhập.',
              type: 'warning',
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
    <div className="screen active p-4 flex items-center justify-center">
      <div className="admin-auth-card animate-scale-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <div className="brand-eyebrow text-xs tracking-widest text-amber-400 font-bold uppercase mb-1">
            CỔNG QUẢN TRỊ ADMIN
          </div>
          <h2 className="font-baloo text-2xl md:text-3xl font-extrabold text-[#f6ecd8] m-0">
            {mode === 'login' ? 'Đăng Nhập Hệ Thống' : 'Tạo Tài Khoản'}
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#050e0a] rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            className={`py-2.5 px-3 rounded-lg font-baloo text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-0 outline-none cursor-pointer ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-[#f6ecd8]/70 hover:text-[#f6ecd8] bg-transparent'
            }`}
            onClick={() => {
              setMode('login');
              setMessage(null);
            }}
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </button>
          <button
            type="button"
            className={`py-2.5 px-3 rounded-lg font-baloo text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border-0 outline-none cursor-pointer ${
              mode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-[#f6ecd8]/70 hover:text-[#f6ecd8] bg-transparent'
            }`}
            onClick={() => {
              setMode('register');
              setMessage(null);
            }}
          >
            <UserPlus className="w-4 h-4" />
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group mb-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#f6ecd8]/80 mb-2">
              <Mail className="w-4 h-4 text-amber-400" />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.6rem', paddingRight: '1rem' }}
                className="w-full bg-[#0b1a13] border border-amber-500/30 rounded-xl py-3 text-sm text-[#f6ecd8] placeholder-[#f6ecd8]/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                placeholder="admin@example.com"
                required
              />
              <Mail className="w-4 h-4 text-[#f6ecd8]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#f6ecd8]/80 mb-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.6rem', paddingRight: '2.75rem' }}
                className="w-full bg-[#0b1a13] border border-amber-500/30 rounded-xl py-3 text-sm text-[#f6ecd8] placeholder-[#f6ecd8]/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                placeholder="••••••••"
                required
              />
              <Lock className="w-4 h-4 text-[#f6ecd8]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#f6ecd8]/50 hover:text-amber-400 bg-transparent border-0 outline-none cursor-pointer transition-colors flex items-center justify-center"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Alert Message */}
          {message && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fade-in ${
                message.type === 'error'
                  ? 'bg-red-500/15 border-red-500/30 text-red-300'
                  : message.type === 'warning'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {message.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
              {message.type === 'warning' && <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
              {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-xl font-baloo font-bold text-base text-slate-950 bg-gradient-to-r from-[#ffd23f] via-[#f2b705] to-[#c98a02] hover:opacity-95 shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 border-0 outline-none cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5" />
                Đăng Nhập Admin
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Tạo Tài Khoản (Chờ Duyệt)
              </>
            )}
          </button>
        </form>

        {/* Supabase Configuration Panel */}
        <div className="mt-6 pt-4 border-t border-white/10">
          {showConfig && (
            <div className="mt-3 p-3.5 bg-[#0b1a13]/90 border border-amber-500/20 rounded-xl space-y-3 animate-fade-in">
              <div className="form-group mb-2">
                <label className="text-[11px] text-[#f6ecd8]/70 mb-1 block">Supabase URL</label>
                <input
                  type="text"
                  value={cfgUrl}
                  onChange={(e) => setCfgUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-[#f6ecd8] focus:outline-none focus:border-amber-400"
                  placeholder="https://xyz.supabase.co"
                />
              </div>

              <div className="form-group mb-3">
                <label className="text-[11px] text-[#f6ecd8]/70 mb-1 block">Supabase Anon Key</label>
                <input
                  type="text"
                  value={cfgKey}
                  onChange={(e) => setCfgKey(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-[#f6ecd8] focus:outline-none focus:border-amber-400"
                  placeholder="eyJhbGciOi..."
                />
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 border-0 outline-none cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu Cấu Hình
              </button>
            </div>
          )}
        </div>

        {/* Back to Game Home */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f6ecd8]/60 hover:text-[#f6ecd8] bg-transparent border-0 outline-none cursor-pointer transition-colors py-1 px-3 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại Trang Chủ Game
          </button>
        </div>
      </div>
    </div>
  );
};
