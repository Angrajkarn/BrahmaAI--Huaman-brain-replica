
"use client";

import type { FirebaseUser } from "firebase/auth";
import { auth, onAuthStateChanged, signOut as firebaseSignOut } from "@/lib/firebase";
import type { User } from "@/types"; // Your existing User type
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // If the auth instance is not initialized (due to missing .env), don't try to use it.
    if (!auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    // Also guard the logout function.
    if (!auth) {
      console.error("Firebase auth is not initialized, cannot log out.");
      return;
    }
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      router.push("/"); // Redirect to login page
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle error, maybe show a toast
    }
  };

  const value = {
    currentUser,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
