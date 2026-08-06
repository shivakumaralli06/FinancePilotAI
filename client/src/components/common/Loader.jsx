import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const Loader = ({ fullScreen = false, text = 'Loading FinancePilot AI...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center animate-pulse-glow shadow-xl shadow-emerald-500/20">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 animate-pulse">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 text-slate-500 dark:text-slate-400 gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export default Loader;
