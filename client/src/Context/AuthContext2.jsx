import React, { createContext, useEffect, useReducer } from "react";
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");

const getUserFromToken = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      // Token expired
      localStorage.removeItem("token");
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

const initial_state = {
  token: token || null,
  user: getUserFromToken(token),
  loading: false,
  error: null,
};

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        token: action.payload,
        user: getUserFromToken(action.payload),
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        token: null,
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        token: null,
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initial_state);

  useEffect(() => {
    if (state.token) {
      localStorage.setItem("token", state.token);
    } else {
      localStorage.removeItem("token");
    }
  }, [state.token]);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};