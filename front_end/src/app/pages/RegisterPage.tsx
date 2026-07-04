import { Link, useNavigate } from 'react-router'
import { Sprout, User, CreditCard, Phone, MapPin, Home, Lock, Chrome } from 'lucide-react'
import { useState } from 'react'
import { useAuth, getRoleHomePath } from '@/contexts/AuthContext'

const PLANTATION_DEFAULTS: Record<string, { acreage: number; treeCount: number }> = {
  small: { acreage: 0.5, treeCount: 50 },
  medium: { acreage: 3, treeCount: 150 },
  large: { acreage: 10, treeCount: 400 },
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    nic: '',
    mobile: '',
    district: '',
    plantationSize: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const size = PLANTATION_DEFAULTS[formData.plantationSize] ?? PLANTATION_DEFAULTS.medium

    setSubmitting(true)
    try {
      const user = await register({
        role: 'farmer',
        username: formData.nic,
        name: formData.fullName,
        phone: formData.mobile,
        password: formData.password,
        farms: [
          {
            name: `${formData.fullName}'s Plantation`,
            location: formData.district,
            latitude: 7.4818,
            longitude: 80.365,
            acreage: size.acreage,
            treeCount: size.treeCount,
          },
        ],
      })
      navigate(getRoleHomePath(user.role))
    } catch {
      setError('Registration failed. Please check your details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Sprout className="w-10 h-10 text-[#2d5f2e]" />
            <span className="text-2xl font-semibold text-[#2d5f2e]">Coco Care</span>
          </Link>
          <h1 className="text-3xl text-[#1a2e1a] mb-2">Create Your Account</h1>
          <p className="text-[#6b7c6b]">Join the AI-powered coconut farming revolution</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm mb-2 text-[#1a2e1a]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white"
                  placeholder="Nimal Perera"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">NIC (Username)</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white"
                    placeholder="199012345678"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white"
                    placeholder="077 123 4567"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">District</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white appearance-none"
                    required
                  >
                    <option value="">Select District</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Hambantota">Hambantota</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Puttalam">Puttalam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">Plantation Size</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <select
                    name="plantationSize"
                    value={formData.plantationSize}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white appearance-none"
                    required
                  >
                    <option value="">Select Size</option>
                    <option value="small">Small (&lt; 1 acre)</option>
                    <option value="medium">Medium (1-5 acres)</option>
                    <option value="large">Large (&gt; 5 acres)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b7c6b]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2d5f2e] hover:text-[#1a2e1a]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
