/**
 * Deterministic category → color mapping.
 *
 * Uses stored color if present on the category, otherwise falls back
 * to the deterministic warm palette assignment.
 */

import type { Category } from "@/types/database";

export interface CategoryColor {
  border: string;
  badgeBg: string;
  badgeText: string;
  cardTint: string;
  badgeBorder: string;
}

const PALETTE: CategoryColor[] = [
  {
    // #954535 — sienna
    border: "#954535",
    badgeBg: "rgba(149,69,53,0.13)",
    badgeText: "#7A3828",
    cardTint: "rgba(149,69,53,0.06)",
    badgeBorder: "rgba(149,69,53,0.28)",
  },
  {
    // #CC7F3B — caramel
    border: "#CC7F3B",
    badgeBg: "rgba(204,127,59,0.13)",
    badgeText: "#A8642A",
    cardTint: "rgba(204,127,59,0.06)",
    badgeBorder: "rgba(204,127,59,0.28)",
  },
  {
    // #800020 — burgundy
    border: "#800020",
    badgeBg: "rgba(128,0,32,0.13)",
    badgeText: "#66001A",
    cardTint: "rgba(128,0,32,0.06)",
    badgeBorder: "rgba(128,0,32,0.28)",
  },
  {
    // #79443B — chestnut
    border: "#79443B",
    badgeBg: "rgba(121,68,59,0.13)",
    badgeText: "#5E332C",
    cardTint: "rgba(121,68,59,0.06)",
    badgeBorder: "rgba(121,68,59,0.28)",
  },
  {
    // #993300 — burnt sienna
    border: "#993300",
    badgeBg: "rgba(153,51,0,0.13)",
    badgeText: "#7A2900",
    cardTint: "rgba(153,51,0,0.06)",
    badgeBorder: "rgba(153,51,0,0.28)",
  },
  {
    // #8A3324 — brick
    border: "#8A3324",
    badgeBg: "rgba(138,51,36,0.13)",
    badgeText: "#6E281C",
    cardTint: "rgba(138,51,36,0.06)",
    badgeBorder: "rgba(138,51,36,0.28)",
  },
  {
    // #592720 — espresso
    border: "#592720",
    badgeBg: "rgba(89,39,32,0.13)",
    badgeText: "#421E18",
    cardTint: "rgba(89,39,32,0.06)",
    badgeBorder: "rgba(89,39,32,0.28)",
  },
];

/** Convert a hex color to a CategoryColor with computed alpha variants. */
function hexToCategoryColor(hex: string): CategoryColor {
  // Parse hex to rgb
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Darken for text
  const dr = Math.round(r * 0.8);
  const dg = Math.round(g * 0.8);
  const db = Math.round(b * 0.8);
  return {
    border: hex,
    badgeBg: `rgba(${r},${g},${b},0.13)`,
    badgeText: `rgb(${dr},${dg},${db})`,
    cardTint: `rgba(${r},${g},${b},0.06)`,
    badgeBorder: `rgba(${r},${g},${b},0.28)`,
  };
}

/** Build a map from category name → color, using stored color if present, else deterministic fallback. */
export function buildCategoryColorMap(
  categories: Category[]
): Record<string, CategoryColor> {
  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
  const map: Record<string, CategoryColor> = {};
  for (let i = 0; i < sorted.length; i++) {
    const cat = sorted[i];
    if (cat.color) {
      map[cat.name] = hexToCategoryColor(cat.color);
    } else {
      map[cat.name] = PALETTE[i % PALETTE.length];
    }
  }
  return map;
}
