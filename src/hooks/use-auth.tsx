
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { tenantSchema } from '@/lib/schemas';
import { z } from 'zod';
import type { Organization, PricingPlan } from '@/lib/types';

const auth = getAuth(app);

// Update super admin email here
const SUPER_ADMIN_EMAIL = 'owner@rentsmart.com'; 

type UserRole = 'admin' | 'client' | 'super-admin' | null;
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
    organization: Organization | null;
    isDemoUser: boolean;
    forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isDemoUser, setIsDemoUser] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
            setUser(authUser);
            if (!authUser) {
                setLoading(false);
                setUserRole(null);
                setOrgId(null);
                setOrganization(null);
                setIsDemoUser(false);
                return;
            }

            if (authUser.email === SUPER_ADMIN_EMAIL) {
                setUserRole('super-admin');
                setOrgId('system_owner');
                setLoading(false);
                return;
            }

            if (authUser.email === DEMO_ADMIN_EMAIL || authUser.email === DEMO_TENANT_EMAIL) {
                setIsDemoUser(true);
                setOrgId('demo_org');
                setOrganization({
                    id: 'demo_org',
                    name: 'Demo Organization',
                    ownerId: 'demo_admin_uid',
                    plan: 'Scale',
                    subscriptionStatus: 'active',
                    subscriptionEndDate: new Date(Date.now() + 86400000 * 30).toISOString(),
                    createdAt: serverTimestamp()
                });
                setUserRole(authUser.email === DEMO_ADMIN_EMAIL ? 'admin' : 'client');
                setLoading(false);
            } else {
                setIsDemoUser(false);
                const tenantDoc = await getDoc(doc(db, 'tenants', authUser.uid));
                if (tenantDoc.exists()) {
                    setUserRole('client');
                    setOrgId(tenantDoc.data().orgId);
                } else {
                    const adminDoc = await getDoc(doc(db, 'admins', authUser.uid));
                    if (adminDoc.exists()) {
                        setUserRole('admin');
                        setOrgId(adminDoc.data().orgId);
                    } else {
                        setUserRole(null);
                        setOrgId(null);
                    }
                }
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!orgId || isDemoUser || userRole === 'super-admin') return;

        const unsubscribeOrg = onSnapshot(doc(db, 'organizations', orgId), (snapshot) => {
            if (snapshot.exists()) {
                setOrganization({ id: snapshot.id, ...snapshot.data() } as Organization);
            } else {
                setOrganization(null);
            }
        });

        return () => unsubscribeOrg();
    }, [orgId, isDemoUser, userRole]);

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
            orgId: tenantData.orgId,
            createdAt: serverTimestamp()
        });
    };

    const registerLandlord = async (data: any) => {
        const { email, password, organizationName, plan = 'Starter', ...adminData } = data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const orgRef = doc(db, "organizations", user.uid);
        await setDoc(orgRef, {
            name: organizationName,
            ownerId: user.uid,
            plan: plan as PricingPlan,
            subscriptionStatus: 'pending_payment',
            subscriptionEndDate: endDate.toISOString(),
            createdAt: serverTimestamp()
        });

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
        setOrganization(null);
        setIsDemoUser(false);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, registerLandlord, userRole, orgId, organization, isDemoUser, forgotPassword }}>
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
