/**
 * Component prop types
 */

import type { Article, ArticleWithAuthor, CalendarCellData, ReactionType } from './database';

/**
 * Calendar component props
 */
export interface CalendarProps {
  year: number;
  cellData: CalendarCellData[];
  onCellClick: (date: string) => void;
}

/**
 * CalendarCell component props
 */
export interface CalendarCellProps {
  data: CalendarCellData;
  onClick: () => void;
}

/**
 * Article editor props
 */
export interface ArticleEditorProps {
  article?: Article;
  onSaveDraft: (data: ArticleFormData) => Promise<void>;
  onPublish: (data: ArticleFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

/**
 * Article form data
 */
export interface ArticleFormData {
  title: string;
  content: string; // TipTap JSON as string
  publish_date: string; // YYYY-MM-DD
}

/**
 * Article card props
 */
export interface ArticleCardProps {
  article: ArticleWithAuthor;
  showStatus?: boolean;
}

/**
 * Article list props
 */
export interface ArticleListProps {
  articles: ArticleWithAuthor[];
  emptyMessage?: string;
}

/**
 * Reaction button props
 */
export interface ReactionButtonProps {
  articleId: string;
  reactionType: ReactionType;
  isReacted: boolean;
  onReactionToggle: (articleId: string, reactionType: ReactionType) => Promise<void>;
}

/**
 * Declaration button props
 */
export interface DeclarationButtonProps {
  date: string; // YYYY-MM-DD
  isUserDeclared: boolean;
  onDeclare: (date: string) => Promise<void>;
  disabled?: boolean;
}
