import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import loginLogo from "@/imports/login-logo.png";
import { useState } from "react";
import { motion } from "motion/react";
import { useAuth, getRoleHomePath } from "@/contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login({ username, password });
      navigate(getRoleHomePath(user.role));
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setError(message ?? "Invalid NIC number or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            Login
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600"
          >
            Welcome back to CocoCare
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
              <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">NIC Number</label>
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] hover:shadow-md"
                  placeholder="Enter your NIC number"
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">Password</label>
              <motion.div 
                className="relative"
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] pr-12 hover:shadow-md"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
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
              <div className="text-right mt-2">
                <motion.a 
                  whileHover={{ x: 3 }}
                  href="#" 
                  className="text-sm text-gray-500 hover:text-[#2d5016] transition-colors inline-block"
                >
                  Forgot password?
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { scale: 1.02, boxShadow: "0 10px 30px rgba(45, 80, 22, 0.3)" }}
                whileTap={loading ? undefined : { scale: 0.98 }}
                className="w-full py-4 bg-[#2d5016] text-white rounded-full font-bold text-lg hover:bg-[#1a2e1a] transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Login"
                )}
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="border-t-2 border-gray-200 my-8"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-[#1a2e1a]">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="font-bold text-[#2d5016] hover:text-[#1a2e1a] transition-colors underline"
                >
                  Create an account
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
