import type { LifeImpactArticle } from '@/types/impact';

// Research sources:
// - Rook DW (1987) Journal of Consumer Research: The buying impulse
// - Capital One Shopping (2024): Impulse buying statistics
// - Vohs KD & Faber RJ (2007) Journal of Consumer Research: Self-regulation and impulse buying

export const noImpulseBuying: LifeImpactArticle = {
  habitCategory: 'no_impulse_buying',
  habitName: '衝動買い禁止',

  article: {
    researchBody:
      '衝動買いをやめるだけで、年間数十万円が手元に残る。\n\n' +
      'Capital One Shopping（2024年）の調査では、米国消費者の衝動買いは月平均$282（約¥42,000）、年間$3,381（約¥50万）に達する。89%の消費者が衝動買いの経験があり、そのうち60.7%は1回あたり$100以上を衝動的に支出している。Journal of Consumer Research（Vohs & Faber, 2007）の研究では、自己制御力が低下している時に衝動買いが増加し、購入後の後悔が幸福度を低下させるという悪循環が確認されている。\n\n' +
      '{{health_inference}}\n\n' +
      '衝動買いの抑制は、直接的な家計改善だ。\n\n' +
      '{{cost_inference}}\n\n' +
      '自己制御力は筋肉のように鍛えられる。衝動買いを我慢する習慣は、仕事における意思決定の質も高める。\n\n' +
      '{{income_inference}}\n\n' +
      '衝動買いを我慢することは、心の平穏にも直結する。Vohs & Faber（2007）は購入後の後悔が幸福度を下げる悪循環を指摘し、Ryu & Fan（2023）の米国成人を対象とした研究では、お金の心配が強い人ほど心理的苦痛が大きいことが示されている。衝動買いを抑えることは、この後悔と金銭不安の両方を減らす。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Capital One Shopping Research (2024). "Impulse Buying Statistics: Consumer Spending Habits."',
        url: 'https://capitaloneshopping.com/research/impulse-buying-statistics/',
      },
      {
        id: 2,
        text: 'Vohs KD & Faber RJ (2007). "Spent Resources: Self-Regulatory Resource Availability Affects Impulse Buying." Journal of Consumer Research, 33(4), 537-547.',
        url: 'https://doi.org/10.1086/510228',
      },
      {
        id: 3,
        text: 'Rook DW & Fisher RJ (1995). "Normative Influences on Impulsive Buying Behavior." Journal of Consumer Research, 22(3), 305-313.',
      },
      {
        id: 4,
        text: 'Ryu S, Fan L (2023). "The Relationship Between Financial Worries and Psychological Distress Among U.S. Adults." Journal of Family and Economic Issues, 44(1), 16-33.',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8806009/',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。衝動買いの直接的な健康影響は限定的ですが、購入後の後悔によるストレスと、経済的不安による慢性的なコルチゾール上昇は心血管リスクと関連しています。さらに衝動買いで購入しがちなジャンクフード・アルコールの減少も間接的に健康に寄与します。1日あたり約2分の健康寿命延伸に相当すると推定されます。',
    cost:
      '日本人の衝動買い平均は月約2-3万円と推定されます（米国データを購買力で調整）。このうち50%を抑制できたとすると月1.5万円の節約。さらにクレジットカードの利息負担減少を含め、1日あたり¥700のコスト削減と推定されます。',
    income:
      '年収1,500万円に対して、自己制御力の向上は仕事での衝動的な判断ミスの減少に寄与します。Baumeister（2011）の研究では、自己制御力が高い人は職場パフォーマンスも高いと報告。間接的な生産性向上を控えめに1%（年間¥15万）と見積もり、暦日で日割りすると1日あたり¥400の収入ポテンシャルと推定されます。',
    positiveMood:
      '衝動買いの後悔は幸福度を下げ（Vohs & Faber, 2007）、お金の心配は心理的苦痛を高めます（Ryu & Fan, 2023）。衝動買いを抑える習慣は、この後悔と金銭不安を和らげ、家計への統制感を取り戻させます。ただし気分への効果は間接的なため、何もしないときに前向きでいられる時間（起床16時間のうち約50%＝480分）を基準に、気分改善を控えめに5%とみなすと、1日あたり約24分（480分×5%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+1時間、¥21,000節約、¥12,000の収入ポテンシャル、前向きな気持ちの時間+12時間。\n' +
      '**1年続けると**：健康寿命+0.6日、¥25.6万節約、¥14.6万の収入ポテンシャル、前向きな気持ちの時間+6.1日。\n' +
      '**10年続けると**：健康寿命+6日、¥256万節約、¥146万の収入ポテンシャル、前向きな気持ちの時間+60.8日。\n' +
      '「本当に必要か？」と3秒考えるだけで、人生が変わります。',
  },

  calculationParams: {
    dailyHealthMinutes: 2,
    dailyCostSaving: 700,
    dailyIncomeGain: 400,
    dailyPositiveMoodMinutes: 24,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: 'ストレス軽減', value: '購入後の後悔・経済的不安によるコルチゾール上昇の防止' },
      { label: '間接的健康効果', value: 'ジャンクフード・アルコール衝動買い減少', result: '2分/日' },
    ],
    cost: [
      { label: '衝動買い平均', value: '日本人推定 月2-3万円の50%抑制' },
      { label: '月間節約', formula: '月15000 + 利息削減6000 = 21000 ÷ 30', result: '700円/日' },
    ],
    income: [
      { label: '自己制御力向上', value: '職場の意思決定の質改善（Baumeister, 2011）' },
      { label: '年間の収入ポテンシャル', value: '間接的な生産性向上を控えめに1%', formula: '15000000 × 1%', result: '150000円/年' },
      { label: '暦日換算＋保守調整', value: '年額を暦日365日で日割りし保守的に丸め', formula: '150000 ÷ 365 ≈ 411 → 保守的に', result: '400円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '購入後の後悔は幸福度を下げ（Vohs & Faber, 2007）、金銭不安は心理的苦痛を高める（Ryu & Fan, 2023）。効果は間接的なため気分改善を控えめに5%' },
      { label: '日割り計算', formula: '480分 × 5%', result: '24分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1758525226490-c1553d9f3ad3',
    gradient: 'from-emerald-400 to-teal-600',
  },
  defaultHabitType: 'quit',
  defaultIcon: 'shopping-cart',
};
