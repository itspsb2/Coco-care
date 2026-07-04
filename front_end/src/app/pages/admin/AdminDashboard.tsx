import { useQuery } from '@tanstack/react-query'
import { Users, FileWarning, MapPin, Loader2 } from 'lucide-react'
import { adminApi } from '@/api/services'
import { useLocation } from 'react-router'

export function AdminDashboard() {
  const location = useLocation()
  const showUsers = location.pathname.includes('/users')

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.users,
    enabled: showUsers,
  })

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">
          {showUsers ? 'User Management' : 'Admin Dashboard'}
        </h1>
        <p className="text-[#6b7c6b]">Platform overview and user administration.</p>
      </div>

      {!showUsers && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={<Users className="w-6 h-6" />} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={<FileWarning className="w-6 h-6" />} label="Pending Reports" value={stats.pendingReports} />
          <StatCard icon={<MapPin className="w-6 h-6" />} label="Verified Outbreaks" value={stats.verifiedOutbreaks} />
        </div>
      )}

      {showUsers && (
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
          {usersLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-green-50 border-b border-green-100">
                <tr>
                  <th className="text-left p-4 text-gray-600">Name</th>
                  <th className="text-left p-4 text-gray-600">Username</th>
                  <th className="text-left p-4 text-gray-600">Role</th>
                  <th className="text-left p-4 text-gray-600">Phone</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="p-4 text-gray-900">{u.name}</td>
                    <td className="p-4 text-gray-700">{u.username}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">{u.phone ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2 text-[#2d5f2e]">{icon}</div>
      <div className="text-3xl text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
