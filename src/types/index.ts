export type ModeType = 'friends' | 'couple';

export type ScreenType = 
  | 'splash' 
  | 'mode' 
  | 'how' 
  | 'game' 
  | 'end' 
  | 'adminAuth' 
  | 'adminDashboard';

export interface Suit {
  name: string;
  symbol: string;
}

export interface Category {
  id: number;
  slug: ModeType;
  name: string;
  description: string;
}

export interface Question {
  id: number;
  category_id: number;
  category_slug: ModeType;
  prompt: string;
  created_at?: string;
}

export interface CardPrompt {
  suit: Suit;
  prompt: string;
  id?: number;
}

export interface AdminProfile {
  id: string;
  email: string;
  is_approved: boolean;
  is_super_admin: boolean;
  created_at: string;
}
