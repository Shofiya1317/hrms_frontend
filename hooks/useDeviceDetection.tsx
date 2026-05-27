import { useEffect, useState } from 'react';
import {
  isDesktop as detectDesktop,
  isIOS as detectIos,
  isMobile as detectMobile,
  isMobileOnly as detectMobileOnly,
  isTablet as detectTablet,
} from 'react-device-detect';

type DeviceState = {
  isMobile: boolean;
  isMobileOnly: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
};

const defaultState: DeviceState = {
  isMobile: false,
  isMobileOnly: false,
  isTablet: false,
  isDesktop: false,
  isIOS: false,
};

export const useDeviceDetection = (): DeviceState => {
  const [detected, setDetected] = useState<DeviceState>(defaultState);

  useEffect(() => {
    // Single state update — one re-render instead of five
    setDetected({
      isMobile: detectMobile,
      isMobileOnly: detectMobileOnly,
      isTablet: detectTablet,
      isDesktop: detectDesktop,
      isIOS: detectIos,
    });
  }, []);

  return detected;
};
