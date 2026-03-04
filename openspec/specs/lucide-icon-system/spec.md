## ADDED Requirements

### Requirement: HabitIcon renderer SHALL resolve icon names to components
The system SHALL provide a `HabitIcon` component that accepts a `name` string and renders the corresponding Lucide icon. If the name is an emoji (non-ASCII), it SHALL render the emoji as text for backward compatibility.

#### Scenario: Render Lucide icon by name
- **WHEN** HabitIcon receives name="dumbbell"
- **THEN** the Dumbbell Lucide icon component is rendered at the specified size

#### Scenario: Render legacy emoji fallback
- **WHEN** HabitIcon receives name="💪" (emoji string)
- **THEN** the emoji is rendered as a text span at the appropriate font size

### Requirement: Icon registry SHALL map names to Lucide components
The system SHALL maintain a static registry mapping kebab-case icon names to Lucide React components. The registry MUST include icons for all 30 impact articles and all habit icon picker options.

#### Scenario: All article icons resolvable
- **WHEN** any article's defaultIcon value is looked up in the registry
- **THEN** a valid Lucide component is returned

### Requirement: Habit Icon Picker SHALL use Lucide icons
The habit creation/edit form SHALL display a grid of Lucide icons instead of emoji for the icon picker. Selected icon MUST be stored as a Lucide kebab-case name string.

#### Scenario: User selects icon in habit form
- **WHEN** user taps an icon in the picker grid
- **THEN** the selected Lucide icon name is stored in habit.icon field

### Requirement: Impact metrics SHALL use Lucide icons
All impact metric displays (health, cost, income) SHALL use Lucide icons (HeartPulse, Wallet, TrendingUp) instead of emoji (🏥💰📈).

#### Scenario: Impact badge renders with Lucide icons
- **WHEN** impact badge is displayed for any habit
- **THEN** HeartPulse, Wallet, and TrendingUp Lucide icons are shown instead of emoji

### Requirement: UI decoration SHALL use Lucide icons
Decorative UI elements SHALL use Lucide icons: Flame for streaks, Sprout for empty states, BarChart3 for stats empty state, Dumbbell/Shield for form section headers.

#### Scenario: Streak badge shows Flame icon
- **WHEN** streak badge is rendered
- **THEN** Flame Lucide icon is displayed instead of 🔥

### Requirement: Hero image overlay icons SHALL be removed
The emoji icon overlay on hero images in discover cards and evidence article sheet SHALL be removed. Only the hero image is displayed.

#### Scenario: Discover card shows image only
- **WHEN** a discover article card with a hero image is rendered
- **THEN** only the hero image is visible with no icon overlay

#### Scenario: Article sheet shows image only
- **WHEN** evidence article sheet hero area is rendered
- **THEN** only the hero image is visible with no icon overlay
