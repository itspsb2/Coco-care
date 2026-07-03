import { AlertTriangle, Cloud, CheckCircle, TrendingUp, Bell, X } from "lucide-react";
import { useState } from "react";

const initialNotifications = [
  {
    id: 1,
    type: "alert",
    title: "Disease Outbreak Alert",
    message: "15 cases of Weligama Leaf Wilt reported within 5km radius. Inspect your plantation immediately.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "reminder",
    title: "Fertilizer Application Due",
    message: "It's time for your scheduled NPK fertilizer application. Recommended dosage: 2.5 kg per tree.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "weather",
    title: "Heavy Rainfall Warning",
    message: "Expect heavy rainfall in your area for the next 3 days. Ensure proper drainage systems are clear.",
    time: "1 day ago",
    read: false,
  },
  {
    id: 4,
    type: "success",
    title: "AI Detection Completed",
    message: "Your recent coconut leaf scan has been analyzed. Results show healthy plantation with 95% confidence.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 5,
    type: "alert",
    title: "High Risk Area Nearby",
    message: "Your plantation is near a high-risk zone for Stem Bleeding disease. Monitor trees closely for symptoms.",
    time: "2 days ago",
    read: true,
  },
  {
    id: 6,
    type: "info",
    title: "Yield Prediction Updated",
    message: "Based on current conditions, your next month yield is predicted to be 160 kg (+5.3%).",
    time: "3 days ago",
    read: true,
  },
];

export function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1a2e1a] mb-2">Notifications</h1>
          <p className="text-[#6b7c6b]">
            Stay updated with alerts, reminders, and important updates about your plantation.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-[#2d5f2e] hover:bg-green-50 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all" ? "bg-[#2d5f2e] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "unread" ? "bg-[#2d5f2e] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "read" ? "bg-[#2d5f2e] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Read
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: any;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const iconMap = {
    alert: <AlertTriangle className="w-6 h-6" />,
    weather: <Cloud className="w-6 h-6" />,
    success: <CheckCircle className="w-6 h-6" />,
    reminder: <Bell className="w-6 h-6" />,
    info: <TrendingUp className="w-6 h-6" />,
  };

  const colorMap = {
    alert: "bg-red-100 text-red-600",
    weather: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    reminder: "bg-yellow-100 text-yellow-600",
    info: "bg-purple-100 text-purple-600",
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border p-4 transition-all hover:shadow-md ${
        notification.read ? "border-gray-200" : "border-green-300 bg-green-50/30"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colorMap[notification.type as keyof typeof colorMap]}`}>
          {iconMap[notification.type as keyof typeof iconMap]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="text-lg text-gray-900">{notification.title}</h3>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-sm text-[#2d5f2e] hover:underline whitespace-nowrap"
                >
                  Mark as read
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <p className="text-gray-700 mb-2">{notification.message}</p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{notification.time}</span>
            {!notification.read && (
              <span className="w-2 h-2 bg-[#2d5f2e] rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
