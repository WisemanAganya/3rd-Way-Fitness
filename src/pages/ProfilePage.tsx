import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { motion } from 'motion/react';
import { User, Mail, Badge, Calendar, Save, Loader2, Edit3 } from 'lucide-react';
import { notificationManager } from '../lib/notifications';
import { formatCurrency } from '../lib/utils';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  ageCategory: string;
  progressionLevel: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
  totalSpent?: number;
  totalSessions?: number;
}

const ProfilePage: React.FC = () => {
  const { user, memberData } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const memberRef = doc(db, 'members', user.uid);
      const memberSnap = await getDoc(memberRef);
      
      if (memberSnap.exists()) {
        const data = memberSnap.data() as UserProfile;
        setProfile(data);
        setFormData(data);
      }
    } catch (error) {
      console.error(error);
      notificationManager.error('Failed to load profile');
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    try {
      // Update Firestore
      const memberRef = doc(db, 'members', user.uid);
      await updateDoc(memberRef, {
        displayName: formData.displayName || profile.displayName,
        bio: formData.bio || '',
        phone: formData.phone || '',
        progressionLevel: formData.progressionLevel || profile.progressionLevel,
      });

      // Update Firebase Auth profile
      if (formData.displayName && formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName,
        });
      }

      setProfile({ ...profile, ...formData });
      notificationManager.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      notificationManager.error('Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-black px-4 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="pt-32 min-h-screen bg-black px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-bold">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-black px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-display uppercase italic tracking-tighter">PROFILE</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Warrior Stats</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-brand text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Edit3 size={18} /> {isEditing ? 'CANCEL' : 'EDIT'}
          </button>
        </div>

        {/* Profile Header */}
        <div className="hardware-card rounded-[40px] p-12 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-32 h-32 rounded-full border-4 border-brand object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-brand bg-brand/10 flex items-center justify-center">
                  <User size={64} className="text-brand" />
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="flex-grow space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName || ''}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-white resize-none h-24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-white"
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                      Progression
                    </label>
                    <select
                      value={formData.progressionLevel || 'Beginner'}
                      onChange={(e) => setFormData({ ...formData, progressionLevel: e.target.value })}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-brand outline-none text-white text-sm"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Initiate">Initiate</option>
                      <option value="Warrior">Warrior</option>
                      <option value="Iron Soul">Iron Soul</option>
                      <option value="Legend">Legend</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-brand text-black font-black py-4 rounded-xl hover:bg-brand/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> SAVING...
                    </>
                  ) : (
                    <>
                      <Save size={20} /> SAVE CHANGES
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex-grow">
                <h2 className="text-4xl font-black italic uppercase mb-2">{profile.displayName}</h2>
                <div className="space-y-3 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-brand" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-brand" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge size={16} className="text-brand" />
                    <span className="text-sm capitalize">{profile.progressionLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-brand" />
                    <span className="text-sm">
                      Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
                {profile.bio && (
                  <p className="mt-4 text-sm italic text-zinc-300">{profile.bio}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -5 }} className="hardware-card rounded-[32px] p-8">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
              Age Category
            </span>
            <span className="text-3xl font-black italic capitalize">{profile.ageCategory}</span>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="hardware-card rounded-[32px] p-8">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
              Rank
            </span>
            <span className="text-3xl font-black italic text-brand">{profile.progressionLevel}</span>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="hardware-card rounded-[32px] p-8">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
              Member ID
            </span>
            <span className="text-2xl font-mono font-black text-brand">{user.uid.slice(-8).toUpperCase()}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
