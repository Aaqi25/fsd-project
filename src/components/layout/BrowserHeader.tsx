import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHome } from '../../context/HomeContext';
import { LogOut, User as UserIcon, Check, SlidersHorizontal } from 'lucide-react';
import { mockUsers } from '../../data/users';

export const BrowserHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, login, logout, isAuthenticated } = useAuth();
  const { simulatorOpen, setSimulatorOpen } = useHome();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentPath = location.pathname;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/devices', label: 'Devices' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/energy', label: 'Energy' },
    { to: '/alerts', label: 'Alerts' },
    { to: '/schedules', label: 'Schedules' },
  ];

  const handleSwitchUser = async (user: typeof mockUsers[0]) => {
    await login({ email: user.email });
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const displayName = currentUser?.name || 'Alex';
  const displayRole = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : 'Owner';

  return (
    <header className="sticky top-0 z-50 select-none shadow-md">
      {/* Top Dark Navigation Bar */}
      <div className="bg-[#0b1329] px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-800">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-6 sm:gap-10">
          <Link
            to="/dashboard"
            className="text-lg sm:text-xl font-bold tracking-tight text-[#00a8ff] hover:text-sky-300 transition-colors"
          >
            SmartHome OS
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 sm:gap-8">
            {navLinks.map((item) => {
              const isActive =
                currentPath === item.to ||
                (item.to === '/dashboard' && currentPath === '/');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: User Status & Simulator Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              simulatorOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 border-slate-700 hover:bg-slate-800/60'
            }`}
            title="Toggle IoT Simulator Drawer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulator</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-200 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-slate-800/60 transition-colors"
            >
              <span className="text-slate-300 font-medium">
                {displayName} ({displayRole})
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Online</span>
              </span>
            </button>

            {/* User & Role Switch Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Switch Demo Profile
                </div>
                {mockUsers.map((u) => {
                  const isSelected = currentUser?.email === u.email;
                  return (
                    <button
                      key={u._id}
                      onClick={() => handleSwitchUser(u)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">
                          {u.name} ({u.role})
                        </div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setSimulatorOpen(!simulatorOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                    Toggle IoT Simulator
                  </button>

                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      Go to Login
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden bg-[#0a1024] px-4 py-2 border-b border-slate-800 flex items-center gap-4 overflow-x-auto">
        {navLinks.map((item) => {
          const isActive =
            currentPath === item.to ||
            (item.to === '/dashboard' && currentPath === '/');
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`text-xs whitespace-nowrap py-1 ${
                isActive
                  ? 'text-white font-bold border-b-2 border-sky-400'
                  : 'text-slate-400'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
