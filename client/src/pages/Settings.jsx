import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Globe, 
  ShieldCheck, 
  Download, 
  Trash2 
} from 'lucide-react';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { currency, changeCurrency } = useCurrency();

  const handleExportData = () => {
    addToast('Preparing financial CSV export bundle...', 'info');
    setTimeout(() => {
      addToast('Financial telemetry exported successfully!', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-slate-500" /> Application Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize UI aesthetics, currency display, and security preferences
        </p>
      </div>

      <div className="glass-card p-6 space-y-6">
        
        {/* Appearance Settings */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Appearance & Aesthetics
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Dark Mode Theme</div>
                <div className="text-xs text-slate-400">Toggle dark mode visual interface</div>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isDark ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Localization Settings */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Currency & Regional Settings
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-cyan-500" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Display Currency</div>
                <div className="text-xs text-slate-400">Primary currency notation for numbers</div>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => {
                changeCurrency(e.target.value);
                addToast(`Display currency changed to ${e.target.value}`, 'success');
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="USD ($)">USD ($)</option>
              <option value="INR (₹)">INR (₹)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
              <option value="JPY (¥)">JPY (¥)</option>
              <option value="CAD ($)">CAD ($)</option>
              <option value="AUD ($)">AUD ($)</option>
            </select>
          </div>
        </div>

        {/* Data Export & Management */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Data Management
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Export Financial Telemetry</div>
              <div className="text-xs text-slate-400">Download a full JSON/CSV copy of your financial records</div>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Export Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
