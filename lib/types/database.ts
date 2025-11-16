/**
 * Database type definitions based on requirements.md
 */

/**
 * Article status
 */
export type ArticleStatus = 'draft' | 'published';

/**
 * Reaction type
 */
export type ReactionType = 'like' | 'love' | 'clap' | 'fire';

/**
 * Profile table
 */
export interface Profile {
  id: string; // uuid (references auth.users)
  pen_name: string;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Article table
 */
export interface Article {
  id: string; // uuid
  user_id: string; // uuid (references profiles.id)
  publish_date: string; // date (YYYY-MM-DD)
  title: string;
  content: TipTapContent; // TipTap JSON format
  status: ArticleStatus;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

/**
 * Reaction table
 */
export interface Reaction {
  id: string; // uuid
  article_id: string; // uuid (references articles.id)
  user_id: string; // uuid (references profiles.id)
  reaction_type: ReactionType;
  created_at: string; // timestamptz
}

/**
 * Declaration table (書きます宣言)
 */
export interface Declaration {
  id: string; // uuid
  user_id: string; // uuid (references profiles.id)
  publish_date: string; // date (YYYY-MM-DD)
  created_at: string; // timestamptz
}

/**
 * TipTap content format (JSON)
 */
export interface TipTapContent {
  type: 'doc';
  content?: TipTapNode[];
}

/**
 * TipTap node
 */
export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

/**
 * TipTap mark
 */
export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

/**
 * Insert types (for creating new records)
 */
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at'>;
export type ReactionInsert = Omit<Reaction, 'id' | 'created_at'>;
export type DeclarationInsert = Omit<Declaration, 'id' | 'created_at'>;

/**
 * Update types (for updating existing records)
 */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type ArticleUpdate = Partial<Omit<Article, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/**
 * Article with author information
 */
export interface ArticleWithAuthor extends Article {
  profiles: Pick<Profile, 'pen_name'>;
}

/**
 * Calendar cell data
 */
export interface CalendarCellData {
  date: string; // YYYY-MM-DD
  declarationCount: number; // 宣言数
  hasPublishedArticle: boolean; // 公開記事があるか
  isUserDeclared: boolean; // 自分が宣言済みか
  isUserArticleExists: boolean; // 自分の記事があるか (下書き or 公開済み)
  isUserDraft: boolean; // 自分の下書きがあるか
  isUserPublished: boolean; // 自分が公開済みか
}
