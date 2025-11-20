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
