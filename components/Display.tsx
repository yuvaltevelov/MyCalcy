import React, { useEffect, useRef } from 'react';

interface DisplayProps {
  expression: string;
  result: string;
  isDegree: boolean;
}

export const Display: React.FC<DisplayProps> = ({ expression, result, isDegree }) => {
  const displayRef = useRef<HTMLDivElement>(null);

  // Auto scroll to end of expression
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  // Dynamic font size based on result length
  const getResultClass = (len: number) => {
    // Extensive length handling
    if (len > 35) return 'text-base md:text-lg break-all leading-tight';
    if (len > 25) return 'text-lg md:text-xl break-all leading-tight';
    if (len > 18) return 'text-xl md:text-2xl break-all leading-tight';
    if (len > 13) return 'text-2xl md:text-3xl break-all';
    return 'text-4xl md:text-5xl';
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-5 md:p-6 pb-3 md:pb-6 relative z-10">
      {/* Indicators */}
      <div className="flex gap-3 text-[10px] md:text-xs font-bold tracking-widest text-slate-500 select-none z-20">
        <span className={`transition-colors duration-300 ${isDegree ? "text-cyan-400 shadow-cyan-500/50 drop-shadow-sm" : ""}`}>DEG</span>
        <span className={`transition-colors duration-300 ${!isDegree ? "text-purple-400 shadow-purple-500/50 drop-shadow-sm" : ""}`}>RAD</span>
        <span>FIX</span>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex flex-col justify-end gap-1 min-h-0 overflow-hidden relative">
        
        {/* Expression Input - Horizontal Scroll */}
        <div 
          ref={displayRef}
          className="text-slate-400 text-lg md:text-xl font-mono tracking-wider whitespace-nowrap overflow-x-auto no-scrollbar text-right opacity-80 px-1 py-1"
        >
          {expression || "0"}
        </div>

        {/* Result Display - Auto Wrap & Scale */}
        <div className="text-right flex items-end justify-end w-full">
          <span className={`${getResultClass(result.length)} font-light text-white font-mono tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-200 w-full`}>
            {result}
          </span>
        </div>
      </div>
    </div>
  );
};