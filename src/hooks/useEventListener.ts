import { useEffect } from 'react';

class EventEmitter {
  private events: { [key: string]: Array<(...args: any[]) => void> } = {};

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }
}

export const eventEmitter = new EventEmitter();

export const useEventListener = (event: string, callback: (...args: any[]) => void) => {
  useEffect(() => {
    eventEmitter.on(event, callback);
    return () => eventEmitter.off(event, callback);
  }, [event, callback]);
};