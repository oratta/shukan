interface SmitchLogoProps {
  className?: string;
  height?: number;
}

export function SmitchLogo({ className, height = 24 }: SmitchLogoProps) {
  // Aspect ratio from original SVG: 2184 x 1049
  const width = Math.round(height * (2184 / 1049));

  return (
    <img
      src="/smitch-logo.svg"
      alt="Smitch"
      width={width}
      height={height}
      className={className}
    />
  );
}
