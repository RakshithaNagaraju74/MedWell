// src/context/FirebaseUserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth'; // Import getAuth from firebase/auth

const FirebaseUserContext = createContext(null);

export const useFirebaseUser = () => {
  const context = useContext(FirebaseUserContext);
  if (!context) {
    throw new Error('useFirebaseUser must be used within a FirebaseUserProvider');
  }
  return context;
};

export const FirebaseUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseUserContext.Provider value={{ currentUser: user, loadingAuth }}>
      {children}
    </FirebaseUserContext.Provider>
  );
};