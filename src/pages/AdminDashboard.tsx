import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Package, CreditCard, LayoutDashboard, Plus, Trash2, Edit3, 
  Save, X, CheckCircle, ChevronRight, BarChart3, Database, ShoppingCart, ShoppingBag, Sparkles
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { notificationManager } from '../lib/notifications';
import { validateProgramForm, validateProductForm, validateMembershipPlanForm, validateMealPlanForm, validateSessionForm } from '../lib/validation';
import { Utensils, CalendarDays, Activity, TrendingUp, History } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [members, setMembers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // Form states
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'program' | 'product' | 'plan' | 'content' | 'meal_plan' | 'session'>('program');
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersSnap, programsSnap, mPlansSnap, wPlansSnap, bookingsSnap, productsSnap, ordersSnap, contentSnap, mealSnap, sessionsSnap, subSnap] = await Promise.all([
        getDocs(collection(db, 'members')),
        getDocs(query(collection(db, 'programs'), orderBy('name'))),
        getDocs(collection(db, 'membership_plans')),
        getDocs(query(collection(db, 'workout_plans'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'bookings'), orderBy('bookingDate', 'desc'))),
        getDocs(collection(db, 'products')),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'site_content')),
        getDocs(collection(db, 'meal_plans')),
        getDocs(collection(db, 'sessions')),
        getDocs(collection(db, 'subscriptions'))
      ]);

      setMembers(membersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPrograms(programsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setMembershipPlans(mPlansSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setWorkoutPlans(wPlansSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBookings(bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSiteContent(contentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setMealPlans(mealSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSessions(sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSubscriptions(subSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    let errors: any[] = [];
    if (editingType === 'program') {
      errors = validateProgramForm(formData);
    } else if (editingType === 'product') {
      errors = validateProductForm(formData);
    } else if (editingType === 'plan') {
      errors = validateMembershipPlanForm(formData);
    } else if (editingType === 'meal_plan') {
      errors = validateMealPlanForm(formData);
    } else if (editingType === 'session') {
      errors = validateSessionForm(formData);
    }

    if (errors.length > 0) {
      notificationManager.error(errors[0].message);
      return;
    }

    const typeToColl: Record<string, string> = {
      program: 'programs',
      product: 'products',
      plan: 'membership_plans',
      content: 'site_content',
      meal_plan: 'meal_plans',
      session: 'sessions'
    };
    const coll = typeToColl[editingType];
    
    try {
      if (isEditing === 'new') {
        const docRef = await addDoc(collection(db, coll), { ...formData, createdAt: new Date().toISOString() });
        if (editingType === 'program') setPrograms([...programs, { id: docRef.id, ...formData }]);
        else if (editingType === 'product') setProducts([...products, { id: docRef.id, ...formData }]);
        else if (editingType === 'plan') setMembershipPlans([...membershipPlans, { id: docRef.id, ...formData }]);
        else if (editingType === 'content') setSiteContent([...siteContent, { id: docRef.id, ...formData }]);
        notificationManager.success(`${editingType} created successfully`);
      } else {
        await setDoc(doc(db, coll, isEditing!), { ...formData, updatedAt: new Date().toISOString() }, { merge: true });
        if (editingType === 'program') setPrograms(programs.map(p => p.id === isEditing ? { id: isEditing, ...formData } : p));
        else if (editingType === 'product') setProducts(products.map(p => p.id === isEditing ? { id: isEditing, ...formData } : p));
        else if (editingType === 'plan') setMembershipPlans(membershipPlans.map(p => p.id === isEditing ? { id: isEditing, ...formData } : p));
        else if (editingType === 'content') setSiteContent(siteContent.map(p => p.id === isEditing ? { id: isEditing, ...formData } : p));
        else if (editingType === 'meal_plan') setMealPlans(mealPlans.map(p => p.id === isEditing ? { id: isEditing, ...formData } : p));
        else if (editingType === 'session') setSessions(sessions.map(p => p.id === isEditing ? { id: isEditing, ...formData } : p));
        notificationManager.success(`${editingType} updated successfully`);
      }
      setIsEditing(null);
      setFormData({});
    } catch (error) {
      console.error(error);
      notificationManager.error(`Failed to save ${editingType}`);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, coll, id));
      if (coll === 'programs') setPrograms(programs.filter(p => p.id !== id));
      if (coll === 'membership_plans') setMembershipPlans(membershipPlans.filter(p => p.id !== id));
      if (coll === 'products') setProducts(products.filter(p => p.id !== id));
      if (coll === 'meal_plans') setMealPlans(mealPlans.filter(p => p.id !== id));
      if (coll === 'sessions') setSessions(sessions.filter(p => p.id !== id));
      notificationManager.success('Item deleted successfully');
    } catch (error) {
      console.error(error);
      notificationManager.error('Failed to delete item');
    }
  };

  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'programs', icon: <Package size={20} />, label: 'Programs' },
    { id: 'merchandise', icon: <ShoppingCart size={20} />, label: 'Merch' },
    { id: 'members', icon: <Users size={20} />, label: 'Members' },
    { id: 'plans', icon: <CreditCard size={20} />, label: 'Plans' },
    { id: 'bookings', icon: <Database size={20} />, label: 'Bookings' },
    { id: 'ai_plans', icon: <Sparkles size={20} />, label: 'AI Plans' },
    { id: 'meal_plans', icon: <Utensils size={20} />, label: 'Meals' },
    { id: 'sessions', icon: <CalendarDays size={20} />, label: 'Sessions' },
    { id: 'subscriptions', icon: <TrendingUp size={20} />, label: 'Revenue' },
    { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
    { id: 'content', icon: <Plus size={20} />, label: 'CMS' },
    { id: 'reports', icon: <BarChart3 size={20} />, label: 'Reports' },
  ];

  return (
    <div className="pt-20 min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950 flex flex-col hidden md:flex">
        <div className="p-8">
          <h2 className="text-xl font-black italic tracking-tighter uppercase">ADMIN <span className="text-brand">CORE</span></h2>
        </div>
        <nav className="flex-grow px-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all font-black uppercase text-[10px] tracking-widest",
                activeTab === item.id 
                  ? "bg-brand text-black" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">{menuItems.find(i => i.id === activeTab)?.label}</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Management Console</p>
          </div>
          <div className="flex gap-4">
            {activeTab === 'programs' && (
              <button 
                onClick={() => { setEditingType('program'); setIsEditing('new'); setFormData({ name: '', description: '', category: 'gym', price: 0, frequency: 'monthly' }); }}
                className="bg-brand text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-dark transition-all"
              >
                <Plus size={20} /> NEW PROGRAM
              </button>
            )}
            {activeTab === 'merchandise' && (
              <button 
                onClick={() => { setEditingType('product'); setIsEditing('new'); setFormData({ name: '', description: '', category: 'Apparel', price: 0, stock: 10, imageUrl: '' }); }}
                className="bg-brand text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-dark transition-all"
              >
                <Plus size={20} /> NEW PRODUCT
              </button>
            )}
            {activeTab === 'plans' && (
              <button 
                onClick={() => { setEditingType('plan'); setIsEditing('new'); setFormData({ name: '', targetAge: 'adult', rates: { hourly: 0, weekly: 0, monthly: 0, per_session: 0 }, benefits: [] }); }}
                className="bg-brand text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-dark transition-all"
              >
                <Plus size={20} /> NEW PLAN
              </button>
            )}
            {activeTab === 'meal_plans' && (
              <button 
                onClick={() => { setEditingType('meal_plan'); setIsEditing('new'); setFormData({ title: '', content: '', memberId: 'all' }); }}
                className="bg-brand text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-dark transition-all"
              >
                <Plus size={20} /> NEW MEAL PLAN
              </button>
            )}
            {activeTab === 'sessions' && (
              <button 
                onClick={() => { setEditingType('session'); setIsEditing('new'); setFormData({ programId: '', date: '', time: '', capacity: 20, trainer: '', location: 'Main Gym' }); }}
                className="bg-brand text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-dark transition-all"
              >
                <Plus size={20} /> NEW SESSION
              </button>
            )}
            {activeTab === 'content' && (
              <button 
                onClick={() => { setEditingType('content'); setIsEditing('new'); setFormData({ section: '', title: '', body: '', imageUrl: '' }); }}
                className="bg-brand text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-dark transition-all"
              >
                <Plus size={20} /> NEW CONTENT
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Members" value={members.length} icon={<Users className="text-blue-500" />} />
                  <StatCard label="Active Programs" value={programs.length} icon={<Package className="text-brand" />} />
                  <StatCard label="Merch Stock" value={products.length} icon={<ShoppingCart className="text-orange-400" />} />
                  <StatCard label="Total Orders" value={orders.length} icon={<ShoppingBag className="text-pink-500" />} />
                </div>
              )}

               {activeTab === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {membershipPlans.map(p => (
                    <div key={p.id} className="hardware-card rounded-3xl p-8 hover:border-brand/30 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-brand/10 text-brand text-[8px] font-black uppercase tracking-[0.2em] rounded-full">
                          {p.targetAge}
                        </span>
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingType('plan'); setIsEditing(p.id); setFormData(p); }} className="text-zinc-500 hover:text-white"><Edit3 size={16} /></button>
                           <button onClick={() => handleDelete('membership_plans', p.id)} className="text-zinc-500 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <h3 className="text-2xl font-black italic uppercase mb-6 tracking-tight">{p.name}</h3>
                      <div className="space-y-2 mb-8">
                         <div className="flex justify-between text-xs"><span className="text-zinc-500">Hourly</span> <span className="font-bold">{formatCurrency(p.rates?.hourly || 0)}</span></div>
                         <div className="flex justify-between text-xs"><span className="text-zinc-500">Weekly</span> <span className="font-bold">{formatCurrency(p.rates?.weekly || 0)}</span></div>
                         <div className="flex justify-between text-xs"><span className="text-zinc-500">Monthly</span> <span className="font-bold">{formatCurrency(p.rates?.monthly || 0)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ai_plans' && (
                <div className="space-y-4">
                  {workoutPlans.map(p => {
                    const member = members.find(m => m.id === p.memberId);
                    return (
                      <div key={p.id} className="hardware-card p-8 rounded-[32px] flex flex-col md:flex-row justify-between gap-6">
                        <div>
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-brand">{p.duration}</span>
                              <span className="text-[10px] font-mono text-zinc-600">ID: {p.id.slice(0,8)}</span>
                           </div>
                           <h4 className="text-xl font-black italic uppercase tracking-tight mb-1">{p.goal}</h4>
                           <p className="text-xs text-zinc-500 font-bold uppercase">Member: <span className="text-white">{member?.displayName || 'Unknown'}</span></p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                           <span className="text-[10px] font-mono text-zinc-500">
                             {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : 'Recent'}
                           </span>
                           <button 
                             onClick={() => {
                               if (confirm('Delete this AI generated plan?')) {
                                 deleteDoc(doc(db, 'workout_plans', p.id));
                                 setWorkoutPlans(workoutPlans.filter(wp => wp.id !== p.id));
                               }
                             }}
                             className="text-zinc-600 hover:text-red-500 transition-colors"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                  {workoutPlans.length === 0 && <p className="text-center py-20 text-zinc-700 font-black uppercase text-xs">No AI plans generated yet</p>}
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-4">
                  {siteContent.map(c => (
                    <div key={c.id} className="hardware-card p-6 rounded-2xl flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">{c.section}</p>
                          <h4 className="font-bold">{c.title}</h4>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => { setEditingType('content'); setIsEditing(c.id); setFormData(c); }} className="text-zinc-500 hover:text-white flex items-center gap-1 text-xs uppercase font-black"><Edit3 size={14} /> Edit</button>
                          <button onClick={() => handleDelete('site_content', c.id)} className="text-zinc-500 hover:text-red-500 flex items-center gap-1 text-xs uppercase font-black"><Trash2 size={14} /> Remove</button>
                       </div>
                    </div>
                  ))}
                  {siteContent.length === 0 && <p className="text-center text-zinc-600 py-20 font-black uppercase text-xs tracking-widest">No CMS content found</p>}
                </div>
              )}

              {activeTab === 'merchandise' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:border-brand/30 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest rounded-full">
                          {p.category}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingType('product'); setIsEditing(p.id); setFormData(p); }} className="text-gray-500 hover:text-white"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete('products', p.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div className="aspect-video bg-black rounded-2xl mb-4 overflow-hidden">
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover opacity-50" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-black">{formatCurrency(p.price)}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Qty: {p.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'programs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.map(p => (
                    <div key={p.id} className="bg-zinc-900 border border-white/5 rounded-3xl p-6 hover:border-brand/30 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest rounded-full">
                          {p.category}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingType('program'); setIsEditing(p.id); setFormData(p); }} className="text-gray-500 hover:text-white"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete('programs', p.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-6">{p.description}</p>
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-black">{formatCurrency(p.price)}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">{p.frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'orders' && (
                 <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-black/50 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Order ID</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Total</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Method</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Status</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</td>
                            <td className="px-6 py-4 font-black">{formatCurrency(o.total)}</td>
                            <td className="px-6 py-4 text-xs uppercase text-gray-400 font-bold">{o.paymentMethod}</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-black uppercase tracking-widest">{o.status}</span></td>
                            <td className="px-6 py-4 text-gray-500 text-xs">
                                {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'Just now'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              )}

              {activeTab === 'meal_plans' && (
                <div className="space-y-4">
                  {mealPlans.map(m => (
                    <div key={m.id} className="hardware-card p-6 rounded-2xl flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">Target: {m.memberId === 'all' ? 'All Members' : 'Individual'}</p>
                          <h4 className="font-bold">{m.title}</h4>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => { setEditingType('meal_plan'); setIsEditing(m.id); setFormData(m); }} className="text-zinc-500 hover:text-white flex items-center gap-1 text-xs uppercase font-black"><Edit3 size={14} /> Edit</button>
                          <button onClick={() => handleDelete('meal_plans', m.id)} className="text-zinc-500 hover:text-red-500 flex items-center gap-1 text-xs uppercase font-black"><Trash2 size={14} /> Remove</button>
                       </div>
                    </div>
                  ))}
                  {mealPlans.length === 0 && <p className="text-center text-zinc-600 py-20 font-black uppercase text-xs tracking-widest">No meal plans created</p>}
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map(s => {
                    const program = programs.find(p => p.id === s.programId);
                    return (
                      <div key={s.id} className="hardware-card p-8 rounded-3xl group transition-all hover:border-brand/30">
                        <div className="flex justify-between items-start mb-6">
                          <span className="px-3 py-1 bg-brand/10 text-brand text-[8px] font-black uppercase tracking-widest rounded-full">
                            {s.time}
                          </span>
                          <div className="flex gap-2">
                             <button onClick={() => { setEditingType('session'); setIsEditing(s.id); setFormData(s); }} className="text-zinc-500 hover:text-white"><Edit3 size={16} /></button>
                             <button onClick={() => handleDelete('sessions', s.id)} className="text-zinc-500 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <h3 className="text-xl font-black italic uppercase mb-2 tracking-tight">{program?.name || 'Unknown Program'}</h3>
                        <div className="space-y-2 mb-6">
                           <p className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2"><CalendarDays size={12} /> {s.date}</p>
                           <p className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2"><Users size={12} /> Capacity: {s.capacity}</p>
                           <p className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2"><Activity size={12} /> Location: {s.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'subscriptions' && (
                 <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-black/50 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Member</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Plan</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Amount</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Expiry</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {subscriptions.map(s => {
                          const member = members.find(m => m.id === s.memberId);
                          const plan = membershipPlans.find(p => p.id === s.planId);
                          return (
                            <tr key={s.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-brand/10 rounded-full text-brand font-black text-[10px]">{member?.displayName?.charAt(0)}</div>
                                  <span className="font-bold text-sm">{member?.displayName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-black text-xs uppercase italic">{plan?.name}</td>
                              <td className="px-6 py-4 font-black">{formatCurrency(s.amountPaid)}</td>
                              <td className="px-6 py-4 text-xs font-mono text-zinc-500">{s.expiryDate}</td>
                              <td className="px-6 py-4"><span className={cn("px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest", s.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>{s.status}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                 </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-12">
                   {/* Financial Stats */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="hardware-card p-8 rounded-[32px]">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Weekly Revenue</p>
                         <h4 className="text-3xl font-black italic">{formatCurrency(orders.reduce((acc, o) => acc + o.total, 0))}</h4>
                         <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-black">
                            <TrendingUp size={12} /> +12.5% FROM LAST WEEK
                         </div>
                      </div>
                      <div className="hardware-card p-8 rounded-[32px]">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Active Subscriptions</p>
                         <h4 className="text-3xl font-black italic">{subscriptions.filter(s => s.status === 'active').length}</h4>
                         <div className="mt-4 flex items-center gap-2 text-brand text-[10px] font-black">
                            <Users size={12} /> {members.length} TOTAL REGISTERED
                         </div>
                      </div>
                      <div className="hardware-card p-8 rounded-[32px]">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Avg. Session Attendance</p>
                         <h4 className="text-3xl font-black italic">84%</h4>
                         <div className="mt-4 flex items-center gap-2 text-blue-500 text-[10px] font-black">
                            <Activity size={12} /> PEAK TIME: 6:00 PM
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Revenue Breakdown */}
                      <div className="hardware-card p-10 rounded-[40px]">
                         <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-2"><CreditCard size={20} className="text-brand" /> Revenue Breakdown</h3>
                         <div className="space-y-6">
                            {[
                               { label: 'Daily Passes', value: 25000, color: 'bg-brand' },
                               { label: 'Weekly Plans', value: 45000, color: 'bg-blue-500' },
                               { label: 'Monthly Subs', value: 120000, color: 'bg-green-500' },
                               { label: 'Merchandise', value: 15000, color: 'bg-orange-500' }
                            ].map((item, i) => (
                               <div key={i}>
                                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                     <span className="text-zinc-500">{item.label}</span>
                                     <span>{formatCurrency(item.value)}</span>
                                  </div>
                                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                                     <div className={cn("h-full rounded-full", item.color)} style={{ width: `${(item.value / 200000) * 100}%` }}></div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Peak Hours */}
                      <div className="hardware-card p-10 rounded-[40px]">
                         <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-2"><Clock size={20} className="text-brand" /> Peak Training Hours</h3>
                         <div className="h-48 flex items-end gap-1 px-2">
                            {[20, 35, 15, 10, 5, 8, 45, 90, 100, 85, 40, 25].map((h, i) => (
                              <div key={i} className="flex-grow bg-white/5 hover:bg-brand/40 rounded-t transition-all relative group" style={{ height: `${h}%` }}>
                                 <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-0 group-hover:opacity-100 whitespace-nowrap">{i+6}AM</span>
                              </div>
                            ))}
                         </div>
                         <div className="flex justify-between mt-4 text-[8px] font-black uppercase text-zinc-600 tracking-widest">
                            <span>6AM</span><span>12PM</span><span>6PM</span><span>10PM</span>
                         </div>
                      </div>
                   </div>

                   {/* Activity Log */}
                   <div className="hardware-card p-10 rounded-[40px]">
                      <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-2"><History size={20} className="text-brand" /> System Activity Log</h3>
                      <div className="space-y-4">
                         {[
                            { action: 'NEW_MEMBER_JOINED', user: 'John Doe', time: '2 mins ago', icon: <Users size={12} /> },
                            { action: 'PAYMENT_RECEIVED', user: 'KES 2,500', time: '15 mins ago', icon: <CreditCard size={12} /> },
                            { action: 'SESSION_BOOKED', user: 'Morning HIIT', time: '1 hour ago', icon: <CalendarDays size={12} /> },
                            { action: 'PLAN_UPDATED', user: 'Iron Warrior', time: '3 hours ago', icon: <Activity size={12} /> },
                            { action: 'CONTENT_MODIFIED', user: 'Hero Section', time: '5 hours ago', icon: <Database size={12} /> }
                         ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-brand/20 transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="p-2 bg-zinc-950 rounded-lg text-zinc-500">{log.icon}</div>
                                  <div>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-brand">{log.action}</p>
                                     <p className="text-xs font-bold">{log.user}</p>
                                  </div>
                               </div>
                               <span className="text-[10px] font-mono text-zinc-600 uppercase">{log.time}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'members' && (
                 <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-black/50 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Member</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Category</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Rank</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Joined</th>
                          <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {members.map(m => (
                          <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand/10 rounded-full text-brand font-black text-xs uppercase">
                                  {m.displayName?.charAt(0)}
                                </div>
                                <span className="font-bold">{m.displayName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest">{m.ageCategory}</td>
                            <td className="px-6 py-4">
                              <select 
                                value={m.progressionLevel} 
                                onChange={async (e) => {
                                  await setDoc(doc(db, 'members', m.id), { ...m, progressionLevel: e.target.value });
                                  setMembers(members.map(mem => mem.id === m.id ? { ...mem, progressionLevel: e.target.value } : mem));
                                }}
                                className="bg-black/50 border border-white/10 rounded px-2 py-1 text-[10px] font-black uppercase tracking-tight outline-none focus:border-brand"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Initiate">Initiate</option>
                                <option value="Warrior">Warrior</option>
                                <option value="Iron Soul">Iron Soul</option>
                                <option value="Legend">Legend</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-zinc-500 text-[10px] font-mono tracking-tighter">
                              {m.createdAt ? (m.createdAt.toDate ? m.createdAt.toDate().toLocaleDateString() : new Date(m.createdAt).toLocaleDateString()) : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                               <button className="text-zinc-500 hover:text-brand transition-all">
                                  <ChevronRight size={18} />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditing(null)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-zinc-900 w-full max-w-lg rounded-[40px] border border-brand/20 p-10 overflow-hidden"
          >
            <form onSubmit={handleSave}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black italic uppercase">{isEditing === 'new' ? 'CREATE' : 'EDIT'} {editingType}</h2>
                <button type="button" onClick={() => setIsEditing(null)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                {editingType === 'content' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Section Key</label>
                      <input type="text" value={formData.section || ''} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none" placeholder="e.g., hero_title, about_text" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Title</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Body (Markdown Supported)</label>
                      <textarea value={formData.body || ''} onChange={e => setFormData({...formData, body: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none h-40 resize-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Image URL</label>
                      <input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none" placeholder="https://..." />
                    </div>
                  </>
                ) : editingType === 'plan' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Plan Name</label>
                      <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Target Age</label>
                        <select value={formData.targetAge || 'adult'} onChange={e => setFormData({...formData, targetAge: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-xs">
                          <option value="child">Child</option>
                          <option value="teenager">Teenager</option>
                          <option value="adult">Adult</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Hourly (KES)</label>
                        <input type="number" value={formData.rates?.hourly || 0} onChange={e => setFormData({...formData, rates: {...formData.rates, hourly: Number(e.target.value)}})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 focus:border-brand outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Weekly (KES)</label>
                        <input type="number" value={formData.rates?.weekly || 0} onChange={e => setFormData({...formData, rates: {...formData.rates, weekly: Number(e.target.value)}})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 focus:border-brand outline-none" />
                      </div>
                    </div>
                  </>
                ) : editingType === 'meal_plan' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Plan Title</label>
                      <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Member Assignment</label>
                      <select value={formData.memberId || 'all'} onChange={e => setFormData({...formData, memberId: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-xs">
                        <option value="all">All Members</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.displayName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Dietary Content (Markdown)</label>
                      <textarea value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none h-40 resize-none" />
                    </div>
                  </>
                ) : editingType === 'session' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Program</label>
                      <select value={formData.programId || ''} onChange={e => setFormData({...formData, programId: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-xs">
                        <option value="">Select Program</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Date</label>
                        <input type="date" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Time</label>
                        <input type="time" value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Capacity</label>
                        <input type="number" value={formData.capacity || 20} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Location</label>
                        <input type="text" value={formData.location || 'Main Gym'} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{editingType} Name</label>
                      <input 
                        type="text" required
                        value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none"
                      />
                    </div>
                    {editingType === 'program' ? (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                        <textarea 
                          value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none h-32 resize-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image URL</label>
                        <input 
                          type="text"
                          value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 focus:border-brand outline-none"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                        {editingType === 'program' ? (
                          <select 
                            value={formData.category || 'gym'} onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 focus:border-brand outline-none text-sm"
                          >
                            <option value="gym">Gym</option>
                            <option value="bootcamp">Bootcamp</option>
                            <option value="house_of_pain">House of Pain</option>
                            <option value="hike">Hike</option>
                            <option value="roadwork">Roadwork</option>
                          </select>
                        ) : (
                          <input 
                            type="text"
                            value={formData.category || 'Apparel'} onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 focus:border-brand outline-none"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{editingType === 'product' ? 'Stock' : 'Price'}</label>
                        <input 
                          type="number" required
                          value={editingType === 'product' ? (formData.stock || 0) : (formData.price || 0)} 
                          onChange={e => setFormData({...formData, [editingType === 'product' ? 'stock' : 'price']: Number(e.target.value)})}
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 focus:border-brand outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button 
                type="submit"
                className="w-full bg-brand text-black font-black py-4 rounded-2xl mt-10 hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> SAVE CHANGES
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) => (
  <div className="hardware-card rounded-[32px] p-8">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 glass-card rounded-2xl border border-white/5">
        {icon}
      </div>
      <ChevronRight size={16} className="text-zinc-600" />
    </div>
    <span className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</span>
    <span className="text-3xl font-black italic">{value}</span>
  </div>
);

export default AdminDashboard;
