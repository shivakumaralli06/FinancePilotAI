import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart, 
  Sparkles, 
  MessageSquare, 
  User, 
  Settings,
  X
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/income', label: 'Income Manager', icon: TrendingUp },
  { path: '/expenses', label: 'Expense Tracker', icon: TrendingDown },
  { path: '/budget', label: 'Budget Planner', icon: Target },
  { path: '/analytics', label: 'Financial Analytics', icon: PieChart },
  { path: '/ai-advisor', label: 'AI Advisor Hub', icon: Sparkles, badge: 'AI' },
  { path: '/ai-chat', label: 'AI Co-Pilot Chat', icon: MessageSquare, badge: 'Live' },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 p-4">
      {/* Mobile Close */}
      <div className="lg:hidden flex items-center justify-between pb-4 mb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="font-bold text-slate-900 dark:text-white">Navigation</span>
        <button onClick={onCloseMobile} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'gradient-bg text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.badge === 'AI' ? 'bg-amber-400/20 text-amber-500' : 'bg-emerald-400/20 text-emerald-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Pro Card */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 text-center">
          <div className="flex justify-center mb-2">
            <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
          </div>
          <h4 className="font-semibold text-xs text-slate-900 dark:text-white">FinancePilot Pro</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Powered by Google Gemini 2.5</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 w-64 max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
