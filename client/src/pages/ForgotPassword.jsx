import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sparkles, Mail, Lock, KeyRound, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('123456');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res.data.success) {
        setInfoMsg(res.data.message || 'Verification code sent to your email!');
        setCode(res.data.code || '123456');
        setStep(2);
        addToast('Verification code generated successfully.', 'info');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send reset code. Please try again.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code || !newPassword) {
      setErrorMsg('Please enter both code and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({ email, code, newPassword });
      if (res.data.success) {
        setStep(3);
        addToast('Password reset successfully!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password. Please verify your code.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === 3 ? 'Password Reset Complete' : 'Reset Your Password'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {step === 1 && 'Enter your email to receive a password reset verification code.'}
            {step === 2 && 'Enter the 6-digit verification code and your new password.'}
            {step === 3 && 'Your password has been updated successfully.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {infoMsg && step === 2 && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center">
            {infoMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Code <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your password has been reset. You can now sign in using your new credentials.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              Back to Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-emerald-500 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
