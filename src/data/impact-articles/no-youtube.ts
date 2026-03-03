import type { LifeImpactArticle } from '@/types/impact';

/**
 * YouTubeを見ない — Life Impact Article
 *
 * Research basis:
 * - Health: AHA Science Advisory (2016) — sedentary screen time increases CVD risk 5% per hour;
 *   Ruhr University Bochum RCT (2025) — screen time reduction improves sleep quality & mental health;
 *   42 min/day average YouTube viewing in Japan (Statista 2024)
 *   → 5 min/day health gain (medium confidence, indirect evidence from screen time studies)
 *
 * - Cost: YouTube Premium ¥1,280/month + ad-driven impulse purchase reduction (conservative ¥100/day)
 *   → ¥150/day
 *
 * - Income: Gloria Mark (UCI) — 23 min recovery per interruption;
 *   APA — task switching reduces productivity up to 40%;
 *   Cal Newport — deep work / social media quitting;
 *   42 min/day recovered + focus improvement → ~1 hour effective work
 *   → ¥4,690/day
 */
export const noYoutube: LifeImpactArticle = {
  habitCategory: 'no_youtube',
  habitName: 'YouTubeを見ない',

  article: {
    researchBody:
      'YouTubeを1日やめるだけで、あなたの集中力と健康が回復し始める。\n\n' +
      '日本におけるYouTubeの平均視聴時間は1日約42分（Statista, 2024）。この「たった42分」が、あなたの脳と身体に想像以上のダメージを与えている。\n\n' +
      'アメリカ心臓協会（AHA）の科学的声明（Young et al., 2016）によると、座位でのスクリーン視聴は1時間あたり心血管疾患リスクを5%増加させ、1日3時間以上の視聴では運動習慣に関係なく死亡率が上昇する。さらに、ルール大学ボーフム（2025）のランダム化比較試験では、スクリーン時間を1日2時間以下に制限した被験者が3週間でうつ症状・ストレス・睡眠の質に有意な改善を示した。\n\n' +
      '{{health_inference}}\n\n' +
      '健康面だけでなく、時間とお金の面でも効果がある。\n\n' +
      '{{cost_inference}}\n\n' +
      'さらに深刻なのは、集中力と収入への影響だ。カリフォルニア大学アーバイン校のGloria Mark教授の研究では、1回の中断から完全に集中を取り戻すまでに平均23分15秒かかることが示されている。YouTubeの「おすすめ」アルゴリズムは次々と動画を提示し、この中断と注意残余（attention residue）のサイクルを際限なく繰り返す。Cal Newportが『Deep Work』で指摘するように、こうした断片的な刺激に慣れた脳は深い集中状態に入る能力を徐々に失っていく。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',
    sources: [
      {
        id: 1,
        text: 'Young DR, et al. (2016). "Sedentary Behavior and Cardiovascular Morbidity and Mortality: A Science Advisory From the American Heart Association." Circulation, 134(13), e262-e279.',
        url: 'https://doi.org/10.1161/CIR.0000000000000440',
      },
      {
        id: 2,
        text: 'Brailovskaia J, et al. (2025). "Smartphone screen time reduction improves mental health: a randomized controlled trial." BMC Medicine, 23, 107.',
        url: 'https://doi.org/10.1186/s12916-025-03944-z',
      },
      {
        id: 3,
        text: 'Mark G, Gudith D, Klocke U (2008). "The Cost of Interrupted Work: More Speed and Stress." Proceedings of CHI 2008, ACM, 107-110.',
      },
      {
        id: 4,
        text: 'Newport C (2016). "Deep Work: Rules for Focused Success in a Distracted World." Grand Central Publishing.',
      },
      {
        id: 5,
        text: 'Statista (2024). "Average time spent on YouTube in Japan" — 月間約21.4時間（1日約42分）.',
        url: 'https://www.statista.com/statistics/1296303/japan-time-spent-youtube/',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。AHAの研究は主に米国の成人を対象としていますが、座位行動と心血管リスクの関係は人種・民族を問わず一貫しています。42歳は動脈硬化リスクが加速し始める年齢であり、毎日42分のYouTube視聴（座位スクリーン時間）を削減することは、心血管リスクの低減に直接つながります。加えて、就寝前のYouTube視聴をやめることでブルーライト曝露が減少し、メラトニン分泌が正常化して睡眠の質が向上します。これらを総合し、保守的に見積もると1日あたり約5分の健康寿命延伸に相当すると推定されます。',
    cost:
      'YouTube Premium（月額¥1,280 = 1日約¥43）の解約に加え、YouTube広告経由の衝動買い抑制（保守的に1日¥100程度）を算入すると、直接的なコスト削減として1日あたり¥150と推定されます。なお、42分の時間回復による機会費用は収入推定に含めています。',
    income:
      '年収1,500万円（日給換算¥62,500、時給¥7,813）に対して、1日42分のYouTube視聴をやめることで得られる効果は単純な時間回復だけではありません。Gloria Markの研究による「注意残余」効果（1回の中断で23分のロス）を考慮すると、YouTube視聴2〜3回で実質1時間以上の生産的時間が失われています。この回復時間と、Deep Work能力の段階的な向上（Cal Newport: 断片的メディア消費をやめると数週間で深い集中力が戻る）を総合し、保守的に1日あたり約1時間分の実効的な生産性向上（時給の60%で割引）と推定すると、¥4,690の収入ポテンシャルに相当します。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+2.5時間、¥4,500節約、¥140,700の収入増。\n' +
      '**1年続けると**：健康寿命+1.3日、¥5.5万節約、¥171万の収入増。\n' +
      '**10年続けると**：健康寿命+13日、¥55万節約、¥1,712万の収入増。\n' +
      'YouTubeをやめることは、散漫になった注意力を取り戻し、深い集中と健康を手に入れるための最も手軽な一歩です。',
  },

  calculationParams: {
    dailyHealthMinutes: 5,
    dailyCostSaving: 150,
    dailyIncomeGain: 4690,
  },

  confidenceLevel: 'medium',

  defaultHabitType: 'quit',
  defaultIcon: '📺',
};
