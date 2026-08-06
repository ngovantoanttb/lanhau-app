import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ModeType, Question, AdminProfile } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onExit }) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'approvals'>('questions');
  const [selectedCategory, setSelectedCategory] = useState<ModeType>('friends');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newPromptText, setNewPromptText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setActionError(null);

    if (!supabase) {
      setActionError('Chưa kết nối Supabase API!');
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
      setActionError('Lỗi tải danh sách câu: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
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
      console.warn("Lỗi tải tài khoản duyệt:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions();
    } else {
      fetchPendingAdmins();
    }
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    fetchPendingAdmins();
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
      const { error } = await supabase
        .from('questions')
        .insert([
          {
            category_id: categoryId,
            category_slug: selectedCategory,
            prompt: newPromptText.trim()
          }
        ]);

      if (error) throw error;

      setNewPromptText('');
      fetchQuestions();
    } catch (err: any) {
      alert('Lỗi thêm câu: ' + (err.message || 'Failed'));
    }
  };

  const handleEditQuestion = async (q: Question) => {
    const updatedText = prompt('Sửa nội dung câu hỏi:', q.prompt);
    if (updatedText && updatedText.trim() !== '' && updatedText.trim() !== q.prompt) {
      if (!supabase) return;
      try {
        const { error } = await supabase
          .from('questions')
          .update({ prompt: updatedText.trim() })
          .eq('id', q.id);

        if (error) throw error;
        fetchQuestions();
      } catch (err: any) {
        alert('Lỗi cập nhật: ' + err.message);
      }
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu này?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchQuestions();
    } catch (err: any) {
      alert('Lỗi xóa câu: ' + err.message);
    }
  };

  const handleApproveAdmin = async (id: string) => {
    if (!confirm('Phê duyệt tài khoản Admin này?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      fetchPendingAdmins();
    } catch (err: any) {
      alert('Lỗi phê duyệt: ' + err.message);
    }
  };

  const handleRejectAdmin = async (id: string) => {
    if (!confirm('Từ chối và xóa tài khoản chờ duyệt này?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('admin_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPendingAdmins();
    } catch (err: any) {
      alert('Lỗi xóa: ' + err.message);
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.prompt.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="screen active">
      <div className="admin-card" style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className="brand-eyebrow" style={{ margin: 0 }}>Bảng Quản Trị Admin</div>
          <button className="btn-icon-sm delete" onClick={onLogout}>Đăng xuất</button>
        </div>

        {/* Main Admin Section Tabs */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Quản lý câu hỏi
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            Duyệt tài khoản Admin{' '}
            {pendingAdmins.length > 0 && (
              <span style={{
                background: '#c1440e',
                color: '#fff',
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {pendingAdmins.length}
              </span>
            )}
          </button>
        </div>

        {actionError && (
          <div style={{ fontSize: '13px', color: '#ff7b7b', marginBottom: '10px' }}>
            {actionError}
          </div>
        )}

        {/* SECTION 1: QUESTION MANAGEMENT */}
        {activeTab === 'questions' && (
          <div>
            <div className="form-group">
              <label>Chọn Danh Mục Để Quản Lý:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ModeType)}
                className="form-control"
                style={{ background: '#0b1a13' }}
              >
                <option value="friends">1: Bạn nhậu / Bạn bè</option>
                <option value="couple">2: Bạn tình / Người yêu</option>
              </select>
            </div>

            <form
              onSubmit={handleAddQuestion}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(242,183,5,0.3)',
                padding: '14px',
                borderRadius: '14px',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, color: 'var(--amber)', marginBottom: '8px' }}>
                TẠO TỪNG CÂU MỚI (CHÓT)
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  className="form-control"
                  style={{ flex: 1 }}
                  placeholder="Nhập nội dung thử thách mới..."
                />
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{ background: 'var(--amber)', color: '#000', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  + Thêm Câu
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)' }}>
                Danh sách câu ({filteredQuestions.length})
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ padding: '6px 10px', fontSize: '12px', width: '160px' }}
                placeholder="Tìm kiếm câu..."
              />
            </div>

            <div className="q-list">
              {loading ? (
                <div style={{ fontSize: '13px', color: 'rgba(246,236,216,0.6)' }}>Đang tải dữ liệu...</div>
              ) : filteredQuestions.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'rgba(246,236,216,0.6)', padding: '10px' }}>
                  Chưa có câu hỏi nào. Bạn hãy tạo mới ở trên!
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <div key={q.id} className="q-item">
                    <div className="q-item-text">{q.prompt}</div>
                    <div className="q-item-actions">
                      <button className="btn-icon-sm" onClick={() => handleEditQuestion(q)}>✏ Sửa</button>
                      <button className="btn-icon-sm delete" onClick={() => handleDeleteQuestion(q.id)}>🗑 Xóa</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: ADMIN APPROVAL MANAGEMENT */}
        {activeTab === 'approvals' && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)', marginBottom: '10px' }}>
              Danh sách tài khoản Admin đang chờ phê duyệt:
            </div>
            <div className="q-list">
              {pendingAdmins.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'rgba(246,236,216,0.6)', padding: '10px' }}>
                  Không có tài khoản nào đang chờ phê duyệt.
                </div>
              ) : (
                pendingAdmins.map((p) => (
                  <div key={p.id} className="q-item">
                    <div className="q-item-text">
                      <b>{p.email}</b>
                      <div style={{ fontSize: '11px', color: 'rgba(246,236,216,0.5)' }}>
                        Đăng ký lúc: {new Date(p.created_at).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div className="q-item-actions">
                      <button className="btn-icon-sm approve" onClick={() => handleApproveAdmin(p.id)}>✔ Duyệt</button>
                      <button className="btn-icon-sm delete" onClick={() => handleRejectAdmin(p.id)}>❌ Từ chối</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <button className="btn btn-ghost" style={{ marginTop: '16px' }} onClick={onExit}>
          ← Thoát Admin về màn hình chơi
        </button>
      </div>
    </div>
  );
};
