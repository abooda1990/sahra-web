import { useState } from "react";
import Login from "./Login";
import Home from "./Home";
import type { Account } from "./api";
import Header from "./Header"



// the account is kept in the browser, so a refresh does not sign the user out
const storageKey = "sahra.account";

function savedAccount(): Account | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch {
    return null;
  }
}

function App() {
  const [account, setAccount] = useState<Account | null>(savedAccount);

  function signIn(acc: Account) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(acc));
    } catch {
      // private mode or storage blocked: the user stays signed in until the next refresh
    }
    setAccount(acc);
  }

  function signOut() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // storage blocked: nothing was saved anyway
    }
    setAccount(null);
  }

  if (!account) {
    return <Login onLogin={signIn} />;
  }
  return (
    <>
      <Header  username={account.username} onSignOut={signOut}/>
      <Home account={account} />
    </>
  );
}

export default App;
