import { Link } from "react-router";
import { Sprout, Brain, Map, MessageSquare, Bell, CheckCircle, Users, Target, Award } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      <nav className="border-b border-green-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sprout className="w-8 h-8 text-[#2d5f2e]" />
              <span className="text-xl font-semibold text-[#2d5f2e]">Coco Care</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-[#2d5f2e] hover:text-[#1a2e1a] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1744358399532-9769248a6d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjb2NvbnV0JTIwZmFybSUyMHBsYW50YXRpb258ZW58MXx8fHwxNzc4NjE2MzY2fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Coconut plantation"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#1a2e1a] mb-6">
              AI Powered Coconut Farmer Supporting System
            </h1>
            <p className="text-lg sm:text-xl text-[#6b7c6b] mb-8">
              Helping coconut farmers detect diseases, monitor risks, and improve plantation management using Artificial Intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="px-8 py-3 border-2 border-[#2d5f2e] text-[#2d5f2e] rounded-lg hover:bg-[#2d5f2e] hover:text-white transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl text-[#1a2e1a] mb-4">Platform Features</h2>
            <p className="text-lg text-[#6b7c6b]">Advanced AI-powered tools for modern coconut farming</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Brain className="w-10 h-10 text-[#2d5f2e]" />}
              title="AI Disease Diagnosis"
              description="Upload coconut leaf images for instant disease detection and treatment recommendations using advanced AI technology."
            />
            <FeatureCard
              icon={<MessageSquare className="w-10 h-10 text-[#8b6f47]" />}
              title="Knowledge Chatbot"
              description="Get instant answers to farming questions from our AI assistant trained on agricultural best practices."
            />
            <FeatureCard
              icon={<Map className="w-10 h-10 text-[#2d5f2e]" />}
              title="Disease Heatmap"
              description="Monitor disease spread across Sri Lanka with real-time heatmaps and outbreak alerts in your area."
            />
            <FeatureCard
              icon={<Bell className="w-10 h-10 text-[#8b6f47]" />}
              title="Farmer Alerts"
              description="Stay informed with timely notifications about disease outbreaks, weather warnings, and care reminders."
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl mb-4">Platform Statistics</h2>
            <p className="text-lg text-green-100">Making a real impact for Sri Lankan coconut farmers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard icon={<Users />} value="10,000+" label="Farmers Registered" />
            <StatCard icon={<CheckCircle />} value="25,000+" label="Diseases Detected" />
            <StatCard icon={<Target />} value="150+" label="Risk Areas Monitored" />
            <StatCard icon={<Award />} value="95%" label="AI Accuracy" />
          </div>
        </div>
      </section>

      <footer className="bg-[#1a2e1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-6 h-6" />
                <span className="text-lg font-semibold">Coco Care</span>
              </div>
              <p className="text-green-200 text-sm">
                AI-powered coconut farming support platform for Sri Lankan farmers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-green-200">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Mission</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-green-200">
                <li><a href="#" className="hover:text-white transition-colors">Agricultural Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Disease Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Best Practices</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-green-200">
                <li>Email: info@cococare.lk</li>
                <li>Phone: +94 11 234 5678</li>
                <li className="flex gap-3 mt-4">
                  <a href="#" className="hover:text-white transition-colors">Facebook</a>
                  <a href="#" className="hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-800 mt-8 pt-8 text-center text-sm text-green-200">
            <p>&copy; 2026 Coco Care. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-gradient-to-br from-white to-green-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl text-[#1a2e1a] mb-2">{title}</h3>
      <p className="text-[#6b7c6b]">{description}</p>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-3xl font-semibold mb-2">{value}</div>
      <div className="text-green-100">{label}</div>
    </div>
  );
}
