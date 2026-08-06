import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Bot, 
  PieChart, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  DollarSign, 
  Lock 
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="w-4 h-4" /> Next-Gen AI Financial Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Master Your Money with <span className="gradient-text">FinancePilot AI</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
          An enterprise-ready personal finance co-pilot powered by Google Gemini AI and Supabase PostgreSQL. Track income, manage expenses, set budgets, and receive data-driven tailored advice.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl gradient-bg text-white font-bold text-base shadow-xl shadow-emerald-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card font-bold text-base text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Sign In to Demo
          </Link>
        </div>

        {/* Hero Preview Card */}
        <div className="mt-16 max-w-5xl mx-auto glass-card p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Financial Health Score</div>
              <div className="text-3xl font-extrabold text-emerald-500 mt-2 flex items-baseline gap-1">
                88<span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Optimal Cash Flow & Budget Control</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Net Savings</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">$2,450.00</div>
              <p className="text-xs text-emerald-500 mt-1 font-medium">+18.5% compared to last month</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gemini AI Alert</div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                "Cut 12% on Dining Out to reach your quarterly emergency goal 14 days earlier."
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Built for Hackathons & Enterprise Scale</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Complete full-stack architecture with production security standards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-6 glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Google Gemini AI Engine</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Leverages the official <code className="text-emerald-500 font-mono">@google/genai</code> SDK for deep real-time financial telemetry analysis, advice generation, and custom co-pilot chat.
            </p>
          </div>

          <div className="glass-card p-6 glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-4 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Supabase PostgreSQL & RLS</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enterprise PostgreSQL backend with strict Row Level Security (RLS) policies to guarantee absolute data isolation between users.
            </p>
          </div>

          <div className="glass-card p-6 glass-card-hover">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4 font-bold">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Recharts Visual Analytics</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Interactive financial analytics featuring category breakdowns, monthly income vs expense comparisons, and spending trend curves.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Landing;
