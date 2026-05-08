import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, Target, Zap, ChevronRight, Heart, Brain as BrainIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">FitAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link to="/auth" className="hover:text-white transition-colors">Workouts</Link>
          <Link to="/auth" className="hover:text-white transition-colors">Nutrition</Link>
          <Link to="/auth" className="hover:text-white transition-colors">Community</Link>
        </div>
        <Link to="/auth" className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:bg-indigo-50 transition-all active:scale-95 shadow-xl">
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-xl">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-300">Next-Gen Fitness Intelligence</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 tracking-tighter">
              EVOLVE <br />
              <span className="text-indigo-500">YOURSELF</span> <br />
              WITH AI.
            </h1>
            <p className="text-lg text-gray-400 max-w-md mb-12 leading-relaxed">
              Personalized workout plans, real-time posture correction, and nutrition tracking powered by advanced neural networks.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth" className="px-10 py-5 bg-indigo-600 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 group">
                Start Training <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold backdrop-blur-xl hover:bg-white/10 transition-all">
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[50px] overflow-hidden border border-white/10 shadow-2xl bg-[#121214]">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
                alt="Fitness Athlete" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent"></div>
            </div>
            <div className="absolute -inset-4 bg-indigo-600/20 blur-[60px] -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 border-t border-white/5">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">FitAI</span>
          </div>
          <p className="text-gray-500 text-xs font-medium">© 2026 FITAI INTELLIGENCE SYSTEMS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
