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

// Checkout & Billing types
export interface BillingDetails {
  id?: string;
  user_id: string;
  company_name: string;
  billing_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  tax_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  plan_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  promo_code_id?: string;
  invoice_url?: string;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiration_date?: string;
  usage_count: number;
  max_usage?: number;
  is_active: boolean;
}

export interface InvoicePreview {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}

// Transaction History types
export interface Invoice {
  id: string;
  transaction_id: string;
  pdf_url: string;
  issue_date: string;
  created_at: string;
}

export interface Refund {
  id: string;
  transaction_id: string;
  user_id: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  reason?: string;
  amount?: number;
  processed_at?: string;
}

export interface BillingContact {
  id: string;
  user_id: string;
  contact_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  plan_name?: string;
  invoice?: Invoice;
  refunds?: Refund[];
}
