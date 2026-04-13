import goldIcon from '../assets/icons/resources/gold.svg';
import woodIcon from '../assets/icons/resources/wood.svg';
import stoneIcon from '../assets/icons/resources/stone.svg';
import oreIcon from '../assets/icons/resources/ore.svg';
import type { Resources } from '../types/game';

/** SVG icon URL for each resource type. */
export const RESOURCE_ICONS: Record<keyof Resources, string> = {
  gold: goldIcon,
  wood: woodIcon,
  stone: stoneIcon,
  ore: oreIcon,
};
