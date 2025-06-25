import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./index.css";
import Router from "./Routes/Router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationComponent from "./components/Notification/Notification";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <NotificationComponent />
      <ToastContainer position="top-right" autoClose={3000} />
      <Router />
    </>
  );
}

export default App;
