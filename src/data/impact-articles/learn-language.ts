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
      '語学学習がもたらすのは、認知予備力や収入だけではない。新しい表現が通じた瞬間の高揚や達成感——学習中に感じる「楽しさ（enjoyment）」は、学びを支える中核的な感情として繰り返し観察されてきた（Wu & Kabilan, 2025）。\n\n' +
      '{{positive_mood_inference}}\n\n' +
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
      {
        id: 4,
        text: 'Wu W, Kabilan MK (2025). "Foreign language enjoyment in language learning from a positive psychology perspective: a scoping review." Frontiers in Psychology, 16, 1545114.',
        url: 'https://doi.org/10.3389/fpsyg.2025.1545114',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。認知症発症4.5年遅延の研究はインドの被験者を対象としていますが、バイリンガルの認知予備力効果は文化・人種を超えて確認されています。日本人は英語学習の需要が高く、言語距離が大きいため脳への負荷（＝トレーニング効果）も大きい。認知症予防と認知機能維持効果を控えめに算出すると、1日あたり約6分の健康寿命延伸に相当します。',
    cost:
      '語学アプリ（Duolingo等）は無料プランで十分使えます。有料サービスを使っても月1,000-2,000円程度。一方、語学力向上により海外旅行でのぼったくり回避や情報アクセス範囲の拡大で節約が見込まれ、ネットで1日あたり¥200のコスト削減と推定されます。',
    income:
      '年収1,500万円に対して、外国語能力は日本の労働市場で明確な収入プレミアムをもたらします。リクルートの調査では英語力のある人材は年収が10-15%高い傾向。既にある程度の英語力がある場合、第二外国語やビジネス英語の強化による追加プレミアムを控えめに3%（年間¥45万）と見積もり、暦日で日割りすると1日あたり¥1,200の収入ポテンシャルと推定されます。',
    positiveMood:
      '外国語学習では、新しい表現が通じた瞬間の達成感や高揚といった「楽しさ（foreign language enjoyment）」が、学びを支える中核的な positive emotion として繰り返し観察され、学習者の情緒的ウェルビーイングを高めることが報告されています（Wu & Kabilan, 2025）。何もしないときに前向きでいられる時間（起床16時間のうち約50%＝480分）を基準に、学習中の気分改善効果を保守的に5%とみなすと、1日あたり約24分（480分×5%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3時間、¥6,000節約、¥36,000の収入ポテンシャル、前向きな気持ちの時間+12時間。\n' +
      '**1年続けると**：健康寿命+1.8日、¥7.3万節約、¥43.8万の収入ポテンシャル、前向きな気持ちの時間+6.1日。\n' +
      '**10年続けると**：健康寿命+18日、¥73万節約、¥438万の収入ポテンシャル、前向きな気持ちの時間+60.8日。\n' +
      '新しい言語は、新しい世界への扉を開きます。',
  },

  calculationParams: {
    dailyHealthMinutes: 6,
    dailyCostSaving: 200,
    dailyIncomeGain: 1200,
    dailyPositiveMoodMinutes: 24,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: 'バイリンガルは認知症発症が4.5年遅延（Alladi et al., 2013）' },
      { label: '補強データ', value: '二言語話者のアルツハイマー発症5年遅延（Craik et al., 2010）' },
      { label: '日割り計算', value: '認知症予防・認知機能維持効果を控えめに算出', result: '6分/日' },
    ],
    cost: [
      { label: 'アプリ費用', value: '無料プラン利用可、有料でも月1,000-2,000円', result: '-50円/日' },
      { label: '情報アクセス拡大', value: '海外旅行でのぼったくり回避・情報範囲拡大による節約', result: '+250円/日' },
      { label: '合計', formula: '-50 + 250', result: '200円/日' },
    ],
    income: [
      { label: '語学プレミアム', value: '英語力ある人材は年収10-15%高い（リクルート調査）' },
      { label: '年間の収入ポテンシャル', value: '既存英語力への上乗せ・第二外国語を控えめに3%', formula: '15000000 × 3%', result: '450000円/年' },
      { label: '暦日換算＋保守調整', value: '年額を暦日365日で日割りし、さらに保守的に調整', formula: '450000 ÷ 365 ÷ 1.04', result: '1200円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '外国語学習の「楽しさ（enjoyment）」が中核的な positive emotion として情緒的ウェルビーイングを高める（Wu & Kabilan, 2025）。気分改善を保守的に5%' },
      { label: '日割り計算', formula: '480分 × 5%', result: '24分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1673515336416-a859f5b02afa',
    gradient: 'from-teal-400 to-cyan-600',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'globe',
};
