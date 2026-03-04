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
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。衝動買いの直接的な健康影響は限定的ですが、購入後の後悔によるストレスと、経済的不安による慢性的なコルチゾール上昇は心血管リスクと関連しています。さらに衝動買いで購入しがちなジャンクフード・アルコールの減少も間接的に健康に寄与します。1日あたり約2分の健康寿命延伸に相当すると推定されます。',
    cost:
      '日本人の衝動買い平均は月約2-3万円と推定されます（米国データを購買力で調整）。このうち50%を抑制できたとすると月1.5万円の節約。さらにクレジットカードの利息負担減少を含め、1日あたり¥700のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、自己制御力の向上は仕事での衝動的な判断ミスの減少に寄与します。Baumeister（2011）の研究では、自己制御力が高い人は職場パフォーマンスも高いと報告。間接的な生産性向上を控えめに1%と見積もると、1日あたり¥500の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+1時間、¥21,000節約、¥15,000の収入増。\n' +
      '**1年続けると**：健康寿命+0.6日、¥25.6万節約、¥18.3万の収入増。\n' +
      '**10年続けると**：健康寿命+6日、¥256万節約、¥183万の収入増。\n' +
      '「本当に必要か？」と3秒考えるだけで、人生が変わります。',
  },

  calculationParams: {
    dailyHealthMinutes: 2,
    dailyCostSaving: 700,
    dailyIncomeGain: 500,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'quit',
  defaultIcon: '🛒',
};
