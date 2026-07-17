import type { LifeImpactArticle } from '@/types/impact';

/**
 * 家計簿をつける — Life Impact Article
 *
 * Research basis:
 * - Cost(唯一の主効果): Burke(2011, セルフモニタリングの一般構造) + Huebner(2020, CHB, クレカ支出の
 *   可視化フィールド実験で有意な支出減) + Lusardi&Mitchell(2014, 金融リテラシー→資産形成)。
 *   総務省家計調査2024=消費支出 月30万円 × 保守的3%削減 ÷ 30日 = 300円/日
 * - Health/Income/Mood: 「前向きな気持ちの時間(分)」等に換算できる独立エビデンスがないため 0
 */
export const expenseTracking: LifeImpactArticle = {
  habitCategory: 'expense_tracking',
  habitName: '家計簿をつける',

  article: {
    researchBody:
      '支出は、記録して初めて「減らせる対象」になる。\n\n' +
      '家計簿の本質は節約テクニックではなく、セルフモニタリング（自分の行動を記録して見える化すること）だ。行動科学の分野では、記録という行為そのものが行動を変えることが繰り返し確認されてきた。22件の研究をまとめたシステマティックレビュー（Burke et al., 2011, Journal of the American Dietetic Association）では、記録の頻度が高いほど行動変容と成果が大きくなるという一貫した関連が示されている。これは体重管理の研究だが、「測って、書く」ことが人の行動を動かすという構造は、お金の使い方にもそのまま当てはまる。\n\n' +
      '支出の記録が実際に出費を減らすことは、家計そのものを対象にした研究でも確かめられている。1,000人以上のクレジットカード利用者を数ヶ月追跡したフィールド実験（Huebner et al., 2020, Computers in Human Behavior）では、日々の支出をアプリで可視化し、ふだんの買い物と特別な出費の両方を振り返れるようにした利用者は、そうでない対照群と比べて支出が有意に減少した。興味深いのは、ただ金額を通知するだけでは効果が乏しく、「見える化」と「振り返り」がそろって初めて支出が下がった点だ。家計簿を「つけっぱなしにしない」ことの大切さを示している。\n\n' +
      'こうした日々の家計管理は、長い目で見た資産形成にもつながる。金融リテラシー研究を包括的にレビューした論文（Lusardi & Mitchell, 2014, Journal of Economic Literature）では、自分の収支を把握し管理する力が、貯蓄や資産形成、老後の備えと正の相関を持つことが理論と実証の両面から示されている。\n\n' +
      '{{cost_inference}}\n\n' +
      '{{cumulative}}',

    sources: [
      {
        id: 1,
        text: 'Huebner J, Fleisch E, Ilic A. (2020). "Assisting mental accounting using smartphones: Increasing the salience of credit card transactions helps consumer reduce their spending." Computers in Human Behavior, 113, 106504. N>1,000のフィールド実験、支出の可視化＋振り返りで支出が有意に減少。',
        url: 'https://doi.org/10.1016/j.chb.2020.106504',
      },
      {
        id: 2,
        text: 'Burke LE, Wang J, Sevick MA. (2011). "Self-Monitoring in Weight Loss: A Systematic Review of the Literature." Journal of the American Dietetic Association, 111(1), 92-102. 22研究、記録の頻度と行動変容に一貫した正の関連。',
        url: 'https://doi.org/10.1016/j.jada.2010.10.008',
      },
      {
        id: 3,
        text: 'Lusardi A, Mitchell OS. (2014). "The Economic Importance of Financial Literacy: Theory and Evidence." Journal of Economic Literature, 52(1), 5-44. 収支把握を含む金融リテラシーが貯蓄・資産形成と正の相関。',
        url: 'https://doi.org/10.1257/jel.52.1.5',
      },
      {
        id: 4,
        text: '総務省統計局 (2024). 「家計調査報告（家計収支編）2024年平均」。二人以上の世帯の消費支出は月平均約300,243円。',
        url: 'https://www.stat.go.jp/data/kakei/sokuhou/tsuki/index.html',
      },
    ],
  },

  inferences: {
    health:
      '家計簿と健康寿命を結ぶ信頼できる定量エビデンスは無いため、健康への効果は0としています（金銭的な不安の軽減が健康に及ぼす間接効果は否定しませんが、数値化はしていません）。',
    cost:
      'あなたは42歳の日本人男性です。総務省の家計調査（2024年平均）によれば、二人以上の世帯の消費支出は月あたり約30万円です。年収1,500万円という高所得でも、削減率は所得ではなく実際の消費支出に掛けるのが妥当なので、基準は月30万円に置きます。文献が示す支出削減効果より意図的に低く、記録によって見直せる割合を保守的に3%と見積もると、月9,000円、1日あたり¥300のコスト削減と推定します。%の一次数値が特定できないため、下振れ側に寄せた推定です。',
    income:
      '家計簿が収入を直接増やすとする定量的根拠は薄いため、収入への効果は0としています。',
    cumulative:
      '**1ヶ月続けると**：¥9,000節約。\n' +
      '**1年続けると**：¥11万節約。\n' +
      '**10年続けると**：¥110万節約。\n' +
      '「測って、書く」だけの数分が、10年で100万円以上の差を静かに積み上げます。',
  },

  calculationParams: {
    dailyHealthMinutes: 0,
    dailyCostSaving: 300,
    dailyIncomeGain: 0,
    dailyPositiveMoodMinutes: 0,
  },

  confidenceLevel: 'medium',

  calculationLogic: {
    health: [
      { label: '直接エビデンスなし', value: '家計簿と健康寿命を結ぶ定量的根拠はない', result: '0分/日' },
    ],
    cost: [
      { label: '基準', value: '消費支出 月30万円（総務省 家計調査 2024年平均）' },
      { label: '見える化による保守的削減3%', formula: '300000 × 3% ÷ 30日', result: '300円/日' },
    ],
    income: [
      { label: '直接エビデンスなし', value: '家計簿が所得を直接増やす定量的根拠はない', result: '0円/日' },
    ],
  },

  heroImage: {
    url: 'https://images.unsplash.com/photo-1763730512449-f1a505f432a9',
    gradient: 'from-emerald-400 to-green-700',
  },
  defaultHabitType: 'positive',
  defaultIcon: 'wallet',
};
