// why: keep fetch logic in one place so components stay simple
export async function pingApi() {
  const base = 'http://localhost:4000';
  const res = await fetch(`${base}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // instead of res.text()
}