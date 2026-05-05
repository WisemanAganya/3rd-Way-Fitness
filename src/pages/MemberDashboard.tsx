import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Calendar, Heart, Award, Sparkles, Send, Loader2, ChevronRight, CheckCircle2, Ticket, ShoppingBag, Clock, Utensils, TrendingUp, Activity } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { formatCurrency, cn } from '../lib/utils';
import { notificationManager } from '../lib/notifications';

const MemberDashboard = () => {
  const { user, memberData } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('weekly');
  const [generating, setGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [view, setView] = useState<'plans' | 'booking' | 'meals' | 'subscription' | 'reports'>('plans');
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchPrograms();
      fetchBookings();
      fetchMealPlans();
      fetchSubscription();
      fetchSessions();
    }
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'workout_plans'),
        where('memberId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlans(docs);
      if (docs.length > 0) setCurrentPlan(docs[0]);
    } catch (e) {
      console.error("No plans yet or error fetching", e);
    }
    setLoading(false);
  };

  const fetchPrograms = async () => {
    const snap = await getDocs(collection(db, 'programs'));
    setAvailablePrograms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchMealPlans = async () => {
    try {
      const q = query(collection(db, 'meal_plans'), where('memberId', 'in', [user?.uid, 'all']));
      const snap = await getDocs(q);
      setMealPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubscription = async () => {
    try {
      const q = query(collection(db, 'subscriptions'), where('memberId', '==', user?.uid), where('status', '==', 'active'));
      const snap = await getDocs(q);
      if (!snap.empty) setActiveSubscription(snap.docs[0].data());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessions = async () => {
    try {
      const snap = await getDocs(collection(db, 'sessions'));
      setAvailableSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBooking = async (programId: string, rateType: string, price: number) => {
    setBookingLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        memberId: user?.uid,
        programId,
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        pricePaid: price,
        rateType,
        createdAt: serverTimestamp()
      });
      fetchBookings();
      notificationManager.success("Booking confirmed! See you at the session.");
    } catch (e) {
      console.error(e);
      notificationManager.error("Failed to book session.");
    }
    setBookingLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      setBookings(bookings.filter(b => b.id !== bookingId));
      notificationManager.success("Session cancelled successfully.");
    } catch (e) {
      console.error(e);
      notificationManager.error("Failed to cancel session.");
    }
  };

  const handleReschedule = async (bookingId: string) => {
    const newDate = prompt("Enter new date (YYYY-MM-DD):", format(new Date(), 'yyyy-MM-dd'));
    if (!newDate) return;
    try {
      await setDoc(doc(db, 'bookings', bookingId), { bookingDate: new Date(newDate).toISOString() }, { merge: true });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, bookingDate: new Date(newDate).toISOString() } : b));
      notificationManager.success("Session rescheduled!");
    } catch (e) {
      console.error(e);
      notificationManager.error("Failed to reschedule.");
    }
  };

  const generatePlan = async () => {
    if (!goal) {
      notificationManager.warning("Please enter your fitness goal");
      return;
    }
    setGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate a comprehensive ${duration} workout plan for a gym member called ${user?.displayName}. 
      Goal: ${goal}. 
      Member Level: ${memberData?.progressionLevel || 'Beginner'}.
      Context: This is for "3RD WAY FITNESS" gym in Kenya.
      Format: Markdown with clear sections for daily routines, nutrition tips, and recovery.
      Include some local Kenyan touch if applicable (e.g. roadwork tips).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const planContent = response.text || "Failed to generate plan.";

      const docRef = await addDoc(collection(db, 'workout_plans'), {
        memberId: user?.uid,
        goal,
        duration,
        planContent,
        createdAt: serverTimestamp(),
      });

      const newPlan = { id: docRef.id, goal, duration, planContent, createdAt: new Date() };
      setPlans([newPlan, ...plans]);
      setCurrentPlan(newPlan);
      setGoal('');
      notificationManager.success("AI workout plan generated! Check it out below.");
    } catch (error) {
      console.error(error);
      notificationManager.error("Failed to generate plan. Check your API key.");
    }
    setGenerating(false);
  };

  return (
    <div className="pt-24 min-h-screen bg-black px-4 lg:px-8">
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-brand font-black text-[10px] uppercase tracking-[0.2em] mb-2 block">LOCKED_IN_CONSOLE</span>
            <h1 className="text-5xl md:text-7xl font-display uppercase italic tracking-tighter leading-none">WARRIOR<br />CORE</h1>
          </div>
          <div className="flex gap-1 p-1 bg-zinc-950 border border-white/5 rounded-2xl">
             <button 
              onClick={() => setView('plans')}
              className={cn("px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", view === 'plans' ? "bg-brand text-black" : "text-zinc-500 hover:text-white")}
             >
               Workout Plans
             </button>
             <button 
              onClick={() => setView('booking')}
              className={cn("px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", view === 'booking' ? "bg-brand text-black" : "text-zinc-500 hover:text-white")}
             >
               Book Sessions
             </button>
             <button 
              onClick={() => setView('meals')}
              className={cn("px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", view === 'meals' ? "bg-brand text-black" : "text-zinc-500 hover:text-white")}
             >
               Meal Plans
             </button>
             <button 
              onClick={() => setView('subscription')}
              className={cn("px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", view === 'subscription' ? "bg-brand text-black" : "text-zinc-500 hover:text-white")}
             >
               Subscription
             </button>
             <button 
              onClick={() => setView('reports')}
              className={cn("px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", view === 'reports' ? "bg-brand text-black" : "text-zinc-500 hover:text-white")}
             >
               My Reports
             </button>
          </div>
        </div>

        {view === 'booking' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="lg:col-span-2 space-y-8">
                <h2 className="text-3xl font-black uppercase italic tracking-tight underline decoration-brand/50 decoration-4 underline-offset-8">AVAILABLE SESSIONS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {availablePrograms.map(p => (
                      <div key={p.id} className="hardware-card p-8 rounded-[40px] group transition-all hover:border-brand/40 overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-brand transition-all">
                            <Ticket size={40} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">{p.category}</span>
                         <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter leading-none">{p.name}</h3>
                         <div className="flex flex-wrap gap-2 mb-8">
                            <button 
                              disabled={bookingLoading}
                              onClick={() => handleBooking(p.id, 'session', p.price)}
                              className="px-6 py-3 bg-brand text-black font-black text-[10px] uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
                            >
                              Book Now · {formatCurrency(p.price)}
                            </button>
                         </div>
                         <p className="text-zinc-500 text-xs line-clamp-2 italic leading-relaxed">"{p.description}"</p>
                      </div>
                   ))}
                   {availablePrograms.length === 0 && <p className="text-zinc-600 font-black uppercase text-[10px] py-10">No sessions available at the moment.</p>}
                </div>
             </div>
             
             <div className="space-y-8">
                <div className="hardware-card p-8 rounded-[40px] bg-zinc-950/50">
                  <h2 className="text-xl font-black uppercase italic tracking-tight mb-8 flex items-center gap-2">
                    <Clock size={20} className="text-brand" /> RESERVATIONS
                  </h2>
                  <div className="space-y-4">
                     {bookings.map(b => (
                        <div key={b.id} className="glass-card p-6 rounded-3xl flex items-center gap-4 hover:border-brand/20 transition-all">
                           <div className="p-3 bg-brand/10 text-brand rounded-2xl">
                              <CheckCircle2 size={18} />
                           </div>
                           <div className="flex-grow">
                              <h4 className="font-bold text-xs uppercase tracking-tight truncate max-w-[120px]">
                                {availablePrograms.find(p => p.id === b.programId)?.name || 'Gym Session'}
                              </h4>
                              <p className="text-[10px] text-zinc-500 font-mono italic">
                                 {new Date(b.bookingDate).toLocaleDateString()} · {new Date(b.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => handleReschedule(b.id)} className="p-2 hover:text-brand transition-colors"><Calendar size={14} /></button>
                              <button onClick={() => handleCancelBooking(b.id)} className="p-2 hover:text-red-500 transition-colors"><Clock size={14} /></button>
                           </div>
                           <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded">ACTIVE</span>
                        </div>
                     ))}
                     {bookings.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest mb-4">No active sessions</p>
                          <button onClick={() => setView('booking')} className="text-brand text-[10px] font-black uppercase tracking-widest hover:underline">Secure your slot now</button>
                        </div>
                     )}
                  </div>
                </div>

                {/* Daily Agenda */}
                <div className="hardware-card p-8 rounded-[40px] bg-brand/5 border-brand/20">
                   <h2 className="text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
                     <Activity size={20} className="text-brand" /> TODAY'S AGENDA
                   </h2>
                   <div className="space-y-4">
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                         <p className="text-[8px] font-black uppercase text-brand mb-1">Workout</p>
                         <p className="text-xs font-bold uppercase">{plans[0]?.goal || 'Rest Day / Recovery'}</p>
                      </div>
                      <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                         <p className="text-[8px] font-black uppercase text-brand mb-1">Meal Focus</p>
                         <p className="text-xs font-bold uppercase">{mealPlans[0]?.title || 'Standard Nutrition'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : view === 'meals' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {mealPlans.map(m => (
                <div key={m.id} className="hardware-card p-10 rounded-[48px] hover:border-brand/30 transition-all group">
                   <div className="p-4 bg-brand/10 text-brand rounded-2xl w-fit mb-8 group-hover:bg-brand group-hover:text-black transition-all">
                      <Utensils size={24} />
                   </div>
                   <h3 className="text-2xl font-black italic uppercase mb-6 tracking-tighter">{m.title}</h3>
                   <div className="prose prose-invert prose-xs max-h-[200px] overflow-y-auto mb-8 custom-scrollbar">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                   </div>
                   <button className="text-brand text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline">
                      DOWNLOAD PLAN <ChevronRight size={14} />
                   </button>
                </div>
             ))}
             {mealPlans.length === 0 && <p className="text-zinc-600 font-black uppercase text-xs py-20">No meal plans assigned yet.</p>}
          </div>
        ) : view === 'subscription' ? (
          <div className="max-w-3xl mx-auto">
             <div className="hardware-card p-12 rounded-[56px] border-brand/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                   <TrendingUp size={160} />
                </div>
                <div className="relative z-10">
                   <span className="text-brand font-black text-[10px] uppercase tracking-widest mb-4 block">MEMBERSHIP_STATUS</span>
                   <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12">YOUR PLAN</h2>
                   
                   {activeSubscription ? (
                      <div className="space-y-12">
                         <div className="grid grid-cols-2 gap-12 pb-12 border-b border-white/5">
                            <div>
                               <p className="text-zinc-500 font-black uppercase text-[10px] mb-2">Current Level</p>
                               <p className="text-2xl font-black italic uppercase">{memberData?.progressionLevel || 'Initiate'}</p>
                            </div>
                            <div>
                               <p className="text-zinc-500 font-black uppercase text-[10px] mb-2">Expiry Date</p>
                               <p className="text-2xl font-black italic uppercase text-brand">{activeSubscription.expiryDate}</p>
                            </div>
                         </div>
                         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <p className="text-sm text-zinc-500 font-bold uppercase italic">Maintain your momentum. Don't break the streak.</p>
                            <button className="bg-white text-black font-black px-10 py-5 rounded-2xl hover:bg-brand transition-all uppercase text-xs tracking-widest">
                               Renew Membership
                            </button>
                         </div>
                      </div>
                   ) : (
                      <div className="text-center py-12">
                         <p className="text-zinc-500 font-bold uppercase mb-8">No active subscription found. Unlock full access to the Forge.</p>
                         <button onClick={() => window.location.href='/#pricing'} className="bg-brand text-black font-black px-10 py-5 rounded-2xl hover:bg-brand-dark transition-all uppercase text-xs tracking-widest">
                            View Plans
                         </button>
                      </div>
                   )}
                </div>
             </div>
          </div>
        ) : view === 'reports' ? (
          <div className="space-y-12">
             {/* Personal Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="hardware-card p-8 rounded-[32px]">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Sessions</p>
                   <h4 className="text-3xl font-black italic">{bookings.length}</h4>
                   <p className="mt-4 text-brand text-[10px] font-black tracking-widest uppercase">LOCKED IN</p>
                </div>
                <div className="hardware-card p-8 rounded-[32px]">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Consistency</p>
                   <h4 className="text-3xl font-black italic">92%</h4>
                   <p className="mt-4 text-green-500 text-[10px] font-black tracking-widest uppercase">ELITE STREAK</p>
                </div>
                <div className="hardware-card p-8 rounded-[32px]">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Member Since</p>
                   <h4 className="text-xl font-black italic uppercase">
                      {memberData?.createdAt ? new Date(memberData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Join Now'}
                   </h4>
                   <p className="mt-4 text-blue-500 text-[10px] font-black tracking-widest uppercase">WARRIOR JOURNEY</p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Progress */}
                <div className="hardware-card p-10 rounded-[40px]">
                   <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-2"><Activity size={20} className="text-brand" /> Training Volume</h3>
                   <div className="h-48 flex items-end gap-3 px-2">
                      {[15, 30, 45, 20, 60, 80, 55].map((h, i) => (
                        <div key={i} className="flex-grow bg-zinc-900 border border-white/5 rounded-t-lg hover:bg-brand transition-all relative group" style={{ height: `${h}%` }}>
                           <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-0 group-hover:opacity-100 whitespace-nowrap">{h}% Effort</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-4 text-[8px] font-black uppercase text-zinc-600 tracking-widest">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                   </div>
                </div>

                {/* Spending Summary */}
                <div className="hardware-card p-10 rounded-[40px]">
                   <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-2"><ShoppingBag size={20} className="text-brand" /> Spending Summary</h3>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                         <div>
                            <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Subscriptions</p>
                            <p className="text-lg font-black italic uppercase">KES 12,500</p>
                         </div>
                         <TrendingUp size={20} className="text-green-500 opacity-20" />
                      </div>
                      <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                         <div>
                            <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Merchandise</p>
                            <p className="text-lg font-black italic uppercase">KES 4,200</p>
                         </div>
                         <ShoppingBag size={20} className="text-orange-500 opacity-20" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Generate Section */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="hardware-card p-8 rounded-[40px] border-brand/20">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-brand rounded-[20px] text-black">
                      <Sparkles />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black italic text-brand tracking-tighter">AI AGENT</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Forge Intelligence</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Evolution Goal</label>
                      <textarea 
                        placeholder="e.g. Explosive power for roadwork..."
                        className="w-full bg-black border border-white/10 rounded-2xl p-5 outline-none focus:border-brand transition-all text-xs min-h-[140px] resize-none leading-relaxed"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {['weekly', 'monthly'].map(d => (
                        <button 
                          key={d}
                          onClick={() => setDuration(d)}
                          className={cn(
                            "py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all",
                            duration === d ? 'bg-brand text-black' : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={generatePlan}
                      disabled={generating || !goal}
                      className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-brand transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group"
                    >
                      {generating ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                      FORGE PLAN
                    </button>
                  </div>
                </div>

                <div className="hardware-card p-8 rounded-[40px]">
                  <h4 className="text-[10px] font-black uppercase italic tracking-widest text-zinc-500 mb-6">Archives</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {plans.map((p) => (
                      <button 
                        key={p.id}
                        onClick={() => setCurrentPlan(p)}
                        className={cn(
                          "w-full p-5 rounded-2xl border transition-all text-left flex justify-between items-center group",
                          currentPlan?.id === p.id ? "border-brand bg-brand/5" : "border-white/5 bg-black/30 hover:border-white/10"
                        )}
                      >
                        <div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">
                            {p.createdAt?.toDate ? format(p.createdAt.toDate(), 'MMM dd, yyyy') : format(new Date(p.createdAt), 'MMM dd, yyyy')}
                           </p>
                           <p className="font-bold text-xs italic truncate max-w-[140px] group-hover:text-brand transition-colors">{p.goal}</p>
                        </div>
                        <ChevronRight size={14} className={currentPlan?.id === p.id ? 'text-brand' : 'text-zinc-700'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentPlan ? (
                  <motion.div
                    key={currentPlan.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 md:p-14 rounded-[56px] min-h-[600px] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                       <Award size={200} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-12 border-b border-white/5">
                        <div>
                          <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-3">{currentPlan.goal}</h3>
                          <p className="text-brand font-black uppercase tracking-widest text-[10px]">
                            3RD WAY · {currentPlan.duration} STRATEGY
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-zinc-600 font-black uppercase text-[8px] tracking-[0.2em] mb-1">System Core</p>
                          <div className="flex items-center gap-2 text-zinc-400">
                             <CheckCircle2 size={14} className="text-brand" />
                             <span className="font-mono text-[10px]">SIGNED_SECURE</span>
                          </div>
                        </div>
                      </div>

                      <div className="cms-content prose prose-invert prose-brand max-w-none">
                        <ReactMarkdown>{currentPlan.planContent}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="hardware-card rounded-[56px] h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-32 h-32 bg-zinc-950 border border-white/5 rounded-full flex items-center justify-center mb-10 relative">
                       <div className="absolute inset-0 bg-brand/5 blur-2xl rounded-full"></div>
                       <Dumbbell className="text-zinc-800 relative z-10" size={48} />
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">SYSTEM_OFFLINE</h3>
                    <p className="text-zinc-600 max-w-sm leading-relaxed text-sm">
                      Enter your evolutionary objectives in the AI Forge to manifest your tactical training path.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
