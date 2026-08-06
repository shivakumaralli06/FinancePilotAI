import React from 'react';
import { Sparkles, Shield, Lock, Cpu } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-500 dark:text-slate-400 text-xs py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">FinancePilot AI</span>
          <span>© {new Date().getFullYear()} Enterprise SaaS Application. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> Supabase RLS Protected
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-teal-500" /> Google Gemini AI SDK
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-cyan-500" /> JWT 256-Bit Auth
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
