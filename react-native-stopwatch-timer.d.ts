declare module 'react-native-stopwatch-timer' {
    import { Component } from 'react';
    
    interface StopwatchProps {
      laps?: boolean;
      msecs?: boolean;
      start?: boolean;
      reset?: boolean;
      options?: {
        container?: object;
        text?: object;
      };
      getTime?: (time: string) => void;
    }
  
    interface TimerProps {
      totalDuration: number;
      msecs?: boolean;
      start?: boolean;
      reset?: boolean;
      options?: {
        container?: object;
        text?: object;
      };
      handleFinish?: () => void;
      getTime?: (time: string) => void;
    }
  
    export class Stopwatch extends Component<StopwatchProps> {}
    export class Timer extends Component<TimerProps> {}
  }
  