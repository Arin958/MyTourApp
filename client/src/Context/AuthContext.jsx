import React, { createContext, useEffect, useReducer } from "react";
import axios from "axios";

const token = localStorage.getItem("token");

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const initial_state = {
  token: token || null,
  user: null,
  loading: false,
  error: null,
  authChecked: false, // 👈 Add this to delay rendering protected routes
};

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return { ...state, token: null, user: null, loading: false, error: action.payload };
    case "LOGOUT":
      return { ...state, token: null, user: null, loading: false, error: null };
    case "AUTH_CHECKED":
      return { ...state, authChecked: true };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initial_state);

  // Sync token in localStorage with reducer state
  useEffect(() => {
    if (state.token) {
      localStorage.setItem("token", state.token);
    } else {
      localStorage.removeItem("token");
    }
  }, [state.token]);

  // On app load, check auth with backend
useEffect(() => {
  const checkAuth = async () => {
    try {
      if (!state.token) {
        dispatch({ type: "AUTH_CHECKED" }); // no token means auth checked, no user
        return;
      }

      const res = await axios.get(`${API}/api/auth/check-auth`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { token: state.token, user: res.data.user },
      });
    } catch (err) {
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "AUTH_CHECKED" }); // always mark auth check complete
    }
  };

  checkAuth();
}, [state.token]);


  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        user: state.user,
        loading: state.loading,
        error: state.error,
        authChecked: state.authChecked,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
