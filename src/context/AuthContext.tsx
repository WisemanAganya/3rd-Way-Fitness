import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  memberData: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  memberData: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        setIsAdmin(adminDoc.exists());

        // Get member data or create if doesn't exist
        const memberRef = doc(db, 'members', user.uid);
        const memberSnap = await getDoc(memberRef);
        
        if (memberSnap.exists()) {
          setMemberData(memberSnap.data());
        } else {
          const newData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ageCategory: 'adult',
            progressionLevel: 'Beginner',
            createdAt: new Date().toISOString(),
          };
          await setDoc(memberRef, newData);
          setMemberData(newData);
        }
      } else {
        setIsAdmin(false);
        setMemberData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, memberData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
