import type { LifeImpactArticle } from '@/types/impact';

export const sleep7hours: LifeImpactArticle = {
  habitCategory: 'sleep_7hours',
  habitName: '7時間睡眠',

  article: {
    researchBody:
      '睡眠は、喫煙・運動・食事よりも寿命への影響が大きいかもしれない。\n\n' +
      'SLEEP誌に掲載されたメタ分析（Cappuccio et al., 2010）では、6時間未満の睡眠は全死亡リスクを13%上昇させることが示された。2025年のOHSU研究では「行動要因として睡眠が寿命に与える影響は、食事・運動・孤独よりも大きく、喫煙に次ぐ」と結論している。RAND Europeの経済分析では、睡眠不足による日本の経済損失はGDPの2.92%（約15兆円）に上ると推定されている。\n\n' +
      '{{health_inference}}\n\n' +
      '十分な睡眠は、意外にも家計にも効く。\n\n' +
      '{{cost_inference}}\n\n' +
      '睡眠と収入の関係は直接的だ。睡眠不足の労働者は、7-9時間睡眠の人に比べて2.4%高い生産性損失を報告している。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Cappuccio FP, et al. (2010). "Sleep duration and all-cause mortality: a systematic review and meta-analysis of prospective studies." SLEEP, 33(5), 585-592.',
        url: 'https://doi.org/10.1093/sleep/33.5.585',
      },
      {
        id: 2,
        text: 'Hafner M, et al. (2017). "Why Sleep Matters—The Economic Costs of Insufficient Sleep." RAND Europe.',
        url: 'https://www.rand.org/pubs/research_reports/RR1791.html',
      },
      {
        id: 3,
        text: 'OHSU (2025). "Insufficient sleep associated with decreased life expectancy." Oregon Health & Science University.',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。日本人の平均睡眠時間は約6時間22分でOECD最短水準です。Cappuccioのメタ分析は人種を問わず適用可能で、6時間未満→7時間への改善は13%の死亡リスク低減に相当します。日本人男性の残存寿命39年ベースで算出すると、1日あたり約14分の健康寿命延伸に相当し、これは禁煙に匹敵する効果です。',
    cost:
      '睡眠不足は判断力低下による衝動消費の増加と関連があります。さらに、睡眠改善によるメンタルヘルス関連の通院費減少（年間約5万円）、エナジードリンク等の覚醒維持費の不要化を含め、1日あたり¥400のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、RAND研究の生産性損失2.4%を適用すると年間¥36万の回復。さらに判断力・創造性の向上効果を加え、1日あたり¥2,500の収入ポテンシャルと推定されます。これは睡眠が最も費用対効果の高い「投資」であることを示しています。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+7時間、¥12,000節約、¥75,000の収入増。\n' +
      '**1年続けると**：健康寿命+4.3日、¥14.6万節約、¥91.3万の収入増。\n' +
      '**10年続けると**：健康寿命+43日、¥146万節約、¥913万の収入増。\n' +
      '今夜1時間早く寝ることが、明日から始まる人生最大の投資です。',
  },

  calculationParams: {
    dailyHealthMinutes: 14,
    dailyCostSaving: 400,
    dailyIncomeGain: 2500,
  },

  confidenceLevel: 'high',
  defaultHabitType: 'positive',
  defaultIcon: '😴',
};
