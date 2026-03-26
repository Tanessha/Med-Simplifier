import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";

const AuthContext = createContext(null);

const usernameToEmail = (value) => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  return `${trimmed.replace(/[^a-z0-9._-]/g, "")}@scanscribe.local`;
};

const buildUserDoc = (firebaseUser, profileData = {}) => {
  const user = {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    username: profileData.username || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "user",
  };
  
  // Only add literacyLevel if it's explicitly set in profileData
  if (profileData.literacyLevel) {
    user.literacyLevel = profileData.literacyLevel;
  }
  
  return user;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      return null;
    }

    const userRef = doc(firestore, "users", firebaseUser.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const fallbackUser = buildUserDoc(firebaseUser);
      await setDoc(userRef, {
        username: fallbackUser.username,
        email: fallbackUser.email,
        literacyLevel: fallbackUser.literacyLevel,
        createdAt: serverTimestamp(),
      });
      setUser(fallbackUser);
      return fallbackUser;
    }

    const mergedUser = buildUserDoc(firebaseUser, snapshot.data());
    setUser(mergedUser);
    return mergedUser;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      try {
        await refreshUserProfile(firebaseUser);
      } catch (err) {
        console.error("Failed to sync auth state", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const register = async ({ username, password }) => {
    const email = usernameToEmail(username);
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await setDoc(doc(firestore, "users", credential.user.uid), {
      username: username.trim(),
      email,
      createdAt: serverTimestamp(),
    });
    return refreshUserProfile(credential.user);
  };

  const login = async ({ username, password }) => {
    const email = usernameToEmail(username);
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return refreshUserProfile(credential.user);
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
  };

  const updateUserProfile = async (updates) => {
    if (!firebaseAuth.currentUser) throw new Error("No authenticated user");
    const userRef = doc(firestore, "users", firebaseAuth.currentUser.uid);
    await updateDoc(userRef, updates);
    return refreshUserProfile(firebaseAuth.currentUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUserProfile, updateUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
