import { getAnalyticsService } from './config';
import { logEvent, setUserProperties } from 'firebase/analytics';

/**
 * Track custom event
 */
export const trackEvent = async (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  try {
    const analytics = await getAnalyticsService();
    if (!analytics) {
      console.log('Analytics not supported');
      return;
    }

    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Set user properties
 */
export const setUserAnalyticsProperties = async (
  properties: Record<string, string | number | boolean>
) => {
  try {
    const analytics = await getAnalyticsService();
    if (!analytics) {
      console.log('Analytics not supported');
      return;
    }

    setUserProperties(analytics, properties);
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
};

/**
 * Track page view
 */
export const trackPageView = async (pagePath: string, pageTitle?: string) => {
  await trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

/**
 * Track user registration
 */
export const trackUserRegistration = async (method: string) => {
  await trackEvent('sign_up', { method });
};

/**
 * Track user login
 */
export const trackUserLogin = async (method: string) => {
  await trackEvent('login', { method });
};

/**
 * Track product view
 */
export const trackProductView = async (productId: string, productName: string) => {
  await trackEvent('view_item', {
    items: [
      {
        item_id: productId,
        item_name: productName,
      },
    ],
  });
};

/**
 * Track search
 */
export const trackSearch = async (searchTerm: string, results: number) => {
  await trackEvent('search', {
    search_term: searchTerm,
    number_of_results: results,
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = async (
  productId: string,
  productName: string,
  price: number,
  quantity: number
) => {
  await trackEvent('add_to_cart', {
    items: [
      {
        item_id: productId,
        item_name: productName,
        price,
        quantity,
      },
    ],
  });
};

/**
 * Track checkout initiation
 */
export const trackBeginCheckout = async (value: number, currency: string = 'EGP') => {
  await trackEvent('begin_checkout', {
    value,
    currency,
  });
};

/**
 * Track purchase
 */
export const trackPurchase = async (
  transactionId: string,
  value: number,
  currency: string = 'EGP',
  items: Array<{ item_id: string; item_name: string; price: number; quantity: number }>
) => {
  await trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
};

/**
 * Track button click
 */
export const trackButtonClick = async (buttonName: string, location?: string) => {
  await trackEvent('button_click', {
    button_name: buttonName,
    location,
  });
};

/**
 * Track form submission
 */
export const trackFormSubmission = async (formName: string, status: 'success' | 'error') => {
  await trackEvent('form_submit', {
    form_name: formName,
    status,
  });
};
