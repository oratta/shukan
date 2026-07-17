/**
 * 我慢率4択チップ（issue #104）。0-100 の int で保存し、刻みは表示側の都合でしかない。
 * 1日分アクションシート（habit-action-sheet）と一括編集シート（habit-bulk-edit-sheet）で共有する。
 * key は i18n の habits.actionSheet.* に対応する。
 */
export const RESIST_CHOICES = [
  { rate: 0, key: 'resist0' },
  { rate: 25, key: 'resist25' },
  { rate: 50, key: 'resist50' },
  { rate: 75, key: 'resist75' },
] as const;
