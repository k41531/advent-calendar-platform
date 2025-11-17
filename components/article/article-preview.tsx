interface ArticlePreviewProps {
  content: string;
}

export function ArticlePreview({ content }: ArticlePreviewProps) {
  return (
    <div
      className="prose prose-lg max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
