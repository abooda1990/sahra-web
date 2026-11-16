import { useState } from "react";
import type { Movie } from "./api";

type  Props={ movie : Movie}

function Poster ({movie}: Props){
    const [failed , setFailed] = useState(false);
    
    if(!movie.stream_icon || failed){
        return (
            <div className="poster poster-fallback">{movie.name}</div>
        )
    }
    return (
        <img 
            className="poster"
            src= {movie.stream_icon}
            alt= {movie.name}
            loading="lazy"
            onError={()=>setFailed(true)}
        
        />
    )

}

export default Poster ; 