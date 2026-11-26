import { type Series } from "./api";
import Poster from "./Poster";

type Props = { series :Series , onSelect : (series : Series)=>void};

// SeriesCard is a series' cover as a button 
function SeriesCard({series , onSelect} : Props){

    return (
        <button className="poster-button" onClick={()=> onSelect(series)}>
            <Poster name ={series.name} sources={[series.cover]} />
        </button>
    )


}

export default SeriesCard ;