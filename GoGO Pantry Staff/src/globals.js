export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const STATIC_BASE = import.meta.env.VITE_STATIC_URL || "http://localhost:3000";

export const G = {
  api: API_BASE,
  token: sessionStorage.getItem("staff_token") || null,
  currentUser: JSON.parse(sessionStorage.getItem("staff_user") || "null"),
  SHOPS: [
    { id: "msn", name: "Main Store North", code: "MSN", tint: 152, location: "123 Main St", hours: "6am - 11pm", distance: 0 },
    { id: "dst", name: "Downtown Store", code: "DST", tint: 245, location: "456 Oak Ave", hours: "7am - 10pm", distance: 2.1 },
    { id: "wst", name: "West Side Shop", code: "WST", tint: 45, location: "789 Park Blvd", hours: "6am - 11pm", distance: 4.5 },
    { id: "est", name: "East Village Market", code: "EST", tint: 25, location: "321 River Rd", hours: "8am - 9pm", distance: 3.2 },
  ],
  CATEGORIES: [
    { id: "produce", name: "Produce", hue: 152 },
    { id: "dairy", name: "Dairy & Eggs", hue: 45 },
    { id: "meat", name: "Meat & Seafood", hue: 25 },
    { id: "pantry", name: "Pantry", hue: 220 },
    { id: "frozen", name: "Frozen Foods", hue: 245 },
    { id: "beverages", name: "Beverages", hue: 300 },
  ],
  PRODUCTS: [
    { id: "p1", name: "Fresh Tomatoes", cat: "produce", price: 3.99, unit: "lb", par: 40, supplier: "fresh-farms", supplier_code: "FF" },
    { id: "p2", name: "Organic Lettuce", cat: "produce", price: 2.49, unit: "head", par: 30, supplier: "fresh-farms", supplier_code: "FF" },
    { id: "p3", name: "Free Range Eggs", cat: "dairy", price: 5.99, unit: "dozen", par: 25, supplier: "happy-hens", supplier_code: "HH" },
    { id: "p4", name: "Greek Yogurt", cat: "dairy", price: 4.99, unit: "32oz", par: 20, supplier: "dairy-supreme", supplier_code: "DS" },
    { id: "p5", name: "Salmon Fillets", cat: "meat", price: 12.99, unit: "lb", par: 15, supplier: "sea-harvest", supplier_code: "SH" },
    { id: "p6", name: "Grass Fed Beef", cat: "meat", price: 8.99, unit: "lb", par: 20, supplier: "ranch-natural", supplier_code: "RN" },
    { id: "p7", name: "Whole Grain Bread", cat: "pantry", price: 3.49, unit: "loaf", par: 35, supplier: "baker-artisan", supplier_code: "BA" },
    { id: "p8", name: "Almond Butter", cat: "pantry", price: 7.99, unit: "16oz", par: 18, supplier: "nuts-world", supplier_code: "NW" },
  ],
  ORDERS: [
    { id: "ORD-001", customer: "Sarah Chen", initials: "SC", items: 5, total: 42.50, status: "new", type: "Pickup", slot: "Today · 2:00 PM", address: "123 Main St", placed: "2:14 PM", picker: null },
    { id: "ORD-002", customer: "John Miller", initials: "JM", items: 8, total: 67.25, status: "picking", type: "Delivery", slot: "Today · 3:30 PM", address: "456 Oak Ave", placed: "1:45 PM", picker: "Alex" },
    { id: "ORD-003", customer: "Emma Rodriguez", initials: "ER", items: 3, total: 24.99, status: "ready", type: "Pickup", slot: "Today · 4:00 PM", address: "789 Park Blvd", placed: "1:20 PM", picker: null },
    { id: "ORD-004", customer: "James Wilson", initials: "JW", items: 6, total: 51.75, status: "new", type: "Delivery", slot: "Today · 5:00 PM", address: "321 River Rd", placed: "2:00 PM", picker: null },
    { id: "ORD-005", customer: "Lisa Thompson", initials: "LT", items: 4, total: 38.50, status: "completed", type: "Pickup", slot: "Earlier today", address: "123 Main St", placed: "12:30 PM", picker: null },
  ],
  DELIVERIES: [
    { id: "PO-2206", supplier: "FF", status: "arrived", items: 12, eta: "Today 1:00 PM" },
    { id: "PO-2207", supplier: "HH", status: "in-transit", items: 8, eta: "Today 3:30 PM" },
    { id: "PO-2208", supplier: "DS", status: "scheduled", items: 10, eta: "Tomorrow 9:00 AM" },
  ],
  money: (n) => "$" + (parseFloat(n) || 0).toFixed(2),
  shopStock: (pid, sid) => 15 + ((pid.charCodeAt(1) + sid.charCodeAt(1)) % 35),
  stockState: (stock, par) => stock === 0 ? "out" : stock < par * 0.3 ? "critical" : stock < par * 0.6 ? "low" : "ok",
  catOf: (catId) => G.CATEGORIES.find(c => c.id === catId) || { id: catId, name: "Unknown", hue: 0 },
  supplierOf: (suppId) => {
    const map = {
      "FF": { id: "FF", name: "Fresh Farms Co.", type: "Produce", lead: "2 days" },
      "HH": { id: "HH", name: "Happy Hens Farm", type: "Poultry", lead: "1 day" },
      "DS": { id: "DS", name: "Dairy Supreme", type: "Dairy", lead: "1 day" },
      "SH": { id: "SH", name: "Sea Harvest Fish", type: "Seafood", lead: "2 days" },
      "RN": { id: "RN", name: "Ranch Natural", type: "Meat", lead: "2 days" },
      "BA": { id: "BA", name: "Baker Artisan", type: "Bakery", lead: "Daily" },
      "NW": { id: "NW", name: "Nuts World", type: "Specialty", lead: "3 days" },
    };
    return map[suppId] || { id: suppId, name: "Unknown Supplier", type: "General", lead: "Unknown" };
  },
};

export function authHeaders() {
  return G.token
    ? { Authorization: `Bearer ${G.token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export function buildHeaders(options) {
  if (options.body instanceof FormData) {
    return G.token ? { Authorization: `Bearer ${G.token}` } : {};
  }
  return { ...authHeaders(), ...(options.headers || {}) };
}

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: buildHeaders(options) });
  if (res.status === 401) {
    const refreshToken = sessionStorage.getItem("staff_refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          G.token = refreshData.token;
          sessionStorage.setItem("staff_token", refreshData.token);
          return fetch(url, { ...options, headers: buildHeaders(options) });
        }
      } catch { /* fall through */ }
    }
    sessionStorage.clear();
    G.token = null;
    G.currentUser = null;
    window.location.reload();
    return null;
  }
  return res;
}

export async function initializeAppData() {
  try {
    const headers = authHeaders();
    const shopsRes = await fetch(`${API_BASE}/shops`, { headers });
    if (shopsRes.ok) {
      const data = await shopsRes.json();
      if (Array.isArray(data) && data.length > 0) {
        G.SHOPS = data.map(s => ({
          id: s.id, name: s.name, code: s.code || s.id.toUpperCase(),
          tint: parseInt(s.tint) || 152, location: s.city || s.location || "",
          hours: s.hours || "", distance: 0,
        }));
      }
    }
    const catsRes = await fetch(`${API_BASE}/categories`, { headers });
    if (catsRes.ok) {
      const data = await catsRes.json();
      if (Array.isArray(data) && data.length > 0) {
        G.CATEGORIES = data.map(c => ({ id: c.id, name: c.name, hue: c.hue || 152 }));
      }
    }
    const productsRes = await fetch(`${API_BASE}/products`, { headers });
    if (productsRes.ok) {
      const data = await productsRes.json();
      if (Array.isArray(data) && data.length > 0) {
        G.PRODUCTS = data.map(p => ({
          ...p,
          cat: p.cat || p.category_id || p.categoryId || "pantry",
          supplier_code: p.supplier_code || (p.supplier_id || p.supplierId || "").toUpperCase().slice(0, 2),
        }));
      }
    }
  } catch {
    console.log("Using mock data for staff app");
  }
}

initializeAppData();
