import { useEffect, useState } from "react";
import { getCategories , getMovies, type Account , type Category , type Movie } from "./api";
import Row from "./Row";

type Props = { account: Account }

function Home ({account}: Props){
    const [movies , setMovies] = useState<Movie[]>([]);
    const [Categories , setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");


    useEffect(()=>{
        let ignore = false ; 
        Promise.all([getMovies(account) , getCategories(account)])
        .then(([m ,c])=>{
            if(!ignore){
                setMovies(m);
                setCategories(c);
            }
        })
        .catch((err)=>{
            if(!ignore) setError(err  instanceof Error ? err.message : "Could not load");
        });
        return ()=>{
            ignore = true ; 
        };


    }, [account]);

    if (error) return <p>{error}</p>;
    if(Categories.length === 0) return <p>Loading...</p>;

    const first = Categories[0];
    const infirst = movies.filter((m)=> m.category_id === first.category_id).slice(0,20);

    return(
        <main>
            <Row title={first.category_name} movies={infirst} />
        </main>
    )



};


export default Home ; 
