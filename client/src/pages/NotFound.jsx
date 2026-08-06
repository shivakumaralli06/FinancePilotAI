import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 shadow-xl">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tight">404</h1>
      <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
        The route you are attempting to reach does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 px-6 py-3 rounded-xl gradient-bg text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
