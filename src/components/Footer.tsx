import React from 'react';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#101010] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo & Info */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-4 group">
              <img src="/assets/svc/logo.jpeg" alt="3RD WAY FITNESS" className="w-12 h-12 object-cover rounded-sm border border-brand/30" />
              <span className="text-3xl font-black tracking-tighter text-white uppercase italic">
                3RD <span className="text-brand group-hover:text-white transition-colors">WAY</span> FITNESS
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Elevating the Kenyan fitness landscape through rigorous training, 
              community spirit, and the "3rd Way" philosophy. Where health, beauty and fitness meet.
            </p>
            <div className="flex gap-3">
              <SocialLink icon={<Facebook size={18} />} href="#" />
              <SocialLink icon={<Twitter size={18} />} href="#" />
              <SocialLink icon={<Instagram size={18} />} href="#" />
              <SocialLink icon={<Mail size={18} />} href="mailto:Malemocaleb730@gmail.com" />
            </div>
          </div>

          {/* Useful Links */}
          <div className="lg:pl-8">
            <h4 className="text-white font-black uppercase italic mb-8 tracking-widest text-sm">Useful Links</h4>
            <ul className="space-y-4 text-zinc-500 text-sm font-medium">
              <li><a href="#about" className="hover:text-brand transition-colors italic">About Us</a></li>
              <li><Link to="/merchandise" className="hover:text-brand transition-colors italic">Armory (Merch)</Link></li>
              <li><a href="#services" className="hover:text-brand transition-colors italic">Our Services</a></li>
              <li><a href="#contact" className="hover:text-brand transition-colors italic">Contact Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-black uppercase italic mb-8 tracking-widest text-sm">Support</h4>
            <ul className="space-y-4 text-zinc-500 text-sm font-medium">
              <li><Link to="/dashboard" className="hover:text-brand transition-colors italic">Training Dashboard</Link></li>
              <li><Link to="/profile" className="hover:text-brand transition-colors italic">My Account</Link></li>
              <li><a href="#" className="hover:text-brand transition-colors italic">Privacy Policy</a></li>
              <li className="flex items-center gap-2 text-zinc-400 font-bold italic mt-6">
                <Phone size={14} className="text-brand" /> +254 795 545401
              </li>
            </ul>
          </div>

          {/* Newsletter / Tips */}
          <div>
            <h4 className="text-white font-black uppercase italic mb-8 tracking-widest text-sm">Tips & Guides</h4>
            <div className="space-y-6">
              <div className="group cursor-pointer">
                <p className="text-white text-sm font-bold leading-snug group-hover:text-brand transition-colors mb-2 italic">Physical fitness may help prevent depression, anxiety</p>
                <div className="flex gap-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  <span>3 min read</span>
                  <span>20 Comments</span>
                </div>
              </div>
              <div className="group cursor-pointer">
                <p className="text-white text-sm font-bold leading-snug group-hover:text-brand transition-colors mb-2 italic">The best exercise to lose belly fat and tone up...</p>
                <div className="flex gap-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                  <span>5 min read</span>
                  <span>12 Comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
            Copyright ©{new Date().getFullYear()} All rights reserved | 3RD WAY FITNESS
          </p>
          <div className="flex gap-8 text-[10px] text-zinc-600 font-black uppercase tracking-widest">
             <a href="#" className="hover:text-brand transition-colors italic">Terms of use</a>
             <a href="#" className="hover:text-brand transition-colors italic">Privacy Policy</a>
             <a href="#" className="hover:text-brand transition-colors italic">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ icon, href }: { icon: React.ReactNode, href: string }) => (
  <a 
    href={href} 
    className="w-10 h-10 bg-[#222222] rounded-full flex items-center justify-center text-white hover:bg-brand transition-all duration-300"
  >
    {icon}
  </a>
);

export default Footer;
