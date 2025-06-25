// src/services/authService.js
import axios from "axios";

const API = "http://localhost:3000/api";

//register user
export const registerUser = (userData) =>
  axios.post(`${API}/auth/register`, userData);

//authenticate user
export const loginUser = (credentials) =>
  axios.post(`${API}/auth/login`, credentials);

//get user profile
export const getProfile = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};