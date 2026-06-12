// KPI カタログ（静的・全ユーザー共通）
//
// オンボーディングで選ぶ4つの KPI の定義。確定文言は
// docs/context/onboarding-screens.md（2026-06-12 確定）から一字一句変えずに転記する。
// 既存規約（D2/D10）に従い静的フロントエンド管理（src/data）とする。
//
// 用語ルール: この4つは「KPI」とだけ呼ぶ。新しいラベル（造語）を発明しない。

export type KpiKey = 'health_lifespan' | 'positive_mood' | 'cost_saving' | 'earning';

// data-model.md §2.1 の軸の種別
export type KpiKind = 'time_quantity' | 'time_quality' | 'money_out' | 'money_in';

export interface KpiDefinition {
  key: KpiKey;
  /** KPI名（onboarding-screens.md の「KPI名」列） */
  name: string;
  /** 単位（分 / 円） */
  unit: string;
  /** 軸の種別 */
  kind: KpiKind;
  /** カードの見出し（なりたい自分の言葉。onboarding-screens.md の「見出し」列） */
  headline: string;
  /** 説明文（onboarding-screens.md の「説明文」列） */
  description: string;
  /** lucide アイコン名 */
  icon: string;
}

// 選択順・表示順は onboarding-screens.md のカード並び（1〜4）に従う
export const KPI_CATALOG: readonly KpiDefinition[] = [
  {
    key: 'health_lifespan',
    name: '健康寿命',
    unit: '分',
    kind: 'time_quantity',
    headline: '長く健康でいられる自分へ',
    description: '習慣の積み重ねが健康寿命を何分延ばすかを記録します',
    icon: 'heart-pulse',
  },
  {
    key: 'positive_mood',
    name: '前向きな気持ちの時間',
    unit: '分',
    kind: 'time_quality',
    headline: '前向きな気持ちで過ごせる自分へ',
    description: '前向きでいられる時間が何分増えるかを記録します',
    icon: 'smile',
  },
  {
    key: 'cost_saving',
    name: '出費削減',
    unit: '円',
    kind: 'money_out',
    headline: 'お金で諦めない自分へ',
    description: '生涯の出費をいくら（円）減らせるかを記録します',
    icon: 'piggy-bank',
  },
  {
    key: 'earning',
    name: '稼ぐ能力',
    unit: '円',
    kind: 'money_in',
    headline: '稼ぐ力のある自分へ',
    description: '生涯で稼ぐ能力がいくら（円）上がるかを記録します',
    icon: 'trending-up',
  },
] as const;

export const KPI_KEYS: readonly KpiKey[] = KPI_CATALOG.map((d) => d.key);

const KPI_MAP: Map<KpiKey, KpiDefinition> = new Map(
  KPI_CATALOG.map((d) => [d.key, d])
);

/**
 * KPIキーから定義を引き当てる。未知キーは undefined（getArticle と同じ流儀）。
 */
export function getKpi(key: KpiKey): KpiDefinition | undefined {
  return KPI_MAP.get(key);
}
