import type { LifeImpactArticle } from '@/types/impact';

export const quitSocialMedia: LifeImpactArticle = {
  habitCategory: 'quit_social_media',
  habitName: 'SNS断ち',

  article: {
    researchBody:
      'SNSを手放した瞬間から、あなたの脳は本来の力を取り戻し始める。\n\n' +
      'JAMA Network Open（2025年）に掲載された研究では、わずか1週間のSNSデトックスで不安症状が16.1%、うつ症状が24.8%、不眠症状が14.5%改善したと報告されている。さらにペンシルベニア大学の研究（Hunt et al., 2018）では、SNS使用を1日30分に制限した群で、孤独感・うつ・不安が有意に減少した。\n\n' +
      '{{health_inference}}\n\n' +
      'SNSに費やす時間には、見えないコストがある。\n\n' +
      '{{cost_inference}}\n\n' +
      '知識労働者にとって、集中力は最も価値ある資産だ。SNSによる注意の断片化は、生産性に深刻な影響を与える。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Coyne SM, et al. (2025). "Effects of a 1-Week Social Media Detox on Mental Health." JAMA Network Open.',
      },
      {
        id: 2,
        text: 'Hunt MG, et al. (2018). "No More FOMO: Limiting Social Media Decreases Loneliness and Depression." Journal of Social and Clinical Psychology, 37(10), 751-768.',
        url: 'https://doi.org/10.1521/jscp.2018.37.10.751',
      },
      {
        id: 3,
        text: 'Mark G, et al. (2008). "The Cost of Interrupted Work: More Speed and Stress." Proceedings of CHI 2008.',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。SNSのメンタルヘルスへの影響は年齢・国籍を問わず報告されています。日本人のSNS平均利用時間は約1時間/日（総務省2023）。うつ病リスク低減と睡眠改善効果を、残存寿命40年ベースで控えめに算出すると、1日あたり約5分の健康寿命延伸に相当します。',
    cost:
      'SNS経由の衝動購入は年間平均約9万円（米国調査$754を日本の購買力で調整）。さらにSNS関連のサブスク費用や広告に誘発された支出を加味すると、1日あたり¥350のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、SNS断ちによる集中力回復効果を控えめに3%と見積もると年間¥45万。カリフォルニア大学の研究では、中断後の再集中に平均23分を要するとされ、1日数回のSNSチェックが大きな生産性損失を生みます。1日あたり¥1,400の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥10,500節約、¥42,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.5日、¥12.8万節約、¥51.1万の収入増。\n' +
      '**10年続けると**：健康寿命+15日、¥128万節約、¥511万の収入増。\n' +
      'いいねの数より、あなた自身の人生の充実度を上げましょう。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 350,
    dailyIncomeGain: 1400,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'quit',
  defaultIcon: '📵',
};
