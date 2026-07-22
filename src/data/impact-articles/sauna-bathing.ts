import type { LifeImpactArticle } from '@/types/impact';

/**
 * サウナに入る — Life Impact Article
 *
 * Research basis:
 * - Health(主効果): Laukkanen(2015, JAMA Intern Med, フィンランドKIHD 男性2,315人・追跡20年) 週4-7回で
 *   全死因死亡40%減・心臓突然死63%減 / Laukkanen(2017) 認知症66%減 / Kunutsor(2024) 精神病51%減。
 *   ただし単一国・単一性別・観察研究。余命+0.4年→週5相当で日割りし 14分/日
 * - PositiveMood(副次): 精神病リスク低下＋サウナ後の急性リラックスから 8分/日
 * - Income(副次): 睡眠・ストレス回復→生産性0.3%（暦日365換算）を週5日割りで 90円/日 / Cost: 施設利用で出費側のため 0
 * - 注意: 湯船入浴(hot_bath)と受動加温の機序が重複。両登録時は health/income を二重計上しない
 */
export const saunaBathing: LifeImpactArticle = {
  habitCategory: 'sauna_bathing',
  habitName: 'サウナに入る',

  article: {
    researchBody:
      '週に数回サウナに通う人は、死亡・認知症・心臓突然死のリスクがまとまって低いという、驚くほど一貫したデータが存在する。\n\n' +
      'フィンランドの中年男性2,315人を約20年追跡した研究（Laukkanen et al., 2015, JAMA Internal Medicine）では、サウナに週4〜7回入る人は週1回の人に比べて、全死因死亡が40%低く、心臓突然死は63%、致死的な心血管疾患は50%低いという結果が報告された。しかも入る回数が多いほど、1回の時間が長いほどリスクが下がる関係（用量反応）が見られており、偶然では説明しにくいパターンだ。\n\n' +
      '同じ集団を追った別の研究（Laukkanen et al., 2017, Age and Ageing）では、週4〜7回の人は認知症リスクが66%、アルツハイマー病リスクが65%低いと報告されている。さらに2024年の研究（Kunutsor et al., Journal of Psychiatric Research）では、頻度の高いサウナ利用者は精神病性障害のリスクが51%低く、この関係は運動能力で調整しても維持された。血圧や気分への好影響も含め、これらは温熱による血管・自律神経への作用として説明が試みられている（Laukkanen et al., 2018, Mayo Clinic Proceedings のレビュー）。\n\n' +
      '{{health_inference}}\n\n' +
      'サウナ後の深いリラックスと睡眠の改善は、翌日のコンディションにも小さく返ってくる。\n\n' +
      '{{income_inference}}\n\n' +
      'そしてサウナに通う人がまず口にするのは、入った直後の爽快感だ。この気分の高まりにも、根拠がある。\n\n' +
      '{{positive_mood_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Laukkanen T, Khan H, Zaccardi F, Laukkanen JA. (2015). "Association Between Sauna Bathing and Fatal Cardiovascular and All-Cause Mortality Events." JAMA Internal Medicine, 175(4), 542-548. フィンランド男性2,315人・追跡20.7年、週4-7回で全死因死亡40%減・心臓突然死63%減。',
        url: 'https://doi.org/10.1001/jamainternmed.2014.8187',
      },
      {
        id: 2,
        text: 'Laukkanen T, Kunutsor S, Kauhanen J, Laukkanen JA. (2017). "Sauna bathing is inversely associated with dementia and Alzheimer\'s disease in middle-aged Finnish men." Age and Ageing, 46(2), 245-249. 週4-7回で認知症66%減・アルツハイマー65%減。',
        url: 'https://doi.org/10.1093/ageing/afw212',
      },
      {
        id: 3,
        text: 'Kunutsor SK, Kauhanen J, Laukkanen JA. (2024). "Frequent sauna bathing and psychosis: Interrelationship with cardiorespiratory fitness." Journal of Psychiatric Research, 175, 75-80. 高頻度で精神病リスク51%減、心肺フィットネス調整後も維持。',
        url: 'https://doi.org/10.1016/j.jpsychires.2024.04.044',
      },
      {
        id: 4,
        text: 'Laukkanen JA, Laukkanen T, Kunutsor SK. (2018). "Cardiovascular and Other Health Benefits of Sauna Bathing: A Review of the Evidence." Mayo Clinic Proceedings, 93(8), 1111-1121. フィンランド式サウナ（80-100℃）の健康効果を横断的にレビュー。',
        url: 'https://doi.org/10.1016/j.mayocp.2018.04.008',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。研究対象がフィンランドの中年男性なので、42歳男性というプロフィールにはむしろよく合致します。日本のドライサウナも温度帯（80〜100℃）は研究のフィンランド式と近く、適用性は比較的高いと考えられます。ただし、これらの死亡・認知症・精神病に関する結果はすべて単一のコホート（男性のみ・観察研究）に由来し、「サウナに通える人はもともと健康・時間・経済的に余裕がある」といった交絡を完全には排除できません。そこで、用量反応の一貫性は評価しつつ因果分を大幅に保守化し、正味の余命延伸を0.4年と見積もって週5回相当で日割りし、1日あたり約14分の健康寿命延伸と推定します。日常的に湯船に浸かる習慣（受動的な加温）と機序が重なるため、両方を登録している場合はこの健康効果を重複して数えないでください。',
    cost:
      'サウナは施設利用料などでむしろ出費が増える側で、医療費削減の定量的な根拠もこのコホートにはないため、コストへの効果は0としています。',
    income:
      '年収1,500万円に対して、サウナによる睡眠の質改善とストレス回復が翌日の集中力にわずかに寄与します。間接的な経路のため極めて保守的に0.3%の生産性向上と見積もり、暦日365日ベースかつ週5回相当で日割りすると、¥15,000,000 × 0.3% ÷ 365 × (5/7) ≒ ¥90/日の収入ポテンシャルと推定します。',
    positiveMood:
      'サウナ後の爽快感やリラックスは広く報告されており、精神病リスク51%減という独立したメンタル面のエビデンス（Kunutsor et al., 2024）もあります。1回あたり約15分の前向きな気分の高まりを保守的に見積もり、週5回相当で日割りし、さらに急性の状態である点を割り引くと、1日あたり約8分、前向きな気持ちで過ごせる時間が増えると推定されます。これは長期の健康効果とは別軸の、入った直後の主観的な気分改善です。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+7時間、¥2,700の収入ポテンシャル、前向きな気持ちの時間+4時間。\n' +
      '**1年続けると**：健康寿命+3.5日、¥3.3万の収入ポテンシャル、前向きな気持ちの時間+2日。\n' +
      '**10年続けると**：健康寿命+36日、¥33万の収入ポテンシャル、前向きな気持ちの時間+20日。\n' +
      '週数回の「ととのう」時間が、心臓と頭、そして気分をまとめて整えます。',
  },

  calculationParams: {
    dailyHealthMinutes: 14,
    dailyCostSaving: 0,
    dailyIncomeGain: 90,
    dailyPositiveMoodMinutes: 8,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '研究結果', value: '週4-7回で全死因死亡40%減（Laukkanen 2015, KIHD 男性2,315人・追跡20年）' },
      { label: '保守的見積もり', value: '単一国・単一性別・観察研究のため正味の余命延伸を0.4年に大幅保守化' },
      { label: '日割り計算', formula: '0.4年 × 525600分 ÷ 40年 ÷ 365日 ≈ 14分（週5回相当）', result: '14分/日' },
    ],
    cost: [
      { label: '出費側のため0', value: 'サウナは施設利用料で出費側。医療費削減の定量的根拠もない', result: '0円/日' },
    ],
    income: [
      { label: '睡眠・ストレス回復→生産性', value: '間接経路のため極めて保守的に0.3%' },
      { label: '暦日換算＋週5回で日割り', formula: '15000000 × 0.3% ÷ 365 × (5/7) ≈ 88', result: '90円/日' },
    ],
    positiveMood: [
      { label: '前提', value: 'サウナ後の急性リラックス＋精神病リスク51%減（Kunutsor 2024）' },
      { label: '1回15分を週5回で日割り', formula: '15分 × (5/7) ≈ 11 → 急性状態を割り引き', result: '8分/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1770625468096-ff53cd24ee38',
    gradient: 'from-orange-400 to-red-700',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'flame',
};
