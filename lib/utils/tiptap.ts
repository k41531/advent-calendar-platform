import type { TipTapContent, TipTapNode } from "@/lib/types/database";

/**
 * TipTap JSONからプレーンテキストを抽出する
 */
export function extractPlainText(content: TipTapContent): string {
  if (!content.content || content.content.length === 0) {
    return "";
  }

  const extractFromNode = (node: TipTapNode): string => {
    // コードブロック、画像などは除外
    if (
      node.type === "codeBlock" ||
      node.type === "image" ||
      node.type === "video" ||
      node.type === "iframe"
    ) {
      return "";
    }

    // 改行は空白に変換
    if (node.type === "hardBreak") {
      return " ";
    }

    // テキストノードの場合はそのまま返す
    if (node.text) {
      return node.text;
    }

    // 子ノードがある場合は再帰的に処理
    if (node.content && node.content.length > 0) {
      return node.content.map(extractFromNode).join("");
    }

    return "";
  };

  // 段落ごとに空白を入れる
  let text = content.content
    .map((node) => {
      const text = extractFromNode(node);
      // 段落やヘッダーの場合は空白を追加
      if (
        node.type === "paragraph" ||
        node.type === "heading" ||
        node.type === "blockquote"
      ) {
        return text + " ";
      }
      return text;
    })
    .join("")
    .trim();

  // HTMLタグを除去（念のため）
  text = text.replace(/<[^>]*>/g, "");

  // HTMLエンティティをデコード
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // 連続する空白を1つにまとめる
  return text.replace(/\s+/g, " ").trim();
}

/**
 * プレーンテキストを指定文字数で切り詰める
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }

  // 最大文字数で切り詰めて、末尾に「...」を追加
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * TipTap JSONから要約テキストを取得（冒頭部分を抽出）
 */
export function getArticleExcerpt(
  content: TipTapContent,
  maxLength: number = 100
): string {
  const plainText = extractPlainText(content);
  return truncateText(plainText, maxLength);
}
