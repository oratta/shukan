## 1. エビデンス記事の作成

- [x] 1.1 quit_alcohol 記事作成（学術出典3件以上）
- [x] 1.2 daily_cardio 記事作成
- [x] 1.3 daily_strength 記事作成
- [x] 1.4 morning_planning 記事作成
- [x] 1.5 no_youtube 記事作成
- [x] 1.6 ArticleId 型拡張、index.ts 登録、defaultHabitType/defaultIcon 追加

## 2. UIデザイン（Pencil MCP）

- [x] 2.1 Discoverタブ一覧（カテゴリ別カードグリッド）
- [x] 2.2 エビデンス詳細ビュー（記事全文 + CTA）
- [x] 2.3 習慣作成フロー（エビデンスプリフィル）
- [x] 2.4 エビデンス管理UI（重みスライダー + 追加/削除）
- [x] 2.5 既存画面の修正（Detail Modal へのエビデンスセクション追加）

## 3. データモデル・マイグレーション

- [x] 3.1 habit_evidencesテーブル作成（マイグレーションSQL）
- [x] 3.2 RLSポリシー設定（4ポリシー: SELECT/INSERT/UPDATE/DELETE）
- [x] 3.3 既存impact_article_idデータのマイグレーション
- [x] 3.4 HabitEvidence型定義、Habit型のevidencesフィールド追加

## 4. Supabaseデータ層

- [x] 4.1 fetchHabitEvidences（eager-load with habits）
- [x] 4.2 insertHabitEvidence
- [x] 4.3 updateHabitEvidenceWeight
- [x] 4.4 deleteHabitEvidence
- [x] 4.5 replaceHabitEvidences
- [x] 4.6 snake_case ↔ camelCase マッピング（toHabitEvidence）

## 5. インパクト計算

- [x] 5.1 calculateDailyImpact: マルチエビデンス重み付き計算
- [x] 5.2 calculateMultiEvidenceImpact: 累積インパクト計算
- [x] 5.3 calculateTotalSavings: 全習慣の合算
- [x] 5.4 後方互換: evidences → impactArticleId フォールバック

## 6. コンポーネント実装

- [x] 6.1 Discoverページ（/discover）
- [x] 6.2 EvidencePicker（マルチセレクトモーダル）
- [x] 6.3 EvidenceManagerSheet（重み調整UI）
- [x] 6.4 EvidenceArticleSheet（記事全文表示）
- [x] 6.5 HabitForm 拡張（エビデンスプリフィル対応）
- [x] 6.6 HabitDetailModal 拡張（エビデンスセクション追加）
- [x] 6.7 BottomNav 4タブ化
- [x] 6.8 ImpactBadge マルチエビデンス対応
- [x] 6.9 SavingsCard マルチエビデンス対応

## 7. i18n

- [x] 7.1 ja.json: discover, evidence 関連キー追加
- [x] 7.2 en.json: discover, evidence 関連キー追加

## 8. テスト・検証

- [x] 8.1 Vitest セットアップ
- [x] 8.2 impact.ts ユニットテスト（calculateDailyImpact, calculateMultiEvidenceImpact）
- [x] 8.3 habits.ts ユニットテスト（calculateStreak, calculateRockets, getAllDayStatuses）
- [x] 8.4 型バリデーション テスト（isValidArticleId） → formatHealthMinutes, formatCurrency に統合
- [x] 8.5 フォーマット関数テスト（formatHealthMinutes, formatCurrency）
