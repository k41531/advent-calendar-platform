// const debug_today = "2025-12-14";


/**
 * 日付が今日かどうかを判定する
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns 今日の場合true
 */
export function isToday(dateString: string): boolean {
  // YYYY-MM-DD形式の文字列をローカルタイムゾーンの日付として解析
  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(year, month - 1, day);
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
  // YYYY-MM-DD形式の文字列をローカルタイムゾーンの日付として解析
  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(year, month - 1, day);
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
  // YYYY-MM-DD形式の文字列をローカルタイムゾーンの日付として解析
  const [year, month, day] = targetDate.split('-').map(Number);
  const target = new Date(year, month - 1, day);
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
  // YYYY-MM-DD形式の文字列をローカルタイムゾーンの日付として解析
  const [, month, day] = dateString.split('-').map(Number);

  return `${month}月${day}日`;
}
