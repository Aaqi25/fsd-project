import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrowserHeader } from '../components/layout/BrowserHeader';

export const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex@smarthome.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    try {
      await login({ email: demoEmail, password: 'password123' });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Top Browser Bar & Dark Navigation Bar */}
      <BrowserHeader />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-300/80 shadow-xs p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              SmartHome Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Sign in to access unified home telemetry
            </p>
          </div>

          {/* Quick Demo Auto-Fill Box */}
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-3.5 mb-6 text-center">
            <div className="text-xs sm:text-sm font-bold text-[#1d4ed8] mb-2">
              Quick Demo Auto-Fill (1-Click Login)
            </div>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-xs text-[#2563eb] font-medium">
              <button
                type="button"
                onClick={() => handleQuickDemo('alex@smarthome.io')}
                className="hover:underline hover:text-blue-800 cursor-pointer transition-colors"
              >
                • Alex (Owner)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('sarah.j@smarthome.io')}
                className="hover:underline hover:text-blue-800 cursor-pointer transition-colors"
              >
                • Sarah (Resident)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('guest@smarthome.io')}
                className="hover:underline hover:text-blue-800 cursor-pointer transition-colors"
              >
                • Guest
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@smarthome.io"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-800 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold py-3 px-4 rounded-lg text-sm transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
