import Image from 'next/image';

type SectionImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

export function SectionImage({ src, alt, priority = false }: SectionImageProps) {
  return (
    <section className="w-full">
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <Image
          src={src}
          alt={alt}
          width={1792}
          height={1024}
          priority={priority}
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
