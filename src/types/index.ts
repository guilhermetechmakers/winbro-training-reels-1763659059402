// User types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'trainer' | 'operator' | 'customer_admin';
  created_at: string;
  updated_at: string;
}

// Reel/Video types
export interface Reel {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  thumbnail_url?: string;
  video_url: string;
  hls_url?: string;
  machine_model?: string;
  tooling?: string;
  process_step?: string;
  tags: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  status: 'draft' | 'pending' | 'published' | 'archived';
  customer_scope?: string[];
  uploader_id: string;
  created_at: string;
  updated_at: string;
  transcript?: Transcript;
}

export interface Transcript {
  id: string;
  reel_id: string;
  text: string;
  segments: TranscriptSegment[];
  language: string;
  confidence?: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  id: string;
  start_time: number; // in seconds
  end_time: number; // in seconds
  text: string;
  words?: TranscriptWord[];
  confidence?: number;
}

export interface TranscriptWord {
  word: string;
  start_time: number;
  end_time: number;
  confidence?: number;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  target_roles: string[];
  prerequisites?: string[];
  estimated_time: number; // in minutes
  modules: CourseModule[];
  status: 'draft' | 'published' | 'archived';
  visibility: 'tenant' | 'public' | 'internal';
  enrollment_method: 'open' | 'invite' | 'assignment';
  expiration_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  reel_id: string;
  order: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  module_id: string;
  questions: QuizQuestion[];
  time_limit?: number; // in minutes
  pass_threshold: number; // percentage
  attempts_allowed?: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
  order: number;
}

export interface QuizOption {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: QuizAnswer[];
  score?: number;
  passed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface QuizAnswer {
  question_id: string;
  option_ids: string[];
}

export interface Certificate {
  id: string;
  course_id: string;
  user_id: string;
  issued_at: string;
  verification_token: string;
  pdf_url?: string;
}

// Subscription types
export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Analytics types
export interface Analytics {
  views: number;
  completions: number;
  avg_watch_time: number;
  by_machine_model: Record<string, number>;
  by_date: Array<{ date: string; views: number }>;
}

// Reel Version types
export interface ReelVersion {
  id: string;
  reel_id: string;
  version_number: number;
  changes: Record<string, { from: unknown; to: unknown }>;
  created_by: string;
  created_at: string;
  metadata_snapshot: Partial<Reel>;
}

// Permission types
export interface ReelPermission {
  id: string;
  reel_id: string;
  user_id?: string;
  role?: string;
  access_level: 'view' | 'edit' | 'admin';
  visibility: 'tenant' | 'public' | 'internal';
  created_at: string;
  updated_at: string;
}

// Reprocess status types
export interface ReprocessStatus {
  id: string;
  reel_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
