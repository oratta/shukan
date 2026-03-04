## MODIFIED Requirements

### Requirement: マルチエビデンス重み付きインパクト計算
システムは単一エビデンスから複数エビデンスの重み付き合算でインパクトを計算しなければならない（MUST）。

#### Scenario: 複数エビデンスのデイリーインパクト計算
- **WHEN** 習慣に複数のエビデンスが紐付いている（各weight付き）
- **THEN** デイリーインパクト = Σ(article.dailyX × evidence.weight / 100) で計算される
- **THEN** 健康（分）、コスト（円）、収入（円）の3指標が計算される

#### Scenario: 累積インパクトの計算
- **WHEN** 習慣の累積インパクトを計算する
- **THEN** completedDays × デイリーインパクト で累積値が算出される
- **THEN** status='completed' または 'rocket_used' の日数のみカウントされる
- **THEN** status='failed' の日数はカウントされない

#### Scenario: エビデンス0件のインパクト
- **WHEN** 習慣にエビデンスが紐付いていない
- **THEN** impactSavingsはundefined（計算されない）
- **THEN** インパクト関連UIは非表示

#### Scenario: 存在しないarticleIdへの耐性
- **WHEN** エビデンスのarticleIdに対応する記事が見つからない
- **THEN** そのエビデンスはスキップされ、エラーは発生しない

### Requirement: 後方互換性
システムは既存のimpactArticleIdとの後方互換性を維持しなければならない（MUST）。

#### Scenario: レガシーデータのフォールバック
- **WHEN** 習慣にevidences配列が空で、impactArticleIdが設定されている
- **THEN** impactArticleIdを使用してインパクトが計算される（weight=100相当）
