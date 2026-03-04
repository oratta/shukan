import type { LifeImpactArticle } from '@/types/impact';

// Research sources:
// - Newport C (2016) "Deep Work: Rules for Focused Success"
// - Mark G, et al. (2008) CHI: The cost of interrupted work
// - McKinsey (2012): Knowledge worker productivity

export const deepWork: LifeImpactArticle = {
  habitCategory: 'deep_work',
  habitName: 'ディープワーク',

  article: {
    researchBody:
      '集中力は、21世紀の最も希少で価値ある資産だ。\n\n' +
      'ジョージタウン大学のCal Newport教授の研究によると、知識労働者は平均して週の60%以上をメール・チャット・会議などの「シャローワーク」に費やしている（McKinsey, 2012）。カリフォルニア大学の研究（Mark et al., 2008）では、中断後に元のタスクに戻るまで平均23分15秒かかることが示された。一方、3-4時間の集中した「ディープワーク」を毎日実践できれば、質の高いアウトプットを劇的に増やせる。\n\n' +
      '{{health_inference}}\n\n' +
      'ディープワークの実践に必要なコストはゼロだ。\n\n' +
      '{{cost_inference}}\n\n' +
      '「集中する能力が希少になるほど、その価値は高まる」とNewport教授は述べている。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Newport C (2016). "Deep Work: Rules for Focused Success in a Distracted World." Grand Central Publishing.',
      },
      {
        id: 2,
        text: 'Mark G, et al. (2008). "The Cost of Interrupted Work: More Speed and Stress." Proceedings of CHI 2008, ACM.',
        url: 'https://doi.org/10.1145/1357054.1357072',
      },
      {
        id: 3,
        text: 'McKinsey Global Institute (2012). "The social economy: Unlocking value and productivity through social technologies."',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。ディープワークの直接的な健康寿命延伸効果は限定的ですが、フロー状態（没頭）はコルチゾール低下・幸福感上昇と関連しています。Csikszentmihalyiのフロー研究では、フロー体験の多い人は生活満足度と健康状態が有意に高い。マルチタスクのストレス回避効果を含め、1日あたり約4分の健康寿命延伸に相当すると推定されます。',
    cost:
      'ディープワーク自体は無料です。しかし、集中力の向上により衝動的なオンラインショッピングやSNS消費が減少します。さらに効率的な仕事完了による残業削減（通勤費・食費の節約）を含め、1日あたり¥200のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、ディープワーク実践による生産性向上は最も直接的な収入効果を持ちます。Newportの研究では、ディープワークを実践するトップパフォーマーは平均の2-3倍のアウトプットを出すとされています。控えめに5%の生産性向上と見積もっても年間¥75万。1日あたり¥2,500の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2時間、¥6,000節約、¥75,000の収入増。\n' +
      '**1年続けると**：健康寿命+1.2日、¥7.3万節約、¥91.3万の収入増。\n' +
      '**10年続けると**：健康寿命+12日、¥73万節約、¥913万の収入増。\n' +
      '深く集中する時間が、あなたのキャリアを次のレベルに引き上げます。',
  },

  calculationParams: {
    dailyHealthMinutes: 4,
    dailyCostSaving: 200,
    dailyIncomeGain: 2500,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: 'フロー状態がコルチゾール低下・幸福感上昇と関連（Csikszentmihalyi）' },
      { label: 'ストレス回避', value: 'マルチタスクのストレス・中断コスト（23分15秒/回）の回避（Mark et al., 2008）' },
      { label: '日割り計算', value: 'フロー体験の健康効果とストレス軽減を控えめに算出', result: '4分/日' },
    ],
    cost: [
      { label: '実施コスト', value: 'ディープワーク自体は無料' },
      { label: '間接的節約', value: '衝動的オンライン消費の減少+残業削減による節約', result: '200円/日' },
    ],
    income: [
      { label: '基準日給', value: '年収1,500万円', formula: '15000000 ÷ 240日', result: '62500円/日' },
      { label: '生産性向上', value: 'トップパフォーマーは2-3倍のアウトプット（Newport）、控えめに5%', formula: '62500 × 5% ÷ 1.25', result: '2500円/日' },
    ],
  },

  defaultHabitType: 'positive',
  defaultIcon: 'target',
};
