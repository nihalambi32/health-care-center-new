import { apiClient } from './apiClient';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported in this browser.');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied.');
  }

  // Get VAPID public key from backend
  const { data } = await apiClient.get('/notifications/vapid-public-key');
  const vapidPublicKey = data.data.publicKey;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey.buffer as ArrayBuffer,
    });
  }

  // Sync to backend
  const subJSON = subscription.toJSON();
  await apiClient.post('/notifications/subscribe', {
    endpoint: subJSON.endpoint,
    keys: {
      p256dh: subJSON.keys?.p256dh,
      auth: subJSON.keys?.auth,
    },
  });

  return subscription;
}

export async function unsubscribePush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await apiClient.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
    return await subscription.unsubscribe();
  }
  return false;
}
