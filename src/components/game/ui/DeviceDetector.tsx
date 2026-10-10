'use client';

import { useEffect, useState } from 'react';
import { MobileControls } from './MobileControls';
import { useInput } from '@/contexts/InputContext';

export function DeviceDetector() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { setKey } = useInput();

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouch || isCoarsePointer);
    };
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  if (!isTouchDevice) return null;

  return <MobileControls onPress={setKey} />;
}
