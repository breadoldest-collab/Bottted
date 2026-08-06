import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Menu,
  X,
  Bot,
  Sparkles,
  MessageSquare,
  BarChart3,
  Zap,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Globe,
  Layers,
  BrainCircuit,
  FileText,
  Database,
  Rocket,
  Sliders,
  Code,
  LayoutGrid
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: "features",
    label: "Features",
    badge: "Core AI",
    sublinks: [
      {
        icon: MessageSquare,
        title: "AI Chat",
        description: "24/7 autonomous support agent with multi-turn reasoning",
        href: "#features",
      },
      {
        icon: Zap,
        title: "Smart Responses",
        description: "Instant context-aware answers built on Gemini AI",
        href: "#features",
      },
      {
        icon: Globe,
        title: "Multi-language",
        description: "Seamless real-time translation across 50+ languages",
        href: "#features",
      },
      {
        icon: Layers,
        title: "Integrations",
        description: "Connect with Shopify, WordPress, React, & custom APIs",
        href: "#features",
      },
    ],
  },
  {
    id: "analytics",
    label: "AI Analytics",
    badge: "Realtime",
    sublinks: [
      {
        icon: BarChart3,
        title: "Real-time Dashboard",
        description: "Live customer sentiment, traffic, and resolution metrics",
        href: "#analytics",
      },
      {
        icon: BrainCircuit,
        title: "User Insights",
        description: "Neural intent detection & customer topic clustering",
        href: "#analytics",
      },
      {
        icon: FileText,
        title: "Conversation Reports",
        description: "Automated executive summaries without markdown noise",
        href: "#analytics",
      },
      {
        icon: Database,
        title: "Export Data",
        description: "One-click CSV & JSON backups for compliance audits",
        href: "#analytics",
      },
    ],
  },
  {
    id: "embed",
    label: "Widget Embed",
    badge: "1-Min Setup",
    sublinks: [
      {
        icon: Rocket,
        title: "Quick Setup",
        description: "1-minute integration script tag for any website",
        href: "#integration",
      },
      {
        icon: Sliders,
        title: "Customization",
        description: "Tailor colors, themes, bot avatars, and position",
        href: "#integration",
      },
      {
        icon: Code,
        title: "Code Snippet",
        description: "Copy-paste production-ready HTML/JS snippet",
        href: "#integration",
      },
      {
        icon: LayoutGrid,
        title: "Supported Platforms",
        description: "Works on Web, Mobile, React, Next.js, & Vue",
        href: "#integration",
      },
    ],
  },
];

// Inline Button Component (Monochrome Obsidian/Black Theme)
const Button = React.forwardRef(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variants = {
      default: "bg-white text-slate-900 hover:bg-slate-100 border border-slate-300 shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300",
      ghost: "hover:bg-slate-100 text-slate-700 hover:text-black",
      gradient:
        "bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98]",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-9 px-4 text-xs font-semibold",
      lg: "h-12 px-7 text-sm font-semibold",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Navigation Component with Animated Dropdowns & Mobile Drawer
const Navigation = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const timeoutRef = useRef(null);
  const navRef = useRef(null);

  const handleMouseEnter = (id) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleMobileAccordion = (id) => {
    setMobileExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <header ref={navRef} className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl transition-all">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              CX<span className="text-slate-900">Bot</span>
            </span>
          </Link>

          {/* Desktop Links with Framer Motion Dropdowns */}
          <div className="hidden md:flex items-center justify-center gap-2">
            {NAV_ITEMS.map((item) => {
              const isOpen = activeDropdown === item.id;
              return (
                <div
                  key={item.id}
                  className="relative px-2 py-1"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : item.id)}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-all duration-150 rounded-xl px-3.5 py-2 cursor-pointer ${
                      isOpen
                        ? "text-slate-900 bg-slate-100"
                        : "text-slate-700 hover:text-black hover:bg-slate-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-slate-900" : "text-slate-400"
                      }`}
                    />
                  </button>

                  {/* Active Black Underline Highlight */}
                  {isOpen && (
                    <motion.div
                      layoutId="blackUnderline"
                      className="absolute bottom-0 left-5 right-5 h-0.5 bg-slate-900 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Dropdown Menu Container */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className="absolute top-full left-0 mt-2 w-[500px] bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-3 py-2 mb-2 border-b border-slate-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            {item.label}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            {item.badge}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {item.sublinks.map((sub, idx) => {
                            const SubIcon = sub.icon;
                            return (
                              <a
                                key={idx}
                                href={sub.href}
                                onClick={() => setActiveDropdown(null)}
                                className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200"
                              >
                                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-200 shadow-xs shrink-0 mt-0.5">
                                  <SubIcon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-slate-900 group-hover:text-black transition-colors flex items-center gap-1">
                                    {sub.title}
                                  </div>
                                  <p className="text-xs text-slate-500 leading-snug mt-0.5 leading-relaxed font-normal">
                                    {sub.description}
                                  </p>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {localStorage.getItem('token') ? (
              <Link to="/dashboard">
                <Button type="button" variant="gradient" size="sm">
                  Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button type="button" variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button type="button" variant="gradient" size="sm">
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-slate-700 hover:text-black p-2 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Animated Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sliding Sidebar Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] sm:w-[340px] bg-white border-r border-slate-200 shadow-2xl z-50 flex flex-col justify-between p-6 md:hidden overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-200">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                      <Bot className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      CX<span className="text-slate-900">Bot</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Accordion List */}
                <div className="flex flex-col gap-2 mt-5">
                  {NAV_ITEMS.map((item) => {
                    const isExpanded = mobileExpanded === item.id;
                    return (
                      <div key={item.id} className="border-b border-slate-100 pb-2">
                        <button
                          onClick={() => toggleMobileAccordion(item.id)}
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {item.label}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                              {item.badge}
                            </span>
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-slate-900" : "text-slate-400"
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden pl-3 flex flex-col gap-1 mt-1"
                            >
                              {item.sublinks.map((sub, idx) => {
                                const SubIcon = sub.icon;
                                return (
                                  <a
                                    key={idx}
                                    href={sub.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-2 rounded-lg text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                                      <SubIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-xs font-semibold">{sub.title}</span>
                                  </a>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Footer CTAs */}
              <div className="pt-5 border-t border-slate-200 flex flex-col gap-3">
                {localStorage.getItem('token') ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button type="button" variant="gradient" size="sm" className="w-full justify-center">
                      Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button type="button" variant="ghost" size="sm" className="w-full justify-center">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button type="button" variant="gradient" size="sm" className="w-full justify-center">
                        Get Started <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
});

Navigation.displayName = "Navigation";

// Hero Component (Strict Monochrome Black & Slate Gray)
const Hero = React.memo(() => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-6 pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-50">
      {/* Pill Announcement Badge */}
      <aside className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-300 bg-white shadow-xs">
        <Sparkles className="h-3.5 w-3.5 text-slate-800" />
        <span className="text-xs font-semibold text-slate-900">
          Powered by Gemini AI Neural Reasoning
        </span>
        <Link
          to={localStorage.getItem('token') ? '/dashboard' : '/register'}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-black transition-all ml-1"
        >
          Explore Live <ArrowRight className="h-3 w-3" />
        </Link>
      </aside>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center max-w-4xl px-4 leading-[1.1] mb-6 tracking-tight text-slate-900">
        Give your business <br />
        the <span className="text-slate-900">AI Support</span> it deserves
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-center max-w-2xl px-4 mb-10 text-slate-600 leading-relaxed font-normal">
        Embed 24/7 intelligent customer support widgets in seconds. Automated FAQ resolution, live session monitoring, and real-time executive summaries.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 mb-16">
        <Link to={localStorage.getItem('token') ? '/dashboard' : '/register'}>
          <Button type="button" variant="gradient" size="lg">
            {localStorage.getItem('token') ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/support/6a738d01f9168dfcbc149363">
          <Button type="button" variant="default" size="lg">
            <MessageSquare className="h-4 w-4 text-slate-900" /> Live Chat Demo
          </Button>
        </Link>
      </div>

      {/* Crisp Light Theme Dashboard Preview Card */}
      <div className="w-full max-w-5xl relative">
        <div className="relative z-10 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 mb-3 bg-slate-50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="w-3 h-3 rounded-full bg-slate-200" />
              <span className="ml-2 text-xs font-mono text-slate-500">cxbot-admin.app/dashboard</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Live Production
            </span>
          </div>

          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
            alt="CXBot AI Support Dashboard Preview"
            className="w-full h-auto rounded-xl border border-slate-100 shadow-sm"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

// Main Export Component
export default function SaaSLandingTemplate() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <Navigation />
      <Hero />
    </main>
  );
}
