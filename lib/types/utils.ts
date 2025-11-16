/**
 * Utility types and constants
 */

import type { ReactionType, ArticleStatus } from './database';

/**
 * Available reaction types
 */
export const REACTION_TYPES: readonly ReactionType[] = ['like', 'love', 'clap', 'fire'] as const;

/**
 * Reaction type labels
 */
export const REACTION_LABELS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  clap: '👏',
  fire: '🔥',
};

/**
 * Article status labels
 */
export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: '下書き',
  published: '公開中',
};

/**
 * Advent calendar date range
 */
export const ADVENT_CALENDAR_START_DATE = 1; // December 1st
export const ADVENT_CALENDAR_END_DATE = 25; // December 25th
export const ADVENT_CALENDAR_MONTH = 12; // December

/**
 * Date validation result
 */
export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * User session
 */
export interface UserSession {
  userId: string;
  penName: string;
}

/**
 * Navigation item
 */
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

/**
 * Toast notification
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}
