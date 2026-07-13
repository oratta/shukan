import { getTranslations } from 'next-intl/server';
import { DISPLAY_LG, EYEBROW, SHELL } from './theme';

type Item = { title: string; body: string };

export async function Indictment() {
  const t = await getTranslations('marketing');
  const lines = t.raw('indictment.lines') as string[];
  const items = t.raw('indictment.items') as Item[];

  return (
    <section id="indictment" className="bg-[#FAFAFA] text-[#0A0A0A]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#0A0A0A]/50`}>{t('indictment.eyebrow')}</p>

        <h2 className={`${DISPLAY_LG} mt-8`}>
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <ol className="mt-16 border-t-4 border-[#0A0A0A]">
          {items.map((item, i) => (
            <li
              key={item.title}
              className="grid gap-4 border-b-2 border-[#0A0A0A] py-10 md:grid-cols-[6rem_minmax(0,1fr)] md:gap-10 md:py-14"
            >
              <span className="font-mono text-4xl font-black text-[#4A8FE7] md:text-5xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="space-y-4">
                <h3 className="text-2xl leading-snug font-black md:text-4xl">{item.title}</h3>
                <p className="max-w-3xl text-base leading-relaxed text-[#0A0A0A]/75 md:text-lg">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
