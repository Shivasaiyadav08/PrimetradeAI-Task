import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));

      try {
        await getMe();
      } catch (err) {
        logout();
      }
    }

    setLoading(false);
  };

  initAuth();
}, []);

  const login = async (email, password) => {
  try {
    const res = await loginApi({ email, password });

    console.log("FULL RESPONSE:", res.data);

    const token =
      res.data.token ||
      res.data.data?.token ||
      res.data.accessToken;

    const user =
      res.data.user ||
      res.data.data?.user;

    if (!token) {
      throw new Error("Token not found in response");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);

    toast.success("Welcome back!");
    return { success: true };
  } catch (err) {
    console.log("LOGIN ERROR:", err.response?.data || err.message);
    toast.error("Login failed");
    return { success: false };
  }
};
  const register = async (name, email, password) => {
    try {
      const { data } = await registerApi({ name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};