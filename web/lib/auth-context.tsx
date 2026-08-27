'use client';

import * as React from 'react';
import { api, User, DeviceSession, AuthResponse } from './api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devices: DeviceSession[];
  loginWithOtp: (email: string, code: string) => Promise<AuthResponse>;
  sendOtp: (email: string) => Promise<{ success: boolean; devCode?: string; message: string }>;
  loginWithGoogle: (token: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  fetchDevices: () => Promise<void>;
  revokeDevice: (deviceId: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [devices, setDevices] = React.useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore user from localStorage and verify with /auth/me on mount
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('minna_user');
        const token = localStorage.getItem('minna_access_token');

        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
          // Refresh user data from API in background
          api.getMe().then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem('minna_user', JSON.stringify(freshUser));
          }).catch(() => {
            // Token might be expired
          });
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const saveAuthSession = (authData: AuthResponse) => {
    setUser(authData.user);
    localStorage.setItem('minna_access_token', authData.accessToken);
    localStorage.setItem('minna_refresh_token', authData.refreshToken);
    localStorage.setItem('minna_user', JSON.stringify(authData.user));
  };

  const sendOtp = async (email: string) => {
    return api.sendOtp(email);
  };

  const loginWithOtp = async (email: string, code: string) => {
    const res = await api.verifyOtp(email, code);
    saveAuthSession(res);
    return res;
  };

  const loginWithGoogle = async (token: string) => {
    const res = await api.googleAuth(token);
    saveAuthSession(res);
    return res;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setDevices([]);
  };

  const fetchDevices = async () => {
    try {
      const activeDevices = await api.getDevices();
      setDevices(activeDevices);
    } catch (e) {
      console.error('Failed to fetch devices:', e);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    await api.revokeDevice(deviceId);
    setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        devices,
        sendOtp,
        loginWithOtp,
        loginWithGoogle,
        logout,
        fetchDevices,
        revokeDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
