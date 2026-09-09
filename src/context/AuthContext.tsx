import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { StudentProfile } from '../types';
import { AuthService, RegisterParams } from '../services/authService';

interface AuthContextType {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshStudent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        await AuthService.initializeSession((foundProfile) => {
          if (isMounted) {
            setStudent(foundProfile);
            setLoading(false);
          }
        });
      } catch (err: any) {
        if (isMounted) {
          setLoading(false);
          setAuthError(err?.message || 'Failed to restore student session.');
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const profile = await AuthService.login(email, password);
      setStudent(profile);
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed. Please verify your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    setLoading(true);
    setAuthError(null);
    try {
      const profile = await AuthService.register(params);
      setStudent(profile);
    } catch (err: any) {
      setAuthError(err?.message || 'Account creation failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setStudent(null);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err?.message || 'Sign-out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const refreshStudent = useCallback(async () => {
    if (!student) return;
    try {
      // Re-read current active session
      await AuthService.initializeSession((updated) => {
        if (updated) setStudent(updated);
      });
    } catch {
      // silent
    }
  }, [student]);

  const value: AuthContextType = {
    student,
    isAuthenticated: Boolean(student && student.uid),
    loading,
    authError,
    login,
    register,
    logout,
    clearError,
    refreshStudent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
