'use client';

import { useEffect, useState } from 'react';
import { AuthUser, onAuthStateChanged } from '@/lib/firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      try {
        setUser(authUser);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth error');
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading, error };
};
