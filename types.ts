export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  mode?: AppMode;
  eqnState?: EqnState;
}

export enum ButtonType {
  Number = 'number',
  Operation = 'operation',
  Action = 'action',
  Scientific = 'scientific',
  Shift = 'shift',
  Equal = 'equal'
}

export interface CalculatorButton {
  label: string;
  shiftLabel?: string;
  value: string;
  shiftValue?: string;
  type: ButtonType;
  className?: string;
}

export interface ConstantItem {
  code: string;
  symbol: string;
  name: string;
  value: string;
  unit: string;
}

export interface ConversionItem {
  id: string;
  name: string;
  from: string;
  to: string;
  formula: string;
}

// --- New Types for Advanced Modes ---

export enum AppMode {
  COMP = 'COMP',
  MODE_SELECT = 'MODE_SELECT',
  EQN_SELECT = 'EQN_SELECT',
  EQN_INPUT = 'EQN_INPUT',
  EQN_RESULT = 'EQN_RESULT'
}

export enum EquationType {
  Linear2 = 1, // anX + bnY = cn
  Linear3 = 2, // anX + bnY + cnZ = dn
  Quad = 3,    // aX^2 + bX + c = 0
  Cubic = 4    // aX^3 + bX^2 + cX + d = 0
}

export interface EqnSolution {
  label: string;
  exactStr: string;
  decimalStr: string;
}

export interface EqnState {
  type: EquationType | null;
  coeffs: string[]; // Store as strings to handle current input buffer easily
  activeIdx: number;
  results: EqnSolution[];
  showDecimal: boolean; // Toggle state for S<=>D
}