import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Scan,
  MessageSquare,
  Map,
  Bell,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Star,
  Check,
  Users,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import logo from "../../imports/image-3.png";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1590487527083-c8236d53dea0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjb2NvbnV0JTIwcGFsbSUyMHBsYW50YXRpb24lMjB0cm9waWNhbCUyMFNyaSUyMExhbmthfGVufDF8fHx8MTc4MzE0NTY4NHww&ixlib=rb-4.1.0&q=80&w=1920";
const LEAF_IMAGE =
  "https://images.unsplash.com/photo-1759579726616-8205b10f59c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjb2NvbnV0JTIwbGVhZiUyMGRpc2Vhc2UlMjBkZXRlY3Rpb24lMjBjbG9zZSUyMHVwfGVufDF8fHx8MTc4MzE0NTY4OHww&ixlib=rb-4.1.0&q=80&w=1080";
const PALM_IMAGE =
  "https://images.unsplash.com/photo-1657811763824-8f42e2d5c657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxjb2NvbnV0JTIwcGFsbSUyMHBsYW50YXRpb24lMjB0cm9waWNhbCUyMFNyaSUyMExhbmthfGVufDF8fHx8MTc4MzE0NTY4NHww&ixlib=rb-4.1.0&q=80&w=1080";
const FIELD_IMAGE =
  "https://images.unsplash.com/photo-1678078476300-aa5291ea8c41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjb2NvbnV0JTIwcGFsbSUyMHBsYW50YXRpb24lMjB0cm9waWNhbCUyMFNyaSUyMExhbmthfGVufDF8fHx8MTc4MzE0NTY4NHww&ixlib=rb-4.1.0&q=80&w=1080";

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature((p) => (p + 1) % features.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen overflow-x-hidden bg-white">

      {/* ── NAV ── */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-green-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="CocoCare"
              className="h-9 w-auto"
              style={{ 
                mixBlendMode: scrolled ? "multiply" : "screen",
                filter: scrolled 
                  ? "brightness(0) saturate(100%) invert(21%) sepia(48%) saturate(1200%) hue-rotate(70deg) brightness(95%) contrast(90%)" 
                  : "brightness(0) invert(1)"
              }}
            />
          </div>

          <div className="hidden md:flex items-center gap-7">
            {[["Features", "#features"], ["How It Works", "#how-it-works"], ["About", "#about"]].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${scrolled ? "text-[#2d5016]" : "text-white/90"}`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${scrolled ? "text-[#2d5016] hover:bg-green-50" : "text-white/85 hover:text-white"}`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold px-5 py-2.5 bg-[#f4a460] text-[#1a2e0a] rounded-xl hover:bg-[#e8935a] transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen
              ? <X size={22} className={scrolled ? "text-[#2d5016]" : "text-white"} />
              : <Menu size={22} className={scrolled ? "text-[#2d5016]" : "text-white"} />
            }
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-green-100 px-5 py-4 space-y-3 shadow-md">
            {[["Features", "#features"], ["How It Works", "#how-it-works"], ["About", "#about"]].map(([label, href]) => (
              <a key={label} href={href} className="block text-sm text-[#2d5016] font-medium py-1.5" onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center text-sm py-2.5 border border-[#2d5016] text-[#2d5016] rounded-xl">Sign In</Link>
              <Link to="/register" className="flex-1 text-center text-sm py-2.5 bg-[#2d5016] text-white rounded-xl font-bold">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[640px] flex items-center overflow-hidden">
        <img src={HERO_IMAGE} alt="Coconut plantation" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f05]/88 via-[#1a3d0a]/75 to-[#2d5016]/50" />
        {/* Bottom wave */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C320,72 960,8 1440,40 L1440,72 L0,72 Z" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 w-full pt-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-sm border border-white/22 rounded-full px-4 py-1.5 mb-7"
            >
              <span className="w-2 h-2 rounded-full bg-[#f4a460] animate-pulse" />
              <span className="text-white/88 text-xs font-medium tracking-wide">AI-Powered Coconut Farming Platform · Sri Lanka</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-white mb-5 leading-tight"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "clamp(2.6rem, 5.5vw, 4rem)",
                lineHeight: 1.1,
              }}
            >
              AI Powered Coconut
              <br />
              <span style={{ color: "#f4a460" }}>Farmer Supporting</span>
              <br />
              System
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="text-white/68 text-lg leading-relaxed mb-9 max-w-lg"
            >
              Helping coconut farmers detect diseases, monitor risks, and improve
              plantation management using Artificial Intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#f4a460] text-[#1a2e0a] rounded-xl font-bold text-sm hover:bg-[#e8935a] transition-all shadow-xl hover:-translate-y-0.5"
              >
                Get Started <ArrowRight size={15} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/28 text-white rounded-xl font-medium text-sm hover:bg-white/18 transition-all backdrop-blur-sm"
              >
                Learn More
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.52 }}
              className="flex items-center gap-5 mt-10"
            >
              <div className="flex -space-x-2">
                {["#4a7c2e", "#7ab348", "#2d5016", "#f4a460"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: c }}>
                    {["P", "A", "K", "S"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-[#f4a460] text-[#f4a460]" />)}
                </div>
                <p className="text-white/60 text-xs">Trusted by 10,000+ Sri Lankan farmers</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-white border-b border-green-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-green-100">
            {[
              { icon: <Users size={18} />, value: "10,000+", label: "Farmers Registered" },
              { icon: <TrendingUp size={18} />, value: "25,000+", label: "Diseases Detected" },
              { icon: <Award size={18} />, value: "95%", label: "AI Accuracy Rate" },
              { icon: <Target size={18} />, value: "150+", label: "Risk Zones Monitored" },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.08} className="text-center px-4">
                <div className="flex justify-center mb-2 text-[#2d5016]">{s.icon}</div>
                <div className="text-3xl font-bold text-[#2d5016] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>{s.value}</div>
                <div className="text-xs text-[#6b7c6b]">{s.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-[#f8faf6]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block bg-green-100 text-[#2d5016] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
              Platform Features
            </span>
            <h2
              className="text-[#1a2e0a] mb-3"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.875rem, 3vw, 2.6rem)", lineHeight: 1.15 }}
            >
              Everything you need to grow
            </h2>
            <p className="text-[#6b7c6b] max-w-md mx-auto text-sm">
              Advanced AI tools purpose-built for coconut farming challenges in Sri Lanka.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.07}>
                <FeatureCard {...feat} active={activeFeature === i} onClick={() => setActiveFeature(i)} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Image collage */}
            <FadeIn className="relative h-[480px]">
              <img
                src={PALM_IMAGE}
                alt="Coconut palm"
                className="absolute top-0 left-0 w-64 h-80 object-cover rounded-3xl shadow-2xl"
              />
              <img
                src={LEAF_IMAGE}
                alt="Leaf analysis"
                className="absolute bottom-0 right-0 w-56 h-64 object-cover rounded-3xl shadow-xl border-4 border-white"
              />
              {/* Floating AI result card */}
              <div className="absolute top-[46%] left-[34%] bg-white rounded-2xl shadow-2xl p-4 border border-green-100 min-w-[176px]">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                    <Check size={16} className="text-[#2d5016]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6b7c6b]">AI Diagnosis</div>
                    <div className="text-xs font-bold text-[#1a2e0a]">Bud Rot Detected</div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-green-100 overflow-hidden">
                  <div className="h-full w-[92%] bg-[#2d5016] rounded-full" />
                </div>
                <div className="text-right text-[10px] text-[#2d5016] font-bold mt-0.5">92% confidence</div>
              </div>
            </FadeIn>

            {/* Steps */}
            <div>
              <FadeIn>
                <span className="inline-block bg-amber-100 text-[#8b4513] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
                  How It Works
                </span>
                <h2
                  className="text-[#1a2e0a] mb-8"
                  style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.4rem)", lineHeight: 1.18 }}
                >
                  Three steps to smarter
                  <br />
                  coconut farming
                </h2>
              </FadeIn>

              <div className="space-y-7">
                {steps.map((step, i) => (
                  <FadeIn key={step.title} delay={i * 0.1}>
                    <div className="flex gap-5">
                      <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#2d5016] text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1a2e0a] mb-1 text-base">{step.title}</h3>
                        <p className="text-sm text-[#6b7c6b] leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.35}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 mt-9 px-6 py-3.5 bg-[#2d5016] text-white rounded-xl font-bold text-sm hover:bg-[#1a3a10] transition-all shadow-md hover:shadow-lg"
                >
                  Start Free Today <ChevronRight size={15} />
                </Link>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="about"
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1f05 0%, #2d5016 65%, #3d6b22 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${FIELD_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block bg-white/12 text-white/80 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
              Farmer Stories
            </span>
            <h2
              className="text-white mb-3"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.875rem, 3vw, 2.6rem)" }}
            >
              Farmers love CocoCare
            </h2>
            <p className="text-green-200/70 max-w-md mx-auto text-sm">
              From Kurunegala to Chilaw, farmers are protecting their harvests with AI-powered insights.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="bg-white/8 backdrop-blur-sm border border-white/14 rounded-3xl p-7">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={13} className="fill-[#f4a460] text-[#f4a460]" />)}
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: t.color }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{t.name}</div>
                      <div className="text-green-300/60 text-xs">{t.location}, Sri Lanka</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[#f8faf6]">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <FadeIn>
            <span className="inline-block bg-amber-100 text-[#8b4513] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
              Free to Join
            </span>
            <h2
              className="text-[#1a2e0a] mb-4"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 3rem)", lineHeight: 1.12 }}
            >
              Ready to transform
              <br />
              your plantation?
            </h2>
            <p className="text-[#6b7c6b] mb-9 max-w-sm mx-auto text-sm">
              Join thousands of coconut farmers already growing smarter with AI. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#2d5016] text-white rounded-xl font-bold text-sm hover:bg-[#1a3a10] transition-all shadow-xl hover:-translate-y-0.5"
              >
                Create Free Account <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 border-2 border-[#2d5016] text-[#2d5016] rounded-xl font-semibold text-sm hover:bg-green-50 transition-all"
              >
                Sign In
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0f2208] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="mb-4">
                <img
                  src={logo}
                  alt="CocoCare"
                  className="h-10 w-auto"
                  style={{ 
                    mixBlendMode: "screen",
                    filter: "brightness(0) invert(1)"
                  }}
                />
              </div>
              <p className="text-green-300/55 text-sm leading-relaxed">
                AI-powered coconut farming support platform for Sri Lankan farmers.
              </p>
            </div>
            {[
              {
                title: "Platform",
                links: [
                  { label: "Disease Detection", href: "#features" },
                  { label: "AI Chatbot", href: "#features" },
                  { label: "Disease Heatmap", href: "#features" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { label: "Best Practices", href: "#how-it-works" },
                  { label: "Get Started", href: "/register" },
                  { label: "Sign In", href: "/login" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About Us", href: "#about" },
                  { label: "Our Mission", href: "#about" },
                  { label: "Contact", href: "mailto:hello@cococare.lk" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-green-400/60 mb-4">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-green-300/55 hover:text-white transition-colors">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-green-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-green-500/50">&copy; 2026 CocoCare. All rights reserved.</p>
            <p className="text-xs text-green-600/40">Made with care for Sri Lankan farmers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Scan className="w-6 h-6" />,
    iconColor: "#2d5016",
    iconBg: "#e8f5e0",
    title: "AI Disease Diagnosis",
    description: "Upload a coconut leaf photo for instant disease detection and personalised treatment recommendations using deep learning.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    iconColor: "#8b4513",
    iconBg: "#fdf0e6",
    title: "Knowledge Chatbot",
    description: "Ask anything in Sinhala or English. Our AI assistant trained on Sri Lankan agricultural practices answers 24/7.",
  },
  {
    icon: <Map className="w-6 h-6" />,
    iconColor: "#1565c0",
    iconBg: "#e3f2fd",
    title: "Disease Heatmap",
    description: "Visualise active outbreaks across Sri Lanka in real-time and receive early warnings before they reach your district.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    iconColor: "#e65100",
    iconBg: "#fff3e0",
    title: "Smart Alerts",
    description: "Timely push notifications about disease outbreaks, weather risks, and seasonal care reminders tailored to your farm.",
  },
];

const steps = [
  {
    title: "Create your farm profile",
    description: "Enter your plantation details — location, tree count, soil type, and tree age — and let CocoCare personalise everything for you.",
  },
  {
    title: "Diagnose & monitor",
    description: "Upload coconut leaf images for instant AI diagnosis, or browse the live disease heatmap to stay ahead of local outbreaks.",
  },
  {
    title: "Act on AI recommendations",
    description: "Follow personalised treatment plans, fertilizer schedules, and alerts to protect your harvest and grow with confidence.",
  },
];

const testimonials = [
  {
    name: "Priya Perera",
    location: "Kurunegala",
    quote: "I caught bud rot two weeks before my neighbour noticed it. The AI scan saved nearly a quarter of my harvest this season.",
    color: "#2d5016",
  },
  {
    name: "Ajith Bandara",
    location: "Chilaw",
    quote: "The fertilizer planner cut my input costs by 20%. Recommendations are spot-on for my coastal sandy soil conditions.",
    color: "#8b4513",
  },
  {
    name: "Kumari Silva",
    location: "Gampaha",
    quote: "Being able to ask the chatbot in Sinhala is a game changer. Finally, technology that speaks my language.",
    color: "#1565c0",
  },
];

// ── FeatureCard ───────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  iconColor,
  iconBg,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 ${
        active
          ? "bg-white shadow-xl border-green-200 -translate-y-1"
          : "bg-white/50 border-transparent hover:bg-white hover:shadow-md"
      }`}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-[#1a2e0a] mb-2 text-base">{title}</h3>
      <p className="text-sm text-[#6b7c6b] leading-relaxed">{description}</p>
      <div
        className="mt-4 flex items-center gap-1 text-xs font-semibold"
        style={{ color: iconColor }}
      >
        Learn more <ChevronRight size={12} />
      </div>
    </div>
  );
}
