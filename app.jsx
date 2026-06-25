/* === Ro'zgor — veb-versiya (build talab qilmaydi) === */
const { useState, useEffect, useRef } = React;

/* localStorage asosidagi xotira (window.storage o'rnini bosadi) */
window.storage = {
  async get(key) { try { const v = localStorage.getItem('rz_' + key); return v == null ? null : { key, value: v }; } catch (e) { return null; } },
  async set(key, value) { try { localStorage.setItem('rz_' + key, value); return { key, value }; } catch (e) { return null; } },
  async delete(key) { try { localStorage.removeItem('rz_' + key); return { key, deleted: true }; } catch (e) { return null; } },
  async list(prefix) { const keys = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('rz_') === 0) { const kk = k.slice(3); if (!prefix || kk.indexOf(prefix) === 0) keys.push(kk); } } } catch (e) {} return { keys }; },
};

/* lucide-react ikonalari (oddiy inline SVG) */
const Ic = (paths) => function Icon({ size = 24, color = "currentColor", strokeWidth = 2, className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {paths}
    </svg>
  );
};
const ShoppingBasket = Ic(<><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m4 11 1.5 8a2 2 0 0 0 2 1.6h9a2 2 0 0 0 2-1.6L20 11"/><path d="M9 11v8"/><path d="M15 11v8"/></>);
const Plus = Ic(<><path d="M5 12h14"/><path d="M12 5v14"/></>);
const Check = Ic(<path d="M20 6 9 17l-5-5"/>);
const Trash2 = Ic(<><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></>);
const Pencil = Ic(<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>);
const Sparkles = Ic(<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 14l.7 2L22 16.7l-2 .7L19.3 20l-.7-2L16 17.3l2-.7z"/></>);
const X = Ic(<><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>);
const Wallet = Ic(<><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M17 13h.01"/></>);
const Loader2 = Ic(<path d="M21 12a9 9 0 1 1-6.219-8.56"/>);
const Eraser = Ic(<><path d="m7 21-4-4a2 2 0 0 1 0-3l9-9a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-7 7"/><path d="M22 21H8"/></>);
const RefreshCw = Ic(<><path d="M21 12a9 9 0 0 0-15-6.7L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 15 6.7L21 16"/><path d="M21 21v-5h-5"/></>);
const CalendarDays = Ic(<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>);
const Store = Ic(<><path d="M3 9l1.2-5h15.6L21 9"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M9 21v-6h6v6"/></>);
const Camera = Ic(<><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/></>);
const Share2 = Ic(<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></>);
const Download = Ic(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>);
const Copy = Ic(<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>);
const Send = Ic(<><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></>);

/* Veb-versiya: telefon-sinxron uchun Netlify Functions */
window.__rozgorNet = {
  async sendInbox(ph, msg) {
    const r = await fetch('/.netlify/functions/inbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: ph, msg }) });
    if (!r.ok) throw new Error('send failed');
    return true;
  },
  async getInbox(ph, since) {
    try {
      const r = await fetch('/.netlify/functions/inbox?phone=' + encodeURIComponent(ph) + '&since=' + (since || 0), { cache: 'no-store' });
      if (!r.ok) return [];
      const d = await r.json();
      return Array.isArray(d.messages) ? d.messages : [];
    } catch (e) { return []; }
  },
};

// ── Palette: bozor / anor ohanglari ──────────────────────────────
const C = {
  bg: "#FBF6EE",
  paper: "#FFFFFF",
  ink: "#2A2620",
  sub: "#9A8E80",
  line: "#ECE3D5",
  pom: "#B5402F",
  pomSoft: "#F7E7E2",
  green: "#3F7D5B",
  greenSoft: "#E7F0EA",
  gold: "#D89A3A",
  goldSoft: "#FAEFD8",
};

const FONT = "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif";

const UNITS = ["kg", "g", "litr", "dona", "bog'lam", "quti", "paket"];

const norm = (s) => (s || "").toLowerCase().replace(/['\u2019\u2018\u02BB\u0060\u02BC]/g, "").replace(/\s+/g, " ").trim();

// Narxni 500/1000 ga yaxlitlash (mayda chiqindilarsiz)
function round500(n) {
  n = Number(n) || 0;
  if (n <= 0) return 0;
  const step = n >= 50000 ? 1000 : 500;
  return Math.round(n / step) * step;
}

// ── Mavsumiy koeffitsiyentlar (1..12 oy; 1.0 ≈ o'rtacha/mavsumda) ──
const SEASONS = {
  melon:     [5, 5, 4, 2.5, 1.6, 1.3, 1, 1, 1.3, 2, 3.5, 5],        // tarvuz, qovun — yozda arzon
  summerveg: [1.5, 1.5, 1.3, 1.1, 0.9, 0.75, 0.7, 0.7, 0.8, 1, 1.2, 1.4], // pomidor, bodring...
  greens:    [1.6, 1.6, 1.3, 1, 0.8, 0.7, 0.7, 0.7, 0.9, 1.1, 1.3, 1.5],   // ko'katlar
  apple:     [1, 1, 1.1, 1.3, 1.5, 1.6, 1.4, 1.1, 0.85, 0.8, 0.85, 0.95],  // olma — kuzda arzon
};
const seasonMult = (key, m) => (key && SEASONS[key] ? SEASONS[key][m] : 1);

// ── Mahsulot katalogi (O'zbekiston, 2026 o'rtacha bozor narxlari) ──
// price = mavsumda/o'rtacha narx; variants = turlari; season = mavsumiy profil.
const CATALOG = {
  // Sabzavotlar
  "kartoshka": { unit: "kg", price: 6000 },
  "piyoz": { unit: "kg", price: 3500 },
  "sabzi": { unit: "kg", price: 4000 },
  "pomidor": { unit: "kg", price: 14000, season: "summerveg" },
  "bodring": { unit: "kg", price: 11000, season: "summerveg" },
  "qalampir": { unit: "kg", price: 15000, season: "summerveg" },
  "karam": { unit: "kg", price: 4000 },
  "sarimsoq": { unit: "kg", price: 25000 },
  "qovoq": { unit: "kg", price: 5000 },
  "ko'kat": { unit: "bog'lam", price: 2000, season: "greens" },
  "tarvuz": { unit: "kg", price: 3000, season: "melon" },
  "qovun": { unit: "kg", price: 5000, season: "melon" },
  // Mevalar
  "olma": { unit: "kg", price: 15000, season: "apple" },
  "banan": { unit: "kg", price: 22000 },
  "limon": { unit: "kg", price: 28000 },
  "uzum": { unit: "kg", price: 16000 },
  "qulupnay": { unit: "kg", price: 30000 },
  "anor": { unit: "kg", price: 18000 },
  // Go'sht
  "go'sht": {
    unit: "kg", price: 85000, variants: [
      { label: "Mol (suyakli)", price: 80000, unit: "kg" },
      { label: "Mol (sof)", price: 95000, unit: "kg" },
      { label: "Qo'y", price: 100000, unit: "kg" },
      { label: "Tovuq", price: 38000, unit: "kg" },
      { label: "Qiyma", price: 70000, unit: "kg" },
    ],
  },
  "mol go'shti": {
    unit: "kg", price: 85000, variants: [
      { label: "Suyakli", price: 80000, unit: "kg" },
      { label: "Sof go'sht", price: 95000, unit: "kg" },
    ],
  },
  "qo'y go'shti": { unit: "kg", price: 100000 },
  "tovuq": {
    unit: "kg", price: 38000, variants: [
      { label: "Butun", price: 38000, unit: "kg" },
      { label: "File", price: 48000, unit: "kg" },
      { label: "Son", price: 40000, unit: "kg" },
    ],
  },
  "qiyma": { unit: "kg", price: 70000 },
  // Don, yorma
  "un": {
    unit: "kg", price: 6500, variants: [
      { label: "Oliy nav", price: 6500, unit: "kg" },
      { label: "1-nav", price: 5500, unit: "kg" },
      { label: "2-nav", price: 4500, unit: "kg" },
      { label: "Qop, oliy (50kg)", price: 320000, unit: "dona" },
      { label: "Qop, 1-nav (50kg)", price: 280000, unit: "dona" },
    ],
  },
  "guruch": {
    unit: "kg", price: 16000, variants: [
      { label: "Lazer", price: 18000, unit: "kg" },
      { label: "Alanga", price: 16000, unit: "kg" },
      { label: "Devzira", price: 30000, unit: "kg" },
      { label: "Oddiy / o'rta", price: 13000, unit: "kg" },
    ],
  },
  "makaron": { unit: "kg", price: 12000 },
  "mosh": { unit: "kg", price: 20000 },
  "loviya": { unit: "kg", price: 18000 },
  "no'xat": { unit: "kg", price: 18000 },
  "grechka": { unit: "kg", price: 15000 },
  // Sut, tuxum, yog'
  "sut": {
    unit: "litr", price: 14000, variants: [
      { label: "2,5%", price: 14000, unit: "litr" },
      { label: "3,2%", price: 15000, unit: "litr" },
      { label: "Bozor (qaynatma)", price: 12000, unit: "litr" },
    ],
  },
  "tuxum": {
    unit: "dona", price: 1500, variants: [
      { label: "1 dona", price: 1500, unit: "dona" },
      { label: "10 dona", price: 15000, unit: "paket" },
      { label: "30 dona (fletka)", price: 42000, unit: "paket" },
    ],
  },
  "yog'": {
    unit: "litr", price: 20000, variants: [
      { label: "Paxta yog'i", price: 20000, unit: "litr" },
      { label: "Kungaboqar", price: 22000, unit: "litr" },
      { label: "1 litr (shisha)", price: 24000, unit: "dona" },
    ],
  },
  "sariyog'": { unit: "kg", price: 70000 },
  "pishloq": { unit: "kg", price: 80000 },
  // Boshqa
  "shakar": {
    unit: "kg", price: 9000, variants: [
      { label: "Oddiy", price: 9000, unit: "kg" },
      { label: "Rafinad", price: 12000, unit: "kg" },
    ],
  },
  "tuz": { unit: "kg", price: 3000 },
  "non": {
    unit: "dona", price: 4000, variants: [
      { label: "Patir", price: 5000, unit: "dona" },
      { label: "Oddiy non", price: 3000, unit: "dona" },
      { label: "Buxanka", price: 2500, unit: "dona" },
    ],
  },
  "choy": { unit: "quti", price: 15000 },
};

const CATALOG_KEYS = Object.keys(CATALOG)
  .map((k) => ({ raw: k, n: norm(k) }))
  .sort((a, b) => b.n.length - a.n.length);

function lookupLocal(name) {
  const q = norm(name);
  if (q.length < 2) return null;
  let key = CATALOG_KEYS.find((k) => q.includes(k.n));
  if (!key) key = CATALOG_KEYS.find((k) => k.n.startsWith(q) && q.length >= 3);
  if (!key) return null;
  const e = CATALOG[key.raw];
  return { base: e.price, unit: e.unit, variants: e.variants || null, seasonKey: e.season || null };
}

// Item uchun reja sanasiga va mavsumga moslangan birlik narxi
function projUnit(item, factor, planMonth, nowMonth) {
  if (item.price == null) return null;
  const sAdj = item.seasonKey ? (seasonMult(item.seasonKey, planMonth) / seasonMult(item.seasonKey, nowMonth)) : 1;
  return round500(item.price * factor * sAdj);
}

// AI orqali taxminiy narx (jadvalda yo'q mahsulotlar uchun)
async function aiEstimate(nm, un) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content:
          `Sen O'zbekiston bozorlaridagi taxminiy narxlarni biluvchi yordamchisan. ` +
          `Mahsulot: "${nm}". O'lchov birligi: "${un}". ` +
          `Shu mahsulotning 1 ${un} uchun O'zbekistondagi taxminiy bozor narxini so'mda ber. ` +
          `Faqat JSON qaytar, boshqa hech narsa yozma: {"price": <son>}`,
      }],
    }),
  });
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const mt = clean.match(/\{[\s\S]*\}/);
  const obj = JSON.parse(mt ? mt[0] : clean);
  return obj && obj.price != null ? Math.round(Number(obj.price)) : null;
}

function dateLabel(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const MONTHS = ["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];
const DAYS = ["yakshanba","dushanba","seshanba","chorshanba","payshanba","juma","shanba"];

const KEY = "rozgor:v1";
const KEY_LEARN = "rozgor:learned";
const KEY_LOG = "rozgor:pricelog";
const KEY_HIST = "rozgor:history";
const KEY_INBOX = "rozgor:inbox";
const hasStore = typeof window !== "undefined" && window.storage;

// narx xotirasi kaliti: nom + tur
const learnKey = (name, variant) => norm(name) + "|" + (variant ? norm(variant) : "");

// to'liq sana: 24 iyun 2026
function fullDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// rasmni siqib, kichik JSON-dataURL ga aylantirish
function compressImage(file, maxDim = 1100, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      width = Math.round(width * scale); height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      try { resolve(canvas.toDataURL("image/jpeg", quality)); } catch (e) { reject(e); }
    };
    img.onerror = reject;
    img.src = url;
  });
}

// so'mni chiroyli ko'rsatish: 12 000
const som = (n) => {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString("ru-RU").replace(/,/g, " ");
};

// ── Ro'yxatni paketlash (ulashish va inbox uchun umumiy) ──
function packItems(list) {
  return list.map((i) => ({ n: i.name, v: i.variant || null, q: i.qty, u: i.unit, p: i.price == null ? null : i.price, s: i.seasonKey || null, e: !!i.est, m: !!i.fromMemory }));
}
function unpackItem(o) {
  return {
    id: Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    name: o.n, variant: o.v || null, qty: Number(o.q) || 1, unit: o.u || "kg",
    price: o.p == null ? null : Number(o.p), est: !!o.e, fromMemory: !!o.m, seasonKey: o.s || null,
    priceDate: o.p == null ? null : Date.now(), bought: false,
  };
}
function encodeShare(list) {
  return "ROZGOR1:" + btoa(unescape(encodeURIComponent(JSON.stringify(packItems(list)))));
}
function decodeShare(code) {
  const t = (code || "").trim().replace(/^ROZGOR1:/, "").replace(/\s+/g, "");
  return JSON.parse(decodeURIComponent(escape(atob(t)))).map(unpackItem);
}

// telefon raqami / inbox
const normPhone = (s) => (s || "").replace(/\D/g, "");
const inboxKey = (phone) => "inbox:" + normPhone(phone);
const KEY_ME = "rozgor:me";
const KEY_SEEN = "rozgor:lastseen";

// Tarmoq qatlami: standart holatda window.storage (artifact), veb-versiyada server (Netlify Functions) bilan almashtiriladi
const net = (typeof window !== "undefined" && window.__rozgorNet) || {
  async sendInbox(ph, msg) {
    const r = await window.storage.get(inboxKey(ph), true);
    const msgs = r && r.value ? JSON.parse(r.value) : [];
    await window.storage.set(inboxKey(ph), JSON.stringify(msgs.concat([msg]).slice(-30)), true);
    return true;
  },
  async getInbox(ph, since) {
    const r = await window.storage.get(inboxKey(ph), true);
    const msgs = r && r.value ? JSON.parse(r.value) : [];
    return msgs.filter((m) => Number(m.id) > (since || 0));
  },
};

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function App() {
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [loaded, setLoaded] = useState(false);

  // qo'shish formasi
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");
  const [estFlag, setEstFlag] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estErr, setEstErr] = useState(false);
  const [priceTouched, setPriceTouched] = useState(false);
  const [variantList, setVariantList] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [formSeason, setFormSeason] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);
  const [showBudget, setShowBudget] = useState(false);
  const nameRef = useRef(null);

  // narx xotirasi / tarix / monitoring
  const [learned, setLearned] = useState({});     // {key: {price,unit,date,store}}
  const [priceLog, setPriceLog] = useState({});   // {key: [{date,price,store}]}
  const [history, setHistory] = useState([]);     // [{id,date,store,items,total,hasPhoto}]
  const [view, setView] = useState("list");       // 'list' | 'history' | 'prices'
  const [fromMem, setFromMem] = useState(false);   // forma: narx xotiradan keldimi
  // bozorni yakunlash oynasi
  const [finishing, setFinishing] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [tripPhoto, setTripPhoto] = useState(null);
  const [savingTrip, setSavingTrip] = useState(false);
  const [reading, setReading] = useState(false);
  const [readMsg, setReadMsg] = useState("");
  const [openTrip, setOpenTrip] = useState(null);
  const [inbox, setInbox] = useState([]);          // kelgan ro'yxatlar (har biri alohida savat)
  const [openBasketId, setOpenBasketId] = useState(null);
  const [tripPhotos, setTripPhotos] = useState({});
  const photoRef = useRef(null);
  // ulashish / qabul qilish
  const [sharing, setSharing] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [pasteCode, setPasteCode] = useState("");
  const [recvMsg, setRecvMsg] = useState("");
  // telefon raqami orqali avtomatik almashish
  const [me, setMe] = useState(null);            // {phone, name, recents:[]}
  const [needPhone, setNeedPhone] = useState(false);
  const [obPhone, setObPhone] = useState("");
  const [obName, setObName] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");
  const [incoming, setIncoming] = useState("");
  const lastSeenRef = useRef(0);

  // ── yuklash ──
  useEffect(() => {
    let active = true;
    (async () => {
      if (hasStore) {
        try {
          const r = await window.storage.get(KEY);
          if (active && r && r.value) {
            const d = JSON.parse(r.value);
            setItems(Array.isArray(d.items) ? d.items : []);
            setBudget(d.budget != null ? String(d.budget) : "");
            setPlanDate(d.planDate || "");
          }
        } catch (e) { /* bo'sh ro'yxatdan boshlaymiz */ }
        try { const r = await window.storage.get(KEY_LEARN); if (active && r && r.value) setLearned(JSON.parse(r.value) || {}); } catch (e) {}
        try { const r = await window.storage.get(KEY_LOG); if (active && r && r.value) setPriceLog(JSON.parse(r.value) || {}); } catch (e) {}
        try { const r = await window.storage.get(KEY_HIST); if (active && r && r.value) setHistory(JSON.parse(r.value) || []); } catch (e) {}
        try { const r = await window.storage.get(KEY_INBOX); if (active && r && r.value) setInbox(JSON.parse(r.value) || []); } catch (e) {}
        try {
          const r = await window.storage.get(KEY_ME);
          if (active && r && r.value) { setMe(JSON.parse(r.value)); }
          else if (active) setNeedPhone(true);
        } catch (e) { if (active) setNeedPhone(true); }
        try { const r = await window.storage.get(KEY_SEEN); if (active && r && r.value) { lastSeenRef.current = Number(r.value) || 0; } } catch (e) {}
      }
      if (active) setLoaded(true);
    })();
    return () => { active = false; };
  }, []);

  // ── saqlash ──
  useEffect(() => {
    if (!loaded || !hasStore) return;
    window.storage.set(KEY, JSON.stringify({ items, budget: budget === "" ? null : Number(budget), planDate })).catch(() => {});
  }, [items, budget, planDate, loaded]);
  useEffect(() => { if (loaded && hasStore) window.storage.set(KEY_LEARN, JSON.stringify(learned)).catch(() => {}); }, [learned, loaded]);
  useEffect(() => { if (loaded && hasStore) window.storage.set(KEY_LOG, JSON.stringify(priceLog)).catch(() => {}); }, [priceLog, loaded]);
  useEffect(() => { if (loaded && hasStore) window.storage.set(KEY_HIST, JSON.stringify(history)).catch(() => {}); }, [history, loaded]);
  useEffect(() => { if (loaded && hasStore) window.storage.set(KEY_INBOX, JSON.stringify(inbox)).catch(() => {}); }, [inbox, loaded]);
  useEffect(() => { if (loaded && hasStore && me) window.storage.set(KEY_ME, JSON.stringify(me)).catch(() => {}); }, [me, loaded]);

  // ── kelgan ro'yxatlarni avtomatik tekshirish (telefon inbox) ──
  useEffect(() => {
    if (!loaded || !hasStore || !me || !me.phone) return;
    checkInbox(false);
    const t = setInterval(() => checkInbox(false), 12000);
    return () => clearInterval(t);
  }, [loaded, me]);

  // shrift
  useEffect(() => {
    const id = "rz-font";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  // ── Reja sanasiga narx prognozi (inflatsiya ~7.3%/yil + mavsum) ──
  const MONTHLY_INFL = 0.006; // ≈ 7.4% yillik
  const nowMonth = new Date().getMonth();
  const planTs = planDate ? new Date(planDate + "T12:00:00").getTime() : null;
  const planMonth = planTs ? new Date(planTs).getMonth() : nowMonth;
  const monthsAhead = planTs ? Math.max(0, (planTs - Date.now()) / (1000 * 60 * 60 * 24 * 30.44)) : 0;
  const factor = Math.pow(1 + MONTHLY_INFL, monthsAhead);
  const projecting = !!planTs && (monthsAhead > 0.3 || planMonth !== nowMonth);
  const projPct = Math.round((factor - 1) * 100);
  const pUnit = (i) => projUnit(i, factor, planMonth, nowMonth);
  const nowUnit = (i) => projUnit(i, 1, nowMonth, nowMonth);
  const projLine = (i) => (pUnit(i) || 0) * (Number(i.qty) || 0);

  const toBuy = items.filter((i) => !i.bought);
  const bought = items.filter((i) => i.bought);
  const totalRemaining = toBuy.reduce((s, i) => s + projLine(i), 0);
  const totalBought = bought.reduce((s, i) => s + projLine(i), 0);
  const totalAll = totalRemaining + totalBought;
  const bnum = budget === "" ? null : Number(budget);
  const over = bnum != null && totalAll > bnum;

  function resetForm() {
    setName(""); setQty(""); setUnit("kg"); setPrice("");
    setEstFlag(false); setEstErr(false); setPriceTouched(false); setFromMem(false);
    setVariantList([]); setSelectedVariant(null); setFormSeason(null);
  }

  // narxni xotiraga yozish (qo'lda kiritilgan yoki to'langan)
  function recordPrice(name, variant, price, unit, store) {
    if (price == null || !(price > 0)) return;
    const k = learnKey(name, variant);
    const ts = Date.now();
    setLearned((prev) => ({ ...prev, [k]: { name, variant: variant || null, price, unit, date: ts, store: store || (prev[k] && prev[k].store) || "" } }));
    setPriceLog((prev) => {
      const arr = (prev[k] || []).concat([{ date: ts, price, store: store || "" }]).slice(-12);
      return { ...prev, [k]: arr };
    });
  }

  // Nom yozilganda: avval xotira, keyin katalog
  function handleName(v) {
    setName(v);
    const hit = lookupLocal(v);
    if (hit) {
      setFormSeason(hit.seasonKey || null);
      if (hit.variants && hit.variants.length) {
        setVariantList(hit.variants);
        const stillValid = selectedVariant && hit.variants.some((x) => x.label === selectedVariant);
        if (!priceTouched && !stillValid) {
          const first = hit.variants[0];
          const mem = learned[learnKey(v, first.label)];
          setSelectedVariant(first.label);
          setUnit(mem ? mem.unit : first.unit);
          setPrice(String(round500(mem ? mem.price : first.price)));
          setEstFlag(true); setEstErr(false); setFromMem(!!mem);
        }
      } else {
        setVariantList([]); setSelectedVariant(null);
        if (!priceTouched) {
          const mem = learned[learnKey(v, "")];
          setUnit(mem ? mem.unit : hit.unit);
          setPrice(String(round500(mem ? mem.price : hit.base * seasonMult(hit.seasonKey, nowMonth))));
          setEstFlag(true); setEstErr(false); setFromMem(!!mem);
        }
      }
    } else {
      // katalogda yo'q — lekin xotirada bo'lishi mumkin
      const mem = learned[learnKey(v, "")];
      setVariantList([]); setSelectedVariant(null); setFormSeason(null);
      if (!priceTouched) {
        if (mem) { setUnit(mem.unit); setPrice(String(round500(mem.price))); setEstFlag(true); setFromMem(true); }
        else if (estFlag) { setPrice(""); setEstFlag(false); setFromMem(false); }
      }
    }
  }

  function pickVariant(vr) {
    const mem = learned[learnKey(name, vr.label)];
    setSelectedVariant(vr.label);
    setUnit(mem ? mem.unit : vr.unit);
    setPrice(String(round500(mem ? mem.price : vr.price * seasonMult(formSeason, nowMonth))));
    setEstFlag(true); setEstErr(false); setPriceTouched(false); setFromMem(!!mem);
  }

  function addItem() {
    if (!name.trim()) { nameRef.current && nameRef.current.focus(); return; }
    const pr = price === "" ? null : (parseFloat(price) || 0);
    const it = {
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      variant: selectedVariant || null,
      qty: parseFloat(qty) || 1,
      unit,
      price: pr,
      est: pr != null && estFlag,
      fromMemory: pr != null && fromMem,
      seasonKey: formSeason || null,
      priceDate: pr == null ? null : Date.now(),
      bought: false,
    };
    setItems((p) => [it, ...p]);
    // qo'lda kiritilgan narx bo'lsa — darrov xotiraga
    if (pr != null && priceTouched) recordPrice(it.name, it.variant, pr, unit, "");
    resetForm();
    nameRef.current && nameRef.current.focus();
  }

  function toggle(id) {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i)));
  }
  function remove(id) {
    setItems((p) => p.filter((i) => i.id !== id));
    if (editingId === id) setEditingId(null);
  }
  function saveEdit(id, patch) {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    const it = items.find((i) => i.id === id);
    if (it && patch.price != null && patch.price > 0 && Number(patch.price) !== Number(it.price)) {
      recordPrice(patch.name || it.name, patch.variant !== undefined ? patch.variant : it.variant, patch.price, patch.unit || it.unit, "");
    }
    setEditingId(null);
  }
  function clearBought() { setItems((p) => p.filter((i) => !i.bought)); }
  function clearAll() { setItems([]); }

  // ── Mahsulot narxini yangilash (bugungi sanani qo'yadi) ──
  async function refreshPrice(id) {
    if (refreshingId) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const mem = learned[learnKey(item.name, item.variant)];
    if (mem) {
      setItems((p) => p.map((i) => i.id === id
        ? { ...i, price: round500(mem.price), unit: mem.unit, est: true, fromMemory: true, priceDate: mem.date } : i));
      return;
    }
    const hit = lookupLocal(item.name);
    if (hit) {
      let base = hit.base, u = hit.unit;
      if (item.variant && hit.variants) {
        const vr = hit.variants.find((v) => v.label === item.variant);
        if (vr) { base = vr.price; u = vr.unit; }
      }
      const np = round500(base * seasonMult(hit.seasonKey, nowMonth));
      setItems((p) => p.map((i) => i.id === id
        ? { ...i, price: np, unit: u, est: true, fromMemory: false, seasonKey: hit.seasonKey || null, priceDate: Date.now() } : i));
      return;
    }
    setRefreshingId(id);
    try {
      const v = await aiEstimate(item.name, item.unit);
      if (v != null) {
        setItems((p) => p.map((i) => i.id === id
          ? { ...i, price: round500(v), est: true, priceDate: Date.now() } : i));
      }
    } catch (e) { /* tarmoq xatosi — eski narx qoladi */ }
    setRefreshingId(null);
  }

  // ── AI narx taxmini (✦) ──
  async function estimatePrice() {
    if (!name.trim() || estimating) return;
    const local = lookupLocal(name);
    if (local) {
      setFormSeason(local.seasonKey || null);
      if (local.variants && local.variants.length) {
        setVariantList(local.variants);
        const f = local.variants[0];
        setSelectedVariant(f.label); setUnit(f.unit); setPrice(String(round500(f.price)));
      } else {
        setVariantList([]); setSelectedVariant(null);
        setUnit(local.unit); setPrice(String(round500(local.base * seasonMult(local.seasonKey, nowMonth))));
      }
      setEstFlag(true); setEstErr(false); setPriceTouched(false);
      return;
    }
    setEstimating(true); setEstErr(false);
    try {
      const v = await aiEstimate(name.trim(), unit);
      if (v != null) { setPrice(String(round500(v))); setEstFlag(true); setPriceTouched(false); }
      else setEstErr(true);
    } catch (e) {
      setEstErr(true);
    }
    setEstimating(false);
  }

  // ── chek rasmini olish ──
  async function onPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try { const d = await compressImage(file); setTripPhoto(d); setReadMsg(""); }
    catch (err) { /* rasm o'qilmadi */ }
    if (photoRef.current) photoRef.current.value = "";
  }

  // ── chekdagi narxlarni AI bilan o'qib, xotirani yangilash ──
  async function readReceipt() {
    if (!tripPhoto || reading) return;
    const bItems = items.filter((i) => i.bought);
    if (bItems.length === 0) { setReadMsg("Avval mahsulotlarni belgilang."); return; }
    setReading(true); setReadMsg("");
    try {
      const base64 = tripPhoto.split(",")[1];
      const products = bItems.map((i, idx) => ({ i: idx, name: i.name + (i.variant ? " (" + i.variant + ")" : "") }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
              {
                type: "text",
                text:
                  "Bu O'zbekistondagi do'kon yoki bozor xarid chekining rasmi. Pastdagi mahsulotlar ro'yxatidagi har bir element uchun chekdan 1 birlik (kg/dona/litr) narxini so'mda (butun son) toping. " +
                  "Agar chekda faqat umumiy summa bo'lsa, miqdorga bo'lib 1 birlik narxini hisoblang. Topa olmasangiz unit_price ni null qiling. " +
                  "Faqat JSON massiv qaytaring, boshqa hech narsa yozmang: [{\"i\":0,\"unit_price\":12000}]. Mahsulotlar: " + JSON.stringify(products),
              },
            ],
          }],
        }),
      });
      const data = await res.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const m = clean.match(/\[[\s\S]*\]/);
      const arr = JSON.parse(m ? m[0] : clean);
      const updates = [];
      arr.forEach((r) => {
        const it = bItems[r.i];
        const price = Math.round(Number(r.unit_price) || 0);
        if (it && price > 0) updates.push({ id: it.id, name: it.name, variant: it.variant, price: round500(price), unit: it.unit });
      });
      if (updates.length) {
        setItems((prev) => prev.map((it) => {
          const u = updates.find((x) => x.id === it.id);
          return u ? { ...it, price: u.price, unit: u.unit, est: false, fromMemory: true, priceDate: Date.now() } : it;
        }));
        updates.forEach((u) => recordPrice(u.name, u.variant, u.price, u.unit, storeName.trim() || ""));
        setReadMsg(`✓ ${updates.length} ta mahsulot narxi chekdan yangilandi va xotiraga saqlandi.`);
      } else {
        setReadMsg("Chekdan narx topilmadi. Narxlarni qo‘lda kiriting.");
      }
    } catch (e) {
      setReadMsg("Chekni o‘qib bo‘lmadi. Rasm aniqroq bo‘lsin yoki qo‘lda kiriting.");
    }
    setReading(false);
  }

  // ── bozorni yakunlash: tarixga yozish + narxlarni xotiraga ──
  async function saveTrip() {
    const bItems = items.filter((i) => i.bought);
    if (bItems.length === 0 || savingTrip) return;
    setSavingTrip(true);
    const id = Date.now() + "";
    const store = storeName.trim() || "Bozor";
    const ts = Date.now();
    const tItems = bItems.map((i) => {
      const pr = round500(projUnit(i, 1, nowMonth, nowMonth) || 0);
      return { name: i.name, variant: i.variant || null, qty: i.qty, unit: i.unit, price: pr };
    });
    const total = tItems.reduce((s, i) => s + (i.price || 0) * (Number(i.qty) || 0), 0);
    if (tripPhoto && hasStore) { try { await window.storage.set("rozgor:photo:" + id, tripPhoto); } catch (e) {} }
    setHistory((prev) => [{ id, date: ts, store, items: tItems, total, hasPhoto: !!tripPhoto }, ...prev].slice(0, 60));
    // narxlarni xotiraga (oxirgi narx yangilanadi)
    setLearned((prev) => {
      const next = { ...prev };
      tItems.forEach((it) => { if (it.price > 0) next[learnKey(it.name, it.variant)] = { name: it.name, variant: it.variant || null, price: it.price, unit: it.unit, date: ts, store }; });
      return next;
    });
    setPriceLog((prev) => {
      const next = { ...prev };
      tItems.forEach((it) => { if (it.price > 0) { const k = learnKey(it.name, it.variant); next[k] = (next[k] || []).concat([{ date: ts, price: it.price, store }]).slice(-12); } });
      return next;
    });
    if (tripPhoto) setTripPhotos((prev) => ({ ...prev, [id]: tripPhoto }));
    setItems((p) => p.filter((i) => !i.bought));
    setFinishing(false); setStoreName(""); setTripPhoto(null); setSavingTrip(false);
  }

  // tarixdagi chek rasmini yuklash
  async function loadTripPhoto(id) {
    if (tripPhotos[id] || !hasStore) return;
    try { const r = await window.storage.get("rozgor:photo:" + id); if (r && r.value) setTripPhotos((prev) => ({ ...prev, [id]: r.value })); } catch (e) {}
  }
  function deleteTrip(id) {
    setHistory((prev) => prev.filter((t) => t.id !== id));
    if (hasStore) window.storage.delete("rozgor:photo:" + id).catch(() => {});
  }

  // ── Ro'yxatni ulashish ──
  function openShare() {
    setToPhone(""); setSendMsg(""); setShareCode(""); setCopied(false); setSharing(true);
  }
  function makeCode() {
    const list = items.filter((i) => !i.bought);
    if (list.length) { setShareCode(encodeShare(list)); setCopied(false); }
  }
  function copyShare() {
    if (!shareCode) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {});
    }
  }
  async function webShareCode() {
    if (!shareCode) return;
    const txt = "Bozorlik ro‘yxati (Ro‘zgor). Ilovada “Qabul qilish → Koddan ochish”ga shu kodni joylang:\n\n" + shareCode;
    if (navigator.share) { try { await navigator.share({ text: txt }); return; } catch (e) {} }
    copyShare();
  }
  // ── Ro'yxatni qabul qilish (kod orqali — zaxira) ──
  function importList() {
    try {
      const arr = decodeShare(pasteCode);
      if (!arr.length) { setRecvMsg("Ro‘yxat bo‘sh chiqdi."); return; }
      const basket = { id: Date.now(), fromName: "", fromPhone: "", date: Date.now(), read: false, items: arr };
      setInbox((prev) => [basket, ...prev].slice(0, 40));
      setRecvMsg(`✓ ${arr.length} ta mahsulotli ro‘yxat qabul qilindi.`);
      setPasteCode("");
      setView("list");
      setTimeout(() => { setReceiving(false); setRecvMsg(""); }, 1300);
    } catch (e) {
      setRecvMsg("Kod noto‘g‘ri. Kodni to‘liq nusxalab joylang.");
    }
  }

  // ── Telefon raqamiga avtomatik yuborish ──
  async function sendToPhone() {
    const local = normPhone(toPhone);
    const list = items.filter((i) => !i.bought);
    if (local.length < 9) { setSendMsg("To‘liq raqam kiriting (9 ta raqam)."); return; }
    if (list.length === 0) { setSendMsg("Ro‘yxat bo‘sh."); return; }
    if (!hasStore) { setSendMsg("Bu qurilmada avtomatik yuborish ishlamaydi."); return; }
    const ph = "998" + local;
    setSending(true); setSendMsg("");
    try {
      const msg = { id: Date.now(), fromName: (me && me.name) || "", fromPhone: (me && me.phone) || "", date: Date.now(), items: packItems(list) };
      await net.sendInbox(ph, msg);
      setMe((prev) => ({ ...(prev || {}), recents: [ph, ...(((prev && prev.recents) || []).filter((x) => x !== ph))].slice(0, 5) }));
      setSendMsg(`✓ Yuborildi! Do‘stingiz ilovasida o‘zi ochiladi.`);
      setTimeout(() => { setSharing(false); setSendMsg(""); setToPhone(""); }, 1600);
    } catch (e) { setSendMsg("Yuborishda xatolik. Internetni tekshiring."); }
    setSending(false);
  }

  // ── Kelgan ro'yxatlarni tekshirish (har biri alohida savat) ──
  async function checkInbox(manual) {
    if (!me || !me.phone || !hasStore) { if (manual) flashIncoming("Avval telefon raqamingizni kiriting."); return; }
    try {
      const fresh = await net.getInbox(me.phone, lastSeenRef.current);
      if (fresh.length) {
        setInbox((prev) => {
          const next = [...prev];
          fresh.forEach((m) => {
            next.unshift({
              id: m.id, fromName: (m.fromName || "").trim(), fromPhone: m.fromPhone || "",
              date: m.date || m.id, read: false,
              items: (m.items || []).map(unpackItem),
            });
          });
          return next.slice(0, 40);
        });
        const maxId = Math.max(...fresh.map((m) => Number(m.id)));
        lastSeenRef.current = maxId;
        if (hasStore) window.storage.set(KEY_SEEN, String(maxId)).catch(() => {});
        const from = (fresh[fresh.length - 1].fromName || "").trim() || "Do‘stingiz";
        flashIncoming(`✓ Senga ${from}dan yangi ro‘yxat keldi`);
        setView("list");
      } else if (manual) {
        flashIncoming("Yangi ro‘yxat yo‘q.");
      }
    } catch (e) { if (manual) flashIncoming("Tekshirishda xatolik."); }
  }
  function flashIncoming(t) { setIncoming(t); setTimeout(() => setIncoming(""), 4000); }

  // savat sarlavhasi va jo'natuvchi nomi
  function senderLabel(b) {
    if (b.fromName && b.fromName.trim()) return b.fromName.trim();
    if (b.fromPhone) return "+998 " + b.fromPhone.replace(/^998/, "");
    return "";
  }
  function basketTitle(b) {
    const n = senderLabel(b);
    return n ? `${n}dan bozor ro‘yxati` : "Kelgan bozor ro‘yxati";
  }
  function openBasket(b) {
    setInbox((prev) => prev.map((x) => (x.id === b.id ? { ...x, read: true } : x)));
    setOpenBasketId(b.id);
  }
  function toggleBasketItem(bid, iid) {
    setInbox((prev) => prev.map((b) => (b.id === bid ? { ...b, items: b.items.map((it) => (it.id === iid ? { ...it, bought: !it.bought } : it)) } : b)));
  }
  function deleteBasket(bid) {
    setInbox((prev) => prev.filter((b) => b.id !== bid));
    setOpenBasketId(null);
  }

  function completeOnboard() {
    const local = normPhone(obPhone);
    if (local.length < 9) return;
    setMe({ phone: "998" + local, name: obName.trim(), recents: [] });
    setNeedPhone(false);
  }

  const stores = Array.from(new Set(history.map((h) => h.store).filter(Boolean))).slice(0, 6);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.ink, fontVariantNumeric: "tabular-nums" }}>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 0 180px" }}>

        {/* Header */}
        <header style={{ padding: "22px 18px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: C.pom, display: "grid", placeItems: "center", boxShadow: "0 6px 16px rgba(181,64,47,.28)" }}>
            <ShoppingBasket size={24} color="#fff" strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Ro‘zgor</h1>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 1 }}>Bozor ro‘yxati · {todayLabel()}</div>
          </div>
          <button
            onClick={() => setShowBudget((s) => !s)}
            style={{
              border: "none", cursor: "pointer", borderRadius: 12, padding: "9px 12px",
              display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontWeight: 700, fontSize: 13,
              background: bnum != null ? C.goldSoft : C.paper, color: bnum != null ? C.gold : C.sub,
              border: `1px solid ${C.line}`,
            }}>
            <Wallet size={16} /> Byudjet
          </button>
        </header>

        {/* Tablar */}
        <div style={{ display: "flex", gap: 6, margin: "0 18px 14px", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: 4 }}>
          {[["list", "Ro‘yxat"], ["history", "Tarix"], ["prices", "Narxlar"]].map(([v, lbl]) => (
            <button key={v} onClick={() => setView(v)}
              style={{
                flex: 1, border: "none", cursor: "pointer", borderRadius: 10, padding: "9px 0",
                fontFamily: FONT, fontWeight: 700, fontSize: 13.5,
                background: view === v ? C.pom : "transparent", color: view === v ? "#fff" : C.sub,
              }}>
              {lbl}{v === "history" && history.length ? ` (${history.length})` : ""}
            </button>
          ))}
        </div>

        {view === "list" && (<>
        {/* Kelgan ro'yxatlar — har biri alohida */}
        {inbox.length > 0 && (
          <div style={{ margin: "0 18px 14px" }}>
            <SectionLabel text="Sizga kelgan ro‘yxatlar" count={inbox.length} color={C.gold} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
              {inbox.map((b) => {
                const total = b.items.length;
                const left = b.items.filter((i) => !i.bought).length;
                return (
                  <button key={b.id} onClick={() => openBasket(b)}
                    style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", cursor: "pointer",
                      background: b.read ? C.paper : "#FFF6E6", border: `1px solid ${b.read ? C.line : C.gold}`, borderRadius: 14, padding: "12px 13px", fontFamily: FONT }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: b.read ? C.bg : C.gold, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <ShoppingBasket size={19} color={b.read ? C.gold : "#fff"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: b.read ? 600 : 800, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Senga {basketTitle(b)}
                      </div>
                      <div style={{ fontSize: 12, color: C.sub, marginTop: 2, fontWeight: b.read ? 400 : 600 }}>
                        {total} ta mahsulot{left < total ? ` · ${left} ta qoldi` : ""}{b.read ? "" : " · yangi"}
                      </div>
                    </div>
                    {!b.read && <span style={{ width: 9, height: 9, borderRadius: 999, background: C.pom, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reja sanasi — bozorga qachon borasiz */}
        <div style={{ margin: "0 18px 14px", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarDays size={18} color={C.pom} />
            <span style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>Bozorga boraman</span>
            <input type="date" value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              style={{ ...inp(), padding: "8px 10px", width: 150, fontWeight: 600, cursor: "pointer" }} />
            {planDate && (
              <button onClick={() => setPlanDate("")} aria-label="Tozalash"
                style={{ border: "none", background: "transparent", cursor: "pointer", color: C.sub, padding: 2 }}>
                <X size={16} />
              </button>
            )}
          </div>
          {projecting ? (
            <div style={{ marginTop: 9, fontSize: 12.5, color: C.gold, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ fontSize: 14, lineHeight: "16px" }}>↗</span>
              <span>{dateLabel(planTs)} uchun narxlar inflatsiya{projPct >= 1 ? ` (~${projPct}%)` : ""} va mavsum bo‘yicha taxminlandi (masalan, tarvuz qishda qimmat).</span>
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 12.5, color: C.sub }}>
              Kelajak kunni tanlasangiz, narxlar o‘sha oyga moslab (mavsum + inflatsiya) taxminlanadi.
            </div>
          )}
        </div>

        {/* Byudjet paneli */}
        {showBudget && (
          <div style={{ margin: "0 18px 14px", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: C.sub }}>Byudjetingiz (so‘m)</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric" placeholder="Masalan: 500000"
                style={inp()} />
              {budget !== "" && (
                <button onClick={() => setBudget("")} style={ghostBtn()}><X size={18} /></button>
              )}
            </div>
            {bnum != null && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 9, borderRadius: 99, background: C.line, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, bnum ? (totalAll / bnum) * 100 : 0)}%`, background: over ? C.pom : C.green, transition: "width .3s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 13 }}>
                  <span style={{ color: C.sub }}>Reja: <b style={{ color: C.ink }}>{som(totalAll)}</b></span>
                  <span style={{ color: over ? C.pom : C.green, fontWeight: 700 }}>
                    {over ? `${som(totalAll - bnum)} oshib ketdi` : `${som(bnum - totalAll)} qoldi`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Qo'shish kartasi */}
        <div style={{ margin: "0 18px 18px", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14, boxShadow: "0 8px 24px rgba(42,38,32,.05)" }}>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => handleName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Nima olamiz? Masalan: un, go‘sht, tarvuz"
            style={{ ...inp(), fontSize: 16, fontWeight: 600, padding: "12px 14px" }}
          />
          {variantList.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, marginBottom: 6 }}>Qaysi turi?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {variantList.map((vr) => {
                  const on = selectedVariant === vr.label;
                  return (
                    <button key={vr.label} onClick={() => pickVariant(vr)}
                      style={{
                        border: `1px solid ${on ? C.pom : C.line}`, cursor: "pointer", borderRadius: 999,
                        padding: "6px 11px", fontFamily: FONT, fontSize: 12.5, fontWeight: 700,
                        background: on ? C.pomSoft : C.paper, color: on ? C.pom : C.ink,
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                      {vr.label}
                      <span style={{ color: C.sub, fontWeight: 600 }}>{som(round500(vr.price))}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              value={qty} onChange={(e) => setQty(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))}
              onFocus={(e) => e.target.select()}
              inputMode="decimal" placeholder="1"
              style={{ ...inp(), width: 78, textAlign: "center" }} />
            <select value={unit} onChange={(e) => setUnit(e.target.value)}
              style={{ ...inp(), width: 96, fontWeight: 600, cursor: "pointer" }}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                value={price}
                onChange={(e) => { const v = e.target.value.replace(/[^\d]/g, ""); setPrice(v); setEstFlag(false); setEstErr(false); setFromMem(false); setPriceTouched(v !== ""); }}
                onFocus={(e) => e.target.select()}
                inputMode="numeric" placeholder="Narx / birlik"
                style={{ ...inp(), width: "100%", paddingRight: 38, color: estFlag ? C.gold : C.ink, fontWeight: estFlag ? 700 : 500 }} />
              <button onClick={estimatePrice} title="AI narx taxmini" disabled={estimating || !name.trim()}
                style={{
                  position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                  border: "none", background: "transparent", cursor: name.trim() ? "pointer" : "default",
                  color: name.trim() ? C.gold : C.line, padding: 4, display: "grid", placeItems: "center",
                }}>
                {estimating ? <Loader2 size={18} className="rz-spin" /> : <Sparkles size={18} />}
              </button>
            </div>
          </div>
          {(estFlag || estErr) && (
            <div style={{ marginTop: 8, fontSize: 12.5, color: estErr ? C.pom : (fromMem ? C.green : C.gold), display: "flex", alignItems: "center", gap: 6 }}>
              {fromMem ? <RefreshCw size={13} /> : <Sparkles size={13} />}
              {estErr ? "Narx topilmadi — o‘zingiz kiriting."
                : fromMem ? "Oxirgi to‘lagan narxingiz (xotiradan). Kerak bo‘lsa to‘g‘rilang."
                : "Taxminiy bozor narxi (2026), 500/1000 ga yaxlitlangan. Aniqini o‘zingiz to‘g‘rilang."}
            </div>
          )}
          <button onClick={addItem}
            style={{
              marginTop: 12, width: "100%", border: "none", cursor: "pointer", borderRadius: 14,
              background: C.pom, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 16,
              padding: "13px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 6px 16px rgba(181,64,47,.28)",
            }}>
            <Plus size={20} strokeWidth={2.6} /> Ro‘yxatga qo‘shish
          </button>
        </div>

        {/* Ulashish / Qabul qilish */}
        <div style={{ display: "flex", gap: 10, margin: "0 18px 16px" }}>
          <button onClick={openShare}
            style={{ flex: 1, border: `1px solid ${C.line}`, background: C.paper, color: C.ink, cursor: "pointer", borderRadius: 13, padding: "11px 0", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Share2 size={17} color={C.pom} /> Ulashish
          </button>
          <button onClick={() => { setRecvMsg(""); setPasteCode(""); setReceiving(true); }}
            style={{ flex: 1, border: `1px solid ${C.line}`, background: C.paper, color: C.ink, cursor: "pointer", borderRadius: 13, padding: "11px 0", fontFamily: FONT, fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Download size={17} color={C.green} /> Qabul qilish
          </button>
        </div>

        {/* Ro'yxat */}
        <div style={{ padding: "0 18px" }}>
          {items.length === 0 && (
            <div style={{ textAlign: "center", padding: "44px 20px", color: C.sub }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: C.pomSoft, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                <ShoppingBasket size={30} color={C.pom} />
              </div>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 16 }}>Ro‘yxat hozircha bo‘sh</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Yuqoridan birinchi mahsulotni qo‘shing.<br />Hech narsa esdan chiqmaydi.</div>
            </div>
          )}

          {toBuy.length > 0 && (
            <SectionLabel text="Olinadi" count={toBuy.length} color={C.pom} />
          )}
          {toBuy.map((i) => (
            <Row key={i.id} item={i} editing={editingId === i.id} refreshing={refreshingId === i.id}
              factor={factor} projecting={projecting} planLabel={planTs ? dateLabel(planTs) : ""}
              planMonth={planMonth} nowMonth={nowMonth}
              onToggle={() => toggle(i.id)} onDelete={() => remove(i.id)} onRefresh={() => refreshPrice(i.id)}
              onEdit={() => setEditingId(i.id)} onCancel={() => setEditingId(null)}
              onSave={(patch) => saveEdit(i.id, patch)} />
          ))}

          {bought.length > 0 && (
            <>
              <SectionLabel text="Olingan" count={bought.length} color={C.green} />
              {bought.map((i) => (
                <Row key={i.id} item={i} editing={editingId === i.id} refreshing={refreshingId === i.id}
                  factor={factor} projecting={projecting} planLabel={planTs ? dateLabel(planTs) : ""}
                  planMonth={planMonth} nowMonth={nowMonth}
                  onToggle={() => toggle(i.id)} onDelete={() => remove(i.id)} onRefresh={() => refreshPrice(i.id)}
                  onEdit={() => setEditingId(i.id)} onCancel={() => setEditingId(null)}
                  onSave={(patch) => saveEdit(i.id, patch)} />
              ))}
            </>
          )}

          {items.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "center" }}>
              {bought.length > 0 && (
                <button onClick={clearBought} style={textBtn(C.green)}><Eraser size={15} /> Olinganlarni tozalash</button>
              )}
              <button onClick={clearAll} style={textBtn(C.sub)}><Trash2 size={15} /> Hammasini o‘chirish</button>
            </div>
          )}
        </div>
        </>)}

        {/* ── TARIX ── */}
        {view === "history" && (
          <div style={{ padding: "0 18px" }}>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 20px", color: C.sub }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: C.pomSoft, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                  <Store size={28} color={C.pom} />
                </div>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: 16 }}>Tarix bo‘sh</div>
                <div style={{ fontSize: 14, marginTop: 4 }}>Bozorni yakunlaganingizda har bir do‘kon xaridi<br />shu yerda saqlanadi.</div>
              </div>
            ) : history.map((t) => {
              const open = openTrip === t.id;
              return (
                <div key={t.id} style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, marginBottom: 10, overflow: "hidden" }}>
                  <div onClick={() => { setOpenTrip(open ? null : t.id); if (!open) loadTripPhoto(t.id); }}
                    style={{ display: "flex", alignItems: "center", gap: 11, padding: 13, cursor: "pointer" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: C.pomSoft, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Store size={19} color={C.pom} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5 }}>{t.store}</div>
                      <div style={{ fontSize: 12.5, color: C.sub }}>{fullDate(t.date)} · {t.items.length} ta {t.hasPhoto ? "· 📷 chek" : ""}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.pom }}>{som(t.total)}</div>
                      <div style={{ fontSize: 11, color: C.sub }}>so‘m</div>
                    </div>
                  </div>
                  {open && (
                    <div style={{ borderTop: `1px solid ${C.line}`, padding: 13 }}>
                      {t.items.map((it, ix) => (
                        <div key={ix} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0", color: C.ink }}>
                          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {it.name}{it.variant ? <span style={{ color: C.sub }}> · {it.variant}</span> : ""} <span style={{ color: C.sub }}>{fmtQty(it.qty)} {it.unit}</span>
                          </span>
                          <span style={{ fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{som((it.price || 0) * (Number(it.qty) || 0))}</span>
                        </div>
                      ))}
                      {t.hasPhoto && tripPhotos[t.id] && (
                        <img src={tripPhotos[t.id]} alt="chek" style={{ width: "100%", borderRadius: 12, marginTop: 10, border: `1px solid ${C.line}` }} />
                      )}
                      <button onClick={() => deleteTrip(t.id)} style={{ ...textBtn(C.sub), marginTop: 8 }}>
                        <Trash2 size={14} /> Bu xaridni o‘chirish
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── NARXLAR (monitoring) ── */}
        {view === "prices" && (
          <div style={{ padding: "0 18px" }}>
            <div style={{ fontSize: 12.5, color: C.sub, marginBottom: 10 }}>
              Qo‘lda kiritilgan va to‘langan narxlar shu yerda saqlanadi. Keyingi safar shu narxlar taklif qilinadi.
            </div>
            {Object.keys(learned).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: C.sub }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: C.goldSoft, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                  <RefreshCw size={26} color={C.gold} />
                </div>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: 16 }}>Narx xotirasi bo‘sh</div>
                <div style={{ fontSize: 14, marginTop: 4 }}>Narx kiriting yoki bozorni yakunlang —<br />narxlar shu yerda yig‘iladi.</div>
              </div>
            ) : Object.entries(learned).sort((a, b) => (b[1].date || 0) - (a[1].date || 0)).map(([k, info]) => {
              const log = priceLog[k] || [];
              const prev = log.length >= 2 ? log[log.length - 2].price : null;
              const diff = prev != null ? info.price - prev : 0;
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: "11px 12px", marginBottom: 9 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{info.name || k.split("|")[0]}{info.variant ? <span style={{ color: C.sub, fontWeight: 600 }}> · {info.variant}</span> : ""}</div>
                    <div style={{ fontSize: 12, color: C.sub }}>{info.store ? info.store + " · " : ""}{dateLabel(info.date)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{som(info.price)} <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>so‘m/{info.unit}</span></div>
                    {prev != null && diff !== 0 && (
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: diff > 0 ? C.pom : C.green }}>
                        {diff > 0 ? "↑" : "↓"} {som(Math.abs(diff))} (oldin {som(prev)})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pastki yakuniy hisob (cheksoldek) */}
      {view === "list" && items.length > 0 && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0,
          background: "rgba(251,246,238,.86)", backdropFilter: "blur(10px)",
          borderTop: `1px solid ${C.line}`,
        }}>
          <div style={{ maxWidth: 540, margin: "0 auto", padding: "14px 18px calc(14px + env(safe-area-inset-bottom))" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Stat label="Olinadi (qoldi)" value={totalRemaining} color={C.pom} big />
              <Stat label="Olingan" value={totalBought} color={C.green} />
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, color: C.sub, fontWeight: 600 }}>
                {projecting ? `Uydan oling (~${dateLabel(planTs)})` : "Jami xarajat (reja)"}
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: over ? C.pom : C.ink }}>{som(totalAll)} <span style={{ fontSize: 14, fontWeight: 600, color: C.sub }}>so‘m</span></span>
            </div>
            {bought.length > 0 && (
              <button onClick={() => { setStoreName(stores[0] || ""); setReadMsg(""); setFinishing(true); }}
                style={{
                  marginTop: 10, width: "100%", border: "none", cursor: "pointer", borderRadius: 12,
                  background: C.green, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 15,
                  padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                <Store size={18} /> Bozorni yakunlash ({bought.length} ta)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bozorni yakunlash oynasi */}
      {finishing && (
        <div onClick={() => !savingTrip && setFinishing(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(42,38,32,.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 540, background: C.bg, borderRadius: "20px 20px 0 0", padding: "18px 18px calc(18px + env(safe-area-inset-bottom))", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, flex: 1 }}>Bozorni yakunlash</h2>
              <button onClick={() => setFinishing(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.sub }}><X size={22} /></button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 700, color: C.sub }}>Qaysi do‘kon / bozor?</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Masalan: Chorsu, Korzinka, mahalla do‘koni"
              style={{ ...inp(), width: "100%", marginTop: 7, fontWeight: 600 }} />
            {stores.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {stores.map((s) => (
                  <button key={s} onClick={() => setStoreName(s)}
                    style={{ border: `1px solid ${storeName === s ? C.pom : C.line}`, background: storeName === s ? C.pomSoft : C.paper, color: storeName === s ? C.pom : C.ink, cursor: "pointer", borderRadius: 999, padding: "5px 11px", fontFamily: FONT, fontSize: 12.5, fontWeight: 700 }}>{s}</button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 14, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 12.5, color: C.sub, fontWeight: 700, marginBottom: 6 }}>Olingan mahsulotlar ({bought.length})</div>
              {bought.map((i) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "3px 0" }}>
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}{i.variant ? <span style={{ color: C.sub }}> · {i.variant}</span> : ""} <span style={{ color: C.sub }}>{fmtQty(i.qty)} {i.unit}</span></span>
                  <span style={{ fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>{som((nowUnit(i) || 0) * (Number(i.qty) || 0))}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${C.line}`, fontWeight: 800 }}>
                <span>Jami</span><span style={{ color: C.pom }}>{som(bought.reduce((s, i) => s + (nowUnit(i) || 0) * (Number(i.qty) || 0), 0))} so‘m</span>
              </div>
            </div>

            <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{ display: "none" }} />
            {tripPhoto ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ position: "relative" }}>
                  <img src={tripPhoto} alt="chek" style={{ width: "100%", borderRadius: 12, border: `1px solid ${C.line}` }} />
                  <button onClick={() => { setTripPhoto(null); setReadMsg(""); }} style={{ position: "absolute", top: 8, right: 8, border: "none", background: "rgba(42,38,32,.7)", color: "#fff", borderRadius: 999, width: 30, height: 30, cursor: "pointer", display: "grid", placeItems: "center" }}><X size={18} /></button>
                </div>
                <button onClick={readReceipt} disabled={reading}
                  style={{ marginTop: 10, width: "100%", border: "none", cursor: "pointer", borderRadius: 12, background: C.gold, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 14.5, padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {reading ? <Loader2 size={18} className="rz-spin" /> : <Sparkles size={18} />}
                  {reading ? "Chek o‘qilyapti…" : "Chekdan narxlarni o‘qish"}
                </button>
                {readMsg && (
                  <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, color: readMsg.startsWith("✓") ? C.green : C.pom, textAlign: "center" }}>{readMsg}</div>
                )}
              </div>
            ) : (
              <button onClick={() => photoRef.current && photoRef.current.click()}
                style={{ marginTop: 12, width: "100%", border: `1.5px dashed ${C.line}`, background: C.paper, color: C.ink, cursor: "pointer", borderRadius: 12, padding: "12px 0", fontFamily: FONT, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Camera size={18} color={C.pom} /> Chek rasmini qo‘shish
              </button>
            )}

            <button onClick={saveTrip} disabled={savingTrip}
              style={{ marginTop: 14, width: "100%", border: "none", cursor: "pointer", borderRadius: 14, background: C.green, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 16, padding: "13px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {savingTrip ? <Loader2 size={18} className="rz-spin" /> : <Check size={20} strokeWidth={2.6} />} Saqlash va tarixga qo‘shish
            </button>
            <div style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 8 }}>
              Narxlar xotiraga yoziladi — keyingi safar aniqroq bo‘ladi.
            </div>
          </div>
        </div>
      )}

      {/* Ulashish oynasi — telefon orqali */}
      {sharing && (
        <div onClick={() => setSharing(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(42,38,32,.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 540, background: C.bg, borderRadius: "20px 20px 0 0", padding: "18px 18px calc(18px + env(safe-area-inset-bottom))", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, flex: 1 }}>Ro‘yxatni yuborish</h2>
              <button onClick={() => setSharing(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.sub }}><X size={22} /></button>
            </div>

            {items.filter((i) => !i.bought).length === 0 ? (
              <div style={{ fontSize: 14, color: C.sub, padding: "10px 0" }}>Yuborish uchun ro‘yxatda kamida bitta olinadigan mahsulot bo‘lishi kerak.</div>
            ) : (<>
              <div style={{ fontSize: 13.5, color: C.sub, marginBottom: 10 }}>
                Do‘stingizning telefon raqamini kiriting — ro‘yxat uning ilovasida o‘zi ochiladi.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.line}`, borderRadius: 11, background: "#FFFDFA", padding: "4px 12px" }}>
                <span style={{ fontWeight: 800, color: C.ink, fontSize: 16 }}>+998</span>
                <div style={{ width: 1, height: 22, background: C.line }} />
                <input value={toPhone} onChange={(e) => { setToPhone(e.target.value.replace(/\D/g, "").slice(0, 9)); setSendMsg(""); }} inputMode="numeric"
                  placeholder="90 123 45 67"
                  style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontFamily: FONT, fontSize: 16, fontWeight: 600, color: C.ink, padding: "10px 0", minWidth: 0 }} />
              </div>
              {me && me.recents && me.recents.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {me.recents.map((p) => (
                    <button key={p} onClick={() => setToPhone(p.replace(/^998/, ""))}
                      style={{ border: `1px solid ${C.line}`, background: C.paper, color: C.ink, cursor: "pointer", borderRadius: 999, padding: "5px 11px", fontFamily: FONT, fontSize: 12.5, fontWeight: 700 }}>+998 {p.replace(/^998/, "")}</button>
                  ))}
                </div>
              )}
              {sendMsg && (
                <div style={{ marginTop: 9, fontSize: 13, fontWeight: 600, color: sendMsg.startsWith("✓") ? C.green : C.pom }}>{sendMsg}</div>
              )}
              <button onClick={sendToPhone} disabled={sending}
                style={{ marginTop: 12, width: "100%", border: "none", cursor: "pointer", borderRadius: 14, background: C.pom, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 16, padding: "13px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {sending ? <Loader2 size={18} className="rz-spin" /> : <Send size={18} />} Yuborish
              </button>
              <div style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 8 }}>
                Do‘stingiz ham shu ilovadan, o‘z raqami bilan kirgan bo‘lishi kerak.
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 12px" }}>
                <div style={{ flex: 1, height: 1, background: C.line }} />
                <span style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>yoki kod bilan</span>
                <div style={{ flex: 1, height: 1, background: C.line }} />
              </div>
              {!shareCode ? (
                <button onClick={makeCode}
                  style={{ width: "100%", border: `1px solid ${C.line}`, background: C.paper, color: C.ink, cursor: "pointer", borderRadius: 13, padding: "11px 0", fontFamily: FONT, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Share2 size={16} color={C.pom} /> Kod yaratish
                </button>
              ) : (<>
                <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, fontSize: 12, color: C.sub, wordBreak: "break-all", maxHeight: 110, overflowY: "auto", fontFamily: "ui-monospace, monospace" }}>{shareCode}</div>
                <button onClick={webShareCode}
                  style={{ marginTop: 9, width: "100%", border: "none", cursor: "pointer", borderRadius: 13, background: C.green, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 14.5, padding: "11px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Send size={17} /> Kodni yuborish
                </button>
                <button onClick={copyShare}
                  style={{ marginTop: 8, width: "100%", border: `1px solid ${C.line}`, cursor: "pointer", borderRadius: 13, background: C.paper, color: copied ? C.green : C.ink, fontFamily: FONT, fontWeight: 700, fontSize: 14, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Nusxa olindi" : "Nusxalash"}
                </button>
              </>)}
            </>)}
          </div>
        </div>
      )}

      {/* Qabul qilish oynasi — avtomatik + kod (zaxira) */}
      {receiving && (
        <div onClick={() => setReceiving(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(42,38,32,.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 540, background: C.bg, borderRadius: "20px 20px 0 0", padding: "18px 18px calc(18px + env(safe-area-inset-bottom))", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, flex: 1 }}>Ro‘yxatni qabul qilish</h2>
              <button onClick={() => setReceiving(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.sub }}><X size={22} /></button>
            </div>
            <div style={{ fontSize: 13.5, color: C.sub, marginBottom: 10 }}>
              Sizga yuborilgan ro‘yxatlar <b style={{ color: C.ink }}>o‘zi avtomatik keladi</b>. Darrov ko‘rish uchun tekshiring:
            </div>
            <button onClick={() => checkInbox(true)}
              style={{ width: "100%", border: "none", cursor: "pointer", borderRadius: 14, background: C.green, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 16, padding: "13px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <RefreshCw size={18} /> Hozir tekshirish
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 12px" }}>
              <div style={{ flex: 1, height: 1, background: C.line }} />
              <span style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>yoki kod bilan</span>
              <div style={{ flex: 1, height: 1, background: C.line }} />
            </div>
            <textarea value={pasteCode} onChange={(e) => setPasteCode(e.target.value)} placeholder="ROZGOR1:..." rows={3}
              style={{ ...inp(), width: "100%", resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 12 }} />
            {recvMsg && (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: recvMsg.startsWith("✓") ? C.green : C.pom }}>{recvMsg}</div>
            )}
            <button onClick={importList} disabled={!pasteCode.trim()}
              style={{ marginTop: 10, width: "100%", border: `1px solid ${C.line}`, cursor: pasteCode.trim() ? "pointer" : "default", borderRadius: 13, background: C.paper, color: pasteCode.trim() ? C.ink : C.sub, fontFamily: FONT, fontWeight: 700, fontSize: 14, padding: "11px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={17} /> Koddan ochish
            </button>
          </div>
        </div>
      )}

      {/* Telefon raqami so'rash (birinchi kirish) */}
      {needPhone && (
        <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 380 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: C.pom, display: "grid", placeItems: "center", margin: "0 auto 16px", boxShadow: "0 8px 20px rgba(181,64,47,.3)" }}>
              <ShoppingBasket size={28} color="#fff" />
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, textAlign: "center" }}>Ro‘zgorga xush kelibsiz</h2>
            <p style={{ margin: "0 0 18px", fontSize: 14, color: C.sub, textAlign: "center" }}>
              Ro‘yxatlarni do‘stlaringiz bilan almashish uchun telefon raqamingizni kiriting.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.line}`, borderRadius: 11, background: "#FFFDFA", padding: "4px 12px" }}>
              <span style={{ fontWeight: 800, color: C.ink, fontSize: 16 }}>+998</span>
              <div style={{ width: 1, height: 22, background: C.line }} />
              <input value={obPhone} onChange={(e) => setObPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="numeric" placeholder="90 123 45 67"
                style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontFamily: FONT, fontSize: 16, fontWeight: 600, color: C.ink, padding: "10px 0", minWidth: 0 }} />
            </div>
            <input value={obName} onChange={(e) => setObName(e.target.value)} placeholder="Ismingiz (ixtiyoriy)"
              style={{ ...inp(), width: "100%", fontSize: 15, marginTop: 10, padding: "12px 14px" }} />
            <button onClick={completeOnboard} disabled={normPhone(obPhone).length < 9}
              style={{ marginTop: 14, width: "100%", border: "none", cursor: normPhone(obPhone).length >= 9 ? "pointer" : "default", borderRadius: 14, background: normPhone(obPhone).length >= 9 ? C.pom : C.line, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 16, padding: "13px 0" }}>
              Davom etish
            </button>
            <p style={{ margin: "12px 0 0", fontSize: 11.5, color: C.sub, textAlign: "center" }}>
              Raqamingiz faqat ro‘yxat almashish uchun ishlatiladi.
            </p>
          </div>
        </div>
      )}

      {/* Kelgan savatni ochish */}
      {openBasketId && (() => {
        const ob = inbox.find((b) => b.id === openBasketId);
        if (!ob) return null;
        const total = ob.items.reduce((s, i) => s + (i.price != null ? Number(i.price) * (Number(i.qty) || 1) : 0), 0);
        const left = ob.items.filter((i) => !i.bought).length;
        return (
          <div onClick={() => setOpenBasketId(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(42,38,32,.5)", zIndex: 55, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 540, background: C.bg, borderRadius: "20px 20px 0 0", padding: "16px 16px calc(16px + env(safe-area-inset-bottom))", maxHeight: "88vh", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gold, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <ShoppingBasket size={20} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{basketTitle(ob)}</h2>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>{ob.items.length} ta mahsulot{left < ob.items.length ? ` · ${left} ta qoldi` : ""}</div>
                </div>
                <button onClick={() => setOpenBasketId(null)} style={{ border: "none", background: "transparent", cursor: "pointer", color: C.sub }}><X size={22} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {ob.items.map((it) => (
                  <div key={it.id} onClick={() => toggleBasketItem(ob.id, it.id)}
                    style={{ display: "flex", alignItems: "center", gap: 11, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer", opacity: it.bought ? 0.55 : 1 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${it.bought ? C.green : C.line}`, background: it.bought ? C.green : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {it.bought && <Check size={14} color="#fff" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink, textDecoration: it.bought ? "line-through" : "none" }}>
                        {it.name}{it.variant ? ` (${it.variant})` : ""}
                      </div>
                      <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>{som(it.qty)} {it.unit}{it.price != null ? ` · ${som(it.price * (Number(it.qty) || 1))} so‘m` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>

              {total > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, padding: "10px 13px", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12 }}>
                  <span style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>Taxminiy jami</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: C.pom }}>{som(total)} so‘m</span>
                </div>
              )}

              <button onClick={() => deleteBasket(ob.id)}
                style={{ marginTop: 13, width: "100%", border: "none", cursor: "pointer", borderRadius: 14, background: C.green, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 15.5, padding: "13px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Check size={18} /> Bozorlik tugadi — o‘chirish
              </button>
              <div style={{ fontSize: 11.5, color: C.sub, textAlign: "center", marginTop: 7 }}>
                O‘chirsangiz, bu ro‘yxat yo‘qoladi. Sizning o‘z ro‘yxatingizga tegmaydi.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Kelgan ro'yxat bildirishnomasi */}
      {incoming && (
        <div style={{ position: "fixed", top: 14, left: 0, right: 0, zIndex: 70, display: "flex", justifyContent: "center", padding: "0 14px", pointerEvents: "none" }}>
          <div style={{ background: incoming.startsWith("✓") ? C.green : C.ink, color: "#fff", borderRadius: 14, padding: "12px 18px", fontWeight: 700, fontSize: 14, boxShadow: "0 8px 24px rgba(42,38,32,.25)", maxWidth: 520, display: "flex", alignItems: "center", gap: 8 }}>
            <Download size={17} /> {incoming}
          </div>
        </div>
      )}

      <style>{`
        .rz-spin { animation: rzspin 1s linear infinite; }
        @keyframes rzspin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${C.sub}; opacity: .8; }
        select:focus, input:focus { outline: 2px solid ${C.pom}; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce) { .rz-spin { animation: none; } }
      `}</style>
    </div>
  );
}

function SectionLabel({ text, count, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 2px 8px" }}>
      <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".02em", color }}>{text.toUpperCase()}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color, background: `${color}1A`, borderRadius: 99, padding: "1px 8px" }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: C.line }} />
    </div>
  );
}

function Stat({ label, value, color, big }) {
  return (
    <div style={{ flex: 1, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 12px" }}>
      <div style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: big ? 20 : 17, fontWeight: 800, color, marginTop: 2 }}>{som(value)} <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>so‘m</span></div>
    </div>
  );
}

function Row({ item, editing, refreshing, factor = 1, projecting = false, planLabel = "", planMonth = 0, nowMonth = 0, onToggle, onDelete, onRefresh, onEdit, onCancel, onSave }) {
  const [n, setN] = useState(item.name);
  const [q, setQ] = useState(String(item.qty));
  const [u, setU] = useState(item.unit);
  const [p, setP] = useState(item.price == null ? "" : String(item.price));

  useEffect(() => {
    if (editing) { setN(item.name); setQ(String(item.qty)); setU(item.unit); setP(item.price == null ? "" : String(item.price)); }
  }, [editing]);

  if (editing) {
    return (
      <div style={{ background: C.paper, border: `1px solid ${C.pom}`, borderRadius: 16, padding: 12, marginBottom: 10 }}>
        <input value={n} onChange={(e) => setN(e.target.value)} style={{ ...inp(), fontWeight: 700, fontSize: 15 }} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value.replace(/[^\d.,]/g, "").replace(",", "."))} onFocus={(e) => e.target.select()} inputMode="decimal" style={{ ...inp(), width: 72, textAlign: "center" }} />
          <select value={u} onChange={(e) => setU(e.target.value)} style={{ ...inp(), width: 92, cursor: "pointer" }}>
            {UNITS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <input value={p} onChange={(e) => setP(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="Narx/birlik" style={{ ...inp(), flex: 1 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={() => {
              const newPrice = p === "" ? null : (parseFloat(p) || 0);
              const changed = newPrice != null && Number(newPrice) !== Number(item.price);
              onSave({
                name: n.trim() || item.name, qty: parseFloat(q) || 1, unit: u,
                price: newPrice, est: false, seasonKey: changed ? null : item.seasonKey,
                priceDate: newPrice == null ? null : (changed ? Date.now() : (item.priceDate || Date.now())),
              });
            }}
            style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 11, background: C.pom, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 14, padding: "10px 0" }}>
            Saqlash
          </button>
          <button onClick={onCancel} style={ghostBtn(true)}>Bekor</button>
        </div>
      </div>
    );
  }

  const dispUnit = projUnit(item, projecting ? factor : 1, projecting ? planMonth : nowMonth, nowMonth);
  const lt = dispUnit == null ? 0 : dispUnit * (Number(item.qty) || 0);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 9, background: C.paper,
      border: `1px solid ${C.line}`, borderRadius: 16, padding: "12px 10px", marginBottom: 10,
      opacity: item.bought ? 0.66 : 1,
    }}>
      <button onClick={onToggle} aria-label="Olindi"
        style={{
          width: 30, height: 30, borderRadius: 10, flexShrink: 0, cursor: "pointer",
          border: item.bought ? "none" : `2px solid ${C.line}`,
          background: item.bought ? C.green : "transparent",
          display: "grid", placeItems: "center",
        }}>
        {item.bought && <Check size={18} color="#fff" strokeWidth={3} />}
      </button>

      <div onClick={onEdit} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
        <div style={{ fontWeight: 700, fontSize: 15.5, textDecoration: item.bought ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.name}{item.variant && <span style={{ color: C.sub, fontWeight: 600 }}> · {item.variant}</span>}
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span>{fmtQty(item.qty)} {item.unit}</span>
          {dispUnit != null && <><span style={{ opacity: .5 }}>·</span><span>{som(dispUnit)} so‘m/{item.unit}</span></>}
          {projecting && dispUnit != null
            ? <span style={{ color: C.gold, display: "inline-flex", alignItems: "center", gap: 2, fontWeight: 700 }}>↗ {planLabel}</span>
            : (item.fromMemory
              ? <span style={{ color: C.green, display: "inline-flex", alignItems: "center", gap: 2, fontWeight: 700 }}><RefreshCw size={11} />oxirgi narx</span>
              : (item.est && <span style={{ color: C.gold, display: "inline-flex", alignItems: "center", gap: 2, fontWeight: 700 }}><Sparkles size={11} />taxmin</span>))}
          {!projecting && item.priceDate && <span style={{ opacity: .85, display: "inline-flex", alignItems: "center", gap: 3 }}><RefreshCw size={10} />{dateLabel(item.priceDate)}</span>}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{dispUnit != null ? som(lt) : "—"}</div>
        <div style={{ fontSize: 11, color: C.sub }}>so‘m</div>
      </div>

      <button onClick={onRefresh} aria-label="Narxni yangilash" title="Narxni yangilash" disabled={refreshing}
        style={{ border: "none", background: "transparent", cursor: refreshing ? "default" : "pointer", color: C.gold, padding: 4, flexShrink: 0, display: "grid", placeItems: "center" }}>
        <RefreshCw size={17} className={refreshing ? "rz-spin" : ""} />
      </button>

      <button onClick={onDelete} aria-label="O'chirish"
        style={{ border: "none", background: "transparent", cursor: "pointer", color: C.sub, padding: 4, flexShrink: 0 }}>
        <Trash2 size={18} />
      </button>
    </div>
  );
}

function fmtQty(q) {
  const n = Number(q) || 0;
  return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

// ── stillar ──
function inp() {
  return {
    border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 12px",
    fontFamily: FONT, fontSize: 14, color: C.ink, background: "#FFFDFA",
    boxSizing: "border-box", appearance: "none",
  };
}
function ghostBtn(wide) {
  return {
    border: `1px solid ${C.line}`, background: C.paper, color: C.sub, cursor: "pointer",
    borderRadius: 11, padding: wide ? "10px 18px" : "0 12px", fontFamily: FONT, fontWeight: 700, fontSize: 14,
    display: "grid", placeItems: "center",
  };
}
function textBtn(color) {
  return {
    border: "none", background: "transparent", color, cursor: "pointer",
    fontFamily: FONT, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 5, padding: "6px 8px",
  };
}


ReactDOM.createRoot(document.getElementById("root")).render(<App />);
