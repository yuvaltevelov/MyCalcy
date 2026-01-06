import React, { useState } from 'react';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ReferenceModal } from './components/ReferenceModal';
import { ModeMenu, EqnSelect, EqnInput, EqnResult } from './components/ModeScreens';
import { History } from 'lucide-react';
import { ButtonType, HistoryItem, AppMode, EquationType, EqnState, EqnSolution } from './types';
import { evaluateExpression, solveLinear2, solveLinear3, solveQuadratic, solveCubic } from './services/mathService';

export default function App() {
  // Global App Mode
  const [mode, setMode] = useState<AppMode>(AppMode.COMP);

  // COMP Mode State
  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  
  // EQN Mode State
  const [eqnState, setEqnState] = useState<EqnState>({
    type: null,
    coeffs: [],
    activeIdx: 0,
    results: [],
    showDecimal: false
  });

  // Global Config
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);
  const [isDegree, setIsDegree] = useState(true);
  
  // Modals
  const [showHistory, setShowHistory] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [referenceTab, setReferenceTab] = useState<'constants' | 'conversions'>('constants');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // --- Handlers ---

  const handleCompModeInput = (val: string, type: ButtonType) => {
    if (type === ButtonType.Equal) {
       if (!display) return;
       const res = evaluateExpression(display, isDegree);
       setResult(res);
       if (res !== 'Error') {
         const newItem: HistoryItem = {
           id: Date.now().toString(),
           expression: display,
           result: res,
           timestamp: Date.now(),
           mode: AppMode.COMP
         };
         setHistory(prev => [newItem, ...prev].slice(0, 50));
       }
       setIsShift(false);
       return;
    }
    
    // Standard input
    setDisplay(prev => prev + val);
  };

  const handleEqnModeInput = (val: string, type: ButtonType) => {
    // If we are in EQN_SELECT, we expect numbers 1-4
    if (mode === AppMode.EQN_SELECT) {
      if (['1','2','3','4'].includes(val)) {
        const typeMap = { '1': EquationType.Linear2, '2': EquationType.Linear3, '3': EquationType.Quad, '4': EquationType.Cubic };
        handleSelectEqnType(typeMap[val as keyof typeof typeMap]);
      }
      return;
    }

    // If we are in EQN_RESULT
    if (mode === AppMode.EQN_RESULT) {
       // S<=>D Toggle
       if (val === 'SD' || val === 'S⇔D') {
          setEqnState(prev => ({ ...prev, showDecimal: !prev.showDecimal }));
          return;
       }

       if (val === 'AC' || val === 'ON') {
         setMode(AppMode.EQN_INPUT);
         return;
       }
       // If user presses '=' again, usually it rotates through X1, X2... 
       // For our single screen result view, we just go back to input on '=' or numbers.
       setMode(AppMode.EQN_INPUT);
       setEqnState(prev => ({ ...prev, activeIdx: 0 }));
       return;
    }

    // We are in EQN_INPUT
    const { coeffs, activeIdx, type: eqnType } = eqnState;
    
    // Navigation / Commit
    if (type === ButtonType.Equal) {
      // Determine max cells
      let maxCells = 3;
      if (eqnType === EquationType.Linear2) maxCells = 6;
      if (eqnType === EquationType.Linear3) maxCells = 12;
      if (eqnType === EquationType.Cubic) maxCells = 4;

      if (activeIdx < maxCells - 1) {
        // Move next
        setEqnState(prev => ({ ...prev, activeIdx: prev.activeIdx + 1 }));
      } else {
        // SOLVE
        solveEqn();
      }
      return;
    }

    // Editing current cell
    if (type === ButtonType.Number || val === '.' || val === '-') {
      const currentVal = coeffs[activeIdx] || "";
      const newVal = currentVal + val;
      const newCoeffs = [...coeffs];
      newCoeffs[activeIdx] = newVal;
      setEqnState(prev => ({ ...prev, coeffs: newCoeffs }));
    }

    if (val === 'DEL') {
       const currentVal = coeffs[activeIdx] || "";
       const newCoeffs = [...coeffs];
       newCoeffs[activeIdx] = currentVal.slice(0, -1);
       setEqnState(prev => ({ ...prev, coeffs: newCoeffs }));
    }
    
    if (val === 'AC') {
        const newCoeffs = [...coeffs];
        newCoeffs[activeIdx] = "";
        setEqnState(prev => ({ ...prev, coeffs: newCoeffs }));
    }
  };

  const solveEqn = () => {
    const { type, coeffs } = eqnState;
    // Convert strings to numbers (default 0)
    const numericCoeffs = coeffs.map(c => parseFloat(c) || 0);
    
    let res: EqnSolution[] = [];
    if (type === EquationType.Linear2) res = solveLinear2(numericCoeffs);
    if (type === EquationType.Linear3) res = solveLinear3(numericCoeffs);
    if (type === EquationType.Quad) res = solveQuadratic(numericCoeffs);
    if (type === EquationType.Cubic) res = solveCubic(numericCoeffs);

    const newState = { ...eqnState, results: res, showDecimal: false };
    setEqnState(newState);
    setMode(AppMode.EQN_RESULT);

    // Save to History
    let typeLabel = "Eqn";
    if (type === EquationType.Linear2) typeLabel = "Lin(2)";
    if (type === EquationType.Linear3) typeLabel = "Lin(3)";
    if (type === EquationType.Quad) typeLabel = "Quad";
    if (type === EquationType.Cubic) typeLabel = "Cubic";

    // Format coeffs for display
    const coeffsStr = coeffs.map(c => c || "0").join(", ");
    
    // Format results for display string (summary)
    const resStr = res.map(r => `${r.label}=${r.exactStr}`).join("; ");

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression: `${typeLabel}: ${coeffsStr}`,
      result: resStr,
      timestamp: Date.now(),
      mode: AppMode.EQN_RESULT,
      eqnState: newState
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const handleSelectHistory = (item: HistoryItem) => {
     if (item.mode === AppMode.EQN_RESULT && item.eqnState) {
       // Restore EQN mode
       setMode(AppMode.EQN_RESULT);
       setEqnState(item.eqnState);
     } else {
       // Restore COMP mode
       setMode(AppMode.COMP);
       setDisplay(item.expression);
       setResult(item.result);
     }
  };

  const handleSelectMode = (mId: number) => {
    if (mId === 1) { // COMP
      setMode(AppMode.COMP);
    } else if (mId === 2) { // CMPLX
      alert("CMPLX Mode Active. You can use 'i' (Shift + ENG).");
      setMode(AppMode.COMP);
    } else if (mId === 5) { // EQN
      setMode(AppMode.EQN_SELECT);
    } else {
      // Others not implemented fully
      alert(`Mode ${mId} coming soon!`);
      setMode(AppMode.COMP);
    }
  };

  const handleSelectEqnType = (t: EquationType) => {
    // Reset inputs for new equation
    let size = 3;
    if (t === EquationType.Linear2) size = 6;
    if (t === EquationType.Linear3) size = 12;
    if (t === EquationType.Cubic) size = 4;

    setEqnState({
      type: t,
      coeffs: Array(size).fill(""),
      activeIdx: 0,
      results: [],
      showDecimal: false
    });
    setMode(AppMode.EQN_INPUT);
  };
  
  const handleEqnActiveIndexChange = (idx: number) => {
    setEqnState(prev => ({ ...prev, activeIdx: idx }));
  };

  // Main Event Switch
  const handleBtnClick = (val: string, type: ButtonType) => {
    if (navigator.vibrate) navigator.vibrate(5);

    // Global Reset
    if (val === 'ON' && type === ButtonType.Action) {
        // Reset everything
        setMode(AppMode.COMP);
        setDisplay('');
        setResult('');
        return;
    }

    // Mode Menu Trigger
    if (val === 'MODE') {
      setMode(AppMode.MODE_SELECT);
      return;
    }
    
    // Global Reference triggers (Shift+7, Shift+8)
    if (isShift && val === 'CONST') {
      setReferenceTab('constants');
      setShowReference(true);
      setIsShift(false);
      return;
    }
    if (isShift && val === 'CONV') {
      setReferenceTab('conversions');
      setShowReference(true);
      setIsShift(false);
      return;
    }

    // Toggle Shift/Alpha logic (Global)
    if (type === ButtonType.Shift) {
      setIsShift(!isShift); setIsAlpha(false); return;
    }
    if (val === 'ALPHA') {
      setIsAlpha(!isAlpha); setIsShift(false); return;
    }

    // MODE_SELECT Input Handling (Numbers 1-8)
    if (mode === AppMode.MODE_SELECT) {
       const numeric = parseInt(val);
       if (!isNaN(numeric) && numeric >= 1 && numeric <= 8) {
         handleSelectMode(numeric);
       }
       return; // Ignore other keys in menu
    }

    // Route to Specific Mode Handlers
    if (mode === AppMode.COMP) {
       handleCompModeInput(val, type);
    } else if (mode.startsWith('EQN')) {
       handleEqnModeInput(val, type);
    }
    
    // Auto-turn off modifier
    if (type !== ButtonType.Number && type !== ButtonType.Operation && val !== 'DEL') {
        setIsShift(false);
        setIsAlpha(false);
    }
  };

  // Render Content based on Mode
  const renderScreenContent = () => {
    switch (mode) {
      case AppMode.MODE_SELECT:
        return <ModeMenu onSelectMode={handleSelectMode} />;
      case AppMode.EQN_SELECT:
        return <EqnSelect onSelectType={handleSelectEqnType} />;
      case AppMode.EQN_INPUT:
        return <EqnInput eqnState={eqnState} onChangeActiveIndex={handleEqnActiveIndexChange} />;
      case AppMode.EQN_RESULT:
        return <EqnResult eqnState={eqnState} />;
      case AppMode.COMP:
      default:
        // Reuse the original Display component but simpler
        return <Display expression={display} result={result} isDegree={isDegree} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-0 md:p-6 overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Main Device Container */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-none md:rounded-[40px] shadow-2xl flex flex-col h-[100dvh] md:h-auto md:min-h-[800px] relative overflow-hidden transition-all duration-500">
        
        {/* Top Bar / Status */}
        <div className="flex justify-between items-center p-4 md:p-6 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          </div>
          <div className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
             {mode === AppMode.COMP ? 'Yuval Calculator' : `MODE: ${mode}`}
          </div>
          <button onClick={() => setShowHistory(true)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition">
            <History className="w-5 h-5" />
          </button>
        </div>

        {/* Screen Area (Dynamic) - Adjusted height for mobile */}
        <div className="px-4 md:px-6 pt-2 pb-4 shrink-0 h-48 md:h-64 transition-all duration-300">
           <div className="relative w-full h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
             {/* Decorative Glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
             
             {/* Content Layer */}
             <div className="relative z-10 w-full h-full">
               {renderScreenContent()}
             </div>
           </div>
        </div>

        {/* Keypad Area - Enable scroll here */}
        <div className="flex-1 bg-slate-900/60 rounded-t-[30px] md:rounded-t-[40px] border-t border-white/5 p-4 md:p-6 backdrop-blur-md overflow-y-auto no-scrollbar flex flex-col">
          <Keypad 
            onBtnClick={handleBtnClick} 
            isShift={isShift} 
            isAlpha={isAlpha}
          />
          
          <div className="text-center text-slate-500 text-[10px] mt-4 font-mono pb-8 shrink-0 flex flex-col items-center gap-1">
            <span className="font-semibold tracking-wide">Created by Yuval Tabalov</span>
            <span className="opacity-50 text-[9px]">Scientific Web App</span>
          </div>
        </div>

      </div>

      {/* Modals */}
      <HistoryDrawer 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onSelectHistory={handleSelectHistory}
        onClearHistory={() => setHistory([])}
      />

      <ReferenceModal 
        isOpen={showReference}
        onClose={() => setShowReference(false)}
        onSelect={(val) => {
           if (mode === AppMode.COMP) setDisplay(prev => prev + val);
        }}
        initialTab={referenceTab}
      />
    </div>
  );
}