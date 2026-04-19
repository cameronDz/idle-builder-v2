import lumberYardBase from '../assets/icons/buildings/lumber_yard_base.svg';
import lumberYardEnhanced from '../assets/icons/buildings/lumber_yard_enhanced.svg';
import lumberYardUltra from '../assets/icons/buildings/lumber_yard_ultra.svg';
import quarryBase from '../assets/icons/buildings/quarry_base.svg';
import quarryEnhanced from '../assets/icons/buildings/quarry_enhanced.svg';
import quarryUltra from '../assets/icons/buildings/quarry_ultra.svg';
import marketBase from '../assets/icons/buildings/market_base.svg';
import marketEnhanced from '../assets/icons/buildings/market_enhanced.svg';
import marketUltra from '../assets/icons/buildings/market_ultra.svg';
import woodenHouseBase from '../assets/icons/buildings/wooden_house_base.svg';
import woodenHouseEnhanced from '../assets/icons/buildings/wooden_house_enhanced.svg';
import woodenHouseUltra from '../assets/icons/buildings/wooden_house_ultra.svg';
import watchTowerBase from '../assets/icons/buildings/watch_tower_base.svg';
import watchTowerEnhanced from '../assets/icons/buildings/watch_tower_enhanced.svg';
import watchTowerUltra from '../assets/icons/buildings/watch_tower_ultra.svg';
import forgeBase from '../assets/icons/buildings/forge_base.svg';
import forgeEnhanced from '../assets/icons/buildings/forge_enhanced.svg';
import forgeUltra from '../assets/icons/buildings/forge_ultra.svg';
import oreMineBase from '../assets/icons/buildings/ore_mine_base.svg';
import oreMineEnhanced from '../assets/icons/buildings/ore_mine_enhanced.svg';
import oreMineUltra from '../assets/icons/buildings/ore_mine_ultra.svg';
import stoneCastleBase from '../assets/icons/buildings/stone_castle_base.svg';
import stoneCastleEnhanced from '../assets/icons/buildings/stone_castle_enhanced.svg';
import stoneCastleUltra from '../assets/icons/buildings/stone_castle_ultra.svg';

export interface BuildingIconSet {
  base: string;
  enhanced: string;
  ultra: string;
}

/** SVG icon URLs for each building type, keyed by building ID. */
export const BUILDING_ICONS: Record<string, BuildingIconSet> = {
  lumber_yard: { base: lumberYardBase, enhanced: lumberYardEnhanced, ultra: lumberYardUltra },
  quarry: { base: quarryBase, enhanced: quarryEnhanced, ultra: quarryUltra },
  market: { base: marketBase, enhanced: marketEnhanced, ultra: marketUltra },
  wooden_house: { base: woodenHouseBase, enhanced: woodenHouseEnhanced, ultra: woodenHouseUltra },
  watch_tower: { base: watchTowerBase, enhanced: watchTowerEnhanced, ultra: watchTowerUltra },
  forge: { base: forgeBase, enhanced: forgeEnhanced, ultra: forgeUltra },
  ore_mine: { base: oreMineBase, enhanced: oreMineEnhanced, ultra: oreMineUltra },
  stone_castle: { base: stoneCastleBase, enhanced: stoneCastleEnhanced, ultra: stoneCastleUltra },
};
