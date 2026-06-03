'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    errorEmitter.on('permission-error', (error) => {
      // Re-throw the error so it's caught by the Next.js development overlay
      // This provides the rich contextual information to the developer
      throw error;
    });
  }, []);

  return null;
}
