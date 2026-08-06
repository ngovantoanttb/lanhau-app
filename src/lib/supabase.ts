import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ModeType } from '../types';

const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const LOCAL_URL = localStorage.getItem('lanhau_sp_url') || '';
const LOCAL_KEY = localStorage.getItem('lanhau_sp_key') || '';

// Ưu tiên đọc biến môi trường từ .env
export const activeSupabaseUrl = ENV_SUPABASE_URL && ENV_SUPABASE_URL !== 'https://your-supabase-project.supabase.co' 
  ? ENV_SUPABASE_URL 
  : LOCAL_URL;

export const activeSupabaseKey = ENV_SUPABASE_ANON_KEY && ENV_SUPABASE_ANON_KEY !== 'your-supabase-anon-key'
  ? ENV_SUPABASE_ANON_KEY 
  : LOCAL_KEY;

export const supabase: SupabaseClient | null = 
  activeSupabaseUrl && activeSupabaseKey
    ? createClient(activeSupabaseUrl, activeSupabaseKey)
    : null;

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('lanhau_sp_url', url);
  localStorage.setItem('lanhau_sp_key', key);
  window.location.reload();
}

/**
 * Lấy danh sách câu hỏi trực tiếp từ Supabase Database.
 * Không dùng mock dữ liệu.
 */
export async function fetchQuestionsByMode(mode: ModeType): Promise<{ prompts: string[]; error?: string }> {
  if (!supabase) {
    return {
      prompts: [],
      error: 'Chưa cấu hình Supabase URL và Anon Key trong file .env hoặc Cấu hình Admin API.'
    };
  }

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('prompt')
      .eq('category_slug', mode)
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase Query Error:', error);
      return {
        prompts: [],
        error: `Lỗi truy vấn Supabase (${error.code}): ${error.message}. Bạn đã chạy script file 'supabase_schema.sql' trong Supabase SQL Editor chưa?`
      };
    }

    if (!data || data.length === 0) {
      return {
        prompts: [],
        error: `Danh mục '${mode === 'couple' ? 'Bạn tình / Người yêu' : 'Bạn nhậu / Bạn bè'}' chưa có câu hỏi nào trong cơ sở dữ liệu Supabase.`
      };
    }

    return { prompts: data.map((item: { prompt: string }) => item.prompt) };
  } catch (err: any) {
    console.error('Fetch questions exception:', err);
    return {
      prompts: [],
      error: 'Lỗi kết nối cơ sở dữ liệu Supabase: ' + (err.message || String(err))
    };
  }
}
