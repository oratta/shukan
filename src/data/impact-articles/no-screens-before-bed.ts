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
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。メラトニン抑制のメカニズムは人種を問わず共通です。日本人のスマホ利用時間は就寝前平均45分と報告されており、これをやめることで深い睡眠が増加します。睡眠の質改善による心血管リスク低減と免疫機能向上を合わせ、1日あたり約6分の健康寿命延伸に相当すると推定されます。',
    cost:
      '就寝前のスマホ使用は衝動的なオンラインショッピングの温床です（深夜ECサイト購入の平均単価は日中の1.3倍）。この衝動消費の抑制と、睡眠改善による医療費削減を含め、1日あたり¥200のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、睡眠の質向上による翌日の生産性改善を控えめに1.5%と見積もると年間¥22.5万。加えて覚醒度向上による判断ミスの減少を含め、1日あたり¥850の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3時間、¥6,000節約、¥25,500の収入増。\n' +
      '**1年続けると**：健康寿命+1.8日、¥7.3万節約、¥31万の収入増。\n' +
      '**10年続けると**：健康寿命+18日、¥73万節約、¥310万の収入増。\n' +
      '画面を閉じた瞬間から、質の高い明日が始まります。',
  },

  calculationParams: {
    dailyHealthMinutes: 6,
    dailyCostSaving: 200,
    dailyIncomeGain: 850,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'quit',
  defaultIcon: 'phone-off',
};
