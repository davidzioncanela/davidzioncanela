'use client';

import { useEffect, useState } from 'react';
import { MobileControls } from './MobileControls';
import { useInput } from '@/contexts/InputContext';

// Detecta aparelho de toque (celular/tablet)
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const check = () => setIsTouch(window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isTouch;
}

export function DeviceDetector() {
  const isTouch = useIsTouch();
  const { setKey } = useInput();
  if (!isTouch) return null;
  return <MobileControls onPress={setKey} />;
}
