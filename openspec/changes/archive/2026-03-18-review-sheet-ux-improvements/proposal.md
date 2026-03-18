## Why

昨日レビューシートの UX に3つの問題がある:
1. **未入力の習慣しか表示されない** — レビューは「昨日を振り返る」行為なので、既に入力済みの習慣も含めて全体を見渡せるべき
2. **ステータス切替がタップトグル** — none→completed→skipped→failed→none のサイクルは直感的でなく、目的のステータスに到達するまで何回もタップが必要
3. **ムードにシステム絵文字を使用** — プロジェクト全体で Lucide アイコンに統一済みなのに、ムードだけ絵文字が残っている

## What Changes

- レビューシートに昨日の**全習慣**（非アーカイブ）を表示する。入力済みの習慣はそのステータスで表示し、未入力の習慣は none 状態で表示して入力を促す
- ステータス切替を**タップトグルからセレクト形式**に変更する。各ステータス（completed / skipped / failed）をボタン群で並べ、ワンタップで直接選択できるようにする
- ムードスタンプの絵文字を **Lucide アイコン**（Frown, Meh, Smile, Laugh 等）に差し替え、色で段階を表現する

## Capabilities

### New Capabilities

（なし — 既存機能の UX 改善のみ）

### Modified Capabilities

- `daily-impact-display`: レビューシートの表示対象が「未レビュー習慣のみ」から「全習慣」に変更

## Impact

- `src/components/habits/yesterday-review-sheet.tsx` — セレクト形式 UI、ムードアイコン、全習慣表示
- `src/app/(app)/page.tsx` — シートに渡す habits を全習慣に変更
- `src/lib/icon-registry.ts` — ムード用 Lucide アイコンの登録（必要に応じて）
