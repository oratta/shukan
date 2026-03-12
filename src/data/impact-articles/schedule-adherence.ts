import type { LifeImpactArticle } from '@/types/impact';

/**
 * 朝決めたスケジュールを遵守する — Life Impact Article
 *
 * Research basis:
 * - Health: Kern & Friedman (2008) — conscientiousness (self-discipline) adds 2-4 years
 *   to lifespan. Moffitt et al. (2011) Dunedin study — childhood self-control predicts
 *   health, wealth, and safety outcomes at age 32. Sirois et al. (2023) — procrastination
 *   → chronic stress → health deterioration.
 *   → 5 min/day health gain
 *
 * - Cost: Procrastination leads to late fees, rushed decisions, impulse spending.
 *   Sirois & Pychyl (2013) — procrastination as emotion regulation failure increases
 *   avoidable costs. Self-discipline prevents "just 10 more minutes" snowball effect.
 *   → ¥400/day
 *
 * - Income: Barrick & Mount (1991) meta-analysis — conscientiousness is the strongest
 *   personality predictor of job performance across all occupations (r=.22-.23).
 *   Gollwitzer & Sheeran (2006) — implementation intentions have medium-to-large effect
 *   on goal attainment (d=0.65).
 *   → ¥1560/day
 */
export const scheduleAdherence: LifeImpactArticle = {
  habitCategory: 'schedule_adherence',
  habitName: 'スケジュール遵守',

  article: {
    researchBody:
      '「もう10分だけ」が人生を蝕む。スケジュール通りに動くことは、単なる几帳面さではなく、科学的に証明された長寿と成功の基盤だ。\n\n' +
      'ニュージーランド・ダニーデンの縦断研究（Moffitt et al., 2011）では、1,000人を出生から32歳まで追跡し、幼少期の自己制御力が成人後の健康・経済状況・犯罪率を強力に予測することを発見した。自己制御力が高い人は、身体的健康・経済的安定・社会的適応のすべてにおいて優れた結果を示した。\n\n' +
      'さらにKern & Friedman（2008）のTerman研究80年間の追跡データ分析によると、誠実性（conscientiousness）は寿命を2〜4年延長する。スケジュールを守る力はこの誠実性の核心的要素だ。\n\n' +
      '{{health_inference}}\n\n' +
      '先延ばしは財布にも穴を開ける。Sirois & Pychyl（2013）は、先延ばしが感情調節の失敗であることを示し、それが遅延料金・衝動的な出費・計画外の支出につながると論じている。\n\n' +
      '{{cost_inference}}\n\n' +
      '仕事の成果にも直結する。Barrick & Mount（1991）の117研究・23,994人を対象としたメタ分析では、誠実性がすべての職種において最も強い業績予測因子であることが示された（r=.22-.23）。加えてGollwitzer & Sheeran（2006）は、「いつ・どこで・何をするか」を事前に決める実行意図（implementation intentions）が目標達成に大きな効果を持つことを確認した（d=0.65）。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',
    sources: [
      {
        id: 1,
        text: 'Moffitt TE, Arseneault L, Belsky D, et al. (2011). "A gradient of childhood self-control predicts health, wealth, and public safety." Proceedings of the National Academy of Sciences, 108(7), 2693-2698.',
        url: 'https://doi.org/10.1073/pnas.1010076108',
      },
      {
        id: 2,
        text: 'Kern ML, Friedman HS (2008). "Do conscientious individuals live longer? A quantitative review." Health Psychology, 27(5), 505-512.',
        url: 'https://doi.org/10.1037/0278-6133.27.5.505',
      },
      {
        id: 3,
        text: 'Barrick MR, Mount MK (1991). "The Big Five Personality Dimensions and Job Performance: A Meta-Analysis." Personnel Psychology, 44(1), 1-26.',
        url: 'https://doi.org/10.1111/j.1744-6570.1991.tb00688.x',
      },
      {
        id: 4,
        text: 'Gollwitzer PM, Sheeran P (2006). "Implementation intentions and goal achievement: A meta-analysis of effects and processes." Advances in Experimental Social Psychology, 38, 69-119.',
        url: 'https://doi.org/10.1016/S0065-2601(06)38002-1',
      },
      {
        id: 5,
        text: 'Sirois FM, Pychyl TA (2013). "Procrastination and the Priority of Short-Term Mood Regulation: Consequences for Future Self." Social and Personality Psychology Compass, 7(2), 115-127.',
        url: 'https://doi.org/10.1111/spc3.12011',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。Kern & Friedmanの研究は主に米国の長期コホートを対象としていますが、誠実性と健康の関連は文化横断的に確認されています。42歳は生活習慣病のリスクが高まる年代であり、「もう10分だけ」という小さな逸脱が睡眠時間の侵食、運動の先延ばし、食事の乱れに連鎖します。Siroisらの研究が示すように、慢性的な先延ばしはコルチゾール上昇を通じて健康を蝕みます。誠実性による寿命延長効果（2〜4年）のうち、スケジュール遵守が寄与する部分を控えめに見積もり、残存寿命40年ベースで1日あたり約5分の健康寿命延伸と推定されます。',
    cost:
      '年収1,500万円の生活水準では、先延ばしによるコストは目に見えにくいが確実に発生します。朝のスケジュールを崩すと、タクシー代の増加（電車に間に合わない）、締切間際の割増料金、計画外の外食費、衝動買いなどが積み重なります。Sirois & Pychylが示す「感情調節の失敗→衝動的支出」のメカニズムを考慮し、1日あたり¥400のコスト削減効果と推定します。',
    income:
      '年収1,500万円（日給¥62,500）に対して、Barrick & Mountのメタ分析が示す誠実性と業績の相関（r=.22-.23）は非常に強力です。スケジュール遵守は誠実性の行動面での発現であり、実行意図の効果（d=0.65）とも整合します。朝決めたスケジュール通りに動くことで、最も生産性の高い午前中の時間を最大活用でき、タスク切替のロスも減少します。保守的に日給の約2.5%の生産性向上と推定すると、¥62,500 × 2.5% ≒ ¥1,560/日の収入ポテンシャルに相当します。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥12,000節約、¥46,800の収入増。\n' +
      '**1年続けると**：健康寿命+30時間、¥14.6万節約、¥56.9万の収入増。\n' +
      '**10年続けると**：健康寿命+12.7日、¥146万節約、¥569万の収入増。\n' +
      '「もう10分だけ」を断ち切るだけで、10年後には健康寿命が約2週間延び、700万円以上の経済効果が生まれます。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 400,
    dailyIncomeGain: 1560,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '誠実性→寿命2〜4年延長（Kern & Friedman, 2008）' },
      { label: 'スケジュール遵守の寄与', value: '誠実性の行動的中核要素として控えめに推定' },
      { label: '日割り計算', formula: '3年 × 365日 × 24時間 × 60分 × 寄与率 ÷ 40年 ÷ 365日', result: '5分/日' },
    ],
    cost: [
      { label: '研究結果', value: '先延ばし→感情調節失敗→衝動的支出（Sirois & Pychyl, 2013）' },
      { label: 'コスト項目', value: 'タクシー代・締切割増・計画外外食・衝動買い' },
      { label: '控えめ推定', result: '400円/日' },
    ],
    income: [
      { label: '基準日給', value: '年収1500万円', formula: '15000000 ÷ 240日', result: '62500円/日' },
      { label: '研究結果', value: '誠実性→業績予測因子 r=.22-.23（Barrick & Mount, 1991）' },
      { label: '生産性向上', formula: '62500 × 2.5%', result: '1560円/日' },
    ],
  },

  defaultHabitType: 'positive',
  defaultIcon: 'clipboard-list',
};
