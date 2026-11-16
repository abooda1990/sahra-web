type Props = { username: string; onSignOut: () => void };

function Header({ username, onSignOut }: Props) {
  return (
    <header className="header">
      <span className="logo">SAHARA</span>
      <div className="header-user">
        <span>{username}</span>
        <button onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}

export default Header ; 