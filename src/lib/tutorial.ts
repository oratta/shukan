/**
 * 初回チュートリアル（コーチマーク）の純ロジック（issue 未起票・プロトタイプ）。
 *
 * オンボーディング完了直後に一度だけ、実 UI の上にスポットライトを重ねて
 * 「タップで達成 → 再タップで取り消し → 長押し → 発見タブ → 追加/自作」の
 * 操作を実際に触りながら案内する。表示制御は localStorage（クライアント完結）。
 * DOM 依存の描画は components/tutorial/tutorial-overlay.tsx が担当する。
 */

export const TUTORIAL_STORAGE_KEY = 'smitch-tutorial';

export type TutorialEventType =
  | 'habit-completed'
  | 'habit-uncompleted'
  | 'action-sheet-open'
  | 'action-sheet-closed';

/** アプリ側からチュートリアルへ操作の発生を通知する。非アクティブ時は誰も聞いていないだけ（no-op）。 */
export function emitTutorialEvent(type: TutorialEventType) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('smitch-tutorial-event', { detail: { type } }));
}

export const TUTORIAL_EVENT_NAME = 'smitch-tutorial-event';

export type TutorialAdvance =
  | { type: 'next' } // ツールチップの「次へ」ボタンで進む
  | { type: 'event'; event: TutorialEventType } // 実操作の発生で進む
  | { type: 'route'; route: string }; // 画面遷移で進む

export interface TutorialStep {
  id: 'welcome' | 'complete' | 'undo' | 'longpress' | 'discover' | 'articles' | 'create';
  /** スポットライト対象。省略時は中央カード（welcome） */
  selector?: string;
  /** スポットライトを円形にする（達成ボタン用） */
  circle?: boolean;
  /** 穴の内側のタップを実 UI に通す（実操作で進むステップ） */
  interactive: boolean;
  advance: TutorialAdvance;
  /** anchor が見つからないとき、このステップ id まで飛ばす（習慣 0 件など） */
  skipToOnMissing?: TutorialStep['id'];
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    interactive: false,
    advance: { type: 'next' },
  },
  {
    id: 'complete',
    selector: '[data-tutorial="habit-status"]',
    circle: true,
    interactive: true,
    advance: { type: 'event', event: 'habit-completed' },
    skipToOnMissing: 'discover',
  },
  {
    id: 'undo',
    selector: '[data-tutorial="habit-status"]',
    circle: true,
    interactive: true,
    advance: { type: 'event', event: 'habit-uncompleted' },
    skipToOnMissing: 'discover',
  },
  {
    id: 'longpress',
    selector: '[data-tutorial="habit-status"]',
    circle: true,
    interactive: true,
    // シートが開いたらオーバーレイを隠し、閉じたら次のステップへ（overlay 側で二段処理）
    advance: { type: 'event', event: 'action-sheet-open' },
    skipToOnMissing: 'discover',
  },
  {
    id: 'discover',
    selector: '[data-tutorial="nav-discover"]',
    interactive: true,
    advance: { type: 'route', route: '/discover' },
  },
  {
    id: 'articles',
    selector: '[data-tutorial="discover-articles"] > button:first-of-type',
    interactive: false,
    advance: { type: 'next' },
  },
  {
    id: 'create',
    selector: '[data-tutorial="discover-create"]',
    interactive: false,
    advance: { type: 'next' },
  },
];

export function stepIndexById(id: TutorialStep['id']): number {
  return TUTORIAL_STEPS.findIndex((s) => s.id === id);
}

/** welcome を除いた進捗表示用の位置（1 始まり）。welcome では 0 を返す。 */
export function progressOf(stepIndex: number): { current: number; total: number } {
  return { current: stepIndex, total: TUTORIAL_STEPS.length - 1 };
}

// --- localStorage（SSR 安全・Safari プライベートモード安全） ---------------

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value: string) {
  try {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, value);
  } catch {
    // 保存できない環境ではチュートリアルが再表示されうるだけで実害はない
  }
}

/** オンボーディング完了時に呼ぶ。次にホームを開いたときチュートリアルが始まる。 */
export function markTutorialPending() {
  if (typeof window === 'undefined') return;
  writeStorage('pending');
}

export function isTutorialPending(): boolean {
  if (typeof window === 'undefined') return false;
  return readStorage() === 'pending';
}

/** 完走・スキップの両方で呼ぶ。以後は自動表示しない。 */
export function markTutorialDone() {
  if (typeof window === 'undefined') return;
  writeStorage('done');
}
