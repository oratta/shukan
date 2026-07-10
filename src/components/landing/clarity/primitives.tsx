import type { ReactNode } from 'react';

export function Section({
  id,
  children,
  bordered = true,
}: {
  id?: string;
  children: ReactNode;
  bordered?: boolean;
}) {
  return (
    <section id={id} className={bordered ? 'border-t border-zinc-200' : undefined}>
      <div className="mx-auto w-full max-w-5xl px-6 py-24 md:px-8 md:py-32">{children}</div>
    </section>
  );
}

export function SectionHeading({ title, lede }: { title: string; lede?: string }) {
  return (
    <header className="max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">{title}</h2>
      {lede ? <p className="mt-5 text-base leading-relaxed text-zinc-600">{lede}</p> : null}
    </header>
  );
}

/** 図表の下に置く注記。前提・読み方・限界はここに書く。 */
export function FigureNote({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-xs leading-relaxed text-zinc-500">{children}</p>;
}
