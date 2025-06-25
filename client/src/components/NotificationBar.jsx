import { useState, useEffect, useRef } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import socket from "../socket/socket"; // adjust path as needed
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function NotificationBar({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const opRef = useRef(null);

  useEffect(() => {
    
    if (userId) {
      socket.emit("registerUser", userId);
    }

    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${API}/api/notifications/admin`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const notifs = data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [userId]);

  const markAsRead = async (id) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter((n) => !n.isRead).length);

    // Optionally mark it as read in DB
    await axios.patch(`${API}/api/notifications/seen/${id}`,{}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  const markAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    setUnreadCount(0);

    // Optionally update all in DB
    await axios.put(`${API}/api/notificationRoutes/mark-all-read/${userId}`);
  };

  return (
    <div className="notification-container">
      <Button
        type="button"
        icon="pi pi-bell"
        className="p-button-rounded p-button-text p-button-plain relative"
        onClick={(e) => opRef.current.toggle(e)}
        aria-haspopup
        aria-controls="notification-panel"
      >
        {unreadCount > 0 && (
          <Badge
            value={unreadCount}
            className="absolute -top-[2px] -right-[2px]"
            severity="danger"
          />
        )}
      </Button>

      <OverlayPanel
        ref={opRef}
        id="notification-panel"
        className="w-80 md:w-96"
        dismissable
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              label="Mark all as read"
              className="p-button-text p-button-sm"
              onClick={markAllAsRead}
            />
          )}
        </div>

        <div className="notification-list max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-round mb-2 cursor-pointer transition-colors ${
                  !notification.isRead
                    ? "bg-blue-50 font-semibold"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <span>{notification.message}</span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-blue-500 border-circle mt-1.5"></span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No new notifications
            </div>
          )}
        </div>
      </OverlayPanel>
    </div>
  );
}
