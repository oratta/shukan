import type { LifeImpactArticle } from '@/types/impact';

/**
 * 午後のカフェインを控える — Life Impact Article
 *
 * Research basis:
 * - 因果: Drake(2013, J Clin Sleep Med, RCT) 就寝6時間前のカフェインで総睡眠 約1時間減 /
 *   Gardiner(2023, Sleep Med Rev, 24研究メタ解析) 総睡眠 45分減・睡眠効率7%低下・コーヒーは
 *   就寝8.8時間前が安全カットオフ / Alsabri(2018) 半減期約5時間 / RAND(2017) 睡眠不足の経済損失(日本最大)
 * - 二重計上回避: sleep_7hours(health14/income2500) や no_screens_before_bed(health6) を大きく下回る保守値
 *   health 4分/日・income 500円/日。cost は午後の缶コーヒー/エナドリ購入減で 40円/日。mood は0
 */
export const limitCaffeine: LifeImpactArticle = {
  habitCategory: 'limit_caffeine',
  habitName: '午後のカフェインを控える',

  article: {
    researchBody:
      '午後3時に飲んだ1杯のコーヒーは、あなたが思うより長く体に残り、その夜の眠りを削っている。\n\n' +
      'カフェインの血漿中半減期は平均約5時間（Alsabri et al., 2018）。午後に摂ったカフェインの半分は就寝時刻になってもまだ体内で働き続け、覚醒を促すアデノシン受容体を遮断し続ける。「夕方にはもう抜けているはず」という感覚は、薬理学的には正しくない。\n\n' +
      'その影響は実測されている。健康な成人にカフェイン400mg（コーヒー2〜3杯相当）を就寝時刻の0時間前・3時間前・6時間前に投与したランダム化比較試験では、就寝6時間前に飲んだ場合でも総睡眠時間が約1時間短くなった（Drake et al., 2013）。6時間前という「余裕がある」と感じるタイミングでも、睡眠は確実に削られていた。\n\n' +
      '24の研究を統合したメタ解析はこの効果をより精密に示している。カフェイン摂取により総睡眠時間は平均45分短縮し、睡眠効率は7%低下、深い睡眠が減って浅い睡眠が増えた。この解析は、コーヒー1杯なら就寝の約8.8時間前までに飲み終えることを安全の目安として示している（Gardiner et al., 2023）。就寝が23時なら、午後2時台がひとつの境界線になる。\n\n' +
      '{{health_inference}}\n\n' +
      '午後のコーヒーやエナジードリンクを控えることは、財布にも小さく効く。\n\n' +
      '{{cost_inference}}\n\n' +
      '削られた睡眠は、翌日のパフォーマンスに跳ね返る。5か国を比較したRANDの分析では、睡眠不足が認知パフォーマンスと労働生産性を低下させ、日本はその経済損失の対GDP比率が対象国中で最も大きいと報告されている（RAND, 2017）。\n\n' +
      '{{income_inference}}\n\n' +
      'よく眠れた翌日は気分が安定しやすいことが実験研究の積み重ねで示されており、午後のカフェインを控えることはその土台を守る行動だ。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Drake C, Roehrs T, Shambroom J, Roth T. (2013). "Caffeine Effects on Sleep Taken 0, 3, or 6 Hours before Going to Bed." Journal of Clinical Sleep Medicine, 9(11), 1195-1200. 就寝6時間前のカフェイン400mgでも総睡眠が約1時間短縮。',
        url: 'https://doi.org/10.5664/jcsm.3170',
      },
      {
        id: 2,
        text: 'Gardiner C, Weakley J, Burke LM, et al. (2023). "The effect of caffeine on subsequent sleep: A systematic review and meta-analysis." Sleep Medicine Reviews, 69, 101764. 24研究、総睡眠 45分減・睡眠効率7%低下、コーヒーは就寝8.8時間前が安全カットオフ。',
        url: 'https://doi.org/10.1016/j.smrv.2023.101764',
      },
      {
        id: 3,
        text: 'Alsabri SG, Mari WO, Younes S, et al. (2018). "Kinetic and Dynamic Description of Caffeine." Journal of Caffeine and Adenosine Research, 8(3), 189-197. カフェインの血漿中半減期は平均約5時間。',
        url: 'https://doi.org/10.1089/caff.2017.0011',
      },
      {
        id: 4,
        text: 'Hafner M, Stepanek M, Taylor J, et al. (2017). "Why Sleep Matters — The Economic Costs of Insufficient Sleep: A Cross-Country Comparative Analysis." RAND Corporation, RR-1791. 睡眠不足の経済損失は日本が対GDP比で対象5か国中最大。',
        url: 'https://www.rand.org/pubs/research_reports/RR1791.html',
      },
      {
        id: 5,
        text: 'Palmer CA, Bower JL, Cho KW, et al. (2024). "Sleep loss and emotion: A systematic review and meta-analysis of over 50 years of experimental research." Psychological Bulletin, 150(4), 440-463. 154研究・N=5,717、睡眠不足はあらゆる形態でポジティブ感情を低下（SMD -0.27〜-1.14）。',
        url: 'https://doi.org/10.1037/bul0000410',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。カフェインが睡眠を妨げること自体は、質の高いRCT（Drake 2013）と24研究のメタ解析（Gardiner 2023）で確立しています。ただし「午後だけ控える」という部分的な習慣の健康効果は、睡眠の質改善を経由した間接的なもので、効果量は「摂取した日 vs しなかった日」の比較からの外挿を含みます。すでに睡眠時間そのものを扱う習慣（7時間睡眠は健康寿命+14分/日相当）と機序が重なるため、二重計上を避けて大幅に控えめにし、午後カフェインを飲む日を約半分と仮定したうえで、1日あたり約4分の健康寿命延伸と推定します。カフェイン代謝には遺伝的な個人差（CYP1A2）が大きい点も留保します。',
    cost:
      '午後に習慣的に買っている缶コーヒーやエナジードリンクを1本（約¥130）控えると仮定します。ただし、無料の職場コーヒーや水・デカフェへの置き換えも含まれるため、実際に購入を控える日を約30%と保守的に見積もると、1日あたり¥40のコスト削減と推定します。個人の購入習慣に依存する軟らかい値です。',
    income:
      '年収1,500万円（日給換算¥62,500）に対して、睡眠の質改善による翌日の集中力向上を見込みます。睡眠時間の確保そのもの（7時間睡眠は生産性+¥2,500/日相当）を基準に、本習慣は「質」の一部改善かつ午後カフェインを飲む日に限られるため、その約20%として1日あたり¥500の収入ポテンシャルと推定します。日給の約0.8%にあたる控えめな値です。',
    positiveMood:
      'あなたは42歳の日本人男性です。起きている16時間のうち前向きな気持ちで過ごせる時間を仮に50%（480分）とします。154研究・5,717人を統合したメタ解析（Palmer et al., 2024, Psychological Bulletin）では、睡眠が不足したり分断されたりした日はポジティブ感情が明確に低下する（SMD -0.27〜-1.14）ことが示されています。午後のカフェインを控えて睡眠の質を守ることは、この低下を防ぐ方向に働きます。ただし、睡眠そのものの効果は「7時間睡眠」の習慣で既に計上しているため、ここではカフェインを控えたことによる上乗せ分だけを、メタ解析の最小効果量からさらに割り引いた保守的な2.5%で見積もります。前向きな気持ちの時間の増加は、1日あたり約12分（480分×2.5%）です。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2時間、¥1,200節約、¥15,000の収入ポテンシャル、前向きな気持ちの時間+6時間。\n' +
      '**1年続けると**：健康寿命+1日、¥1.5万節約、¥18.3万の収入ポテンシャル、前向きな気持ちの時間+3日。\n' +
      '**10年続けると**：健康寿命+10日、¥15万節約、¥183万の収入ポテンシャル、前向きな気持ちの時間+30日。\n' +
      '午後の一杯を手放すことが、その夜の眠りと翌日の集中力と気分を守ります。',
  },

  calculationParams: {
    dailyHealthMinutes: 4,
    dailyCostSaving: 40,
    dailyIncomeGain: 500,
    dailyPositiveMoodMinutes: 12,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '午後カフェインで総睡眠 45分短縮・睡眠効率7%低下（Gardiner 2023）' },
      { label: '該当日を保守仮定', value: '午後カフェインを飲む日を約50%と仮定' },
      { label: '二重計上回避', formula: '7時間睡眠(14分)の約30%として按分（14 × 0.5 × 0.6）', result: '4分/日' },
    ],
    cost: [
      { label: '午後の飲料購入減', value: '缶コーヒー/エナドリ 1本 約¥130' },
      { label: '控える日を30%と仮定', formula: '130 × 0.3 ≈ 39', result: '40円/日' },
    ],
    income: [
      { label: '睡眠の質改善→翌日の生産性', value: '7時間睡眠の income アンカー ¥2,500/日を基準' },
      { label: '質の一部・該当日限定で20%', formula: '2500 × 20%', result: '500円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '睡眠不足はあらゆる形態でポジティブ感情を低下（Palmer 2024, SMD -0.27〜-1.14）。7時間睡眠(mood72)との二重計上を避け、カフェイン除去分のみ保守的に2.5%' },
      { label: '日割り計算', formula: '480分 × 2.5%', result: '12分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1643316408393-9328a1e973ed',
    gradient: 'from-amber-400 to-orange-700',
  },
  defaultHabitType: 'quit',
  defaultIcon: 'coffee',
};
