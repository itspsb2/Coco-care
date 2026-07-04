import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TOKEN_KEY } from '@/api/client'
import type { LoginPayload, RegisterPayload, User, UserRole } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_KEY = 'coco_user'
const DEMO_TOKEN = 'coco_demo_token'

function buildDemoUser(payload: LoginPayload | RegisterPayload): User {
  const role =
    'role' in payload
      ? payload.role
      : payload.username === 'admin'
        ? 'admin'
        : payload.username === 'officer1'
          ? 'officer'
          : 'farmer'

  return {
    id: `demo-${payload.username}`,
    username: payload.username,
    name: 'name' in payload && payload.name ? payload.name : payload.username,
    phone: 'phone' in payload ? payload.phone : undefined,
    role,
  }
}

export function getRoleHomePath(role: UserRole): string {
  if (role === 'officer') return '/officer/reports'
  if (role === 'admin') return '/admin'
  return '/app'
}

function persistSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cachedUser = localStorage.getItem(USER_KEY)
    const token = localStorage.getItem(TOKEN_KEY)

    if (cachedUser && token) {
      try {
        setUser(JSON.parse(cachedUser) as User)
      } catch {
        clearSession()
      } finally {
        setLoading(false)
      }
      return
    }

    if (!token) {
      setLoading(false)
      return
    }

    clearSession()
    setLoading(false)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedIn = buildDemoUser(payload)
    persistSession(DEMO_TOKEN, loggedIn)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const registered = buildDemoUser(payload)
    persistSession(DEMO_TOKEN, registered)
    setUser(registered)
    return registered
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
