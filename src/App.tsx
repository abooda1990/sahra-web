import { useState } from "react";
import Login from "./Login";
import type { Account } from "./api";

function App() {
  const [account, setAccount] = useState<Account | null>(null);

  if (!account) {
    return <Login onLogin={setAccount} />;
  }

  return (
    <main>
      <h1>Welcome {account.username}</h1>
    </main>
  );
}

export default App;
