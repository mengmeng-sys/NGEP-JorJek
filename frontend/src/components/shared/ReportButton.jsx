import { apiFetch } from "@/lib/apiClient";

// Owner: TN1 (backend) / CS1 (this component). Satisfies the DMIL
// Security & Safety competency — see JorJek_Project_Scope.pdf.
export function ReportButton({ postId, commentId }) {
  async function report() {
    const reason = window.prompt("Why are you reporting this?");
    if (!reason) return;
    await apiFetch("/reports", { method: "POST", body: JSON.stringify({ postId, commentId, reason }) });
  }

  return <button onClick={report}>Report</button>;
}
