import { Link, useNavigate } from 'react-router'
import { User, Lock, Chrome } from 'lucide-react'
import { useState } from 'react'
import { useAuth, getRoleHomePath } from '@/contexts/AuthContext'
import { CocoCareLogo } from '@/app/components/CocoCareLogo'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login({ username, password })
      navigate(getRoleHomePath(user.role))
    } catch {
      setError('Invalid username or password. Try akeel, officer1, or admin.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-green-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CocoCareLogo iconClassName="w-10 h-10" textClassName="text-2xl" />
            </div>
            <h1 className="text-3xl text-[#1a2e1a] mb-2">Welcome Back</h1>
            <p className="text-[#6b7c6b]">Sign in to access your farming dashboard</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white"
                    placeholder="akeel"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] transition-colors disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-green-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[#6b7c6b]">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 border-2 border-green-200 text-[#1a2e1a] rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <Chrome className="w-5 h-5" />
                Sign in with Google
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#6b7c6b]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-[#2d5f2e] hover:text-[#1a2e1a]">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] items-center justify-center p-12">
        <div className="max-w-md text-white">
          <img
            src="https://images.unsplash.com/photo-1714894695939-beff8548022f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjb2NvbnV0JTIwdHJlZSUyMGRpc2Vhc2UlMjBhZ3JpY3VsdHVyZXxlbnwxfHx8fDE3Nzg2MTYzNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Coconut farming"
            className="rounded-2xl mb-8 opacity-80"
          />
          <h2 className="text-3xl mb-4">AI-Powered Coconut Farming</h2>
          <p className="text-green-100 text-lg">
            Join thousands of Sri Lankan farmers using advanced technology to protect their coconut plantations and maximize yields.
          </p>
        </div>
      </div>
    </div>
  )
}
