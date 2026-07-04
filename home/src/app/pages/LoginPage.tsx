import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../imports/image-3.png";
import { useState } from "react";
import { motion } from "motion/react";

const PALM_LEAF = "https://images.unsplash.com/photo-1568587672698-565c855c355c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwcGFsbSUyMGxlYWYlMjB0cm9waWNhbHxlbnwxfHx8fDE3ODMxNTExMTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const COCONUT_TREE = "https://images.unsplash.com/photo-1682111992542-14d9c39398a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwdHJlZSUyMGlsbHVzdHJhdGlvbiUyMG1pbmltYWx8ZW58MXx8fHwxNzgzMTUxMzI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const COCONUT_FRUIT = "https://images.unsplash.com/photo-1560769680-ba2f3767c785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwZnJ1aXQlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzgzMTUxMzMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const GREEN_LEAF = "https://images.unsplash.com/photo-1585328000852-779be6a6582b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGxlYWYlMjBwYXR0ZXJuJTIwbWluaW1hbHxlbnwxfHx8fDE3ODMxNTEzMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative palm leaves - top right */}
      <motion.div 
        initial={{ opacity: 0, x: 100, rotate: 0 }}
        animate={{ opacity: 1, x: 0, rotate: -15 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute -top-20 -right-20 w-[500px] h-[500px] pointer-events-none hidden lg:block"
      >
        <motion.img 
          animate={{ 
            rotate: [-15, -12, -15],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          src={PALM_LEAF} 
          alt="" 
          className="w-full h-full object-cover opacity-30"
          style={{ transform: "scaleX(-1)" }}
        />
      </motion.div>

      {/* Decorative palm leaves - bottom left */}
      <motion.div 
        initial={{ opacity: 0, x: -100, rotate: 0 }}
        animate={{ opacity: 1, x: 0, rotate: 15 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        className="absolute -bottom-20 -left-20 w-96 h-96 pointer-events-none hidden lg:block"
      >
        <motion.img 
          animate={{ 
            rotate: [15, 18, 15],
            y: [0, 10, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          src={PALM_LEAF} 
          alt="" 
          className="w-full h-full object-cover opacity-25"
          style={{ transform: "rotate(180deg)" }}
        />
      </motion.div>

      {/* Floating coconuts - decorative elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-32 left-12 w-20 h-20 pointer-events-none hidden xl:block"
      >
        <motion.img
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          src={COCONUT_FRUIT}
          alt=""
          className="w-full h-full object-contain opacity-40"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="absolute bottom-40 right-16 w-24 h-24 pointer-events-none hidden xl:block"
      >
        <motion.img
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          src={COCONUT_FRUIT}
          alt=""
          className="w-full h-full object-contain opacity-35"
        />
      </motion.div>

      {/* Green leaf pattern - subtle background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none hidden lg:block"
      >
        <motion.img
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          src={GREEN_LEAF}
          alt=""
          className="w-full h-full object-cover opacity-5"
        />
      </motion.div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
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
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <img
                src={logo}
                alt="CocoCare"
                className="h-20 w-auto"
                style={{ 
                  filter: "brightness(0) saturate(100%) invert(21%) sepia(48%) saturate(1200%) hue-rotate(70deg) brightness(95%) contrast(90%)"
                }}
              />
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label className="block text-sm font-bold mb-3 text-[#1a2e1a]">Email</label>
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-[#1a2e1a] rounded-full focus:outline-none focus:border-[#2d5016] transition-all bg-white text-[#1a2e1a] hover:shadow-md"
                  placeholder="Enter your email"
                  required
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
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(45, 80, 22, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[#2d5016] text-white rounded-full font-bold text-lg hover:bg-[#1a2e1a] transition-colors shadow-lg"
              >
                Login
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
