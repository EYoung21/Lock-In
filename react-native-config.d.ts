// react-native-config.d.ts
declare module 'react-native-config' {
    interface Config {
      [key: string]: string;
    }
  
    const Config: Config;
    export default Config;
  }
  