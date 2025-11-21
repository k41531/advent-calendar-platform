export const AVAILABLE_REACTIONS = [
  { emoji: "👍", label: "いいね" },
  { emoji: "❤️", label: "好き" },
  { emoji: "🎉", label: "すごい" },
  { emoji: "🔥", label: "熱い" },
  { emoji: "👏", label: "拍手" },
] as const;

export type ReactionEmoji = typeof AVAILABLE_REACTIONS[number]["emoji"];
