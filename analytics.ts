/** Eventos anônimos armazenados no Supabase, nunca em localStorage como fonte de verdade. */
const base = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const analyticsConfigured = Boolean(base && key);
const sessionId = (() => {
  try {
    const existing = sessionStorage.getItem("speers_visitor_session");
    if (existing) return existing;
    const value = crypto.randomUUID();
    sessionStorage.setItem("speers_visitor_session", value);
    return value;
  } catch { return crypto.randomUUID(); }
})();
async function request(path: string, options: RequestInit = {}, token = key) {
  if (!analyticsConfigured) throw new Error("Supabase não configurado");
  const response = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (response.status === 204) return null;
  const responseText = await response.text();
  return responseText.trim() ? JSON.parse(responseText) : null;
}
export async function trackEvent(event_type: "visit" | "quote_click" | "contact_request", metadata: Record<string,string> = {}) {
  if (!analyticsConfigured) return;
  try {
    await request("site_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ event_type, session_id: sessionId, metadata }) });
  } catch (error) { console.warn("Falha ao registrar evento:", error); }
}
export async function submitReview(site_rating: number, purchase_rating: number) {
  if (![site_rating, purchase_rating].every(n => Number.isInteger(n) && n >= 1 && n <= 5)) throw new Error("Notas inválidas");
  await request("site_reviews", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ site_rating, purchase_rating, session_id: sessionId }) });
}
export type AdminStats = { visits: number; unique_sessions: number; quote_clicks: number; review_count: number; site_avg: number | null; purchase_avg: number | null };
export async function signInAdmin(email: string, password: string): Promise<string> {
  if (!analyticsConfigured) throw new Error("Não configurado");
  const response = await fetch(`${base}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!response.ok) throw new Error("Credenciais inválidas");
  const data = await response.json();
  return data.access_token;
}
export async function fetchAdminStats(token: string): Promise<AdminStats> {
  return request("rpc/speers_admin_stats", { method: "POST", body: "{}" }, token);
}
