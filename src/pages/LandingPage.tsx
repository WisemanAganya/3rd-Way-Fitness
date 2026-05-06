import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Target, Users, MapPin, Calendar, Flame, Activity, Brain, ShieldAlert, Heart, Scissors, UserCheck, CheckCircle2, Award, Clock, Dumbbell, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { notificationManager } from '../lib/notifications';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [siteText, setSiteText] = useState<any>({});
  
  useEffect(() => {
    const fetchContent = async () => {
      const snap = await getDocs(collection(db, 'site_content'));
      const content: any = {};
      snap.docs.forEach(doc => {
        content[doc.data().section] = doc.data();
      });
      setSiteText(content);
    };
    fetchContent();
  }, []);

  const handleLogin = async () => {
    if (user) {
      navigate('/dashboard');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      notificationManager.success("Welcome to 3RD WAY FITNESS!");
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      notificationManager.error("Login failed. Please try again.");
    }
  };

  const chooseUs = [
    { title: 'Modern Equipment', icon: <Dumbbell className="text-brand" size={32} />, desc: 'Elite hardware for high-performance training cycles.' },
    { title: 'Healthy Nutrition', icon: <Heart className="text-brand" size={32} />, desc: 'Customized meal plans built for your body goals.' },
    { title: 'Pro Training', icon: <Award className="text-brand" size={32} />, desc: 'Expert coaches dedicated to your physical evolution.' },
    { title: 'Unique Needs', icon: <Target className="text-brand" size={32} />, desc: 'Tailored programs for rehab and peak performance.' },
  ];

  const services = [
    { title: 'Training Programmes', icon: <Activity />, desc: 'Customized training paths for peak performance. KES 1,000', image: '/assets/svc/trainning programmes.PNG' },
    { title: 'Meal Plans', icon: <Brain />, desc: 'Nutrition strategies built for your body goals. KES 1,000', image: '/assets/svc/meal plan.PNG' },
    { title: 'Personal Training (PT)', icon: <UserCheck />, desc: '1-on-1 elite coaching and dedicated sessions. KES 4,000/mo', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000' },
    { title: 'Strength & Conditioning', icon: <Dumbbell />, desc: 'Elite power and performance development.', image: '/assets/svc/strength conditioning.PNG' },
    { title: 'Cardio Classes', icon: <Zap />, desc: 'High-intensity physical and online cardio sessions.', image: '/assets/svc/cardio classes.PNG' },
    { title: 'Body Goals', icon: <Target />, desc: 'Weight loss, muscle building, and transformation.', image: '/assets/svc/body goals.PNG' },
    { title: 'Injury Recovery', icon: <ShieldAlert />, desc: 'Specialized recovery and injury rehabilitation.', image: '/assets/svc/injury recovery.PNG' },
    { title: 'Deep Tissue Stretches', icon: <Flame />, desc: 'Advanced mobility and muscle recovery work.', image: '/assets/svc/deep tissue stretches.PNG' },
  ];

  return (
    <div className="bg-[#151515] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={siteText.hero_image?.imageUrl || "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=2070"} 
            className="w-full h-full object-cover opacity-40" 
            alt="Hero Background"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl"
          >
            <span className="text-brand font-black uppercase tracking-[0.4em] text-sm mb-6 block">Shape your body</span>
            <h1 className="text-6xl md:text-8xl font-display uppercase italic tracking-tighter leading-none mb-8">
              {siteText.hero_title?.title || 'BE STRONG'} <br />
              <span className="text-white">TRAINING</span> <span className="text-brand">HARD</span>
            </h1>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl leading-relaxed">
              {siteText.hero_description?.body || 'We don\'t just build bodies; we forge legends. Our 3rd Way philosophy combines scientific training with raw intensity.'}
            </p>
            <button 
              onClick={handleLogin}
              className="premium-button flex items-center gap-3"
            >
              {user ? 'GO TO DASHBOARD' : 'GET STARTED'} <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-24 bg-[#151515]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="section-title">
            <span>Why Choose Us</span>
            <h2>Push Your Limits Forward</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {chooseUs.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-[#222222] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand transition-all duration-500">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black uppercase mb-4 group-hover:text-brand transition-colors">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Can Offer */}
      <section id="services" className="py-24 bg-[#101010]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="section-title">
            <span>Our Services</span>
            <h2>What We Can Offer</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {services.map((service, idx) => (
              <div key={idx} className="relative aspect-[4/5] overflow-hidden group">
                <img 
                  src={siteText[`service_${idx}_image`]?.imageUrl || (service as any).image} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  alt={service.title}
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-8 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="text-brand mb-4">
                    {React.cloneElement(service.icon as React.ReactElement, { size: 48 })}
                  </div>
                  <h3 className="text-2xl font-black uppercase italic mb-2">{service.title}</h3>
                  <p className="text-zinc-400 text-xs mb-6">{service.desc}</p>
                  <ArrowRight className="text-brand" />
                </div>
                <div className="absolute bottom-10 left-0 right-0 text-center group-hover:opacity-0 transition-opacity">
                   <h3 className="text-2xl font-black uppercase italic text-white/90 drop-shadow-lg">{service.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand/90 skew-y-1 transform origin-left"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-display uppercase italic text-black leading-none mb-4">Registration Now to get more deals</h2>
            <p className="text-black/70 font-bold uppercase tracking-widest text-xs italic">Where health, beauty and fitness meet.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="bg-black text-white px-12 py-5 font-black uppercase tracking-widest text-sm hover:bg-[#222222] transition-all"
          >
            {user ? 'DASHBOARD' : 'JOIN THE TRIBE'}
          </button>
        </div>
      </section>

      {/* Our Classes (Programs) */}
      <section className="py-24 bg-[#151515]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="section-title">
            <span>Our Programs</span>
            <h2>Train With Experts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProgramCard 
              title="HOUSE OF PAIN" 
              desc={siteText.hop_desc?.body || "Elite strength & conditioning. Weekly high-intensity cycles."}
              img="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000"
              category="S-TIER"
            />
            <ProgramCard 
              title="WARRIOR HIKES" 
              desc={siteText.hike_desc?.body || "Tactical rucking and endurance training through Kenya's rugged terrain."}
              img="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000"
              category="ENDURANCE"
            />
            <ProgramCard 
              title="IRON BOOTCAMP" 
              desc={siteText.bootcamp_desc?.body || "Comprehensive physical transformation. Group training with elite accountability."}
              img="https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=1000"
              category="ELITE"
            />
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section className="py-24 bg-[#101010]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="section-title">
            <span>Our Team</span>
            <h2>Train With Experts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TrainerCard 
              name="Caleb Malemo"
              role="Head Coach & Founder"
              img="/assets/svc/caleb malemo.PNG"
            />
            <TrainerCard 
              name="Sharon Wanjiku"
              role="Nutrition Specialist"
              img="/assets/svc/sharon wanjiku.PNG"
            />
            <TrainerCard 
              name="David Otieno"
              role="Strength Coach"
              img="/assets/svc/david otieno.PNG"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[#151515]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="section-title">
            <span>Our Plan</span>
            <h2>Choose Your Pricing Plan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PriceCard 
              tier="IRON CUBS" 
              price="150" 
              unit="/session"
              features={['Movement Games', 'Basic Calisthenics', 'Team Building', 'Discipline Focus', 'No time restriction']}
              user={user}
              onEnroll={handleLogin}
            />
            <PriceCard 
              tier="IRON INITIATES" 
              price="250"
              unit="/session"
              features={['Explosive Training', 'Form Mastery', 'Mental Fortitude', 'Group Roadwork', 'Personal trainer']}
              featured
              user={user}
              onEnroll={handleLogin}
            />
            <PriceCard 
              tier="WARRIOR ELITE" 
              price="500"
              unit="/session"
              features={['House of Pain Access', 'Advanced Strength', 'Nutritional Forge', 'Tactical Camps', 'Unlimited equipments']}
              user={user}
              onEnroll={handleLogin}
            />
            <PriceCard 
              tier="ELITE COACHING" 
              price="4,000"
              unit="/month"
              features={['Personal Trainer', 'Custom Workout cycles', 'Bi-weekly Checkins', 'Premium Support', 'Meal Plan Included']}
              user={user}
              onEnroll={handleLogin}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#101010]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="section-title">
            <span>Contact Us</span>
            <h2>Get In Touch</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-3xl font-black uppercase italic italic mb-6">Location & Info</h3>
              <div className="space-y-6">
                <ContactInfo icon={<MapPin className="text-brand" />} title="Location" content="Nairobi, Kenya" />
                <ContactInfo icon={<Phone className="text-brand" />} title="Phone" content="+254 795 545401" />
                <ContactInfo icon={<Mail className="text-brand" />} title="Email" content="Malemocaleb730@gmail.com" />
              </div>
            </div>
            <form className="space-y-4">
              <input type="text" placeholder="Name" className="w-full bg-[#1a1a1a] border border-white/5 p-4 outline-none focus:border-brand transition-all" />
              <input type="email" placeholder="Email" className="w-full bg-[#1a1a1a] border border-white/5 p-4 outline-none focus:border-brand transition-all" />
              <textarea placeholder="Comment" className="w-full bg-[#1a1a1a] border border-white/5 p-4 outline-none focus:border-brand transition-all min-h-[150px]"></textarea>
              <button className="premium-button w-full">BOOK APPOINTMENT</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProgramCard = ({ title, desc, img, category }: { title: string, desc: string, img: string, category: string }) => (
  <div className="relative aspect-[4/3] overflow-hidden group rounded-lg">
    <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" alt={title} />
    <div className="absolute inset-0 bg-black/50 group-hover:bg-brand/80 transition-all duration-500 flex flex-col justify-end p-8">
      <span className="text-brand group-hover:text-black font-black text-xs uppercase tracking-widest mb-2 transition-colors">{category}</span>
      <h3 className="text-3xl font-black italic uppercase text-white group-hover:text-black transition-colors mb-4">{title}</h3>
      <p className="text-zinc-300 group-hover:text-black/80 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{desc}</p>
    </div>
  </div>
);

const TrainerCard = ({ name, role, img }: { name: string, role: string, img: string }) => (
  <div className="relative aspect-[4/5] overflow-hidden group">
    <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" alt={name} />
    <div className="absolute inset-x-0 bottom-0 p-8 text-center bg-black/80 backdrop-blur-sm border-t-2 border-brand transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
      <h3 className="text-xl font-black uppercase italic mb-1">{name}</h3>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{role}</p>
    </div>
  </div>
);

const ContactInfo = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) => (
  <div className="flex items-center gap-6 group">
    <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center group-hover:bg-brand group-hover:text-black transition-all duration-300">
      {icon}
    </div>
    <div>
      <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-white font-bold">{content}</p>
    </div>
  </div>
);

const PriceCard = ({ tier, price, unit, features, featured, user, onEnroll }: any) => (
  <div className={cn(
    "p-12 border-2 transition-all duration-500 hover:border-brand",
    featured ? "border-brand bg-[#1a1a1a]" : "border-white/5 bg-[#151515]"
  )}>
    <div className="text-center mb-10">
      <h3 className="text-2xl font-black italic uppercase mb-8">{tier}</h3>
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="text-brand text-4xl font-black">KES</span>
        <span className="text-6xl font-black italic">{price}</span>
      </div>
      <span className="text-zinc-500 uppercase font-bold tracking-widest text-xs italic">{unit}</span>
    </div>
    
    <ul className="space-y-4 mb-12 text-center text-zinc-400 text-sm italic font-medium">
      {features.map((f: string, i: number) => (
        <li key={i}>{f}</li>
      ))}
    </ul>
    
    <button 
      onClick={onEnroll}
      className={cn(
      "w-full py-4 font-black uppercase tracking-widest text-xs transition-all",
      featured ? "bg-brand text-white" : "bg-[#222222] text-white hover:bg-brand"
    )}>
      {user ? 'ACCESS NOW' : 'ENROLL NOW'}
    </button>
  </div>
);

export default LandingPage;
