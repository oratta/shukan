'use client';

import { useMemo } from 'react';

export const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 10;

interface PointerLike {
  clientX: number;
  clientY: number;
}

interface ClickLike {
  stopPropagation: () => void;
}

export interface LongPressHandlers {
  onPointerDown: (e: PointerLike) => void;
  onPointerMove: (e: PointerLike) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerLeave: () => void;
  onClick: (e: ClickLike) => void;
  onContextMenu: (e: { preventDefault: () => void }) => void;
}

/**
 * 長押し検出のコアロジック（issue #104）。React 非依存の純粋ファクトリでテスト可能にする。
 * pointerdown から LONG_PRESS_MS 経過で onLongPress を発火し、直後の click を1回だけ抑止する
 * （長押し解放時に達成トグルが誤発火しないように）。指が MOVE_CANCEL_PX 以上動いたら
 * スクロール意図とみなしてキャンセルする。
 */
export function createLongPressHandlers(
  onLongPress: () => void,
  onClick?: () => void
): LongPressHandlers {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let fired = false;
  let startPos: { x: number; y: number } | null = null;

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    onPointerDown(e) {
      fired = false;
      startPos = { x: e.clientX, y: e.clientY };
      clear();
      timer = setTimeout(() => {
        fired = true;
        onLongPress();
      }, LONG_PRESS_MS);
    },
    onPointerMove(e) {
      if (startPos && Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y) > MOVE_CANCEL_PX) {
        clear();
      }
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    onClick(e) {
      e.stopPropagation();
      if (fired) {
        // 長押し発火済み: この click は長押しの残響なので握りつぶす
        fired = false;
        return;
      }
      onClick?.();
    },
    onContextMenu(e) {
      // モバイルの長押しメニュー / デスクトップ右クリックメニューを抑止
      e.preventDefault();
    },
  };
}

/** createLongPressHandlers の React フックラッパー。要素の props にそのままスプレッドする。 */
export function useLongPress(
  onLongPress: () => void,
  onClick?: () => void
): LongPressHandlers {
  return useMemo(
    () => createLongPressHandlers(onLongPress, onClick),
    [onLongPress, onClick]
  );
}
