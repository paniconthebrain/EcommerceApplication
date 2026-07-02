export const APP_CONFIG = {
  deliveryEnabled: false,
};

export const G = {
  SHOPS: [],
  CATEGORIES: [],
  PRODUCTS: [],
  ORDERS: [],
  PRODUCTS_MAP: {},
  SHOP_INVENTORY: {},

  catOf(catId) {
    const cat = G.CATEGORIES.find(c => c.id === catId);
    return cat || { id: "default", name: "Default", hue: 152 };
  },
  productsByCat(catId) {
    if (!catId || catId === "all") return G.PRODUCTS;
    return G.PRODUCTS.filter(p => p.cat === catId);
  },
  stockState(stock, par = 5) {
    if (stock <= 0) return "out";
    if (stock <= par) return "low";
    return "ok";
  },
  shopStock(productId, shopId) {
    const inventory = G.SHOP_INVENTORY[shopId];
    if (inventory) {
      const item = inventory.find(i => String(i.productId) === String(productId));
      if (item) return item.stock;
    }
    const product = G.PRODUCTS.find(p => String(p.id) === String(productId));
    if (!product) return 0;
    if (!shopId) return product.stock;
    const variation = shopId.charCodeAt(0) % 5;
    return Math.max(0, product.stock - variation);
  },
  money(amount) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  },
  /** Returns true/false if `shop.hours` (e.g. "8am-8pm") can be parsed against the current time, or null if it can't be determined — callers should omit the Open/Closed badge on null rather than guess. */
  isShopOpen(shop) {
    const hoursStr = shop?.hours;
    if (!hoursStr) return null;
    if (/24\s*hours?/i.test(hoursStr)) return true;

    const parts = hoursStr.split(/-|–|\bto\b/i).map(s => s.trim()).filter(Boolean);
    if (parts.length !== 2) return null;

    const parseClock = (str, inferredMeridiem) => {
      const m = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
      if (!m) return null;
      let h = parseInt(m[1], 10);
      const min = m[2] ? parseInt(m[2], 10) : 0;
      const mer = m[3] ? m[3].toLowerCase() : inferredMeridiem;
      if (!mer || h < 1 || h > 12 || min > 59) return null;
      if (h === 12) h = 0;
      return (mer === "pm" ? h + 12 : h) * 60 + min;
    };

    const [openStr, closeStr] = parts;
    const closeHasMeridiem = /am|pm/i.test(closeStr);
    const openHasMeridiem = /am|pm/i.test(openStr);
    const closeMin = parseClock(closeStr, openHasMeridiem ? null : "pm");
    const openMin = parseClock(openStr, closeHasMeridiem ? null : "am");
    if (openMin == null || closeMin == null) return null;

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return closeMin > openMin
      ? (nowMin >= openMin && nowMin < closeMin)
      : (nowMin >= openMin || nowMin < closeMin); // overnight range, e.g. 10pm–6am
  },
};

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Legacy shop/product images are stored as backend-relative paths like
// "/uploads/shops/x.png" (newer uploads are base64 data URIs). A relative path
// would resolve against this app's origin (port 3001) and 404 — point it at
// the backend instead.
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, "");
export function resolveAssetUrl(src) {
  if (!src) return null;
  if (src.startsWith("/uploads")) return `${BACKEND_ORIGIN}${src}`;
  return src;
}

export function customerAuthHeaders() {
  const token = localStorage.getItem("customerToken");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function customerFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...customerAuthHeaders(), ...(options.headers || {}) },
  });

  if (res.status === 401) {
    const refreshToken = localStorage.getItem("customerRefreshToken");
    if (refreshToken) {
      try {
        const rr = await fetch(`${API_BASE}/customers/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (rr.ok) {
          const rd = await rr.json();
          localStorage.setItem("customerToken", rd.token);
          return fetch(url, {
            ...options,
            headers: { ...customerAuthHeaders(), ...(options.headers || {}) },
          });
        }
      } catch (_) { /* fall through */ }
    }
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerRefreshToken");
    localStorage.removeItem("customerAuth");
    window.dispatchEvent(new CustomEvent("customerLogout"));
    return null;
  }
  return res;
}

// Fetches real per-shop stock levels and caches them in G.SHOP_INVENTORY so
// G.shopStock()/G.stockState() reflect actual inventory instead of a fabricated
// per-shop variation. Dispatches "dataLoaded" so already-mounted components
// (which all listen for it) re-render with the fresh numbers.
export async function fetchShopInventory(shopId) {
  if (!shopId) return;
  try {
    const res = await fetch(`${API_BASE}/shops/${shopId}/public-inventory`);
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) {
      G.SHOP_INVENTORY[shopId] = data;
      window.dispatchEvent(new CustomEvent("dataLoaded"));
    }
  } catch (error) {
    console.error("Error loading shop inventory:", error);
  }
}

export async function initializeAppData() {
  try {
    const shopsRes = await fetch(`${API_BASE}/shops`);
    if (shopsRes.ok) {
      const shopsData = await shopsRes.json();
      const tintFallbacks = [152, 25, 245, 45, 78, 215];
      G.SHOPS = shopsData.map((shop, idx) => ({
        ...shop,
        image: resolveAssetUrl(shop.image),
        tint: (() => {
          const t = shop.tint;
          if (!t) return tintFallbacks[idx % tintFallbacks.length];
          if (typeof t === "number") return t;
          const n = parseInt(t);
          return isNaN(n) ? tintFallbacks[idx % tintFallbacks.length] : n;
        })(),
      }));
    }

    const catsRes = await fetch(`${API_BASE}/categories`);
    if (catsRes.ok) {
      const catsData = await catsRes.json();
      const fallbackHues = [152, 25, 215, 45, 78, 245, 300, 190];
      G.CATEGORIES = catsData.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        hue: cat.hue ? parseInt(cat.hue) : fallbackHues[idx % fallbackHues.length],
        blurb: cat.blurb || "",
      }));
    }

    const productsRes = await fetch(`${API_BASE}/products?grouped=true`);
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      G.PRODUCTS = productsData.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand || null,
        cat: p.categoryId || p.category_id || "",
        unit: p.unit || "per unit",
        price: parseFloat(p.price) || 0,
        salePrice: parseFloat(p.salePrice || p.sale_price) || null,
        stock: parseInt(p.stock) || 50,
        tag: p.tag || null,
        tags: Array.isArray(p.tags) ? p.tags : [],
        image: resolveAssetUrl(p.featuredImage || p.featured_image || p.image || null),
        galleryImages: Array.isArray(p.galleryImages || p.gallery_images) ? (p.galleryImages || p.gallery_images) : [],
        description: p.description || p.shortDescription || p.short_description || null,
        size: p.size || null,
        weight: p.weight || null,
        par: p.par || 10,
        productType: p.productType || p.product_type || "simple",
        variants: p.variants || [],
        parentId: p.parentId || p.parent_id || null,
        displayName: p.displayName || null,
        attributes: Array.isArray(p.attributes) ? p.attributes : [],
        isRestricted18Plus: p.isRestricted18Plus || p.is_restricted_18_plus || false,
        barcode: p.barcode || null,
        ingredients: p.ingredients || null,
        nutritionFacts: p.nutritionFacts || p.nutrition_facts || null,
        allergens: Array.isArray(p.allergens) ? p.allergens : [],
        countryOfOrigin: p.countryOfOrigin || p.country_of_origin || null,
        storageInstructions: p.storageInstructions || p.storage_instructions || null,
        subheading: p.subheading || null,
      }));

      // Build flat PRODUCTS_MAP covering all IDs including variants
      const flat = {};
      G.PRODUCTS.forEach(p => {
        flat[p.id] = p;
        (p.variants || []).forEach(v => {
          flat[v.id] = {
            ...v,
            cat: v.categoryId || v.category_id || p.cat,
            displayName: `${p.name} · ${v.name}`,
            par: v.par || p.par || 10,
            parentId: p.id,
            productType: "variant",
          };
        });
      });
      G.PRODUCTS_MAP = flat;
    }

    window.dispatchEvent(new CustomEvent("dataLoaded"));
  } catch (error) {
    console.error("Error loading data:", error);
    G.SHOPS = [];
    G.CATEGORIES = [];
    G.PRODUCTS = [];
    G.ORDERS = [];
    window.dispatchEvent(new CustomEvent("dataLoaded"));
  }
}

initializeAppData();
