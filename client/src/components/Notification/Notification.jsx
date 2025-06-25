import { useContext, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";
import socket, { registerSocketUser } from "../../socket/socket";
import { toast } from "react-toastify";

const NotificationComponent = ({ onBookingUpdate }) => {
  const { user, authChecked } = useContext(AuthContext);

  // Request browser notification permission on mount
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (authChecked && user?.id) {
      registerSocketUser(user.id);
    }

    const handleBookingStatus = (data) => {
      toast.info(data.message || "Booking status updated");
      console.log("Socket notification:", data);

      // Show native OS-level notification
      if (Notification.permission === "granted") {
        new Notification("Booking Update", {
          body: data.message || "Booking status updated",
          icon: "/logo.png", // Optional: replace with your app icon
        });
      }

      if (onBookingUpdate) {
        onBookingUpdate(data);
      }
    };

    socket.on("bookingStatusChanged", handleBookingStatus);

    return () => {
      socket.off("bookingStatusChanged", handleBookingStatus);
    };
  }, [authChecked, user]);

  return null;
};

export default NotificationComponent;
