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

  // On mount: restore session from localStorage and re-verify with Djoser /users/me/
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      getUserProfile()
        .then((userData) => {
          const normalized = normalizeUser(userData);
          setUser(normalized);
          localStorage.setItem("auth_user", JSON.stringify(normalized));
        })
        .catch(() => {
          // If /users/me/ fails on mount, clear session (token likely expired)
          clearSession();
        })
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

  const normalizeUser = (userData) => ({
    ...userData,
    is_admin: userData.is_admin ?? userData.is_staff ?? false,
    full_name: userData.full_name || userData.username || "",
  });

  /**
   * Called after successful Djoser login.
   * Djoser returns { auth_token: "..." }
   * We store the token first, then fetch /users/me/
   */
  const login = useCallback(async (authToken) => {
    // Store token immediately so the /users/me/ request is authenticated
    localStorage.setItem("auth_token", authToken);
    setToken(authToken);

    try {
      const userData = await getUserProfile();
      const normalized = normalizeUser(userData);
      localStorage.setItem("auth_user", JSON.stringify(normalized));
      setUser(normalized);
      return normalized;
    } catch (err) {
      // If fetching profile fails after a successful token login,
      // do NOT clear the session — log the error and rethrow
      console.error(
        "Failed to fetch user profile after login:",
        err?.response?.status,
        err?.response?.data,
      );
      clearSession();
      throw new Error(
        "Login succeeded but could not load your profile. Please try again.",
      );
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (_) {
      // Silently ignore
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
