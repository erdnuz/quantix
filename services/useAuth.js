'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase/initialization"; 
import { updateUser } from "./firebase/db";// Ensure correct path

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveUser = (user) => {
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

  const update = (user) => {
    updateUser(user);
    saveUser(user)
  }
  
  const checkUser = () => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedUser) {
      try {
        
        const parsedUser = JSON.parse(storedUser); 
        setCurrentUser(parsedUser);
        
      } catch (error) {
        console.error("[Auth] Error parsing user from localStorage:", error);
        localStorage.removeItem("user"); // 🚨 Remove corrupted data
      }
    }
  };
  

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {

      if (!user) {
        saveUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSaveLoginChange = (shouldSave) => {
    localStorage.setItem("saveLogin", shouldSave ? "true" : "false");
  };

  const logout = async () => {
    await signOut(auth);
    saveUser(null);
    localStorage.removeItem("saveLogin");
  };

  return (
    <AuthContext.Provider value={{ currentUser,update,  saveUser, loading, handleSaveLoginChange, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    console.error("[Auth] useAuth must be used within an AuthProvider.");
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  
  return context;
};
