import type { LifeImpactArticle } from '@/types/impact';

export const quitSugar: LifeImpactArticle = {
  habitCategory: 'quit_sugar',
  habitName: '砂糖断ち',

  article: {
    researchBody:
      '砂糖の過剰摂取をやめるだけで、体と心に劇的な変化が起きる。\n\n' +
      'JAMA Internal Medicineに掲載された大規模研究（Yang et al., 2014）では、添加糖の摂取カロリーが全体の25%以上の人は、10%未満の人に比べて心血管疾患による死亡リスクが2.75倍高いことが示された。また、Scientific Reports（Knüppel et al., 2017）の研究では、砂糖摂取量が多い男性はうつ病リスクが23%高いと報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      '経済的にも砂糖断ちの効果は大きい。日常の菓子・清涼飲料水への支出に加え、糖尿病や歯科治療などの長期医療費が削減される。\n\n' +
      '{{cost_inference}}\n\n' +
      '仕事のパフォーマンスにも影響がある。血糖値の乱高下がなくなることで午後の眠気が激減し、集中力が安定する。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Yang Q, et al. (2014). "Added Sugar Intake and Cardiovascular Diseases Mortality Among US Adults." JAMA Internal Medicine, 174(4), 516-524.',
        url: 'https://doi.org/10.1001/jamainternmed.2013.13563',
      },
      {
        id: 2,
        text: 'Knüppel A, et al. (2017). "Sugar intake from sweet food and beverages, common mental disorder and depression." Scientific Reports, 7, 6287.',
        url: 'https://doi.org/10.1038/s41598-017-05649-7',
      },
      {
        id: 3,
        text: '厚生労働省 (2020). 「日本人の食事摂取基準（2020年版）」',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。心血管疾患リスクの研究は主に欧米人を対象としていますが、糖代謝のメカニズムは人種を問わず共通です。日本人は欧米人より糖尿病を発症しやすい体質とされ（インスリン分泌量が少ない）、砂糖断ちの恩恵はむしろ大きいと推定されます。残存寿命40年ベースで、心血管リスク低減効果を控えめに算出すると、1日あたり約7分の健康寿命延伸に相当します。',
    cost:
      '日本人の平均的な菓子・嗜好飲料支出は月約8,000円（総務省家計調査2023）。さらに糖尿病の平均年間医療費は約27万円（厚労省データ）で、発症リスク低減分を加味すると、1日あたり¥400のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、血糖値安定による午後の生産性向上を控えめに2%と見積もると、年間¥30万の価値。さらにうつ病リスク23%低減による欠勤減少効果を加えると、1日あたり¥900の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3.5時間、¥12,000節約、¥27,000の収入増。\n' +
      '**1年続けると**：健康寿命+2.1日、¥14.6万節約、¥32.9万の収入増。\n' +
      '**10年続けると**：健康寿命+21日、¥146万節約、¥329万の収入増。\n' +
      '甘いものを手放すことで、甘くない現実がもっと甘くなります。',
  },

  calculationParams: {
    dailyHealthMinutes: 7,
    dailyCostSaving: 400,
    dailyIncomeGain: 900,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'quit',
  defaultIcon: '🍬',
};
