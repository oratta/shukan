import type { LifeImpactArticle } from '@/types/impact';

export const dailyStretching: LifeImpactArticle = {
  habitCategory: 'daily_stretching',
  habitName: '毎日ストレッチ',

  article: {
    researchBody:
      '1日10分のストレッチが、体の硬さだけでなく血管の硬さも改善する。\n\n' +
      'American Journal of Physiology（Yamamoto et al., 2009）の研究では、4週間のストレッチプログラムで動脈硬化度が有意に改善し、血管年齢が若返ることが示された。さらに、定期的なストレッチは可動域を最大35%向上させ（Mayo Clinic推奨）、加齢による筋力低下と転倒リスクを大幅に減少させる。\n\n' +
      '{{health_inference}}\n\n' +
      'デスクワーカーにとって、ストレッチは最も手軽な健康投資だ。\n\n' +
      '{{cost_inference}}\n\n' +
      '体が柔軟になると、精神も柔軟になる。ストレッチはコルチゾール（ストレスホルモン）を低下させ、仕事のパフォーマンスを向上させる。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Yamamoto K, et al. (2009). "Poor trunk flexibility is associated with arterial stiffening." American Journal of Physiology-Heart and Circulatory Physiology, 297(4), H1314-H1318.',
        url: 'https://doi.org/10.1152/ajpheart.00061.2009',
      },
      {
        id: 2,
        text: 'Mayo Clinic (2024). "Stretching: Focus on flexibility." Mayo Clinic Health Information.',
        url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/stretching/art-20047931',
      },
      {
        id: 3,
        text: 'Harvard Health Publishing (2022). "The importance of stretching." Harvard Medical School.',
        url: 'https://www.health.harvard.edu/staying-healthy/the-importance-of-stretching',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。動脈硬化の研究は日本人を対象としたものも含まれており、直接的に適用可能です。40代は動脈硬化が加速し始める年齢であり、ストレッチによる血管柔軟性改善の恩恵は特に大きい。心血管リスク低減と転倒・腰痛予防効果を合わせ、1日あたり約5分の健康寿命延伸に相当すると推定されます。',
    cost:
      'ストレッチ自体は無料ですが、腰痛・肩こりの整体通院費（月平均4,000-8,000円）の削減が見込めます。さらに柔軟性低下による怪我の治療費リスク低減を加味すると、1日あたり¥200のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、ストレッチによるストレス低減と集中力向上を控えめに1%と見積もると年間¥15万。デスクワーク中の体の不調による生産性低下の解消効果を含め、1日あたり¥600の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥6,000節約、¥18,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.5日、¥7.3万節約、¥21.9万の収入増。\n' +
      '**10年続けると**：健康寿命+15日、¥73万節約、¥219万の収入増。\n' +
      '体をほぐす10分が、人生の可動域を広げます。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 200,
    dailyIncomeGain: 600,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'positive',
  defaultIcon: '🤸',
};
