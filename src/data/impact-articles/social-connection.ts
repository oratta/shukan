import type { LifeImpactArticle } from '@/types/impact';

/**
 * 社会的つながり — Life Impact Article
 *
 * Research basis:
 * - Mood(主効果): Hall et al. (2023) — 質の高い会話1回で当日 well-being 向上（3実験 N=907, mini-meta d=0.255）
 *   → ベースライン480分×12% = 55分/日
 * - Health(副次): Holt-Lunstad et al. (2015) — 孤立/孤独/独居の死亡リスク 29%/26%/32%増（交絡統制後）
 *   → 会話頻度向上による孤立緩和を保守的に按分し 6分/日
 * - Cost: Shaw et al. (2017, Stanford/AARP) — 客観的孤立の高齢者は Medicare 支出 +$1,608/年
 *   → 40代への外挿で大きく割り引き 300円/日
 * - Income: Gallup Q12 Item10 — 職場に親友がいる人はエンゲージメント7倍
 *   → 控えめに1.5%の生産性向上として 900円/日
 */
export const socialConnection: LifeImpactArticle = {
  habitCategory: 'social_connection',
  habitName: '社会的つながり',

  article: {
    researchBody:
      '社会的孤立は、見えない生活習慣病だ。\n\n' +
      '148研究・30万人を統合したメタアナリシス（Holt-Lunstad et al., 2010）では、社会的つながりが強い人は生存オッズが1.5倍高いと示された。さらに2015年の後続メタアナリシスでは、交絡因子を統制しても社会的孤立で死亡リスクが29%、孤独感で26%、独居で32%上昇することが確認されている。「孤立は1日タバコ15本に匹敵する」という通説は2021年の直接比較研究で否定されたが、それでも孤立が死亡リスク要因であることは揺るがない。\n\n' +
      '{{health_inference}}\n\n' +
      '孤立の代償は医療費にも表れる。Stanford/AARPの研究（Shaw et al., 2017）では、客観的に孤立した高齢者はMedicare支出が年$1,608多かった。人とのつながりは、将来の医療費を抑える予防投資でもある。\n\n' +
      '{{cost_inference}}\n\n' +
      'そして、つながりはキャリアの資産でもある。Gallupの大規模職場調査では、職場に親友がいる人はエンゲージメントが7倍高く、収益性・定着率とも正の相関を示した。加えてHall et al.（2023）の3つのランダム化実験（N=907）は、たった1回の「質の高い会話」がその日1日のwell-beingを高めることを実証している。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',
    sources: [
      {
        id: 1,
        text: 'Holt-Lunstad J, et al. (2010). "Social Relationships and Mortality Risk: A Meta-analytic Review." PLOS Medicine, 7(7), e1000316.',
        url: 'https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316',
      },
      {
        id: 2,
        text: 'Holt-Lunstad J, Smith TB, Baker M, Harris T, Stephenson D (2015). "Loneliness and Social Isolation as Risk Factors for Mortality: A Meta-Analytic Review." Perspectives on Psychological Science, 10(2), 227-237.',
        url: 'https://journals.sagepub.com/doi/full/10.1177/1745691614568352',
      },
      {
        id: 3,
        text: 'Hall JA, Holmstrom AJ, Pennington N, Perrault EK, Totzkay D (2023). "Quality Conversation Can Increase Daily Well-Being." Communication Research.',
        url: 'https://journals.sagepub.com/doi/10.1177/00936502221139363',
      },
      {
        id: 4,
        text: 'Shaw JG, Yang W, et al. (2017). "Social Isolation and Medicare Spending." Health Services Research — 客観的孤立群でMedicare支出 +$1,608/年。',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5847278/',
      },
      {
        id: 5,
        text: 'Gallup (Q12 Item10). "The Increasing Importance of a Best Friend at Work." — 職場に親友がいる人はエンゲージメント7倍。',
        url: 'https://www.gallup.com/workplace/397058/increasing-importance-best-friend-work.aspx',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。孤立と死亡リスクのメタアナリシスは主に欧米コホートを対象としていますが、社会的サポートが免疫・炎症・血圧に及ぼす生理学的経路は人種を問いません。一方で「健康な人ほど社交的になれる」という逆因果や、遺伝的因果推定との不一致（Nature Human Behaviour 2024）も報告されており、運動や禁酒より一段保守的に見積もる必要があります。生涯延命1年相当を残り40年で日割りしても本来36分/日ですが、「完全な孤立解消」ではなく「会話頻度の向上」という部分効果である点を踏まえ、大きく割り引いて1日あたり約6分の健康寿命延伸と推定します。',
    cost:
      'Stanford/AARP研究の孤立高齢者Medicare超過支出（$1,608/年 ≈ 24万円/年 ≈ 660円/日）をベースにします。ただしこれは高齢者データであり、42歳という対象年齢層にそのまま外挿できません。また同じ研究内で「主観的孤独感」自体はMedicare支出を減らす方向という逆の結果もあり、孤立と孤独は区別が必要です。これらの不確実性を考慮して半分以下に割り引き、1日あたり¥300のコスト削減と推定します。',
    income:
      '年収1,500万円（日給換算¥62,500）に対して、Gallupの「職場に親友」研究が示すエンゲージメント向上（収益性・定着率との相関）を、既存記事の慣例に倣い控えめに1.5%の生産性向上と見積もると年間約22万円。ただしGallup研究は職場限定であり、本習慣（友人・家族を含む会話）とは対象がややズレるため、端数を丸めて1日あたり¥900の収入ポテンシャルと推定します。',
    positiveMood:
      'Hall et al.（2023）の3つのランダム化実験は、質の高い会話1回で当日のwell-beingが高まることを示しました（mini-meta d=0.255、小〜中の効果量）。何もしないときに前向きでいられる時間（起床16時間×前向き50%＝480分/日）を基準に、単発の効果を毎日の習慣に単純外挿する飛躍を避けて保守的に12%とみなすと、1日あたり約55分（480分×12%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3時間、¥9,000節約、¥27,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.5日、¥11万節約、¥32.9万の収入増。\n' +
      '**10年続けると**：健康寿命+15日、¥110万節約、¥329万の収入増。\n' +
      'たった1回の「打ち明け合う会話」が、その日の気分を変え、10年後の健康と稼ぐ力を底上げします。',
  },

  calculationParams: {
    dailyHealthMinutes: 6,
    dailyCostSaving: 300,
    dailyIncomeGain: 900,
    dailyPositiveMoodMinutes: 55,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '孤立/孤独/独居の死亡リスクは統制後もそれぞれ29%/26%/32%増（Holt-Lunstad, 2015）' },
      { label: '延命換算の保守的見積もり', value: '会話頻度向上による孤立緩和を生涯延命1年相当と控えめに設定（喫煙同等の通説は2021年の反証研究で否定）' },
      { label: '日割り計算', formula: '1年 × 525600分 ÷ 40年 ÷ 365日 ≈ 36分だが部分効果として大きく圧縮', result: '6分/日' },
    ],
    cost: [
      { label: '研究結果', value: 'AARP/Stanford（Shaw et al., 2017）: 客観的孤立の高齢者はMedicare支出が年$1,608多い' },
      { label: '円換算・年齢層調整', formula: '1608ドル×150円 ÷ 365日 ≈ 660円/日、40代への外挿で保守的に半減以下', result: '300円/日' },
    ],
    income: [
      { label: '研究結果', value: 'Gallup Q12 Item10: 職場に親友がいる人はエンゲージメント7倍、収益性・定着率と正相関' },
      { label: '控えめに1.5%適用', formula: '62500円 × 1.5%', result: '938円/日' },
      { label: '端数調整', value: '職場限定研究の外挿を踏まえ丸め', result: '900円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: 'Hall et al., 2023: 質の高い会話1回で当日well-being向上（3実験 N=907, mini-meta d=0.255）' },
      { label: '保守的に12%採用', formula: '480分 × 12%', result: '57.6分/日' },
      { label: '端数調整', result: '55分/日' },
    ],
  },

  defaultHabitType: 'positive',
  defaultIcon: 'message-circle-heart',
};
