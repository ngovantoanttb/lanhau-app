import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, Edit3, HelpCircle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning' | 'info';
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export interface EditPromptModalProps {
  isOpen: boolean;
  initialText: string;
  title?: string;
  onSave: (newText: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  onConfirm,
  onClose,
  loading = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
          btnClass: 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40',
          badgeBg: 'rgba(193, 68, 14, 0.2)',
        };
      case 'success':
        return {
          icon: <Check className="w-6 h-6 text-emerald-400" />,
          btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/40',
          badgeBg: 'rgba(16, 185, 129, 0.2)',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          btnClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-amber-900/40',
          badgeBg: 'rgba(242, 183, 5, 0.2)',
        };
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-sky-400" />,
          btnClass: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-900/40',
          badgeBg: 'rgba(14, 165, 233, 0.2)',
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="admin-modal-overlay animate-fade-in">
      <div className="admin-modal-container animate-scale-up max-w-md w-full">
        <button
          onClick={onClose}
          className="admin-modal-close"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className="p-3 rounded-xl flex-shrink-0"
            style={{ backgroundColor: style.badgeBg }}
          >
            {style.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f6ecd8] font-baloo m-0 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-[#f6ecd8]/80 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-[#f6ecd8]/80 hover:text-white hover:bg-white/10 border-0 outline-none cursor-pointer transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-sm font-semibold rounded-xl border-0 outline-none cursor-pointer transition-all shadow-lg active:scale-95 disabled:opacity-50 ${style.btnClass}`}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const EditPromptModal: React.FC<EditPromptModalProps> = ({
  isOpen,
  initialText,
  title = 'Sửa Nội Dung Câu Hỏi',
  onSave,
  onClose,
  loading = false,
}) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim());
  };

  return (
    <div className="admin-modal-overlay animate-fade-in">
      <div className="admin-modal-container animate-scale-up max-w-lg w-full">
        <button
          onClick={onClose}
          className="admin-modal-close"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#f6ecd8] font-baloo m-0">
            {title}
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#f6ecd8]/70 uppercase tracking-wider mb-2">
              Nội dung thử thách / câu hỏi:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-[#0b1a13] border border-amber-500/30 rounded-xl p-3 text-sm text-[#f6ecd8] placeholder-[#f6ecd8]/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none transition-all"
              placeholder="Nhập nội dung mới..."
              required
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-[#f6ecd8]/80 hover:text-white hover:bg-white/10 border-0 outline-none cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 border-0 outline-none cursor-pointer transition-all"
            >
              {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
