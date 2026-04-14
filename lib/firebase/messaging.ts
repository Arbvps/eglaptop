import { getMessagingService } from './config';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return null;
    }

    // Request permission
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }
    }

    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Get messaging instance
    const messaging = await getMessagingService();
    if (!messaging) {
      console.log('Messaging not supported');
      return null;
    }

    // Get FCM token
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VAPID key not configured');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    return token || null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Listen to foreground messages
 */
export const setupForegroundMessageHandler = (
  callback: (payload: MessagePayload) => void
) => {
  const setupHandler = async () => {
    try {
      const messaging = await getMessagingService();
      if (!messaging) {
        console.log('Messaging not supported');
        return;
      }

      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
      });
    } catch (error) {
      console.error('Error setting up foreground message handler:', error);
    }
  };

  setupHandler();
};

/**
 * Setup Service Worker for background messages
 */
export const setupServiceWorker = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    console.log('Service Worker registered:', registration);
  } catch (error) {
    console.error('Error registering Service Worker:', error);
  }
};

/**
 * Send notification (client-side, for testing)
 */
export const sendLocalNotification = (title: string, options?: NotificationOptions) => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo.svg',
        ...options,
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Store FCM token in Firestore (call this after login)
 */
export const storeFcmToken = async (userId: string, token: string) => {
  try {
    const response = await fetch('/api/firebase/store-fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });

    if (!response.ok) {
      throw new Error('Failed to store FCM token');
    }

    return { success: true };
  } catch (error) {
    console.error('Error storing FCM token:', error);
    return { success: false, error };
  }
};
