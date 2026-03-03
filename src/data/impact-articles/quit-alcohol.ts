import type { LifeImpactArticle } from '@/types/impact';

/**
 * 禁酒 — Life Impact Article
 *
 * Research basis:
 * - Health: Lancet 2018 (Wood et al.) — 600K drinkers across 83 studies,
 *   heavy drinkers (>350g/week) lose 4-5 years life expectancy at age 40,
 *   moderate drinkers (200-350g/week) lose 1-2 years.
 *   JAMA Network Open 2023 meta-analysis (107 studies, 4.8M participants)
 *   confirms no protective effect of low-volume drinking.
 *   IARC Group 1 carcinogen; Japanese ALDH2 deficiency amplifies risk.
 *   Conservative estimate for moderate drinker: 1 year over 40 remaining years
 *   → 8 min/day
 *
 * - Cost: 総務省家計調査 2024 — household average ¥3,800/month (includes non-drinkers),
 *   actual male drinker estimated ¥600/day (home drinking) + ¥200/day (dining out amortized)
 *   + alcohol-related medical cost savings (厚労省: 社会的コスト年3.7兆円)
 *   → ¥800/day
 *
 * - Income: BMJ Open systematic review (2019, 92K employees, 15 countries):
 *   77% of associations show alcohol → impaired work performance.
 *   OPM reports absenteeism 4-8x greater among alcohol abusers.
 *   Conservative 4% productivity improvement on ¥15M → ¥600K/year
 *   → ¥1,640/day
 */
export const quitAlcohol: LifeImpactArticle = {
  habitCategory: 'quit_alcohol',
  habitName: '禁酒',

  article: {
    researchBody:
      'お酒を1日やめるだけで、あなたの体は回復への道を歩み始める。\n\n' +
      '約60万人の現在飲酒者を分析したLancet誌の大規模メタ解析（Wood et al., 2018）によると、週200〜350gのアルコール摂取（ビール中瓶で週7〜12本相当）で40歳時点の平均余命が1〜2年短縮し、それ以上の飲酒量では4〜5年短縮することが明らかになった。また、JAMA Network Open（2023年）の107研究・480万人のメタ解析では、「少量飲酒の保護効果」は統計的手法の偏りによるもので、実際には飲まない人が最もリスクが低いと結論づけている。\n\n' +
      '{{health_inference}}\n\n' +
      '健康面の改善に加え、家計への効果も非常に大きい。\n\n' +
      '{{cost_inference}}\n\n' +
      'さらに、仕事のパフォーマンスにも直接的な影響がある。BMJ Open（2019年）の15カ国・9万2千人を対象としたシステマティックレビューでは、飲酒量と業務パフォーマンス低下の間に77%の研究で正の相関が確認されている。米国人事管理局（OPM）のデータでは、飲酒問題を抱える従業員の欠勤率は通常の4〜8倍に達する。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',
    sources: [
      {
        id: 1,
        text: 'Wood AM, Kaptoge S, et al. (2018). "Risk thresholds for alcohol consumption: combined analysis of individual-participant data for 599,912 current drinkers in 83 prospective studies." The Lancet, 391(10129), 1513-1523.',
        url: 'https://doi.org/10.1016/S0140-6736(18)30134-X',
      },
      {
        id: 2,
        text: 'Zhao J, Stockwell T, et al. (2023). "Association Between Daily Alcohol Intake and Risk of All-Cause Mortality: A Systematic Review and Meta-analyses." JAMA Network Open, 6(3), e236185.',
        url: 'https://doi.org/10.1001/jamanetworkopen.2023.6185',
      },
      {
        id: 3,
        text: 'Schou L, Moan IS (2019). "Association between alcohol consumption and impaired work performance (presenteeism): a systematic review." BMJ Open, 9(7), e029184.',
        url: 'https://doi.org/10.1136/bmjopen-2019-029184',
      },
      {
        id: 4,
        text: 'Inoue M, et al. (2007). "Impact of alcohol drinking on total cancer risk: data from a large-scale population-based cohort study in Japan." British Journal of Cancer, 96, 1469-1474.',
        url: 'https://doi.org/10.1038/sj.bjc.6603768',
      },
      {
        id: 5,
        text: '厚生労働省 (2013). アルコールの社会的コストに関する研究 — 年間社会的損失3兆7千億円',
      },
      {
        id: 6,
        text: '総務省統計局 (2024). 「家計調査年報（家計収支編）」— 酒類支出データ',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。Lancet研究の対象は主に高所得国の成人ですが、アルコールの発がん性メカニズムや肝臓・心血管への影響は人種を問わず共通です。むしろ日本人の約半数はアルデヒド脱水素酵素（ALDH2）が欠損しており、発がん性物質であるアセトアルデヒドが体内に蓄積しやすいため、同量の飲酒でもがんリスクはより高いとされています（Inoue et al., 2007：日本人男性の重度飲酒者のがん発症率は1.6倍）。睡眠の質の改善（中途覚醒の減少・深い睡眠の回復）、肝機能の正常化、血圧低下を総合すると、控えめに見積もって1日あたり約8分の健康寿命延伸に相当すると推定されます。',
    cost:
      '総務省の家計調査（2024年）では世帯平均の酒類支出は月約3,800円ですが、これは非飲酒者を含む平均です。実際に日常的に飲酒する42歳男性の場合、自宅での晩酌（ビール・チューハイ2〜3本：約¥400〜600/日）に加え、月2〜3回の外食・飲み会（1回¥5,000前後）を考慮すると、飲酒直接費用は1日約¥600。さらに、厚労省の推計によるアルコール関連医療費（社会全体で年間約4千億円）から個人負担分を加味すると、1日あたり¥800のコスト削減になります。',
    income:
      '年収1,500万円（日給換算¥62,500）に対して、BMJ Open（2019年）のレビューが示す飲酒によるプレゼンティーイズム（出勤しているが生産性が低下している状態）の改善と、欠勤率の低下を控えめに4%の生産性向上と見積もると、年間約¥60万の収入増に相当します。さらに、睡眠の質改善による集中力・判断力の向上、飲酒翌日の二日酔いによるパフォーマンス低下の解消を含めると、1日あたり¥1,640の収入ポテンシャルに相当すると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+4時間、¥24,000節約、¥49,200の収入増。\n' +
      '**1年続けると**：健康寿命+2日、¥29万節約、¥60万の収入増。\n' +
      '**10年続けると**：健康寿命+20日、¥292万節約、¥599万の収入増。\n' +
      'お酒をやめることは、肝臓だけでなく、あなたの時間・お金・キャリアすべてを守る最も確実な投資です。',
  },

  calculationParams: {
    dailyHealthMinutes: 8,
    dailyCostSaving: 800,
    dailyIncomeGain: 1640,
  },

  confidenceLevel: 'high',

  defaultHabitType: 'quit',
  defaultIcon: '🍺',
};
