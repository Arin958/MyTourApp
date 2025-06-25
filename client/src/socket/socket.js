// socket.js
import { io } from "socket.io-client";

// Connect
const socket = io("http://localhost:3000");

// Send userId to server after connection
export const registerSocketUser = (userId) => {
  socket.emit("registerUser", userId);
};

export default socket;
