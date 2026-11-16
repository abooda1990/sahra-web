import { movieUrl , type Account , type Movie } from "./api";

type Props = {account:Account ; movie: Movie ; onClose : ()=> void };

function Player ({account , movie , onClose}: Props){

    return(

        <div className="player">
            <button className="player-back" onClick={onClose}>
               ← Back 
            </button>
            <video src={movieUrl(account, movie)} controls autoPlay />


        </div>
    )

}

export default Player ;