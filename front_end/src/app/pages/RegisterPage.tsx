import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import loginLogo from "@/imports/login-logo.png";
import { useState } from "react";
import { motion } from "motion/react";
import { useAuth, getRoleHomePath } from "@/contexts/AuthContext";
import { SRI_LANKA_DISTRICTS } from '@/constants/districts'

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    mobile: "",
    email: "",
    district: "",
    plantationSize: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const emailTrimmed = formData.email.trim();
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({
        role: "farmer",
        username: formData.nic.trim(),
        name: formData.fullName.trim(),
        phone: formData.mobile.trim(),
        password: formData.password,
        ...(emailTrimmed ? { email: emailTrimmed } : {}),
      });
      navigate(getRoleHomePath(user.role));
    } catch {
      setError("Registration failed. That username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                <img
                  src={loginLogo}
                  alt="Coco Care"
                  className="h-12 w-auto max-w-[200px] object-contain mx-auto"
                />
              </Link>
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-5xl font-bold text-[#1a2e1a] mb-3"
          >
            Create Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600"
          >
            Join the CocoCare community today
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
                {error}
              </div>
            ) : null}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">Full Name</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] hover:shadow-md"
                placeholder="Enter your full name"
                required
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">NIC</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] hover:shadow-md"
                  placeholder="199012345678"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">Mobile Number</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] hover:shadow-md"
                  placeholder="077 123 4567"
                  required
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
            >
              <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">
                Email{" "}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] hover:shadow-md"
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">District</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] appearance-none cursor-pointer hover:shadow-md"
                  required
                >
                  <option value="">Select District</option>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </motion.select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">Plantation Size</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  name="plantationSize"
                  value={formData.plantationSize}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] appearance-none cursor-pointer hover:shadow-md"
                  required
                >
                  <option value="">Select Size</option>
                  <option value="small">Small (&lt; 1 acre)</option>
                  <option value="medium">Medium (1-5 acres)</option>
                  <option value="large">Large (&gt; 5 acres)</option>
                </motion.select>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">Password</label>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] pr-12 hover:shadow-md"
                    placeholder="Enter password"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2d5016] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">Confirm Password</label>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] pr-12 hover:shadow-md"
                    placeholder="Confirm password"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2d5016] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { scale: 1.02, boxShadow: "0 10px 30px rgba(45, 80, 22, 0.3)" }}
                whileTap={loading ? undefined : { scale: 0.98 }}
                className="w-full py-4 bg-[#2d5016] text-white rounded-full font-bold text-lg hover:bg-[#1a2e1a] transition-colors shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="border-t-2 border-gray-200 my-8"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-[#1a2e1a]">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-bold text-[#2d5016] hover:text-[#1a2e1a] transition-colors underline"
                >
                  Login
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
