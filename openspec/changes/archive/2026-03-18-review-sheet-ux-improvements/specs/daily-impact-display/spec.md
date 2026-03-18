## MODIFIED Requirements

### Requirement: Review sheet displays all habits

レビューシートは昨日の**全習慣**（非アーカイブ）を表示しなければならない（SHALL）。入力済みの習慣はそのステータスで表示し、未入力（none）の習慣は未入力状態で表示する。

#### Scenario: All habits shown including already-reviewed ones
- **WHEN** ユーザーがレビューバナーをタップしてシートを開く
- **THEN** 昨日の非アーカイブ全習慣がリストに表示される
- **AND** 既にステータスが入っている習慣はそのステータス（completed/skipped/failed）で表示される
- **AND** 未入力の習慣は none 状態（ボタン全て非ハイライト）で表示される

#### Scenario: Banner still shows unreviewed count only
- **WHEN** 昨日の未レビュー習慣が3件、レビュー済みが5件ある
- **THEN** バナーには「3件未チェック」と表示される
- **AND** バナーは未レビュー数が0になったら非表示になる

### Requirement: Status selection via inline button group

各習慣のステータス選択は、3つのインラインボタン（completed / skipped / failed）で行わなければならない（SHALL）。タップサイクル式は使用しない。

#### Scenario: Select status with one tap
- **WHEN** 習慣のステータスが none の状態で completed ボタンをタップする
- **THEN** ステータスが completed に変更される
- **AND** completed ボタンが緑でハイライトされる
- **AND** setDayStatus が即座に呼ばれる

#### Scenario: Change status directly
- **WHEN** 習慣のステータスが completed の状態で failed ボタンをタップする
- **THEN** ステータスが failed に変更される（completed → failed に直接遷移）
- **AND** failed ボタンがオレンジでハイライトされる

#### Scenario: Deselect status
- **WHEN** 習慣のステータスが completed の状態で completed ボタンを再タップする
- **THEN** ステータスが none に戻る
- **AND** 全ボタンが非ハイライトに戻る

### Requirement: Status button visual design

ステータスボタンは以下のビジュアルで表示しなければならない（SHALL）:
- completed: Check アイコン、選択時 `bg-[#3D8A5A]/10 border-[#3D8A5A] text-[#3D8A5A]`
- skipped: Minus アイコン、選択時 `bg-gray-200 border-gray-400 text-gray-600`
- failed: X アイコン、選択時 `bg-[#D08068]/10 border-[#D08068] text-[#D08068]`
- 未選択: `border-muted-foreground/20 text-muted-foreground/40`

#### Scenario: Button appearance matches status
- **WHEN** レビューシートが表示されている
- **THEN** 各習慣の行に [✓] [−] [✗] の3ボタンが横並びで表示される
- **AND** 選択中のステータスに対応するボタンのみがハイライトされる

### Requirement: Mood icons use Lucide instead of emoji

ムードスタンプはシステム絵文字ではなく Lucide アイコンで表示しなければならない（SHALL）。

| Mood | アイコン | 色 |
|------|---------|-----|
| 1 | Frown | red-400 |
| 2 | Meh | orange-400 |
| 3 | CircleMinus | gray-400 |
| 4 | Smile | lime-500 |
| 5 | Laugh | green-500 |

#### Scenario: Mood displayed with Lucide icons
- **WHEN** レビューシートのムードセクションが表示される
- **THEN** 5つの丸いボタンにそれぞれ Lucide アイコンが表示される
- **AND** 各アイコンは対応する色で描画される

#### Scenario: Mood selection highlight
- **WHEN** ムード 4 (Smile) をタップする
- **THEN** Smile ボタンが `border-primary bg-primary/10` でハイライトされる
- **AND** 他の4つのボタンは非ハイライトのまま
