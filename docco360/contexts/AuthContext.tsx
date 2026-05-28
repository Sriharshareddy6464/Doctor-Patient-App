import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, User } from '@/services/auth';
import { tokenStorage } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: 'PATIENT' | 'DOCTOR',
    phone?: string,
    specialization?: string,
  ) => Promise<{ requiresApproval: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => ({ requiresApproval: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch {
      await tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: 'PATIENT' | 'DOCTOR',
      phone?: string,
      specialization?: string,
    ) => {
      const result = await authService.register(name, email, password, role, phone, specialization);
      // Doctors require admin approval — do not log them in automatically.
      if (!result.requiresApproval) {
        setUser(result.user);
      }
      return { requiresApproval: !!result.requiresApproval };
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
