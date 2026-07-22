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
      '断食の効果は代謝や認知だけにとどまらない。断食介入をまとめたメタ分析（Berthelot et al., 2021）では、不安や抑うつのスコアが対照群より低く、しかも疲労感の増加は見られなかったと報告されている。\n\n' +
      '{{positive_mood_inference}}\n\n' +
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
      {
        id: 4,
        text: 'Berthelot E, et al. (2021). "Fasting Interventions for Stress, Anxiety and Depressive Symptoms: A Systematic Review and Meta-Analysis." Nutrients, 13(11), 3947.',
        url: 'https://doi.org/10.3390/nu13113947',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。日本人はインスリン分泌量が欧米人より少なく、インスリン感受性の改善による恩恵は特に大きいと推定されます。ただし、16:8断食の長期的な寿命延長効果は直接的には証明されていません。代謝改善・心血管リスク低減を保守的に見積もると、1日あたり約7分の健康寿命延伸に相当します。',
    cost:
      '朝食を抜く（または遅らせる）ことで、1食分のコスト（約300-500円）が節約できます。さらにインスリン関連の医療費リスク低減を含め、1日あたり¥350のコスト削減と推定されます。',
    income:
      '年収1,500万円に対して、血糖値安定による午前中の集中力向上と、BDNF増加による認知機能改善を控えめに1.5%と見積もると年間¥22.5万。これを暦日で日割りすると、1日あたり¥600の収入ポテンシャルと推定されます。',
    positiveMood:
      '断食介入のメタ分析では、不安・抑うつスコアの低下が疲労の増加を伴わずに報告されています（Berthelot et al., 2021）。何もしないときに前向きでいられる時間（起床16時間＝960分のうち約50%＝480分/日）を基準に、この気分への効果を保守的に3%とみなすと、1日あたり約14分（480分×3%）、前向きな気持ちで過ごせる時間が増えると推定されます。研究間のばらつきが大きく、効果がカロリー制限由来か断食固有かの切り分けも未確定で、断食初期は空腹による不快感も生じうるため、最も控えめな水準にとどめています。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3.5時間、¥10,500節約、¥18,000の収入ポテンシャル、前向きな気持ちの時間+7時間。\n' +
      '**1年続けると**：健康寿命+2.1日、¥12.8万節約、¥21.9万の収入ポテンシャル、前向きな気持ちの時間+3.5日。\n' +
      '**10年続けると**：健康寿命+21日、¥128万節約、¥219万の収入ポテンシャル、前向きな気持ちの時間+35.5日。\n' +
      '食べない時間が、あなたの体を内側から若返らせます。',
  },

  calculationParams: {
    dailyHealthMinutes: 7,
    dailyCostSaving: 350,
    dailyIncomeGain: 600,
    dailyPositiveMoodMinutes: 14,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '16:8断食がインスリン感受性改善・脂肪燃焼促進（de Cabo & Mattson, 2019）' },
      { label: '代謝改善効果', value: '日本人はインスリン分泌量が少なく恩恵が大きい' },
      { label: '日割り計算', value: '代謝改善・心血管リスク低減を保守的に見積もり', result: '7分/日' },
    ],
    cost: [
      { label: '朝食カット', value: '1食分のコスト（約300-500円）を節約', result: '300円/日' },
      { label: 'インスリン関連医療費削減', value: '糖尿病予防・血糖値安定による医療費リスク低減', result: '50円/日' },
      { label: '合計', formula: '300 + 50', result: '350円/日' },
    ],
    income: [
      { label: '年間の収入ポテンシャル', value: '血糖値安定+BDNF増加による集中力・認知機能向上を控えめに1.5%', formula: '15000000 × 1.5%', result: '225000円/年' },
      { label: '暦日換算', value: '年額を暦日365日で日割り（長期効果の不確実性を考慮し保守的に丸め）', formula: '225000 ÷ 365 ≈ 616 → 保守的に', result: '600円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '断食介入で不安・抑うつスコアが低下、疲労増加なし（Berthelot et al., 2021、11研究1,436人のメタ分析）。異質性大・カロリー制限との交絡ありのため最も保守的に3%' },
      { label: '日割り計算', formula: '480分 × 3%', result: '14分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1744194699438-1fca92810d11',
    gradient: 'from-slate-400 to-gray-600',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'timer',
};
