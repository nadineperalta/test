"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useDevice } from "./DeviceContext";
import { ControlCenter } from "./ControlCenter";

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { mode, gestureMode } = useDevice();
  const frameRef = useRef<HTMLDivElement>(null);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);
  const [swipeIndicator, setSwipeIndicator] = useState<{
    direction: string;
    x: number;
    y: number;
  } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const [longPressPos, setLongPressPos] = useState<{ x: number; y: number } | null>(null);
  const [tapRipple, setTapRipple] = useState<{ x: number; y: number } | null>(null);

  // Clean up long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // Reset gesture state when mode changes
  useEffect(() => {
    setSwipeStart(null);
    setSwipeIndicator(null);
    setLongPressActive(false);
    setLongPressPos(null);
    setTapRipple(null);
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, [gestureMode]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!gestureMode || gestureMode === "tap") return;

      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (gestureMode === "swipe") {
        setSwipeStart({ x, y });
      }

      if (gestureMode === "longpress") {
        setLongPressPos({ x, y });
        setLongPressActive(false);
        longPressTimer.current = setTimeout(() => {
          setLongPressActive(true);
          // Visual feedback for long press
          const el = document.elementFromPoint(e.clientX, e.clientY);
          if (el) {
            el.dispatchEvent(
              new PointerEvent("contextmenu", { bubbles: true, clientX: e.clientX, clientY: e.clientY })
            );
          }
        }, 500);
      }
    },
    [gestureMode]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (gestureMode === "swipe" && swipeStart) {
        const rect = frameRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - swipeStart.x;
        const dy = y - swipeStart.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > 20 || absDy > 20) {
          let direction: string;
          if (absDx > absDy) {
            direction = dx > 0 ? "right" : "left";
          } else {
            direction = dy > 0 ? "down" : "up";
          }
          setSwipeIndicator({ direction, x, y });
        }
      }

      if (gestureMode === "longpress" && longPressTimer.current) {
        const rect = frameRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (longPressPos) {
          const dist = Math.sqrt((x - longPressPos.x) ** 2 + (y - longPressPos.y) ** 2);
          if (dist > 10) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
            setLongPressPos(null);
          }
        }
      }
    },
    [gestureMode, swipeStart, longPressPos]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (gestureMode === "tap") {
        const rect = frameRef.current?.getBoundingClientRect();
        if (rect) {
          setTapRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setTimeout(() => setTapRipple(null), 400);
        }
      }

      if (gestureMode === "swipe" && swipeIndicator) {
        // Perform swipe action
        const content = frameRef.current?.querySelector("[data-frame-content]");
        if (content) {
          if (swipeIndicator.direction === "up") {
            content.scrollBy({ top: 200, behavior: "smooth" });
          } else if (swipeIndicator.direction === "down") {
            content.scrollBy({ top: -200, behavior: "smooth" });
          }
        }
        setSwipeIndicator(null);
        setSwipeStart(null);
      }

      if (gestureMode === "longpress") {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        setLongPressActive(false);
        setLongPressPos(null);
      }
    },
    [gestureMode, swipeIndicator]
  );

  if (mode === "desktop") return <>{children}</>;

  const cursorClass =
    gestureMode === "swipe"
      ? "cursor-grab"
      : gestureMode === "longpress"
        ? "cursor-pointer"
        : gestureMode === "tap"
          ? "cursor-pointer"
          : "";

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1a1a1e] py-8 px-4">
      {/* iPhone frame */}
      <div className="relative w-[393px] h-[852px] rounded-[50px] border-[6px] border-[#2a2a2e] bg-background shadow-2xl overflow-hidden flex flex-col">
        {/* Status bar */}
        <div className="shrink-0 flex items-center justify-between px-8 pt-3 pb-1 bg-background/80 backdrop-blur-sm z-20">
          <span className="text-xs font-semibold text-foreground">9:41</span>
          {/* Dynamic Island */}
          <div className="w-[126px] h-[37px] bg-black rounded-full" />
          <div className="flex items-center gap-1.5">
            {/* Signal */}
            <svg width="17" height="12" viewBox="0 0 17 12" className="text-foreground">
              <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
              <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="currentColor" />
              <rect x="9" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" className="text-foreground">
              <path d="M8 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="currentColor" transform="translate(0,-2)" />
              <path d="M4.5 8.5c2-2 5-2 7 0" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 5.5c3.5-3.5 9-3.5 12.5 0" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {/* Battery */}
            <svg width="27" height="12" viewBox="0 0 27 12" className="text-foreground">
              <rect x="0" y="0" width="23" height="12" rx="3" stroke="currentColor" fill="none" strokeWidth="1" />
              <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" opacity="0.9" />
              <path d="M25 4v4a2 2 0 000-4z" fill="currentColor" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={frameRef}
          data-frame-content
          className={`flex-1 overflow-y-auto overflow-x-hidden relative ${cursorClass}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {children}

          {/* Tap ripple */}
          {tapRipple && (
            <div
              className="pointer-events-none absolute w-12 h-12 rounded-full bg-primary/30 animate-ping"
              style={{ left: tapRipple.x - 24, top: tapRipple.y - 24 }}
            />
          )}

          {/* Swipe indicator */}
          {swipeIndicator && (
            <div
              className="pointer-events-none absolute z-50 flex items-center justify-center"
              style={{ left: swipeIndicator.x - 30, top: swipeIndicator.y - 30 }}
            >
              <div className="w-[60px] h-[60px] rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-primary text-2xl">
                  {swipeIndicator.direction === "up" && "\u2191"}
                  {swipeIndicator.direction === "down" && "\u2193"}
                  {swipeIndicator.direction === "left" && "\u2190"}
                  {swipeIndicator.direction === "right" && "\u2192"}
                </span>
              </div>
            </div>
          )}

          {/* Long press indicator */}
          {longPressPos && (
            <div
              className="pointer-events-none absolute z-50"
              style={{ left: longPressPos.x - 25, top: longPressPos.y - 25 }}
            >
              <div
                className={`w-[50px] h-[50px] rounded-full border-2 transition-all duration-500 ${
                  longPressActive
                    ? "border-primary bg-primary/20 scale-125"
                    : "border-primary/40 bg-transparent scale-100"
                }`}
              />
            </div>
          )}
        </div>

        {/* Home indicator */}
        <div className="shrink-0 flex justify-center py-2 bg-background">
          <div className="w-36 h-1.5 rounded-full bg-foreground/30" />
        </div>
      </div>

      {/* Gesture mode badge */}
      {gestureMode && (
        <div className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg">
          {gestureMode === "tap" && "Tap Mode - Click to simulate tap"}
          {gestureMode === "longpress" && "Long Press Mode - Hold to trigger"}
          {gestureMode === "swipe" && "Swipe Mode - Drag to swipe"}
        </div>
      )}

      {/* Control Center */}
      <ControlCenter />
    </div>
  );
}
