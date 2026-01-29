'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authStorage } from '@/lib/auth';
import { authApi } from '@/lib/api';
import type { User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing auth...');

      // Check for existing auth on mount
      const storedToken = authStorage.getToken();
      const storedUser = authStorage.getUser();

      console.log('📦 Stored token exists:', !!storedToken, 'Length:', storedToken?.length || 0);
      console.log('👤 Stored user exists:', !!storedUser);

      if (storedToken && storedUser) {
        console.log('✅ Setting initial auth state from localStorage');
        // Set initial state immediately to avoid flash
        setToken(storedToken);
        setUser(storedUser);

        try {
          console.log('🔍 Verifying token with backend...');
          // Verify token is still valid in background
          const meResponse = await authApi.getMe();
          console.log('✅ Token verified successfully:', meResponse);

          // Update user data with fresh data from server
          const freshUserData: User = {
            userId: meResponse.userId,
            email: meResponse.email,
            role: meResponse.role,
          };

          // Update storage with fresh data
          authStorage.setUser(freshUserData);
          setUser(freshUserData);

          console.log('✅ Auth state restored from storage');
          // If successful, token is valid, keep the user logged in
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          // Token is invalid, clear auth
          console.log('🧹 Clearing invalid auth data');
          authStorage.removeToken();
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('❌ No stored auth data found');
      }

      console.log('🏁 Setting loading to false');
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authApi.login(email, password);
      const { access_token } = response;

      if (!access_token) {
        throw new Error('No access token received');
      }

      console.log('🎫 Login successful, received token, length:', access_token.length);

      // Save token first
      authStorage.setToken(access_token);

      // Get fresh user data from server using the new token
      const meResponse = await authApi.getMe();
      const userData: User = {
        userId: meResponse.userId,
        email: meResponse.email,
        role: meResponse.role,
      };

      console.log('👤 Fresh user data from server:', userData);

      // Save user data
      authStorage.setUser(userData);

      // Update state AFTER saving to localStorage
      setToken(access_token);
      setUser(userData);

      console.log('✅ Auth state updated successfully');

      // Verify data was saved
      const savedToken = authStorage.getToken();
      const savedUser = authStorage.getUser();
      console.log('🔍 Verification - saved token exists:', !!savedToken);
      console.log('🔍 Verification - saved user exists:', !!savedUser);

      return userData;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const logout = () => {
    authStorage.removeToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

