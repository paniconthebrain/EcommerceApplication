export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const STATIC_BASE = import.meta.env.VITE_STATIC_URL || "http://localhost:3000";

export const G = {
  api: API_BASE,
  token: sessionStorage.getItem("staff_token") || null,
  currentUser: JSON.parse(sessionStorage.getItem("staff_user") || "null"),
  // These start empty and are populated exclusively from the backend in
  // initializeAppData(). They must NEVER contain placeholder/mock shop data —
  // a shopId like "msn" that doesn't exist in the database caused real
  // production 404s and FK violations when it leaked into real requests.
  SHOPS: [],
  CATEGORIES: [],
  PRODUCTS: [],
  // Set to true when the last initializeAppData() call failed to reach the
  // backend, so callers can show a real error instead of silently proceeding
  // with stale/empty data.
  dataLoadError: false,
  money: (n) => "$" + (parseFloat(n) || 0).toFixed(2),
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
    if (!shopsRes.ok) throw new Error(`Failed to load shops (${shopsRes.status})`);
    const shopsData = await shopsRes.json();
    if (!Array.isArray(shopsData)) throw new Error('Unexpected shops response');
    // Always reflect the real backend state, including a real empty list —
    // never leave a previous/placeholder shop list in place on success.
    G.SHOPS = shopsData.map(s => ({
      id: s.id, name: s.name, code: s.code || s.id.toUpperCase(),
      tint: parseInt(s.tint) || 152, location: s.city || s.location || "",
      hours: s.hours || "", distance: 0,
    }));

    const catsRes = await fetch(`${API_BASE}/categories`, { headers });
    if (catsRes.ok) {
      const data = await catsRes.json();
      G.CATEGORIES = Array.isArray(data) ? data.map(c => ({ id: c.id, name: c.name, hue: c.hue || 152 })) : [];
    }
    const productsRes = await fetch(`${API_BASE}/products`, { headers });
    if (productsRes.ok) {
      const data = await productsRes.json();
      G.PRODUCTS = Array.isArray(data) ? data.map(p => ({
        ...p,
        cat: p.cat || p.category_id || p.categoryId || "pantry",
        supplier_code: p.supplier_code || (p.supplier_id || p.supplierId || "").toUpperCase().slice(0, 2),
      })) : [];
    }

    G.dataLoadError = false;
    return true;
  } catch (err) {
    // Do NOT fall back to placeholder data here — a stale/fake shop id
    // leaking into a real API call is exactly what caused the production
    // "Shop not found" incidents. Surface the failure instead.
    G.dataLoadError = true;
    G.SHOPS = [];
    window.dispatchEvent(new CustomEvent("staffDataError"));
    return false;
  }
}

initializeAppData();

// Re-validates that `shopId` still refers to a real shop (it may have been
// deleted/renamed in another tab/session). Returns a valid shopId to use, or
// null if none exist. Always re-fetches so admins recover automatically
// instead of being stuck polling a dead shop id forever.
export async function resolveValidShopId(currentShopId) {
  await initializeAppData();
  if (currentShopId && G.SHOPS.some(s => s.id === currentShopId)) return currentShopId;
  return G.SHOPS[0]?.id || null;
}
