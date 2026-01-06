import React from 'react';
import { ButtonType, CalculatorButton } from '../types';

interface KeypadProps {
  onBtnClick: (val: string, type: ButtonType) => void;
  isShift: boolean;
  isAlpha: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({ onBtnClick, isShift, isAlpha }) => {
  
  const buttons: CalculatorButton[] = [
    // Row 1: Scientific & Modes
    { label: 'SHIFT', type: ButtonType.Shift, value: 'SHIFT', className: 'text-yellow-400 border-yellow-500/20' },
    { label: 'ALPHA', type: ButtonType.Action, value: 'ALPHA', className: 'text-red-400 border-red-500/20' },
    { label: 'MODE', type: ButtonType.Action, value: 'MODE' },
    { label: 'ON', type: ButtonType.Action, value: 'AC', className: 'bg-red-500/20 text-red-100 hover:bg-red-500/40 border-red-500/30' },

    // Row 2: Navigation & Edit
    { label: 'x⁻¹', shiftLabel: 'x!', type: ButtonType.Scientific, value: '^(-1)', shiftValue: '!' },
    { label: 'nCr', shiftLabel: 'nPr', type: ButtonType.Scientific, value: 'nCr', shiftValue: 'nPr' },
    { label: 'POL', shiftLabel: 'Rec', type: ButtonType.Scientific, value: 'pol(', shiftValue: 'rec(' },
    { label: 'x³', shiftLabel: '³√', type: ButtonType.Scientific, value: '^3', shiftValue: 'cbrt(' },

    // Row 3
    { label: 'ab/c', shiftLabel: 'd/c', type: ButtonType.Scientific, value: 'fraction', shiftValue: 'improper' },
    { label: '√', shiftLabel: 'x²', type: ButtonType.Scientific, value: 'sqrt(', shiftValue: '^2' },
    { label: 'x²', shiftLabel: 'x³', type: ButtonType.Scientific, value: '^2', shiftValue: '^3' },
    { label: 'log', shiftLabel: '10ⁿ', type: ButtonType.Scientific, value: 'log(', shiftValue: '10^(' },
    
    // Row 4
    { label: 'ln', shiftLabel: 'eⁿ', type: ButtonType.Scientific, value: 'ln(', shiftValue: 'exp(' },
    { label: '(-)', shiftLabel: 'A', type: ButtonType.Scientific, value: '-', shiftValue: 'A' },
    { label: '°\'"', shiftLabel: 'B', type: ButtonType.Scientific, value: 'deg', shiftValue: 'B' },
    { label: 'ENG', shiftLabel: 'i', type: ButtonType.Scientific, value: 'ENG', shiftValue: 'i' },

    // Row 5: Trig
    { label: 'sin', shiftLabel: 'sin⁻¹', type: ButtonType.Scientific, value: 'sin(', shiftValue: 'asin(' },
    { label: 'cos', shiftLabel: 'cos⁻¹', type: ButtonType.Scientific, value: 'cos(', shiftValue: 'acos(' },
    { label: 'tan', shiftLabel: 'tan⁻¹', type: ButtonType.Scientific, value: 'tan(', shiftValue: 'atan(' },
    { label: 'RCL', shiftLabel: 'STO', type: ButtonType.Action, value: 'RCL', shiftValue: 'STO' },

    // Row 6: Main Numbers start
    { label: '(', shiftLabel: '%', type: ButtonType.Scientific, value: '(', shiftValue: '%' },
    { label: ')', shiftLabel: ',', type: ButtonType.Scientific, value: ')', shiftValue: ',' },
    { label: 'S⇔D', shiftLabel: 'M+', type: ButtonType.Action, value: 'SD', shiftValue: 'M+' },
    { label: 'DEL', shiftLabel: 'INS', type: ButtonType.Action, value: 'DEL', shiftValue: 'INS', className: 'bg-orange-500/20 text-orange-200 border-orange-500/30' },

    // Row 7
    { label: '7', shiftLabel: 'CONST', type: ButtonType.Number, value: '7', shiftValue: 'CONST' },
    { label: '8', shiftLabel: 'CONV', type: ButtonType.Number, value: '8', shiftValue: 'CONV' },
    { label: '9', shiftLabel: 'CLR', type: ButtonType.Number, value: '9', shiftValue: 'CLR' },
    { label: 'AC', shiftLabel: 'OFF', type: ButtonType.Action, value: 'AC', shiftValue: 'OFF', className: 'bg-red-500/20 text-red-100 border-red-500/30' },

    // Row 8
    { label: '4', shiftLabel: 'MATRIX', type: ButtonType.Number, value: '4' },
    { label: '5', shiftLabel: 'VECTOR', type: ButtonType.Number, value: '5' },
    { label: '6', shiftLabel: 'BASE', type: ButtonType.Number, value: '6' },
    { label: '×', shiftLabel: '', type: ButtonType.Operation, value: '*' },

    // Row 9
    { label: '1', shiftLabel: 'STAT', type: ButtonType.Number, value: '1' },
    { label: '2', shiftLabel: 'CMPLX', type: ButtonType.Number, value: '2' },
    { label: '3', shiftLabel: 'DIST', type: ButtonType.Number, value: '3' },
    { label: '÷', shiftLabel: '', type: ButtonType.Operation, value: '/' },

    // Row 10
    { label: '0', shiftLabel: 'Rnd', type: ButtonType.Number, value: '0' },
    { label: '.', shiftLabel: 'Ran#', type: ButtonType.Number, value: '.', shiftValue: 'random' },
    { label: 'π', shiftLabel: 'e', type: ButtonType.Scientific, value: 'pi', shiftValue: 'e' },
    { label: '=', shiftLabel: 'Ans', type: ButtonType.Equal, value: '=', shiftValue: 'ans', className: 'bg-cyan-600/80 hover:bg-cyan-500 text-white border-cyan-400' }, 
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full pb-10 md:pb-6">
      {buttons.map((btn, idx) => {
        const isShifted = isShift && btn.shiftLabel;
        const activeLabel = isShifted ? btn.shiftLabel : btn.label;
        
        // Compact sizing for mobile (h-11) to fit 10 rows
        let baseClass = "relative group overflow-hidden p-1 h-11 md:h-16 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg transition-all duration-200 active:scale-95 flex flex-col items-center justify-center border";
        let colorClass = "bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/80 shadow-sm";

        // Override colors based on specific props
        if (btn.type === ButtonType.Number) {
           colorClass = "bg-white/10 border-white/10 text-white hover:bg-white/20 shadow-sm backdrop-blur-sm";
        }
        if (btn.className) {
            colorClass = btn.className + " shadow-sm backdrop-blur-sm";
            if (!btn.className.includes('bg-')) colorClass += " bg-slate-800/50";
            if (!btn.className.includes('border')) colorClass += " border-slate-700";
        }

        if (isShift && btn.type === ButtonType.Shift) {
             colorClass = "bg-yellow-500 text-slate-900 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]";
        }

        return (
          <button
            key={`${btn.value}-${idx}`}
            onClick={() => onBtnClick(isShifted ? (btn.shiftValue || btn.value) : btn.value, btn.type)}
            className={`${baseClass} ${colorClass}`}
          >
            {/* Shift/Alpha indicator text tiny top-left/right */}
            {btn.shiftLabel && !isShifted && (
              <span className="absolute top-0.5 left-1 text-[7px] md:text-[8px] text-yellow-500 font-bold opacity-80 tracking-wide">
                {btn.shiftLabel}
              </span>
            )}
            
            <span className={`z-10 ${btn.type === ButtonType.Scientific ? 'font-serif italic' : ''}`}>
              {activeLabel}
            </span>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        );
      })}
      
      {/* Plus and Minus keys positioned manually */}
      <button 
        onClick={() => onBtnClick('+', ButtonType.Operation)}
        className="col-start-4 row-start-8 p-1 h-11 md:h-16 rounded-xl md:rounded-2xl bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-700/80 shadow-sm text-base md:text-lg font-semibold"
      >
        +
      </button>
      <button 
        onClick={() => onBtnClick('-', ButtonType.Operation)}
        className="col-start-4 row-start-9 p-1 h-11 md:h-16 rounded-xl md:rounded-2xl bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-700/80 shadow-sm text-base md:text-lg font-semibold"
      >
        -
      </button>
    </div>
  );
};