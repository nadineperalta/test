"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useDevice } from "./DeviceContext";

export function DeviceToggle() {
  const { mode, setMode } = useDevice();

  return (
    <div className="flex items-center rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setMode("desktop")}
        className={`p-3 transition-colors ${
          mode === "desktop"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent"
        }`}
        aria-label="Desktop view"
      >
        <Monitor className="w-5 h-5" />
      </button>
      <button
        onClick={() => setMode("ios")}
        className={`p-3 transition-colors ${
          mode === "ios"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent"
        }`}
        aria-label="iOS view"
      >
        <Smartphone className="w-5 h-5" />
      </button>
    </div>
  );
}
