# Smitch Teaser LP — Marketing Best Practices Report (2026-05)

> Smitch（エビデンスベースのライフパスビルダー / "Switch your path."）の **ティザー LP（ウェイティングリスト + ヒアリングフォーム）** をマーケティング観点で設計・実装するための知識ベース兼ヒアリングテンプレート。
>
> 調査日: 2026-05-28
> 対象: 個人開発・未公開ティザーフェーズ・waitlist + ユーザーヒアリングフォーム動線
> 想定使用: 次セッションで oratta にヒアリング → LP 実装

---

## 0. このレポートの位置づけ

### 想定読者・使用シナリオ

このレポートは **2 層構造** で書かれている。

1. **知識ベース（§1-§8）**: ティザー LP のマーケティング観点でのベストプラクティス・最新トレンド・心理研究を、出典付きで整理したもの。判断の根拠として参照する。
2. **ヒアリング & 実装テンプレート（§9-§10）**: 上記知識を使って oratta（プロダクトオーナー）から決定事項を引き出すための質問集と、回答を流し込むだけで実装に入れる LP セクション雛形。

使用フロー: **次セッションで §9 のヒアリング項目を oratta に提示 → A/B/C 案から選択 → §10 の雛形に流し込む → 既存 longrun（change-G の waitlist フォーム / change-H の統合）に反映**。

### 既存ドキュメントとの関係（差分）

| ドキュメント | 守備範囲 | 本レポートとの関係 |
|---|---|---|
| `docs/research/lp-image-to-code-workflow-2026.md` | **技術** — AI 画像生成 → コード化のワークフロー、Codex プロンプト設計、AI slop 回避 | 完全に別レイヤー。あちらは「どう作るか（HOW to build）」。本レポートは「**何を載せ、どう人を動かすか（WHAT to say / WHY it converts）**」 |
| `docs/design/lp-design-brief.md` | サービスコンセプトのコピー核（"Switch your path." / 既存習慣アプリへの違和感 / トーン） | 本レポートはこれを **前提** として尊重し、マーケティング戦略を上乗せする |
| `docs/design/lp-desire-onboarding-brief.md` | LP の中身（欲求カード起点オンボーディング訴求 / Screen 1-4 仕様 / NG リスト） | 本レポートの §4.4（ヒアリングフォーム = オンボーディングの一部化）で直接連動。欲求カードを「ヒアリングの質問形式」として転用する案を提示 |
| `_longruns/.../plan.md` | LP longrun のビジネスコンテキスト・change 分解・waitlist テーブルスキーマ | change-G（waitlist フォーム）と change-H（CTA セクション）の **意思決定材料** を本レポートが供給 |
| `CLAUDE.md` | コンセプトコア・トーン・Hard Rules | トーン制約（煽らない / 連続日数 NG / "研究によると" OK / 論文直接引用 NG）を本レポートの全提案が遵守 |

**重要**: 本レポートは技術リサーチと重複しない。画像生成・コンポーネント実装の話は一切しない。「マーケティングとして何を見せ、どんな心理を働かせ、どんな情報を取るか」に集中する。

---

## 1. ティザー LP とは何か（個人開発マーケティングの観点）

### 1.1 定義と存在意義

**ティザー LP（teaser / pre-launch / coming-soon landing page）** = プロダクトがまだ公開されていない（または限定公開の）段階で、**期待を醸成し、ローンチ前に見込みユーザーを捕捉する** ための 1 ページ。

通常の LP の目的が「今すぐ買わせる / 使わせる」であるのに対し、ティザー LP の目的は **「今は渡せないものへの登録を取る」**。この差が設計全体を規定する。

ティザー LP の本質的価値は、単なるメール収集ではない。2025 年のコンセンサスでは、waitlist は **「市場検証・顧客リサーチ・コミュニティ構築・収益ポテンシャルを 1 つにまとめた戦略資産」** とされる[^twocents]。

### 1.2 通常 LP との違い

| 観点 | 通常 LP | ティザー LP |
|---|---|---|
| ゴール | 即時コンバージョン（購入 / トライアル） | waitlist 登録 / 期待醸成 / リサーチ |
| CTA 文言 | "Start free trial" | **"Join the waitlist for early access" のように「待つこと」を明示** [^flowjam] |
| 提供できる証拠 | 実績・レビュー・導入企業ロゴ | **waitlist 人数・開発進捗・コンセプト賛同** |
| コンバージョン率 | SaaS 中央値 3.8%[^magicui] | well-optimized で 20-40%（ただし定義に注意、後述）[^waitlister-cvr] |
| 主たる心理 | 信頼・即時価値 | **anticipation / scarcity / exclusivity / commitment** [^twocents] |

CTA 文言は特に重要。プロダクトがまだ無い以上、"Get early access" のような曖昧表現ではなく **"Join the waitlist for early access" / "Sign up to be the first to know"** のように「これは waitlist 登録だ」と期待値を正しくセットすること[^flowjam]。

### 1.3 個人開発でティザーを作る意味（マーケティング以外の副次効果）

個人開発でティザー LP を作る価値は **マーケティングだけではない**。

1. **市場検証**: 公開前に「このコンセプトに反応する人がいるか」を最小コストで測れる。
2. **顧客リサーチ**: ヒアリングフォームで「過去の行動・ペイン・WTP」を取得 → プロダクト方向性の根拠になる。
3. **オンボーディング言語化（Smitch 固有）**: LP のコピーと UI モックを作る過程は、そのまま **アプリ内オンボーディングの北極星** になる（`lp-desire-onboarding-brief.md` がまさにこれ）。LP を「なりたい自分 → 科学が習慣を導く」で言語化できれば、それがアプリの設計言語になる。
4. **build in public のフック**: 開発進捗を共有する素材になる（後述 §2.5 / §9.7）。

### 1.4 フェーズ別の役割

| フェーズ | 状態 | LP の役割 |
|---|---|---|
| **Pre-launch（ティザー）** | プロダクト未公開 / 限定公開 | waitlist 捕捉 + 期待醸成 + リサーチ。**Smitch は現在ここ**（新 LP は `www.s-mitch.com` で構築中） |
| **Soft launch** | 一部に先行アクセス開放 | waitlist から waves で開放、フィードバックループ |
| **Public launch** | 一般公開 | 通常 LP へ移行（即時コンバージョン重視に切替） |

Smitch の特殊事情: **旧版（Concept Prototype）が `s-mitch.com` で「一応動く」状態で公開済み**。これは「完全な未公開」ではなく、「動くプロトタイプがある状態でのティザー」という変則型（§5 で詳述）。

---

## 2. ティザー LP に必要な情報要素（ユーザーに何を見せるべきか）

### 2.1 Above the fold（ファーストビュー）

**最重要セクション**。NN/g の研究では、ユーザーは **時間の 80% を above the fold の閲覧に費やす**[^prismic]。第一印象は **50 ミリ秒未満** で形成される（Google 研究）[^prismic]。

#### Value proposition の出し方

2025 年のコンセンサスは一貫して **「明快さ > 巧妙さ（clarity beats cleverness）」**[^prismic][^evergreen]。

- **5 秒テスト**: ユーザーが 5 秒以内に「これは何か / なぜ自分に関係するか」を理解できること[^prismic]。
- **ベネフィット先行**: 機能説明ではなく成果を語る。Notion の "Build something beautiful" が好例[^prismic]。ヘッドラインをフィーチャー型からベネフィット型に変えるだけでコンバージョンが 15-30% 改善した例もある[^lapaninja]。
- **ヘッドラインは 10 語以内が理想**（Slack "Where work happens" / Dropbox "Everything you need for work, all in one place"）[^prismic]。
- **構造**: メインヘッドライン + サブヘッドライン + 単一 CTA + 文脈を補強するビジュアル[^prismic]。

> **Smitch への翻訳**: 既存 brief の Hero コピー「なりたい自分への最短コースを見つける / エビデンスベースで習慣を組み合わせて / 人生を切り替えるためのアプリ」は 3 行構造。これは 5 秒テストに対しやや長い。**1 行目だけで「何か」が伝わるか** を §9.3 で検証する。

#### ヒーロー UI モックの有無

SaaS/アプリは無形物なので **「見せる」ことが信頼を生む**。ダッシュボードのモックや短い GIF が理想[^twocents][^magicui]。Smitch では `lp-desire-onboarding-brief.md` の通り、**右側に欲求カード選択画面のモック** を置くのが既定方針（「今、いちばん変えたいことは？」+ 4 枚カード）。

#### CTA の置き方

- **単一の focused CTA**。ボタンを増やすほど決定麻痺（decision paralysis）を招く[^evergreen][^prismic]。
- above the fold に配置[^prismic]。
- **モバイル 79-83% 前提**（landing page トラフィックの 82.9% がモバイル）[^magicui] → thumb-friendly な位置に。

> **Smitch 注意**: Hard Rules で「Two primary buttons side-by-side は NG」。plan.md では Hero に `[waitlistへ] [詳しく見る]` の 2 CTA があるが、**primary は 1 つ（waitlist）に絞り、「詳しく見る」は secondary（テキストリンク / ghost button）に格下げ** すること。

### 2.2 Problem-Solution narrative

#### ペイン提示の最新トレンド

「edu-selling（教育型販売）」が 2025 年の主流[^stormy]。**「あなたが抱える問題を、あなた以上に理解している」と感じさせると、ユーザーは自然に「この製品が最適解だ」と推論する**[^stormy]。機能を売る前に問題を語る。

#### "問題提起 → 転換 → 解決" の構成パターン

JTBD の知見では、ユーザーは常に **「古い解決策から新しい解決策へ switch している」**[^jtbd]。LP はこの switch を描く:

1. **現状（古い解決策）の不満を具体化** — 「連続日数がゼロに戻った虚無感」「SNS で流れてきたライフハックを試して続かなかった」
2. **転換点** — 「問題は気合いじゃない、経路だ」
3. **新しい解決策** — 「なりたい自分から始め、科学が習慣を導く」

> **Smitch への翻訳**: `lp-desire-onboarding-brief.md` の「扱うべきペイン」リスト（夕方になると動けない / 休日を寝て終わる / お金の不安 / 上司に振り回される…）はまさにこの「現状の不満の具体化」。**抽象的な「続かない」より、身近で具体的な不満の方が「これは自分のことだ」と認識されやすい**（brief の主張）。これは JTBD の「past behavior を具体的に語らせる」とも整合する（§4.2）。

### 2.3 What / How / Why の階層

#### プロダクトの中身をどこまで見せるか

ティザーは「全部見せない」ことで anticipation（期待）を生む[^twocents]。一方、無形物は「見せないと信じてもらえない」ジレンマがある。**バランス = 「核心の体験フローは見せる、細部は隠す」**。

Finch の事例が示唆的: Finch はオンボーディングで **「価値の一部を意図的に withhold（保留）して、次回の開封への期待を作る」**（アドベンチャーが完了まで最大 8 時間、1 日 1 回しかできない）。これは初回限りの離脱（ユーザーの 25% は 1 回しか開かない）を防ぐ意図的な施策[^medium-onboarding]。

#### スクリーンショット vs アニメーション vs 静止画

- **静止画 / モック**: 最も安全。Smitch の既定（Codex 生成 + 欲求カード UI モック）。
- **GIF / 短い動画**: "aha モーメント" を見せられるなら最強[^twocents]。
- **カルーセル / スライダー**: **NG**。3 枚目まで誰も待たない、メッセージが薄まる、CTA フォーカスを壊す[^evergreen]。

> **Smitch 注意**: Hard Rules の motion budget（animation は 2 つのみ / no scroll-jacking / no parallax）と整合。**欲求カード → KPI 翻訳 → 習慣ランキング の 4 段階フロー** を「静止モックの連続」または「prefers-reduced-motion 対応の控えめな reveal」で見せる。動画化は scope 外（plan.md の「含まないもの」）。

### 2.4 Social proof（プレローンチ時に何を見せるか）

プレローンチでは「実績」がまだ無い。代替として:

- **waitlist 人数**: "Join 1,000+ on the waitlist" は FOMO を作る。社会的証明はコンバージョンを最大 270% 上げるという調査もある[^twocents]。ただし **0 人や 12 人の段階で数字を出すのは逆効果**（§9.5 で出す/出さないを判断）。
- **ベータユーザーの声 / コンセプト賛同**: テストだけでもコンバージョン 34% 改善例[^magicui]。
- **権威 / 科学的裏付け**: Fabulous は "Science built by behavior change experts" + "30 million people use it" + Duke 大学発を前面に出す[^behavioralsci]。Smitch の「エビデンスベース」もこの authority レバーに該当（§2.6）。

社会的証明の **配置の二層構造**[^magicui]:
- **Credibility 層**（企業ロゴ・利用統計・著名人引用）: ページ上部で正当性を確立
- **Submission 層**（SSL・プライバシー文言・セキュリティ）: フォーム/CTA の近くで送信不安を緩和

> **Smitch 注意**: 偽の社会的証明はトーン（誠実さ = ブランドの核）と Cialdini の警告に反する[^cxl-cialdini]。**人数がまだ少ないうちは数字を出さず、「コンセプトへの賛同」や「開発の透明性」で代替** するのが安全。

### 2.5 Founder narrative

「なぜ私が作っているか」を見せるか隠すか。

**見せる派の根拠**: indie hacker の founder story は **信頼と親近感を生むマーケティング資産**。Pieter Levels / Marc Lou / Arvid Kahl は全員 build in public で成長[^indiehackers]。LP の founder story は採用・PR・継続コンテンツにもなる。

**隠す派の根拠**: 近年 build in public への揺り戻しがあり、MRR を消す founder が増えた（コピーキャット・安全性・ブランド関係）[^indiehackers]。

**実務的中間解**: **「個人の物語・顔（信頼構築）」と「機微な数字（コピーキャット餌）」を分ける**。顔と物語は残し、売上数字だけ隠すのが多くの founder のスタンス[^indiehackers]。

> **Smitch への翻訳**: Smitch のトーンは「静かに寄り添う / 見せびらかさない」。**インフルエンサー型の顔出し founder ストーリーは §7 のアンチパターン**。一方、「なぜこのアプリを作ったか = 既存習慣アプリへの違和感」は brief の核そのもので、**「founder の野心」ではなく「問題意識の共有」として控えめに語る** のが整合的（§9.7 で判断）。

### 2.6 Evidence / Science

Smitch の「エビデンスベース」を LP でどう翻訳するか。

**制約**: 論文 PDF の直接引用 NG / "研究によると" レベルの噛み砕きは OK（鈴木祐・池谷裕二 系の言い回し）。

**手本**: Fabulous は Duke 大学発を「authority + social proof」として使うが、論文を貼らず「behavior change experts が作った」と噛み砕く[^behavioralsci]。これは Cialdini の **Authority 原則**[^cxl-cialdini] の適用。

**実装方針**:
- 「ハーバード大学の研究によると」「行動科学の知見では」レベルの平易な要約（plan.md change-F）。
- バリュー軸インパクト可視化（健康寿命 +2.4 年 / 生涯コスト -82 万円 / 集中時間 +2.1h）を **具体的な数値カード** で見せる（`lp-desire-onboarding-brief.md` の Evidence デモ）。
- 数値は「煽り」ではなく「静かな事実提示」のトーンで。

---

## 3. ウェイティングリスト動線のベストプラクティス

### subtitle: friction（摩擦）と commitment（コミット）のせめぎ合いが核心

### 3.1 Friction vs Commitment のバランス

これがティザー LP 最大の設計論点。

**Friction 削減派（メールだけ）の根拠**:
- フォームのフィールドを増やすほどコンバージョンは下がる[^twocents][^baymard-bench]。
- 2026 ベンチマーク: コンバージョンは **3 フィールドで 23.1% → 5 フィールドで 17.0% → 7 フィールドで 11.4% → 10+ で 6.9%**。特に **5→7 フィールドが「崖（cliff）」**（1 フィールドあたり約 2.8 ポイント低下）[^baymard-bench]。
- 離脱理由の最多は **フォームの長さ（37%）**、次いで不明瞭なフィールド（22%）、データ利用への不信（19%）、送信時の検証エラー（14%）[^baymard-bench]。
- Trello / Robinhood はメール 1 フィールドのみ[^magicui][^viral-robinhood]。

**Commitment 重視派（多少聞く）の根拠**:
- Cialdini の **Commitment & Consistency**: 小さなコミットを取ると、その後の一貫した行動が起きやすい（庭の小看板 → 大看板で **400% 増**の古典実験）[^cxl-cialdini][^unbounce-persuasion]。
- フォームが長い ≠ 必ず低コンバージョン。**Unbounce 実験**: 9 → 6 フィールドに削ったら逆に 14% 低下。9 フィールドに戻して **「どれが任意か明示 + 説明を改善」したら 19% 増**。教訓は **「フィールド数だけでは決まらない。明瞭さと文脈が効く」**[^baymard-bench]。
- 質を取るための非対称性: ある事例では CVR を 2.3% → 4.1% に上げたが顧客転換率が 30% → 18% に落ち、複合 CVR はほぼ横ばい（0.69% → 0.74%）で **顧客の質が下がった**。**waitlist は raw 件数でなく qualified intent で測れ**[^waitlister-cvr]。

**結論（Smitch 向け）**:
- **必須フィールドは最小に**（メール + 環境チェックボックスのみ）。
- **質的データ（ペイン / WTP / なりたい自分）は明示的に「任意」とラベルし、なぜ聞くかを 1 行添える**（Unbounce の知見）。
- これは plan.md の change-G スキーマ（必須: email + 環境 / 任意: 類似アプリ・困りごと・WTP・なりたい自分）と既に整合。**「任意であることの明示」と「聞く理由の提示」を実装に足す** のが追加 TODO。

### 3.2 インセンティブ設計

#### "先行アクセス" の見せ方

CTA を **"Join the waitlist for early access"** のように先行アクセスを明示[^flowjam]。Smitch では「送信したユーザーがプロトタイプ版を先行で触れる」を約束できる（既存 Concept Prototype が動くため、**「待たせない先行アクセス」が即提供できる稀有なケース**、§5 参照）。

#### 紹介プログラム（Dropbox / Robinhood 型）

- **Robinhood**: 順位ベース。「リスト上位ほど早くアクセス」+ サンクスページで即座に順位表示 & シェア促進 → ローンチ前に約 100 万人[^viral-robinhood]。
- **Dropbox**: 双方向報酬（紹介者・被紹介者の両方に容量）。報酬を **製品価値そのもの（容量）** にしたのが鍵。15 ヶ月で 3,900% 成長[^viral-dropbox]。
- **2025 トレンド**: 金銭報酬より **順位上昇（position-based）報酬** の方がシェア率が高い（即時・個人的価値 + 緊急性 + 排他性を維持）[^twocents]。

> **Smitch 注意（重大）**: Dropbox の「3,900%」は **既にクチコミが回っていたものを増幅しただけ**（紹介開始時点で signup の 1/3 がクチコミ由来）[^viral-dropbox]。**紹介プログラムは「何もない所からは何も生まない。既にあるものを増幅するオペレーション」**。Smitch のように流入チャネル未構築の段階では、**まず流入を作るのが先**。紹介プログラムは「入れるか入れないか」を §9.5 で慎重に判断（順位表示・カウントダウンは Smitch の「煽らない」トーンと緊張関係にある点も注意）。

#### 順位表示・カウントダウン

- カウントダウンタイマーは緊急性を作るが、**実際のローンチ日がある時のみ**。偽のカウントダウンは信頼を破壊する[^twocents]。
- Cialdini Scarcity: 偽の希少性は厳禁[^cxl-cialdini]。

> **Smitch 注意**: 連続日数・ランキング・煽りは brief で明確に NG。**順位表示やカウントダウンはトーンに反するリスクが高い**。入れる場合も「静かな知性」のトーンで（例: 派手なタイマーではなく「準備中です。整い次第ご案内します」）。

### 3.3 確認画面・サンクスページ

**心理的に最も強力なページ**。post-conversion のエンゲージメント率は cold traffic の 5-10 倍[^drip-thankyou]。

働く心理:
- **Commitment & Consistency**: 1 つ行動した直後は、一貫した次の行動を取りやすい（foot-in-the-door）。この高エンゲージ窓は **数分しか続かない** ので、サンクスページのタイミングが critical[^drip-thankyou]。
- **Post-purchase rationalization**: 登録直後は「自分の判断を正当化したい」状態。**安心させる情報** を置くべき[^drip-thankyou]。

ベストプラクティス:
- **行き止まり（dead end）を避ける**。"Thanks, we got it." だけで終わらせない[^drip-thankyou]。
- **単一の focused な次アクション CTA**（複数 CTA の 2-3 倍コンバージョン）[^drip-thankyou]。
- 人間味のあるメッセージ（チーム/創業者からの一言）[^drip-thankyou]。

> **Smitch への翻訳**: plan.md の Thank You 設計（「ご登録ありがとうございます」+「頂いた声を反映」+ Concept Prototype 案内）は **教科書的に正しい**。サンクスページの単一次アクション = **「Concept Prototype を今すぐ触る」**。これは「待たせない先行アクセス」+ post-purchase rationalization（判断の正当化）+ commitment escalation を全部満たす理想的設計。**「頂いた声を反映」= co-creation の約束** も commitment を強化する。

### 3.4 メール nurture

**最大の失敗は「集めて沈黙」**。登録後に何も送らないと intent は減衰する[^stormy][^sequenzy]。

データ:
- nurture を受けた subscriber はローンチ時のコンバージョンが **2-3 倍**[^stormy]。
- 健全な nurture sequence のローンチ日コンバージョンは **15-25%**。10% 未満なら sequence が機能していない[^stormy]。
- **アクセスまでの時間が決定的**: 1 ヶ月以内にアクセスを渡せば最終コンバージョン平均 ~50%、90 日超で 20% 未満（一桁まで落ちる例も）[^waitlister-cvr]。

cadence:
- ローンチ直前は週 1-3 通、終盤で頻度を上げる[^sequenzy]。
- 長期 waitlist は月 1 の editorial リズム（problem education / product clarity を交互に）でバーンアウトを防ぐ[^stormy]。
- **plain text 風が heavy HTML より効く**（個人的・到達率良）[^stormy]。

> **Smitch 注意**: plan.md では **「確認メール送信 / メルマガ配信（Resend 統合）は scope 外（別 longrun）」**。つまり今回はメール nurture を実装しない。**だからこそ、Concept Prototype という「待たせない先行アクセス」が nurture の代替になる** — メールで繋ぎ止める必要が薄い。これは Smitch の構造的アドバンテージ。ただし将来 nurture を入れる前提で、**フォームで取得したペイン/なりたい自分を「次の連絡で活かす」設計にしておく**（§9.6）。

---

## 4. ユーザーヒアリングフォーム設計

### 4.1 ヒアリングフォームを LP に置く意味

単なる waitlist（メールだけ）との違い = **質的データの取得**。

- waitlist は「誰が興味を持ったか」しか分からない。
- ヒアリングフォームは「**なぜ興味を持ったか / 過去に何を試したか / いくら払うか / どうなりたいか**」を取れる。
- これは JTBD / Mom Test の「顧客リサーチ」を LP 上で非同期に回すことに等しい。

trade-off: フィールドが増えるとコンバージョンが下がる（§3.1）。**だから「必須 = 最小」「任意 = リサーチ用」に分離** する。

### 4.2 質問設計のパターン

#### Mom Test（Rob Fitzpatrick）由来 — 過去の行動を聞く

**核心**: 未来の意向（"使いますか？"）でなく、**過去の具体的行動を聞け**。人は未来について楽観的に・相手を喜ばせるように答えるが、過去の行動は嘘をつかない[^momtest]。

3 ルール[^momtest]:
1. 自分のアイデアでなく、相手の生活を話す
2. 未来の一般論・意見でなく、**過去の具体を聞く**
3. 話すより聞く

良い質問（過去・実問題）[^momtest]:
- 「今これをどう解決していますか？」
- 「**最後にこの問題に直面したのはいつですか？その時どうしましたか？**」
- 「これを解決するためにお金を払ったことはありますか？」

悪い質問（意見・仮定）[^momtest]:
- 「これは良いアイデアだと思いますか？」
- 「もしこういう機能があったら使いますか？」

本物の問題のシグナル[^momtest]: 解決に費やした時間 / 既に払った金 / 自作した workaround。

#### JTBD インタビュー型 — switch と First Thought

- 「**When... I want to... So that I...**」で job を定義[^jtbd]。
- 「**The First Thought**」: その人が「新しい解決策が要る」と最初に気づいた瞬間を探る（深い動機の発見に有効）[^jtbd]。
- 「switch」: 古い解決策から新しいものへの乗り換えを描く。代替手段（=「何もしない」も含む）を必ず聞く[^jtbd]。
- 不安（anxiety）を聞いて、それを LP / FAQ で直接解消する[^jtbd]。

#### 「過去の行動」 vs 「未来の意向」

JTBD でも Mom Test でも一致した結論: **意向と行動には大きなギャップ（intention-action gap）がある**[^momtest]。LP のヒアリングは「使いたいですか？」より「**今、何を使っていますか / 過去に何を試して何で辞めましたか**」を聞く方が信頼できるデータになる。

> **Smitch への翻訳**: plan.md の任意項目「**使っている類似アプリ / 困っている理由 / WTP**」は Mom Test の「現在の解決策 / 実問題 / 支払い意思」とほぼ一致 — **設計が既に正しい**。追加で「**最後にいつ習慣化に挫折したか**」のような過去行動質問を入れる余地がある（§9.6）。逆に「**なりたい自分**」は未来志向だが、これは Smitch のコンセプト体験そのもの（co-creation 入力）なので別枠で扱う。

### 4.3 質問数とコンバージョンの実証データ

- §3.1 の通り、5→7 フィールドが崖。**必須は 5 以下に抑える**[^baymard-bench]。
- JTBD の質的サーベイは自由記述中心 → 完了率は下がるが情報は濃い。**「少数の濃い回答」を狙う**。インセンティブ（先行アクセス）で完了率を補う[^athenno]。
- 7+ フィールドなら **マルチステップ化** が有効[^baymard-bench]。

### 4.4 Smitch のオンボーディング訴求（欲求カード）と連動した質問設計

**最大の戦略的機会**。`lp-desire-onboarding-brief.md` の欲求カード（「今、いちばん変えたいことは？」+ 8 枚）は、**そのまま LP のヒアリング第一問に転用できる**。

連動案:
- LP の waitlist フォームの「なりたい自分」自由入力欄を、**欲求カード選択 UI に置き換える**（または併用）。
- ユーザーが「夕方まで動ける体が欲しい」を選ぶ = **質的データ取得 + オンボーディング体験のプレビュー + commitment（小さな選択）** を一度に達成。
- 選択直後に「Smitch はこれを睡眠の質 / VO2max に翻訳します」と見せれば、**プロダクト価値の体験 = 強力な転換ドライバー**。

これは Cialdini の Commitment（小さな選択をさせる）+ JTBD（job を選ばせる）+ Smitch のコンセプト体験を **同時に満たす**。

> **Smitch 注意**: brief では欲求カードは初期表示 8 枚上限（選択負荷）。LP では **2 列 / 4 枚抜粋** で見せる方針。フォームに組み込むなら **4 枚 + 「その他（自由入力）」** が friction とのバランス上現実的（§9.6 で確定）。

---

## 5. 旧バージョン（既存 Concept Prototype）との関係

Smitch 固有の変則事情。**「未公開ティザー」なのに「動くプロダクトが別 URL にある」**。

### 5.1 「動くプロダクト」がある状態でティザーをどう見せるか

これは弱みではなく **強み**。多くのティザーが直面する「待たせると intent が減衰する」問題（90 日超で 20% 未満[^waitlister-cvr]）を、**「登録したら今すぐ Concept Prototype を触れる」で回避できる**。

つまり Smitch の waitlist は厳密には「待たせない waitlist」。これは:
- post-purchase rationalization を即満たす（登録 → すぐ触れて判断を正当化）[^drip-thankyou]
- nurture メール不在（scope 外）の穴を埋める
- 「先行アクセス」の約束を即履行 = 信頼

### 5.2 旧バージョンへの導線をどこに置くか / 隠すか

**選択肢**:
- **A: サンクスページのみ**（plan.md 既定）— 「登録した人だけの特典」感を演出。exclusivity を保てる。新 LP のコンセプト（新版）を汚さない。
- **B: LP 本体にも控えめに**（例: How it works の下に「今すぐ触れる旧版はこちら」）— ただしコンセプトが違う旧版を見せると混乱リスク。
- **C: 完全非表示** — 旧版の存在を LP で一切触れない。

plan.md の原文メモ: *「ウェイトリスト送信後の送信完了画面で置いておいていいかもしれません。Smitch(Concept Prototype ver) でどうだろう？」* → **A が既定。** これは exclusivity（登録特典）と clarity（新版 LP を旧版で汚さない）の両面で妥当。§9.4 で最終確認。

### 5.3 「これは新版です / 旧版はこちら」表記のパターン

旧版を見せる場合の表記は明確に区別する:
- 「**Smitch（Concept Prototype ver）**」のようにバージョンを明示（plan.md 案）。
- 「これは現在のコンセプトとは異なる先行プロトタイプです」と一言添えて期待値をコントロール（混乱防止）。

> **Smitch 注意**: 新 LP のコンセプト（欲求起点 / なりたい自分）と旧版（エビデンスベースの習慣管理プロトタイプ）は **コンセプトが違う**（plan.md 原文）。旧版を前面に出すと「言ってることと違う」混乱を生む。**サンクスページで「先行的に触ってみたい方はぜひ」と控えめに案内** が安全。

---

## 6. 競合・ベンチマーク事例

各事例: 秀逸な点 / Smitch に活かせる点 / Smitch のトーンに合わない点。スクリーンショットの代わりに URL + 構造を言語化。

### 【習慣・ウェルネス】1. Fabulous（fabulous.co）

- **秀逸**: "Science built by behavior change experts" + "30 million people use it" + Duke 大学発を前面に。**authority + social proof + academic credibility** の三段重ね[^behavioralsci]。
- **Smitch に活かせる**: 「エビデンスベース」を **権威レバー**として翻訳する手本。論文を貼らず「behavior change experts が作った」と噛み砕く = Smitch の「論文直接引用 NG / 研究によると OK」制約と完全一致。
- **合わない点**: 30M という数字は Smitch にはまだ無い。Fabulous の gamification 寄りの作り込み（ルーティン強制）は Smitch の「煽らない」と方向が違う。

### 【習慣・ウェルネス】2. Finch（finchcare.com）

- **秀逸**: キャラクター（鳥の Pebbles）への投資で自己改善を「自分ごと」から「キャラの世話」に転換。価値の一部を意図的に保留して次回開封への期待を作る retention 設計[^medium-onboarding]。
- **Smitch に活かせる**: 「価値を一度に全部見せず、anticipation を作る」原則。LP では欲求カード → 翻訳 → 習慣ランキングの **一部だけ** を見せ、「続きはアプリで」と引く。
- **合わない点**: キャラクター / ゲーミフィケーションは Smitch の「静かな知性」と正反対。**Finch の手法は構造（anticipation）だけ借り、表現（キャラ・ゲーム）は借りない**。

### 【indie SaaS】3. Granola（granola.ai）

- **秀逸**: 単文の value proposition "The AI notepad for people in back-to-back meetings." で **誰向け・何をする** が一目で分かる（blink test 合格）[^lapaninja]。
- **Smitch に活かせる**: Hero の 1 行を blink test 基準で磨く。Smitch の 3 行コピーの **1 行目だけで「何か」が伝わるか** の検証材料。
- **合わない点**: 特になし。むしろ「明快さ」は Smitch の「静かな知性」と相性が良い。

### 【indie SaaS】4. Linear（linear.app）

- **秀逸**: dark theme + gradient accent + 抑制された高品質モーションで「プロ向けソフト」の世界観を確立。**美しさと明快さの両立**[^lapaninja]。
- **Smitch に活かせる**: 「restrained motion（micro-interaction を最小限）」の思想は Smitch の motion budget（2 つだけ）と完全に一致。
- **合わない点**: Linear の dark theme + Inter フォント + purple gradient sphere は Smitch の Hard Rules（Inter 禁止 / purple gradient 禁止）に **真っ向から抵触**。**世界観の作り方（restraint）は学び、視覚要素は採用しない**。

### 【indie SaaS】5. Raycast（raycast.com）

- **秀逸**: "Your shortcut to everything" の簡潔なベネフィット + dark tone + 魅力的なイラスト[^lapaninja]。
- **Smitch に活かせる**: ベネフィット先行ヘッドラインの簡潔さ。
- **合わない点**: dark / neon 寄りのビジュアルは Smitch のトーン（soft natural light / editorial）と不一致。

### 【B2C waitlist】6. Superhuman（superhuman.com）

- **秀逸**: 180,000 人 waitlist。一括 onboarding せず **1 人ずつ application + 30 分 onboarding コール** で qualify + evangelist 育成。希少性を維持し $30/月 を払わせる土台を作った[^waitlister-cases][^viral-superhuman]。
- **Smitch に活かせる**: 「waitlist = 単なるメール収集でなく、qualify + リサーチの場」という思想。Smitch のヒアリングフォームはこの軽量版。
- **合わない点**: 30 分コールは個人開発では非現実的。過度な exclusivity は「高すぎて少数しか買わなかった」批判もある[^viral-superhuman]。**Smitch は exclusivity を煽らず、Concept Prototype で即アクセスを渡す逆張りが合う**。

### 【B2C waitlist】7. Robinhood（robinhood.com）

- **秀逸**: 順位ベース紹介ループ。メール 1 フィールド → サンクスページで即順位表示 + シェア促進 → ローンチ前 100 万人[^viral-robinhood]。
- **Smitch に活かせる**: **サンクスページを「次の行動を促す場」にする** 設計思想（Smitch は順位でなく Concept Prototype 案内に転用）。
- **合わない点**: 順位・ゲーミフィケーションは Smitch の「連続日数 NG / 煽らない」と緊張関係。**メカニズム（サンクスページ活用）は借り、ゲーム性は借りない**。

### 【B2C waitlist】8. Dropbox（dropbox.com）

- **秀逸**: 製品価値そのもの（容量）を報酬にした双方向紹介。onboarding 最終ステップに紹介を埋め込み（peak engagement）[^viral-dropbox]。
- **Smitch に活かせる**: 「報酬は製品価値と一致させる」「peak engagement（サンクス直後）に次アクションを置く」。
- **合わない点**: Smitch は容量のような無限増殖報酬を持たない。**§3.2 の警告（紹介は既存クチコミの増幅でしかない）を踏まえ、流入未構築の今は紹介より流入作りが先**。

**まとめ**: Smitch は **構造（anticipation / commitment / サンクスページ活用 / restraint）を学び、表現（ゲーミフィケーション / dark neon / 順位煽り / exclusivity 煽り）は借りない**。最も相性が良いのは Granola（明快さ）と Fabulous の authority レバー（ただし数字は除く）。

---

## 7. アンチパターン（Smitch のトーンに照らして）

各項目は brief / CLAUDE.md の制約 + リサーチ知見に基づく。

| アンチパターン | なぜ NG か | 根拠 |
|---|---|---|
| **連続日数バッジ / streak 訴求** | Smitch の存在理由そのものを否定（「連続日数がゼロに戻った虚無感」からの解放が価値） | brief / CLAUDE.md Hard Rules |
| **"AI でパーソナライズ" 連呼** | 2025 は AI を謳うほど陳腐化。Smitch の価値は「科学的根拠」であって「AI」ではない | Smitch コンセプト |
| **"10x improvement" / "人生が劇的に変わる" 系の煽り** | 「すごい！最高！」のトーンは brief で明確に NG。Cialdini の偽scarcity と同じ信頼破壊 | brief / [^cxl-cialdini] |
| **インフルエンサー型 founder ストーリー（顔出し成功者アピール）** | 「成功者崇拝 / SNS 映え自己改善」は brief で NG | `lp-desire-onboarding-brief.md` |
| **偽の waitlist 人数 / 偽カウントダウン** | 誠実さ = ブランドの核。偽scarcity は見抜かれる | [^cxl-cialdini] / [^twocents] |
| **順位煽り / ランキングで競わせる** | ゲーミフィケーション NG。「静かに寄り添う」と正反対 | brief |
| **purple gradient on white / glass orb / Inter フォント** | AI slop の代表。Hard Rules で視覚的に禁止 | CLAUDE.md / `lp-image-to-code-workflow-2026.md` |
| **植物擬人化（「習慣を育てる」）/ キャラクター育成** | Finch 型。Smitch のトーンと不一致 | CLAUDE.md Hard Rules |
| **カルーセル / スライダー Hero** | メッセージが薄まり CTA フォーカスを壊す | [^evergreen] |
| **2 つの primary CTA を横並び** | 決定麻痺。Hard Rules でも禁止 | CLAUDE.md / [^evergreen] |
| **偉人 / 成功者の肖像を主ビジュアルに** | 「どんな偉人のようになりたいですか？」を主問いにしないルール | `lp-desire-onboarding-brief.md` |
| **欲求の本音を露骨に出す（「モテたい」「金が欲しい」）** | 品位を保つ翻訳が必要（「人に選ばれる自分でいたい」） | `lp-desire-onboarding-brief.md` |
| **必須フィールドを増やしすぎ（7+）** | コンバージョンの崖 | [^baymard-bench] |
| **集めて沈黙（nurture なし放置）** | intent 減衰。ただし Smitch は Concept Prototype で代替可能 | [^stormy] |

---

## 8. アカデミック / 心理研究の参照

### 8.1 Scarcity / FOMO

- **Cialdini, R.** *Influence: The Psychology of Persuasion* (1984)。Scarcity = 希少・限定とされたものは知覚価値と需要が上がる。**loss aversion（失う恐怖）** が駆動。「得られる利益」より「失うもの」を示す方が効く[^cxl-cialdini][^iaw-cialdini]。
- 応用注意: **偽の希少性は厳禁**（Booking.com の "last available room" は実在在庫に基づく）[^cxl-cialdini]。
- waitlist では exclusivity / scarcity / social proof / anticipation の 4 トリガーが複合的に働き compound growth を作る[^twocents]。Superhuman / Clubhouse がその典型[^waitlister-cases]。

### 8.2 Commitment & Consistency

- **Cialdini** の第 2 原則。一度（特に公的・能動的・書面で）コミットすると、一貫した行動を取りやすい[^cxl-cialdini]。
- 古典実験: 小看板への同意 → 大看板受諾が **400% 増**[^unbounce-persuasion]。
- foot-in-the-door: 小さな行動の直後は次の行動を取りやすい。サンクスページの数分が critical[^drip-thankyou]。
- LinkedIn のプロフィール段階的入力がこの原則の応用[^cxl-cialdini]。

> **Smitch 応用**: 欲求カードを選ばせる（小コミット）→ メール登録（中コミット）→ Concept Prototype を触る（大コミット）の **commitment escalation 階段** を LP + サンクスで設計できる（§4.4 / §3.3）。

### 8.3 Pre-launch / waitlist psychology

- 4 トリガー（exclusivity / scarcity / social proof / anticipation）の複合が viral loop を作る[^twocents]。
- **anticipation effect**: 機能・ベネフィット・先行アクセスを teaser することで受動的興味を能動的期待に変える[^twocents]。
- intention-action gap: 「使いたい」と「使う」は乖離する → 過去行動を聞け（Mom Test / JTBD）[^momtest][^jtbd]。
- アクセスまでの時間がコンバージョンを支配（1 ヶ月以内 ~50% / 90 日超 <20%）[^waitlister-cvr]。

### 8.4 JTBD（Clayton Christensen）

- 顧客は product を「job を片付けるために hire する」。「When... I want to... So that I...」で job を定義[^jtbd]。
- The First Thought / switch / anxiety の発見がプロダクト方向性とコピーを規定[^jtbd]。

### 8.5 The Mom Test（Rob Fitzpatrick）

- 未来の仮定でなく過去の具体行動を聞け。3 ルール（相手の生活 / 過去の具体 / 聞く）[^momtest]。
- 本物の問題のシグナル = 費やした時間・払った金・自作 workaround[^momtest]。

---

## 9. ヒアリング項目テンプレート（次セッションで oratta に聞く質問集）

**このセクションがレポートの核。** 各質問に「質問本文 / なぜ聞くか（参照セクション）/ 想定回答 A/B/C」を併記。oratta が選択肢を見て即答できる形式。

### 9.1 マーケティング目標

**Q1-1. ティザー期間中の数値目標は？**
- なぜ: 成功指標を決めないと LP の最適化軸が定まらない。plan.md は「CVR 3% 以上」を仮置きしているが、waitlist の well-optimized は 20-40%（定義に注意）[§3.1]。
- A) waitlist 登録数（例: 3 ヶ月で 100 / 300 / 1000 人）
- B) 質的データの件数（ペイン/なりたい自分の回答数）を重視（qualified intent 重視[§3.1]）
- C) 数値目標は置かず、定性フィードバックの質だけを見る

**Q1-2. 想定流入チャネルは？**
- なぜ: 紹介プログラムは「既存クチコミの増幅」でしかない（流入ゼロからは何も生まない）[§3.2]。流入手段がないと waitlist 戦略が空回りする。
- A) SEO（plan.md の検索キーワード仮説: 「習慣化 アプリ 続かない」等）中心
- B) SNS / build in public（X / note 等で発信）
- C) 既存 Concept Prototype ユーザー / 知人 / コミュニティから手売り
- D) まだ未定（→ ここを先に決める必要あり）

### 9.2 ターゲット詳細化

**Q2-1. ペルソナは 1 人か複数か？**
- なぜ: 「全員に訴求 = 誰にも刺さらない」。1 ペルソナ・1 ユースケースに絞るのが定石[§2.1]。plan.md は「拓郎 38 歳」1 人を確定済み。
- A) 拓郎 1 人に完全集中（メッセージ統一）
- B) 拓郎 + サブペルソナ（例: 20 代後半の自己投資層）も視野
- C) 性別・年齢を広げる（女性層 / 50 代も含める）

**Q2-2. 「習慣アプリ挫折経験」以外の絞り込み軸を足すか？**
- なぜ: 絞り込みが LP コピーの「これは自分のことだ」認識を強める[§2.2]。
- A) 「科学的に正しい〇〇本を手に取る層」をもう一段強調（brief 既定）
- B) 「SNS の朝活インフルエンサーに違和感」を前面に
- C) 職種・ライフステージ（子育て中 / 管理職 等）で絞る

### 9.3 価値提案の優先順位

**Q3-1. LP で最も訴求したい軸は「欲求 / 科学 / 習慣」のどれか？**
- なぜ: Hero の 1 行は blink test を通す必要がある（5 秒で「何か」が伝わる）[§2.1]。3 軸全部は載らない。
- A) **欲求起点**（「なりたい自分から始める」）— brief / desire-onboarding 既定
- B) **科学/エビデンス**（「研究に基づく習慣選び」）— 差別化の硬さ
- C) **手段と目的の逆転**（「習慣が目的ではない、人生が目的」）— コンセプトの核

**Q3-2. Hero 3 行コピーは現状維持か、1 行目を blink test 用に磨くか？**
- なぜ: 現 Hero「なりたい自分への最短コースを見つける / エビデンスベースで… / 人生を切り替えるためのアプリ」は 3 行で blink test にやや長い。Granola の単文が手本[§2.1, §6]。
- A) 現状維持（plan.md で変更禁止指定あり → 変えるなら明示承認が要る）
- B) 1 行目を強い単文に圧縮、2-3 行目を subheadline に格下げ
- C) コピー自体を再検討

**Q3-3. 既存習慣アプリとの差別化（比較表）を見せるか / 隠すか？**
- なぜ: 競合に言及すると差別化が明確になる一方、未公開段階で他社を貶めるトーンはリスク。
- A) Why Smitch で比較表を見せる（plan.md change-D 既定）
- B) 比較はせず「Smitch の世界観」だけを語る
- C) 競合名は出さず「既存の習慣アプリ」と一般化（既定）

### 9.4 旧バージョンの扱い

**Q4-1. Concept Prototype への導線をどこに置くか？**
- なぜ: 旧版は「待たせない先行アクセス」という Smitch 固有の強み。だが新版コンセプトと違うため混乱リスクもある[§5]。
- A) **サンクスページのみ**（plan.md 既定、exclusivity 維持）
- B) LP 本体にも控えめに（例: How it works 下）
- C) 完全非表示

**Q4-2. 旧版ユーザーへの移行訴求をするか？**
- なぜ: 既存ユーザーがいるなら新版 waitlist に誘導できる。
- A) する（旧版内バナー等 — ただし plan.md では旧版本体改修は scope 外）
- B) しない（今回は LP → 旧版の一方向のみ）

### 9.5 waitlist インセンティブ設計

**Q5-1. 先行アクセス以外に何を約束するか？**
- なぜ: インセンティブが弱いと登録動機が薄い。報酬は製品価値と一致させるのが定石[§3.2]。
- A) 先行アクセス（Concept Prototype）のみ（既定、十分強い）
- B) 「頂いた声を研究に反映」co-creation の約束を強調（commitment 強化[§3.3]）
- C) 正式版での特典（早期登録者割引 / founding member 価格 等）

**Q5-2. 紹介プログラムを入れるか？**
- なぜ: Dropbox 型は強力だが「既存クチコミの増幅」でしかなく、流入ゼロでは機能しない[§3.2]。順位煽りは Smitch のトーンに反するリスク[§3.2, §7]。
- A) 入れない（流入未構築の今は時期尚早、トーンとも緊張関係）— **推奨**
- B) 静かな形で入れる（順位煽りなし、「友人を招待」程度）
- C) 将来フェーズで検討（今回 scope 外）

**Q5-3. waitlist 人数を可視化するか？**
- なぜ: 社会的証明は強力だが、少人数で出すと逆効果。偽の数字は厳禁[§2.4, §8.1]。
- A) 出さない（少人数のうちは。誠実さ優先）— **推奨**
- B) 一定数（例: 100 人）超えたら出す
- C) 最初から出す

### 9.6 ヒアリングフォームの中身

**Q6-1. 必須フィールドは何にするか？**
- なぜ: 5→7 フィールドが崖。必須は最小に[§3.1, §4.3]。
- A) メールのみ（最小 friction、Trello/Robinhood 型）
- B) メール + 使いたい環境チェックボックス（plan.md 既定、ネイティブ化判断材料）
- C) メール + 環境 + 欲求カード 1 つ（commitment 強化 + 質的データ）

**Q6-2. 任意質問は何を聞くか？**
- なぜ: Mom Test = 過去の行動 / 払った金。意向より行動[§4.2]。「任意」と明示し聞く理由を添える[§3.1]。
- A) plan.md 既定（使っている類似アプリ / 困っている理由 / WTP / なりたい自分）
- B) A + 過去行動質問（「最後に習慣化に挫折したのはいつ / 何で辞めたか」）
- C) 最小限（WTP だけ）

**Q6-3. 欲求カードを LP / フォームに組み込むか？**
- なぜ: 欲求カードは「質的データ + オンボーディング体験プレビュー + 小コミット」を同時達成する最大の機会[§4.4]。
- A) Hero の UI モックとして見せるだけ（plan.md / desire-brief 既定）
- B) **フォームの「なりたい自分」入力を欲求カード選択 UI に置き換える**（4 枚 + その他）
- C) 自由入力のまま（カード化しない）

**Q6-4. フォームの想定回答時間は？**
- なぜ: 自由記述は完了率を下げるが情報は濃い。先行アクセスがインセンティブになる[§4.3]。
- A) 30 秒以内（必須のみ即送信）
- B) 1-2 分（任意も含め丁寧に）
- C) マルチステップで分割（7+ 項目なら）[§4.3]

### 9.7 Founder narrative の出し方

**Q7-1. oratta の顔・名前を出すか？**
- なぜ: founder story は信頼資産だが、インフルエンサー型顔出しは Smitch のトーンに反する[§2.5, §7]。
- A) 出さない（プロダクト・コンセプトのみで語る）
- B) 名前のみ / 顔は出さず「作り手の問題意識」を控えめに
- C) 顔・名前を出して build in public（流入 Q1-2 が SNS なら相性良）

**Q7-2. 「なぜ作っているか」をどう書くか？**
- なぜ: brief の核は「既存習慣アプリへの違和感」。これは founder の野心でなく問題意識の共有として語ると整合[§2.5]。
- A) 「既存習慣アプリへの違和感」を一人称で短く（brief 既定路線）
- B) Why Smitch セクションに溶かし込む（独立 founder セクションは作らない）
- C) About / Story ページを別途作る

### 9.8 トーンの最終確認

**Q8-1. 以下のトーン制約に変更はないか（既存方針の再確認）？**
- 静かな知性 / 寄り添うが押し付けない / "研究によると" レベル / 論文直接引用 NG / 「すごい！最高！」NG / 連続日数・ゲーミフィケーション・罪悪感ドリブン NG
- A) すべて維持（変更なし）
- B) 一部緩和したい（具体的に: ___）

**Q8-2. §7 アンチパターン一覧に追加 / 削除はあるか？**
- A) このままで OK
- B) 追加したい NG がある（___）

---

## 10. LP セクション構成テンプレート（ヒアリング結果を流し込む雛形）

§9 のヒアリング後、即実装に入れる穴埋めテンプレ。plan.md の 6 セクション構成に対応。

```markdown
## Hero
- メイン見出し（1 行 / blink test 合格）: 〔Q3-1, Q3-2 の回答〕
- サブ見出し: 〔___〕
- UI モック: 欲求カード選択画面〔Q6-3〕
- primary CTA（1 つだけ）: "ウェイティングリストに登録" 〔§2.1〕
- secondary（テキストリンク）: "詳しく見る" → 下スクロール
- ※ 2 primary CTA 横並び禁止〔§7〕

## Problem → Solution
- ペイン提示（身近な不満、2 段重ね）: 〔desire-brief のペインリストから選定〕
  - 例: 「連続日数がゼロに戻った虚無感に、疲れていませんか」
  - 例: 「SNS で流れてきたライフハック、試して続かなかった経験は」
- 転換: 「問題は気合いではなく、経路です」〔§2.2〕
- Solution: 「Smitch は、なりたい自分から始めます」

## Why Smitch
- 比較表 表示有無: 〔Q3-3〕
- 結論行: 「だから続けやすい」ではなく「だから人生が動く」〔plan.md〕

## How it works（3 ステップ）
- 01 今、変えたいことを選ぶ（欲求カード）
- 02 Smitch が科学的に分解する（KPI 翻訳）
- 03 効きそうな順に習慣を選ぶ（習慣ランキング）
- ※ 価値の一部を保留し anticipation を作る〔§2.3, Finch〕

## Evidence
- 噛み砕き research summary（「研究によると」レベル、論文 PDF 引用 NG）: 〔最低 2 件〕
- バリュー軸インパクト数値カード（健康寿命 / 生涯コスト / 集中時間）〔desire-brief〕
- ※ authority レバー、ただし煽らない静かな事実提示〔§2.6, Fabulous〕

## CTA + Waitlist フォーム
- 見出し: 「Smitch は現在準備中です」
- 必須フィールド: 〔Q6-1〕
- 任意フィールド（「任意」明示 + 聞く理由 1 行）: 〔Q6-2〕〔§3.1〕
- 欲求カード組み込み: 〔Q6-3〕
- インセンティブ訴求: 〔Q5-1〕
- 紹介プログラム: 〔Q5-2 — 推奨は入れない〕
- 人数可視化: 〔Q5-3 — 推奨は出さない〕

## Thank You（送信後 success state）
- 確認メッセージ（行き止まりにしない）〔§3.3〕
- 単一の次アクション CTA: "Concept Prototype を今すぐ触る" 〔Q4-1〕
- co-creation の約束: 「頂いた声を反映します」〔§3.3, Q5-1〕
- ※ post-purchase rationalization を満たす数分が critical〔§3.3, §8.2〕

## Footer
- Privacy / Terms / © Genetta Inc.
- Founder narrative: 〔Q7-1, Q7-2 — 出すならここか About に〕
```

---

## 11. 出典一覧

[^magicui]: [7 SaaS Landing Page Best Practices for 2025 That Convert — Magic UI](https://magicui.design/blog/saas-landing-page-best-practices)（Unbounce 41,000 LP 分析: SaaS 中央値 3.8% / モバイル 82.9% / テスティモニアル +34% 等を引用）
[^twocents]: [SaaS Waitlist Strategy: Building Hype Before Launch — TwoCents](https://www.twocents.software/blog/saas-waitlist-strategy-building-hype-before-launch/)（4 トリガー / Superhuman 30 万 signup / 社会的証明 +270% / 偽カウントダウン警告）
[^flowjam]: [Waitlist Landing Page Examples: 10 High-Converting Pre-Launch Designs — Flowjam](https://www.flowjam.com/blog/waitlist-landing-page-examples-10-high-converting-pre-launch-designs-how-to-build-yours)（CTA 文言「Join the waitlist for early access」）
[^waitlister-cvr]: [How Does Your Conversion Rate Stack Up? — Waitlister](https://getwaitlist.com/blog/waitlist-benchmarks-conversion-rates) および [Maximizing Waitlist Conversion Rates — Jose Zamudio (Medium)](https://medium.com/@soyzamudio/maximizing-waitlist-conversion-rates-data-driven-strategies-6856cb91f83b)（20-40% ベンチ / アクセス時間と最終 CVR / qualified intent vs raw 件数）
[^baymard-bench]: [Form Conversion Rate Benchmarks 2026 — Digital Applied](https://www.digitalapplied.com/blog/form-conversion-rate-benchmarks-2026-data-points)、[5 Studies: Form Length & Conversion Rates — Venture Harbour](https://ventureharbour.com/how-form-length-impacts-conversion-rates/)、[Checkout Optimization: From 16 to 8 Fields — Baymard](https://baymard.com/blog/checkout-optimization-from-16-fields-to-8)（フィールド数の崖 / 離脱理由 37% / Unbounce 9→6→9 実験 / Baymard 12.8 → 6-8 推奨）
[^prismic]: [Website Hero Section Best Practices + Examples — Prismic](https://prismic.io/blog/website-hero-section)（NN/g 80% above the fold / 50ms 第一印象 / 5 秒テスト / Notion・Slack・Dropbox ヘッドライン例）
[^evergreen]: [Above the Fold: What Should Actually Be There in 2025 — Evergreen Digital Marketing](https://evergreendm.com/above-the-fold-what-should-actually-be-there-in-2025/)（clarity > cleverness / 単一 CTA / カルーセル NG）
[^lapaninja]: [Granola Landing Page Design — Lapa Ninja](https://www.lapa.ninja/post/granola/)、[Raycast — Lapa Ninja](https://www.lapa.ninja/post/raycast-4/)、[The rise of Linear style design — Bootcamp (Medium)](https://medium.com/design-bootcamp/the-rise-of-linear-style-design-origins-trends-and-techniques-4fd96aab7646)（blink test / ベネフィット型ヘッドライン +15-30% / restrained motion）
[^medium-onboarding]: [Main character energy: how 2 habit-building apps build motivation in onboarding — Christina Hill (Bootcamp/Medium)](https://medium.com/design-bootcamp/main-character-energy-how-two-habit-building-apps-build-motivation-in-onboarding-a3d144bd2818)（Finch の価値保留 / 25% は 1 回しか開かない / Fabulous の長期 payoff）
[^behavioralsci]: [Fabulous App Product Critique: Onboarding — The Behavioral Scientist](https://www.thebehavioralscientist.com/articles/fabulous-app-product-critique-onboarding)（Fabulous: "Science built by behavior change experts" / 30M / Duke 大学 Center for Advanced Hindsight 発）
[^waitlister-cases]: [5 Waitlist Launch Case Studies: Robinhood, Notion, Superhuman & More — Waitlister](https://waitlister.me/growth-hub/blog/case-studies-successful-product-launches-powered-by-waitlists)
[^viral-superhuman]: [Superhuman: Inside The World's Most Exclusive App — Valerie (Medium)](https://medium.com/dare-to-be-better/superhuman-inside-the-worlds-most-exclusive-app-and-its-ridiculous-onboarding-process-d0ad7a63a64) および [How To Build a Successful Waitlist Campaign — Duo Strategy](https://www.duostrategyla.com/ideas/how-to-build-a-waitlist-from-zero)（180,000 waitlist / 1 人ずつ 30 分コール / 高価格批判）
[^viral-robinhood]: [How Robinhood's Referral Built a 1M User Waiting List — Viral Loops](https://viral-loops.com/blog/robinhood-referral-got-1-million-users/)（順位ベース紹介 / サンクスページ即順位表示 / ローンチ前 100 万人）
[^viral-dropbox]: [How Dropbox Marketing Achieved 3900% Growth with Referrals — Viral Loops](https://viral-loops.com/blog/dropbox-grew-3900-simple-referral-program/) および [Dropbox Referral Program — Referral Rock](https://referralrock.com/blog/dropbox-referral-program/)（双方向報酬 / 製品価値 = 報酬 / peak engagement 埋め込み / 「紹介は既存クチコミの増幅」の注意）
[^momtest]: [What Is the Mom Test? — UXtweak](https://blog.uxtweak.com/the-mom-test/) および [The Mom Test for Customer Interviews (2026) — Koji](https://www.koji.so/blog/mom-test-customer-interviews-2026)（3 ルール / 過去行動 / intention-action gap / 本物の問題のシグナル）— Rob Fitzpatrick 著
[^jtbd]: [Jobs to Be Done (JTBD) in UX Research — User Interviews](https://www.userinterviews.com/ux-research-field-guide-chapter/jobs-to-be-done-jtbd-framework) および [The Ultimate Guide: JTBD Interviews — Valchanova.me](https://valchanova.me/customer-development-jobs-to-be-done/)（When/I want to/So that / The First Thought / switch / anxiety → LP 反映）— Clayton Christensen 由来
[^athenno]: [How to create a JTBD survey — ATHENNO](https://athenno.com/insights/how-to-create-a-jtbd-survey)（自由記述 / importance-satisfaction ペア / インセンティブで完了率補正）
[^cxl-cialdini]: [How to Use Cialdini's 7 Principles of Persuasion to Boost Conversions — CXL](https://cxl.com/blog/cialdinis-principles-persuasion/)（Scarcity / Commitment & Consistency / Authority / 偽scarcity 警告 / Booking.com・Monetate 事例）— Robert Cialdini *Influence* (1984) 由来
[^unbounce-persuasion]: [How to Use the 6 Principles of Persuasion to Create Landing Pages That Convert — Unbounce](https://unbounce.com/landing-pages/six-principles-of-persuasion-landing-pages/)（庭の小看板 → 大看板 400% 増の古典実験）
[^iaw-cialdini]: [Dr. Robert Cialdini's Seven Principles of Persuasion — Influence At Work](https://www.influenceatwork.com/7-principles-of-persuasion/)（原典に基づく 7 原則の公式解説）
[^drip-thankyou]: [9 Thank You Page Ideas to Boost Conversions — Drip](https://www.drip.com/blog/thank-you-page) および [Creating The Perfect Thank You Page — CXL](https://cxl.com/blog/thank-you-page/)（post-conversion 5-10x / commitment-consistency / foot-in-the-door / post-purchase rationalization / 単一 CTA 2-3x / dead end 回避）
[^stormy]: [How to Nurture a SaaS Waitlist: The Email Sequence That Converts — Stormy AI](https://stormy.ai/blog/how-to-nurture-saas-waitlist-email-sequence) および [Waitlist Email Sequence — Sequenzy](https://www.sequenzy.com/blog/waitlist-email-sequence)（nurture 2-3x / 15-25% ローンチ CVR / edu-selling / cadence / plain text / 集めて沈黙の失敗）
[^indiehackers]: [Is this the end of "Build in Public"? — Indie Hackers](https://www.indiehackers.com/post/lifestyle/is-this-the-end-of-build-in-public-heres-why-top-indie-hackers-are-suddenly-disappearing-IhSJQBnXNuNwSuNTuz4t) および [Indie Hackers: Bootstrapping Success Stories — Alignify](https://alignify.co/insights/indie-hackers)（Pieter Levels / Marc Lou / Arvid Kahl / 顔と物語は残し数字は隠す中間解）

### Smitch 内部参照ドキュメント

- `docs/context/product-concept.md` — コアコンセプト・ターゲット・トーン
- `docs/design/lp-design-brief.md` — サービスコンセプトのコピー核
- `docs/design/lp-desire-onboarding-brief.md` — 欲求カード起点オンボーディング訴求・NG リスト
- `_longruns/2026-05-24_lp-image-code-workflow/plan.md` — LP longrun・change 分解・waitlist スキーマ
- `CLAUDE.md` — Smitch コンセプトコア・Hard Rules・トーン
- `docs/research/lp-image-to-code-workflow-2026.md` — 技術ワークフロー（本レポートの補完）
