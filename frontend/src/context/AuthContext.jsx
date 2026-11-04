"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

/**
 * Authentication Context Provider.
 * Persists session state and JWT Bearer token in browser localStorage.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    const savedToken = localStorage.getItem("doctor_tracker_token");
    const savedUser = localStorage.getItem("doctor_tracker_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse saved user session:", err);
        localStorage.removeItem("doctor_tracker_token");
        localStorage.removeItem("doctor_tracker_user");
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Save user session upon successful login.
   * @param {string} newToken - JWT Bearer token
   * @param {Object} newUser - Authenticated user profile
   */
  const login = (newToken, newUser) => {
    localStorage.setItem("doctor_tracker_token", newToken);
    localStorage.setItem("doctor_tracker_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  /**
   * Terminate active user session and redirect to login screen.
   */
  const logout = () => {
    localStorage.removeItem("doctor_tracker_token");
    localStorage.removeItem("doctor_tracker_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: Boolean(token)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom React hook to access authentication state.
 * @returns {{ user: Object|null, token: string|null, isLoading: boolean, login: Function, logout: Function, isAuthenticated: boolean }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
