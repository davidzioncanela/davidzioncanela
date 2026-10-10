'use client';

import { createContext, useContext, useRef, useEffect, ReactNode } from 'react';

interface InputContextType {
  keys: React.MutableRefObject<{ [key: string]: boolean }>;
  setKey: (key: string, pressed: boolean) => void;
}

const InputContext = createContext<InputContextType | null>(null);

export function InputProvider({ children }: { children: ReactNode }) {
  const keys = useRef<{ [key: string]: boolean }>({});

  const setKey = (key: string, pressed: boolean) => {
    keys.current[key] = pressed;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <InputContext.Provider value={{ keys, setKey }}>
      {children}
    </InputContext.Provider>
  );
}

export function useInput() {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error('useInput must be used within InputProvider');
  }
  return context;
}
