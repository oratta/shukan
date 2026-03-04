import type { LifeImpactArticle } from '@/types/impact';

export const quitJunkFood: LifeImpactArticle = {
  habitCategory: 'quit_junk_food',
  habitName: 'ジャンクフード断ち',

  article: {
    researchBody:
      'ジャンクフードをやめるだけで、あなたの体は驚くほど速く回復し始める。\n\n' +
      'BMJに掲載された大規模前向きコホート研究（Srour et al., 2019）では、超加工食品の摂取割合が10%増加するごとに、心血管疾患リスクが12%上昇することが示された。さらに別のBMJ研究（Rico-Campà et al., 2019）では、超加工食品の高摂取群は低摂取群に比べて全死亡リスクが62%高いと報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      'ジャンクフードへの支出は見えにくいが、積み重なると大きな額になる。\n\n' +
      '{{cost_inference}}\n\n' +
      '食事の質は仕事の質に直結する。加工食品を減らすことで、炎症が抑制され脳機能が改善する。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Srour B, et al. (2019). "Ultra-processed food intake and risk of cardiovascular disease." BMJ, 365, l1451.',
        url: 'https://doi.org/10.1136/bmj.l1451',
      },
      {
        id: 2,
        text: 'Rico-Campà A, et al. (2019). "Association between consumption of ultra-processed foods and all cause mortality." BMJ, 365, l1949.',
        url: 'https://doi.org/10.1136/bmj.l1949',
      },
      {
        id: 3,
        text: 'Hall KD, et al. (2019). "Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain." Cell Metabolism, 30(1), 67-77.',
        url: 'https://doi.org/10.1016/j.cmet.2019.05.008',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。これらの研究はフランスやスペインの成人を対象としていますが、超加工食品の健康リスクメカニズム（慢性炎症・酸化ストレス）は人種を問わず共通です。日本では欧米ほど超加工食品の割合は高くありませんが、コンビニ食・カップ麺の利用頻度を考慮すると、1日あたり約8分の健康寿命延伸に相当すると推定されます。',
    cost:
      'コンビニ弁当やファストフードの1食平均は約700円。これを自炊に切り替えると1食約350円で済むため、週3回の置き換えで月約4,200円の節約。さらに肥満・糖尿病関連の医療費リスク低減を加味すると、1日あたり¥500のコスト削減になります。',
    income:
      '年収1,500万円（日給¥62,500）に対して、食事改善による集中力・体調向上を控えめに1.5%と見積もると年間¥22.5万。加えて病欠日数の減少効果を含めると、1日あたり¥800の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+4時間、¥15,000節約、¥24,000の収入増。\n' +
      '**1年続けると**：健康寿命+2.4日、¥18.3万節約、¥29.2万の収入増。\n' +
      '**10年続けると**：健康寿命+24日、¥183万節約、¥292万の収入増。\n' +
      '体に入れるものを変えれば、体から出てくるパフォーマンスも変わります。',
  },

  calculationParams: {
    dailyHealthMinutes: 8,
    dailyCostSaving: 500,
    dailyIncomeGain: 800,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'quit',
  defaultIcon: '🍔',
};
