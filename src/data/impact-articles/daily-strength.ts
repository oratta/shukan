import type { LifeImpactArticle } from '@/types/impact';

/**
 * 毎日筋トレ — Life Impact Article
 *
 * Research basis:
 * - Health: Momma et al. (2022) — 10-17% all-cause mortality reduction with 30-60 min/week,
 *   Shailendra et al. (2022) — 15% all-cause mortality reduction (up to 27% at 60 min/week),
 *   bone density preservation, diabetes risk reduction (34% at 150 min/week)
 *   → 8 min/day health gain (conservative, adjusted for 42-year-old male)
 * - Cost: Lifestyle disease prevention (diabetes ¥120K/year, cardiovascular risk reduction),
 *   fall/fracture prevention in later years, metabolic rate increase (~5-7%)
 *   → ¥200/day
 * - Income: Liu-Ambrose (2010) — executive function improvement with resistance training,
 *   ~1.5% productivity gain + sick day reduction (~2 days/year)
 *   → ¥960/day
 */
export const dailyStrength: LifeImpactArticle = {
  habitCategory: 'daily_strength',
  habitName: '毎日筋トレ',

  article: {
    researchBody:
      '筋トレを1日30分続けるだけで、あなたの体は確実に変わり始める。\n\n' +
      '16の前向きコホート研究を統合したメタアナリシス（Momma et al., 2022）では、週30〜60分の筋力トレーニングで全死亡リスクが10〜17%低下することが示された。さらにShailendra et al.（2022）の系統的レビューでは、レジスタンストレーニング実施者の全死亡リスクが15%、心血管疾患死亡リスクが19%、がん死亡リスクが14%低下すると報告されている。\n\n' +
      '{{health_inference}}\n\n' +
      '死亡リスクの低下だけでなく、医療費への影響も見逃せない。ハーバード大学の18年間追跡研究では、週150分以上の筋力トレーニングで2型糖尿病の発症リスクが34%低下した。厚生労働省のデータによると、糖尿病の年間医療費は国全体で約1.2兆円に達しており、個人レベルでの予防効果は計り知れない。\n\n' +
      '{{cost_inference}}\n\n' +
      'さらに、脳機能への好影響も科学的に実証されている。Liu-Ambrose et al.（2010）のランダム化比較試験では、12ヶ月間のレジスタンストレーニングにより実行機能（注意力・意思決定）が有意に向上した。また、レジスタンストレーニングは安静時代謝率を約5〜7%向上させ、エネルギーレベルの底上げにもつながる。\n\n' +
      '{{income_inference}}\n\n' +
      '{{cumulative}}',
    sources: [
      {
        id: 1,
        text: 'Momma H, et al. (2022). "Muscle-strengthening activities are associated with lower risk and mortality in major non-communicable diseases: a systematic review and meta-analysis of cohort studies." British Journal of Sports Medicine, 56(13), 755-763.',
        url: 'https://doi.org/10.1136/bjsports-2021-105061',
      },
      {
        id: 2,
        text: 'Shailendra P, et al. (2022). "Resistance Training and Mortality Risk: A Systematic Review and Meta-Analysis." American Journal of Preventive Medicine, 63(2), 277-285.',
        url: 'https://doi.org/10.1016/j.amepre.2022.03.020',
      },
      {
        id: 3,
        text: 'Liu-Ambrose T, et al. (2010). "Resistance Training and Executive Functions: A 12-Month Randomized Controlled Trial." Archives of Internal Medicine, 170(2), 170-178.',
        url: 'https://doi.org/10.1001/archinternmed.2009.494',
      },
      {
        id: 4,
        text: '厚生労働省 (2024). 「令和4年度 国民医療費の概況」— 糖尿病医療費 約1兆1,997億円、循環器系疾患 約6兆2,834億円',
      },
    ],
  },

  inferences: {
    health:
      'あなたは42歳の日本人男性です。上記のメタアナリシスは主に欧米の成人コホートを対象としていますが、筋力トレーニングによる死亡リスク低下のメカニズム（筋量維持・インスリン感受性改善・骨密度維持・慢性炎症の抑制）は人種を問わず共通の生理学的プロセスです。日本人男性の平均寿命（81歳）と残り40年の余命に対して、15%の全死亡リスク低下を控えめに適用すると、1日あたり約8分の健康寿命延伸に相当すると推定されます。特に42歳以降は加齢による筋量減少（サルコペニア）が加速するため、この年代からの筋力トレーニングの予防効果は極めて大きいと考えられます。',
    cost:
      '日本の国民医療費データ（1人あたり年間約37万円）から、筋力トレーニングによる生活習慣病リスク低減（糖尿病34%・心血管疾患19%・メタボリックシンドローム予防）を保守的に算出すると、年間約5万円の医療費削減が見込まれます。さらに、加齢に伴う骨粗鬆症・転倒骨折の予防効果（日本の大腿骨骨折の年間医療費は約3,292億円）と、代謝率向上（5〜7%）による体組成改善効果を加味すると、1日あたり¥200のコスト削減になります。',
    income:
      '年収1,500万円（日給換算¥62,500）に対して、レジスタンストレーニングによる実行機能の向上（Liu-Ambrose研究：注意力・意思決定力の有意な改善）と、基礎代謝向上によるエネルギーレベルの底上げから、約1.5%の生産性改善を推定します。さらに、身体活動による病欠日数の減少（年間約2日分）を加味すると、1日あたり¥960の収入ポテンシャルに相当すると推定されます。',
    cumulative:
      '**1ヶ月続けると**：健康寿命+4時間、¥6,000節約、¥28,800の収入増。\n' +
      '**1年続けると**：健康寿命+2日、¥7.3万節約、¥35万の収入増。\n' +
      '**10年続けると**：健康寿命+20日、¥73万節約、¥350万の収入増。\n' +
      '筋トレは「未来の自分」への最も確実な投資です。1日30分の積み重ねが、健康・経済・キャリアのすべてを底上げします。',
  },

  calculationParams: {
    dailyHealthMinutes: 8,
    dailyCostSaving: 200,
    dailyIncomeGain: 960,
  },

  confidenceLevel: 'high',

  defaultHabitType: 'positive',
  defaultIcon: 'dumbbell',
};
