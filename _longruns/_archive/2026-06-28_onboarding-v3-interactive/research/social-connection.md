# 社会的つながり エビデンスドシエ

対象習慣：「毎日、誰かと近況や気持ちを打ち明け合う会話をする」
（Stage 2 ディープリサーチ成果・2026-07-01・s2-social）

## 提案 calculationParams

```
dailyHealthMinutes: 6,
dailyCostSaving: 300,
dailyIncomeGain: 900,
dailyPositiveMoodMinutes: 55,
```

- **dailyHealthMinutes = 6分/日**：Holt-Lunstad系メタ分析（社会的孤立/孤独の死亡リスク26〜32%増、OR1.26〜1.32）を基に、質の高い会話習慣による孤立解消効果を延命1年相当と保守的に見積もり、40年余命で日割り（1年×525,600分÷40年÷365日≈36分/日）した上で、「完全な孤立解消」ではなく「会話頻度の向上」という部分効果である点、および2021年の反証研究（喫煙ほど強くない）を踏まえてさらに大きく割り引いた。
- **dailyCostSaving = 300円/日**：AARP/Stanford研究の孤立高齢者Medicare超過支出（$1,608/年 ≈ 24万円/年 ≈ 660円/日）をベースに、40歳という対象年齢層（高齢者データをそのまま外挿できない）を考慮して半分以下に割り引いた。
- **dailyIncomeGain = 900円/日**：Gallup「職場に親友」研究（エンゲージメント7倍・profitability/retention相関）の生産性効果を、既存記事の慣例（控えめに1〜2%）に倣い1.5%として算出（62,500円×1.5%=938円→丸め900円）。
- **dailyPositiveMoodMinutes = 55分/日**：Hall et al. 2023（質の高い会話1回で当日well-being向上、mini-meta d=0.255）を基に、ベースライン480分×改善12%として算出（480×12%=57.6分→丸め55分）。運動記事などの慣例（12〜15%）と整合。

## calculationLogic 案

```
health: [
  { label: '研究結果', value: 'Holt-Lunstad et al. 2015: 孤立/孤独/独居の死亡リスクは統制後もそれぞれ29%/26%/32%増（OR1.29/1.26/1.32）' },
  { label: '延命換算の保守的見積もり', value: '会話頻度向上による孤立緩和効果を、生涯延命1年相当と控えめに設定（喫煙同等という一般言説は2021年の反証研究で否定的なため採用しない）' },
  { label: '日割り計算', formula: '1年 × 525600分 ÷ 40年 ÷ 365日 ≈ 36分だが保守的に', result: '6分/日' },
],
cost: [
  { label: '研究結果', value: 'AARP/Stanford (Shaw et al. 2017): 客観的社会的孤立のある高齢者はMedicare支出が年$1,608多い' },
  { label: '円換算・年齢層調整', formula: '1608ドル×150円 ÷ 365日 ≈ 660円/日、40代への外挿で保守的に半減以下', result: '300円/日' },
],
income: [
  { label: '研究結果', value: 'Gallup Q12 Item10: 職場に親友がいる人はエンゲージメント7倍、profitability/retentionと正相関' },
  { label: '控えめに1.5%適用', formula: '62500円 × 1.5%', result: '938円/日' },
  { label: '端数調整', result: '900円/日' },
],
positiveMood: [
  { label: '前提', value: '起床16時間=960分 × 前向き割合50% = ベースライン480分/日' },
  { label: '研究結果', value: 'Hall et al. 2023: 質の高い会話1回で当日well-being向上（3研究合計N=907、mini-meta d=0.255）' },
  { label: '保守的に12%採用', formula: '480分 × 12%', result: '57.6分/日' },
  { label: '端数調整', result: '55分/日' },
],
```

## 主要研究リスト

| 著者・年 | 誌名 | デザイン | N | 効果量 | URL |
|---|---|---|---|---|---|
| Holt-Lunstad et al. 2010 | PLOS Medicine | メタ分析（148研究） | 308,849 | 社会的つながり強い群の生存オッズ OR=1.50 | https://journals.plos.org/plosmedicine/article?id=10.1371%2Fjournal.pmed.1000316 |
| Holt-Lunstad, Smith, Baker, Harris, Stephenson 2015 | Perspectives on Psychological Science | メタ分析 | 複数コホート統合 | 孤立OR=1.29／孤独OR=1.26／独居OR=1.32（交絡統制後） | https://journals.sagepub.com/doi/full/10.1177/1745691614568352 |
| Holt-Lunstad 2024 | World Psychiatry 23(3) | レビュー | — | 孤独は死亡リスク26%増、社会的つながりは生存オッズ50%増 | https://onlinelibrary.wiley.com/doi/full/10.1002/wps.21224 |
| （2021再分析） | PMC (Life Course Study等2コホート) | コホート再分析 | 2コホート | 孤立・孤独は死亡リスクを高めるが喫煙ほど強くない、階層あり | https://pmc.ncbi.nlm.nih.gov/articles/PMC8683741/ |
| Hall, Holmstrom, Pennington, Perrault, Totzkay 2023 | Communication Research | 3実験（ランダム割付） | 347+310+250=907 | 質の高い会話で当日well-being向上、mini-meta d=0.255 | https://journals.sagepub.com/doi/10.1177/00936502221139363 |
| Gallup (Q12 Item10) | Gallup Workplace | 大規模従業員調査（継続） | 数百万規模の累積サンプル | 「職場に親友」ありでエンゲージメント7倍、profitability/safety/retentionと相関 | https://www.gallup.com/workplace/397058/increasing-importance-best-friend-work.aspx |
| Shaw, Yang et al. 2017 (Stanford/AARP) | Health Services Research | 横断分析（Medicare受給者） | 高齢Medicare受給者コホート | 客観的孤立群でMedicare支出+$1,608/年（孤独感自体は逆に-$768） | https://pmc.ncbi.nlm.nih.gov/articles/PMC5847278/ |
| medRxiv 2024 | preprint | Mendelian randomization | 大規模遺伝データ | 観察研究と遺伝的因果推定が一部食い違う | https://www.medrxiv.org/content/10.1101/2024.11.26.24317985v1.full |
| （2024） | Nature Human Behaviour | 観察 vs 遺伝的手法の比較 | 大規模バイオバンク | 孤独と疾患リスクの関連は観察的手法と遺伝的手法で不一致 | https://www.nature.com/articles/s41562-024-01970-0 |

## 限界と保守的判断のメモ

- **逆因果の問題が大きい**：健康な人ほど社交的になれる（逆方向）可能性があり、Mendelian randomization研究では観察研究ほど一貫した因果を支持しない（Nature Human Behaviour 2024）。このため延命年数は他の生活習慣（運動・禁酒）より一段保守的に見積もった。
- **「喫煙15本相当」という通説は採用しない**：NIA発表由来の通説だが、2021年の直接比較コホート研究では孤立・孤独は死亡リスク要因として喫煙より弱いという階層が確認されている。誇張値を避けた。
- **Medicare研究は高齢者データ**：サンプルプロフィールの40歳には直接当てはまらないため、コスト削減額を大きく割り引いた。また同じ研究内で「孤独感」自体はMedicare支出を減らす方向という逆の結果もあり、孤立と孤独は区別が必要（本習慣は主観的孤独の緩和に近い）。
- **Hall 2023はd=0.255（小〜中）**：単発の会話の効果であり、毎日の習慣化による累積効果へ単純外挿するのは飛躍がある。保守的に12%（他の運動系記事の12〜15%レンジの下限）を採用。
- **Gallup研究は「職場の親友」であり、本習慣（誰かと近況や気持ちを打ち明け合う）とは対象がややズレる**（職場限定ではなく友人・家族含む）。生産性への直接効果として1.5%という控えめな値にとどめた。

## 記事本文に使える切り口（3つ）

- 「社会的孤立は死亡リスクを最大32%高める——これは見えない生活習慣病である」という切り口で、Holt-Lunstadの大規模メタ分析を核に据える。
- 「たった1回の"質の高い会話"が、その日1日の気分を変える」というHall 2023の実験結果を、日々の小さな行動の即効性として訴求する。
- 「職場に親友がいる人はエンゲージメントが7倍」というGallupの数字を使い、社会的つながりを"個人の癒し"ではなく"キャリアの資産"として再解釈する。
