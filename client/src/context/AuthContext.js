    import React, { createContext, useState, useEffect, useContext } from 'react';
    import { auth } from '../firebase'; // Import Firebase auth instance (make sure '../firebase' path is correct)
    import {
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      onAuthStateChanged,
      signOut
    } from 'firebase/auth';

    // Create the AuthContext
    const AuthContext = createContext();

    // AuthProvider component to wrap your application
    export const AuthProvider = ({ children }) => {
      // State to hold authentication status, user ID, and token
      const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [userId, setUserId] = useState(null); // This will store the Firebase User's UID
      const [token, setToken] = useState(null); // This will store the Firebase ID Token
      const [loading, setLoading] = useState(true); // To indicate if the initial authentication state is still being loaded

      // useEffect to listen for Firebase authentication state changes
      useEffect(() => {
        // onAuthStateChanged is a Firebase listener that triggers whenever the user's sign-in state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // User is signed in (e.g., after login, registration, or if session persists)
            // Get the ID token, which is needed to authenticate requests to your backend
            const idToken = await user.getIdToken();
            setUserId(user.uid); // Set the Firebase UID as userId
            setToken(idToken); // Set the Firebase ID Token
            setIsAuthenticated(true); // Mark user as authenticated
            console.log('Firebase Auth State Changed: User logged in', user.uid);
          } else {
            // User is signed out (e.g., after logout or if no session)
            setUserId(null);
            setToken(null);
            setIsAuthenticated(false); // Mark user as not authenticated
            console.log('Firebase Auth State Changed: User logged out');
          }
          setLoading(false); // Authentication state has been determined
        });

        // Cleanup function: unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
      }, []); // Empty dependency array means this effect runs only once on mount

      // Function to register a new user with Firebase Email/Password
      const registerUser = async (email, password) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          // The onAuthStateChanged listener above will automatically update the context state
          return userCredential.user; // Return the Firebase User object
        } catch (error) {
          console.error("Firebase registration error:", error.message);
          throw error; // Re-throw the error for components to handle (e.g., display error message)
        }
      };

      // Function to log in an existing user with Firebase Email/Password
      const loginUser = async (email, password) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          // The onAuthStateChanged listener above will automatically update the context state
          return userCredential.user; // Return the Firebase User object
        } catch (error) {
          console.error("Firebase login error:", error.message);
          throw error; // Re-throw the error for components to handle
        }
      };

      // Function to log out the current user from Firebase
      const logoutUser = async () => {
        try {
          await signOut(auth);
          // The onAuthStateChanged listener above will automatically update the context state
        } catch (error) {
          console.error("Firebase logout error:", error.message);
          throw error; // Re-throw the error for components to handle
        }
      };

      // Provide the authentication state and functions to children components
      return (
        <AuthContext.Provider value={{
          isAuthenticated, // Boolean: true if user is logged in
          userId,          // String: Firebase UID of the logged-in user
          token,           // String: Firebase ID Token for backend authentication
          loading,         // Boolean: true while checking initial auth state
          registerUser,    // Function: to register a new user
          loginUser,       // Function: to log in a user
          logoutUser       // Function: to log out a user
        }}>
          {children}
        </AuthContext.Provider>
      );
    };

    // Custom hook to easily consume the AuthContext in any functional component
    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };
    