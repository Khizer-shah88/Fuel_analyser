export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface User {
  userId: string;
  email: string;
  role: string;
}

// Fallback storage using sessionStorage if localStorage is not available
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const getStorage = () => {
  if (typeof window === 'undefined') return null;

  try {
    // Test localStorage availability
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return localStorage;
  } catch (error) {
    console.warn('localStorage not available, falling back to sessionStorage');
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return sessionStorage;
    } catch (error) {
      console.error('Both localStorage and sessionStorage unavailable');
      return null;
    }
  }
};

const storage = getStorage();

export const authStorage = {
  getToken: (): string | null => {
    if (!storage) return null;
    try {
      const token = storage.getItem(TOKEN_KEY);
      console.log('🔍 Getting token from storage:', token ? 'EXISTS' : 'NOT FOUND');
      return token;
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  },

  setToken: (token: string): void => {
    if (!storage) {
      console.error('No storage available');
      return;
    }

    try {
      console.log('💾 Saving token to storage, length:', token.length);
      storage.setItem(TOKEN_KEY, token);
      console.log('✅ Token saved to storage');

      // Immediate verification
      const saved = storage.getItem(TOKEN_KEY);
      if (saved === token) {
        console.log('🔄 Verification - token saved correctly');
      } else {
        console.error('🔄 Verification FAILED - token not saved properly');
      }
    } catch (error) {
      console.error('❌ Error saving token to storage:', error);
    }
  },

  removeToken: (): void => {
    if (!storage) return;
    try {
      console.log('🧹 Clearing auth data from storage...');
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
      console.log('🧹 Auth data cleared from storage');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  getUser: (): User | null => {
    if (!storage) return null;
    try {
      const userStr = storage.getItem(USER_KEY);
      console.log('🔍 Getting user from storage:', userStr ? 'EXISTS' : 'NOT FOUND');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      console.log('👤 User loaded from storage:', user);
      return user;
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      return null;
    }
  },

  setUser: (user: User): void => {
    if (!storage) {
      console.error('No storage available');
      return;
    }

    try {
      console.log('👤 Saving user to storage:', user);
      const userString = JSON.stringify(user);
      storage.setItem(USER_KEY, userString);
      console.log('✅ User saved to storage');

      // Immediate verification
      const saved = storage.getItem(USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userId === user.userId && parsed.email === user.email) {
          console.log('🔄 Verification - user saved correctly');
        } else {
          console.error('🔄 Verification FAILED - user data corrupted');
        }
      } else {
        console.error('🔄 Verification FAILED - user not saved');
      }
    } catch (error) {
      console.error('❌ Error saving user to storage:', error);
    }
  },
};



