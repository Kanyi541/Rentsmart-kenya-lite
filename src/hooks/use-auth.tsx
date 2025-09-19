
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import type { Tenant } from '@/lib/types';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { tenantSchema } from '@/lib/schemas';
import { z } from 'zod';

const auth = getAuth(app);

type UserRole = 'admin' | 'client' | null;
type RegisterData = Omit<z.infer<typeof tenantSchema>, 'id' | 'thirdName' | 'createdAt'> & { password: string };

const DEMO_ADMIN_EMAIL = 'rentsmart@demo.com';
const DEMO_TENANT_EMAIL = 'tenant@demo.com';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    userRole: UserRole;
    isDemoUser: boolean;
    forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [isDemoUser, setIsDemoUser] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                 if (user.email === DEMO_ADMIN_EMAIL || user.email === DEMO_TENANT_EMAIL) {
                    setIsDemoUser(true);
                } else {
                    setIsDemoUser(false);
                }

                // Check if user is in 'tenants' collection to determine role
                const tenantDoc = await getDoc(doc(db, 'tenants', user.uid));
                if (tenantDoc.exists()) {
                    setUserRole('client');
                } else {
                    // Assume anyone not in tenants is an admin for this app's logic
                    setUserRole('admin');
                }
            } else {
                 setUserRole(null);
                 setIsDemoUser(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };
    
    const register = async (data: RegisterData) => {
        const { email, password, ...tenantData } = data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Now, save the rest of the tenant's data to Firestore
        // using the UID from authentication as the document ID.
        await setDoc(doc(db, "tenants", user.uid), {
            ...tenantData,
            createdAt: serverTimestamp()
        });
    };

    const forgotPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const logout = async () => {
        const roleBeforeLogout = userRole;
        await signOut(auth);
        setUserRole(null); // Clear role on logout
        if(roleBeforeLogout === 'admin') {
            router.push('/admin/login');
        } else {
            router.push('/clients/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, userRole, isDemoUser, forgotPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
