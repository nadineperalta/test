"use client";

import { useState } from "react";
import {
  Hand,
  MousePointerClick,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Timer,
  RotateCcw,
  Grip,
  X,
  Pointer,
} from "lucide-react";
import { useDevice, type GestureMode } from "./DeviceContext";

export function ControlCenter() {
  const { mode, gestureMode, setGestureMode, controlCenterOpen, setControlCenterOpen } = useDevice();
  const [scrollTarget, setScrollTarget] = useState<"up" | "down" | null>(null);

  if (mode !== "ios") return null;

  function handleScroll(direction: "up" | "down") {
    setScrollTarget(direction);
    const frame = document.querySelector("[data-frame-content]");
    if (frame) {
      frame.scrollBy({
        top: direction === "down" ? 300 : -300,
        behavior: "smooth",
      });
    }
    setTimeout(() => setScrollTarget(null), 300);
  }

  function handleRefresh() {
    const frame = document.querySelector("[data-frame-content]");
    if (frame) {
      frame.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.location.reload();
  }

  function selectGesture(g: GestureMode) {
    setGestureMode(gestureMode === g ? null : g);
  }

  return (
    <>
      {/* Floating trigger button */}
      {!controlCenterOpen && (
        <button
          onClick={() => setControlCenterOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-2xl bg-[#2a2a2e] text-white shadow-2xl flex items-center justify-center hover:bg-[#3a3a3e] transition-colors border border-white/10"
          aria-label="Open Control Center"
        >
          <Grip className="w-6 h-6" />
        </button>
      )}

      {/* Control Center Panel */}
      {controlCenterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            onClick={() => setControlCenterOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-0 right-0 z-[80] w-full max-w-sm m-4 mb-6 mr-6 rounded-3xl bg-[#1c1c1e]/95 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-white/90 text-sm font-semibold uppercase tracking-widest">
                Control Center
              </h3>
              <button
                onClick={() => setControlCenterOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gesture Modes */}
            <div className="px-5 pb-3">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">
                Interaction Mode
              </p>
              <div className="grid grid-cols-3 gap-2">
                <GestureButton
                  icon={<MousePointerClick className="w-6 h-6" />}
                  label="Tap"
                  active={gestureMode === "tap"}
                  onClick={() => selectGesture("tap")}
                />
                <GestureButton
                  icon={<Timer className="w-6 h-6" />}
                  label="Long Press"
                  active={gestureMode === "longpress"}
                  onClick={() => selectGesture("longpress")}
                />
                <GestureButton
                  icon={<Hand className="w-6 h-6" />}
                  label="Swipe"
                  active={gestureMode === "swipe"}
                  onClick={() => selectGesture("swipe")}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-5 pb-3">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">
                Quick Actions
              </p>
              <div className="grid grid-cols-4 gap-2">
                <ActionButton
                  icon={<ArrowUp className="w-5 h-5" />}
                  label="Scroll Up"
                  active={scrollTarget === "up"}
                  onClick={() => handleScroll("up")}
                />
                <ActionButton
                  icon={<ArrowDown className="w-5 h-5" />}
                  label="Scroll Down"
                  active={scrollTarget === "down"}
                  onClick={() => handleScroll("down")}
                />
                <ActionButton
                  icon={<RotateCcw className="w-5 h-5" />}
                  label="Refresh"
                  onClick={handleRefresh}
                />
                <ActionButton
                  icon={<Pointer className="w-5 h-5" />}
                  label="Reset"
                  onClick={() => setGestureMode(null)}
                  active={gestureMode === null}
                />
              </div>
            </div>

            {/* Swipe shortcuts (only when swipe mode is active) */}
            {gestureMode === "swipe" && (
              <div className="px-5 pb-3">
                <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-3">
                  Swipe Direction
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <ActionButton
                    icon={<ArrowLeft className="w-5 h-5" />}
                    label="Left"
                    onClick={() => {
                      const frame = document.querySelector("[data-frame-content]");
                      if (frame) frame.scrollBy({ left: -200, behavior: "smooth" });
                    }}
                  />
                  <ActionButton
                    icon={<ArrowRight className="w-5 h-5" />}
                    label="Right"
                    onClick={() => {
                      const frame = document.querySelector("[data-frame-content]");
                      if (frame) frame.scrollBy({ left: 200, behavior: "smooth" });
                    }}
                  />
                  <ActionButton
                    icon={<ArrowUp className="w-5 h-5" />}
                    label="Up"
                    onClick={() => handleScroll("up")}
                  />
                  <ActionButton
                    icon={<ArrowDown className="w-5 h-5" />}
                    label="Down"
                    onClick={() => handleScroll("down")}
                  />
                </div>
              </div>
            )}

            {/* Active gesture hint */}
            <div className="px-5 pb-5">
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-white/50 text-xs leading-relaxed">
                  {!gestureMode && "Select an interaction mode to simulate iOS gestures on the device preview."}
                  {gestureMode === "tap" && "Tap mode active. Click anywhere on the device to simulate a finger tap with visual feedback."}
                  {gestureMode === "longpress" && "Long press mode active. Press and hold on the device for 500ms to trigger a long press action."}
                  {gestureMode === "swipe" && "Swipe mode active. Click and drag on the device to simulate swipe gestures with directional detection."}
                </p>
              </div>
            </div>

            {/* Bottom handle */}
            <div className="flex justify-center pb-3">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function GestureButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-white/10 text-white/70 hover:bg-white/15"
      }`}
    >
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function ActionButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${
        active
          ? "bg-white/20 text-white"
          : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
      }`}
    >
      {icon}
      <span className="text-[9px] font-medium tracking-wide">{label}</span>
    </button>
  );
}
