/**
 * Maps category names to lucide-react icon names using keyword matching.
 * Returns a string key that the component can use to pick the right icon.
 */

const KEYWORD_MAP: [string[], string][] = [
  [["fitness", "exercise", "workout", "gym", "run", "sport"], "Dumbbell"],
  [["health", "wellness", "medical"], "Heart"],
  [["read", "book"], "BookOpen"],
  [["meditat", "mindful", "calm", "breath"], "Brain"],
  [["skin", "beauty", "grooming", "self-care", "selfcare"], "Sparkles"],
  [["cook", "food", "nutrition", "diet", "eat", "meal"], "UtensilsCrossed"],
  [["financ", "money", "budget", "saving", "invest"], "DollarSign"],
  [["learn", "study", "education", "school", "class", "course"], "GraduationCap"],
  [["music", "instrument", "piano", "guitar", "sing"], "Music"],
  [["clean", "chore", "home", "house", "tidy", "organiz"], "Home"],
  [["sleep", "rest", "bed"], "Moon"],
  [["water", "hydrat", "drink"], "Droplets"],
  [["writ", "journal", "diary", "blog"], "PenLine"],
  [["cod", "program", "develop", "tech", "software"], "Code"],
  [["work", "career", "job", "productiv"], "Briefcase"],
  [["social", "friend", "family", "relation"], "Users"],
  [["art", "draw", "paint", "creative", "craft", "design"], "Palette"],
  [["language", "vocab", "spanish", "french", "german"], "Languages"],
  [["pray", "spirit", "faith", "church", "religio"], "Flame"],
  [["walk", "step", "hike", "outdoor", "nature"], "Footprints"],
];

export function getCategoryIconName(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  for (const [keywords, iconName] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return iconName;
    }
  }
  return "Tag";
}
