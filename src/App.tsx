import { useState } from "react";
import Login from "./Login";
import type { Account } from "./api";
import Home from "./Home";

function App() {
  const [account, setAccount] = useState<Account | null>(null);

  if (!account) {
    return <Login onLogin={setAccount} />;
  }

  return (
   <Home account={account}/>
  );
}

export default App;
