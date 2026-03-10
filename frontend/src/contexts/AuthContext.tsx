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
        console.log('✅ Using stored auth data from localStorage');
        // Set initial state immediately from storage - no need to verify with backend
        setToken(storedToken);
        setUser(storedUser);
        console.log('✅ Auth state loaded from storage');
        
        // Optionally verify token in background (don't wait for it)
        // If token is invalid, the API calls will get 401 and redirect to login
        if (process.env.NODE_ENV === 'development') {
          authApi.getMe()
            .then(meResponse => {
              console.log('✅ Token verified (background):', meResponse);
            })
            .catch(error => {
              console.warn('⚠️  Token verification failed (background):', error.message);
            });
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

