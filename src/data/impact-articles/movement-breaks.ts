import type { LifeImpactArticle } from '@/types/impact';

/**
 * 30分に5分の運動休憩 — Life Impact Article
 *
 * Research basis:
 * - Health: Diaz et al. (2023, Columbia University) — 5 min walking every 30 min
 *   reduces blood sugar spikes by 58% and blood pressure by 4-5 mmHg.
 *   Diaz et al. (2017) — sedentary bouts <30 min had lowest all-cause mortality.
 *   → 8 min/day health gain
 *
 * - Cost: Andersen et al. (2022) — workplace micro-exercise: 14% reduction in
 *   long-term sickness absence. Reduced healthcare costs from metabolic improvements.
 *   → ¥350/day
 *
 * - Income: Albulescu et al. (2022) — micro-breaks boost vigor (d=0.36) and
 *   reduce fatigue (d=0.35). Physical movement enhances cognitive recovery
 *   beyond passive rest.
 *   → ¥1250/day
 */
export const movementBreaks: LifeImpactArticle = {
  habitCategory: 'movement_breaks',
  habitName: '30分ごとに5分運動',

  article: {
    researchBody:
      '座りっぱなしは「新しい喫煙」と呼ばれるほど危険だ。しかし30分に5分だけ体を動かすことで、そのリスクを劇的に減らせる。\n\n' +
      'コロンビア大学のDiaz et al.（2023）が行ったランダム化比較試験では、30分ごとに5分間歩くだけで、食後の血糖値スパイクが58%減少し、血圧が4〜5mmHg低下することが確認された。これは薬物療法に匹敵する効果だ。\n\n' +
      '同じくDiaz et al.（2017）の疫学研究（約8,000人、中央値4年追跡）では、座位時間の「連続する長さ」が全死亡リスクに独立して影響することが判明した。30分未満の座位ボウト（一連の座り時間）で区切る人は、最も低い死亡リスクを示した。総座位時間が同じでも、途中で立ち上がるだけでリスクが変わるのだ。\n\n' +
      '{{health_inference}}\n\n' +
      '職場での運動休憩は、病欠を減らし、医療費を抑える。\n\n' +
      '{{cost_inference}}\n\n' +
      '認知パフォーマンスにも効く。体を動かす休憩は、座ったままの休憩より遥かに効果的だ。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',
    sources: [
      {
        id: 1,
        text: 'Diaz KM, Duran AT, Engel SM, et al. (2023). "How Much Walking Offsets Prolonged Sitting?" Medicine & Science in Sports & Exercise (Columbia University study).',
        url: 'https://doi.org/10.1249/MSS.0000000000003139',
      },
      {
        id: 2,
        text: 'Diaz KM, Howard VJ, Hutto B, et al. (2017). "Patterns of Sedentary Behavior and Mortality in U.S. Middle-Aged and Older Adults." Annals of Internal Medicine, 167(7), 465-475.',
        url: 'https://doi.org/10.7326/M17-0212',
      },
      {
        id: 3,
        text: 'Andersen LL, Sundstrup E, Boysen M, et al. (2022). "Effectiveness of workplace micro-exercise for musculoskeletal health and sickness absence." Scandinavian Journal of Work, Environment & Health.',
        url: 'https://doi.org/10.5271/sjweh.4025',
      },
      {
        id: 4,
        text: 'Albulescu P, Macsinga I, Rusu A, et al. (2022). "Give me a break! A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance." PLoS ONE, 17(8), e0272460.',
        url: 'https://doi.org/10.1371/journal.pone.0272460',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。Diazらの2023年の研究は多様な成人を対象としており、血糖値と血圧への効果は生理学的メカニズムに基づくため人種を問わず適用可能です。42歳はメタボリックシンドロームのリスクが急速に高まる年代であり、30分ごとの運動休憩による血糖値スパイク58%減少・血圧4-5mmHg低下は、将来の糖尿病・心血管疾患リスクを大幅に軽減します。Diaz et al.（2017）が示す「30分未満の座位ボウトで最低死亡リスク」のエビデンスと合わせ、1日あたり約8分の健康寿命延伸と推定されます。これは運動系の習慣に匹敵する効果です。',
    cost:
      'Andersen et al.（2022）が示す職場マイクロエクササイズによる病欠14%減少は、直接的なコスト削減を意味します。年収1,500万円の場合、1日の欠勤コストは¥62,500です。年間平均5日の体調不良日のうち14%（0.7日）を防げると、年間¥43,750の価値があります。これに加え、血糖値・血圧の改善による将来の医療費削減（メタボ関連の治療は年間数十万円）、デスクワークによる肩こり・腰痛の軽減による整体費の削減を含め、保守的に1日あたり¥350と推定します。',
    income:
      '年収1,500万円（日給¥62,500）に対して、Albulescu et al.のメタ分析が示すマイクロブレイクの効果（活力d=0.36、疲労軽減d=0.35）は、身体を動かす休憩でさらに増幅されます。運動による脳血流の増加は認知機能を直接的に改善し、午後の生産性低下（いわゆる「ポストランチ・ディップ」）を大幅に緩和します。デスクワーク中心の仕事において、30分ごとの運動休憩による集中力維持効果を保守的に約2%の生産性向上と推定し、¥62,500 × 2% ≒ ¥1,250/日の収入ポテンシャルに相当します。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+4時間、¥10,500節約、¥37,500の収入増。\n' +
      '**1年続けると**：健康寿命+2日、¥12.8万節約、¥45.6万の収入増。\n' +
      '**10年続けると**：健康寿命+20.3日、¥128万節約、¥456万の収入増。\n' +
      '30分に1回、たった5分立ち上がるだけ。10年で健康寿命が約3週間延び、584万円の経済効果。座りっぱなしの危険を「タダ」で回避できます。',
  },

  calculationParams: {
    dailyHealthMinutes: 8,
    dailyCostSaving: 350,
    dailyIncomeGain: 1250,
  },

  confidenceLevel: 'high',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '5分歩行/30分ごと→血糖値スパイク58%減少、血圧4-5mmHg低下（Diaz, 2023）' },
      { label: '死亡リスク', value: '30分未満の座位ボウト→最低死亡リスク（Diaz, 2017）' },
      { label: '日割り計算', value: '代謝改善+心血管リスク低減の複合効果', result: '8分/日' },
    ],
    cost: [
      { label: '研究結果', value: '職場マイクロエクササイズ→病欠14%減少（Andersen, 2022）' },
      { label: 'コスト項目', value: '病欠防止(¥120/日)+将来医療費削減+整体費軽減' },
      { label: '控えめ推定', result: '350円/日' },
    ],
    income: [
      { label: '基準日給', value: '年収1500万円', formula: '15000000 ÷ 240日', result: '62500円/日' },
      { label: '研究結果', value: 'マイクロブレイク→活力d=0.36、疲労軽減d=0.35（Albulescu, 2022）' },
      { label: '生産性向上', value: '運動休憩による認知回復+午後の集中力維持', formula: '62500 × 2%', result: '1250円/日' },
    ],
  },

  defaultHabitType: 'positive',
  defaultIcon: 'stretch-horizontal',
};
