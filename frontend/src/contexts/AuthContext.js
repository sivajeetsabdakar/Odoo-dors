'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'admin@stackit.com',
    username: 'admin',
    role: 'admin',
    password: 'admin123'
  },
  {
    id: '2',
    email: 'user@stackit.com',
    username: 'john_doe',
    role: 'user',
    password: 'user123'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('stackit_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('Invalid credentials');
    }
    
    const userWithoutPassword = {
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
      role: foundUser.role,
      token: 'mock_jwt_token'
    };
    
    setUser(userWithoutPassword);
    localStorage.setItem('stackit_user', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  };

  const signup = async (email, password, username) => {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      username,
      role: 'user',
      password
    };
    
    mockUsers.push(newUser);
    
    const userWithoutPassword = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      token: 'mock_jwt_token'
    };
    
    setUser(userWithoutPassword);
    localStorage.setItem('stackit_user', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stackit_user');
  };

  const value = {
    user,
    login,
    logout,
    signup,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};