export type Lang = "en" | "ar";

// the ids TMDB uses for movie genres, plus ours: -1 sports and -2 plays (cmd/genres)
const names: Record<number, Record<Lang, string>> = {
  28: { en: "Action", ar: "أكشن" },
  12: { en: "Adventure", ar: "مغامرة" },
  16: { en: "Animation", ar: "رسوم متحركة" },
  35: { en: "Comedy", ar: "كوميديا" },
  80: { en: "Crime", ar: "جريمة" },
  99: { en: "Documentary", ar: "وثائقي" },
  18: { en: "Drama", ar: "دراما" },
  10751: { en: "Family", ar: "عائلي" },
  14: { en: "Fantasy", ar: "فانتازيا" },
  36: { en: "History", ar: "تاريخي" },
  27: { en: "Horror", ar: "رعب" },
  10402: { en: "Music", ar: "موسيقى" },
  9648: { en: "Mystery", ar: "غموض" },
  10749: { en: "Romance", ar: "رومانسي" },
  878: { en: "Science Fiction", ar: "خيال علمي" },
  10770: { en: "TV Movie", ar: "فيلم تلفزيوني" },
  53: { en: "Thriller", ar: "إثارة" },
  10752: { en: "War", ar: "حرب" },
  37: { en: "Western", ar: "ويسترن" },
  [-1]: { en: "Sports", ar: "رياضة" },
  [-2]: { en: "Plays", ar: "مسرحيات" },
};

export function genreName(id : number , lang: Lang = "en"): string{
    return names[id]?.[lang] ?? (lang === "ar" ? "أخرى" : "Other" );
}
