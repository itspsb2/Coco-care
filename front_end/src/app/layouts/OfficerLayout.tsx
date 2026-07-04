import { Link, Outlet, useLocation } from 'react-router'
import { ClipboardList, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { CocoCareLogo } from '@/app/components/CocoCareLogo'

export function OfficerLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-green-100 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <CocoCareLogo iconClassName="h-8 w-auto" />
            <span className="text-lg font-semibold text-[#2d5f2e]">Officer</span>
          </Link>
          <Link
            to="/officer/reports"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              location.pathname.includes('/reports')
                ? 'bg-[#2d5f2e] text-white'
                : 'text-gray-700 hover:bg-green-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Pending Reports
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#2d5f2e]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="p-6 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
