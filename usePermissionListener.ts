import { useEffect, useCallback, useRef } from 'react';
import { NativeEventEmitter, NativeModules, AppState, EmitterSubscription, NativeEventSubscription } from 'react-native';

const { PermissionListener, AppServiceModule } = NativeModules;

type SetPermissionFunction = (enabled: boolean) => void;

const usePermissionListener = (
  setAppMonitoringEnabled: SetPermissionFunction,
  setManageOverlayEnabled: SetPermissionFunction,
  isLockedIn: boolean
) => {
  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);
  const appStateSubscriptionRef = useRef<NativeEventSubscription | null>(null);

  const checkAndSyncPermissions = useCallback(async () => {
    try {
      const usageStatsPermission = await AppServiceModule.hasUsageStatsPermission();
      const manageOverlayPermission = await AppServiceModule.hasManageOverlayPermission();

      setAppMonitoringEnabled(usageStatsPermission);
      setManageOverlayEnabled(manageOverlayPermission);

      if (isLockedIn && usageStatsPermission && manageOverlayPermission) {
        await AppServiceModule.startService();
      } else {
        await AppServiceModule.stopService();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, [setAppMonitoringEnabled, setManageOverlayEnabled, isLockedIn]);

  useEffect(() => {
    let isMounted = true;
    const debouncedCheck = debounce(checkAndSyncPermissions, 300);

    const setupListeners = async () => {
      if (!eventEmitterRef.current) {
        eventEmitterRef.current = new NativeEventEmitter(PermissionListener);
      }

      const usageStatsListener = eventEmitterRef.current.addListener(
        'usageStatsPermissionChanged',
        debouncedCheck
      );

      const overlayListener = eventEmitterRef.current.addListener(
        'overlayPermissionChanged',
        debouncedCheck
      );

      await PermissionListener.startListening();

      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active' && isMounted) {
          debouncedCheck();
        }
      };

      appStateSubscriptionRef.current = AppState.addEventListener('change', handleAppStateChange);

      // Initial check
      debouncedCheck();

      return () => {
        isMounted = false;
        usageStatsListener.remove();
        overlayListener.remove();
        PermissionListener.stopListening();
        appStateSubscriptionRef.current?.remove();
        debouncedCheck.cancel();
      };
    };

    setupListeners();

    return () => {
      isMounted = false;
      if (eventEmitterRef.current) {
        eventEmitterRef.current.removeAllListeners('usageStatsPermissionChanged');
        eventEmitterRef.current.removeAllListeners('overlayPermissionChanged');
      }
      appStateSubscriptionRef.current?.remove();
      PermissionListener.stopListening();
      debouncedCheck.cancel();
    };
  }, [checkAndSyncPermissions]);
};

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  const debouncedFunction = function(this: any, ...args: Parameters<F>) {
    const context = this;
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func.apply(context, args), wait);
  } as F & { cancel: () => void };

  debouncedFunction.cancel = function() {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
  };

  return debouncedFunction;
}

export default usePermissionListener;