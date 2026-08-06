import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Users,
  Plus,
  Search,
  LogOut,
  ArrowLeft,
  Edit3,
  Trash2,
  Check,
  X,
  Beer,
  HeartHandshake,
  Database,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Menu,
  ChevronDown,
  ChevronUp,
  Layers,
  PieChart,
  BarChart3,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ModeType, Question, AdminProfile } from '../types';
import { ConfirmModal, EditPromptModal } from './admin/AdminModal';

interface AdminDashboardProps {
  onLogout: () => void;
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onExit }) => {
  // Mặc định xem tab 'stats' (Báo cáo & Thống kê) đầu tiên khi mở Admin
  const [activeTab, setActiveTab] = useState<'stats' | 'questions' | 'approvals'>('stats');
  const [selectedCategory, setSelectedCategory] = useState<ModeType>('friends');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newPromptText, setNewPromptText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Mobile Drawer & Collapsibles
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Modals state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'success' | 'warning' | 'info';
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    variant: 'danger',
    action: async () => { },
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Category statistics counts
  const [categoryCounts, setCategoryCounts] = useState<{ friends: number; couple: number }>({
    friends: 0,
    couple: 0,
  });

  const fetchQuestions = async () => {
    setLoading(true);
    setActionError(null);

    if (!supabase) {
      setActionError('Chưa kết nối Supabase API! Vui lòng kiểm tra lại cấu hình.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_slug', selectedCategory)
        .order('id', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err: any) {
      setActionError('Lỗi tải danh sách câu hỏi: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategoryCounts = async () => {
    if (!supabase) return;
    try {
      const { count: friendsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('category_slug', 'friends');

      const { count: coupleCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('category_slug', 'couple');

      setCategoryCounts({
        friends: friendsCount || 0,
        couple: coupleCount || 0,
      });
    } catch (err) {
      console.warn('Lỗi đếm số lượng câu theo danh mục:', err);
    }
  };

  const fetchPendingAdmins = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingAdmins(data || []);
    } catch (err: any) {
      console.warn('Lỗi tải danh sách tài khoản chờ duyệt:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions();
    } else if (activeTab === 'approvals') {
      fetchPendingAdmins();
    }
    fetchAllCategoryCounts();
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    fetchPendingAdmins();
    fetchAllCategoryCounts();
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) return;

    if (!supabase) {
      alert('Vui lòng kết nối Supabase API trước!');
      return;
    }

    const categoryId = selectedCategory === 'couple' ? 2 : 1;

    try {
      const { error } = await supabase.from('questions').insert([
        {
          category_id: categoryId,
          category_slug: selectedCategory,
          prompt: newPromptText.trim(),
        },
      ]);

      if (error) throw error;

      setNewPromptText('');
      setShowAddForm(false);
      fetchQuestions();
      fetchAllCategoryCounts();
    } catch (err: any) {
      alert('Lỗi thêm câu: ' + (err.message || 'Failed'));
    }
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
  };

  const handleSaveEdit = async (newText: string) => {
    if (!editingQuestion || !supabase) return;
    setModalLoading(true);

    try {
      const { error } = await supabase
        .from('questions')
        .update({ prompt: newText })
        .eq('id', editingQuestion.id);

      if (error) throw error;

      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      alert('Lỗi cập nhật: ' + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const requestDeleteQuestion = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Câu Hỏi Này?',
      message: 'Hành động này không thể hoàn tác. Câu hỏi sẽ bị xóa khỏi cơ sở dữ liệu vĩnh viễn.',
      confirmText: 'Xóa Vĩnh Viễn',
      variant: 'danger',
      action: async () => {
        if (!supabase) return;
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) throw error;
        fetchQuestions();
        fetchAllCategoryCounts();
      },
    });
  };

  const requestApproveAdmin = (admin: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Phê Duyệt Tài Khoản Admin?',
      message: `Cấp quyền Quản trị viên cho tài khoản email ${admin.email}?`,
      confirmText: 'Phê Duyệt Ngay',
      variant: 'success',
      action: async () => {
        if (!supabase) return;
        const { error } = await supabase
          .from('admin_profiles')
          .update({ is_approved: true })
          .eq('id', admin.id);
        if (error) throw error;
        fetchPendingAdmins();
      },
    });
  };

  const requestRejectAdmin = (admin: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Từ Chối Tài Khoản Admin?',
      message: `Từ chối và xóa hồ sơ đăng ký của ${admin.email}?`,
      confirmText: 'Từ Chối & Xóa',
      variant: 'danger',
      action: async () => {
        if (!supabase) return;
        const { error } = await supabase.from('admin_profiles').delete().eq('id', admin.id);
        if (error) throw error;
        fetchPendingAdmins();
      },
    });
  };

  const handleConfirmAction = async () => {
    setModalLoading(true);
    try {
      await confirmModal.action();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      alert('Lỗi thực hiện: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setModalLoading(false);
    }
  };

  const totalQuestionsAllSuits = categoryCounts.friends + categoryCounts.couple;
  const friendsPercent = totalQuestionsAllSuits > 0 ? Math.round((categoryCounts.friends / totalQuestionsAllSuits) * 100) : 0;
  const couplePercent = totalQuestionsAllSuits > 0 ? Math.round((categoryCounts.couple / totalQuestionsAllSuits) * 100) : 0;

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => q.prompt.toLowerCase().includes(searchTerm.toLowerCase().trim()));
  }, [questions, searchTerm]);

  return (
    <div className="screen active admin-screen-full">
      <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-[#07130e] text-[#f6ecd8]">

        {/* ================= STICKY MOBILE TOP BAR ================= */}
        <header className="md:hidden sticky top-0 bg-[#050e0a] border-b border-amber-500/25 px-4 py-2.5 flex items-center justify-between z-30 flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div className="font-baloo text-base font-extrabold text-[#f6ecd8] leading-tight">
              Lá Nhậu Admin
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExit}
              className="py-1.5 px-3 rounded-lg bg-white/10 text-xs font-bold text-[#f6ecd8] flex items-center gap-1 border-0 outline-none cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Chơi Game
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 border-0 outline-none cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* ================= MOBILE SLIDE-OUT DRAWER OVERLAY ================= */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col justify-between p-5 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="font-baloo text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Menu Quản Trị
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-white/60 hover:text-white border-0 outline-none bg-transparent"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Menu Links */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('stats');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-baloo font-bold text-sm text-left border-0 cursor-pointer ${activeTab === 'stats' ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-[#f6ecd8]'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" /> Thống Kê & Báo Cáo
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('questions');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-baloo font-bold text-sm text-left border-0 cursor-pointer ${activeTab === 'questions' ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-[#f6ecd8]'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5" /> Quản Lý Câu Hỏi
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/30 font-mono">
                    {totalQuestionsAllSuits}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('approvals');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-baloo text-sm font-bold text-left border-0 cursor-pointer ${activeTab === 'approvals' ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-[#f6ecd8]'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <Users className="w-5 h-5" /> Duyệt Admin
                  </span>
                  {pendingAdmins.length > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                      {pendingAdmins.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Status Info */}
              <div className="p-4 bg-[#0b1a13] border border-amber-500/20 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#f6ecd8]/80">
                  <span>Trạng thái Supabase API:</span>
                  <span className={`font-bold ${supabase ? 'text-emerald-400' : 'text-red-400'}`}>
                    {supabase ? 'Đã kết nối' : 'Chưa kết nối'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-3">
              <button
                type="button"
                onClick={onExit}
                className="flex-1 py-3 rounded-xl bg-white/10 text-sm font-bold text-[#f6ecd8] flex items-center justify-center gap-2 border-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Game
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-3 rounded-xl bg-red-500/20 text-sm font-bold text-red-300 flex items-center justify-center gap-2 border-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* ================= LEFT SIDEBAR (DÀNH CHO DESKTOP) ================= */}
        <aside className="hidden md:flex w-72 bg-[#040b08] border-r border-amber-500/25 p-6 flex-col justify-between flex-shrink-0 h-full z-10 shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 leading-none">
                  ADMINISTRATOR
                </div>
                <h1 className="font-baloo text-xl font-extrabold text-[#f6ecd8] leading-tight m-0 mt-0.5">
                  Lá Nhậu Dashboard
                </h1>
              </div>
            </div>

            <div className="text-[11px] font-bold text-amber-400/60 uppercase tracking-wider mb-2.5 px-1">
              DANH MỤC QUẢN TRỊ
            </div>
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-baloo text-sm font-bold text-left border-0 outline-none cursor-pointer transition-all ${activeTab === 'stats'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-[#f6ecd8]/70 hover:bg-white/5 hover:text-[#f6ecd8]'
                  }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <BarChart3 className="w-4 h-4" />
                  Báo Cáo & Thống Kê
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-baloo text-sm font-bold text-left border-0 outline-none cursor-pointer transition-all ${activeTab === 'questions'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-[#f6ecd8]/70 hover:bg-white/5 hover:text-[#f6ecd8]'
                  }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <HelpCircle className="w-4 h-4" />
                  Quản Lý Câu Hỏi
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/30 font-mono font-bold">
                  {totalQuestionsAllSuits}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-baloo text-sm font-bold text-left border-0 outline-none cursor-pointer transition-all ${activeTab === 'approvals'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-[#f6ecd8]/70 hover:bg-white/5 hover:text-[#f6ecd8]'
                  }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Users className="w-4 h-4" />
                  Duyệt Admin
                </span>
                {pendingAdmins.length > 0 ? (
                  <span className="px-2.5 py-0.5 text-xs font-extrabold bg-red-600 text-white rounded-full animate-pulse ml-1">
                    {pendingAdmins.length}
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/30 font-mono font-bold">0</span>
                )}
              </button>
            </nav>

            <div className="mt-6 p-4 bg-[#081710] border border-amber-500/20 rounded-2xl space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>TỔNG SỐ LÁ BÀI</span>
                <span className="font-mono text-white">{totalQuestionsAllSuits} lá</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden flex">
                <div style={{ width: `${friendsPercent}%` }} className="bg-amber-400 h-full transition-all" title={`Bạn Nhậu: ${friendsPercent}%`} />
                <div style={{ width: `${couplePercent}%` }} className="bg-pink-500 h-full transition-all" title={`Bạn Tình: ${couplePercent}%`} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3 mt-6">
            <div className="px-3.5 py-2.5 bg-[#081710] rounded-xl border border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f6ecd8]/70 flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" /> Supabase API
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${supabase ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {supabase ? 'Đã kết nối' : 'Lỗi'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExit}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#f6ecd8] flex items-center justify-center gap-2 transition-colors border-0 outline-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Trang Chủ Game</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="py-2.5 px-3.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-xs font-bold text-red-300 flex items-center justify-center gap-2 transition-colors border-0 outline-none cursor-pointer"
                title="Đăng xuất Admin"
              >
                <LogOut className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT MAIN CONTENT CANVAS (CHỈ CUỘN TRONG DANH SÁCH - KHÔNG ĐỀU THÀNH SCROLL TOÀN MÀN) ================= */}
        <main className="flex-1 p-3.5 md:p-6 overflow-hidden flex flex-col bg-[#07130e] h-full">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col overflow-hidden space-y-3.5 md:space-y-4">

            {/* Mobile Navigation Segment Control (Chỉ hiện trên mobile) */}
            <div className="md:hidden grid grid-cols-3 p-1 bg-[#050e0a] rounded-xl border border-white/10 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-1 rounded-lg font-baloo text-xs font-bold border-0 outline-none cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'stats' ? 'bg-amber-500 text-slate-950' : 'text-[#f6ecd8]/70 bg-transparent'
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Thống Kê
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`py-2 px-1 rounded-lg font-baloo text-xs font-bold border-0 outline-none cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'questions' ? 'bg-amber-500 text-slate-950' : 'text-[#f6ecd8]/70 bg-transparent'
                  }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> Câu Hỏi
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className={`py-2 px-1 rounded-lg font-baloo text-xs font-bold border-0 outline-none cursor-pointer flex items-center justify-center gap-1 relative ${activeTab === 'approvals' ? 'bg-amber-500 text-slate-950' : 'text-[#f6ecd8]/70 bg-transparent'
                  }`}
              >
                <Users className="w-3.5 h-3.5" /> Duyệt
                {pendingAdmins.length > 0 && (
                  <span className="px-1 py-0.2 text-[9px] bg-red-600 text-white rounded-full font-mono">
                    {pendingAdmins.length}
                  </span>
                )}
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 flex-shrink-0">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* ================= TAB 1: DEDICATED STATISTICS PAGE (TRANG BÁO CÁO & THỐNG KÊ RIÊNG) ================= */}
            {activeTab === 'stats' && (
              <div className="flex-1 min-h-0 overflow-y-auto space-y-5 pr-1 animate-fade-in">
                <div>
                  <h3 className="font-baloo text-xl md:text-2xl font-extrabold text-[#f6ecd8] m-0 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-amber-400" /> Báo Cáo Thống Kê Tổng Quan Bộ Bài
                  </h3>
                  <p className="text-xs md:text-sm text-[#f6ecd8]/60 m-0 mt-1">
                    Tổng hợp số lượng thử thách, tỷ lệ lá bài và trạng thái kết nối dữ liệu trong hệ thống Lá Nhậu.
                  </p>
                </div>

                {/* 4 Cards Grid Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-[#0b1a13] border border-amber-500/30 rounded-2xl flex items-center gap-4 shadow-xl">
                    <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      <Beer className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs text-[#f6ecd8]/60 font-semibold uppercase">Bộ Bạn Nhậu</div>
                      <div className="font-baloo text-2xl font-extrabold text-amber-400">{categoryCounts.friends} câu</div>
                      <div className="text-[11px] text-amber-400/70 mt-0.5">Chiếm {friendsPercent}% bộ bài</div>
                    </div>
                  </div>

                  <div className="p-5 bg-[#0b1a13] border border-pink-500/30 rounded-2xl flex items-center gap-4 shadow-xl">
                    <div className="p-3.5 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/20">
                      <HeartHandshake className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs text-[#f6ecd8]/60 font-semibold uppercase">Bộ Bạn Tình</div>
                      <div className="font-baloo text-2xl font-extrabold text-pink-400">{categoryCounts.couple} câu</div>
                      <div className="text-[11px] text-pink-400/70 mt-0.5">Chiếm {couplePercent}% bộ bài</div>
                    </div>
                  </div>

                  <div className="p-5 bg-[#0b1a13] border border-emerald-500/30 rounded-2xl flex items-center gap-4 shadow-xl">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <Layers className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs text-[#f6ecd8]/60 font-semibold uppercase">Tổng Lá Bài</div>
                      <div className="font-baloo text-2xl font-extrabold text-emerald-400">{totalQuestionsAllSuits} lá</div>
                      <div className="text-[11px] text-emerald-400/70 mt-0.5">Toàn hệ thống</div>
                    </div>
                  </div>

                  <div className="p-5 bg-[#0b1a13] border border-sky-500/30 rounded-2xl flex items-center gap-4 shadow-xl">
                    <div className="p-3.5 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/20">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs text-[#f6ecd8]/60 font-semibold uppercase">Chờ Duyệt Admin</div>
                      <div className="font-baloo text-2xl font-extrabold text-sky-400">{pendingAdmins.length} tài khoản</div>
                      <div className="text-[11px] text-sky-400/70 mt-0.5">Cần phê duyệt</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Detailed Breakdown Card */}
                <div className="p-6 bg-[#0b1a13] border border-white/10 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="font-baloo text-lg font-bold text-amber-400 m-0 flex items-center gap-2">
                      <PieChart className="w-5 h-5" /> Tỷ Lệ Phân Bổ Lá Bài Giữa Các Danh Mục
                    </h4>
                    <span className="font-mono text-xs text-[#f6ecd8]/60">Tổng {totalQuestionsAllSuits} câu</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden flex p-0.5 border border-white/10">
                    <div style={{ width: `${friendsPercent}%` }} className="bg-amber-400 h-full rounded-l-full transition-all" />
                    <div style={{ width: `${couplePercent}%` }} className="bg-pink-500 h-full rounded-r-full transition-all" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-[#050e0a] border border-amber-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                          <Beer className="w-4 h-4" /> Danh Mục Bạn Nhậu / Bạn Bè
                        </span>
                        <span className="font-mono font-bold text-amber-400">{friendsPercent}%</span>
                      </div>
                      <p className="text-xs text-[#f6ecd8]/70 leading-relaxed">
                        Thử thách xoay quanh cụng ly, trò chơi bàn nhậu, nói thật và phạt uống ngụm cùng cả bàn.
                      </p>
                    </div>

                    <div className="p-4 bg-[#050e0a] border border-pink-500/20 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-pink-400 text-sm flex items-center gap-2">
                          <HeartHandshake className="w-4 h-4" /> Danh Mục Bạn Tình / Người Yêu
                        </span>
                        <span className="font-mono font-bold text-pink-400">{couplePercent}%</span>
                      </div>
                      <p className="text-xs text-[#f6ecd8]/70 leading-relaxed">
                        Thử thách lãng mạn, thân mật, ôm hôn ngọt ngào dành riêng cho đôi lứa từ 18 tuổi.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ================= TAB 2: QUESTION MANAGEMENT ================= */}
            {activeTab === 'questions' && (
              <div className="flex-1 min-h-0 flex flex-col space-y-3 md:space-y-4 animate-fade-in overflow-hidden">

                {/* Category Switcher & Quick Search Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b1a13] p-2.5 rounded-2xl border border-white/10 flex-shrink-0">
                  <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('friends')}
                      className={`py-2.5 px-4 md:px-6 rounded-xl font-baloo text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-0 outline-none cursor-pointer transition-all ${selectedCategory === 'friends'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-white/5 text-[#f6ecd8]/70 hover:bg-white/10'
                        }`}
                    >
                      <Beer className="w-4 h-4 text-slate-950" />
                      Bộ Bạn Nhậu ({categoryCounts.friends})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('couple')}
                      className={`py-2.5 px-4 md:px-6 rounded-xl font-baloo text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-0 outline-none cursor-pointer transition-all ${selectedCategory === 'couple'
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                          : 'bg-white/5 text-[#f6ecd8]/70 hover:bg-white/10'
                        }`}
                    >
                      <HeartHandshake className="w-4 h-4 text-white" />
                      Bộ Bạn Tình ({categoryCounts.couple})
                    </button>
                  </div>

                  <div className="relative w-full sm:w-80">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '2.5rem', paddingRight: '0.85rem' }}
                      className="w-full bg-[#050e0a] border border-amber-500/30 rounded-xl py-2.5 text-xs text-[#f6ecd8] placeholder-[#f6ecd8]/30 focus:outline-none focus:border-amber-400"
                      placeholder="Tìm kiếm nội dung câu hỏi..."
                    />
                    <Search className="w-4 h-4 text-[#f6ecd8]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Quick Add Question Section */}
                <div className="bg-[#0b1a13] border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full p-3 md:p-3.5 flex items-center justify-between text-xs md:text-sm font-bold text-amber-400 uppercase tracking-wider bg-transparent border-0 outline-none cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Thêm Thử Thách Mới ({selectedCategory === 'friends' ? 'Bộ Bạn nhậu 🍻' : 'Bộ Bạn tình 🔞'})
                    </span>
                    {showAddForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
                  </button>

                  {showAddForm && (
                    <form onSubmit={handleAddQuestion} className="p-4 pt-0 space-y-3 animate-fade-in border-t border-white/10 mt-1">
                      <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
                        <input
                          type="text"
                          value={newPromptText}
                          onChange={(e) => setNewPromptText(e.target.value)}
                          className="w-full flex-1 bg-[#050e0a] border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-[#f6ecd8] placeholder-[#f6ecd8]/30 focus:outline-none focus:border-amber-400"
                          placeholder="Nhập nội dung câu thử thách mới..."
                          required
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-baloo font-bold text-sm flex items-center justify-center gap-2 border-0 outline-none cursor-pointer transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm Ngay
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* List Header Info */}
                <div className="flex items-center justify-between pt-1 flex-shrink-0">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    Danh sách câu trong bộ ({filteredQuestions.length})
                    {searchTerm && <span className="text-white/50 font-normal">khớp từ khóa "{searchTerm}"</span>}
                  </span>
                </div>

                {/* Question List Cards - Duy nhất vùng này cuộn mượt mà */}
                <div className="q-list flex-1 min-h-0 overflow-y-auto space-y-2 md:space-y-2.5 pr-1">
                  {loading ? (
                    <div className="p-12 text-center text-xs text-[#f6ecd8]/60 flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                      Đang tải danh sách câu hỏi...
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#f6ecd8]/60 bg-[#0b1a13]/50 border border-dashed border-white/10 rounded-2xl">
                      {searchTerm
                        ? `Không tìm thấy câu hỏi chứa từ khóa "${searchTerm}"`
                        : 'Chưa có câu hỏi nào. Bấm nút "+ Thêm Thử Thách Mới" ở trên để tạo!'}
                    </div>
                  ) : (
                    filteredQuestions.map((q, idx) => (
                      <div key={q.id} className="q-item bg-[#0b1a13] hover:bg-[#081710] border-white/10 hover:border-amber-500/30 p-3 md:p-4 rounded-xl transition-all">
                        <div className="flex items-start gap-2.5 md:gap-3.5 flex-1 min-w-0 pr-2">
                          <span className="text-[10px] md:text-[11px] font-mono font-bold text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-md flex-shrink-0 mt-0.5 border border-amber-500/20">
                            #{idx + 1}
                          </span>
                          <div className="q-item-text font-medium text-xs md:text-sm leading-relaxed">{q.prompt}</div>
                        </div>
                        <div className="q-item-actions flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(q)}
                            className="btn-icon-sm hover:text-amber-300 border-0 outline-none cursor-pointer px-3 py-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Sửa nội dung"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteQuestion(q.id)}
                            className="btn-icon-sm delete border-0 outline-none cursor-pointer px-3 py-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Xóa</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 3: ADMIN APPROVAL MANAGEMENT ================= */}
            {activeTab === 'approvals' && (
              <div className="flex-1 min-h-0 flex flex-col space-y-4 animate-fade-in overflow-hidden">
                <div className="text-xs font-bold text-amber-400 flex-shrink-0">
                  Danh sách tài khoản Admin chờ duyệt ({pendingAdmins.length}):
                </div>

                <div className="q-list flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
                  {pendingAdmins.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#f6ecd8]/60 bg-[#0b1a13]/50 border border-dashed border-white/10 rounded-2xl">
                      Hiện không có tài khoản nào đang chờ phê duyệt.
                    </div>
                  ) : (
                    pendingAdmins.map((p) => (
                      <div key={p.id} className="q-item bg-[#0b1a13] flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-xl border border-white/10">
                        <div className="q-item-text space-y-1">
                          <div className="font-bold text-xs md:text-sm text-[#f6ecd8] flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-400 inline-block" />
                            {p.email}
                          </div>
                          <div className="text-[10px] md:text-[11px] text-[#f6ecd8]/50 font-mono">
                            Đăng ký lúc: {new Date(p.created_at).toLocaleString('vi-VN')}
                          </div>
                        </div>

                        <div className="q-item-actions w-full sm:w-auto justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => requestApproveAdmin(p)}
                            className="btn-icon-sm approve flex-1 sm:flex-initial justify-center py-2 px-4 border-0 outline-none cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Phê Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => requestRejectAdmin(p)}
                            className="btn-icon-sm delete flex-1 sm:flex-initial justify-center py-2 px-4 border-0 outline-none cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            Từ Chối
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

      </div>

      {/* Edit Prompt Custom Modal */}
      <EditPromptModal
        isOpen={!!editingQuestion}
        initialText={editingQuestion?.prompt || ''}
        onSave={handleSaveEdit}
        onClose={() => setEditingQuestion(null)}
        loading={modalLoading}
      />

      {/* Confirm Action Custom Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        loading={modalLoading}
      />
    </div>
  );
};
