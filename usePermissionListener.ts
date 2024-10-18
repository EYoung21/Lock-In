import { useEffect, useCallback, useRef } from 'react';
import { NativeEventEmitter, NativeModules, AppState, EmitterSubscription, NativeEventSubscription } from 'react-native';

const { PermissionListener, AppServiceModule } = NativeModules;

type SetPermissionFunction = (enabled: boolean) => void;

const usePermissionListener = (
  setAppMonitoringEnabled: SetPermissionFunction,
  setManageOverlayEnabled: SetPermissionFunction,
  setAppMonitoringOn: SetPermissionFunction,
  setManageOverlayOn: SetPermissionFunction,
  isLockedIn: boolean,
) => {
  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);
  const appStateSubscriptionRef = useRef<NativeEventSubscription | null>(null);
  const isCheckingPermissions = useRef(false);

  const checkAndSyncPermissions = useCallback(async () => {
    if (isCheckingPermissions.current) return;
    isCheckingPermissions.current = true;

    try {
      const [usageStatsPermission, manageOverlayPermission] = await Promise.all([
        AppServiceModule.hasUsageStatsPermission(),
        AppServiceModule.hasManageOverlayPermission()
      ]);

      setAppMonitoringEnabled(usageStatsPermission);
      setManageOverlayEnabled(manageOverlayPermission);

      if (!usageStatsPermission) setAppMonitoringOn(false);
      if (!manageOverlayPermission) setManageOverlayOn(false);
      
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      isCheckingPermissions.current = false;
    }
  }, [setAppMonitoringEnabled, setManageOverlayEnabled, setAppMonitoringOn, setManageOverlayOn, isLockedIn]);

  const debouncedCheck = useCallback(debounce(checkAndSyncPermissions, 300), [checkAndSyncPermissions]);

  useEffect(() => {
    let isMounted = true;

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
        usageStatsListener.remove();
        overlayListener.remove();
        PermissionListener.stopListening();
        appStateSubscriptionRef.current?.remove();
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
  }, [debouncedCheck]);
};

// Improved debounce function
function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  const debouncedFunction = function(this: any, ...args: Parameters<F>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  } as F & { cancel: () => void };

  debouncedFunction.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  return debouncedFunction;
}

export default usePermissionListener;