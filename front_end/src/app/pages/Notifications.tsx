import { AlertTriangle, CheckCircle, Bell, X, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reportsApi, diseaseMapApi, notificationsApi } from '@/api/services'

interface NotificationItem {
  id: string
  type: 'alert' | 'success' | 'info'
  title: string
  message: string
  time: string
  read: boolean
  source: 'broadcast' | 'local'
}

export function Notifications() {
  const queryClient = useQueryClient()
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('all')

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', 'my'],
    queryFn: reportsApi.my,
  })

  const { data: heatmap = [], isLoading: mapLoading } = useQuery({
    queryKey: ['disease-map', 'heatmap'],
    queryFn: diseaseMapApi.heatmap,
  })

  const { data: broadcasts = [], isLoading: broadcastsLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: notificationsApi.list,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] }),
  })

  const notifications = useMemo(() => {
    const items: NotificationItem[] = []

    broadcasts.forEach((b) => {
      items.push({
        id: b.id,
        type: 'alert',
        title: b.title,
        message: b.message,
        time: new Date(b.createdAt).toLocaleString(),
        read: b.read,
        source: 'broadcast',
      })
    })

    heatmap
      .filter((p) => p.weight >= 0.7)
      .forEach((p, i) => {
        items.push({
          id: `heatmap-${i}`,
          type: 'alert',
          title: 'Disease Outbreak Alert',
          message: `${p.diseaseType} reported near ${p.lat.toFixed(2)}, ${p.lng.toFixed(2)} (intensity ${Math.round(p.weight * 100)}%).`,
          time: 'Recent',
          read: false,
          source: 'local',
        })
      })

    reports.forEach((r) => {
      items.push({
        id: `report-${r.id}`,
        type: r.status === 'verified' ? 'success' : r.status === 'pending' ? 'info' : 'alert',
        title: r.status === 'pending' ? 'Diagnosis Pending Review' : `Report ${r.status}`,
        message: `${r.finalResult ?? r.imageResult ?? 'Disease scan'} — ${Math.round(r.confidence * 100)}% confidence.`,
        time: new Date(r.createdAt).toLocaleDateString(),
        read: r.status !== 'pending',
        source: 'local',
      })
    })

    return items
  }, [reports, heatmap, broadcasts])

  const visible = notifications
    .filter((n) => !deletedIds.has(n.id))
    .map((n) => ({ ...n, read: n.read || readIds.has(n.id) }))
    .filter((n) => {
      if (filter === 'unread') return !n.read
      if (filter === 'read') return n.read
      return true
    })

  const unreadCount = notifications.filter(
    (n) => !n.read && !readIds.has(n.id) && !deletedIds.has(n.id),
  ).length
  const isLoading = reportsLoading || mapLoading || broadcastsLoading

  const markAsRead = (item: NotificationItem) => {
    if (item.source === 'broadcast') {
      markReadMutation.mutate(item.id)
    } else {
      setReadIds((prev) => new Set(prev).add(item.id))
    }
  }

  const deleteNotification = (id: string) => setDeletedIds((prev) => new Set(prev).add(id))
  const markAllAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markAsRead(n)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1a2e1a] mb-2">Notifications</h1>
          <p className="text-[#6b7c6b]">
            Admin broadcasts, your reports, and nearby disease outbreaks.
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-[#2d5f2e] hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm capitalize ${
              filter === f ? 'bg-[#2d5f2e] text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-green-100 p-12 text-center text-gray-500">
          No notifications to show.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={() => markAsRead(notification)}
              onDelete={() => deleteNotification(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationCard({
  notification,
  onRead,
  onDelete,
}: {
  notification: NotificationItem
  onRead: () => void
  onDelete: () => void
}) {
  const icons = {
    alert: <AlertTriangle className="w-5 h-5 text-red-600" />,
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    info: <Bell className="w-5 h-5 text-blue-600" />,
  }

  return (
    <div
      className={`bg-white rounded-xl border p-4 flex gap-4 ${
        notification.read ? 'border-gray-100 opacity-75' : 'border-green-200'
      }`}
    >
      <div className="mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900">{notification.title}</h3>
          <button onClick={onDelete} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{notification.message}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{notification.time}</span>
          {!notification.read && (
            <button onClick={onRead} className="text-xs text-[#2d5f2e] hover:underline">
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
