import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImpactKpiMetric {
  icon: LucideIcon;
  /** キャプション（アイコンの隣に置くラベル）。key にも使うので一意であること。 */
  label: string;
  /** 大きい mono 数値。 */
  value: string;
  /** 数値の右に添える従属値（分母など）。無ければ省略。 */
  sub?: string;
}

interface ImpactKpiGridProps {
  metrics: ImpactKpiMetric[];
  /** true で数値を success(緑) に。達成状態のとき使う。既定は無彩色インク。 */
  accent?: boolean;
  /** グリッド外枠の指定。border-y（サンドイッチ）や rounded-xl border（単独カード）を渡す。 */
  className?: string;
}

/**
 * ライフインパクトの KPI を 2×2 のヘアライン罫線グリッドで見せる共通部品。
 * 「アイコン+ラベルのキャプション行 → その下に大きい mono 数値」を 1 セルとし、
 * gap-px + bg-border でセル間をヘアラインで区切る（原則⑤: 影でなく罫線＋余白で階層化）。
 * 緑はアイコンの差し色に留め、数値は既定インク・達成時のみ success（原則①）。
 * ホームの「今日のライフインパクト」(daily-impact-summary) と習慣詳細で共有し、
 * 同じ意味の情報を画面をまたいで同じ構造で見せる。
 */
export function ImpactKpiGrid({ metrics, accent = false, className }: ImpactKpiGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-px bg-border', className)}>
      {metrics.map((m) => (
        <div key={m.label} className="flex flex-col gap-2 bg-card px-5 py-4">
          <div className="flex items-center gap-1.5">
            <m.icon className="size-3.5 text-success" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {m.label}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span
              className={cn(
                'whitespace-nowrap font-mono text-[26px] font-semibold leading-none tracking-tight tabular-nums',
                accent ? 'text-success' : 'text-foreground'
              )}
            >
              {m.value}
            </span>
            {m.sub && (
              <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground">
                {m.sub}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
