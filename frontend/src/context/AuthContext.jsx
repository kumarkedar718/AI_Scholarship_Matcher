import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          if (data.success) {
            setUser(data.data);
            localStorage.setItem('user', JSON.stringify(data.data));
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        setToken(data.data.token);
        setUser(data.data);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      }
      throw new Error(data.message || 'Login failed');
    } catch (error) {
      const errRes = error.response?.data;
      const err = new Error(errRes?.message || error.message || 'Login failed');
      if (errRes && errRes.data && errRes.data.isEmailVerified === false) {
        err.isEmailVerified = false;
        err.email = errRes.data.email || email;
        err.verificationSessionId = errRes.data.verificationSessionId || '';
      }
      throw err;
    }
  };

  const register = async (name, email, password, role = 'student') => {
    try {
      const { data } = await API.post('/auth/register', { name, email, password, role });
      if (data.success) {
        // Email verification required - do not set token or user yet
        return data;
      }
      throw new Error(data.message || 'Registration failed');
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        (error.response?.data?.errors ? Object.values(error.response.data.errors)[0] : null) ||
        error.message ||
        'Registration failed';
      throw new Error(errMsg);
    }
  };

  const resendVerification = async (email) => {
    try {
      const { data } = await API.post('/auth/resend-verification', { email });
      if (data.success) {
        return data;
      }
      throw new Error(data.message || 'Failed to resend verification email');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to resend verification email';
      throw new Error(errMsg);
    }
  };

  const verifyEmail = async (verificationToken) => {
    try {
      const { data } = await API.get('/auth/verify-email', { params: { token: verificationToken } });
      if (data.success) {
        return data;
      }
      throw new Error(data.message || 'Email verification failed');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Email verification failed';
      throw new Error(errMsg);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      if (data.success) {
        return data;
      }
      throw new Error(data.message || 'Password reset request failed');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Password reset request failed';
      throw new Error(errMsg);
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const { data } = await API.post('/auth/reset-password', { token: resetToken, password });
      if (data.success) {
        return data;
      }
      throw new Error(data.message || 'Password reset failed');
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Password reset failed';
      throw new Error(errMsg);
    }
  };

  const updateStudentProfile = async (profileData) => {
    const { data } = await API.put('/student/profile', profileData);
    if (data.success) {
      setUser(data.data.user);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data.user;
    }
    throw new Error(data.message || 'Profile update failed');
  };

  const checkVerificationStatus = async (verificationSessionId) => {
    try {
      const { data } = await API.get('/auth/verification-status', { params: { verificationSessionId } });
      if (data.success) {
        return data.data;
      }
      return { isEmailVerified: false };
    } catch (error) {
      return { isEmailVerified: false };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isStudent: user?.role === 'student',
        isAdmin: user?.role === 'admin',
        login,
        register,
        resendVerification,
        verifyEmail,
        checkVerificationStatus,
        forgotPassword,
        resetPassword,
        updateStudentProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
