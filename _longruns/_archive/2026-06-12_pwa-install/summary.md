# Summary: PWA インストール可能化

- 開始: 2026-06-12 11:10 ごろ（Setup）
- Verify完了: 2026-06-12 14:10 ごろ
- ブランチ: pwa-implementation-plan

## Changes
| Change | 内容 | コミット | テスト |
|--------|------|---------|--------|
| change-A: pwa-manifest | `src/app/manifest.ts` 新設（id/lang/dir/categories 強化）、`public/manifest.json` 削除、layout 参照を `/manifest.webmanifest` に更新 | dd084a4 | +8 |
| change-B: install-prompt-ui | 純関数レイヤー `src/lib/pwa/`（detectPlatform / shouldShowInstallBanner / isCompletionTransition / dismissal / message-keys）、`src/components/pwa/` 4コンポーネント、ホーム画面の完了遷移トリガー、設定ヘルプ、pwa.* i18n | 917c9fe | +54 |
| fix | lint 抑制3件（SSR制約の理由コメント付き）+ 未使用 import 削除 | 14c0429, fa556b0 | - |

## テスト結果
- `npm run test:run`: 17 files / **259 tests 全PASS**（ベースライン 197 + 新規 62）
- `npm run build`: PASS（/manifest.webmanifest 静的生成）
- lint: 9 errors（ベースラインと同数。本 run 由来 0）

## 4軸評価スコア
| 軸 | スコア | しきい値 | 検証Agent |
|----|-------|---------|----------|
| 品質 | 100% | 100% ✅ | longrun-verifier |
| 完成度 | 100% | 80% ✅ | longrun-verifier |
| 機能性 | 100%（確認可能分） | 100% ✅ | longrun-browser-verifier |
| UX | 100% | 70% ✅ | longrun-browser-verifier |

## 意思決定サマリー（decisions.md 全9件の要点）
- D2/D3: トリガーを関数経路ベースから **status 遷移検出ベース**に変更（markQuitDailyDone が未配線という実コード調査に基づく）。遷移判定は純関数 `isCompletionTransition` に切り出し、rocket_used も完了扱い
- D5: `tsc --noEmit` の既存テスト由来エラー9件は先行負債として温存（本 run ファイルはエラー0）
- D7: UA 誤判定は 'other'（非表示）に倒す保守的設計 / i18n キー単一ソース化 / バナーは BottomNav 上の非モーダル Card
- D8: lint の先行 9 errors は温存、本 run 由来 +3 のみ修正

## ユーザーに委譲した確認（環境制約）
- S7（実機）: iPhone Safari で習慣完了 → 図解バナー出現の最終確認
- S8: Android Chrome 実機での beforeinstallprompt → ネイティブプロンプト発火
- Chrome DevTools → Application → Manifest の installability 目視確認
