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
    name: 'タバコを吸わない',
    defaultHabitType: 'quit',
    icon: 'cigarette-off',
    articleIds: ['quit_smoking'],
    primaryKpis: ['health_lifespan'],
  },
  {
    id: 'daily_cardio_habit',
    name: '少し息が切れるくらいの運動を毎日行う',
    defaultHabitType: 'positive',
    icon: 'person-standing',
    articleIds: ['daily_cardio'],
    primaryKpis: ['health_lifespan', 'positive_mood'],
  },
  {
    id: 'solid_sleep',
    name: '毎日6〜8時間の睡眠をとる',
    defaultHabitType: 'positive',
    icon: 'moon',
    articleIds: ['sleep_7hours'],
    primaryKpis: ['health_lifespan', 'earning'],
  },
  {
    id: 'eat_vegetables_habit',
    name: '野菜・果物を1日5皿（約350g）食べる',
    defaultHabitType: 'positive',
    icon: 'salad',
    articleIds: ['eat_vegetables'],
    primaryKpis: ['health_lifespan'],
  },
  {
    id: 'drink_water_habit',
    name: '毎日コップ8杯（約1.5L）の水を飲む',
    defaultHabitType: 'positive',
    icon: 'glass-water',
    articleIds: ['drink_water'],
    primaryKpis: ['health_lifespan'],
  },
  {
    id: 'quit_sugar_habit',
    name: '砂糖入りの飲み物・お菓子をとらない',
    defaultHabitType: 'quit',
    icon: 'candy-off',
    articleIds: ['quit_sugar'],
    primaryKpis: ['health_lifespan'],
  },
  {
    id: 'quit_junk_food_habit',
    name: 'ジャンクフードを食べない',
    defaultHabitType: 'quit',
    icon: 'hamburger',
    articleIds: ['quit_junk_food'],
    primaryKpis: ['health_lifespan'],
  },
  {
    id: 'daily_strength_habit',
    name: '週2〜3回、筋トレをする（自重でOK）',
    defaultHabitType: 'positive',
    icon: 'dumbbell',
    articleIds: ['daily_strength'],
    primaryKpis: ['health_lifespan'],
  },
  {
    id: 'fermented_food_habit',
    name: '毎日1品、発酵食品を食べる（納豆・味噌・ヨーグルトなど）',
    defaultHabitType: 'positive',
    icon: 'soup',
    articleIds: ['fermented_food'],
    primaryKpis: ['health_lifespan'],
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
    id: 'daily_journaling_habit',
    name: '毎日、感情を吐き出す日記を書く',
    defaultHabitType: 'positive',
    icon: 'pen-line',
    articleIds: ['daily_journaling'],
    primaryKpis: ['positive_mood'],
  },
  {
    id: 'time_in_nature_habit',
    name: '毎日20分、自然の中で過ごす',
    defaultHabitType: 'positive',
    icon: 'tree-pine',
    articleIds: ['time_in_nature'],
    primaryKpis: ['positive_mood'],
  },
  {
    id: 'social_connection_habit',
    name: '毎日、誰かと近況や気持ちを打ち明け合う会話をする',
    defaultHabitType: 'positive',
    icon: 'message-circle-heart',
    articleIds: ['social_connection'],
    primaryKpis: ['positive_mood', 'health_lifespan'],
  },
  {
    id: 'morning_light_habit',
    name: '毎日、起床後1時間以内に10分以上、外の光を浴びる',
    defaultHabitType: 'positive',
    icon: 'sunrise',
    articleIds: ['morning_light'],
    primaryKpis: ['positive_mood', 'health_lifespan'],
  },

  // ───────── cost_saving（出費削減）向け ─────────
  {
    id: 'quit_alcohol_habit',
    name: 'アルコールを飲まない',
    defaultHabitType: 'quit',
    icon: 'wine-off',
    articleIds: ['quit_alcohol'],
    primaryKpis: ['cost_saving'],
  },
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
