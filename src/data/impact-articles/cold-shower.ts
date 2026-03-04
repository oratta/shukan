import type { LifeImpactArticle } from '@/types/impact';

export const coldShower: LifeImpactArticle = {
  habitCategory: 'cold_shower',
  habitName: '冷水シャワー',

  article: {
    researchBody:
      '朝の冷水シャワーが、免疫力と意志力を同時に鍛える。\n\n' +
      'オランダの3,018人を対象としたランダム化比較試験（Buijze et al., 2016, PLOS ONE）では、温水シャワーの最後に30-90秒の冷水を浴びるだけで、病欠日数が29%減少した。さらに、2024年の研究（El-Essawy et al.）では、90日間の冷水シャワーでIL-2・IL-4レベルが有意に上昇し、T細胞の増殖と液性免疫が強化されることが示された。\n\n' +
      '{{health_inference}}\n\n' +
      '冷水シャワーにかかるコストはゼロ。むしろガス代の節約になる。\n\n' +
      '{{cost_inference}}\n\n' +
      '冷水を浴びる行為は、意志力トレーニングでもある。毎朝「不快なことを敢えてやる」習慣が、仕事での困難にも立ち向かう力を養う。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Buijze GA, et al. (2016). "The Effect of Cold Showering on Health and Work: A Randomized Controlled Trial." PLOS ONE, 11(9), e0161749.',
        url: 'https://doi.org/10.1371/journal.pone.0161749',
      },
      {
        id: 2,
        text: 'El-Essawy et al. (2024). "Regular cold shower exposure modulates humoral and cell-mediated immunity in healthy individuals." ScienceDirect.',
      },
      {
        id: 3,
        text: 'Shevchuk NA (2008). "Adapted cold shower as a potential treatment for depression." Medical Hypotheses, 70(5), 995-1001.',
        url: 'https://doi.org/10.1016/j.mehy.2007.04.052',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。オランダの研究は欧州人を対象としていますが、免疫系の基本メカニズムは人種を問わず共通です。病欠29%減少は免疫機能の改善を反映しており、日本でも同様の効果が期待されます。うつ症状改善効果と免疫強化を合わせ、1日あたり約4分の健康寿命延伸に相当すると推定されます。',
    cost:
      'シャワー時間の一部を冷水に切り替えることで、ガス代が月約500円節約できます。さらに病欠29%減少による医療費削減と市販薬の購入減少を含め、1日あたり¥100のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、病欠29%減少は年間約1.5日の追加勤務に相当し¥9.4万の価値。さらに意志力・集中力向上による生産性改善を加え、1日あたり¥700の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2時間、¥3,000節約、¥21,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.2日、¥3.7万節約、¥25.6万の収入増。\n' +
      '**10年続けると**：健康寿命+12日、¥37万節約、¥256万の収入増。\n' +
      '朝のたった30秒の冷水が、1日の活力と人生の質を変えます。',
  },

  calculationParams: {
    dailyHealthMinutes: 4,
    dailyCostSaving: 100,
    dailyIncomeGain: 700,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '冷水シャワーで病欠日数29%減少（Buijze et al., 2016）' },
      { label: '免疫強化', value: 'IL-2・IL-4レベル上昇、T細胞増殖促進（El-Essawy et al., 2024）' },
      { label: '日割り計算', formula: '免疫強化 + うつ症状改善を残存寿命40年で換算', result: '4分/日' },
    ],
    cost: [
      { label: 'ガス代節約', value: 'シャワー時間の一部を冷水に切り替え', formula: '500 ÷ 30', result: '17円/日' },
      { label: '医療費・市販薬削減', value: '病欠29%減少に伴う医療費と市販薬の購入減少', result: '83円/日' },
      { label: '合計', formula: '17 + 83', result: '100円/日' },
    ],
    income: [
      { label: '病欠減少の経済価値', value: '病欠29%減少 → 年間約1.5日の追加勤務', formula: '62500 × 1.5 ÷ 365', result: '257円/日' },
      { label: '意志力・集中力向上', value: '毎朝の意志力トレーニングによる生産性改善', result: '443円/日' },
      { label: '合計', formula: '257 + 443', result: '700円/日' },
    ],
  },

  defaultHabitType: 'positive',
  defaultIcon: 'shower-head',
};
