import { Link, useNavigate } from "react-router";
import { Sprout, Mail, Lock, Chrome } from "lucide-react";
import { useState } from "react";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-green-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sprout className="w-10 h-10 text-[#2d5f2e]" />
              <span className="text-2xl font-semibold text-[#2d5f2e]">Coco Care</span>
            </div>
            <h1 className="text-3xl text-[#1a2e1a] mb-2">Welcome Back</h1>
            <p className="text-[#6b7c6b]">Sign in to access your farming dashboard</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm mb-2 text-[#1a2e1a]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7c6b]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white"
                    placeholder="farmer@example.com"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-green-300 text-[#2d5f2e] focus:ring-[#2d5f2e]" />
                  <span className="text-sm text-[#6b7c6b]">Remember me</span>
                </label>
                <a href="#" className="text-sm text-[#2d5f2e] hover:text-[#1a2e1a]">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] transition-colors"
              >
                Sign In
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
              Don't have an account?{" "}
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
  );
}
