## Context

アプリ全体で絵文字がUIアイコンとして使われている。lucide-reactは既にインストール済みで一部コンポーネントで利用中。DBの`habits.icon`カラムには既存ユーザーの絵文字データが保存されている。

## Goals / Non-Goals

**Goals:**
- 全ての装飾用絵文字をLucideアイコンに置換
- 既存DBデータ（絵文字）との後方互換性を維持
- ヒーロー画像上の絵文字オーバーレイを削除

**Non-Goals:**
- Celebration particles（🎉✨🎊⭐💫🌟）の変更（別途対応）
- DBマイグレーション（既存の絵文字データはそのまま動作）
- 新しいアイコンライブラリの導入

## Decisions

### D1: HabitIconレンダラーの設計

**選択**: Lucide名 or 絵文字を判定して描画する`HabitIcon`コンポーネントを作成

```
<HabitIcon name="dumbbell" size={20} />  → Lucide Dumbbell
<HabitIcon name="💪" size={20} />        → 絵文字テキスト（後方互換）
```

**判定方法**: 文字列がASCII文字のみ → Lucide名、それ以外 → 絵文字

**理由**: DB既存データの絵文字を壊さず、新規作成分はLucideになる。マイグレーション不要。

### D2: アイコンレジストリの構造

**選択**: 静的マッピングオブジェクト（`Record<string, LucideIcon>`）

```typescript
// src/lib/icon-registry.ts
import { Dumbbell, BookOpen, ... } from 'lucide-react';

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  ...
};
```

**理由**: dynamic importだとバンドルが複雑になる。使うアイコンは50個程度なので静的で十分。tree-shakingもeffective。

### D3: Impact Metricsアイコン

| 現状 | Lucide | 用途 |
|------|--------|------|
| 🏥 | HeartPulse | 健康寿命 |
| 💰 | Wallet | 節約額 |
| 📈 | TrendingUp | 収入増 |

コンポーネントとして直接import。レジストリ経由不要。

### D4: Article defaultIconの変更

30の`impact-articles/*.ts`ファイルの`defaultIcon`をLucide名に変更:

| Article | 現状 | Lucide名 |
|---------|------|----------|
| quit_smoking | 🚭 | cigarette-off |
| quit_alcohol | 🍺 | wine-off |
| quit_porn | 🧠 | brain |
| no_youtube | 📺 | tv-minimal |
| daily_cardio | 🏃 | person-standing |
| daily_strength | 💪 | dumbbell |
| morning_planning | 📋 | clipboard-list |
| daily_walking | 🚶 | footprints |
| daily_yoga | 🧘‍♂️ | flower-2 |
| daily_meditation | 🧠 | brain |
| daily_reading | 📚 | book-open |
| drink_water | 💧 | droplets |
| sleep_7hours | 😴 | moon |
| wake_early | 🌅 | sunrise |
| eat_vegetables | 🥬 | leaf |
| quit_junk_food | 🍔 | utensils-crossed |
| quit_sugar | 🍬 | candy-off |
| home_cooking | 🍳 | chef-hat |
| daily_journaling | 📝 | notebook-pen |
| gratitude_practice | 🙏 | hand-heart |
| time_in_nature | 🌳 | tree-pine |
| cold_shower | 🚿 | shower-head |
| daily_stretching | 🤸 | stretch-horizontal |
| learn_language | 🌍 | globe |
| no_impulse_buying | 🛒 | shopping-cart |
| daily_saving | 💰 | piggy-bank |
| deep_work | 🎯 | target |
| intermittent_fasting | ⏱️ | timer |
| no_screens_before_bed | 📱 | smartphone-off |
| quit_social_media | 📵 | message-circle-off |

### D5: Habit Icon Picker選択肢

24個のLucideアイコン名をICON_OPTIONSとして定義（habit-form.tsx内）:

`dumbbell, book-open, person-standing, flower-2, droplets, target, pen-tool, palette, music, sprout, moon, apple, paintbrush, pill, dog, notebook-pen, coffee, footprints, brain, heart, sunrise, book, guitar, flame`

## Risks / Trade-offs

- [既存ユーザーのアイコン表示] → HabitIconレンダラーの絵文字フォールバックで対応。視覚的一貫性は新旧混在するが、機能は壊れない
- [バンドルサイズ増] → Lucideはtree-shakeable。使用アイコン50個程度で影響軽微
- [一部Lucideアイコンが存在しない可能性] → 実装時にlucide-reactのバージョンで確認し、なければ近いアイコンを選択
