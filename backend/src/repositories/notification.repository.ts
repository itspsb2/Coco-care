import { getPool } from '../db/pool.js'
import type { UserRole } from '../types/index.js'

export type NotificationAudience = 'all' | 'farmers' | 'officers'

export interface NotificationRow {
  id: string
  title: string
  message: string
  audience: NotificationAudience
  created_by: string | null
  created_at: Date
  read_at?: Date | null
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  audience: NotificationAudience
  createdBy?: string | null
  createdAt: string
  read: boolean
}

function mapNotification(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    audience: row.audience,
    createdBy: row.created_by,
    createdAt: row.created_at.toISOString(),
    read: Boolean(row.read_at),
  }
}

export async function createNotification(input: {
  title: string
  message: string
  audience: NotificationAudience
  createdBy: string
}): Promise<NotificationItem> {
  const { rows } = await getPool().query<NotificationRow>(
    `INSERT INTO notifications (title, message, audience, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, message, audience, created_by, created_at`,
    [input.title, input.message, input.audience, input.createdBy],
  )
  return mapNotification({ ...rows[0], read_at: null })
}

export async function listAllNotifications(): Promise<NotificationItem[]> {
  const { rows } = await getPool().query<NotificationRow>(
    `SELECT id, title, message, audience, created_by, created_at
     FROM notifications ORDER BY created_at DESC LIMIT 100`,
  )
  return rows.map((r) => mapNotification({ ...r, read_at: null }))
}

export async function listForUser(
  userId: string,
  role: UserRole,
): Promise<NotificationItem[]> {
  const audiences: NotificationAudience[] = ['all']
  if (role === 'farmer') audiences.push('farmers')
  if (role === 'officer') audiences.push('officers')
  if (role === 'admin') audiences.push('farmers', 'officers')

  const { rows } = await getPool().query<NotificationRow>(
    `SELECT n.id, n.title, n.message, n.audience, n.created_by, n.created_at, nr.read_at
     FROM notifications n
     LEFT JOIN notification_reads nr
       ON nr.notification_id = n.id AND nr.user_id = $1
     WHERE n.audience = ANY($2::text[])
     ORDER BY n.created_at DESC
     LIMIT 100`,
    [userId, audiences],
  )
  return rows.map(mapNotification)
}

export async function markRead(notificationId: string, userId: string): Promise<boolean> {
  const result = await getPool().query(
    `INSERT INTO notification_reads (notification_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (notification_id, user_id) DO NOTHING`,
    [notificationId, userId],
  )
  return (result.rowCount ?? 0) >= 0
}
