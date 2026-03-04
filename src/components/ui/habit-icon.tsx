import { ICON_REGISTRY } from '@/lib/icon-registry';

interface HabitIconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Returns true if the string contains non-ASCII characters (emoji) */
function isEmoji(str: string): boolean {
  return /[^\x00-\x7F]/.test(str);
}

/**
 * Renders a Lucide icon by kebab-case name, or falls back to emoji text.
 * Supports backward compatibility with existing emoji icon data in DB.
 */
export function HabitIcon({ name, size = 20, className }: HabitIconProps) {
  if (isEmoji(name)) {
    return (
      <span
        className={className}
        style={{ fontSize: size, lineHeight: 1 }}
        role="img"
      >
        {name}
      </span>
    );
  }

  const IconComponent = ICON_REGISTRY[name];
  if (!IconComponent) {
    return (
      <span
        className={className}
        style={{ fontSize: size, lineHeight: 1 }}
      >
        ?
      </span>
    );
  }

  return <IconComponent size={size} className={className} />;
}
