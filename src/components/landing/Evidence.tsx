import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { lines } from './lines';

/**
 * Evidence — transparency. Reflects the real evidence feature (each habit ships
 * with what it affects, how strong the evidence is, and caveats). Honest, and
 * the antidote to the "うさんくさくない" brand premise.
 */
export async function Evidence() {
  const t = await getTranslations('marketing');

  return (
    <section className="bg-background">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] gap-8 md:gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-foreground">
              {lines(t('evidence.title'))}
            </h2>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
              {t('evidence.body')}
            </p>
          </div>

          <div className="relative aspect-[540/750] max-w-[420px] mx-auto lg:mx-0 w-full rounded-md overflow-hidden">
            <Image
              src="/landing/photo-detail-reading.png"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 420px, 80vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
