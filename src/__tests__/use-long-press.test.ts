import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLongPressHandlers, LONG_PRESS_MS } from '@/hooks/useLongPress';

// redesign-quit-habit-input (issue #104): 長押し検出のコアロジック

function makeClickEvent() {
  return { stopPropagation: vi.fn() };
}

describe('createLongPressHandlers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('500ms 押し続けると onLongPress が発火する', () => {
    const onLongPress = vi.fn();
    const h = createLongPressHandlers(onLongPress);
    h.onPointerDown({ clientX: 0, clientY: 0 });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('500ms 未満で離すと onLongPress は発火せず、click が onClick に届く', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const h = createLongPressHandlers(onLongPress, onClick);
    h.onPointerDown({ clientX: 0, clientY: 0 });
    vi.advanceTimersByTime(LONG_PRESS_MS - 100);
    h.onPointerUp();
    vi.advanceTimersByTime(1000);
    expect(onLongPress).not.toHaveBeenCalled();
    h.onClick(makeClickEvent());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('長押し発火後の click は1回だけ抑止される（達成トグルの誤発火防止）', () => {
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    const h = createLongPressHandlers(onLongPress, onClick);
    h.onPointerDown({ clientX: 0, clientY: 0 });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onLongPress).toHaveBeenCalledTimes(1);
    // 長押しの残響 click は抑止
    h.onClick(makeClickEvent());
    expect(onClick).not.toHaveBeenCalled();
    // 次の通常タップは通る
    h.onPointerDown({ clientX: 0, clientY: 0 });
    h.onPointerUp();
    h.onClick(makeClickEvent());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('10px を超えて動いたらキャンセルされる（スクロール中の誤発火防止）', () => {
    const onLongPress = vi.fn();
    const h = createLongPressHandlers(onLongPress);
    h.onPointerDown({ clientX: 0, clientY: 0 });
    h.onPointerMove({ clientX: 0, clientY: 20 });
    vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('pointercancel / pointerleave でもキャンセルされる', () => {
    const onLongPress = vi.fn();
    const h = createLongPressHandlers(onLongPress);
    h.onPointerDown({ clientX: 0, clientY: 0 });
    h.onPointerCancel();
    vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    expect(onLongPress).not.toHaveBeenCalled();

    h.onPointerDown({ clientX: 0, clientY: 0 });
    h.onPointerLeave();
    vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('click は常に stopPropagation する（カード展開トグルへの伝播防止）', () => {
    const h = createLongPressHandlers(vi.fn(), vi.fn());
    const e = makeClickEvent();
    h.onClick(e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });
});
