import type { LifeImpactArticle } from '@/types/impact';

/**
 * 昼寝（20分以内） — Life Impact Article
 *
 * Research basis:
 * - Income(主効果): Rosekind(1995, NASA) 巡航中の仮眠で覚醒度54%・パフォーマンス34%改善 /
 *   Brooks&Lack(2006, Sleep) 10分仮眠で覚醒・認知が最長155分改善。午後の生産性回復を日給2%で 1250円/日
 * - PositiveMood(副次): 仮眠後の覚醒・気分改善（155分持続）を 480分×3% で 14分/日
 * - Health(副次): Naska(2007) 昼寝で冠動脈死12-37%減だが観測研究で交絡大 → ごく小さく 5分/日
 * - Cost: 0
 * - 重要注意: Yamada(2016, 東大, 29万人) 60分超の昼寝で糖尿病 OR1.46 のJカーブ。効果は「20分以内」条件付き
 */
export const powerNap: LifeImpactArticle = {
  habitCategory: 'power_nap',
  habitName: '昼寝（20分以内）',

  article: {
    researchBody:
      '午後の眠気は根性の問題ではなく、体内時計が生み出す生理現象だ。そしてその眠気は、たった10〜20分の仮眠で科学的に打ち消せる。\n\n' +
      'NASAの研究チームは、長距離便のパイロットに巡航中40分の休息機会を与える実験を行った。パイロットは平均25.8分眠り、その結果、生理的な覚醒度は54%、飛行パフォーマンス（反応時間と精度）は34%改善した。この効果は、最も集中力が要求される降下・着陸フェーズまで持続している（Rosekind et al., 1995）。短い仮眠が、午後の判断力を確かに底上げする。\n\n' +
      'では何分が最適か。Brooks と Lack（2006, Sleep）は、5分・10分・20分・30分の仮眠を比較した。最も効率が良かったのは10分の仮眠で、覚醒度と認知課題の成績が最長155分にわたって改善した。5分では短すぎて効果が乏しく、30分では起床直後に一時的なだるさ（睡眠慣性）が現れた。狙うべきは、深い眠りに落ちきる前の10〜20分だ。\n\n' +
      'ただし、長ければ良いわけではない。ここが最重要の注意点になる。東京大学チームが約29万人を解析したメタ解析では、昼寝時間と2型糖尿病・メタボリックシンドロームのリスクがJカーブを描いた。40分までは影響がない一方、60分を超える長時間の昼寝は糖尿病リスクを1.46倍に高める（Yamada et al., 2016）。昼寝は「20分以内」で切り上げること。これを守ってこそ、午後の集中力回復という果実だけを、リスクなく手に入れられる。\n\n' +
      '{{health_inference}}\n\n' +
      '短い仮眠がいちばん効くのは、午後のパフォーマンスだ。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Rosekind MR, et al. (1995). "Alertness management: strategic naps in operational settings." Journal of Sleep Research, 4(Suppl. 2), 62-66. 巡航中の平均25.8分の仮眠で覚醒度54%・パフォーマンス34%改善。',
        url: 'https://doi.org/10.1111/j.1365-2869.1995.tb00229.x',
      },
      {
        id: 2,
        text: 'Brooks A, Lack L. (2006). "A Brief Afternoon Nap Following Nocturnal Sleep Restriction: Which Nap Duration is Most Recuperative?" Sleep, 29(6), 831-840. 10分仮眠が最も効率的で、覚醒・認知の改善が最長155分持続。',
        url: 'https://doi.org/10.1093/sleep/29.6.831',
      },
      {
        id: 3,
        text: 'Yamada T, Shojima N, Yamauchi T, Kadowaki T. (2016). "J-curve relation between daytime nap duration and type 2 diabetes or metabolic syndrome: A dose-response meta-analysis." Scientific Reports, 6, 38075. 計288,883名、60分超の昼寝で2型糖尿病 OR 1.46。',
        url: 'https://doi.org/10.1038/srep38075',
      },
      {
        id: 4,
        text: 'Naska A, Oikonomou E, Trichopoulou A, et al. (2007). "Siesta in Healthy Adults and Coronary Mortality in the General Population." Archives of Internal Medicine, 167(3), 296-301. 23,681名を追跡、昼寝習慣で冠動脈死12-37%低下（観測研究・交絡大）。',
        url: 'https://doi.org/10.1001/archinte.167.3.296',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。昼寝と心血管死の関連（Naska 2007で冠動脈死12〜37%低下）は観測研究に由来し、「昼寝できる人はもともと健康・低ストレス・生活に余裕がある」といった交絡が大きいため、因果効果とは読めません。さらに60分を超える長い昼寝はむしろ糖尿病リスクを高めます（Yamada 2016）。そこで健康寿命への寄与はごく控えめに見積もり、「20分以内」を厳守する前提で、わずかなストレス低減効果のみを計上して1日あたり約5分の健康寿命延伸と推定します。長く寝てしまう習慣ならこの効果は消え、逆効果になり得る点に注意してください。',
    cost:
      '昼寝そのものに直接の費用削減効果はないため、コストへの効果は0としています。',
    income:
      '年収1,500万円（日給換算¥62,500）に対して、20分以内の仮眠が午後の認知パフォーマンスを回復させます。NASAの研究ではパフォーマンスが34%改善し、Brooks & Lack では覚醒と認知の改善が最長155分続きました。この午後の生産性ディップの部分的な回復を、認知労働以外や個人差を踏まえて保守的に2%の生産性向上と見積もると、1日あたり¥1,250の収入ポテンシャルと推定します。',
    positiveMood:
      '短時間の仮眠は、覚醒度だけでなく気分も改善し、その効果は最長155分持続することが示されています（Brooks & Lack, 2006）。何もしないときに前向きでいられる時間（起床16時間×前向き50%＝480分/日）を基準に、この気分改善を保守的に3%とみなすと、1日あたり約14分（480分×3%）、前向きな気持ちで過ごせる時間が増えると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥37,500の収入増。\n' +
      '**1年続けると**：健康寿命+1.3日、¥45.6万の収入増。\n' +
      '**10年続けると**：健康寿命+13日、¥456万の収入増。\n' +
      '午後の20分が、その日の後半の集中力をまるごと立て直します（ただし寝すぎは禁物）。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 0,
    dailyIncomeGain: 1250,
    dailyPositiveMoodMinutes: 14,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '昼寝で冠動脈死12-37%減（Naska 2007）だが観測研究で交絡大' },
      { label: '大幅に保守化', value: '「20分以内」厳守を前提にわずかなストレス低減のみ計上（長い昼寝は逆効果）', result: '5分/日' },
    ],
    cost: [
      { label: '直接エビデンスなし', value: '昼寝そのものに費用削減効果はない', result: '0円/日' },
    ],
    income: [
      { label: '午後の認知回復', value: '仮眠でパフォーマンス34%改善（Rosekind 1995）・改善が155分持続（Brooks&Lack 2006）' },
      { label: '保守的に2%', formula: '62500 × 2%', result: '1250円/日' },
    ],
    positiveMood: [
      { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
      { label: '研究結果', value: '仮眠後の覚醒・気分改善が最長155分持続（Brooks&Lack 2006）' },
      { label: '日割り計算', formula: '480分 × 3%', result: '14分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1567016420071-ec27a7835119',
    gradient: 'from-indigo-300 to-slate-600',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'bed',
};
