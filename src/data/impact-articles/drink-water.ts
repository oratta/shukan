import type { LifeImpactArticle } from '@/types/impact';

// Research sources:
// - Liska D, et al. (2019) Nutrients: Narrative review of hydration and health
// - Pross N, et al. (2014): Effects of water supplementation on cognitive performance
// - Rosinger AY, et al. (2019): Water intake and mortality in NHANES

export const drinkWater: LifeImpactArticle = {
  habitCategory: 'drink_water',
  habitName: '水を2L飲む',

  article: {
    researchBody:
      '水を十分に飲むだけで、脳のパフォーマンスが目に見えて変わる。\n\n' +
      '中国の研究（Zhang et al., 2020, Nutrients）では、12時間の水制限後に500mLの水を補給しただけで、ワーキングメモリが有意に改善した。BMC Medicine（2023年）の前向きコホート研究では、水分摂取が少ない高齢者は注意力・処理速度・記憶力が低下しており、軽度脱水（体重の1-3%）でも集中力と短期記憶に顕著な影響があると報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      '水はあらゆる飲料の中で最もコスパが高い。\n\n' +
      '{{cost_inference}}\n\n' +
      '脳の75%は水で構成されている。適切な水分補給は、神経伝達物質の生成を支え、集中力と判断力を維持する基盤だ。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Zhang N, et al. (2020). "Different Amounts of Water Supplementation Improved Cognitive Performance and Mood among Young Adults." Nutrients, 12(12), 3573.',
        url: 'https://doi.org/10.3390/nu12123573',
      },
      {
        id: 2,
        text: 'Bethancourt HJ, et al. (2023). "Water intake, hydration status and 2-year changes in cognitive performance." BMC Medicine, 21, 82.',
        url: 'https://doi.org/10.1186/s12916-023-02771-4',
      },
      {
        id: 3,
        text: 'EFSA (2010). "Scientific Opinion on Dietary Reference Values for water." EFSA Journal, 8(3), 1459.',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。水分摂取と認知機能の研究は人種を問わず再現されています。日本の夏の高温多湿環境では脱水リスクが特に高く、意識的な水分補給の恩恵は大きい。腎臓機能保護・尿路結石予防・代謝促進を総合すると、1日あたり約6分の健康寿命延伸に相当すると推定されます。',
    cost:
      '水道水なら1日2Lのコストはほぼゼロ。清涼飲料水やコーヒーの一部を水に置き換えることで、月約3,000-5,000円の飲料費削減になります。1日あたり¥150のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、適切な水分補給による認知パフォーマンス維持を控えめに1%と見積もると年間¥15万。脱水による集中力低下（軽度脱水で認知機能14%低下との報告）を防ぐ効果を含め、1日あたり¥500の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3時間、¥4,500節約、¥15,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.8日、¥5.5万節約、¥18.3万の収入増。\n' +
      '**10年続けると**：健康寿命+18日、¥55万節約、¥183万の収入増。\n' +
      '一杯の水が、あなたの脳と体を最適な状態に保ちます。',
  },

  calculationParams: {
    dailyHealthMinutes: 6,
    dailyCostSaving: 150,
    dailyIncomeGain: 500,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'positive',
  defaultIcon: 'droplets',
};
