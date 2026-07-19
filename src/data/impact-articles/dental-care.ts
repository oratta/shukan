import type { LifeImpactArticle } from '@/types/impact';

/**
 * 歯を大切にする — Life Impact Article
 *
 * Research basis:
 * - Health(主効果): Guo(2023, PLOS ONE, 39コホート440万人) 歯周病で全死因死亡 RR1.31 /
 *   de Oliveira(2010, BMJ) 歯磨き頻度低でCVD 70%増 / Peng(2019) 歯10本喪失ごと死亡RR1.15 /
 *   Takeuchi(2017, 久山町) 歯が少ないほど認知症リスク上昇。関連は強いが介入→寿命の因果は交絡を含む。
 *   正味寿命延伸0.5年→18分/日を因果不確実性で50%割引し 9分/日
 * - Cost(主効果): 日本はインプラントが自由診療(1本30-50万円)。予防で回避できる生涯歯科費を
 *   約170万円と保守見積し日割りして 110円/日
 * - Income/Mood: 直接の定量エビデンスなしのため 0（本文でも該当プレースホルダーを出さない）
 */
export const dentalCare: LifeImpactArticle = {
  habitCategory: 'dental_care',
  habitName: '歯を大切にする',

  article: {
    researchBody:
      '口の中の健康は、寿命そのものを左右する。\n\n' +
      '歯周病や歯の喪失は、単に口の問題では終わらない。約439万人を対象とした39のコホート研究の統合解析では、歯周病がある人は全死因の死亡リスクが1.31倍、重大な心血管イベントのリスクが1.24倍高いことが示されている（Guo et al., 2023, PLOS ONE）。歯を失うほどリスクは階段状に上がり、15の前向き研究をまとめた用量反応解析では、歯を10本失うごとに全死因死亡リスクが15%ずつ増加していった（Peng et al., 2019, Bioscience Reports）。\n\n' +
      '毎日の歯磨きの有無は、この差に直結する。スコットランドの代表サンプル約1万2千人を平均8.1年追跡した研究では、歯磨きの回数が少ない人は1日2回磨く人に比べ、心血管疾患を発症するリスクが70%高かった。同時に、炎症の指標であるCRPやフィブリノゲンの値も高く、口の中の炎症が全身に波及する経路が示唆されている（de Oliveira et al., 2010, BMJ）。\n\n' +
      '日本人にとっては、健康寿命への影響も見逃せない。福岡県久山町の60歳以上1,566人を5年間追った研究では、残っている歯が少ない人ほど認知症、とくに血管性認知症を発症しやすいことが確認された（Takeuchi et al., 2017, 久山町研究）。「80歳で20本の歯を残す」ことを目指す8020運動の背景には、こうした積み重なったエビデンスがある。\n\n' +
      '{{health_inference}}\n\n' +
      '歯を守ることは、将来の治療費を守ることでもある。とくに日本では、失った歯を補うインプラントが保険のきかない自由診療で、1本あたり30〜50万円かかる。毎日のケアで虫歯・歯周病を防ぐことは、そのまま大きな出費の回避になる。\n\n' +
      '{{cost_inference}}\n\n' +
      'さらに、歯の健康は体や財布だけでなく、笑顔を見せることへの自信や自尊感情を通じて、日々の気分にも静かに効いてくる。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Guo X, Li X, Liao C, Feng X, He T. (2023). "Periodontal disease and subsequent risk of cardiovascular outcome and all-cause mortality: A meta-analysis of prospective studies." PLOS ONE, 18(9), e0290545. 39コホート・約439万人、歯周病で全死因死亡 RR 1.31・MACE RR 1.24。',
        url: 'https://doi.org/10.1371/journal.pone.0290545',
      },
      {
        id: 2,
        text: 'de Oliveira C, Watt R, Hamer M. (2010). "Toothbrushing, inflammation, and risk of cardiovascular disease: results from Scottish Health Survey." BMJ, 340, c2451. 約1.2万人・平均8.1年追跡、歯磨き頻度低下でCVDリスク70%増（HR 1.70）。',
        url: 'https://doi.org/10.1136/bmj.c2451',
      },
      {
        id: 3,
        text: 'Peng J, Song J, Han J, et al. (2019). "The relationship between tooth loss and mortality from all causes, cardiovascular diseases, and coronary heart disease in the general population: systematic review and dose-response meta-analysis of prospective cohort studies." Bioscience Reports, 39(1), BSR20181773. 歯10本喪失ごと全死因死亡 RR 1.15。',
        url: 'https://doi.org/10.1042/BSR20181773',
      },
      {
        id: 4,
        text: 'Takeuchi K, et al. (2017). "Tooth Loss and Risk of Dementia in the Community: the Hisayama Study." Journal of the American Geriatrics Society, 65(5), e95-e100. 日本人60歳以上1,566人・5年追跡、残存歯が少ないほど認知症リスク上昇。',
        url: 'https://doi.org/10.1111/jgs.14791',
      },
      {
        id: 5,
        text: 'Worthington HV, et al. (2019). "Home use of interdental cleaning devices, in addition to toothbrushing, for preventing and controlling periodontal diseases and dental caries." Cochrane Database of Systematic Reviews, 4, CD012018. 歯間清掃の付加で歯肉炎が減少（低〜中確度）。',
        url: 'https://doi.org/10.1002/14651858.CD012018.pub2',
      },
      {
        id: 6,
        text: 'Alimoradi Z, Jafari E, Roshandel Z, et al. (2024). "Meta-analysis with systematic review to synthesize associations between oral health related quality of life and anxiety and depression." BDJ Open, 10, 9. 15研究・14,419名、口腔健康関連QOLの低下と抑うつが有意に関連（Fisher\'s z=0.26、弱い関連）。',
        url: 'https://doi.org/10.1038/s41405-024-00191-x',
      },
      {
        id: 7,
        text: 'Gerritsen AE, Allen PF, Witter DJ, et al. (2010). "Tooth loss and oral health-related quality of life: a systematic review and meta-analysis." Health and Quality of Life Outcomes, 8, 126. 35研究、歯の喪失（特に前歯）が生活の質の低下と一貫して関連。',
        url: 'https://doi.org/10.1186/1477-7525-8-126',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。歯周病・歯の喪失と心血管疾患・全死因死亡・認知症の関連は、数百万人規模の複数のメタ解析で一貫して示され、久山町研究のような日本人の前向きコホートでも裏付けられています。ただし「毎日の歯磨き＋歯間ケア」から寿命への影響は観察研究に依存しており、喫煙・食生活など生活習慣全般との交絡を完全には切り離せません。そこで、毎日のケアによる正味の寿命延伸を控えめに0.5年と見積もり、残り余命40年で日割りした約18分/日から、因果の不確実性を踏まえてさらに50%割り引き、1日あたり約9分の健康寿命延伸と推定します。フロス単独の歯周炎予防効果はエビデンスが弱い（Cochrane 2019）ため、歯磨きと歯間ケアを合わせた「口を清潔に保つ習慣」全体として捉えた値です。',
    cost:
      '日本の歯科治療は3割の自己負担ですが、失った歯を補うインプラントは自由診療で1本30〜50万円かかります。予防によって回避できる生涯の歯科費用を、将来のインプラント2本分（約80万円）と、歯周病・虫歯治療の自己負担分の40年累計（約90万円）を合わせて約170万円と保守的に見積もると、残り余命40年で日割りして1日あたり¥110のコスト削減と推定します。',
    income:
      '毎日の歯磨き・歯間ケアが所得を直接増やすとする信頼できる定量エビデンスは無いため、収入への効果は0としています。',
    positiveMood:
      'あなたは42歳の日本人男性です。1日の起床時間16時間のうち前向きな気持ちで過ごせる時間を約50%（480分）と仮定します。15件の研究・14,419名を統合したメタ分析（Alimoradi et al., 2024, BDJ Open）では、口腔の健康状態から見た生活の質が低い人ほど抑うつ傾向が有意に高く、また35研究のシステマティックレビュー（Gerritsen et al., 2010）では、歯を失うことが生活の質の低下と一貫して関連し、特に人目に触れる前歯の喪失の影響が最大でした。毎日の歯磨きとフロスで歯を守ることは、笑顔や会話への自信、自尊感情という経路で前向きな時間を支えます。この記事では健康効果（9分/日）と治療費の回避（110円/日）は既に別枠で計上しているため、ここでは重複を避け、自尊感情・生活の質という気分の軸だけを、関連の強さが「弱い」と報告されていることを踏まえて保守的に4%と見積もります。歯を大切にする習慣がもたらす前向きな気持ちの時間は、1日あたり約19分（480分×4%）です。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+4.5時間、¥3,300節約、前向きな気持ちの時間+9.5時間。\n' +
      '**1年続けると**：健康寿命+2.3日、¥4万節約、前向きな気持ちの時間+4.8日。\n' +
      '**10年続けると**：健康寿命+23日、¥40万節約、前向きな気持ちの時間+48日。\n' +
      '毎日の数分の歯磨きが、40年先の心臓・頭・治療費・そして日々の気分を守ります。',
  },

  calculationParams: {
    dailyHealthMinutes: 9,
    dailyCostSaving: 110,
    dailyIncomeGain: 0,
    dailyPositiveMoodMinutes: 19,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '歯周病で全死因死亡 RR 1.31（Guo 2023）・歯磨き頻度低でCVD 70%増（de Oliveira 2010）' },
      { label: '保守的見積もり', value: '介入→寿命の因果は交絡を含むため正味の寿命延伸を0.5年に設定' },
      { label: '日割り計算', formula: '0.5年 × 525600分 ÷ 40年 ÷ 365日 ≈ 18分' },
      { label: '因果不確実性で追加割引', formula: '18分 × 50%', result: '9分/日' },
    ],
    cost: [
      { label: '回避できる歯科費', value: 'インプラント2本 約80万円＋歯周病・虫歯治療の自己負担 40年累計 約90万円' },
      { label: '日割り計算', formula: '170万 ÷ 40年 ÷ 365日 ≈ 116 → 保守的に', result: '110円/日' },
    ],
    income: [
      { label: '直接エビデンスなし', value: '歯のケアが所得を直接増やす定量的根拠はない', result: '0円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '口腔健康関連QOLの低下と抑うつが有意に関連（Alimoradi 2024, z=0.26）・歯の喪失は生活の質低下と一貫（Gerritsen 2010）。自尊感情・対人的自信の別軸のみ保守的に4%' },
      { label: '日割り計算', formula: '480分 × 4%', result: '19分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1550985543-f1ea83691cd8',
    gradient: 'from-sky-300 to-teal-500',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'smile',
};
