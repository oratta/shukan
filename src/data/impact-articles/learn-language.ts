import type { LifeImpactArticle } from '@/types/impact';

// Research sources:
// - Alladi S, et al. (2013) Neurology: Bilingualism and Alzheimer's onset
// - Craik FIM, et al. (2010) Neurology: Bilingualism and cognitive reserve
// - Eurobarometer (2012): Multilingualism and employment

export const learnLanguage: LifeImpactArticle = {
  habitCategory: 'learn_language',
  habitName: '語学学習',

  article: {
    researchBody:
      '新しい言語を学ぶことは、脳の最高のトレーニングだ。\n\n' +
      'Neurology誌（Alladi et al., 2013）の253人のアルツハイマー患者を対象とした研究では、バイリンガルの人はモノリンガルに比べて認知症の発症が平均4.5年遅れることが示された。トロント大学の研究（Craik et al., 2010）でも同様に、二言語話者のアルツハイマー発症が5年遅延すると報告されている。これは言語切り替えが脳の認知予備力を高め、神経可塑性を維持するためと考えられている。\n\n' +
      '{{health_inference}}\n\n' +
      '語学学習アプリの多くは無料で使え、通勤時間を有効活用できる。\n\n' +
      '{{cost_inference}}\n\n' +
      'グローバル化が進む経済において、外国語能力は直接的な収入プレミアムをもたらす。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Alladi S, et al. (2013). "Bilingualism delays age at onset of dementia, independent of education and immigration status." Neurology, 81(22), 1938-1944.',
        url: 'https://doi.org/10.1212/01.wnl.0000436620.33155.a4',
      },
      {
        id: 2,
        text: 'Craik FIM, et al. (2010). "Delaying the onset of Alzheimer disease: Bilingualism as a form of cognitive reserve." Neurology, 75(19), 1726-1729.',
        url: 'https://doi.org/10.1212/WNL.0b013e3181fc2a1c',
      },
      {
        id: 3,
        text: 'Eurobarometer (2012). "Europeans and their Languages." European Commission Special Eurobarometer 386.',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。認知症発症4.5年遅延の研究はインドの被験者を対象としていますが、バイリンガルの認知予備力効果は文化・人種を超えて確認されています。日本人は英語学習の需要が高く、言語距離が大きいため脳への負荷（＝トレーニング効果）も大きい。認知症予防と認知機能維持効果を控えめに算出すると、1日あたり約6分の健康寿命延伸に相当します。',
    cost:
      '語学アプリ（Duolingo等）は無料プランで十分使えます。有料サービスを使っても月1,000-2,000円程度。一方、語学力向上により海外旅行でのぼったくり回避や情報アクセス範囲の拡大で節約が見込まれ、ネットで1日あたり¥200のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、外国語能力は日本の労働市場で明確な収入プレミアムをもたらします。リクルートの調査では英語力のある人材は年収が10-15%高い傾向。既にある程度の英語力がある場合、第二外国語やビジネス英語の強化による追加プレミアムを控えめに3%と見積もると、1日あたり¥1,800の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3時間、¥6,000節約、¥54,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.8日、¥7.3万節約、¥65.7万の収入増。\n' +
      '**10年続けると**：健康寿命+18日、¥73万節約、¥657万の収入増。\n' +
      '新しい言語は、新しい世界への扉を開きます。',
  },

  calculationParams: {
    dailyHealthMinutes: 6,
    dailyCostSaving: 200,
    dailyIncomeGain: 1800,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'positive',
  defaultIcon: 'globe',
};
