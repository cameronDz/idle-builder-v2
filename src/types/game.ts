export interface Resources {
  gold: number;
  wood: number;
  stone: number;
}

export interface BuildingTimer {
  hasStarted: boolean;
  isComplete: boolean;
  level: number;
  progress: number;
  timeRemaining: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface BuildingInstance {
  buildingTypeId: string;
  id: string;
  level: number;
  position: GridPosition;
  buildingTimer: BuildingTimer;
}

export interface GridCell {
  buildingInstance: BuildingInstance | null;
  isOccupied: boolean;
  position: GridPosition;
}

export interface PrestigeState {
  timesPrestiged: number;
  globalMultiplier: number;
}
