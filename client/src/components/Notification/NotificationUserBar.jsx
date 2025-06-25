import { useState, useEffect, useRef } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import socket from "../../socket/socket";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function NotificationUserBar({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("unread");
  const opRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get(`${API}/api/notifications/user/unread`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const { data } = await axios.get(`${API}/api/notifications/unread`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
    }
  };

  const fetchAllNotifications = async () => {
    try {
      const { data } = await axios.get(`${API}/api/notifications/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      socket.emit("registerUser", userId);
      fetchUnreadCount();
      fetchAllNotifications();
    }

    socket.on("bookingStatusChanged", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("bookingStatusChanged");
    };
  }, [userId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "unread") {
      fetchUnreadNotifications();
    } else {
      fetchAllNotifications();
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API}/api/notifications/user/seen/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/api/notifications/user/seen-all`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const filteredNotifications = activeTab === "unread" 
    ? notifications.filter(n => !n.isRead)
    : notifications;

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
        className="w-80 md:w-96 p-0"
        style={{ maxHeight: '500px' }}
      >
        <div className="sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex justify-between items-center px-4 pt-4">
            <h3 className="font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                label="Mark all as read"
                className="p-button-text p-button-sm text-blue-500"
                onClick={markAllAsRead}
              />
            )}
          </div>
          
          <div className="flex border-b mt-3">
            <button
              className={`flex-1 py-3 font-medium text-sm transition-colors ${
                activeTab === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("all")}
            >
              All
            </button>
            <button
              className={`flex-1 py-3 font-medium text-sm transition-colors ${
                activeTab === "unread" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("unread")}
            >
              Unread {unreadCount > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex items-start gap-3 ${
                  !notification.isRead ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${
                  !notification.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                } flex items-center justify-center mt-1`}>
                  <i className={`pi ${
                    notification.type === 'booking' ? 'pi-calendar' : 
                    notification.type === 'message' ? 'pi-comment' : 'pi-bell'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm mb-1 truncate ${
                      !notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"
                    }`}>
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <i className="pi pi-clock mr-1"></i>
                    {new Date(notification.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="pi pi-inbox text-2xl mb-2 opacity-60"></i>
              <p className="mt-2">
                {activeTab === "unread" 
                  ? "No unread notifications" 
                  : "No notifications yet"}
              </p>
            </div>
          )}
        </div>

        {filteredNotifications.length > 5 && (
          <div className="sticky bottom-0 bg-white border-t px-4 py-2 text-center">
            <Button 
              label="View all notifications" 
              className="p-button-text p-button-sm text-blue-500" 
            />
          </div>
        )}
      </OverlayPanel>
    </div>
  );
}