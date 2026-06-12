// 習慣プリセット（静的・全ユーザー共通）
//
// 「検索ではなく、なりたい自分から降ろす」習慣テンプレ。各プリセットは登録済み35記事
// （src/data/impact-articles）のうち1つ以上を参照するエビデンス束。採用すると既存の
// habits + habit_evidences に書き込む（新テーブル不要・既存 Discover 機構の拡張。書き込みは change-C）。
//
// 各 KPI（primaryKpis に含む）について 3〜5 個になるよう構成する。プリセットは複数 KPI に所属可。
// articleIds は記事の calculationParams の値分布（H/C/I/M が大きい記事）を手がかりに割り当てる。

import type { ArticleId } from '@/types/impact';
import type { KpiKey } from './kpi/catalog';

export interface HabitPreset {
  id: string;
  /** プリセット名（UI 見出し） */
  name: string;
  defaultHabitType: 'positive' | 'quit';
  /** lucide アイコン名 */
  icon: string;
  /** エビデンス束（記事ID。weight は採用時に既存機構で付与） */
  articleIds: ArticleId[];
  /** このプリセットが主に効く KPI（複数可） */
  primaryKpis: KpiKey[];
}

export const HABIT_PRESETS: readonly HabitPreset[] = [
  // ───────── health_lifespan（健康寿命）向け ─────────
  {
    id: 'quit_smoking_for_health',
    name: 'タバコをやめる',
    defaultHabitType: 'quit',
    icon: 'cigarette-off',
    articleIds: ['quit_smoking'],
    primaryKpis: ['health_lifespan'],
  },
  {
    id: 'daily_cardio_habit',
    name: '毎日の有酸素運動',
    defaultHabitType: 'positive',
    icon: 'person-standing',
    articleIds: ['daily_cardio', 'daily_walking'],
    primaryKpis: ['health_lifespan', 'positive_mood'],
  },
  {
    id: 'solid_sleep',
    name: 'しっかり眠る',
    defaultHabitType: 'positive',
    icon: 'moon',
    articleIds: ['sleep_7hours', 'no_screens_before_bed'],
    primaryKpis: ['health_lifespan', 'earning'],
  },
  {
    id: 'balanced_eating',
    name: '体にいい食事',
    defaultHabitType: 'positive',
    icon: 'utensils-crossed',
    articleIds: ['eat_vegetables', 'drink_water', 'quit_sugar'],
    primaryKpis: ['health_lifespan'],
  },
  {
    id: 'cut_junk',
    name: '体に悪いものを減らす',
    defaultHabitType: 'quit',
    icon: 'candy-off',
    articleIds: ['quit_junk_food', 'quit_alcohol'],
    primaryKpis: ['cost_saving'],
  },

  // ───────── positive_mood（前向きな気持ちの時間）向け ─────────
  {
    id: 'daily_meditation_habit',
    name: '毎日の瞑想',
    defaultHabitType: 'positive',
    icon: 'brain',
    articleIds: ['daily_meditation'],
    primaryKpis: ['positive_mood'],
  },
  {
    id: 'gratitude_and_journaling',
    name: '感謝と書く習慣',
    defaultHabitType: 'positive',
    icon: 'hand-heart',
    articleIds: ['gratitude_practice', 'daily_journaling'],
    primaryKpis: ['positive_mood'],
  },
  {
    id: 'time_in_nature_habit',
    name: '自然の中で過ごす',
    defaultHabitType: 'positive',
    icon: 'tree-pine',
    articleIds: ['time_in_nature', 'daily_walking'],
    primaryKpis: ['positive_mood'],
  },
  {
    id: 'mindful_movement',
    name: 'ヨガ・ストレッチ',
    defaultHabitType: 'positive',
    icon: 'flower-2',
    articleIds: ['daily_yoga', 'daily_stretching'],
    primaryKpis: ['positive_mood'],
  },

  // ───────── cost_saving（出費削減）向け ─────────
  {
    id: 'daily_saving_habit',
    name: '毎日の節約',
    defaultHabitType: 'positive',
    icon: 'piggy-bank',
    articleIds: ['daily_saving'],
    primaryKpis: ['cost_saving'],
  },
  {
    id: 'stop_impulse_buying',
    name: '衝動買いをやめる',
    defaultHabitType: 'quit',
    icon: 'shopping-cart',
    articleIds: ['no_impulse_buying'],
    primaryKpis: ['cost_saving'],
  },
  {
    id: 'cook_at_home',
    name: '自炊する',
    defaultHabitType: 'positive',
    icon: 'chef-hat',
    articleIds: ['home_cooking', 'intermittent_fasting'],
    primaryKpis: ['cost_saving', 'health_lifespan'],
  },
  {
    id: 'quit_drinking',
    name: 'お酒をやめる',
    defaultHabitType: 'quit',
    icon: 'wine-off',
    articleIds: ['quit_alcohol'],
    primaryKpis: ['cost_saving'],
  },

  // ───────── earning（稼ぐ能力）向け ─────────
  {
    id: 'deep_focus_work',
    name: '集中して働く',
    defaultHabitType: 'positive',
    icon: 'target',
    articleIds: ['deep_work', 'pomodoro_technique'],
    primaryKpis: ['earning'],
  },
  {
    id: 'morning_routine',
    name: '朝を整える',
    defaultHabitType: 'positive',
    icon: 'sunrise',
    articleIds: ['morning_planning', 'wake_early', 'morning_tidying'],
    primaryKpis: ['earning'],
  },
  {
    id: 'cut_digital_distraction',
    name: 'デジタルの誘惑を断つ',
    defaultHabitType: 'quit',
    icon: 'phone-off',
    articleIds: ['no_youtube', 'quit_social_media'],
    primaryKpis: ['earning'],
  },
  {
    id: 'keep_learning',
    name: '学び続ける',
    defaultHabitType: 'positive',
    icon: 'book-open',
    articleIds: ['daily_reading', 'learn_language'],
    primaryKpis: ['earning'],
  },
] as const;

/**
 * 指定 KPI を primaryKpis に含むプリセットを返す。
 */
export function getPresetsForKpi(key: KpiKey): HabitPreset[] {
  return HABIT_PRESETS.filter((p) => p.primaryKpis.includes(key));
}

/**
 * プリセットIDから引き当てる。未知IDは undefined。
 */
export function getHabitPreset(id: string): HabitPreset | undefined {
  return HABIT_PRESETS.find((p) => p.id === id);
}
