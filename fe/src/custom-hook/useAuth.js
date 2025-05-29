import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  getIdToken,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase.config";
import { apiUser } from "../api/userService";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateUserFromApi = useCallback(async (user, idToken) => {
    try {
      const res = await apiUser.loginEmail({ idToken });
      if (res.status !== 200) {
        throw new Error(res.data?.message || "API login failed");
      }
      const userData = res.data?.data || {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role || "user",
      };
      setCurrentUser(userData);
      localStorage.setItem("authToken", idToken);
      return userData;
    } catch (err) {
      console.log("Error updating user from API:", err.message);
      setError(err.message);
      // setCurrentUser(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const idToken = await getIdToken(user, true);
          await updateUserFromApi(user, idToken);
        } catch (err) {
          console.error("Firebase auth error:", err.message);
        }
      } else {
        console.log("Error clean user from API:");
        // setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [updateUserFromApi]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiUser.login({ email, password });
      if (res.status !== 200) {
        throw new Error(res.data?.message || "Login failed");
      }
      const userData = res.data?.data;
      console.log("User data from API:", userData);
      
      setCurrentUser(userData);
      return { success: true, data: userData };
    } catch (err) {
      console.log("Error setCurrentUser user from API:");
      setError(err.message);
      // setCurrentUser(null);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiUser.register({ email, password, displayName });
      if (res.status !== 200) {
        throw new Error(res.data?.message || "Registration failed");
      }
      return { success: true, data: res.data?.data };
    } catch (err) {
      console.log("Error register setCurrentUser user from API:");
      setError(err.message);
      setCurrentUser(null);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await getIdToken(user, true);
      const userData = await updateUserFromApi(user, idToken);
      return { success: true, data: userData };
    } catch (err) {
      console.log("Error signInWithGoogle setCurrentUser user from API:");
      setError(err.message);
      setCurrentUser(null);
      localStorage.removeItem("authToken");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      const idToken = await getIdToken(user, true);
      const userData = await updateUserFromApi(user, idToken);
      return { success: true, data: userData };
    } catch (err) {
      console.log("Error signInWithFacebook setCurrentUser user from API:");
      setError(err.message);
      setCurrentUser(null);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      await apiUser.logout();
      setCurrentUser(null);
      return { success: true };
    } catch (err) {
      console.log("Error logout setCurrentUser user from API:");
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  console.log("Current User:", currentUser);
  
  return {
    currentUser,
    loading,
    error,
    login,
    register,
    signInWithGoogle,
    signInWithFacebook,
    logout,
  };
};

export default useAuth;
