import { useState, useEffect } from "react";
import { onAuthStateChanged, getIdToken, signOut } from "firebase/auth";
import { auth } from "../firebase.config";
import { apiUser } from "../api/userService";

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoadingState] = useState(true);

  useEffect(() => {
    console.log("Initializing Firebase auth listener...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingState(true);
      if (user) {
        try {
          const idToken = await getIdToken(user, true);
          const res = await apiUser.loginEmail({ idToken });
          if (res.status !== 200) return
          const userData = res.data?.data || {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: user.role || "user",
          };
          setCurrentUser(userData);
        } catch (error) {
          console.error("Firebase auth error:", error.message);
          setCurrentUser(null);
          localStorage.removeItem("authToken");
        }
      }  
      setLoadingState(false);
    });

    return () => unsubscribe();
  }, []);  

  // Login with email and password
  const login = async (email, password) => {
    setLoadingState(true);
    try {
      const res = await apiUser.login({ email, password });
      if (res.status !== 200) {
        throw new Error(res.data?.message || "Login failed");
      }
      const userData = res.data?.data;
    
      setCurrentUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error("Login error:", error.message);
      setCurrentUser(null);
      localStorage.removeItem("authToken");
      return { success: false, error: error.message };
    } finally {
      setLoadingState(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoadingState(true);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      await apiUser.logout();
      setCurrentUser(null);
      localStorage.removeItem("authToken");
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      setLoadingState(false);
    }
  };

  return { currentUser, loading, login, logout };
};

export default useAuth;