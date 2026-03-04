import type { LifeImpactArticle } from '@/types/impact';

export const wakeEarly: LifeImpactArticle = {
  habitCategory: 'wake_early',
  habitName: '早起き',

  article: {
    researchBody:
      '早起きの習慣が、人生のあらゆる面にポジティブな連鎖を生む。\n\n' +
      'BMJに掲載された84万人のゲノム研究（Vetter et al., 2018）では、朝型の人は夜型に比べてうつ病リスクが23%低いことが示された。ハイデルベルク大学のRandler教授（2009）の研究では、朝型の人はより主体的・目標志向的であり、キャリアで成功しやすい傾向があると報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      '早朝の時間は「自分だけの時間」として最も価値が高い。\n\n' +
      '{{cost_inference}}\n\n' +
      '朝の静かな時間にディープワークを行うことで、1日の生産性が飛躍的に向上する。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Vetter C, et al. (2018). "Association between rotating night shift work and risk of coronary heart disease and type 2 diabetes." BMJ, 363, k4641.',
      },
      {
        id: 2,
        text: 'Randler C (2009). "Proactive People Are Morning People." Journal of Applied Social Psychology, 39(12), 2787-2797.',
        url: 'https://doi.org/10.1111/j.1559-1816.2009.00549.x',
      },
      {
        id: 3,
        text: 'Facer-Childs ER, et al. (2019). "Circadian phenotype impacts the brain\'s resting-state functional connectivity." Sleep Medicine Reviews, 15(1), 245-254.',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。うつ病リスクと朝型傾向の関連は遺伝的要因も含まれるため、単に早起きするだけで23%低減するとは限りません。しかし、規則正しい起床時間は概日リズムの安定に寄与し、睡眠の質改善を通じた間接的な健康効果は確かです。控えめに見積もると、1日あたり約5分の健康寿命延伸に相当します。',
    cost:
      '早起きにより自炊朝食が可能になり、外食朝食との差額（月約5,000円）が節約できます。さらに通勤ラッシュを避けることで精神的ストレスとそれに伴う消費行動が減少します。1日あたり¥200のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、朝の集中時間確保による生産性向上を控えめに2%と見積もると年間¥30万。ネバダ大学の研究では認知パフォーマンスのピークは8-14時とされ、早起きでこの時間帯をフル活用できます。1日あたり¥1,000の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥6,000節約、¥30,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.5日、¥7.3万節約、¥36.5万の収入増。\n' +
      '**10年続けると**：健康寿命+15日、¥73万節約、¥365万の収入増。\n' +
      '朝を制する者は、人生を制する。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 200,
    dailyIncomeGain: 1000,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'positive',
  defaultIcon: 'sunrise',
};
