import React, { useState, useEffect } from 'react';
import { budgetService, expenseService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrentMonth } from '../utils/formatters';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { 
  Target, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Sparkles, 
  Calendar 
} from 'lucide-react';

const Budget = () => {
  const { addToast } = useToast();
  const { formatCurrency } = useCurrency();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBudgetData();
  }, [selectedMonth]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const [budRes, expRes] = await Promise.all([
        budgetService.getBudget(selectedMonth),
        expenseService.getExpenses()
      ]);

      if (budRes.data.success) {
        setBudget(budRes.data.data);
        setBudgetAmount(budRes.data.data?.monthly_budget || '');
      }
      if (expRes.data.success) {
        setExpenses(expRes.data.data);
      }
    } catch (err) {
      addToast('Failed to load budget telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!budgetAmount || parseFloat(budgetAmount) < 0) {
      addToast('Please enter a valid non-negative monthly budget target.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await budgetService.setBudget({
        monthly_budget: parseFloat(budgetAmount),
        month: selectedMonth
      });

      if (res.data.success) {
        addToast('Monthly budget updated successfully!', 'success');
        setBudget(res.data.data);
        setIsModalOpen(false);
      }
    } catch (err) {
      addToast('Failed to save budget target.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter expenses for selected month
  const monthExpenses = expenses.filter(exp => exp.date && exp.date.startsWith(selectedMonth));
  const totalSpent = monthExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const targetBudget = budget?.monthly_budget ? parseFloat(budget.monthly_budget) : 0;
  const remaining = targetBudget - totalSpent;
  const usagePercentage = targetBudget > 0 ? (totalSpent / targetBudget) * 100 : 0;

  if (loading) {
    return <Loader text="Loading budget planner data..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-500" /> Budget Planner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set and track monthly spending targets to prevent overspending
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card text-xs font-semibold">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent outline-none text-slate-900 dark:text-white"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl gradient-bg text-white font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" /> {targetBudget > 0 ? 'Modify Budget' : 'Set Budget'}
          </button>
        </div>
      </div>

      {/* Main Budget Progress Meter Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6 border-amber-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Budget ({selectedMonth})</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formatCurrency(targetBudget)}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Spent So Far</span>
            <div className={`text-3xl font-extrabold mt-1 ${usagePercentage > 100 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
              {formatCurrency(totalSpent)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-600 dark:text-slate-400">Budget Consumption</span>
            <span className={usagePercentage > 100 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
              {usagePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercentage > 100 
                  ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                  : usagePercentage > 80 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                  : 'gradient-bg'
              }`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            />
          </div>
        </div>

        {/* Status Callout Banner */}
        {targetBudget > 0 ? (
          usagePercentage > 100 ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Overbudget Alert:</span> You have exceeded your monthly cap by{' '}
                <span className="font-extrabold">{formatCurrency(Math.abs(remaining))}</span>. Review your highest expenses in the Expense Tracker tab.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">On Track:</span> You have{' '}
                <span className="font-extrabold">{formatCurrency(remaining)}</span> remaining in your monthly allocation.
              </div>
            </div>
          )
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm flex items-start gap-3">
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              No budget target configured for {selectedMonth}. Click "Set Budget" above to start tracking.
            </div>
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Configure Monthly Budget (${selectedMonth})`}
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Monthly Budget Target ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="3500.00"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-bold shadow-md hover:opacity-95"
            >
              {submitting ? 'Saving Target...' : 'Save Target'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Budget;
