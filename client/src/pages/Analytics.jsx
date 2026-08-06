import React, { useState, useEffect } from 'react';
import { incomeService, expenseService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { CATEGORY_COLORS } from '../utils/constants';
import Loader from '../components/common/Loader';
import { 
  PieChart as PieChartIcon, 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';

const Analytics = () => {
  const { addToast } = useToast();
  const { formatCurrency } = useCurrency();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [incRes, expRes] = await Promise.all([
        incomeService.getIncome(),
        expenseService.getExpenses()
      ]);

      if (incRes.data.success) setIncomes(incRes.data.data);
      if (expRes.data.success) setExpenses(expRes.data.data);
    } catch (err) {
      addToast('Failed to load analytics telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Process Category Breakdown Pie Data
  const categoryMap = {};
  expenses.forEach(exp => {
    const cat = exp.category || 'Others';
    categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(exp.amount || 0);
  });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#64748b'
  }));

  // Process Income vs Expense Comparison Bar Data
  const totalInc = incomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalExp = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const barData = [
    { name: 'Financial Telemetry', Income: totalInc, Expenses: totalExp }
  ];

  // Process Monthly Spending Trend Area Data
  const monthMap = {};
  expenses.forEach(exp => {
    const month = exp.date ? exp.date.slice(0, 7) : 'Unknown';
    monthMap[month] = (monthMap[month] || 0) + parseFloat(exp.amount || 0);
  });
  const trendData = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, Expense: amount }));

  if (loading) {
    return <Loader text="Loading Recharts visual analytics..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChartIcon className="w-6 h-6 text-teal-500" /> Financial Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visual data telemetry and category distribution metrics
        </p>
      </div>

      {/* Grid Layout of Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Expense Category Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" /> Category Breakdown
          </h3>
          {pieData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-sm">
              No expense entries logged for category analysis.
            </div>
          )}
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-500" /> Income vs Expenses Overview
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Monthly Expense Trend Area Chart */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-rose-500" /> Monthly Spending Velocity Trend
        </h3>
        {trendData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="Expense" stroke="#f43f5e" fill="#f43f5e20" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-sm">
            Insufficient temporal expense data to plot trends.
          </div>
        )}
      </div>

    </div>
  );
};

export default Analytics;
