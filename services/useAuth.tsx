'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "./firebase/initialization";
import { updateUser } from "./firebase/db";
import { User } from "../types";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  saveUser: (user: User | null) => void;
  update: (user: User) => void;
  checkUser: () => void;
  handleSaveLoginChange: (shouldSave: boolean) => void;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const saveUser = (user: User | null) => {
    if (user) {
      setCurrentUser(user);
      if (localStorage.getItem("saveLogin") === "true") {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
      }
    } else {
      setCurrentUser(null);
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }
  };

  const update = (user: User) => {
    updateUser({ user });
    saveUser(user);
  };

  const checkUser = () => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("[Auth] Error parsing user from storage:", error);
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (!user) {
        saveUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveLoginChange = (shouldSave: boolean) => {
    localStorage.setItem("saveLogin", shouldSave ? "true" : "false");
  };

  const logout = async () => {
    await signOut(auth);
    saveUser(null);
    localStorage.removeItem("saveLogin");
    return
  };

  return (
    <AuthContext.Provider value={{ currentUser, update, saveUser, loading, handleSaveLoginChange, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("[Auth] useAuth must be used within an AuthProvider.");
  }
  return context;
};
