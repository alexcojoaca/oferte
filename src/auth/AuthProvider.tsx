import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, type User } from '../lib/api';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'guest'; user: null }
  | { status: 'authed'; user: User };

type AuthContextValue = {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setState({ status: 'authed', user });
    } catch {
      setState({ status: 'guest', user: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const { user } = await api.login(username, password);
    setState({ status: 'authed', user });
  }, []);

  const signup = useCallback(async (username: string, password: string) => {
    const { user } = await api.signup(username, password);
    setState({ status: 'authed', user });
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setState({ status: 'guest', user: null });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ state, login, signup, logout, refresh }), [
    state,
    login,
    signup,
    logout,
    refresh
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

