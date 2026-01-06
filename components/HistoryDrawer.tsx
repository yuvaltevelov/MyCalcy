import React from 'react';
import { HistoryItem } from '../types';
import { Trash2, Clock, ChevronRight } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ 
  isOpen, onClose, history, onSelectHistory, onClearHistory 
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            History
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-slate-600 mt-10">
              <p>No history yet.</p>
              <p className="text-xs mt-2">Calculations will appear here.</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => { onSelectHistory(item); onClose(); }}
                className="w-full text-right p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all group"
              >
                <div className="text-sm text-slate-400 mb-1 font-mono break-all opacity-70">{item.expression}</div>
                <div className="text-xl text-emerald-400 font-mono font-bold break-all group-hover:scale-105 origin-right transition-transform">
                  = {item.result}
                </div>
              </button>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <button 
              onClick={onClearHistory}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        )}
      </div>
    </>
  );
};