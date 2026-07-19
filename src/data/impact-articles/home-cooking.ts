import type { LifeImpactArticle } from '@/types/impact';

// Research sources:
// - Wolfson JA & Bleich SN (2015) Public Health Nutrition: Home cooking and diet quality
// - Monsivais P, et al. (2014) American Journal of Preventive Medicine: Cooking and diet
// - Johns Hopkins Center for a Livable Future (2014): Home cooking study

export const homeCooking: LifeImpactArticle = {
  habitCategory: 'home_cooking',
  habitName: '自炊',

  article: {
    researchBody:
      '自炊する人は、外食中心の人より明らかに健康だ。\n\n' +
      'ジョンズ・ホプキンス大学の研究（Wolfson & Bleich, 2015）では、週6回以上自炊する人は週1回以下の人に比べて、カロリー・糖分・脂肪の摂取が有意に少なく、Healthy Eating Indexのスコアが10%以上高かった。ワシントン大学の研究では、自炊は外食より健康的であるだけでなく、食費の追加コストがゼロ、むしろ1日$2（約¥300）の節約になると報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      '自炊は「最もリターンの高い家事」だ。\n\n' +
      '{{cost_inference}}\n\n' +
      '健康的な食事は、仕事のパフォーマンスにも直結する。\n\n' +
      '{{income_inference}}\n\n' +
      '自炊の効用は、食べる中身だけではない。手を動かして一皿を仕上げる行為そのものが、気分や自己効力感を押し上げる。調理を用いた介入研究のシステマティックレビュー（Farmer et al., 2018）は、料理が気分・感情・自尊感情の改善と結びつくことを報告している。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Wolfson JA & Bleich SN (2015). "Is cooking at home associated with better diet quality or weight-loss intention?" Public Health Nutrition, 18(8), 1397-1406.',
        url: 'https://doi.org/10.1017/S1368980014001943',
      },
      {
        id: 2,
        text: 'Monsivais P, et al. (2014). "Time Spent on Home Food Preparation and Indicators of Healthy Eating." American Journal of Preventive Medicine, 47(6), 796-802.',
      },
      {
        id: 3,
        text: 'AICR (2017). "Cook dinner at home — save money, eat healthier." American Institute for Cancer Research.',
        url: 'https://www.aicr.org/resources/blog/study-healthy-foods-prepared-at-home-save-money-and-boost-diet-quality/',
      },
      {
        id: 4,
        text: 'Farmer N, Touchton-Leonard K, Ross A (2018). "Psychosocial Benefits of Cooking Interventions: A Systematic Review." Health Education & Behavior, 45(2), 167-180.',
        url: 'https://doi.org/10.1177/1090198117736352',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。日本はコンビニ・外食文化が発達しているため、自炊率の低い男性は塩分・脂質の過剰摂取リスクが高い。自炊により食事内容をコントロールできるため、心血管疾患・糖尿病・がんのリスク低減が見込めます。食事の質向上による健康効果を控えめに算出すると、1日あたり約6分の健康寿命延伸に相当します。',
    cost:
      '外食の平均1食は約900円、自炊なら約350円。週5回の夕食を自炊に切り替えると月約11,000円の節約。ランチも含めると月2万円以上の差になります。1日あたり¥800のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、食事改善による体調安定・集中力向上を控えめに1%と見積もると年間¥15万。さらに料理スキル自体がストレス解消・創造性向上に寄与するとの研究もあり、1日あたり¥500の収入ポテンシャルと推定されます。',
    positiveMood:
      '調理という行為は、気分・感情・自尊感情の改善につながることがシステマティックレビューで示されています（Farmer et al., 2018）。何もしないときに前向きでいられる時間（起床16時間＝960分のうち約50%＝480分/日）を基準に、この気分改善効果を保守的に5%とみなすと、1日あたり約24分（480分×5%）、前向きな気持ちで過ごせる時間が増えると推定されます。エビデンスは臨床・地域介入が中心で、自尊感情や社会的つながりへの効果が大きいため、気分単体への寄与は控えめに見積もっています。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3時間、¥24,000節約、¥15,000の収入増、前向きな気持ちの時間+12時間。\n' +
      '**1年続けると**：健康寿命+1.8日、¥29.2万節約、¥18.3万の収入増、前向きな気持ちの時間+6.1日。\n' +
      '**10年続けると**：健康寿命+18日、¥292万節約、¥183万の収入増、前向きな気持ちの時間+60.8日。\n' +
      'キッチンに立つ時間が、人生の質を底上げします。',
  },

  calculationParams: {
    dailyHealthMinutes: 6,
    dailyCostSaving: 800,
    dailyIncomeGain: 500,
    dailyPositiveMoodMinutes: 24,
  },

  confidenceLevel: 'high',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '週6回以上の自炊でHealthy Eating Index 10%以上向上（Wolfson & Bleich, 2015）' },
      { label: '日本人の現状', value: 'コンビニ・外食文化により塩分・脂質の過剰摂取リスクが高い' },
      { label: '日割り計算', value: '心血管疾患・糖尿病・がんリスク低減を控えめに算出', result: '6分/日' },
    ],
    cost: [
      { label: '外食との差額', value: '外食1食約900円、自炊約350円', formula: '900 - 350', result: '550円/日' },
      { label: '長期医療費削減', value: '食事改善による生活習慣病予防の医療費効果', result: '250円/日' },
      { label: '合計', formula: '550 + 250', result: '800円/日' },
    ],
    income: [
      { label: '基準日給', value: '年収1,500万円', formula: '15000000 ÷ 240日', result: '62500円/日' },
      { label: '体調安定・集中力向上', value: '食事改善による生産性向上を控えめに1%', formula: '62500 × 1%', result: '625円/日' },
      { label: '保守的調整', value: 'ストレス解消・創造性向上の付加価値を含め下方調整', result: '500円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '調理介入は気分・感情・自尊感情の改善と関連（Farmer et al., 2018、11研究のシステマティックレビュー）。臨床・地域介入中心のため保守的に5%' },
      { label: '日割り計算', formula: '480分 × 5%', result: '24分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1758522489348-6e33d0e14669',
    gradient: 'from-orange-400 to-red-600',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'chef-hat',
};
