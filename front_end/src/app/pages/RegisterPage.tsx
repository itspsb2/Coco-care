import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../imports/image-3.png";
import { useState } from "react";
import { motion } from "motion/react";
import { useAuth, getRoleHomePath } from "@/contexts/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    mobile: "",
    district: "",
    plantationSize: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await register({
      role: "farmer",
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
          acreage: 3,
          treeCount: 150,
        },
      ],
    });
    navigate(getRoleHomePath(user.role));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,80,22,0.08),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(244,164,96,0.08),_transparent_35%)]" />

      {/* Main content */}
      <div className="w-full max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link to="/">
                <img
                  src={logo}
                  alt="CocoCare"
                  className="h-20 w-auto"
                  style={{ 
                    filter: "brightness(0) saturate(100%) invert(21%) sepia(48%) saturate(1200%) hue-rotate(70deg) brightness(95%) contrast(90%)"
                  }}
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
                <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">NIC (Username)</label>
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
                  <option value="Colombo">Colombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Galle">Galle</option>
                  <option value="Matara">Matara</option>
                  <option value="Hambantota">Hambantota</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Puttalam">Puttalam</option>
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
                <motion.div className="relative" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] pr-12 hover:shadow-md"
                    placeholder="Enter password"
                    minLength={6}
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2d5016] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(45, 80, 22, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[#2d5016] text-white rounded-full font-bold text-lg hover:bg-[#1a2e1a] transition-colors shadow-lg mt-2"
              >
                Create Account
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
