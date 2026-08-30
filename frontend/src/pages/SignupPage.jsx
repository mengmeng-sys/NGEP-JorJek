import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// Route: "/signup". Owner: CS1. Self-reported role (student/professor)
// per project scope.
export default function SignupPage() {
  const [cadtEmail, setCadtEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("STUDENT");

  async function submit() {
    const { token } = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ cadtEmail, password, displayName, role }),
    });
    localStorage.setItem("jorjek_token", token);
  }

  return (
    <main>
      <h1>Sign up</h1>
      <input value={cadtEmail} onChange={(e) => setCadtEmail(e.target.value)} placeholder="you@cadt.edu.kh" />
      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="STUDENT">Student</option>
        <option value="PROFESSOR">Professor</option>
      </select>
      <button onClick={submit}>Sign up</button>
    </main>
  );
}
