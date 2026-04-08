"use client";

export default function ThreatExportButtons() {
  function download(table: string) {
    window.open(`/api/v1/admin/threat-export?table=${table}`, "_blank");
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => download("threat_scores")}
        className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Export Scores
      </button>
      <button
        onClick={() => download("threat_classifications")}
        className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Export Labels
      </button>
      <button
        onClick={() => download("blocked_ips")}
        className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Export Blocked IPs
      </button>
    </div>
  );
}
