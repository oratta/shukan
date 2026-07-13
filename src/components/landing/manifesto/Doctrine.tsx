import { getTranslations } from 'next-intl/server';
import { DISPLAY_LG, EYEBROW, SHELL } from './theme';

type Item = { title: string; body: string };

export async function Doctrine() {
  const t = await getTranslations('marketing');
  const items = t.raw('doctrine.items') as Item[];

  return (
    <section id="doctrine" className="bg-[#0A0A0A] text-[#FAFAFA]">
      <div className={`${SHELL} py-20 md:py-32`}>
        <p className={`${EYEBROW} text-[#4A8FE7]`}>{t('doctrine.eyebrow')}</p>
        <h2 className={`${DISPLAY_LG} mt-8`}>{t('doctrine.heading')}</h2>

        <ul className="mt-16 grid border-t-2 border-[#FAFAFA]/25 md:grid-cols-3 md:border-t-4">
          {items.map((item, i) => (
            <li
              key={item.title}
              className="border-b-2 border-[#FAFAFA]/25 py-10 md:border-r-2 md:border-b-0 md:px-8 md:py-12 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            >
              <span
                aria-hidden
                className="font-mono text-5xl font-black text-[#4A8FE7] md:text-6xl"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-6 text-2xl leading-snug font-black md:text-3xl">{item.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-[#FAFAFA]/70">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
