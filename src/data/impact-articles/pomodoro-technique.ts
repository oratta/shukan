import type { LifeImpactArticle } from '@/types/impact';

/**
 * ポモドロテクニック — Life Impact Article
 *
 * Research basis:
 * - Health: Structured breaks reduce mental fatigue by ~20% (Ogut et al., 2025).
 *   Albulescu et al. (2022) meta-analysis: micro-breaks improve vigor (d=0.36)
 *   and reduce fatigue (d=0.35). Regular breaks prevent burnout and chronic stress.
 *   → 3 min/day health gain
 *
 * - Cost: Reduced burnout → fewer sick days, fewer stress-related healthcare costs.
 *   Structured work prevents "always-on" mental fatigue that leads to compensatory
 *   spending (stress eating, retail therapy).
 *   → ¥300/day
 *
 * - Income: Task switching costs up to 40% of productive time (Rubinstein et al., 2001).
 *   It takes average 23 min 15 sec to refocus after interruption (Mark et al., 2008).
 *   Timeboxing ranked #1 productivity technique (HBR, 2018).
 *   → ¥2500/day
 */
export const pomodoroTechnique: LifeImpactArticle = {
  habitCategory: 'pomodoro_technique',
  habitName: 'ポモドロテクニック',

  article: {
    researchBody:
      '25分集中＋5分休憩のリズムが、脳のパフォーマンスを最大化する。ポモドロテクニックの効果は、複数の研究で裏付けられている。\n\n' +
      'Rubinstein et al.（2001）の実験研究によると、タスクの切り替え（マルチタスク）は生産時間の最大40%を浪費する。ポモドロの「25分間は1つのタスクだけ」というルールは、このスイッチングコストを劇的に削減する。さらにMark et al.（2008）の職場観察研究では、中断後に元のタスクに戻るまでに平均23分15秒かかることが判明している。\n\n' +
      '休憩の科学も重要だ。Albulescu et al.（2022）の22研究を対象としたメタ分析では、マイクロブレイク（10分以下の短い休憩）が活力を向上させ（d=0.36）、疲労を軽減する（d=0.35）ことが確認された。Harvard Business Review（2018）の生産性テクニック225件の分析でも、タイムボクシングが第1位にランクされている。\n\n' +
      '{{health_inference}}\n\n' +
      '燃え尽き症候群の予防は、財布にも優しい。\n\n' +
      '{{cost_inference}}\n\n' +
      '生産性への影響は最も顕著だ。構造化された作業リズムは、集中力の質を根本から変える。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',
    sources: [
      {
        id: 1,
        text: 'Rubinstein JS, Meyer DE, Evans JE (2001). "Executive Control of Cognitive Processes in Task Switching." Journal of Experimental Psychology: Human Perception and Performance, 27(4), 763-797.',
        url: 'https://doi.org/10.1037/0096-1523.27.4.763',
      },
      {
        id: 2,
        text: 'Mark G, Gudith D, Klocke U (2008). "The cost of interrupted work: More speed and stress." Proceedings of the SIGCHI Conference on Human Factors in Computing Systems, 107-110.',
        url: 'https://doi.org/10.1145/1357054.1357072',
      },
      {
        id: 3,
        text: 'Albulescu P, Macsinga I, Rusu A, et al. (2022). "Give me a break! A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance." PLoS ONE, 17(8), e0272460.',
        url: 'https://doi.org/10.1371/journal.pone.0272460',
      },
      {
        id: 4,
        text: 'Zarvic N, Hecker M (2018). "How timeboxing works and why it will make you more productive." Harvard Business Review.',
        url: 'https://hbr.org/2018/12/how-timeboxing-works-and-why-it-will-make-you-more-productive',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。Albulescuらのメタ分析は主に欧米のオフィスワーカーを対象としていますが、認知疲労と休憩のメカニズムは普遍的です。42歳はキャリアの中盤であり、慢性的なストレスが蓄積しやすい時期です。ポモドロテクニックによる定期的な休憩は、コルチゾール値の安定化、眼精疲労の軽減、肩こり・腰痛の予防に寄与します。Ogut et al.（2025）が示す20%の疲労軽減効果を、長期的な健康寿命への寄与に換算し、控えめに1日あたり約3分の健康寿命延伸と推定されます。',
    cost:
      '年収1,500万円の水準では、燃え尽き症候群は深刻なコストを伴います。構造化されていない長時間労働は、ストレス解消のための過剰な外食費・飲酒費、疲労からの衝動買い、体調不良による通院費につながります。ポモドロテクニックは「意図的な休憩」を組み込むことで、これらの補償的支出を抑制します。保守的に1日あたり¥300のコスト削減効果と推定します。',
    income:
      '年収1,500万円（日給¥62,500）に対して、タスク切り替えコストの削減効果は非常に大きいと考えられます。Rubinsteinらが示す「最大40%の時間浪費」のうち、ポモドロテクニックで10%を回収できると仮定すると、それだけで日給の4%に相当します。さらにMarkらの研究が示す「再集中に23分」という知見を踏まえると、中断を防ぐことの価値は計り知れません。HBRの分析でタイムボクシングが第1位にランクされていることも考慮し、保守的に約4%の生産性向上、¥62,500 × 4% ≒ ¥2,500/日の収入ポテンシャルと推定します。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+1.5時間、¥9,000節約、¥75,000の収入増。\n' +
      '**1年続けると**：健康寿命+18時間、¥10.9万節約、¥91.2万の収入増。\n' +
      '**10年続けると**：健康寿命+7.6日、¥109万節約、¥912万の収入増。\n' +
      'タイマーを25分にセットするだけで、10年で1,000万円以上の経済効果。最もコスパの良い生産性習慣の一つです。',
  },

  calculationParams: {
    dailyHealthMinutes: 3,
    dailyCostSaving: 300,
    dailyIncomeGain: 2500,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: 'マイクロブレイク→活力向上d=0.36、疲労軽減d=0.35（Albulescu et al., 2022）' },
      { label: '構造化休憩', value: '20%の疲労軽減効果（Ogut et al., 2025）' },
      { label: '日割り計算', value: '慢性ストレス軽減+眼精疲労予防の間接効果を控えめに推定', result: '3分/日' },
    ],
    cost: [
      { label: '研究結果', value: '構造化されていない長時間労働→補償的支出' },
      { label: 'コスト項目', value: 'ストレス解消支出・衝動買い・通院費の抑制' },
      { label: '控えめ推定', result: '300円/日' },
    ],
    income: [
      { label: '基準日給', value: '年収1500万円', formula: '15000000 ÷ 240日', result: '62500円/日' },
      { label: '研究結果', value: 'タスク切替で最大40%の時間浪費（Rubinstein, 2001）/ 再集中に23分（Mark, 2008）' },
      { label: '生産性向上', value: 'タイムボクシング効果を控えめに4%と推定', formula: '62500 × 4%', result: '2500円/日' },
    ],
  },

  defaultHabitType: 'positive',
  defaultIcon: 'timer',
};
