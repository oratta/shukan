# Design: install-prompt-ui

## Context

- Vitest は `environment: 'node'` で運用しており、DOM テスト環境（happy-dom / @testing-library/react）は導入しない（依存追加禁止の制約）。よってテスト可能性は「ロジックを純関数に分離する」ことで担保する
- iOS Safari は `beforeinstallprompt` をサポートしないため、iOS は手順図解、Android Chrome はネイティブプロンプトという2系統の UI が必要
- 表示タイミングは「習慣完了直後」のみ。`src/hooks/useHabits.ts` には完了系メソッドが2つある（通常習慣の `setDayStatus`、quit 習慣向けの `markQuitDailyDone`）が、**`markQuitDailyDone` は現状どのコンポーネントからも呼ばれていない（未配線）**。よってトリガーは関数経路ではなく「習慣の today status の遷移」で検出する（どの経路を通っても status 変化として観測できる）
- 既存の遷移検出パターン `habit-card.tsx:106-108` は `'completed'` だけでなく `'rocket_used'` も完了扱いにしている。本変更もこれに合わせる
- 並行 worktree（monetization）が `package.json` と `src/messages/{en,ja}.json` を変更中のため、依存追加禁止・メッセージは新規キー追加のみ

## Goals / Non-Goals

**Goals**
- インストール導線の表示判定を 100% node 環境の unit テストで検証可能にする
- iOS Safari / Android Chrome それぞれに適切な導線を出し、その他環境では一切出さない
- dismiss 後 30 日間の抑制と、リロード・再訪での非表示を保証する
- 設定画面に常設の再到達導線を置く

**Non-Goals**
- Service Worker / オフライン対応 / Web Push（別 run）
- Playwright E2E・DOM テストの新設（手動確認で代替）
- インストール率の計測・アナリティクス

## 純関数レイヤー設計（`src/lib/pwa/`）

React・ブラウザ API への依存を引数に押し出し、全関数を決定的な純関数にする。

```typescript
// src/lib/pwa/platform.ts
export type PwaPlatform = 'ios-safari' | 'android-chrome' | 'standalone' | 'other';

// ua と isStandalone を引数で受ける（navigator / matchMedia は呼び出し側で解決）
export function detectPlatform(ua: string, isStandalone: boolean): PwaPlatform;
// 優先順位: isStandalone === true → 'standalone'
//   → iPhone/iPad Safari（CriOS/FxiOS 等の別ブラウザは 'other'）→ 'ios-safari'
//   → Android かつ Chrome（Edge/Samsung 等の判定は保守的に 'other' でよい）→ 'android-chrome'
//   → それ以外 → 'other'

// src/lib/pwa/banner.ts
export interface ShouldShowInstallBannerInput {
  platform: PwaPlatform;
  dismissedAt: string | null; // ISO 8601 or null
  now: Date;
  justCompleted: boolean;
}
export function shouldShowInstallBanner(input: ShouldShowInstallBannerInput): boolean;
// true ⇔ justCompleted === true
//      AND platform ∈ {'ios-safari', 'android-chrome'}
//      AND (dismissedAt === null OR now - dismissedAt > 30日)
// 30日ちょうど（境界値）は「30日以内」として false

// src/lib/pwa/completion.ts
// 「この操作で完了に遷移したか」の判定を純関数に切り出す（コンポーネントに分岐を書かない）
// habit-card.tsx の既存パターンに合わせ、'rocket_used' も完了扱い
export type DayStatus = 'completed' | 'rocket_used' | 'failed' | 'skipped' | 'none' | null | undefined;
export function isCompletionTransition(prev: DayStatus, next: DayStatus): boolean;
// true ⇔ prev が completed/rocket_used でない AND next が completed/rocket_used

// src/lib/pwa/dismissal.ts
export const PWA_INSTALL_DISMISSED_AT_KEY = 'pwa-install-dismissed-at';
// localStorage を Storage 互換オブジェクトとして注入可能にし、node テストでは
// 単純なメモリ実装を渡す（DOM 環境不要）
export function readDismissedAt(storage: Pick<Storage, 'getItem'>): string | null;
export function writeDismissedAt(storage: Pick<Storage, 'setItem'>, now: Date): void; // ISO 8601 で保存
// 不正値（パース不能な文字列）は null 扱い → バナー表示側にフォールバック
```

**Decision: 時刻・UA・storage をすべて引数注入** — `Date.now()` や `navigator` を関数内で参照すると node テストでモックが必要になる。注入式なら境界値テスト（30日ちょうど / 30日+1ms）が素直に書ける。

## コンポーネント構成（`src/components/pwa/` 薄い表示層）

コンポーネントには分岐ロジックを書かない。判定はすべて純関数の戻り値に従う。

```
src/components/pwa/
├── install-banner.tsx        # コンテナ。検出 → 純関数判定 → 出し分けのみ
├── ios-install-instructions.tsx   # 共有 → ホーム画面に追加 の2ステップ図解（lucide: Share, SquarePlus 等）
├── android-install-button.tsx     # 「ホーム画面に追加」ボタン。deferredPrompt.prompt() を発火
└── install-help-dialog.tsx        # 設定画面用ダイアログ（同じ図解/ボタンを再利用）
```

- `install-banner.tsx`（client component）:
  - mount 時に `navigator.userAgent` と `matchMedia('(display-mode: standalone)')` を読み、`detectPlatform()` に渡す
  - `beforeinstallprompt` を `useEffect` で捕捉し、`e.preventDefault()` のうえ React ref/state に保持（永続化しない）
  - 表示可否は `shouldShowInstallBanner()` の戻り値のみで決定。props で `justCompleted` を受ける
  - × タップで `writeDismissedAt(localStorage, new Date())` → 非表示
  - 配置: `(app)` 配下の BottomNav の上。非モーダルのカード型（shadcn Card 規約）。ユーザー操作をブロックしない
- `install-help-dialog.tsx`: 設定画面の「ホーム画面に追加」項目から開く。完了トリガー条件・dismiss 抑制は適用しない（常設）。`platform === 'standalone'` のときは案内の代わりに「追加済み」を表示

## トリガー設計（`(app)/page.tsx`）

「この操作で completed に遷移した瞬間」だけを検出する。`completedCount > 0` の定常状態では発火させない。

- **検出方式（status スナップショット ref）**: `(app)/page.tsx` は現状、習慣ごとの直前ステータスを保持していない（today status は各 `HabitCard` 内で参照されるのみ）。そこで page.tsx で `useHabits()` が返す習慣＋completions から「習慣ID → today status」のマップを導出し、`useRef` で前回レンダー時のスナップショットを保持する。レンダー間で習慣ごとに `isCompletionTransition(prevStatus, nextStatus)`（`src/lib/pwa/completion.ts` の純関数）が true になったら `justCompleted` フラグ（React state）を立てる
- **関数経路に依存しない**: この方式は `setDayStatus` / `markQuitDailyDone`（現状未配線）/ 将来の urge-flow 系など、どの経路で completed になっても status 遷移として一様に検出できる。通常習慣・quit 習慣の両方をカバーする
- 初回マウント時（prev スナップショットが無いレンダー）は遷移判定しない → ページ再訪・リロードで completedCount > 0 でも発火しない
- `justCompleted` はページの React state のみで保持し、永続化しない → リロード・再訪では必ず false に戻る（要件「リロードで表示しない」を構造的に保証）
- フラグは一度立てたらそのセッション中のバナー表示に使い、dismiss または遷移で消える

## i18n 設計

- 新規 namespace（例: `pwa.*`）でキーを追加。既存キーの変更・削除・移動は行わない
- テスト: バナー・ヘルプで使用するキー一覧を定義し、`src/messages/en.json` と `src/messages/ja.json` の両方に存在することを node テストでアサート（JSON import のみ、DOM 不要）

## Risks / Trade-offs

- [UA 判定は本質的に不正確（iPadOS のデスクトップ UA 等）] → 誤判定時は 'other' に倒して非表示にする保守的設計。導線が出ないことはあっても、誤った手順を出すことはない
- [`beforeinstallprompt` は発火タイミングが Chrome 任せ] → イベント未捕捉の間 Android バナーはボタンを出さない（または非表示）。発火を前提にした UI 待ち合わせはしない
- [localStorage が使えない環境（プライベートモード等）] → 読み書きを try/catch で包み、失敗時は dismissedAt = null（表示側にフォールバック）。クラッシュさせない
- [コンポーネント層は unit テスト対象外] → 分岐を純関数に寄せることでリスクを最小化し、残りは plan.md の手動確認手順（DevTools デバイスモード等）で担保

## Migration Plan

- 追加のみの変更で、既存機能への破壊的変更なし。ロールバックはコンポーネント・トリガーの削除のみ
- change-A（pwa-manifest）マージ後に動作確認（installability は manifest に依存）

## Open Questions

- なし（UI 細部は shadcn / 既存 `(app)` 画面の規約に従う。迷ったらシンプルな方を選ぶ — plan.md 意思決定ガイドライン）
