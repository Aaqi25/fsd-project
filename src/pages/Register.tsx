import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrowserHeader } from '../components/layout/BrowserHeader';

export const Register: React.FC = () => {
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        username: username.trim() || email.split('@')[0],
        email: email.trim(),
        password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
              Create SmartHome Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Register homeowner profile to link IoT telemetry and appliances
            </p>
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Username <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jordan_m"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Account Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-800 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold py-3 px-4 rounded-lg text-sm transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100 mt-5">
            <p className="text-xs text-slate-500">
              Already have an active account?{' '}
              <Link to="/login" className="font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
