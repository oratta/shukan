# Plan: Smitch マネタイズ基盤（Founding Member ティザー ＋ Stripe 課金基盤）

## 生成情報
- 作成日: 2026-06-08
- Brain Dump元: セッション内（壁打ち＋Webリサーチ）
- 質問回数: 7問（+ リサーチ4回）

## ゴール

Smitch に Web + Stripe ベースの課金基盤を実装し、「Founding Member（初期貢献者を有料の永久割引で優遇）」プログラムのティザーページと、サブスク（月額/年額）+ Lifetime の決済土台を立ち上げる。現フェーズ（ユーザー獲得＋フィードバック）と両立するよう、ゲートのトリガーは設定で可変にする。

## ビジネスコンテキスト

- **対象ユーザー**: 「何か変えたい」自己改善志向の人。うさんくさくない科学的根拠を重視し、SNSで見せるより自分の中の変化を求める層
- **提供価値**: トライアルで time-to-value を体験 → 初期にコミットした人ほど永久割引＋将来のCS優先で報われる「静かな感謝」設計
- **成功指標**:
  - ティザーページの waitlist 登録数（需要検証）
  - トライアル開始数、トライアル→課金の転換率
  - Founding 枠（50%off/30%off）の消化数
  - MRR / Lifetime 購入数

### リサーチ根拠（要約）

- ハードペイウォール+トライアルはフリーミアムの約5倍転換（10.7% vs 2.1%）、1年後継続率はほぼ同等（27% vs 28%）。「無料層が後で育つ」は神話寄り（RevenueCat 2025/2026, 115,000+アプリ）
- 個人開発では無料ユーザーが最もCSコスト高。有料の壁が intent をフィルタする（インディー開発者コミュニティの一致した声）
- 習慣アプリは価値が使ううちに分かる → 純粋なハードペイウォール（触る前課金）は時期尚早。トライアルで time-to-value を与えるべき。トライアル17〜32日が最高転換42.5%、80〜90%はDay 0で決まる
- Founding Member / グランドファザリングは確立手法だが「無料枠」は intent フィルタを壊す。"払う"こと自体が需要シグナル。永久割引は小コホートに限定、ハードクローズ必須
- 派手なゲーミフィケーション tier（Starbucks型ステータス誇示）は Smitch のブランド（「ゲーミフィケーションで動機づけしない」「見せびらかさない」）と衝突 → CS優先は"静かな約束"としてティザーに記載のみ

## セットアップ前提（exec開始時に必ず実施）

- **Stripe スキルのプロジェクトインストール**: change-A（Stripe実装）着手前に、`with-skill`（ローカル → OpenSkills → Context7 の順で探索）または marketplace 経由で Stripe 用スキルをプロジェクトに導入する。Stripe + Next.js 16 App Router の実装パターンはこのスキル＋Context7 で確認してから実装する
- **国内法（日本）準拠を前提に実装**: 後述 change-D を独立changeとして必ず含める。決済機能のため法令対応は必須

## 技術要件

- **スタック**: Next.js 16.1.6 (App Router) / React 19.2.3 / TypeScript 5 / Tailwind 4 / Supabase (auth + PostgreSQL + RLS) / Stripe / next-intl (en/ja)
- **決済**: Stripe Checkout（サブスク + 一回払い両対応）+ Webhook + Customer Portal
- **参照パターン**:
  - `src/lib/supabase/habits.ts`（snake_case↔camelCase マッピング、RLS前提のCRUD）
  - `src/components/auth-provider.tsx`（AuthContext / useAuth）
  - `src/middleware.ts`（セッション更新・認証リダイレクト。SSR前提を壊さない）
  - `src/app/marketing/`（marketing-host-routing。ティザーはこの構成に合わせる）
- **制約**:
  - native 化（Capacitor/RN）は Phase 2。今回は Web のみ。SSR/middleware を壊す静的書き出しはしない
  - ゲート（習慣数上限・トライアル期間・Founding枠数）は環境変数 or 設定値で可変にし、ポリシーと実装を分離する
  - ブランド「うさんくさくない」を守る：残り枠の透明表示はOK、偽カウントダウン等のダークパターンは禁止
  - Founding 枠は「課金成功時」にのみ確保（登録時に確保しない）。払う人だけが枠を消費する
  - Secret（Stripe secret key, webhook secret）は `.env.local` / Vercel env。コードにハードコードしない
  - **国内法（日本）準拠（必須）**: 決済の最終確認画面・特商法表記・税込総額表示・解約導線は改正特商法/消費税法/景表法/個人情報保護法に従う（change-D）。Stripe は法令に自動対応しないため自前実装する
- **テストフレームワーク**: Vitest（単体）/ Playwright（E2E）。Webhook は Stripe CLI または mock イベントで検証
- **テスト実行コマンド**: `npm test`（vitest）/ `npm run test:run` / Playwright は `npx playwright test`

### 税務・MoR に関する注意（リスク）

Stripe は Merchant of Record ではないため、国際的な VAT / 消費税の申告・remittance は自前。グローバル展開（en/ja）では負担になり得る。今回は Stripe 直で実装するが、将来 Lemon Squeezy / Polar / Paddle（MoR、手数料+数%で税代行）への切替余地を残す設計にする（決済プロバイダ抽象を薄く挟む）。→ 意思決定ガイドライン参照。

## スコープ

### 含むもの
- Founding Member ティザー / ランディングページ（プログラム説明・残り枠表示・CS優先の約束メッセージ・waitlist メール取得）
- Stripe 課金基盤: Products / Prices（月額・年額・Lifetime）、Checkout、Webhook、Customer Portal
- Supabase スキーマ: `subscriptions`, `founding_memberships`, `waitlist`
- トライアル（14日・カード不要）とトライアル状態管理
- トライアル中の「早期切替で Founding 割引ロック」フロー
- Founding 階層割引（最初50人=50%off永久 / 次200人=30%off永久 / 以降通常、年間20%off）と、課金成功時の枠アトミック確保
- paywall ゲートコンポーネント（トライアル終了後にゲート対象アクションをブロック。上限は可変）
- 国内法対応（特商法表記ページ・最終確認画面の定期購入表示・税込総額表示・解約導線・景表法準拠の残り枠/割引表示・プライバシーポリシー）（change-D）

### 含まないもの
- ネイティブアプリ（Capacitor / React Native）（理由: Phase 2。SSR/middleware 構成では実質リファクタで、プレ収益では回収できない）
- CS優先度の機能実装（ティザーでの"約束"メッセージのみ。優先サポートの運用システムは別run）
- 可視化されたロイヤルティ tier UI / バッジ / ランク誇示（理由: ブランド非整合）
- 物理プロダクト販売（理由: コンセプトの将来拡張、時期尚早）
- 投票権システム（理由: 設計検討が別途必要、backlog）
- 多通貨の厳密な税最適化（MoR 切替）（理由: まず Stripe 直で検証。将来判断）

## Changes分解

### change-A: Stripe サブスク課金基盤
- **スコープ**: Stripe Products/Prices 定義、Checkout セッション生成、Webhook 受信（checkout.session.completed / customer.subscription.updated / customer.subscription.deleted / invoice.paid）、Supabase `subscriptions` テーブルへの状態同期、Customer Portal 連携、14日トライアル（カード不要）、paywall ゲートコンポーネント（可変上限）
- **使用スキル**: supabase（マイグレーション）、research-with-fallback（Stripe + Next.js 16 App Router の最新パターン確認）
- **依存関係**: 独立（基盤）
- **config.yaml rules**:
  - "Stripe secret / webhook secret は env 経由。コードにハードコード禁止"
  - "Webhook は冪等に実装（重複イベント想定）。署名検証必須"
  - "サブスク状態の真実源は Supabase `subscriptions`。UI はそれを参照"

### change-B: Founding Member 割引プログラム
- **スコープ**: `founding_memberships` テーブル（連番・tier・確保時刻）、課金成功時のアトミックな枠確保（50%off上限50→埋まったら30%off→埋まったら通常へフォールバック）、Stripe 側の割引適用（tier別 Price ID または Coupon）、残り枠カウンタAPI、トライアル中の早期切替フロー（割引ロック）、永久割引の継続適用（更新時も維持＝グランドファザリング）
- **使用スキル**: supabase（マイグレーション・RPC/トランザクション）
- **依存関係**: change-A（課金基盤）に依存
- **config.yaml rules**:
  - "Founding 枠の確保は DB レベルで競合防止（トランザクション or RPC で over-allocation を防ぐ）"
  - "枠確保は課金成功 Webhook 内でのみ実行。登録時・トライアル開始時には確保しない"
  - "枠上限（50 / 200）は設定値。テストでは小さい値で境界を検証できること"

### change-C: Founding Member ティザー / ランディングページ + waitlist
- **スコープ**: ティザーページ（プログラム説明、Founding 階層特典、CS優先の約束メッセージ、残り枠のライブ表示）、waitlist メール取得フォーム → Supabase `waitlist` 保存、marketing-host-routing 構成への組み込み、en/ja 対応
- **使用スキル**: frontend-design（ブランド整合のUI）、stitch-design（任意）
- **依存関係**: 静的コンテンツは独立して着手可。残り枠ライブ表示は change-B のカウンタAPIに依存
- **config.yaml rules**:
  - "コピーはブランド『静かに寄り添う／うさんくさくない』トーン。偽の緊急性・ダークパターン禁止"
  - "残り枠は change-B の実数を表示。ハードコードしない"
  - "waitlist は email + locale + source を保存。RLS / バリデーション必須"

### change-D: 国内法（日本）準拠
- **スコープ**:
  - **特定商取引法に基づく表記ページ**（事業者名・所在地・連絡先・販売価格・支払方法/時期・役務提供時期・返品/解約に関する事項等）
  - **改正特商法 最終確認画面（Checkout 直前）の表示**: ①定期購入(自動更新)である旨 ②各回の代金＋一定期間(例:年)の支払総額 ③トライアル→有料移行の時期と金額 ④解約方法・期限・違約金の有無 を、スクロール不要で一目で見える位置に明確表示
  - **総額表示（税込）**: 消費税法に基づき税込価格で表示（Stripe Price は税込設定 or Stripe Tax で内税処理）
  - **解約導線と解約妨害の排除**: Customer Portal 等で簡単に解約でき、「いつでも解約」表示と実態を一致させる
  - **景表法準拠の表示**: 「残り枠 N」「○%OFF」は実数・実参照価格に基づく（有利誤認・おとり広告の排除）。ブランドの「うさんくさくない」と一致
  - **個人情報保護法**: waitlist/アカウントのメール取得にプライバシーポリシー整備・同意
- **使用スキル**: research-with-fallback / context7（消費者庁ガイドライン・Stripe 特商法表記サポート参照）
- **依存関係**: change-A（最終確認画面・Checkout）、change-B（残り枠/割引表示）に表示面で依存。表記ページ・プライバシーは独立着手可
- **config.yaml rules**:
  - "最終確認画面の必須4項目（定期購入である旨/総額/移行時期と金額/解約方法）はテストで存在を検証する"
  - "価格表示は税込（総額表示義務）"
  - "残り枠・割引の表示は change-B の実数に基づくこと（架空の在庫煽り・偽の参照価格を禁止）"

## 画面・UI設計

- **ティザーページ** (`/founding` または marketing host 配下): Hero（Founding Member の価値）→ 階層特典の説明（50%off 残りN / 30%off 残りM）→ CS優先の約束 → waitlist 登録フォーム → FAQ。トーンは静かで誠実
- **paywall ゲート**: トライアル終了後、ゲート対象アクション時にボトムシート/モーダルで「Founding 割引で続ける」CTA。残り枠を透明表示
- **アカウント/課金画面**: 現在のプラン・トライアル残日数・「早期に切替えて割引をロック」CTA・Customer Portal へのリンク
- 参考: Habitify（階層課金）/ Streaks（買い切りの潔さ）。ただしステータス誇示UIは作らない

## データモデル

- **`subscriptions`**: `user_id` FK, `stripe_customer_id`, `stripe_subscription_id`, `status`(trialing/active/canceled/past_due/incomplete), `plan`(monthly/annual/lifetime), `trial_end`, `current_period_end`, `cancel_at_period_end`, RLS per user
- **`founding_memberships`**: `id`(連番), `user_id` FK unique, `tier`(founder_50/founder_30), `discount_pct`, `claimed_at`, `stripe_price_id`。連番＝確保順。over-allocation を DB で防止
- **`waitlist`**: `id`, `email` unique, `locale`, `source`, `created_at`, RLS（insert は anon 可、select は制限）
- 既存 `user_settings`（将来）とは独立

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている
3. [ ] ビルドエラーなし（型チェック + ビルド）
4. [ ] 統合テストがPASS（worktreeマージ後）

**機能固有の条件:**
5. [ ] トライアルはカード不要で開始でき、14日間はゲート対象アクションが利用できる
6. [ ] トライアル終了後（未課金）はゲート対象アクションが paywall でブロックされる
7. [ ] トライアル中に「早期切替」すると、その時点の Founding tier で割引が永久ロックされる
8. [ ] Founding 枠は課金成功時にのみ確保され、未課金ユーザーは枠を消費しない
9. [ ] 50%off 枠が上限（テスト用小値）に達すると、次の課金者は 30%off にフォールバックする（境界テスト）
10. [ ] 枠確保が並行課金で競合しても over-allocation しない（アトミック性のテスト）
11. [ ] 残り枠カウンタが正しい実数を返し、ティザー/paywall に表示される
12. [ ] Stripe Webhook（成功・更新・解約）が署名検証付き・冪等で `subscriptions` を正しく更新する
13. [ ] Lifetime 購入で永続アクセスが付与される
14. [ ] Customer Portal にアクセスできる
15. [ ] 割引はサブスク更新時も維持される（グランドファザリング）
16. [ ] ティザーページが Founding プログラム＋CS優先メッセージを表示し、waitlist email が Supabase に保存される（en/ja）
17. [ ] 特定商取引法に基づく表記ページが存在し、必須項目を網羅している
18. [ ] Checkout 直前の最終確認画面に、定期購入(自動更新)である旨・各回代金＋支払総額・トライアル→有料移行の時期と金額・解約方法/期限が一目で見える形で表示される（テストで存在検証）
19. [ ] 価格は税込（総額表示）で表示される
20. [ ] 「残り枠」「割引」表示が change-B の実数・実参照価格に基づく（架空の在庫煽り・偽参照価格がない）
21. [ ] waitlist/アカウントのメール取得にプライバシーポリシーが整備されている

## 意思決定ガイドライン

- **優先順位**: ブランド整合（うさんくさくない・囲い込み感ゼロ）> シンプルさ > 拡張性
- **リスク許容度**: 中程度。決済まわりは保守的（冪等・署名検証・テストモード優先）
- **不明点の扱い**: ブランドトーンを損なわない方／ユーザーに正直な方を選ぶ。価格・枠数・トライアル日数は設定値にして後から調整可能にする
- **税/MoR**: 今回は Stripe 直。決済プロバイダ層を薄く抽象化し、将来 MoR（Lemon Squeezy/Polar/Paddle）へ切替できる余地を残す。確定不要なら最小限の抽象に留める
- **価格（既定値・調整可能）**: 月額 $4.99 / 年額 $39.99 / Lifetime $99 / Founding: 最初50人=50%off永久・次200人=30%off永久 / 年間契約は通常20%off。※ユーザー最終確認で変更可

## 動作確認方法

- **開発サーバー**: `npm run dev`（http://localhost:3000、競合時は 3001+）
- **テスト**: `npm run test:run`（Vitest 単体）/ `npx playwright test`（E2E）
- **Stripe**: テストモードのキーを使用。Webhook は `stripe listen --forward-to localhost:3000/api/stripe/webhook` で検証
- **確認手順**:
  1. ティザーページを開き、Founding 特典・残り枠・CS優先メッセージが表示され、waitlist にメール登録できる
  2. サインアップ → カード不要でトライアル開始 → ゲート対象アクションが使える
  3. トライアル中に「早期切替」→ Checkout（テストカード）→ Founding tier で割引ロック、`subscriptions` と `founding_memberships` が更新される
  4. 50%off 枠を小さい上限に設定し、上限超過の課金者が 30%off にフォールバックすることを確認
  5. Webhook（subscription.updated / deleted）で状態が正しく反映される
  6. Customer Portal にアクセスできる

## Brain Dumpからの原文メモ

> マネタイズ機能を実装しよう。どういうやり方にするかの検討から始める
> まずはこの手のアプリのベスプラを調べて。個人開発だとハード・ペイウォールの方がCSの観点的にもいいのかなと肌感があるけど習慣アプリはどうなってるのか調べてみてしっかりと
> スマホアプリにするのか、Webアプリにするのか → Web+Stripeでいこう
> サブスク＋Lifetime併設（推奨）
> 初期ユーザを優遇するというコンセプトを作りたい。例えば最初の5人はずっと無料とか、次の100人はずっと半額とか。累計課金額に応じてCSの優先度が上がる仕組みとか
> 階層制：最初N人無料→次M人半額 / CS優先はティザーページに入れる
> （改訂）最初からユーザー無料にすると、お金を払う気も使う気もない人が枠を埋めてしまう。最初のユーザはN人まで50%Off、その後M人まで30%Off、埋まった後に年間契約20%Off
> プライマル14日間の途中で有料課金に切り替えることで割引を引き出せるようにしておく。まだ使ってみたいけど割引を引き出したいから早く切り替えてくれる
