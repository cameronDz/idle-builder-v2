import { RESOURCE_ICONS } from '../config/resourceIcons';
import type { Resources } from '../types/game';

interface ResourceIconProps {
  resource: keyof Resources;
  size?: number;
  className?: string;
}

export function ResourceIcon({ resource, size = 14, className }: ResourceIconProps) {
  return (
    <img
      src={RESOURCE_ICONS[resource]}
      alt={resource}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}
