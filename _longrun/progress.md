# Evidence Marketplace - 進捗管理

## 現在のフェーズ: 完了

### Phase 1: エビデンス記事の作成
- [x] quit_alcohol - 禁酒
- [x] daily_cardio - 毎日有酸素運動
- [x] daily_strength - 毎日筋トレ
- [x] morning_planning - 朝スケジュール
- [x] no_youtube - YouTube禁止
- [x] ArticleId 型の拡張
- [x] index.ts への登録
- [x] defaultHabitType / defaultIcon 追加
- [x] getArticleList() 拡張

### Phase 2: UI デザイン (Pencil)
- [x] Discover タブ一覧 (Screen 8: S8disc)
- [x] エビデンス詳細ビュー (Screen 9: S9detail)
- [x] 習慣作成フロー (Screen 10: S10create)
- [x] エビデンス管理UI (Screen 11: S11mgr)
- [x] 既存ビュー修正: Detail Modal (Screen 12: S12modDetail)

### Phase 2b: デザインv2 修正 (ユーザーフィードバック反映)
- [x] セクション見出し英語化 (Quit / Build)
- [x] 右上コンパスアイコン削除
- [x] 記事テキスト省略→全文スクロール表示に変更
- [x] Unsplashストック写真のヒーロー画像をG()で適用
- [x] 既存ビュー修正モックアップ追加 (Screen 12)
- [x] 新ファイル docs/design/evidence-v2.pen に全画面作成

### Phase 2c: Multi-Evidence 対応 & UX 改善
- [x] Evidence Picker (Screen 13): コンパクトリスト + 検索 + カテゴリタブ + 複数選択
- [x] Create Habit Form (Screen 10): 頻度セレクター削除、エビデンスセクション追加
- [x] 全タブバー4タブ化: Home / Discover / Stats / Settings (画面 1, 2, 5, 7)
- [x] Stats (Screen 7): 習慣ごとのエビデンス数バッジ追加
- [x] 頻度機能を daily 固定に決定（将来タスクとしてメモリに記録済み）

### Phase 2d: デザイン統合 & 最終調整
- [x] 画面5 統一デザイン: エビデンスリスト行をタップ可能カード化（chevron-right）、根拠を読むボタン削除
- [x] 画面5b 削除（統一デザインにより不要）
- [x] 画面6/9 統合: ヒーロー画像追加、下部固定CTA（Discover経由時のみ）
- [x] 旧画面6（ボトムシート）削除、旧画面9をベースに統合ビュー作成
- [x] 画面3/12 統合: 画面3にEVIDENCEセクション追加、画面12削除
- [x] エビデンス0件時: インパクト欄丸ごと非表示（設計決定）

### Phase 2e: 情報階層の整理 & History ナビゲーション
- [x] 画面5: 個別エビデンス行削除（日次合計サマリー+ストリーク+累積貯金のみ）
- [x] 画面2: Rocket ボタン削除（Detail ボタンのみに統一）
- [x] 画面3: ImpactBadge 追加（🏥+19分 💰¥1,650 📈¥8,430/日）
- [x] 画面3: SavingsCard（累積貯金）追加
- [x] 画面3: Evidence カードをタップ可能に（chevron-right 追加）
- [x] 画面3: History に年月ヘッダー「2026年3月」+ 左右矢印ナビゲーション追加

### Phase 3: ユーザーレビュー
- [x] デザインレビュー承認

### Phase 4: 実装
- [x] DB マイグレーション (habit_evidences junction table)
- [x] Supabase データ層 (CRUD + RLS)
- [x] コンポーネント実装 (Discover, EvidencePicker, EvidenceManager, DetailModal等)
- [x] i18n (ja/en)
- [x] モンキーテスト + バグ修正10件
- [x] ビルド確認 + ブラウザ動作確認
- [x] コミット: 9f448cd

## ファイル構成
- docs/design/new.pen - 旧デザイン（既存スクリーン1-7のみ）
- docs/design/evidence-v2.pen - 新デザイン（全11画面: 1-5既存修正 + 6統合 + 7既存修正 + 8,10,11,13新規）

## ログ
- 2026-03-02 16:30 - Phase 1 開始: エビデンス記事の作成
- 2026-03-02 16:40 - Phase 1 完了: 5件の新規記事作成、型定義拡張
- 2026-03-02 16:40 - Phase 2 開始: Pencil UI デザイン
- 2026-03-02 17:00 - Phase 2 完了: 4画面デザイン作成 (new.pen MCP memory only)
- 2026-03-02 17:00 - Phase 3 開始: ユーザーレビュー待ち
- 2026-03-02 18:30 - Phase 2b: フィードバック反映、evidence-v2.pen に新規作成
- 2026-03-02 18:45 - Phase 2b 完了: 5画面をJSON直接操作で構築、ヒーロー画像適用
- 2026-03-02 20:00 - Phase 2c: Multi-Evidence対応、Evidence Picker、タブバー4タブ化、頻度→daily固定
- 2026-03-02 20:30 - Phase 2d: 画面5統一、画面6/9統合（ヒーロー画像+固定CTA）、5b/旧6/旧9削除
- 2026-03-02 23:00 - Phase 2e: 情報階層整理（画面5簡素化、画面2ロケット削除、画面3にImpact/Savings/chevron/Historyナビ追加）
- 2026-03-03 07:00 - Phase 4: 実装完了、モンキーテスト10件修正、コミット 9f448cd
