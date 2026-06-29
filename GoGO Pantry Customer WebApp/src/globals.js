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
};

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

export async function initializeAppData() {
  try {
    const shopsRes = await fetch(`${API_BASE}/shops`);
    if (shopsRes.ok) {
      const shopsData = await shopsRes.json();
      const tintFallbacks = [152, 25, 245, 45, 78, 215];
      G.SHOPS = shopsData.map((shop, idx) => ({
        ...shop,
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
        stock: parseInt(p.stock) || 50,
        tag: p.tag || null,
        image: p.featuredImage || p.image || null,
        description: p.description || p.shortDescription || null,
        size: p.size || null,
        weight: p.weight || null,
        par: p.par || 10,
        productType: p.productType || "simple",
        variants: p.variants || [],
        parentId: p.parentId || null,
        displayName: p.displayName || null,
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
