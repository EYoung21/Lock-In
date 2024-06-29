// react-native-launcher-kit.d.ts
declare module 'react-native-launcher-kit' {
  interface InstalledApp {
    label: string;
    packageName: string; // Changed from 'package' to 'packageName' to match actual return type
  }

  interface InstalledApps {
    getApps(): Promise<InstalledApp[]>;
  }

  const InstalledApps: InstalledApps;
  export { InstalledApps };
}
