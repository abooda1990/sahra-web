
export type Section = "movies" | "series";

type Props = {
  username: string;
  query: string;
  onSearch: (query: string) => void;
  onSignOut: () => void;
  section :Section ;
  onSection : (Section : Section) => void;

};

function Header({ username, query, onSearch, onSignOut, section , onSection }: Props) {
  return (
    <header className="header">
      <span className="logo">SAHARA</span>

      <nav className="tabs">
        <button
         className={section=== "movies" ? "tabs current" : "tab"}
        onClick = {()=> onSection("movies")}
        >
          Movies
        </button>
         <button
          className={section === "series" ? "tab current" : "tab"}
          onClick={() => onSection("series")}
        >
          Series
        </button>
      </nav>

      <input
        className="search"
        type="search"
        placeholder="Search movies"
        dir="auto"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
      />

      <div className="header-user">
        <span>{username}</span>
        <button onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}

export default Header;
