import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getUserProfile, logoutUser } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage and verify with Djoser /users/me/
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // Re-fetch profile from Djoser to confirm token is still valid
      getUserProfile()
        .then((userData) => {
          const normalized = {
            ...userData,
            is_admin: userData.is_admin ?? userData.is_staff ?? false,
          };
          setUser(normalized);
          localStorage.setItem("auth_user", JSON.stringify(normalized));
        })
        .catch(() => clearSession())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const clearSession = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  /**
   * Called after successful Djoser login.
   * Djoser's login response: { auth_token: "..." }
   * We then fetch the user profile separately from /users/me/
   */
  const login = useCallback(async (authToken) => {
    localStorage.setItem("auth_token", authToken);
    setToken(authToken);

    // Fetch profile from /api/auth/users/me/ using the new token
    try {
      const userData = await getUserProfile();
      // Normalize — ensure is_admin always exists as a boolean
      const normalized = {
        ...userData,
        is_admin: userData.is_admin ?? userData.is_staff ?? false,
      };
      localStorage.setItem("auth_user", JSON.stringify(normalized));
      setUser(normalized);
      return normalized;
    } catch (err) {
      clearSession();
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (_) {
      // Silently ignore — token may already be invalid
    } finally {
      clearSession();
    }
  }, []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
