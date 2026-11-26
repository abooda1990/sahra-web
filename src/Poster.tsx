import { useState } from "react";


type Props = {name : string; sources : string[]};

// Poster tries each image in turn (an empty one is skipped) and shows the name when none loads

function Poster({name,  sources }: Props) {
  const [stage, setStage] = useState(0);
  const src = sources.filter(Boolean)[stage];

  if (!src) {
    return <div className="poster poster-fallback">{name}</div>;
  }
  return (
    <img
      className="poster"
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setStage(stage + 1)}
    />
  );
}

export default Poster;
