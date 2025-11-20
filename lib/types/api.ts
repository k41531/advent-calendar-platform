/**
 * API response and utility types
 */

import type { Article, ArticleWithAuthor, Profile, Declaration, Reaction } from './database';

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * API error
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

/**
 * Article list response
 */
export type ArticleListResponse = ApiResponse<ArticleWithAuthor[]>;

/**
 * Article detail response
 */
export type ArticleDetailResponse = ApiResponse<ArticleWithAuthor>;

/**
 * Profile response
 */
export type ProfileResponse = ApiResponse<Profile>;

/**
 * Declaration response
 */
export type DeclarationResponse = ApiResponse<Declaration>;

/**
 * Declarations list response
 */
export type DeclarationsListResponse = ApiResponse<Declaration[]>;

/**
 * Reaction response
 */
export type ReactionResponse = ApiResponse<Reaction>;

/**
 * User's reactions on an article
 */
export type UserReactionsResponse = ApiResponse<Reaction[]>;

/**
 * Calendar data response
 */
export interface CalendarDataResponse {
  declarations: Declaration[];
  publishedArticles: Article[];
  userDeclarations: Declaration[];
  userArticles: Article[];
}
