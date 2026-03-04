import type { LifeImpactArticle } from '@/types/impact';

export const dailyYoga: LifeImpactArticle = {
  habitCategory: 'daily_yoga',
  habitName: '毎日ヨガ',

  article: {
    researchBody:
      'ヨガは体と心を同時に鍛える、最もバランスの取れた運動のひとつだ。\n\n' +
      'Oxidative Medicine and Cellular Longevity（Tolahunase et al., 2017）に掲載された研究では、12週間のヨガ・瞑想プログラムでテロメラーゼ活性が有意に上昇し、細胞レベルで老化が遅延することが示された。Mayo Clinic Proceedingsのメタ分析（Cramer et al., 2017）では、ヨガが血圧を収縮期5mmHg・拡張期3.9mmHg低下させることが報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      'ヨガは自宅で無料で実践でき、特別な器具も不要だ。\n\n' +
      '{{cost_inference}}\n\n' +
      'ヨガの深い呼吸法はコルチゾールを低下させ、ストレスフルな仕事環境での回復力を高める。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Tolahunase M, et al. (2017). "Impact of Yoga and Meditation on Cellular Aging." Oxidative Medicine and Cellular Longevity, 2017, 7928981.',
        url: 'https://doi.org/10.1155/2017/7928981',
      },
      {
        id: 2,
        text: 'Cramer H, et al. (2017). "Yoga for Arterial Hypertension." Mayo Clinic Proceedings.',
      },
      {
        id: 3,
        text: 'Zhang X, et al. (2024). "Effects of yoga on stress in stressed adults: a systematic review and meta-analysis." Frontiers in Psychiatry.',
        url: 'https://doi.org/10.3389/fpsyt.2024.1437902',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。テロメラーゼ研究はインドの成人を対象としていますが、テロメア維持のメカニズムは人種共通です。高血圧リスクが上昇し始める40代にとって、血圧低下効果は特に価値があります。細胞老化遅延・血圧改善・柔軟性向上を総合すると、1日あたり約9分の健康寿命延伸に相当すると推定されます。',
    cost:
      '自宅ヨガなら費用ゼロ。ジムやスタジオのヨガクラス費（月平均8,000-15,000円）を自宅実践に置き換えることで節約になります。さらに血圧関連の通院・投薬費リスク低減を含め、1日あたり¥300のコスト削減と推定されます。',
    income:
      '年収1,500万円（日給¥62,500）に対して、ストレス低減による集中力・判断力向上を控えめに2%と見積もると年間¥30万。さらにヨガ実践者は病欠が少ないとの報告もあり、1日あたり¥1,000の収入ポテンシャルと推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+4.5時間、¥9,000節約、¥30,000の収入増。\n' +
      '**1年続けると**：健康寿命+2.7日、¥11万節約、¥36.5万の収入増。\n' +
      '**10年続けると**：健康寿命+27日、¥110万節約、¥365万の収入増。\n' +
      'マットの上の20分が、マットの外の人生を変えます。',
  },

  calculationParams: {
    dailyHealthMinutes: 9,
    dailyCostSaving: 300,
    dailyIncomeGain: 1000,
  },

  confidenceLevel: 'medium',
  defaultHabitType: 'positive',
  defaultIcon: 'flower-2',
};
