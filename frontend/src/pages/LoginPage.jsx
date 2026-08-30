import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// Route: "/login". Owner: CS1
export default function LoginPage() {
  const { login } = useAuth();
  const [cadtEmail, setCadtEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main>
      <h1>Log in</h1>
      <input value={cadtEmail} onChange={(e) => setCadtEmail(e.target.value)} placeholder="you@cadt.edu.kh" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button onClick={() => login(cadtEmail, password)}>Log in</button>
    </main>
  );
}
