import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Microscope,
  MessageSquare,
  Map,
  TrendingUp,
  FlaskConical,
  Bell,
  User,
  Settings,
  Cloud,
  Search,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/app", icon: LayoutDashboard },
    { name: "Disease Detection", href: "/app/disease-detection", icon: Microscope },
    { name: "AI Chatbot", href: "/app/chatbot", icon: MessageSquare },
    { name: "Heatmap", href: "/app/heatmap", icon: Map },
    { name: "Farm Analytics", href: "/app/analytics", icon: TrendingUp },
    { name: "Fertilizer Planner", href: "/app/fertilizer", icon: FlaskConical },
    { name: "Notifications", href: "/app/notifications", icon: Bell },
    { name: "Profile", href: "/app/profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-green-100 transition-transform duration-300`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-green-100">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🥥</span>
                </div>
                <span className="text-xl font-semibold text-[#2d5f2e]">Coco Care</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#2d5f2e] text-white"
                      : "text-gray-700 hover:bg-green-50 hover:text-[#2d5f2e]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-green-100">
            <Link
              to="/app/profile"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#8b6f47] to-[#6b5537] rounded-full flex items-center justify-center text-white">
                NP
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900">Nimal Perera</div>
                <div className="text-xs text-gray-500">View Profile</div>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-green-100 px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">28°C, Sunny</span>
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
