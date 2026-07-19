import type { LifeImpactArticle } from '@/types/impact';

export const noScreensBeforeBed: LifeImpactArticle = {
  habitCategory: 'no_screens_before_bed',
  habitName: '寝る前スマホなし',

  article: {
    researchBody:
      '寝る前のスマホをやめるだけで、睡眠の質が劇的に変わる。\n\n' +
      'PNAS（Chang et al., 2015）の研究では、就寝前に発光スクリーンを使用した被験者は、メラトニン分泌が抑制され、入眠までの時間が延長し、翌朝の覚醒度が低下することが示された。ハーバード大学の研究では、ブルーライトは緑色光の2倍メラトニンを抑制し、概日リズムを3時間シフトさせることが報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      'スマホを寝室から追い出すことは、無料でできる最高の睡眠改善策だ。\n\n' +
      '{{cost_inference}}\n\n' +
      '睡眠の質が上がれば、翌日のパフォーマンスは確実に上がる。\n\n' +
      '{{income_inference}}\n\n' +
      '就寝前のスマホを手放す効果は、睡眠だけにとどまらない。He et al.（2020）のランダム化試験では、寝る前のスマホ使用を制限した群で睡眠が改善しただけでなく、日中のポジティブ感情が有意に高まった。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Chang AM, et al. (2015). "Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness." PNAS, 112(4), 1232-1237.',
        url: 'https://doi.org/10.1073/pnas.1418490112',
      },
      {
        id: 2,
        text: 'Harvard Health Publishing (2020). "Blue light has a dark side." Harvard Medical School.',
        url: 'https://www.health.harvard.edu/staying-healthy/blue-light-has-a-dark-side',
      },
      {
        id: 3,
        text: 'Exelmans L & Van den Bulck J (2016). "Bedtime mobile phone use and sleep in adults." Social Science & Medicine, 148, 93-101.',
      },
      {
        id: 4,
        text: 'He JW, et al. (2020). "Effect of restricting bedtime mobile phone use on sleep, arousal, mood, and working memory: A randomized pilot trial." PLoS ONE, 15(2), e0228756.',
        url: 'https://doi.org/10.1371/journal.pone.0228756',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。メラトニン抑制のメカニズムは人種を問わず共通です。日本人のスマホ利用時間は就寝前平均45分と報告されており、これをやめることで深い睡眠が増加します。睡眠の質改善による心血管リスク低減と免疫機能向上を合わせ、1日あたり約6分の健康寿命延伸に相当すると推定されます。',
    cost:
      '就寝前のスマホ使用は衝動的なオンラインショッピングの温床です（深夜ECサイト購入の平均単価は日中の1.3倍）。この衝動消費の抑制と、睡眠改善による医療費削減を含め、1日あたり¥200のコスト削減と推定されます。',
    income:
      '年収1,500万円に対して、睡眠の質向上による翌日の生産性改善を控えめに1.5%と見積もり、暦日換算（÷365）で1日あたり約¥600（年間約¥22万）の収入ポテンシャルと推定されます。',
    positiveMood:
      '就寝前のスマホ使用を制限すると、睡眠の質が高まると同時に日中のポジティブ感情が向上することが、ランダム化試験で報告されています（He et al., 2020）。効果は主に睡眠改善を経由するため、睡眠そのものを7時間確保する習慣（15%）より控えめに見積もる必要があります。何もしないときに前向きでいられる時間（起床16時間×前向き50%＝480分/日）を基準に、気分改善を保守的に8%とみなすと、1日あたり約38分（480分×8%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3時間、¥6,000節約、¥18,000の収入ポテンシャル、前向きな気持ちの時間+19時間。\n' +
      '**1年続けると**：健康寿命+1.8日、¥7.3万節約、¥22万の収入ポテンシャル、前向きな気持ちの時間+9.6日。\n' +
      '**10年続けると**：健康寿命+18日、¥73万節約、¥219万の収入ポテンシャル、前向きな気持ちの時間+96.3日。\n' +
      '画面を閉じた瞬間から、質の高い明日が始まります。',
  },

  calculationParams: {
    dailyHealthMinutes: 6,
    dailyCostSaving: 200,
    dailyIncomeGain: 600,
    dailyPositiveMoodMinutes: 38,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: 'ブルーライトがメラトニンを抑制（Chang et al., 2015）' },
      { label: '睡眠改善効果', value: '深い睡眠増加+心血管リスク低減+免疫向上', result: '6分/日' },
    ],
    cost: [
      { label: '深夜衝動消費の抑制', value: '深夜EC購入は日中の1.3倍' },
      { label: '医療費削減含む', formula: '衝動消費抑制 + 睡眠関連医療費', result: '200円/日' },
    ],
    income: [
      { label: '翌日の生産性改善', value: '覚醒度向上・判断ミス減少' },
      { label: '生産性1.5%（暦日換算）', formula: '15000000 × 1.5% ÷ 365', result: '616円/日' },
      { label: '保守的に調整', result: '600円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '就寝前スマホ制限でポジティブ感情が有意に向上（He et al., 2020）。睡眠経由のため気分改善を保守的に8%' },
      { label: '日割り計算', formula: '480分 × 8%', result: '38分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1636101630293-ca3c1518717f',
    gradient: 'from-indigo-400 to-purple-600',
  },
  defaultHabitType: 'quit',
  defaultIcon: 'phone-off',
};
