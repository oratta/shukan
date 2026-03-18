# Spec: Weekday Labels on Past-Day Dots

## Requirements

---

### REQ-WL-01: 過去ドット上への曜日ラベル表示

HabitCard の過去ドット列（`recentDays.slice(1).map()` でレンダリングされる部分）において、各 DayStatusDot の上に曜日略称ラベルを表示する。

**対象**: `recentDays` の index 1 以降（today = index 0 は対象外）。

---

### REQ-WL-02: ロケール対応の曜日文字列

曜日略称は `toLocaleDateString(locale, { weekday: 'narrow' })` で生成する。

- ロケールは `useLocale()` (next-intl) から取得する
- 日本語ロケール (`ja`): `月` `火` `水` `木` `金` 等
- 英語ロケール (`en`): `M` `T` `W` `T` `F` 等

---

### REQ-WL-03: タイムゾーン安全な日付パース

`day.date`（`YYYY-MM-DD` 形式の文字列）から Date オブジェクトを生成する際、`new Date(day.date + 'T00:00:00')` を使用する。

**理由**: `new Date('YYYY-MM-DD')` は UTC 午前0時としてパースされるため、ローカルタイムゾーンによって前日の日付にズレる場合がある。

---

### REQ-WL-04: ラップ構造

各過去ドットを以下の構造でラップする。

```tsx
<div className="flex flex-col items-center gap-0.5">
  <span className="text-[9px] text-muted-foreground leading-none">
    {weekdayLabel}
  </span>
  <DayStatusDot ... />
</div>
```

DayStatusDot コンポーネント自体は変更しない。

---

### REQ-WL-05: 今日の StatusIndicator への影響なし

`recentDays[0]`（today）のレンダリングは変更しない。今日のステータスボタンには曜日ラベルを付与しない。

---

## 変更対象ファイル

- `src/components/habits/habit-card.tsx`
  - `useLocale` を next-intl からインポート追加
  - `recentDays.slice(1).map()` のレンダリング部分を REQ-WL-04 の構造に変更

---

## Scenarios

### WHEN 日本語ロケールで表示 THEN 曜日が漢字1文字で表示される
- `day.date = "2026-03-17"` → ラベル: `火`
- `day.date = "2026-03-16"` → ラベル: `月`
- `day.date = "2026-03-15"` → ラベル: `日`

### WHEN 英語ロケールで表示 THEN 曜日がアルファベット1〜2文字で表示される
- `day.date = "2026-03-17"` → ラベル: `T` または `Tu`（ブラウザ依存）
- `day.date = "2026-03-16"` → ラベル: `M`

### WHEN 今日のドット（index 0）を見る THEN ラベルは表示されない
- StatusIndicator の上には何も追加されない

### WHEN 日付文字列がタイムゾーン境界付近でも THEN 正しい曜日が表示される
- `new Date('2026-03-17T00:00:00')` でパースするため、UTC 変換によるズレが発生しない
