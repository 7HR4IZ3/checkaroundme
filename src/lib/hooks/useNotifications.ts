import { useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';

export function useNotifications(options = { limit: 20, offset: 0 }) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = trpc.getNotifications.useQuery(options);

  const { mutate: markAsRead } = trpc.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: registerDeviceToken } = trpc.registerDeviceToken.useMutation();

  const registerPushNotifications = useCallback(async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        
        const token = btoa(JSON.stringify(subscription));
        await registerDeviceToken(token);
      }
    }
  }, [registerDeviceToken]);

  useEffect(() => {
    registerPushNotifications();
  }, [registerPushNotifications]);

  return {
    notifications: data?.notifications || [],
    total: data?.total || 0,
    isLoading,
    error,
    markAsRead,
    refetch,
  };
}