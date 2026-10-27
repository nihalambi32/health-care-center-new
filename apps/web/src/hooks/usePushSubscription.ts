import { useState, useEffect } from 'react';
import { registerPushSubscription, unsubscribePush } from '../lib/push';

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSubscription() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setLoading(false);
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, []);

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const sub = await registerPushSubscription();
      setIsSubscribed(!!sub);
      return sub;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await unsubscribePush();
      if (success) setIsSubscribed(false);
      return success;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, loading, error, subscribe, unsubscribe };
}
