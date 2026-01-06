import React from 'react';
import { EquationType, EqnState } from '../types';
import { Calculator, Grid, Activity, Binary, Sigma, BarChart3, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Mode Menu ---

interface ModeMenuProps {
  onSelectMode: (modeIndex: number) => void;
}

export const ModeMenu: React.FC<ModeMenuProps> = ({ onSelectMode }) => {
  const modes = [
    { id: 1, name: 'COMP', icon: <Calculator className="w-5 h-5" /> },
    { id: 2, name: 'CMPLX', icon: <Activity className="w-5 h-5" /> },
    { id: 3, name: 'STAT', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 4, name: 'BASE-N', icon: <Binary className="w-5 h-5" /> },
    { id: 5, name: 'EQN', icon: <Sigma className="w-5 h-5" /> },
    { id: 6, name: 'MATRIX', icon: <Grid className="w-5 h-5" /> },
    { id: 7, name: 'VECTOR', icon: <ArrowRight className="w-5 h-5" /> },
    { id: 8, name: 'TABLE', icon: <Grid className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full h-full p-4 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
      <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Select Mode</h2>
      <div className="grid grid-cols-2 gap-3 pb-4">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 transition-all text-left group"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-cyan-400 text-xs font-mono font-bold border border-slate-700">
              {m.id}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200 group-hover:text-white">{m.name}</span>
            </div>
            <div className="ml-auto opacity-50 group-hover:opacity-100 group-hover:text-cyan-400">
                {m.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Equation Type Selection ---

interface EqnSelectProps {
  onSelectType: (type: EquationType) => void;
}

export const EqnSelect: React.FC<EqnSelectProps> = ({ onSelectType }) => {
  const options = [
    { id: EquationType.Linear2, label: 'anX + bnY = cn' },
    { id: EquationType.Linear3, label: 'anX + bnY + cnZ = dn' },
    { id: EquationType.Quad, label: 'aX² + bX + c = 0' },
    { id: EquationType.Cubic, label: 'aX³ + bX² + cX + d = 0' },
  ];

  return (
    <div className="w-full h-full p-4 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
      <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Equation Type</h2>
      <div className="flex-1 flex flex-col gap-2 pb-4">
        {options.map((opt, idx) => (
          <button
            key={opt.id}
            onClick={() => onSelectType(opt.id)}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 transition-all text-left"
          >
             <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-cyan-400 text-xs font-mono font-bold border border-slate-700">
              {idx + 1}
            </span>
            <span className="font-mono text-sm md:text-base text-slate-300">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Equation Input Grid ---

interface EqnInputProps {
  eqnState: EqnState;
  onChangeActiveIndex: (idx: number) => void;
}

export const EqnInput: React.FC<EqnInputProps> = ({ eqnState, onChangeActiveIndex }) => {
  const { type, coeffs, activeIdx } = eqnState;

  // Configuration for grid layout
  let cols = 3; // Default a, b, c
  let labels = ['a', 'b', 'c'];
  let rows = 1;

  if (type === EquationType.Linear2) {
    cols = 3; 
    labels = ['a', 'b', 'c'];
    rows = 2; // Two equations
  } else if (type === EquationType.Linear3) {
    cols = 4;
    labels = ['a', 'b', 'c', 'd'];
    rows = 3;
  } else if (type === EquationType.Quad) {
    cols = 3;
    labels = ['a', 'b', 'c'];
    rows = 1;
  } else if (type === EquationType.Cubic) {
    cols = 4;
    labels = ['a', 'b', 'c', 'd'];
    rows = 1;
  }

  // Generate grid cells
  const gridCells = [];
  const totalCells = cols * rows;

  for (let i = 0; i < totalCells; i++) {
    const isActive = i === activeIdx;
    gridCells.push(
      <div 
        key={i} 
        onClick={() => onChangeActiveIndex(i)}
        className={`
          relative p-2 rounded border font-mono text-right text-sm md:text-base overflow-hidden whitespace-nowrap cursor-pointer transition-colors
          ${isActive 
            ? 'bg-cyan-900/30 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
            : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}
        `}
      >
        {coeffs[i] || "0"}
        {isActive && <span className="animate-pulse ml-0.5 inline-block w-1.5 h-4 bg-cyan-400 align-middle"></span>}
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 flex flex-col overflow-hidden">
      <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-1">
        <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-widest">
           {type === EquationType.Quad ? 'Quadratic' : type === EquationType.Linear2 ? 'Linear (2)' : type === EquationType.Linear3 ? 'Linear (3)' : type === EquationType.Cubic ? 'Cubic' : 'Equation'}
        </h2>
        <span className="text-[10px] text-slate-500">Enter coefficients</span>
      </div>
      
      {/* Header Row */}
      <div className="grid gap-2 mb-2 px-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {labels.map((l, i) => (
          <div key={i} className="text-center text-xs font-serif italic text-slate-500">{l}</div>
        ))}
      </div>

      {/* Data Grid */}
      <div className="grid gap-2 overflow-y-auto flex-1 content-start pb-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
        {gridCells}
      </div>

      {/* Navigation Controls */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-white/10 shrink-0">
         <button 
           onClick={() => onChangeActiveIndex(Math.max(0, activeIdx - 1))}
           disabled={activeIdx === 0}
           className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 p-2 rounded-lg flex justify-center items-center text-cyan-400 transition active:scale-95"
         >
            <ChevronLeft size={20} />
         </button>
         <button 
           onClick={() => onChangeActiveIndex(Math.min(totalCells - 1, activeIdx + 1))}
           disabled={activeIdx === totalCells - 1}
           className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 p-2 rounded-lg flex justify-center items-center text-cyan-400 transition active:scale-95"
         >
            <ChevronRight size={20} />
         </button>
      </div>
    </div>
  );
};

// --- Equation Results ---

interface EqnResultProps {
  eqnState: EqnState;
}

export const EqnResult: React.FC<EqnResultProps> = ({ eqnState }) => {
  const { results, showDecimal } = eqnState;

  return (
    <div className="w-full h-full p-6 flex flex-col justify-center relative overflow-hidden">
       {/* Indicator */}
      <div className="absolute top-4 right-6 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        {showDecimal ? "DECIMAL" : "EXACT"}
      </div>

      <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 text-center">Solution</h2>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
        {results.map((res, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl text-right flex items-center justify-between group">
             <span className="text-cyan-400 font-bold font-mono text-xl mr-4 opacity-50 group-hover:opacity-100">{res.label} =</span>
             <div className="text-xl md:text-2xl font-light font-mono text-white tracking-tight break-all">
               {showDecimal ? res.decimalStr : res.exactStr}
             </div>
          </div>
        ))}
        {results.length === 0 && (
            <div className="text-center text-slate-500">No Solution</div>
        )}
      </div>
      <div className="mt-4 text-center">
         <div className="text-[10px] text-slate-600">Press <span className="text-cyan-500 font-bold">S⇔D</span> to toggle format</div>
      </div>
    </div>
  );
};