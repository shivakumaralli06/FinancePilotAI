import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { incomeService, expenseService, budgetService, aiService } from '../services/api';
import { formatDate } from '../utils/formatters';
import Loader from '../components/common/Loader';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Bot 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { formatCurrency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [latestReport, setLatestReport] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [incRes, expRes, budRes, repRes] = await Promise.all([
        incomeService.getIncome(),
        expenseService.getExpenses(),
        budgetService.getBudget(),
        aiService.getReports()
      ]);

      if (incRes.data.success) setIncomes(incRes.data.data);
      if (expRes.data.success) setExpenses(expRes.data.data);
      if (budRes.data.success) setBudget(budRes.data.data);
      if (repRes.data.success && repRes.data.data.length > 0) {
        setLatestReport(repRes.data.data[0].report);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      addToast('Failed to load financial dashboard telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Metrics Calculations
  const totalIncome = incomes.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const netSavings = totalIncome - totalExpense;
  const monthlyBudget = budget?.monthly_budget ? parseFloat(budget.monthly_budget) : 0;
  const budgetUsage = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;

  // Combine & Sort Recent Activity
  const combinedActivity = [
    ...incomes.map(i => ({ ...i, type: 'income' })),
    ...expenses.map(e => ({ ...e, type: 'expense' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  if (loading) {
    return <Loader text="Loading your financial dashboard..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 gradient-bg text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> AI Executive Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Pilot'}!
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Your financial portfolio is actively monitored by FinancePilot AI co-pilot.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-advisor"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-emerald-600" /> Run AI Report
            </Link>
            <Link
              to="/expenses"
              className="px-4 py-2.5 rounded-xl bg-emerald-700/60 text-white font-semibold text-xs border border-white/20 hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Income */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Income</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{incomes.length} Income streams logged</p>
        </div>

        {/* Total Expenses */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expenses</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{expenses.length} Expense entries logged</p>
        </div>

        {/* Net Savings */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Savings</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-bold mt-3 ${netSavings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatCurrency(netSavings)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalIncome > 0 ? `${((netSavings / totalIncome) * 100).toFixed(1)}% savings rate` : 'No income recorded'}
          </p>
        </div>

        {/* Monthly Budget */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Budget</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatCurrency(monthlyBudget)}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetUsage > 100 ? 'bg-rose-500' : budgetUsage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetUsage)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {monthlyBudget > 0 ? `${budgetUsage.toFixed(1)}% used` : 'No budget set'}
          </p>
        </div>

      </div>

      {/* Grid Section: AI Insight Preview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Insight Highlight Card */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-between border-emerald-500/30">
          <div>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mb-4">
              <Sparkles className="w-5 h-5" /> AI Advisory Highlights
            </div>

            {latestReport ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Health Score Rating
                  </div>
                  <div className="text-3xl font-black text-emerald-500 mt-1">
                    {latestReport.financialHealthScore}<span className="text-sm font-normal text-slate-400">/100</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{latestReport.summary}"
                </p>

                {latestReport.savingTips && latestReport.savingTips.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Priority Tip</span>
                    <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{latestReport.savingTips[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No AI analysis generated yet.</p>
                <p className="text-xs text-slate-400 mt-1">Generate your first report to unlock personalized tips.</p>
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/ai-advisor"
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              Open AI Advisor Hub <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Recent Financial Telemetry
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <Link to="/income" className="text-emerald-500 font-semibold hover:underline">View Incomes</Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link to="/expenses" className="text-emerald-500 font-semibold hover:underline">View Expenses</Link>
            </div>
          </div>

          {combinedActivity.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {combinedActivity.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      item.type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {item.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title || item.source}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.category || 'Income'} • {formatDate(item.date)}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${item.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No transactions recorded yet. Click Add Income or Add Expense to start tracking.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
