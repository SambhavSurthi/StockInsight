import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  BarChart3, 
  FolderKanban,
  Sparkles,
  LineChart,
  ListChecks,
  Search,
  Download,
  Zap,
  ChevronUp,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Home = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('header')) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: Search,
      title: 'Smart Company Search',
      description: 'Search and add companies instantly using Screener.in integration. Find any stock with ease.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Advanced Charts',
      description: 'Multiple chart types: Line, Bar, and Change charts with interactive tooltips and full date formatting.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FolderKanban,
      title: 'Portfolio Management',
      description: 'Organize your investments with categories. Track profit/loss with color-coded visualizations.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Sparkles,
      title: 'Future Analysis',
      description: 'Track potential investments. Move companies to portfolio when ready with one click.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: LineChart,
      title: 'Compare Stocks',
      description: 'Compare 2-3 companies side-by-side with area and bar charts. Save comparisons for later.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: ListChecks,
      title: 'Category System',
      description: 'Create custom categories, assign colors, and organize your investments hierarchically.',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Download,
      title: 'Export Data',
      description: 'Export your portfolio data to CSV format for analysis in Excel or other tools.',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Automatic price updates with smart caching. Refresh data with one click.',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/in/sambhavsurthi/',
      color: 'hover:text-blue-600',
    },
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/SambhavSurthi',
      color: 'hover:text-gray-900 dark:hover:text-gray-100',
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:2300031622cseelge@gmail.com',
      color: 'hover:text-red-600',
    },
    {
      name: 'Portfolio',
      icon: ExternalLink,
      url: 'https://www.sambhavsurthi.in/',
      color: 'hover:text-purple-600',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 lg:px-6 h-16 flex items-center justify-between border-b backdrop-blur-md bg-background/80 sticky top-0 z-50"
      >
        <Link className="flex items-center gap-2" to="/">
          <div className="relative">
            <TrendingUp className="h-7 w-7 text-primary" />
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            StockInsight
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <ThemeToggle />
          <Link 
            className="text-sm font-medium hover:text-primary transition-colors relative group flex items-center h-9" 
            to="/login"
          >
            Login
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 h-9"
            to="/sign-up"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 md:hidden bg-background/95 backdrop-blur-md border-b shadow-lg"
          >
            <div className="flex flex-col px-4 py-3 gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-accent"
              >
                Login
              </Link>
              <Link
                to="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </motion.header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-blue-500/10" />
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
              backgroundSize: '200% 200%',
            }}
          />

          <div className="container relative px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center space-y-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                >
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Automate Your Stock Analysis</span>
                </motion.div>
                
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-purple-600">
                    Master Your Portfolio
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground">
                  Automate daily tracking, compare stocks, and get insights. The mobile-first stock screener for the modern investor.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  className="group inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-105"
                  to="/sign-up"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-input bg-background px-8 text-base font-semibold shadow-sm transition-all hover:bg-accent hover:scale-105"
                  to="/login"
                >
                  Sign In
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-8 mt-12"
              >
                {[
                  { label: 'Features', value: '8+' },
                  { label: 'Chart Types', value: '3' },
                  { label: 'Export', value: 'CSV' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                Powerful Features for
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"> Smart Investors</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to track, analyze, and manage your stock portfolio in one place.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative overflow-hidden rounded-xl bg-card border p-6 shadow-sm transition-all hover:shadow-lg"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20" />
          <div className="container relative px-4 md:px-6 mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center space-y-6"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Transform Your
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"> Investment Strategy?</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Join investors who are already using StockInsight to make smarter decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  className="group inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:scale-105"
                  to="/sign-up"
                >
                  Start using StockInsight
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-input bg-background px-8 text-base font-semibold shadow-sm transition-all hover:bg-accent hover:scale-105"
                  to="/login"
                >
                  Sign In to Account
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 md:px-6 py-8 mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold">© 2025 SAMBHAV SURTHI</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Designed and coded with <span className="text-red-500">❤️</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Connect:</span>
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background transition-all hover:scale-110 hover:border-primary ${link.color}`}
                    aria-label={link.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-110"
            aria-label="Back to top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </footer>
    </div>
  );
};

export default Home;
