import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const adminData = localStorage.getItem("admin");

    if (token && adminData) {
      setAdmin(JSON.parse(adminData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post("/api/auth/admin/login", {
      email,
      password,
    });
    const { accessToken, refreshToken, admin } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("admin", JSON.stringify(admin));

    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setAdmin(admin);

    return admin;
  };

  const register = async (inviteCode, email, password, name) => {
    const response = await axios.post("/api/auth/admin/register", {
      inviteCode,
      email,
      password,
      name,
    });

    const { accessToken, refreshToken, admin } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("admin", JSON.stringify(admin));

    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setAdmin(admin);

    return admin;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("admin");
    delete axios.defaults.headers.common["Authorization"];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
