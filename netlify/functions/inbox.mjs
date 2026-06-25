import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("rozgor-inbox");
  const url = new URL(req.url);

  if (req.method === "POST") {
    let payload;
    try { payload = await req.json(); } catch { return json({ error: "bad json" }, 400); }
    const phone = String(payload.phone || "").replace(/\D/g, "");
    const msg = payload.msg;
    if (!phone || !msg) return json({ error: "phone va msg kerak" }, 400);
    const key = "inbox_" + phone;
    let arr = [];
    try { const ex = await store.get(key, { type: "json" }); if (Array.isArray(ex)) arr = ex; } catch {}
    arr.push(msg);
    if (arr.length > 30) arr = arr.slice(-30);
    await store.setJSON(key, arr);
    return json({ ok: true });
  }

  if (req.method === "GET") {
    const phone = (url.searchParams.get("phone") || "").replace(/\D/g, "");
    const since = Number(url.searchParams.get("since") || 0);
    if (!phone) return json({ messages: [] });
    const key = "inbox_" + phone;
    let arr = [];
    try { const ex = await store.get(key, { type: "json" }); if (Array.isArray(ex)) arr = ex; } catch {}
    const messages = arr.filter((m) => Number(m.id) > since);
    return json({ messages });
  }

  return json({ error: "method" }, 405);
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
