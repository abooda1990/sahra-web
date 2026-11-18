// Progress is how far the user watched one movie, saved in the browser
export type Progress = { time: number; duration: number; at: number };

const storagekey = "sahra.progress";

// loadProgress gives every movie the user started, by stream_id ({} when nothing is saved)
export function loadProgress(): Record<string, Progress> {
  try {
    const raw = localStorage.getItem(storagekey);
    return raw ? (JSON.parse(raw) as Record<string, Progress>) : {};
  } catch {
    return {};
  }
}

// saveProgress remembers where the user is in a movie. The first minute and the last 5% are not
// kept: the movie was only opened, or it is finished.

export function saveProgress(id: number, time: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return; // length unknown (mkv through ffmpeg
  const all = loadProgress();
  if (time < 60 || time > duration * 0.95){
    delete all[id];
  }
  else{
    all [id] = {time , duration , at : Date.now()};
  }
  try{
    localStorage.setItem(storagekey , JSON.stringify(all));
  }catch{
         // storage blocked: nothing is remembered
  }
}
