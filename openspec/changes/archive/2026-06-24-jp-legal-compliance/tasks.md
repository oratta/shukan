# Tasks: jp-legal-compliance

## 1. 事前確認・実値収集

- [x] 1.1 消費者庁ガイドライン（改正特商法 最終確認画面・総額表示・景表法）と Stripe の特商法表記サポートを research-with-fallback で参照し、文言ドラフトの根拠を確保する（改正特商法第12条の6の必須4項目・総額表示義務・景表法 有利誤認/おとり広告排除をガイドラインベースで文言化。最終的な弁護士確認は 7.4 / 1.2 に残す）
- [ ] 1.2 事業者表記の実値（事業者名・所在地・連絡先・電話番号の開示方式）をユーザーに確認する。未確定項目はプレースホルダ禁止（リリースブロッカーとして扱う）【DEFERRED: 実値はユーザー確認待ち。`src/lib/legal/business-info.ts` に env 駆動のプレースホルダ（`[要記入]`）として集約済み。LEGAL_* 環境変数で差し替え可能。decisions.md D7 参照】

## 2. 特商法表記ページ（独立着手可・TDD）

- [x] 2.1 Vitest 構造テストを新規作成（RED）: 表記ページに必須項目ラベル（事業者名/所在地/連絡先/販売価格/支払方法/支払時期/役務の提供時期/返品・解約に関する事項）が存在することを assert。`TODO`/`XXX` 残置で fail するプレースホルダ検出も含める（`src/__tests__/jp-tokushoho-page.test.tsx`）
- [x] 2.2 `src/app/tokushoho/page.tsx` を新規作成（GREEN）: `/privacy` `/terms` と同一のレイアウト/セマンティッククラス構造で必須項目を列挙。販売価格は税込総額で記載
- [x] 2.3 価格を表示する面（ティザー footer・アカウント/設定画面）に特商法表記ページへのリンクを追加し、テストで存在を assert。paywall への結線は change-A 結合（6.4）に送付

## 3. privacy / terms 追記（独立着手可・TDD）

- [x] 3.1 Vitest 構造テストを新規作成（RED）: `/privacy` に waitlist メール取得条項と Stripe への決済情報送信（委託）条項が存在すること、`/terms` に「無償で提供」の単独記述が存在しないこと・有料プラン言及と特商法表記ページへの誘導が存在することを assert（`src/__tests__/jp-privacy-terms.test.tsx`）
- [x] 3.2 `src/app/privacy/page.tsx` を追記更新（GREEN）: §2 に waitlist メールアドレス・Stripe へ送信される決済情報を追加、§3 に課金管理・waitlist 案内の利用目的を追加、§5 として決済委託（Stripe, Inc.・カード情報非保持・Stripe プライバシーポリシーへのリンク）の条項を新設。既存セクション構造は維持（13セクションに増加）し、最終更新日を更新
- [x] 3.3 `src/app/terms/page.tsx` を追記更新（GREEN）: §2「無償で提供」を有料プラン併存の実態に書き換え（特商法表記ページへ誘導）、§8 の無償前提記述を有料プランの責任上限規定に修正

## 4. 最終確認画面（change-A 結合前の先行実装・TDD）

- [x] 4.1 Vitest 構造テストを新規作成（RED）: 確認画面コンポーネントが必須4項目（①定期購入(自動更新)である旨 ②各回代金＋一定期間の支払総額 ③トライアル→有料移行の時期と金額 ④解約方法・期限・違約金の有無）をすべて含むことを assert。Lifetime では「定期購入ではない旨＋税込総額」を assert。必須項目がボタン直上（tree 順で button より前）に出ること・accordion/details/dialog の背後に無いことも assert（`src/__tests__/jp-final-confirmation.test.tsx`）
- [x] 4.2 最終確認画面コンポーネントを props 駆動（プラン・税込価格・トライアル状態）の純粋コンポーネント `src/components/billing/final-confirmation.tsx` として実装（GREEN）。必須4項目は確認ボタン直上に固定配置し、アコーディオン/モーダル/タブの背後に置かない。next-intl `checkout` 名前空間で en/ja 文言を用意（ja を法的要件の正とする）
- [x] 4.3 必須4項目の文言ドラフトを 1.1 の根拠資料に基づき確定（月額は「月額 $4.99/月 + 年間支払総額 $59.88（税込）」、年額は「年額 $39.99/年（税込）」を併記。`src/lib/billing/pricing.ts` の `annualTotal` で算出）

## 5. 税込総額表示

- [x] 5.1 価格表示ユーティリティが税込総額＋「税込」表記で出力すること・表示額=請求額（inclusive）であることのテストを作成（RED）（`src/__tests__/jp-pricing-display.test.ts`）
- [x] 5.2 すべての消費者向け価格表示（最終確認画面・特商法表記ページ）を `src/lib/billing/pricing.ts` の `formatTaxInclusivePrice` 経由の税込総額表記に統一（GREEN）
- [x] 5.3 change-A の Stripe Price 作成が `tax_behavior: inclusive` で行われることを decisions.md D7 に明記。`chargedAmount(plan) === CONSUMER_PRICES[plan].amount` のテストで表示額=請求額の一致を担保。テストモード Checkout での突合手順は decisions.md D7 に記録（A 実環境タスクとして残す）

## 6. change-A / change-B 結合（依存タスク）

- [x] 6.1 [change-A 完了後] 最終確認画面をプラン選択 → Checkout セッション生成の間に挿入し、確認ボタンからのみ `/api/stripe/*` を呼ぶフローに結線。E2E（または統合テスト）で「確認画面を経由せずに Checkout に到達しない」ことを確認【billing-integration（D8）で結線完了。`/account` ページがプラン選択 → `FinalConfirmation` → 確認 → `POST /api/stripe/checkout` の導線を実装。Checkout 直行を不可能にする不変条件は純粋 reducer `checkoutFlowReducer`（SELECT_PLAN は checkout intent を出さない／CONFIRM のみが出す／idle からの CONFIRM は no-op）で担保し `account-billing.test.ts` で検証。確認画面を経ない導線は UI に存在しない】
- [x] 6.2 [change-A 完了後] アカウント/設定画面に Customer Portal 導線（`BillingPortalCard`）を常設し、「いつでも解約」文言と実態の一致を担保。`POST /api/stripe/portal`（change-A 実装済み）を呼ぶ `handleOpenPortal` を結線。Portal のキャンセル有効化設定・テストモード解約完走は実環境タスクとして decisions.md D7 に記録
- [x] 6.3 [change-B 完了後] 残り枠表示がカウンタ API の実数に接続されていること（ハードコード値でないこと）のユニットテストを有効化。割引率表示の参照価格が実販売価格（通常 Price）であることを assert（`src/__tests__/jp-scarcity-discount.test.tsx`）
- [x] 6.4 [change-B/C 完了後] ティザー footer に特商法表記リンクを適用（2.3 で実施済み）。paywall 価格面への税込表記適用は change-A の paywall UI 結合時に実施【部分 DEFERRED: paywall は現状価格表示 UI を持たないため】

## 7. 品質確認

- [x] 7.1 `npx vitest run` で本 change の全テスト（新規32件）と既存テストが PASS（38 files / 349 tests passed）
- [x] 7.2 新規ファイルの `eslint` 違反ゼロ（既存 9 エラーは本 change 対象外ファイル）、`npm run build` 成功（`/tokushoho` route 生成確認）
- [x] 7.3 受け入れ条件 17〜21 の充足を確認（17: 特商法ページ網羅 S1 / 18: 最終確認画面4項目のテスト検証 S3,S4 / 19: 税込表示 S6 / 20: 実数ベースの残り枠・割引 S8,S9 / 21: プライバシーポリシー整備 S10,S11）
- [ ] 7.4 法定文言の最終確認（弁護士または人間レビュー）をユーザーに依頼し、レビュー結果を反映【DEFERRED: 人間レビュー必須。実装はガイドライン準拠。1.2 の事業者実値確定と併せてリリース前に実施】
