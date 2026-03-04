import type { LifeImpactArticle } from '@/types/impact';

// Research sources:
// - de Cabo R & Mattson MP (2019) NEJM: Effects of intermittent fasting
// - Seimon RV, et al. (2015) Molecular and Cellular Endocrinology: IF meta-analysis
// - eClinicalMedicine (2024): Umbrella review of IF systematic reviews

export const intermittentFasting: LifeImpactArticle = {
  habitCategory: 'intermittent_fasting',
  habitName: '16時間断食',

  article: {
    researchBody:
      '食べない時間を作るだけで、体の修復スイッチが入る。\n\n' +
      'New England Journal of Medicine（de Cabo & Mattson, 2019）の包括的レビューでは、16:8断食がインスリン感受性の改善、血糖値の安定、脂肪燃焼の促進に効果があると報告されている。eClinicalMedicine（2024年）のメタ分析のメタ分析では、肥満・過体重の成人において腹囲・体脂肪率・空腹時インスリン・LDLコレステロール・中性脂肪が有意に減少することが確認された。\n\n' +
      '{{health_inference}}\n\n' +
      '断食は「食べない」ことで節約できる、究極のコスト削減法でもある。\n\n' +
      '{{cost_inference}}\n\n' +
      '空腹状態は脳のBDNF（脳由来神経栄養因子）を増加させ、認知機能を向上させることが動物実験で示されている。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'de Cabo R & Mattson MP (2019). "Effects of Intermittent Fasting on Health, Aging, and Disease." NEJM, 381(26), 2541-2551.',
        url: 'https://doi.org/10.1056/NEJMra1905136',
      },
      {
        id: 2,
        text: 'Gu L, et al. (2024). "Intermittent fasting and health outcomes: an umbrella review of systematic reviews and meta-analyses." eClinicalMedicine, 70, 102519.',
        url: 'https://doi.org/10.1016/j.eclinm.2024.102519',
      },
      {
        id: 3,
        text: 'Mattson MP, et al. (2018). "Intermittent metabolic switching, neuroplasticity and brain health." Nature Reviews Neuroscience, 19, 81-94.',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。日本人はインスリン分泌量が欧米人より少なく、インスリン感受性の改善による恩恵は特に大きいと推定されます。ただし、16:8断食の長期的な寿命延長効果は直接的には証明されていません。代謝改善・心血管リスク低減を保守的に見積もると、1日あたり約7分の健康寿命延伸に相当します。',
    cost:
      '朝食を抜く（または遅らせる）ことで、1食分のコスト（約300-500円）が節約できます。さらにインスリン関連の医療費リスク低減を含め、1日あたり¥350のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、血糖値安定による午前中の集中力向上と、BDNF増加による認知機能改善を控えめに1.5%と見積もると年間¥22.5万。1日あたり¥800の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3.5時間、¥10,500節約、¥24,000の収入増。\n' +
      '**1年続けると**：健康寿命+2.1日、¥12.8万節約、¥29.2万の収入増。\n' +
      '**10年続けると**：健康寿命+21日、¥128万節約、¥292万の収入増。\n' +
      '食べない時間が、あなたの体を内側から若返らせます。',
  },

  calculationParams: {
    dailyHealthMinutes: 7,
    dailyCostSaving: 350,
    dailyIncomeGain: 800,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'positive',
  defaultIcon: 'timer',
};
