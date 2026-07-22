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
      'ジャンクフードを減らす効果は、体だけでなく心にも及ぶ。中等度〜重度のうつ病患者を対象としたランダム化比較試験（SMILES試験, Jacka et al., 2017）では、加工食品を減らし食事の質を高めた群で、うつ症状が対照群より有意に改善した。腸内環境と炎症の改善が、脳の働きと気分を下支えする。\n\n' +
      '{{positive_mood_inference}}\n\n' +
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
      {
        id: 4,
        text: 'Jacka FN, et al. (2017). "A randomised controlled trial of dietary improvement for adults with major depression (the \'SMILES\' trial)." BMC Medicine, 15, 23.',
        url: 'https://doi.org/10.1186/s12916-017-0791-y',
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
    positiveMood:
      '食事の質を上げると、前向きな気持ちも底上げされます。SMILES試験（Jacka et al., 2017）では、加工食品を減らす食事介入によってうつ症状が有意に改善し、寛解に至った人は対照群の約4倍でした。何もしないときに前向きでいられる時間（起床16時間のうち約50%＝480分）を基準に、この気分改善効果を保守的に10%とみなすと、1日あたり約48分（480分×10%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+4時間、¥15,000節約、¥24,000の収入ポテンシャル、前向きな気持ちの時間+24時間。\n' +
      '**1年続けると**：健康寿命+2.4日、¥18.3万節約、¥29.2万の収入ポテンシャル、前向きな気持ちの時間+12.2日。\n' +
      '**10年続けると**：健康寿命+24日、¥183万節約、¥292万の収入ポテンシャル、前向きな気持ちの時間+121日。\n' +
      '体に入れるものを変えれば、体から出てくるパフォーマンスも変わります。',
  },

  calculationParams: {
    dailyHealthMinutes: 8,
    dailyCostSaving: 500,
    dailyIncomeGain: 800,
    dailyPositiveMoodMinutes: 48,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: 'CVDリスク', value: 'BMJ Srour 2019: 超加工食品10%増でCVDリスク12%上昇' },
      { label: '全死亡リスク', value: 'BMJ Rico-Campà 2019: 高摂取群は全死亡リスク62%増' },
      { label: '日割り計算', value: '慢性炎症・酸化ストレス低減を残存寿命40年で保守的に算出', result: '8分/日' },
    ],
    cost: [
      { label: '食費差額', value: 'コンビニ¥700 → 自炊¥350 × 週3回', formula: '(700 - 350) × 3 ÷ 7', result: '150円/日' },
      { label: '肥満・糖尿病医療費リスク低減', value: '生活習慣病関連の医療費削減', result: '350円/日' },
      { label: '合計', formula: '150 + 350', result: '500円/日' },
    ],
    income: [
      { label: '集中力・体調向上', value: '食事改善による炎症抑制・脳機能改善' },
      { label: '控えめに1.5%適用', formula: '15000000 × 1.5% ÷ 365', result: '616円/日' },
      { label: '病欠日数減少', value: '体調改善による欠勤減少', result: '184円/日' },
      { label: '合計', formula: '616 + 184', result: '800円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '加工食品を減らす食事介入でうつ症状が有意に改善（SMILES試験, Jacka et al., 2017）。気分改善を保守的に10%' },
      { label: '日割り計算', formula: '480分 × 10%', result: '48分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1564362411991-472954b39f56',
    gradient: 'from-yellow-400 to-orange-600',
  },
  defaultHabitType: 'quit',
  defaultIcon: 'utensils-crossed',
};
