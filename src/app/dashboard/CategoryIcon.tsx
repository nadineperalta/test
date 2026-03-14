"use client";

import {
  Dumbbell, Heart, BookOpen, Brain, Sparkles, UtensilsCrossed,
  DollarSign, GraduationCap, Music, Home, Moon, Droplets,
  PenLine, Code, Briefcase, Users, Palette, Languages,
  Flame, Footprints, Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CategoryColor } from "@/lib/category-colors";
import { getCategoryIconName } from "@/lib/category-icons";

const ICON_MAP: Record<string, LucideIcon> = {
  Dumbbell, Heart, BookOpen, Brain, Sparkles, UtensilsCrossed,
  DollarSign, GraduationCap, Music, Home, Moon, Droplets,
  PenLine, Code, Briefcase, Users, Palette, Languages,
  Flame, Footprints, Tag,
};

export function CategoryIcon({ name, color }: { name: string; color?: CategoryColor }) {
  const iconName = getCategoryIconName(name);
  const Icon = ICON_MAP[iconName] ?? Tag;
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
      style={
        color
          ? { backgroundColor: color.badgeBg, borderColor: color.badgeBorder, color: color.badgeText }
          : undefined
      }
    >
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
}
