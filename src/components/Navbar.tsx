import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { notificationManager } from '../lib/notifications';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      notificationManager.success("Welcome to 3RD WAY FITNESS!");
    } catch (error) {
      console.error(error);
      notificationManager.error("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      notificationManager.success("You've logged out successfully.");
      navigate('/');
    } catch (error) {
      console.error(error);
      notificationManager.error("Logout failed.");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                3RD <span className="text-brand group-hover:text-white transition-colors">WAY</span> FITNESS
              </span>
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-10">
              <Link to="/" className="text-white hover:text-brand transition-colors px-3 py-2 text-[13px] font-black uppercase tracking-widest">Home</Link>
              <Link to="/merchandise" className="text-white hover:text-brand transition-colors px-3 py-2 text-[13px] font-black uppercase tracking-widest">Armory</Link>
              {user && (
                <Link to="/dashboard" className="text-white hover:text-brand transition-colors px-3 py-2 text-[13px] font-black uppercase tracking-widest">Dashboard</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-brand hover:text-white transition-colors flex items-center gap-1 px-3 py-2 text-[13px] font-black uppercase tracking-widest">
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-brand/50" referrerPolicy="no-referrer" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{user.displayName?.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="p-2 text-zinc-400 hover:text-brand transition-colors" title="View Profile">
                    <User size={18} />
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="premium-button"
              >
                JOIN THE TRIBE
              </button>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-zinc-950 border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              <Link to="/" onClick={() => setIsOpen(false)} className="block text-sm font-black uppercase tracking-widest hover:text-brand">Home</Link>
              <Link to="/merchandise" onClick={() => setIsOpen(false)} className="block text-sm font-black uppercase tracking-widest hover:text-brand">Armory</Link>
              {user && <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-sm font-black uppercase tracking-widest hover:text-brand">My Training</Link>}
              {user && <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-sm font-black uppercase tracking-widest hover:text-brand">Profile</Link>}
              {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-sm font-black uppercase tracking-widest text-brand">Admin Panel</Link>}
              <div className="pt-6 border-t border-white/5">
                {!user ? (
                  <button onClick={handleLogin} className="w-full text-center bg-brand text-white py-4 font-black uppercase text-xs tracking-widest">Login / Join</button>
                ) : (
                  <button onClick={handleLogout} className="w-full text-left font-black uppercase text-xs tracking-widest text-red-500">Sign Out</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
