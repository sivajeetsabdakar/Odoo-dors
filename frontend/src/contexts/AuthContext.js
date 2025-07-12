'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('stackit_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Optionally verify the user with the backend
        if (parsedUser.id) {
          authApi.getCurrentUser(parsedUser.id)
            .then(userData => {
              setUser(userData);
              localStorage.setItem('stackit_user', JSON.stringify(userData));
            })
            .catch(error => {
              console.error('Failed to verify user:', error);
              // If verification fails, clear the stored user
              localStorage.removeItem('stackit_user');
              setUser(null);
            });
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('stackit_user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const userData = response.user;
      
      setUser(userData);
      localStorage.setItem('stackit_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authApi.register(userData);
      
      setUser(response);
      localStorage.setItem('stackit_user', JSON.stringify(response));
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stackit_user');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('stackit_user', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    login,
    logout,
    signup,
    updateUser,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};