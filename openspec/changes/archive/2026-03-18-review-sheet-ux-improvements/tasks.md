## 1. 全習慣表示

- [x] 1.1 page.tsx: reviewHabits のスナップショットを `habits.filter(h => !h.archived)` に変更
- [x] 1.2 page.tsx: バナーの表示条件とカウントは yesterdayUnreviewed のまま維持

## 2. ステータスセレクト UI

- [x] 2.1 yesterday-review-sheet.tsx: nextReviewStatus 関数と単一ドットボタンを削除
- [x] 2.2 yesterday-review-sheet.tsx: StatusSelectButtons コンポーネントを追加（Check/Minus/X の3ボタン横並び）
- [x] 2.3 yesterday-review-sheet.tsx: 選択済みボタン再タップで none に戻すロジック
- [x] 2.4 yesterday-review-sheet.tsx: ボタンのビジュアル（completed=緑, skipped=グレー, failed=オレンジ, 未選択=アウトライン）

## 3. ムード Lucide アイコン化

- [x] 3.1 yesterday-review-sheet.tsx: MOOD_EMOJIS 配列を Lucide アイコン定義に置き換え（Frown, Meh, CircleMinus, Smile, Laugh）
- [x] 3.2 yesterday-review-sheet.tsx: 各ムードアイコンに色を適用（red-400, orange-400, gray-400, lime-500, green-500）
- [x] 3.3 Lucide アイコンの import 追加

## 4. 検証

- [x] 4.1 TypeScript 型チェック（npx tsc --noEmit）エラーなし
- [x] 4.2 Next.js ビルド（npx next build）エラーなし
