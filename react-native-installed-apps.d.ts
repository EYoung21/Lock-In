// react-native-installed-apps.d.ts
declare module 'react-native-installed-apps' {
  interface InstalledApp {
    app: string;
    appPath: string;
    info: any;
  }

  interface AppList {
    getAll(): Promise<InstalledApp[]>;
  }

  const AppList: AppList;
  export default AppList;
}
