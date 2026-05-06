import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, Trash2, Smartphone, CreditCard, ChevronRight, X, CheckCircle2, Loader2, Package } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { notificationManager } from '../lib/notifications';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const MerchandisePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<string>('stk_push');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Apparel', 'Training Gear', 'Accessories', 'Footwear'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'products'));
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      if (items.length === 0) {
        const seed = [
          { name: 'Elite Training Tee', description: 'Heavyweight cotton, premium breathability.', price: 1800, category: 'Apparel', imageUrl: '/assets/svc/armory/elite training tee.PNG', stock: 50 },
          { name: 'Iron Grit Hoodie', description: 'Oversized fleece, high-density print.', price: 3500, category: 'Apparel', imageUrl: '/assets/svc/armory/iron grit hoodie.PNG', stock: 30 },
          { name: 'Combat Gloves', description: 'Impact-absorbing foam, reinforced wrist.', price: 2500, category: 'Training Gear', imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000', stock: 20 },
          { name: 'Performance Shorts', description: 'Strategic ventilation for max mobility.', price: 2200, category: 'Apparel', imageUrl: '/assets/svc/armory/performance shorts.PNG', stock: 40 },
          { name: 'Lifting Straps', description: 'Heavy-duty webbing for maximum grip.', price: 1200, category: 'Training Gear', imageUrl: '/assets/svc/armory/lifting straps.PNG', stock: 100 },
          { name: 'Compression Sleeves', description: 'Graduated compression for elite recovery.', price: 1500, category: 'Accessories', imageUrl: '/assets/svc/armory/compression sleeves.PNG', stock: 60 },
          { name: '3RD WAY Elite Cap', description: 'Precision needlework, moisture-wicking.', price: 1000, category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000', stock: 80 },
          { name: 'Warrior Trainers', description: 'Dynamic stability for heavy compound lifts.', price: 8500, category: 'Footwear', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000', stock: 15 },
          { name: 'Hand Wraps', description: '180-inch semi-elastic protection.', price: 800, category: 'Training Gear', imageUrl: '/assets/svc/armory/hand wraps.PNG', stock: 50 },
        ];
        setProducts(seed.map((s, i) => ({ ...s, id: `seed-${i}` })));
      } else {
        setProducts(items);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(p => activeCategory === 'All' || p.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCart(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) {
      notificationManager.error("Please login to proceed with payment.");
      return;
    }
    if (paymentMethod === 'stk_push' && !phone) {
        notificationManager.error("Please enter M-Pesa phone number.");
        return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      await addDoc(collection(db, 'orders'), {
        memberId: user.uid,
        items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
        total: cartTotal,
        paymentMethod,
        phoneNumber: phone ? phone : 'MANUAL_PAY',
        status: 'paid',
        createdAt: serverTimestamp(),
      });
      setOrderComplete(true);
      setCart([]);
      notificationManager.success("Order placed successfully! We'll contact you soon.");
    } catch (e) {
      console.error(e);
      notificationManager.error("Failed to save order.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-display uppercase italic tracking-tighter leading-none mb-6">ARMORY</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs flex items-center gap-2">
              <Package size={14} className="text-brand" /> ELITE PERFORMANCE GEAR
            </p>
          </div>
          <button 
            onClick={() => setShowCart(true)}
            className="group hardware-card p-6 rounded-full hover:border-brand transition-all relative"
          >
            <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-black">
                {cart.length}
              </span>
            )}
          </button>
        </header>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                activeCategory === cat ? "bg-white text-black" : "bg-white/5 text-zinc-500 hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[1, 2, 3, 4].map(i => <div key={i} className="hardware-card aspect-square rounded-[40px] animate-pulse" />)}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((p) => (
              <motion.div 
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
                className="hardware-card rounded-[40px] overflow-hidden group flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden bg-black/50">
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1 glass-card rounded-full text-[10px] font-black uppercase tracking-widest">
                      {p.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-black italic uppercase mb-2 tracking-tighter tracking-tight leading-none">{p.name}</h3>
                  <p className="text-zinc-500 text-xs mb-8 flex-grow line-clamp-2">{p.description}</p>
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Price</p>
                      <p className="text-2xl font-black text-brand">{formatCurrency(p.price)}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(p)}
                      className="bg-white text-black p-4 rounded-2xl hover:bg-brand transition-all active:scale-90"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 z-[70] shadow-2xl border-l border-brand/20 flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/50">
                <h2 className="text-2xl font-black italic">SHOPPING <span className="text-brand">CART</span></h2>
                <button onClick={() => { setShowCart(false); setOrderComplete(false); setCheckoutStep('cart'); }} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                {orderComplete ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-6 bg-brand/10 rounded-full">
                      <CheckCircle2 size={64} className="text-brand" />
                    </div>
                    <h3 className="text-3xl font-black italic">PAYMENT RECEIVED!</h3>
                    <p className="text-gray-400">Your STK push was successful. Our team will contact you for delivery details.</p>
                    <button 
                      onClick={() => { setShowCart(false); setOrderComplete(false); setCheckoutStep('cart'); }}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-2xl transition-all"
                    >
                      CONTINUE SHOPPING
                    </button>
                  </div>
                ) : checkoutStep === 'cart' ? (
                  <div className="space-y-6">
                    {cart.length === 0 ? (
                      <div className="text-center py-20">
                        <ShoppingCart size={48} className="text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Your armory is empty</p>
                      </div>
                    ) : cart.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-brand font-black text-sm mt-1">{formatCurrency(item.price)}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center border border-white/10 rounded-xl px-2 py-1 bg-black">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-500 hover:text-white"><Minus size={12} /></button>
                              <span className="px-3 text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-500 hover:text-white"><Plus size={12} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 italic">Select Payment Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <PaymentOption 
                          active={paymentMethod === 'stk_push'} 
                          onClick={() => setPaymentMethod('stk_push')}
                          icon={<Smartphone className="text-green-500" />}
                          label="M-PESA STK Pull"
                        />
                        <PaymentOption 
                          active={paymentMethod === 'lipa_na_mpesa'} 
                          onClick={() => setPaymentMethod('lipa_na_mpesa')}
                          icon={<CreditCard className="text-green-500" />}
                          label="Lipa Na M-PESA"
                        />
                        <PaymentOption 
                          active={paymentMethod === 'pochi'} 
                          onClick={() => setPaymentMethod('pochi')}
                          icon={<Smartphone className="text-blue-500" />}
                          label="Pochi la Biashara"
                        />
                        <PaymentOption 
                          active={paymentMethod === 'paybill'} 
                          onClick={() => setPaymentMethod('paybill')}
                          icon={<CreditCard className="text-orange-500" />}
                          label="Paybill (M44221)"
                        />
                      </div>
                    </div>

                    {(paymentMethod === 'stk_push' || paymentMethod === 'lipa_na_mpesa' || paymentMethod === 'pochi') && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <label className="block text-xs font-bold text-gray-500 uppercase">M-PESA Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="07XX XXX XXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-black border border-brand/30 rounded-2xl px-6 py-4 focus:border-brand outline-none text-brand font-black text-lg"
                        />
                        <p className="text-[10px] text-gray-500 italic">You will receive a prompt on your phone shortly.</p>
                      </motion.div>
                    )}

                    {paymentMethod === 'paybill' && (
                        <div className="p-6 bg-zinc-900 rounded-3xl border border-white/5 space-y-4">
                            <p className="text-sm text-gray-300">Please pay to:</p>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-500">PAYBILL NO:</p>
                                <p className="text-2xl font-black text-brand">442211</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-500">ACCOUNT NO:</p>
                                <p className="text-xl font-black text-white">IRON-{user?.uid.slice(-6)}</p>
                            </div>
                        </div>
                    )}
                  </div>
                )}
              </div>

              {!orderComplete && cart.length > 0 && (
                <div className="p-8 border-t border-white/5 bg-black/50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                    <span className="text-3xl font-black italic">{formatCurrency(cartTotal)}</span>
                  </div>
                  {checkoutStep === 'cart' ? (
                    <button 
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full bg-brand hover:bg-brand-dark text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand/10"
                    >
                      PROCEED TO CHECKOUT <ChevronRight size={20} />
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setCheckoutStep('cart')}
                        className="flex-shrink-0 p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                      >
                        <ChevronRight size={20} className="rotate-180" />
                      </button>
                      <button 
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="flex-grow bg-brand hover:bg-brand-dark text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand/10 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                        {isProcessing ? 'PROCESSING...' : `PAY ${formatCurrency(cartTotal)}`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const PaymentOption = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2",
      active ? "border-brand bg-brand/5 shadow-inner" : "border-white/5 bg-zinc-900/50 hover:border-white/10"
    )}
  >
    <div className="p-2 bg-black/50 rounded-xl mb-1">
      {icon}
    </div>
    <span className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-brand" : "text-gray-500")}>{label}</span>
  </button>
);

export default MerchandisePage;
