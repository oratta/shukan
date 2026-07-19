import type { LifeImpactArticle } from '@/types/impact';

/**
 * タンパク質をしっかり摂る — Life Impact Article
 *
 * Research basis:
 * - Health(主効果): Wang(2023, PLOS ONE, 16コホート8万人) 低骨格筋量で全死因死亡 RR1.57 /
 *   Morton(2018, BJSM, 49RCT) タンパク補給で除脂肪体重増(上限1.6g/kg/日) / 食事摂取基準2025が
 *   たんぱく質不足→フレイルを明示。既存 daily_strength/eat_vegetables に筋・栄養便益の大半を帰属させ、
 *   「毎食意識する独立行動」に健康寿命60日分のみ帰属し 6分/日
 * - Cost(副次): Weigle(2005, AJCN) 高タンパク食で自発的摂取カロリー-441kcal/日→間食削減で 25円/日
 * - Income/Mood: 直接エビデンスなし 0
 */
export const proteinIntake: LifeImpactArticle = {
  habitCategory: 'protein_intake',
  habitName: 'タンパク質をしっかり摂る',

  article: {
    researchBody:
      '筋肉は、40代からの「貯金」だ。今日のタンパク質が、20年後に自分の足で歩けるかを決める。\n\n' +
      '年齢とともに筋肉量は静かに減っていく。そして筋肉量の低下は、見た目や体力だけの問題ではない。世界16件のコホート研究（81,358名、死亡11,696件）を統合した2023年のメタ解析（Wang et al., PLOS ONE）では、骨格筋量が少ない人の全死因死亡リスクは、標準的な人の約1.57倍（95%信頼区間 1.25〜1.96）に上ることが示されている。筋肉を保つことは、寿命そのものに関わる課題だといえる。\n\n' +
      'その筋肉を守る土台がタンパク質だ。49件のランダム化比較試験（1,863名）をまとめた2018年のメタ解析（Morton et al., British Journal of Sports Medicine）では、十分なタンパク質摂取が除脂肪体重を有意に増やすこと、そして総摂取量が体重1kgあたり約1.6gに達するまで効果が積み上がることが報告されている。日本の公的指針である「食事摂取基準（2025年版）」も、たんぱく質不足を高齢期フレイルの明確なリスクとして位置づけ、摂取目標の下限を引き上げた。\n\n' +
      'さらに、タンパク質には食欲を穏やかに抑える働きもある。アメリカ臨床栄養学誌に掲載された研究（Weigle et al., 2005）では、タンパク質の割合を高めた食事にしたところ、被験者が自然に選ぶ摂取カロリーが1日あたり441kcal減り、体重が減少した。この満腹感は空腹ホルモンの変化では説明できず、タンパク質そのものの性質によるものと考えられている。\n\n' +
      '{{health_inference}}\n\n' +
      '毎食しっかりタンパク質を摂ることは、日々のだらだら食いを静かに減らすことにもつながる。\n\n' +
      '{{cost_inference}}\n\n' +
      '毎食タンパク質を意識して摂ることは、体づくりだけでなく食事全体の質を高め、気持ちの安定にもつながる。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Wang Y, Luo D, Liu J, et al. (2023). "Low skeletal muscle mass index and all-cause mortality risk in adults: A systematic review and meta-analysis of prospective cohort studies." PLOS ONE, 18(6), e0286745. 16コホート・81,358名、低骨格筋量で全死因死亡 RR 1.57。',
        url: 'https://doi.org/10.1371/journal.pone.0286745',
      },
      {
        id: 2,
        text: 'Morton RW, Murphy KT, McKellar SR, et al. (2018). "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults." British Journal of Sports Medicine, 52(6), 376-384. 49RCT・1,863名、除脂肪体重増（上限1.62 g/kg/日）。',
        url: 'https://doi.org/10.1136/bjsports-2017-097608',
      },
      {
        id: 3,
        text: 'Weigle DS, Breen PA, Matthys CC, et al. (2005). "A high-protein diet induces sustained reductions in appetite, ad libitum caloric intake, and body weight despite compensatory changes in diurnal plasma leptin and ghrelin concentrations." American Journal of Clinical Nutrition, 82(1), 41-48. 高タンパク食で自発的摂取カロリー -441 kcal/日。',
        url: 'https://doi.org/10.1093/ajcn.82.1.41',
      },
      {
        id: 4,
        text: '厚生労働省 (2024). 「日本人の食事摂取基準（2025年版）」策定検討会報告書。たんぱく質不足を高齢期フレイルのリスクとして明示し、高齢期の目標量下限を引き上げ。',
        url: 'https://www.mhlw.go.jp/stf/newpage_44138.html',
      },
      {
        id: 5,
        text: 'Lassale C, Batty GD, Baghdadli A, et al. (2019). "Healthy dietary indices and risk of depressive outcomes: a systematic review and meta-analysis of observational studies." Molecular Psychiatry, 24(7), 965-986. 健康的な食事パターンでうつ発症リスク約33%低下（地中海食 RR 0.67）。',
        url: 'https://doi.org/10.1038/s41380-018-0237-8',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。筋量と死亡リスクの関連、タンパク質補給の筋量への効果、そして日本の食事摂取基準は、いずれも複数のメタ解析や公的基準で強く支持されています。42歳は中年期で、いまからタンパク質を意識する習慣は、高齢期に筋肉量が落ち始めたときのベースラインを一段高く保つ「予防投資」にあたります。ただし、筋肉や栄養面の便益の大半は、筋トレ（daily_strength）や食事の質（eat_vegetables）といった他の習慣に帰属します。二重計上を避けるため、「毎食タンパク質を意識する」という独立した行動には、生涯で健康寿命60日分のみを保守的に割り当て、残り余命40年で日割りして1日あたり約6分の健康寿命延伸と推定します。',
    cost:
      'タンパク質の満腹感による間食削減を、控えめに見積もります。Weigleらの研究では自発的な摂取カロリーが1日441kcal減りましたが、これは減量目的の食事での結果です。「毎食意識する」レベルではこの効果は大きく弱まるため、満腹感によってコンビニの間食（約¥150）を平均6日に1回控える程度と換算し、1日あたり¥25のコスト削減と推定します。4つのKPIの中で最も軟らかい値で、自炊（home_cooking）の食費効果と重なる場合はさらに小さく見るべきです。',
    income:
      'タンパク質摂取と収入を結ぶ直接的な定量エビデンスは無いため、収入への効果は0としています。',
    positiveMood:
      'あなたは42歳の日本人男性です。起床している約16時間のうち、前向きな気持ちで過ごす時間を1日480分（16時間の50%）と保守的に見積もります。食事の質とうつリスクの疫学研究では、健康的な食事パターンを保つ人はうつの発症リスクが3割ほど低いと報告されています（Lassale et al., 2019, Molecular Psychiatry）。タンパク質をしっかり摂ることはこの「食事の質」を底上げする一因子ですが、効果を過大に見積もらないため、また満腹感による間食減や身体面の健康効果とは別軸として二重計上を避けるため、寄与はごく保守的に全体の5%と置きました。結果として、前向きな気持ちの時間は1日あたり約24分（480分×5%）増える計算になります。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+3時間、¥750節約、前向きな気持ちの時間+12時間。\n' +
      '**1年続けると**：健康寿命+1.5日、¥9,000節約、前向きな気持ちの時間+6.1日。\n' +
      '**10年続けると**：健康寿命+15日、¥9万節約、前向きな気持ちの時間+61日。\n' +
      '毎食のタンパク質が、20年後に自分の足で歩ける体と、日々の気分を静かに準備します。',
  },

  calculationParams: {
    dailyHealthMinutes: 6,
    dailyCostSaving: 25,
    dailyIncomeGain: 0,
    dailyPositiveMoodMinutes: 24,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '低骨格筋量で全死因死亡 RR 1.57（Wang 2023）・たんぱく質不足→フレイル（食事摂取基準2025）' },
      { label: '独立行動に保守的帰属', value: '筋・栄養便益の大半は筋トレ・食事の質に帰属。独立行動には健康寿命60日のみ' },
      { label: '日割り計算', formula: '60日 × 1440分 ÷ 14600日 ≈ 5.9', result: '6分/日' },
    ],
    cost: [
      { label: '満腹感による間食削減', value: '高タンパク食で摂取カロリー -441 kcal/日（Weigle 2005）を意識レベルに減衰' },
      { label: '日割り換算', formula: 'コンビニ間食 ¥150 ÷ 6日 ≈ 25', result: '25円/日' },
    ],
    income: [
      { label: '直接エビデンスなし', value: 'タンパク質摂取と所得を結ぶ定量的根拠はない', result: '0円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '健康的な食事パターンでうつ発症リスク約33%低下（Lassale 2019, 地中海食 RR 0.67）。タンパク質は食事の質を支える一因子として保守的に5%' },
      { label: '日割り計算', formula: '480分 × 5%', result: '24分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1496074620649-6b1b02e5c1c8',
    gradient: 'from-rose-300 to-amber-600',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'beef',
};
