## Why

アプリ全体で絵文字(🏥💰📈🔥🌱等)がUIアイコンとして多用されており、AI生成感が強い。Lucide Reactアイコンに統一し、モダンで洗練された印象に変える。また、ヒーロー画像の上に絵文字アイコンがオーバーレイ表示されているのが不要なので削除する。

## What Changes

- Impact metrics絵文字(🏥💰📈)を全8ファイルでLucideアイコン(HeartPulse, Wallet, TrendingUp)に置換
- UI装飾絵文字(🔥🌱📊💪🛡️)をLucideアイコンに置換
- Habit Icon Picker(24個の絵文字)をLucideアイコングリッドに変更
- Article defaultIcon(30記事)を絵文字からLucide名に変更
- `HabitIcon`レンダラーコンポーネントを新規作成（Lucide名→コンポーネント解決、既存絵文字との後方互換）
- ヒーロー画像上の絵文字オーバーレイを削除(evidence-article-sheet, discover page)
- Celebration particles(🎉✨🎊⭐💫🌟)は対象外、別途ブラッシュアップ

## Capabilities

### New Capabilities
- `lucide-icon-system`: Lucideアイコン名からコンポーネントを解決するHabitIconレンダラー、アイコン選択肢定義、article→icon名マッピング

### Modified Capabilities
- `annual-impact-display`: Impact metricsの表示で絵文字→Lucideアイコンに変更

## Impact

- **データ層**: `src/data/impact-articles/*.ts` 30ファイルの`defaultIcon`フィールド変更
- **DB互換性**: `habits.icon`カラムに既存の絵文字データが存在。HabitIconレンダラーで絵文字/Lucide名の両方をレンダリング可能にし後方互換を維持
- **コンポーネント**: impact-badge, evidence-manager-sheet, evidence-picker, evidence-article-sheet, discover/page, savings-card, impact-article-sheet, stats/page, streak-badge, habit-list, habit-form, habit-detail-modal
- **依存**: lucide-react（既にインストール済み）
