# HANDOFF: オンボーディング [2] インタラクティブ再設計（v3）

このワークツリー（`onboarding-v2-interactive`）で**新セッション**が次の作業を続行するための引き継ぎ。
親（`onboarding-data-setup`）の v2 実装＋実ブラウザ/DB 検証は完了済み。本ブランチはその HEAD（`b1bd333`）から分岐。

## 🔴 最新状態（2026-06-30 更新）— まずここを読む

このセッションで [2] の**効果モデルと UI 方向が大きく確定**した。詳細仕様は必読:
**`docs/context/onboarding-v3-effect-model.md`**（Obsidian 同期・このリポジトリ外だが symlink で参照可）。

### 確定済み（プロトで実ブラウザ検証済み）
- **効果式**: `習慣の効果 = Σ(エビデンス効果 × ウェイト) × 達成率`
- **MVPは「残りの人生（未来）」のみ**。過去（いつから）は post-launch → 過去/未来の二段表示・いつから入力は**廃止**
- **UX**: 段階タップ4択（やってない0% / たまに30% / だいたい70% / 完璧100%）で**1タップ送り**。
  1画面1習慣・おしゃれなトランジション・戻るボタンあり。上部に4KPIライブ＋習慣ごとの個別インパクト（アイコン）
- **KPI表示単位（桁インフレ抑制）**: 健康寿命=生涯(年) / 前向き=1日あたり(分/日) / 出費削減=年額(万円/年) / 増える収入=年額(万円/年)
- **ラベル**: 「稼ぐ能力」→「増える収入」（プロト反映済。正式採用は catalog/messages/見出しの一括更新が必要・未）
- **サンプルプロフィール**: 40歳・寿命90・就業20–65・年収1,500万
- **動くデモ**: `_longruns/2026-06-28_onboarding-v3-interactive/prototype/onboarding-step2-proto.html`
  （`cd` してそのディレクトリで `python3 -m http.server 8787` 配信 → ブラウザ、または `open` で確認）。**この UI 方向は OK 済み**。

### 習慣①「タバコを吸わない」＝確定
- 単一エビデンス `quit_smoking`。ウェイト調整不要。文言「タバコを吸わない／吸わない生活が続いている状態」OK。

### 習慣②「少し息が切れるくらいの運動を毎日行っている」＝確定（2026-07-01）
- **エビデンスは `daily-cardio` のみ**（`daily-walking` を外す）。cardio⊃walking で二重計上だったため。束ね1本＝ウェイト調整不要。
- 文言を「毎日の有酸素運動」→「**少し息が切れるくらいの運動を毎日行っている**」に変更（状態表現・自己判定しやすさ）。
- 派生課題（同一エビデンスの重複加算防止）は **GitHub issue #34** に切り出し済み。
- ※確定ログの正本は `docs/context/onboarding-v3-effect-model.md` §8。コード反映は全習慣確定後の実装フェーズでまとめて。

### 習慣③「毎日6〜8時間の睡眠をとる」＝確定（2026-07-01）
- **エビデンスは `sleep_7hours` のみ**（`no_screens_before_bed` を外す）。寝る前スマホ断ちは睡眠時間を伸ばす補助手段で sleep に内包。sleep 単独で4KPI全カバー、外して消えるKPIなし。束ね1本＝ウェイト不要。
- 文言「しっかり眠る」→「**毎日6〜8時間の睡眠をとる**」。

### 🧭 設計原則（最重要・effect-model.md §8 に明文化）
**非スペシフィックな束ね習慣は、具体的な単独習慣に分解する。** 原則 1習慣＝1エビデンス。
束ねが残るのは「明確に別経路の効果が積み上がり、かつ1タイトルで自己判定できる」場合のみ。タイトルは研究の数字を軸足にYes/No判定可能に。

### 習慣④「体にいい食事」＝3つに分割で確定（2026-07-01）
- 旧 `balanced_eating`（3本束ね）を解体：
  - `eat_vegetables` →「野菜・果物を1日5皿（約350g）食べる」
  - `drink_water` →「毎日コップ8杯（約1.5L）の水を飲む」
  - `quit_sugar` →「砂糖入りの飲み物・お菓子をとらない」

### 習慣⑤「体に悪いものを減らす」＝2つに分解で確定（2026-07-01）
- 旧 `cut_junk` を解体：`quit_junk_food` →「ジャンクフードを食べない」 / `quit_alcohol` →「アルコールを飲まない」。
- `quit_alcohol` の旧 `cut_junk`／`quit_drinking` 重複は **1習慣に統合**して自然解消（旧 `quit_drinking` は一本化／廃止）。

### 習慣⑥「感謝と書く習慣」＝`daily_journaling` のみで確定（2026-07-01）
- `gratitude_practice` を外す（馴染み薄く自己判定・継続ハードル高）。文言「**毎日、感情を吐き出す日記を書く**」。根拠 Smyth 2018（表現的筆記でコルチゾール23%低減）。

### 習慣⑦「自然の中で過ごす」＝`time_in_nature` のみで確定（2026-07-01）
- `daily_walking` を外す（歩行は②でカバー済み・walkingは②に吸収）。文言「**毎日20分、自然の中で過ごす**」。根拠 White 2019（週120分≒17分/日）。

### 習慣⑧「ヨガ・ストレッチ」＝プリセットごと廃止で確定（2026-07-01）
- `daily_yoga` / `daily_stretching` とも不採用（該当者が少ない）。positive_mood 系は 瞑想/日記(⑥)/自然(⑦) の3つに。

### ＋筋トレ追加＆ディープリサーチ起票（2026-07-01）
- **筋トレ（`daily_strength`）「毎日、筋トレをする（自重でOK）」を新規採用**（health）。⑧で空いた枠の張り替え。根拠 Shailendra 2022（全死亡15%減）。
- **2段階ディープリサーチ**: Stage1（候補10本リストアップ）**完了**。Stage2=絞った習慣のエビデンス深掘り→記事化。詳細 effect-model.md §8「🔬ディープリサーチ」。

### ＋社会的つながり 新規採用・タイトル確定（2026-07-01）
- 「**毎日、誰かと近況や気持ちを打ち明け合う会話をする**」（mood/health）。Stage1 第1候補。
  軸: Hall 2023「1日1回の質ある会話」＋自己開示の交換で線引き（雑談・事務会話を排除）。Holt-Lunstad 2024 が裏付け。
- ⏳ エビデンス記事（per-day 4KPI値）は Stage2 で作成。残る Stage2 候補（朝日/呼吸法/フロス/発酵食品 等）の採否は未確定。

### ▶ 次にやること（このセッションの続き）
**残る束ね/未レビュープリセットを上記原則で順に確定**（⑨以降）。effect-model.md §8 ⑨〜 にリスト：
daily_meditation_habit(瞑想・単独) / cook_at_home / deep_focus_work / morning_routine /
cut_digital_distraction / keep_learning。
- `src/data/habit-presets.ts` が現行の束ね定義。全習慣の文言確定後、実装フェーズでコードへ一括反映。
- 別途宿題: per-day 収入値（dailyIncomeGain）が年収1,500万ハードコード由来 → 現実的年収サンプルは要再スケール。

（下記「未確定の設計判断 判断1〜4」は本セッションで大半が解決/方針転換済み。背景として残置。）

## 「続きを」で再開する手順
1. このワークツリーで新セッションを開始（cwd = このディレクトリ）。
2. 本 HANDOFF.md を読む。
3. 下記「未確定の設計判断」を**ユーザーと確定**してから `/lr:p`（longrun:plan）でプラン化 → `/lr:e` で実装。
   - ※ユーザーは AskUserQuestion より自由記述の議論を好む。選択肢の押し付けでなく対話で詰める。

## セットアップ状態（このワークツリー）
- ブランチ: `onboarding-v2-interactive`（base: `onboarding-data-setup` @ b1bd333、v2 全成果を継承）
- `.env.local` / `.env` は親からコピー済み、`npm install` 済み。
- **dev サーバーは親が 3000 を使用中**。この子では別ポート（3001 等）で `npm run dev` する。
- dev Supabase: `xhqddzdpcpvxpprxykct`（Management API は `.env.local` の `SUPABASE_ACCESS_TOKEN` で利用可）。

## 親で完了済み（v3 の土台＝既存実装）
- 6画面ウィザード [0]イントロ [1]プロフィール [2]習慣選択(established/active 2分類) [3]計算中 [4]二段構え結果 [5]完了。
- 計算 API `src/lib/lifetime-impact.ts`: KPI4軸ごと `{past, future}`。過去/未来 horizon を KPI 種別で対称化
  （health_lifespan/positive_mood = elapsedYears×365、cost_saving/earning = elapsedWorkingYears×240）。pastIsEstimated フラグ。
- `src/lib/onboarding.ts`: WizardState / toggleEstablished / toggleActive（プリセット相互排他）/ runOnboardingWrite
  （user_profiles upsert・trackedKpis=全4軸 / habits を established(status+established_since)・active で insert）/
  yearsAgoToEstablishedSince / buildLifetimeImpactInput。
- `src/data/habit-presets.ts`: 17プリセット。`primaryKpis` で KPI 分類済み。`name` がDB保存名（アプリ全体で使用）。
- DB: habits に `status`('active'|'established')・`established_since`(date) 列追加済み（dev に適用済み）。
  user_profiles: birth_year / gender / country / annual_income / currency / tracked_kpis(ARRAY)。
- 直近の親コミット: width均等化(b1bd333) / 年収=万円単位(f77d521) / [2]既存プリセットB側disabled(178dc53) など。

## プリセットの KPI 分類（4カテゴリ＝4ボックスの素）
- health_lifespan(4): タバコをやめる / 毎日の有酸素運動 / しっかり眠る / 体にいい食事
- cost_saving(5): 体に悪いものを減らす / 毎日の節約 / 衝動買いをやめる / 自炊する / お酒をやめる
- positive_mood(4): 毎日の瞑想 / 感謝と書く習慣 / 自然の中で過ごす / ヨガ・ストレッチ
- earning(4): 集中して働く / 朝を整える / デジタルの誘惑を断つ / 学び続ける

## v3 でやりたいこと（ユーザーのブレインダンプより）
発端: 「習慣の言葉が具体的でなく、自分がその習慣を身につけているか判断できない」「ボックス幅が文字数で変わる(→親で修正済)」。
そこから [2] の再設計に発展。要素は5つ:

1. **Evidence と Habit の役割分担**（ユーザーの整理。要・最終確認）:
   - 選択リストと**文言は Habit（行動の形・継続性）**で表現する。研究プロトコル（例「週2回ファスティング」）は書かない。
     週1でも50%でも「その習慣を持っている」と言える、という思想。→ これが当初の「文言を具体化」への答え。
   - **効果の大きさは Evidence 由来 per-time** のまま（presetPerTimeEffectValue）。
   - **研究条件との乖離は達成率(%) という1係数に畳む**（頻度・難易度をラベルに持ち込まない）。
2. **タップで4KPIがその場で動くライブプレビュー**: ホーム画面（実行→4KPIへのインパクト表示）と同じ体感を [2] に。
   習慣をタップ→数字が伸びる、もう一度タップ→アンセレクトで数字が戻る。
   「このアプリは週ごとに4KPIがエビデンスベースでどう変わるかを理解させる仕組み」だと体で伝える狙い。
3. **カテゴリ4ボックスで「選んで次へ」の送り**: 1画面スクロール地獄をやめ、KPIカテゴリごとに分割。
   1つずつ「この習慣ある/ない」を噛みしめてもらう前進感。
4. **達成率3段階**: established で「いつから（何年前）」入力の後に、
   「完璧に習慣化(=100%) / ほとんど(=70%) / たまに(=30%)」をタップ選択。内部係数として処理。
5. **オンボ後のモニタリング**: 100%未満の習慣も通常の習慣として追加し、達成率をモニタリングできるようにする。

## 未確定の設計判断（プラン化前にユーザーと確定すること）
- **判断1 (Evidence/Habit 役割分担)**: 上記1の方向（文言=Habitの形・数字=Evidence・ギャップ=達成率%）で確定して良いか最終確認。
- **判断2 (ライブプレビューと[4]の関係)**: [2]に数字が動くプレビューを入れると [4] の役割が変わる。
  (a) [2]=選びながら数字が動く体験、[4]=過去+未来の二段構えサマリーに純化、 (b) [4]を[2]に統合して廃止。どちらか。
- **判断3 (established の未来寄与)**: established を達成率付きで登録し「100%を目指して継続」するなら計算モデルが変わる。
  (a) 全習慣が未来に寄与（過去=これまでの実績、未来=全習慣を100%でやり切る伸びしろ。established も未来対象＝以前の「過去/未来排他」を見直す）、
  (b) 現状維持（過去=establishedのみ・未来=activeのみ排他、達成率は過去累積の係数だけに使う）。
  ※ (a) は親 v2 で reviewer が BLOCKER 指摘した「未来に established の継続分を含めない」を意図的に見直す判断になる。
- **判断4 (達成率の保存とモデル)**: 達成率(%)をどこに持つか。
  - established の過去計算: past = per-time × 過去horizon × 達成率%。
  - 通常習慣として継続モニタリングする場合、habits に目標頻度/達成率の概念が必要か（データモデル追加の要否）。
  - 既存 habit_completions（実行履歴）から実績達成率を出す既存機構との整合。

## 制約・ルール（厳守）
- **造語禁止**。あの4つは「KPI」とだけ呼ぶ。新概念名を勝手に作らない（ユーザーの強い指摘）。
- 文言の確定版参照元: `docs/context/onboarding-screens-v2.md`（※docs/context は Obsidian へのシンボリックリンク）。
- KPI名・トーンは v1/v2 の確定語彙を踏襲。
- DB列追加は後方互換。マイグレーション作成後は自分で `supabase db push`（dev）。
- en/ja 両ロケール。messages のキーパリティを保つ。

## 検証の勘所（親での実績）
- 実ブラウザ検証は claude-in-chrome で可能だが、MCP の合成 left_click が一部ボタンで React onClick に届かないことがある
  → `javascript_tool` で対象 button の `.click()` を呼ぶと確実。native select は React 互換 setter+change イベントで設定。
- オンボーディングは user_profiles 行があると `/onboarding` がホームへリダイレクト（`src/app/onboarding/layout.tsx`）。
  再テストは user_profiles 行を削除してリセット（habits も消すなら完全リセット）。Management API でクエリ/削除可。
