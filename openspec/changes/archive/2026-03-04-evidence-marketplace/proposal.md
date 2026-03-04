## Why

Shukan習慣トラッカーアプリにおいて、ユーザーが新しい習慣を始める際の動機付けが弱い。エビデンスベースの科学的根拠を提示し、習慣の生涯インパクト（健康・コスト・収入）を可視化することで、習慣継続のモチベーションを向上させる。

また、1つの習慣に複数のエビデンス記事を紐付け、重み付きで合算するマルチエビデンス機能により、より正確なインパクト計算を実現する。

## What Changes

1. **Discoverタブ（マーケットプレイス）**: 新しいタブでエビデンス記事の一覧を閲覧・習慣作成
2. **5件の新規エビデンス記事**: quit_alcohol, daily_cardio, daily_strength, morning_planning, no_youtube
3. **マルチエビデンスアーキテクチャ**: 1習慣に複数エビデンスを紐付け、重み付き合算
4. **エビデンス管理UI**: 習慣詳細からエビデンスの追加・削除・重み調整
5. **DBスキーマ変更**: habit_evidencesジャンクションテーブル追加

## Capabilities

### New Capabilities
- `evidence-marketplace`: Discoverタブでエビデンス記事を閲覧し、習慣を作成する機能
- `multi-evidence`: 1つの習慣に複数エビデンスを紐付け、重み付きインパクト計算
- `evidence-management`: 既存習慣のエビデンス追加・削除・重み調整UI

### Modified Capabilities
- `impact-calculation`: 単一エビデンスから複数エビデンスの重み付き合算に変更
- `habit-creation`: Discoverからのプリフィル作成フローを追加

## Impact

### 影響を受けるコード
- `src/lib/impact.ts` - マルチエビデンス対応の計算ロジック
- `src/lib/supabase/habits.ts` - evidence CRUD関数追加
- `src/hooks/useHabits.ts` - evidence操作メソッド追加
- `src/types/impact.ts` - HabitEvidence型、ArticleId型拡張
- `src/types/habit.ts` - Habit型にevidencesフィールド追加

### 影響を受けるシステム
- Supabase DB: habit_evidencesテーブル追加、RLSポリシー
- ルーティング: `/discover` ページ追加
- BottomNav: 4タブ化（Home / Discover / Stats / Settings）

### 後方互換性
- 既存の `habits.impact_article_id` カラムは維持
- マイグレーションで既存データを `habit_evidences` に移行（weight=100）
- コードは evidences 配列優先、fallback で impactArticleId を使用
