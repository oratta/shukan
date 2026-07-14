'use client';

import { useSettingsSync } from '@/hooks/useSettings';

/**
 * ログイン中ユーザーの `user_settings`（テーマ／ロケール）を DB からこの端末へ取り込む（#24）。
 * 副作用のみで何も描画しない。Providers 内に **1 つだけ** 置く（複数置くと二重フェッチになる）。
 */
export function SettingsSync() {
  useSettingsSync();
  return null;
}
