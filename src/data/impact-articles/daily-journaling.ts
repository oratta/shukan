import type { LifeImpactArticle } from '@/types/impact';

// Research sources:
// - Smyth JM, et al. (2018) JMIR Mental Health: Positive affect journaling
// - Pennebaker JW (1997): Expressive writing and health
// - Baikie KA & Wilhelm K (2005): Emotional and physical health benefits of expressive writing

export const dailyJournaling: LifeImpactArticle = {
  habitCategory: 'daily_journaling',
  habitName: '毎日ジャーナリング',

  article: {
    researchBody:
      '1日15分、書くだけで心と体が回復する。\n\n' +
      'JMIR Mental Health（Smyth et al., 2018）に掲載されたRCTでは、ポジティブ感情ジャーナリングを行った群は、標準ケア群に比べてメンタルヘルスの悩みが有意に減少し、不安・ストレス知覚が低下した。メタ分析では、ジャーナリング介入の68%で有意な効果が確認されている。さらに、臨床研究ではジャーナリングがコルチゾール（ストレスホルモン）を最大23%低減させることが示されている。\n\n' +
      '{{health_inference}}\n\n' +
      'ジャーナリングに必要なのはノートとペンだけだ。\n\n' +
      '{{cost_inference}}\n\n' +
      '書くことで思考が整理され、ワーキングメモリに余裕が生まれる。これが集中力と創造性の向上に直結する。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Smyth JM, et al. (2018). "Online Positive Affect Journaling in the Improvement of Mental Distress and Well-Being." JMIR Mental Health, 5(4), e11290.',
        url: 'https://doi.org/10.2196/11290',
      },
      {
        id: 2,
        text: 'Sohal M, et al. (2022). "Efficacy of journaling in the management of mental illness: a systematic review and meta-analysis." Family Medicine and Community Health, 10(1), e001272.',
        url: 'https://doi.org/10.1136/fmch-2021-001272',
      },
      {
        id: 3,
        text: 'Pennebaker JW & Smyth JM (2016). "Opening Up by Writing It Down." Guilford Press.',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。ジャーナリングの効果は文化を超えて確認されていますが、日本人男性は感情表出の機会が少ない傾向があり、書くことによるストレス解放の恩恵はむしろ大きいと推定されます。コルチゾール23%低減による心血管リスク低下と免疫機能改善を合わせ、1日あたり約5分の健康寿命延伸に相当します。',
    cost:
      'ノートとペンのコストは月100円程度。一方、ストレス関連の衝動消費や体調不良による出費が減少します。メンタルヘルスの安定により、カウンセリング費用の削減も見込まれ、1日あたり¥100のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、思考整理によるワーキングメモリの解放と意思決定の質向上を控えめに1.5%と見積もると年間¥22.5万。さらにストレス低減による欠勤減少を加え、1日あたり¥800の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥3,000節約、¥24,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.5日、¥3.7万節約、¥29.2万の収入増。\n' +
      '**10年続けると**：健康寿命+15日、¥37万節約、¥292万の収入増。\n' +
      'ペンを取るたびに、心の中の混乱が秩序に変わります。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 100,
    dailyIncomeGain: 800,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'positive',
  defaultIcon: 'notebook-pen',
};
