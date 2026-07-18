import type { LifeImpactArticle } from '@/types/impact';

/**
 * 発酵食品 — Life Impact Article
 *
 * Research basis:
 * - Health(主効果): Katagiri et al. (2020, BMJ, JPHC N=92,915) — 発酵性大豆食品高摂取で総死亡リスク約10%低下、
 *   納豆50g/日以上でCVD死亡リスク10%低下。ヨーグルト50g/日増でT2D 7%低下 → 保守的に 5分/日
 * - Cost: 追加食材費 -45円/日 を、心血管・糖尿病・感染症リスク低減の医療費控除 +65円/日 が上回る純額 +20円/日
 * - Income: 腸内環境改善による体調安定・欠勤減少を控えめに0.96%と見積もり 600円/日
 * - Mood(副次): プロバイオティクス/発酵食品のうつ・不安メタ分析（不一致大）を保守的に4%とみなし 20分/日
 */
export const fermentedFood: LifeImpactArticle = {
  habitCategory: 'fermented_food',
  habitName: '発酵食品',

  article: {
    researchBody:
      'たった1品の発酵食品が、あなたの腸を変える。\n\n' +
      '9.3万人を約15年追跡した国内コホート（Katagiri et al., 2020, BMJ / JPHC研究）では、納豆や味噌などの発酵性大豆食品を多く摂る群は総死亡リスクが約10%低く、納豆を50g/日以上摂る人はCVD（心血管疾患）死亡リスクが男女とも約10%低下していた。ヨーグルトも21研究のメタ分析で、50g/日増えるごとに2型糖尿病リスクが7%下がると報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      'Sonnenburg・Gardner研究室のRCT（Wastyk et al., 2022, Cell）では、発酵食品を毎日少しずつ増やすだけで腸内細菌の多様性が増え、炎症性タンパク質19種が有意に低下した。腸内環境の改善は、風邪などの感染症罹患を減らし、市販薬・受診費の節約にもつながる。\n\n' +
      '{{cost_inference}}\n\n' +
      '腸は「第二の脳」とも呼ばれる。腸内環境の安定は体調のブレを減らし、集中力の底上げにつながる。\n\n' +
      '{{income_inference}}\n\n' +
      '腸を整えることは、体調だけでなく気分にもつながる可能性がある。発酵食品やプロバイオティクスがうつや不安をやわらげるという報告もあるが、その効果には研究間のばらつきも大きい。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',
    sources: [
      {
        id: 1,
        text: 'Katagiri R, et al. (2020). "Association of soy and fermented soy product intake with total and cause specific mortality: prospective cohort study." The BMJ, 368, m34. JPHC研究、N=92,915、追跡14.8年。発酵性大豆食品高摂取で総死亡リスク低下、納豆でCVD死亡リスク約10%低下。',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31996350/',
      },
      {
        id: 2,
        text: 'Wastyk HC, Fragiadakis GK, et al. (2022). "Gut-microbiota-targeted diets modulate human immune status." Cell, 184(16), 4137-4153. RCT、N=36、10週間。発酵食品漸増群でマイクロバイオーム多様性増加、炎症性タンパク質19種が有意低下。',
        url: 'https://pubmed.ncbi.nlm.nih.gov/34256014/',
      },
      {
        id: 3,
        text: 'Meta-analysis of 21 cohort studies. "Yogurt intake and type 2 diabetes risk." ヨーグルト摂取50g/日増加あたり2型糖尿病リスク7%低下（非線形の逆相関）。',
      },
      {
        id: 4,
        text: 'Frontiers in Nutrition (2025). "A systematic review of prospective evidence linking non-alcoholic fermented food consumption with lower mortality risk." 研究間の異質性を課題として指摘。',
        url: 'https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1657100/full',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。JPHC研究は国内コホートである点で外挿の妥当性が高い一方、納豆・味噌の総死亡リスク低下は女性で有意、男性では有意な関連が確認されていない研究もあります。またSonnenburg/Gardner RCTはN=36と小規模・10週間の短期介入であり、生涯効果への外挿には注意が必要です。これらの性差と単一食品摂取の限定的効果を踏まえ、野菜摂取（13%減→10分/日）より低く保守的に見積もり、死亡・疾患リスク低減を残存寿命40年で日割りして1日あたり約5分の健康寿命延伸と推定します。',
    cost:
      '発酵食品を1品加える追加食材費は、納豆1食（約35〜40円）・ヨーグルト1食（約50〜70円）・味噌汁1杯（味噌代約10〜15円）の平均按分で約-45円/日です。一方、心血管・糖尿病リスクの低減と、腸内環境改善による感染症（風邪など）罹患の軽減で、市販薬・受診費が控除されます。ただし医療費削減の直接エビデンスは乏しく、感染症罹患軽減の効果には性差（女性で有意）もあるため純額を大きくしすぎず、医療費控除+65円/日が食材費を上回る差引で1日あたり¥20のコスト削減と推定します。',
    income:
      '年収1,500万円（日給換算¥62,500）に対して、腸内環境改善による体調のブレの減少・欠勤減少・集中力の安定を、既存記事より控えめに0.96%と見積もると、1日あたり¥600の収入ポテンシャルに相当すると推定されます。腸脳相関の機序（セロトニン・GABA産生、短鎖脂肪酸の抗炎症作用）は確立していますが、生産性への直接効果の定量エビデンスは限られるため、控えめな値にとどめました。',
    positiveMood:
      'プロバイオティクス/発酵食品のうつ・不安への効果は、小〜中の効果量を報告する研究がある一方、有意差なしとするメタ分析もあり不一致が大きく、既存の気分症状がある層でのみ明確という報告が中心です。腸脳相関の機序は確立しているものの健常層への一般化は限定的なため、何もしないときに前向きでいられる時間（起床16時間×前向き50%＝480分/日）を基準に、ジャーナリング（12%）より低い保守的な4%とみなすと、1日あたり約20分（480分×4%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥600節約、¥18,000の収入増、前向きな気持ちの時間+10時間。\n' +
      '**1年続けると**：健康寿命+1.3日、¥7,300節約、¥21.9万の収入増、前向きな気持ちの時間+5.1日。\n' +
      '**10年続けると**：健康寿命+12.7日、¥7.3万節約、¥219万の収入増、前向きな気持ちの時間+50.7日。\n' +
      '毎日の食卓に1品加えるだけで、腸内環境が整い、10年後の健康と稼ぐ力を底上げします。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 20,
    dailyIncomeGain: 600,
    dailyPositiveMoodMinutes: 20,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '発酵性大豆食品高摂取で総死亡リスク約10%低下（JPHC研究、女性で有意）。納豆50g/日以上でCVD死亡リスク10%低下' },
      { label: '追加エビデンス', value: 'ヨーグルト50g/日増でT2Dリスク7%低下（21研究メタ分析）。Sonnenburg/Gardner 2022 RCTで炎症性タンパク質19種低下' },
      { label: '日割り計算', value: '死亡・疾患リスク低減を残存寿命40年で日割りし、単一食品の限定的効果と性差を考慮し保守的に丸め', result: '5分/日' },
    ],
    cost: [
      { label: '発酵食品の追加食材費', value: '納豆1食(約35〜40円)/ヨーグルト1食(約50〜70円)/味噌汁1杯(味噌代約10〜15円)の平均按分', result: '-45円/日' },
      { label: '医療費削減', value: '心血管・糖尿病リスク低減、腸内環境改善による感染症罹患軽減の市販薬・受診費控除', result: '+65円/日' },
      { label: '合計', formula: '-45 + 65', result: '20円/日' },
    ],
    income: [
      { label: '基準日給', value: '年収1,500万円', formula: '15000000 ÷ 240日', result: '62500円/日' },
      { label: '体調安定効果', value: '腸内環境改善による欠勤減少・集中力安定を控えめに0.96%', formula: '62500 × 0.96%', result: '600円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: 'プロバイオティクス/発酵食品はうつ・不安に小〜中の効果量（メタ分析で不一致大、既存症状がある層でより明確）' },
      { label: '日割り計算', value: '観察研究中心・効果量の不確実性を踏まえ保守的に4%', formula: '480分 × 4%', result: '20分/日' },
    ],
  },

  defaultHabitType: 'positive',
  defaultIcon: 'soup',
};
