import { useEffect } from 'react';

class EventEmitter {
  private events: { [key: string]: Array<(...args: any[]) => void> } = {};
  private debounceTimers: { [key: string]: NodeJS.Timeout } = {};

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

  // Emitir con debounce para evitar spam de eventos
  emitWithDebounce(event: string, delay: number = 300, ...args: any[]) {
    const key = `${event}_${JSON.stringify(args)}`;
    
    if (this.debounceTimers[key]) {
      clearTimeout(this.debounceTimers[key]);
    }
    
    this.debounceTimers[key] = setTimeout(() => {
      this.emit(event, ...args);
      delete this.debounceTimers[key];
    }, delay);
  }
}

export const eventEmitter = new EventEmitter();

export const useEventListener = (event: string, callback: (...args: any[]) => void) => {
  useEffect(() => {
    eventEmitter.on(event, callback);
    return () => eventEmitter.off(event, callback);
  }, [event, callback]);
};