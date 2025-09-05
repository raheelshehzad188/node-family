import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import authService from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, otpToken?: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, otpToken?: string) => {
    try {
      const response = await authService.login(email, password, otpToken);
      
      if (response.requiresOTP) {
        throw new Error('OTP_REQUIRED');
      }

      localStorage.setItem('token', response.token);
      setUser(response.user);
      enqueueSnackbar('Login successful!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message === 'OTP_REQUIRED') {
        throw error;
      }
      enqueueSnackbar(error.response?.data?.error || 'Login failed', { variant: 'error' });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authService.register(name, email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      enqueueSnackbar('Registration successful!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.error || 'Registration failed', { variant: 'error' });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    enqueueSnackbar('Logged out successfully', { variant: 'info' });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};