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
 *   → ¥1000/day (15,000,000 × 2.5% ÷ 365)
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
      'スケジュールを守れる人が得るのは、成果や健康だけではない。自己制御力の高い人ほど、日々の動機づけの葛藤や情緒的な苦痛が少なく、幸福感が高いことも分かっている（Hofmann et al., 2014）。\n\n' +
      '{{positive_mood_inference}}\n\n' +
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
      {
        id: 6,
        text: 'Hofmann W, Luhmann M, Fisher RR, Vohs KD, Baumeister RF (2014). "Yes, But Are They Happy? Effects of Trait Self-Control on Affective Well-Being and Life Satisfaction." Journal of Personality, 82(4), 265-277.',
        url: 'https://doi.org/10.1111/jopy.12050',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。Kern & Friedmanの研究は主に米国の長期コホートを対象としていますが、誠実性と健康の関連は文化横断的に確認されています。42歳は生活習慣病のリスクが高まる年代であり、「もう10分だけ」という小さな逸脱が睡眠時間の侵食、運動の先延ばし、食事の乱れに連鎖します。Siroisらの研究が示すように、慢性的な先延ばしはコルチゾール上昇を通じて健康を蝕みます。誠実性による寿命延長効果（2〜4年）のうち、スケジュール遵守が寄与する部分を控えめに見積もり、残存寿命40年ベースで1日あたり約5分の健康寿命延伸と推定されます。',
    cost:
      '年収1,500万円の生活水準では、先延ばしによるコストは目に見えにくいが確実に発生します。朝のスケジュールを崩すと、タクシー代の増加（電車に間に合わない）、締切間際の割増料金、計画外の外食費、衝動買いなどが積み重なります。Sirois & Pychylが示す「感情調節の失敗→衝動的支出」のメカニズムを考慮し、1日あたり¥400のコスト削減効果と推定します。',
    income:
      '年収1,500万円に対して、Barrick & Mountのメタ分析が示す誠実性と業績の相関（r=.22-.23）は非常に強力です。スケジュール遵守は誠実性の行動面での発現であり、実行意図の効果（d=0.65）とも整合します。朝決めたスケジュール通りに動くことで、最も生産性の高い午前中の時間を最大活用でき、タスク切替のロスも減少します。保守的に年収の約2.5%の生産性向上と推定すると、¥15,000,000 × 2.5% ÷ 365 ≒ ¥1,000/日の収入ポテンシャルに相当します。',
    positiveMood:
      '自己制御力（トレイト・セルフコントロール）が高い人ほど、動機づけの葛藤や情緒的な苦痛が少なく、その結果として日々の感情的ウェルビーイングと生活満足度が高いことが3つの研究で示されています（Hofmann et al., 2014）。スケジュール遵守はこの自己制御力の行動面での発現であり、先延ばしによる短期的な気分の乱れ（Sirois & Pychyl, 2013）を防ぎます。何もしないときに前向きでいられる時間（起床16時間のうち約50%＝480分）を基準に、葛藤・ストレス低減による気分改善効果を保守的に6%とみなすと、1日あたり約29分（480分×6%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥12,000節約、¥30,000の収入ポテンシャル、前向きな気持ちの時間+15時間。\n' +
      '**1年続けると**：健康寿命+30時間、¥14.6万節約、¥36.5万の収入ポテンシャル、前向きな気持ちの時間+7.4日。\n' +
      '**10年続けると**：健康寿命+12.7日、¥146万節約、¥365万の収入ポテンシャル、前向きな気持ちの時間+73.5日。\n' +
      '「もう10分だけ」を断ち切るだけで、10年後には健康寿命が約2週間延び、500万円以上の経済効果が生まれます。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 400,
    dailyIncomeGain: 1000,
    dailyPositiveMoodMinutes: 29,
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
      { label: '基準年収', value: '年収1500万円', result: '15000000円/年' },
      { label: '研究結果', value: '誠実性→業績予測因子 r=.22-.23（Barrick & Mount, 1991）' },
      { label: '生産性向上（暦日換算）', formula: '15000000 × 2.5% ÷ 365', result: '1000円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '自己制御力が高いほど葛藤・情緒的苦痛が少なく感情的ウェルビーイングが高い（Hofmann et al., 2014）／先延ばしは短期的な気分の乱れを招く（Sirois & Pychyl, 2013）。気分改善を保守的に6%' },
      { label: '日割り計算', formula: '480分 × 6%', result: '29分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b',
    gradient: 'from-blue-400 to-slate-600',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'clipboard-list',
};
