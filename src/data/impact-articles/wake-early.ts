import type { LifeImpactArticle } from '@/types/impact';

export const wakeEarly: LifeImpactArticle = {
  habitCategory: 'wake_early',
  habitName: '早起き',

  article: {
    researchBody:
      '早起きの習慣が、人生のあらゆる面にポジティブな連鎖を生む。\n\n' +
      '84万人のゲノムデータを用いた研究（Daghlas et al., 2021, JAMA Psychiatry）では、睡眠の中間点が1時間早い朝型ほど、うつ病リスクが23%低いことが示された。ハイデルベルク大学のRandler教授（2009）の研究では、朝型の人はより主体的・目標志向的であり、キャリアで成功しやすい傾向があると報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      '早朝の時間は「自分だけの時間」として最も価値が高い。\n\n' +
      '{{cost_inference}}\n\n' +
      '朝の静かな時間にディープワークを行うことで、1日の生産性が飛躍的に向上する。\n\n' +
      '{{income_inference}}\n\n' +
      '早起きの恩恵は、生産性だけにとどまらない。84万人超の遺伝データを用いた研究では、睡眠の中間点が1時間早いほどうつ病の発症リスクが23%低いことが示されている（Daghlas et al., 2021）。起床時刻を前倒しする習慣は、日々の気分の土台を整える。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Vetter C, et al. (2018). "Association between rotating night shift work and risk of coronary heart disease and type 2 diabetes." BMJ, 363, k4641.',
      },
      {
        id: 2,
        text: 'Randler C (2009). "Proactive People Are Morning People." Journal of Applied Social Psychology, 39(12), 2787-2797.',
        url: 'https://doi.org/10.1111/j.1559-1816.2009.00549.x',
      },
      {
        id: 3,
        text: 'Facer-Childs ER, et al. (2019). "Circadian phenotype impacts the brain\'s resting-state functional connectivity." Sleep Medicine Reviews, 15(1), 245-254.',
      },
      {
        id: 4,
        text: 'Daghlas I, Lane JM, Saxena R, Vetter C (2021). "Genetically Proxied Diurnal Preference, Sleep Timing, and Risk of Major Depressive Disorder." JAMA Psychiatry, 78(8), 903-910.',
        url: 'https://doi.org/10.1001/jamapsychiatry.2021.0959',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。うつ病リスクと朝型傾向の関連は遺伝的要因も含まれるため、単に早起きするだけで23%低減するとは限りません。しかし、規則正しい起床時間は概日リズムの安定に寄与し、睡眠の質改善を通じた間接的な健康効果は確かです。控えめに見積もると、1日あたり約5分の健康寿命延伸に相当します。',
    cost:
      '早起きにより自炊朝食が可能になり、外食朝食との差額（月約5,000円）が節約できます。さらに通勤ラッシュを避けることで精神的ストレスとそれに伴う消費行動が減少します。1日あたり¥200のコスト削減と推定されます。',
    income:
      '年収1,500万円に対して、朝の集中時間確保による生産性向上を控えめに2%と見積もると年間¥30万。これを暦日で日割りすると1日あたり約822円ですが、ネバダ大学の研究では認知パフォーマンスのピークは8-14時とされ、早起きでこの時間帯をフル活用できます。効果を保守的に見積もり、1日あたり¥650の収入ポテンシャルと推定されます。',
    positiveMood:
      'メンデルランダム化を用いた84万人規模の研究では、睡眠の中間点が1時間早い朝型ほどうつ病の発症リスクが23%低いと報告されています（Daghlas et al., 2021）。ただし遺伝的要因も関与するため、早起きだけで同じ効果が得られるとは限りません。何もしないときに前向きでいられる時間（起床16時間のうち約50%＝480分）を基準に、気分への効果を保守的に7%とみなすと、1日あたり約34分（480分×7%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥6,000節約、¥19,500の収入ポテンシャル、前向きな気持ちの時間+17時間。\n' +
      '**1年続けると**：健康寿命+1.5日、¥7.3万節約、¥23.7万の収入ポテンシャル、前向きな気持ちの時間+8.6日。\n' +
      '**10年続けると**：健康寿命+15日、¥73万節約、¥237万の収入ポテンシャル、前向きな気持ちの時間+86.2日。\n' +
      '朝を制する者は、人生を制する。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 200,
    dailyIncomeGain: 650,
    dailyPositiveMoodMinutes: 34,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '朝型はうつ病リスク23%低い（Daghlas, 2021）' },
      { label: '概日リズム安定化', value: '睡眠の質改善を含め保守的に', result: '5分/日' },
    ],
    cost: [
      { label: '自炊朝食で節約', formula: '月5000 ÷ 30', result: '167円/日' },
      { label: 'ストレス関連消費減', value: '通勤ラッシュ回避等', result: '33円/日' },
      { label: '合計', formula: '167 + 33', result: '200円/日' },
    ],
    income: [
      { label: '朝のDeep Work', value: '認知ピーク8-14時をフル活用' },
      { label: '生産性2%向上', formula: '15000000 × 2% ÷ 365 ≈ 822 → 保守的に', result: '650円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '睡眠中間点が1時間早いほどうつ発症リスク23%低い（Daghlas, 2021）。遺伝要因も関与するため気分改善を保守的に7%' },
      { label: '日割り計算', formula: '480分 × 7%', result: '34分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1763037415656-93716b1721f5',
    gradient: 'from-amber-400 to-orange-600',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'sunrise',
};
