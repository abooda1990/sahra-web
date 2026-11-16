import { useState } from "react";
import Login from "./Login";
import Home from "./Home";
import type { Account } from "./api";

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

  if (!account) {
    return <Login onLogin={signIn} />;
  }
  return <Home account={account} />;
}

export default App;
