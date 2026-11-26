// Progress is how far the user watched one movie, saved in the browser
export type Progress = { time: number; duration: number; at: number ; series?: number};

const storageKey = "sahra.progress";

// episodeKey is where an episode's progress is kept: "e451524". A movie keeps its plain
// stream_id ("57641"), so what was saved before stays. The two numbers come from different
// counters, so without the "e" a movie and an episode could share a key.
export function episodeKey(id: string): string {
  return `e${id}`;
}


// loadProgress gives every movie the user started, by stream_id ({} when nothing is saved)
export function loadProgress(): Record<string, Progress> {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Record<string, Progress>) : {};
  } catch {
    return {};
  }
}

// saveProgress remembers where the user is in a movie. The first minute and the last 5% are not
// kept: the movie was only opened, or it is finished.

export function saveProgress(key: string, time: number, duration: number ,  series? : number) {
  if (!Number.isFinite(duration) || duration <= 0) return; // length unknown (mkv through ffmpeg
  const all = loadProgress();
  if (time < 60 || time > duration * 0.95){
    delete all[key];
  }
  else{
    all [key] = {time , duration , at : Date.now(), series};
  }
  try{
    localStorage.setItem(storageKey , JSON.stringify(all));
  }catch{
         // storage blocked: nothing is remembered
  }
}
