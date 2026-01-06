import React, { useState } from 'react';
import { X, Search, Beaker, ArrowRightLeft, Calculator, ChevronLeft, Copy } from 'lucide-react';
import { CONSTANTS, CONVERSIONS } from '../services/mathService';
import { create, all } from 'mathjs';
import { ConversionItem } from '../types';

const math = create(all);

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (val: string) => void;
  initialTab?: 'constants' | 'conversions';
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose, onSelect, initialTab = 'constants' }) => {
  const [activeTab, setActiveTab] = useState<'constants' | 'conversions'>(initialTab);
  const [search, setSearch] = useState('');
  
  // Conversion State
  const [selectedConversion, setSelectedConversion] = useState<ConversionItem | null>(null);
  const [convInput, setConvInput] = useState('1');

  if (!isOpen) return null;

  const filteredConstants = CONSTANTS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.symbol.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  const filteredConversions = CONVERSIONS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.includes(search)
  );

  const getConvertedValue = () => {
    if (!selectedConversion) return '---';
    try {
      if (!convInput) return '';
      const scope = { x: parseFloat(convInput) };
      const res = math.evaluate(selectedConversion.formula, scope);
      return math.format(res, { precision: 10, lowerExp: -9, upperExp: 9 });
    } catch (e) {
      return 'Error';
    }
  };

  const handleBack = () => {
    setSelectedConversion(null);
    setConvInput('1');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col h-[70vh] md:h-auto md:max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            {selectedConversion ? (
               <button onClick={handleBack} className="p-1 -ml-2 rounded-full hover:bg-white/10 text-slate-400">
                 <ChevronLeft className="w-5 h-5" />
               </button>
            ) : (
               <Beaker className="w-5 h-5 text-cyan-400" />
            )}
            <h2 className="text-xl font-bold text-white">
              {selectedConversion ? 'Converter' : 'Reference Guide'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {selectedConversion ? (
          // --- Interactive Conversion View ---
          <div className="flex-1 flex flex-col p-6 space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-lg text-purple-400 font-bold">{selectedConversion.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{selectedConversion.formula.replace('x', 'Input')}</p>
            </div>

            <div className="space-y-4">
               <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                  <label className="text-xs text-slate-500 uppercase font-bold ml-1 mb-1 block">From ({selectedConversion.from})</label>
                  <input 
                    type="number"
                    value={convInput}
                    onChange={(e) => setConvInput(e.target.value)}
                    className="w-full bg-transparent text-2xl font-mono text-white outline-none placeholder:text-slate-600"
                    placeholder="Enter value"
                    autoFocus
                  />
               </div>

               <div className="flex justify-center">
                  <div className="p-2 bg-slate-800 rounded-full text-slate-500 border border-slate-700">
                     <ArrowRightLeft className="w-5 h-5 rotate-90" />
                  </div>
               </div>

               <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500/5 pointer-events-none"></div>
                  <label className="text-xs text-slate-500 uppercase font-bold ml-1 mb-1 block">To ({selectedConversion.to})</label>
                  <div className="text-2xl font-mono text-purple-300 font-bold break-all">
                     {getConvertedValue()}
                  </div>
               </div>
            </div>

            <div className="mt-auto flex gap-3">
              <button 
                onClick={() => {
                   const res = getConvertedValue();
                   if (res && res !== 'Error') {
                     onSelect(res);
                     onClose();
                   }
                }}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/50 transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> Insert Result
              </button>
            </div>
          </div>
        ) : (
          // --- List View ---
          <>
            {/* Tabs */}
            <div className="flex p-2 gap-2 bg-slate-900/50">
              <button 
                onClick={() => { setActiveTab('constants'); setSearch(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'constants' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Constants
              </button>
              <button 
                onClick={() => { setActiveTab('conversions'); setSearch(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'conversions' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Conversions
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search by name, symbol, or code..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {activeTab === 'constants' ? (
                filteredConstants.map((item) => (
                  <button 
                    key={item.code}
                    onClick={() => { onSelect(item.value); onClose(); }}
                    title={`${item.name} (${item.unit})`}
                    className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-3 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-cyan-400 font-bold font-mono text-lg">{item.symbol}</span>
                      <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">Code {item.code}</span>
                    </div>
                    <div className="text-sm text-slate-300 font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex justify-between">
                      <span className="font-mono">{item.value}</span>
                      <span>{item.unit}</span>
                    </div>
                  </button>
                ))
              ) : (
                filteredConversions.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setSelectedConversion(item); }}
                    className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-3 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-purple-400 font-bold flex items-center gap-2">
                        {item.from} <ArrowRightLeft className="w-3 h-3 group-hover:scale-110 transition-transform" /> {item.to}
                      </span>
                      <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">#{item.id}</span>
                    </div>
                    <div className="text-sm text-slate-300">{item.name}</div>
                  </button>
                ))
              )}

              {activeTab === 'constants' && filteredConstants.length === 0 && (
                <div className="text-center text-slate-500 py-8">No constants found</div>
              )}
               {activeTab === 'conversions' && filteredConversions.length === 0 && (
                <div className="text-center text-slate-500 py-8">No conversions found</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};