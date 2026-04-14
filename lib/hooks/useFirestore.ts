'use client';

import { useEffect, useState } from 'react';
import { subscribeToDocument, subscribeToCollection } from '@/lib/firebase/database';
import { QueryConstraint, DocumentData } from 'firebase/firestore';

export const useFirestoreDocument = <T extends DocumentData>(
  collectionName: string,
  docId: string
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToDocument<T>(
        collectionName,
        docId,
        (doc) => {
          setData(doc);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading document');
      setLoading(false);
    }
  }, [collectionName, docId]);

  return { data, loading, error };
};

export const useFirestoreCollection = <T extends DocumentData>(
  collectionName: string,
  constraints?: QueryConstraint[]
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCollection<T>(
        collectionName,
        constraints || [],
        (docs) => {
          setData(docs);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading collection');
      setLoading(false);
    }
  }, [collectionName, constraints]);

  return { data, loading, error };
};
