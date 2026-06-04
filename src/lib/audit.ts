import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { headers } from 'next/headers';


export interface AuditEvent {
  type: string; // e.g., 'payment', 'orgDeletionRequested', 'orgDeletionConfirmed', 'orgDeletionCanceled', etc.
  orgId?: string;
  userId?: string; // UID of the user that triggered the event
  initiatedBy: 'super-admin' | 'admin' | 'system';
  details?: Record<string, any>;
  timestamp: string; // ISO string
  ipAddress?: string;
}

/**
 * Central helper to write an audit event to Firestore.
 * All server actions should call this to ensure a single source of truth.
 */
export async function logEvent(event: Omit<AuditEvent, 'timestamp' | 'ipAddress'>) {
  // Capture request IP if available (runs in a server context)
  let ip: string | undefined;
  try {
    const hdrs = headers();
    ip = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || undefined;
  } catch {
    // Not running in a request context – ignore
  }

  const fullEvent: AuditEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    ipAddress: ip,
  };

  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));

  await addDoc(collection(db, 'auditLogs'), {
    ...fullEvent,
    createdAt: serverTimestamp(),
    expiresAt,
  });
}
