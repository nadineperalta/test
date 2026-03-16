"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type DeviceMode = "desktop" | "ios";
export type GestureMode = "tap" | "longpress" | "swipe" | null;

interface DeviceContextValue {
  mode: DeviceMode;
  setMode: (mode: DeviceMode) => void;
  gestureMode: GestureMode;
  setGestureMode: (mode: GestureMode) => void;
  controlCenterOpen: boolean;
  setControlCenterOpen: (open: boolean) => void;
}

const DeviceContext = createContext<DeviceContextValue>({
  mode: "desktop",
  setMode: () => {},
  gestureMode: null,
  setGestureMode: () => {},
  controlCenterOpen: false,
  setControlCenterOpen: () => {},
});

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DeviceMode>("desktop");
  const [gestureMode, setGestureMode] = useState<GestureMode>(null);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("device-mode") as DeviceMode | null;
    if (stored === "ios" || stored === "desktop") setModeState(stored);
    setMounted(true);
  }, []);

  const setMode = useCallback((m: DeviceMode) => {
    setModeState(m);
    localStorage.setItem("device-mode", m);
    if (m === "desktop") {
      setGestureMode(null);
      setControlCenterOpen(false);
    }
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <DeviceContext.Provider
      value={{ mode, setMode, gestureMode, setGestureMode, controlCenterOpen, setControlCenterOpen }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
