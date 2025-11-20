// const debug_today = "2025-12-14";


/**
 * 日付が今日かどうかを判定する
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns 今日の場合true
 */
export function isToday(dateString: string): boolean {
  const target = new Date(dateString);
  const today = new Date();

  // 時刻を無視して日付のみで比較
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return target.getTime() === today.getTime();
}

/**
 * 日付の状態（過去・今日・未来）を判定する
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns 'past' | 'today' | 'future'
 */
export function getDateState(dateString: string): 'past' | 'today' | 'future' {
  const target = new Date(dateString);
  const today = new Date();

  // 時刻を無視して日付のみで比較
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  if (target < today) return 'past';
  if (target.getTime() === today.getTime()) return 'today';
  return 'future';
}

/**
 * 今日から指定日までの日数を計算する
 * @param targetDate YYYY-MM-DD形式の日付文字列
 * @returns 今日から指定日までの日数（過去の場合は負の数）
 */
export function getDaysUntil(targetDate: string): number {
  const target = new Date(targetDate);
  const today = new Date();

  // 時刻を無視して日付のみで比較
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 日付を日本語形式でフォーマットする
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns M月D日形式の文字列（例: 12月25日）
 */
export function formatJapaneseDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${month}月${day}日`;
}
