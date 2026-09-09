import React, { useState } from 'react';
import { GraduationCap, LogOut, Menu, X, User as UserIcon, BookOpen, Send } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  activeTab = 'improve',
  onTabChange,
}) => {
  const { student, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setMobileMenuOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#CFE3F1] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#243A5E] text-[#CFE3F1] flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#243A5E] tracking-tight">
                  VarsityPath
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider bg-[#CFE3F1] text-[#243A5E] px-2 py-0.5 rounded-md">
                  Western Cape
                </span>
              </div>
              <p className="text-[11px] text-[#5F86A6] hidden sm:block">
                Grade 11–12 Pathway Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && onTabChange && (
            <div className="hidden md:flex items-center gap-1 bg-[#EDF4FA] p-1 rounded-xl border border-[#CFE3F1]">
              <button
                type="button"
                onClick={() => onTabChange('improve')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'improve'
                    ? 'bg-white text-[#243A5E] shadow-2xs'
                    : 'text-[#5F86A6] hover:text-[#243A5E]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#5F86A6]" />
                <span>Improve</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('apply')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'apply'
                    ? 'bg-white text-[#243A5E] shadow-2xs'
                    : 'text-[#5F86A6] hover:text-[#243A5E]'
                }`}
              >
                <Send className="w-4 h-4 text-[#5F86A6]" />
                <span>Apply</span>
              </button>
            </div>
          )}

          {/* Desktop Right / Auth actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && student ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-sm font-bold text-[#243A5E]">
                      {student.displayName}
                    </span>
                    <span className="text-[10px] bg-[#CFE3F1] text-[#243A5E] font-extrabold px-1.5 py-0.5 rounded">
                      Gr {student.grade}
                    </span>
                  </div>
                  <p className="text-xs text-[#5F86A6] truncate max-w-[180px]">
                    {student.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={isLoggingOut}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenAuth('signin')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenAuth('register')}
                >
                  Create Account
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#243A5E] hover:bg-[#EDF4FA] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#CFE3F1] bg-white px-4 pt-3 pb-5 space-y-3">
          {isAuthenticated && student ? (
            <div className="space-y-3">
              <div className="p-3 bg-[#EDF4FA] rounded-xl border border-[#CFE3F1]">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#5F86A6]" />
                  <span className="text-sm font-bold text-[#243A5E]">
                    {student.displayName}
                  </span>
                  <span className="text-[10px] bg-[#CFE3F1] text-[#243A5E] font-extrabold px-1.5 py-0.5 rounded">
                    Grade {student.grade}
                  </span>
                </div>
                <p className="text-xs text-[#5F86A6] mt-0.5 pl-6">{student.email}</p>
                {student.school && (
                  <p className="text-xs text-[#243A5E]/80 mt-1 pl-6">
                    {student.school}
                  </p>
                )}
              </div>

              {onTabChange && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('improve');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${
                      activeTab === 'improve'
                        ? 'bg-[#243A5E] text-white'
                        : 'bg-[#EDF4FA] text-[#243A5E]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Improve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('apply');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${
                      activeTab === 'apply'
                        ? 'bg-[#243A5E] text-white'
                        : 'bg-[#EDF4FA] text-[#243A5E]'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply</span>
                  </button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  onOpenAuth('signin');
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
              >
                Create Student Account
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
