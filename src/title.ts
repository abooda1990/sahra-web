// the language or source tag before a name: "AR: ", "DE - ", "KRD ", "Multi-Sub: ".
// Multi-Sub must come before Multi: the first one that matches wins.
const languageTag =
  /^(AR|DE|EN|FR|NL|TR|GR|PL|IT|ES|RU|SE|AL|SOM|AFR|KRD|EX_YU|Multi-?[Ss]ub|Multi|SHAHID)\s*([:-]\s*|\s)/;
// a language tag at the end: " [TR]"
const endTag = /\s*\[[A-Z]{2,5}\]$/;
// the year at the end: " 2021" or " (2021)"
const endYear = /\s+\(?((?:19|20)\d{2})\)?$/;
// "dubbed" (and the dialect) anywhere in the name
const dubbed = /\s*-?\s*مدبلج(\s+(مصري|لبناني|سوري|خليجي))?/g;
// the year at the start: "2020 Title" or "2018Title"
const startYear = /^\(?((?:19|20)\d{2})\)?\s*/;

// cleanTitle is the TypeScript twin of CleanTitle in the Go server (genres/title.go):
// "DE - Multiverse 2021" -> { title: "Multiverse", year: 2021 }. year is 0 when the name has none.
export function cleanTitle(name: string): { title: string; year: number } {
  let title = name.normalize("NFKC").split(/\s+/).filter(Boolean).join(" ");
  title = title.replace(languageTag, "").replace(endTag, "").replace(dubbed, "");
  let year = 0;
  const end = title.match(endYear);
  if (end) {
    year = Number(end[1]);
    title = title.slice(0, title.length - end[0].length);
  } else {
    const start = title.match(startYear);
    if (start && title.length > start[0].length) {
      year = Number(start[1]);
      title = title.slice(start[0].length);
    }
  }
  return { title: title.replace(/[\s-]+$/, ""), year }; // also a dash left before the year
}

// language gives the tag before a movie's name ("AR", "EN", ...), "" when there is none
export function language(name: string): string {
  return name.normalize("NFKC").trim().match(languageTag)?.[1] ?? "";
}
