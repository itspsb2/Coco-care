import { Outlet, Link, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Microscope,
  MessageSquare,
  Map,
  Bell,
  User,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Zap,
  Phone,
  Mail,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { reportsApi } from '@/api/services'
import { CocoCareLogo } from '@/app/components/CocoCareLogo'

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLDivElement>(null)

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', 'my'],
    queryFn: reportsApi.my,
  })

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Coconut Disease Diagnosis', href: '/app/disease-detection', icon: Microscope },
    { name: 'AI Chatbot', href: '/app/chatbot', icon: MessageSquare },
    { name: 'Heatmap', href: '/app/heatmap', icon: Map },
    { name: 'Notifications', href: '/app/notifications', icon: Bell },
    { name: 'Profile', href: '/app/profile', icon: User },
  ]

  const initials = (user?.name ?? 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const sidebarWide = mobileOpen || !collapsed

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setCollapsed((c) => !c)
    } else {
      setMobileOpen((o) => !o)
    }
  }

  return (
    <div
      className="flex h-screen bg-gray-50 overflow-hidden"
      style={{ '--sidebar-w': sidebarWide ? '16rem' : '4.5rem' } as React.CSSProperties}
    >
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          bg-white border-r border-green-100 shadow-lg lg:shadow-none
          transition-all duration-300 ease-in-out translate-x-0
          ${mobileOpen ? 'w-64' : 'w-[4.5rem]'} ${collapsed ? 'lg:w-[4.5rem]' : 'lg:w-64'}
        `}
      >
        <div
          className={`border-b border-green-100 flex items-center p-3 shrink-0 min-h-[3.75rem] transition-all duration-300 ${
            sidebarWide ? 'justify-end' : 'justify-center'
          }`}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2.5 rounded-xl text-gray-700 hover:bg-green-50 hover:text-[#2d5f2e] transition-all duration-200"
            aria-label={sidebarWide ? 'Collapse navigation' : 'Expand navigation'}
          >
            {mobileOpen ? (
              <X className="w-6 h-6 lg:hidden" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                title={sidebarWide ? undefined : item.name}
                className={`
                  flex items-center gap-3 rounded-xl transition-all duration-200
                  ${sidebarWide ? 'px-4 py-3' : 'px-0 py-3 justify-center'}
                  ${isActive
                    ? 'bg-[#2d5f2e] text-white shadow-md shadow-green-900/10'
                    : 'text-gray-700 hover:bg-green-50 hover:text-[#2d5f2e]'}
                `}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    sidebarWide ? 'opacity-100 max-w-[12rem]' : 'opacity-0 max-w-0 overflow-hidden'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && sidebarWide && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
              </Link>
            )
          })}
        </nav>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-[1px] transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-green-100 px-4 lg:px-6 h-16 flex items-center justify-between shrink-0">
          <CocoCareLogo to="/app" iconClassName="h-8 w-auto max-w-[130px] object-contain" />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-green-50 border border-transparent hover:border-green-100 transition-all"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#8b6f47] to-[#6b5537] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {initials}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-800 max-w-[8rem] truncate">
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            <div
              className={`
                absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-green-100
                origin-top-right transition-all duration-200 z-50
                ${profileOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
              `}
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-full flex items-center justify-center text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">@{user?.username} · {user?.role}</div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2 text-sm">
                {user?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#2d5f2e]" />
                    {user.phone}
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-[#2d5f2e]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100 flex flex-col gap-1">
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 text-sm"
                >
                  <User className="w-4 h-4" />
                  View profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Floating Quick AI Diagnosis */}
      <div ref={fabRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <div
          className={`
            relative w-[min(100vw-3rem,20rem)] bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-2xl shadow-2xl p-5 pt-10 text-white
            origin-bottom-right transition-all duration-300 ease-out
            ${fabOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none h-0 p-0 pt-0 overflow-hidden'}
          `}
        >
          {fabOpen && (
            <>
              <button
                type="button"
                onClick={() => setFabOpen(false)}
                className="absolute top-3 right-3 p-1 text-white hover:text-green-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold mb-2 pr-6">Quick AI Diagnosis</h3>
              <p className="text-green-100 text-sm mb-4">
                Upload a coconut leaf image for instant disease detection.
              </p>
              <Link
                to="/app/disease-detection"
                onClick={() => setFabOpen(false)}
                className="block w-full py-2.5 bg-white text-[#2d5f2e] rounded-lg hover:bg-green-50 transition-colors text-center text-sm font-medium"
              >
                Upload Image
              </Link>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-200">
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>{reports.length} diagnoses on record</span>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setFabOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full shadow-lg transition-all duration-300 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] text-white px-5 py-4 hover:scale-105 hover:shadow-xl"
          aria-expanded={fabOpen}
          aria-label="Quick AI Diagnosis"
        >
          <Microscope className="w-6 h-6" />
          <span className="font-medium text-sm pr-1">AI Diagnosis</span>
        </button>
      </div>
    </div>
  )
}
