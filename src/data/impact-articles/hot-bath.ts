import type { LifeImpactArticle } from '@/types/impact';

/**
 * 湯船に浸かる — Life Impact Article
 *
 * Research basis:
 * - Health(主効果): Ukai T, Iso H, Yamagishi K, et al. (2020, Heart, JPHC N=30,076, 追跡20年)
 *   — ほぼ毎日入浴で総CVD 28%低下（HR 0.72）。観察研究のため寿命延伸を0.5年と保守見積し、
 *     交絡（入浴頻度の高い層の住環境等）を50%割引して 9分/日
 * - PositiveMood(主効果): Goto Y, et al. (2018, RCT, 日本人n=33) — 40℃10分入浴で疲労・ストレス・
 *   POMS 気分尺度が有意改善。480分ベースライン × 保守的3% で 14分/日
 * - Income(副次): Haghayegh(2019 睡眠メタ解析) + Goto の疲労回復 → 生産性0.8%換算で 500円/日
 * - Cost: CVDイベント回避の生涯医療費を控えめに按分し 30円/日（健康分との二重計上を避け小さく）
 */
export const hotBath: LifeImpactArticle = {
  habitCategory: 'hot_bath',
  habitName: '湯船に浸かる',

  article: {
    researchBody:
      'シャワーで済ませていた入浴を「湯船に浸かる」に変えるだけで、日本人3万人を20年追跡した研究では、心血管疾患になるリスクが28%低かった。\n\n' +
      '全国の男女30,076人（40〜59歳、心臓病・脳卒中・がんの既往なし）を1990年から2009年まで追いかけた大規模研究（Ukai et al., 2020, Heart）は、入浴頻度を「週0〜2回」「週3〜4回」「ほぼ毎日」に分けて発症を比較した。その結果、ほぼ毎日湯船に浸かる人は、週2回以下の人にくらべて心血管疾患の発症が28%少なく（ハザード比0.72）、脳卒中は26%、なかでも脳内出血は46%も低い水準だった。日本人を対象にした研究なので、私たちの生活にそのまま当てはめられる数字だ。\n\n' +
      '効いているのは温まり方だけではない。日本人高齢者13,786人を3年追跡した別の研究（Yagi et al., 2019, Journal of Epidemiology）では、週7回以上入浴する人は週2回以下の人より要介護状態になる割合が約28%低く、しかもこの差は「ほぼ毎日」で初めてはっきり現れた。週に数回では足りず、毎日の積み重ねが分かれ目になる。\n\n' +
      '{{health_inference}}\n\n' +
      '湯船は医療費の話だけで終わらない。夜の眠りにも直接効く。13件の臨床試験をまとめたメタ解析（Haghayegh et al., 2019, Sleep Medicine Reviews）によれば、就寝の1〜2時間前に40〜42.5℃のお湯に10分浸かるだけで寝つきまでの時間が大きく短縮し、睡眠の質と睡眠効率も改善した。手足の血管が広がって深部体温がすっと下がることが、質の良い眠りのスイッチになる。\n\n' +
      '{{cost_inference}}\n\n' +
      '良い睡眠と疲労回復は、翌日のパフォーマンスにそのまま返ってくる。\n\n' +
      '{{income_inference}}\n\n' +
      'そして湯船が変えるのは、体のコンディションだけではない。翌日の気分そのものにも及ぶ。日本人を対象にしたランダム化試験（Goto et al., 2018）では、2週間シャワーだけで過ごしたときにくらべ、40℃10分の入浴を続けたときのほうが疲労感が10点、ストレスが11点（いずれも100点満点のVAS）低く、緊張・抑うつ・怒りの気分尺度もそろって下がった。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Ukai T, Iso H, Yamagishi K, et al. (2020). "Habitual tub bathing and risks of incident coronary heart disease and stroke." Heart, 106(10), 732-737. JPHC N=30,076、ほぼ毎日入浴で総CVD 28%低下（HR 0.72）。',
        url: 'https://doi.org/10.1136/heartjnl-2019-315752',
      },
      {
        id: 2,
        text: 'Yagi A, Hayasaka S, Ojima T, et al. (2019). "Bathing Frequency and Onset of Functional Disability Among Japanese Older Adults: A Prospective 3-Year Cohort Study From the JAGES." Journal of Epidemiology, 29(12), 451-456. 週7回以上で要介護発症 約28%低下。',
        url: 'https://doi.org/10.2188/jea.JE20180123',
      },
      {
        id: 3,
        text: 'Haghayegh S, Khoshnevis S, Smolensky MH, et al. (2019). "Before-bedtime passive body heating by warm shower or bath to improve sleep: A systematic review and meta-analysis." Sleep Medicine Reviews, 46, 124-135. 就寝1-2時間前の入浴で入眠潜時が有意短縮。',
        url: 'https://doi.org/10.1016/j.smrv.2019.04.008',
      },
      {
        id: 4,
        text: 'Goto Y, Hayasaka S, Kurihara S, Nakamura Y. (2018). "Physical and Mental Effects of Bathing: A Randomized Intervention Study." Evidence-Based Complementary and Alternative Medicine, 2018, 9521086. 日本人RCT n=33、40℃10分入浴で疲労・ストレス・気分が有意改善。',
        url: 'https://doi.org/10.1155/2018/9521086',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。Ukai研究（JPHC）は約3万人の日本人を20年追った質の高いコホートですが、観察研究であるため「毎日入浴できる人はもともと生活に余裕があり住環境も温かい」といった交絡や逆因果を完全には排除できません。そこで、ほぼ毎日入浴による正味の寿命延伸を控えめに0.5年と見積もり、残り余命40年で日割りすると約18分/日になりますが、因果の不確実性を踏まえてさらに50%割り引き、1日あたり約9分の健康寿命延伸と推定します。冬場のヒートショック対策（脱衣所を暖める・湯温を41℃以下にする）を前提とした値です。',
    cost:
      '入浴による医療費削減は、主に心血管疾患・高血圧の発症低下という長期経路で生じます。ほぼ毎日の入浴で40年間に回避されるCVDイベントを保守的に約0.05件、1件あたりの治療費を約200万円と見積もると1日あたり約7円。これに高血圧関連の通院・服薬の回避分を加えても、健康寿命で計上済みの効果との二重計上を避けるため小さく抑え、1日あたり¥30のコスト削減と推定します。粗い下限推定です。',
    income:
      '年収1,500万円（日給換算¥62,500）に対して、入浴による睡眠の質改善（Haghayegh 2019）と疲労・ストレスの回復（Goto 2018で疲労VAS −10.2、ストレスVAS −11.5）が翌日の集中力・回復力に寄与します。これを控えめに0.8%の生産性向上と見積もると、1日あたり¥500の収入ポテンシャルと推定します。睡眠系の他習慣と機序が重なるため保守的な値にしています。',
    positiveMood:
      '日本人を対象にしたランダム化試験（Goto et al., 2018）では、シャワーのみの2週間にくらべ40℃10分の入浴を続けた2週間のほうが、ストレスVASが11.5点低く（相対約23%減）、SF-8の精神サマリーや POMS の緊張・抑うつ・怒りもそろって改善しました。何もしないときに前向きでいられる時間（起床16時間×前向き50%＝480分/日）を基準に、この気分改善を保守的に3%とみなすと、1日あたり約14分（480分×3%）、前向きな気持ちで過ごせる時間が増えると推定されます。これは心血管の健康効果とは別軸の、主観的なリラックス効果です。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+4.5時間、¥900節約、¥15,000の収入増、前向きな気持ちの時間+7時間。\n' +
      '**1年続けると**：健康寿命+2.3日、¥1.1万節約、¥18.3万の収入増、前向きな気持ちの時間+3.5日。\n' +
      '**10年続けると**：健康寿命+23日、¥11万節約、¥183万の収入増、前向きな気持ちの時間+35日。\n' +
      '毎晩10分、湯船に沈むことが、心臓と眠りと翌日の元気と気分をまとめて底上げします。',
  },

  calculationParams: {
    dailyHealthMinutes: 9,
    dailyCostSaving: 30,
    dailyIncomeGain: 500,
    dailyPositiveMoodMinutes: 14,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: 'ほぼ毎日入浴で総CVD 28%低下（Ukai et al., 2020, JPHC N=30,076・追跡20年）' },
      { label: '保守的見積もり', value: '観察研究のため正味の寿命延伸を0.5年と控えめに設定' },
      { label: '日割り計算', formula: '0.5年 × 525600分 ÷ 40年 ÷ 365日 ≈ 18分' },
      { label: '交絡で追加割引', formula: '18分 × 50%', result: '9分/日' },
    ],
    cost: [
      { label: 'CVDイベント回避', value: '40年で回避 約0.05件 × 治療費200万円' },
      { label: '日割り＋高血圧回避加味', formula: '200万 × 0.05 ÷ 14600日 ≈ 7円 → 高血圧分を足し保守的に', result: '30円/日' },
    ],
    income: [
      { label: '睡眠・疲労回復', value: '入眠潜時短縮（Haghayegh 2019）＋疲労VAS −10.2（Goto 2018）' },
      { label: '生産性0.8%換算', formula: '62500 × 0.8%', result: '500円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: 'ストレスVAS −11.5（相対約23%減）・POMS 気分尺度改善（Goto 2018, 日本人RCT）' },
      { label: '保守化', value: '主観的気分改善を保守的に3%とみなす' },
      { label: '日割り計算', formula: '480分 × 3%', result: '14分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1648475233136-e291e7bed05a',
    gradient: 'from-cyan-400 to-blue-600',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'bath',
};
