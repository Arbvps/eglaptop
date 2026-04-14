import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreService } from './config';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  specs: Record<string, string>;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

/**
 * Get a single document
 */
export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  try {
    const db = getFirestoreService();
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as T;
  } catch (error) {
    console.error(`Error fetching document from ${collectionName}:`, error);
    return null;
  }
};

/**
 * Get multiple documents with filters
 */
export const getDocuments = async <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const db = getFirestoreService();
    if (!db) throw new Error('Firestore not initialized');

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    return [];
  }
};

/**
 * Create a new document
 */
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<{ id: string; success: boolean; error?: string }> => {
  try {
    const db = getFirestoreService();
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(collection(db, collectionName));
    const docData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(docRef, docData);

    return {
      id: docRef.id,
      success: true,
    };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Update an existing document
 */
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const db = getFirestoreService();
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);

    return { success: true };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const db = getFirestoreService();
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Listen to real-time document changes
 */
export const subscribeToDocument = <T extends DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
) => {
  try {
    const db = getFirestoreService();
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        callback(null);
      } else {
        callback({
          id: docSnap.id,
          ...docSnap.data(),
        } as T);
      }
    });
  } catch (error) {
    console.error(`Error subscribing to ${collectionName}:`, error);
    return () => {};
  }
};

/**
 * Listen to real-time collection changes
 */
export const subscribeToCollection = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (data: T[]) => void
) => {
  try {
    const db = getFirestoreService();
    if (!db) throw new Error('Firestore not initialized');

    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(data);
    });
  } catch (error) {
    console.error(`Error subscribing to ${collectionName}:`, error);
    return () => {};
  }
};

/**
 * Get products with pagination
 */
export const getProducts = async (
  pageSize = 12,
  lastDoc?: any
): Promise<Product[]> => {
  const constraints: QueryConstraint[] = [limit(pageSize)];

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  return getDocuments<Product>('products', constraints);
};

/**
 * Search products by name or category
 */
export const searchProducts = async (
  searchTerm: string,
  category?: string
): Promise<Product[]> => {
  const constraints: QueryConstraint[] = [];

  if (category) {
    constraints.push(where('category', '==', category));
  }

  let products = await getDocuments<Product>('products', constraints);

  // Client-side filtering for search term
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch)
    );
  }

  return products;
};

/**
 * Get user orders
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const constraints = [where('userId', '==', userId)];
  return getDocuments<Order>('orders', constraints);
};

/**
 * Get product reviews
 */
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const constraints = [where('productId', '==', productId)];
  return getDocuments<Review>('reviews', constraints);
};

/**
 * Batch create/update documents
 */
export const batchWrite = async (
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    docId: string;
    data?: any;
  }>
) => {
  try {
    const db = getFirestoreService();
    if (!db) throw new Error('Firestore not initialized');

    const batch = require('firebase/firestore').writeBatch(db);

    for (const op of operations) {
      const docRef = doc(db, op.collection, op.docId);

      if (op.type === 'set') {
        batch.set(docRef, op.data);
      } else if (op.type === 'update') {
        batch.update(docRef, op.data);
      } else if (op.type === 'delete') {
        batch.delete(docRef);
      }
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error in batch write:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
