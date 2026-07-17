import type { LifeImpactArticle } from '@/types/impact';

/**
 * 深呼吸・呼吸法 — Life Impact Article
 *
 * Research basis:
 * - PositiveMood(主効果): Balban(2023, Cell Reports Medicine, RCT n=114) 1日5分の呼吸法で
 *   ポジティブ感情+26%・不安-17%、瞑想より効果大 / Fincham(2023, Sci Rep, 12RCT) ストレスg=-0.35。
 *   480分ベースライン × 保守的12.5%（瞑想96分を超えない）で 60分/日
 * - Health(副次): Chaddha(2019, slow breathingメタ解析) 収縮期血圧 -5.6mmHg。瞑想パリティで 4分/日に抑制
 * - Income(副次): ストレス低減→生産性 +0.5% で 310円/日 / Cost: 根拠なし 0
 * - 既存 daily_meditation（mood96/health4）と重複するため全KPIを瞑想同等以下に抑制
 */
export const breathingExercise: LifeImpactArticle = {
  habitCategory: 'breathing_exercise',
  habitName: '深呼吸・呼吸法',

  article: {
    researchBody:
      'たった5分、息を吐く時間を少し長くするだけで、その日の気分は測定できるほど変わる。\n\n' +
      'スタンフォード大学の研究チームが2023年に行ったランダム化比較試験（Balban et al., Cell Reports Medicine）は、114人を対象に「1日5分の呼吸法」を28日間続けてもらい、マインドフルネス瞑想と比較した。特に効果が大きかったのは、吐く息をゆっくり長くする呼吸法だ。ポジティブな感情は26%増え、不安は17%下がり、呼吸数は22%低下した。しかもこの変化は、初回のたった5分でも測定でき、毎日続けるほど大きくなっていった。瞑想よりも気分の改善と呼吸の落ち着きが有意に大きかった点も注目に値する。\n\n' +
      'この効果は一つの研究に留まらない。12件のRCT・785人をまとめたメタ解析（Fincham et al., 2023, Scientific Reports）では、呼吸法を実践した人はストレスが有意に低く（効果量 g=-0.35）、不安（g=-0.32）や抑うつ（g=-0.40）も同様に改善していた。ゆっくりした呼吸が心を落ち着けるのは、気のせいではなく、複数の試験が一貫して示す再現性のある効果だ。\n\n' +
      '体への影響も見逃せない。ゆっくりした呼吸を扱った研究のメタ解析（Chaddha et al., 2019, Complementary Therapies in Medicine）では、収縮期血圧が平均5.6 mmHg、拡張期血圧が3.0 mmHg下がった。この程度の血圧低下でも、長く続ければ心血管の負担を確実に軽くする。薬を使う前に試せる、副作用のない選択肢として、低リスクの高血圧・前高血圧の人にも勧められている。\n\n' +
      '{{health_inference}}\n\n' +
      '心が落ち着けば、日中の集中力にも小さく返ってくる。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Balban MY, Neri E, Kogon MM, et al. (2023). "Brief structured respiration practices enhance mood and reduce physiological arousal." Cell Reports Medicine, 4(1), 100895. 1日5分×28日のRCT n=114、ポジティブ感情+26%・不安-17%、瞑想より効果大。',
        url: 'https://doi.org/10.1016/j.xcrm.2022.100895',
      },
      {
        id: 2,
        text: 'Fincham GW, Strauss C, Montero-Marin J, Cavanagh K. (2023). "Effect of breathwork on stress and mental health: A meta-analysis of randomised-controlled trials." Scientific Reports, 13, 432. 12RCT・785名、ストレス g=-0.35・不安 g=-0.32・抑うつ g=-0.40。',
        url: 'https://doi.org/10.1038/s41598-022-27247-y',
      },
      {
        id: 3,
        text: 'Chaddha A, Modaff D, Hooper-Lane C, Feldstein DA. (2019). "Device and non-device-guided slow breathing to reduce blood pressure: A systematic review and meta-analysis." Complementary Therapies in Medicine, 45, 179-184. 収縮期血圧 -5.62 mmHg・拡張期 -2.97 mmHg。',
        url: 'https://doi.org/10.1016/j.ctim.2019.03.005',
      },
      {
        id: 4,
        text: 'Goessl VC, Curtiss JE, Hofmann SG. (2017). "The effect of heart rate variability biofeedback training on stress and anxiety: a meta-analysis." Psychological Medicine, 47(15), 2578-2586. 24研究・484名、ストレス・不安が大きく改善（Hedges g=0.83）。',
        url: 'https://doi.org/10.1017/S0033291717001003',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。ゆっくりした呼吸による血圧低下（収縮期 約5.6 mmHg）は生理機構ベースの効果で、人種依存が小さく日本人にも当てはまると考えられます。約5 mmHgの収縮期血圧低下は心血管イベントのリスクをわずかに下げますが、この効果は瞑想（daily_meditation）と生理的に重なります。二重計上を避けるため、血圧のエビデンス単体なら6〜18分相当まで正当化できるところを、瞑想の健康効果（4分/日）に合わせて上限を設定し、1日あたり約4分の健康寿命延伸と控えめに推定します。',
    cost:
      '深呼吸・呼吸法に直接の費用削減エビデンスはないため、コストへの効果は0としています。',
    income:
      '年収1,500万円（日給換算¥62,500）に対して、呼吸法によるストレス低減（Fincham 2023, g=-0.35）が日中の集中力・生産性を間接的にわずかに高めます。純粋な生産性向上を保守的に0.5%（1%未満）と見積もると、1日あたり¥310の収入ポテンシャルと推定します。効果の一部は瞑想と重なるため、控えめな値にしています。',
    positiveMood:
      'スタンフォード大学のRCT（Balban et al., 2023）では、1日5分の呼吸法でポジティブな感情が26%増え、不安が17%下がりました。何もしないときに前向きでいられる時間（起床16時間×前向き50%＝480分/日）を基準に、この気分改善を保守的に12.5%とみなすと、1日あたり約60分（480分×12.5%）、前向きな気持ちで過ごせる時間が増えると推定されます。5分という低負荷を踏まえ、瞑想（96分/日）を超えない水準に抑えています。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2時間、¥9,300の収入増。\n' +
      '**1年続けると**：健康寿命+1日、¥11.3万の収入増。\n' +
      '**10年続けると**：健康寿命+10日、¥113万の収入増。\n' +
      '1日5分、静かに息を整える時間が、心と体の両方に効いていきます。',
  },

  calculationParams: {
    dailyHealthMinutes: 4,
    dailyCostSaving: 0,
    dailyIncomeGain: 310,
    dailyPositiveMoodMinutes: 60,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: 'slow breathingで収縮期血圧 -5.6 mmHg（Chaddha 2019）' },
      { label: '瞑想パリティで抑制', value: '瞑想と機序が重複するため健康効果を瞑想（4分/日）に合わせて上限設定', result: '4分/日' },
    ],
    cost: [
      { label: '直接エビデンスなし', value: '呼吸法に直接の費用削減の定量的根拠はない', result: '0円/日' },
    ],
    income: [
      { label: 'ストレス低減→生産性', value: 'ストレス g=-0.35（Fincham 2023）→集中力を間接的に改善' },
      { label: '保守的に0.5%', formula: '62500 × 0.5%', result: '310円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '1日5分の呼吸法でポジティブ感情+26%・不安-17%（Balban 2023, RCT n=114）' },
      { label: '保守化', value: '低負荷を踏まえ瞑想(96分)を超えない12.5%を適用' },
      { label: '日割り計算', formula: '480分 × 12.5%', result: '60分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1677741447380-ede69fb0046f',
    gradient: 'from-sky-300 to-indigo-500',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'wind',
};
