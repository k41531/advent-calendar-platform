import { memo } from "react";

interface ArticlePreviewProps {
  content: string;
}

export const ArticlePreview = memo(function ArticlePreview({ content }: ArticlePreviewProps) {
  return (
    <div
      className="prose prose-lg max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});
