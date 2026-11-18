type Props = {
   username: string;
   query : string ;
   onSearch : (query: string) => void ;
  onSignOut: () => void };

function Header({ username, query, onSearch, onSignOut }: Props) {
  return (
    <header className="header">
      <span className="logo">SAHARA</span>

      <input
        className="search"
        type="search"
        placeholder="Search movies"
        dir="auto"
        value={query}
        onChange={(e)=> onSearch(e.target.value)}
      
      
      
      />

      <div className="header-user">
        <span>{username}</span>
        <button onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}

export default Header ; 