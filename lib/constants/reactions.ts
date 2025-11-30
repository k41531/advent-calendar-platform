export const AVAILABLE_REACTIONS = [
  { emoji: "❤️", label: "いいね" },
  { emoji: "🤣", label: "面白い" },
  { emoji: "🤝", label: "わかる" },
  { emoji: "🔥", label: "すごい" },
  { emoji: "🔖", label: "ブックマーク" },
] as const;

export type ReactionEmoji = typeof AVAILABLE_REACTIONS[number]["emoji"];
