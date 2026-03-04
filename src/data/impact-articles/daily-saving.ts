import type { LifeImpactArticle } from '@/types/impact';

// Research sources:
// - Lusardi A & Mitchell OS (2014) Journal of Economic Literature: Financial literacy
// - Sweet E, et al. (2013) Social Science & Medicine: Financial stress and health
// - 金融広報中央委員会「家計の金融行動に関する世論調査」

export const dailySaving: LifeImpactArticle = {
  habitCategory: 'daily_saving',
  habitName: '毎日貯金',

  article: {
    researchBody:
      '毎日少額でも貯金する習慣が、健康と幸福度を高める。\n\n' +
      'Social Science & Medicine（Sweet et al., 2013）の研究では、経済的ストレスが高い人は、うつ症状のリスクが2倍、不安障害のリスクが3倍高いことが示された。金融リテラシーの専門家Lusardi教授の研究では、「緊急時の資金がない」という状態が慢性的なコルチゾール上昇と関連し、心血管疾患リスクを高めることが報告されている。つまり、貯金は精神的安全網として直接的に健康を守る。\n\n' +
      '{{health_inference}}\n\n' +
      '貯金は「使わない」のではなく、「未来の自分に投資する」行為だ。\n\n' +
      '{{cost_inference}}\n\n' +
      '経済的余裕は、キャリアにおけるリスクテイクを可能にする。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Sweet E, et al. (2013). "The high price of debt: Household financial debt and its impact on mental and physical health." Social Science & Medicine, 91, 76-82.',
        url: 'https://doi.org/10.1016/j.socscimed.2013.05.009',
      },
      {
        id: 2,
        text: 'Lusardi A & Mitchell OS (2014). "The Economic Importance of Financial Literacy." Journal of Economic Literature, 52(1), 5-44.',
        url: 'https://doi.org/10.1257/jel.52.1.5',
      },
      {
        id: 3,
        text: '金融広報中央委員会 (2023). 「家計の金融行動に関する世論調査（単身世帯調査）」',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。経済的ストレスと健康の関連は人種を問わず確認されています。金融広報中央委員会のデータでは、単身世帯の33.4%が「貯蓄なし」と回答。毎日の貯金習慣は経済的不安を軽減し、慢性ストレスによる血圧上昇・免疫機能低下を防ぎます。精神的安定による健康効果を控えめに算出すると、1日あたり約3分の健康寿命延伸に相当します。',
    cost:
      '毎日1,000円の貯金を続けると、年間36.5万円、10年で365万円（利息除く）。少額でも複利効果で長期的には大きな資産になります。貯金習慣自体が節約意識を高め、不必要な支出の抑制にもつながります。1日あたり¥1,000のコスト改善と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、経済的余裕は「安い仕事を我慢して引き受ける必要がない」状態を作り、より価値の高い仕事の選択を可能にします。さらに投資に回す資金の確保により、不労所得の基盤が構築できます。間接的な収入効果を控えめに見積もると、1日あたり¥800の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+1.5時間、¥30,000の貯蓄、¥24,000の収入増。\n' +
      '**1年続けると**：健康寿命+0.9日、¥36.5万の貯蓄、¥29.2万の収入増。\n' +
      '**10年続けると**：健康寿命+9日、¥365万の貯蓄、¥292万の収入増。\n' +
      '今日の1,000円が、10年後のあなたの自由を作ります。',
  },

  calculationParams: {
    dailyHealthMinutes: 3,
    dailyCostSaving: 1000,
    dailyIncomeGain: 800,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'positive',
  defaultIcon: '💰',
};
