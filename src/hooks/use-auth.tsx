
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { tenantSchema } from '@/lib/schemas';
import { z } from 'zod';

const auth = getAuth(app);

type UserRole = 'admin' | 'client' | null;
type RegisterData = Omit<z.infer<typeof tenantSchema>, 'id' | 'thirdName' | 'createdAt'> & { password: string, orgId?: string };

const DEMO_ADMIN_EMAIL = 'rentsmart@demo.com';
const DEMO_TENANT_EMAIL = 'tenant@demo.com';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    registerLandlord: (data: any) => Promise<void>;
    userRole: UserRole;
    orgId: string | null;
    isDemoUser: boolean;
    forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [isDemoUser, setIsDemoUser] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            setUser(user);
            if (user) {
                 if (user.email === DEMO_ADMIN_EMAIL || user.email === DEMO_TENANT_EMAIL) {
                    setIsDemoUser(true);
                    setOrgId('demo_org');
                    setUserRole(user.email === DEMO_ADMIN_EMAIL ? 'admin' : 'client');
                } else {
                    setIsDemoUser(false);
                    // Check if user is in 'tenants' collection or 'admins'
                    const tenantDoc = await getDoc(doc(db, 'tenants', user.uid));
                    if (tenantDoc.exists()) {
                        setUserRole('client');
                        setOrgId(tenantDoc.data().orgId);
                    } else {
                        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                        if (adminDoc.exists()) {
                            setUserRole('admin');
                            setOrgId(adminDoc.data().orgId);
                        } else {
                            setUserRole(null);
                            setOrgId(null);
                        }
                    }
                }
            } else {
                 setUserRole(null);
                 setOrgId(null);
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
        if (!tenantData.orgId) throw new Error("Organization ID is required for tenants.");
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "tenants", user.uid), {
            ...tenantData,
            createdAt: serverTimestamp()
        });
    };

    const registerLandlord = async (data: any) => {
        const { email, password, organizationName, ...adminData } = data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create Organization
        const orgRef = doc(db, "organizations", user.uid); // Using user UID as orgId for owner
        await setDoc(orgRef, {
            name: organizationName,
            ownerId: user.uid,
            createdAt: serverTimestamp()
        });

        // Save Admin details
        await setDoc(doc(db, "admins", user.uid), {
            ...adminData,
            orgId: user.uid,
            email,
            createdAt: serverTimestamp()
        });
    };

    const forgotPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const logout = async () => {
        await signOut(auth);
        setUserRole(null);
        setOrgId(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, registerLandlord, userRole, orgId, isDemoUser, forgotPassword }}>
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
