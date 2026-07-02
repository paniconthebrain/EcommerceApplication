import { useState, useEffect, useRef } from 'react';
import { G, API_BASE, customerFetch, fetchShopInventory } from './globals.js';
import { CustomerLogin, CustomerSignup, ForgotPassword, ResetPasswordPage } from './components/auth.jsx';
import { CustomerBrowse } from './components/browse.jsx';
import { CustomerHomepage } from './components/home.jsx';
import { CustomerCart } from './components/cart.jsx';
import { CustomerCheckout, CustomerConfirmation } from './components/checkout.jsx';
import { CustomerShell } from './components/layout.jsx';
import { AboutUs } from './components/about.jsx';
import { PrivacyPolicy } from './components/privacy.jsx';
import { TermsOfService } from './components/terms.jsx';
import { CookieSettings } from './components/cookies.jsx';
import { CareersPage } from './components/careers.jsx';
import { ProductDetailPage } from './components/productDetail.jsx';
import { MyOrdersPage } from './components/orders.jsx';
import { AccountSettingsPage } from './components/accountSettings.jsx';

function pageToPath(page, shopId, productId) {
  if (page === "product" && shopId && productId) return `/shop/${shopId}/product/${productId}`;
  if (page === "browse" && shopId) return `/shop/${shopId}`;
  if (page === "cart")             return "/cart";
  if (page === "checkout")         return "/checkout";
  if (page === "confirmation")     return "/confirmation";
  if (page === "about")            return "/about";
  if (page === "privacy")          return "/privacy";
  if (page === "terms")            return "/terms";
  if (page === "cookies")          return "/cookies";
  if (page === "careers")          return "/careers";
  if (page === "orders")           return "/account/orders";
  if (page === "settings")         return "/account/settings";
  return "/";
}

function pathToState(pathname) {
  // /shop/:shopId/product/:productId
  const productMatch = pathname.match(/^\/shop\/([^/]+)\/product\/([^/]+)$/);
  if (productMatch) return { page: "product", shopId: productMatch[1], productId: productMatch[2] };
  if (pathname.startsWith("/shop/"))  return { page: "browse",        shopId: pathname.slice(6) };
  if (pathname === "/cart")           return { page: "cart",           shopId: null };
  if (pathname === "/checkout")       return { page: "checkout",       shopId: null };
  if (pathname === "/confirmation")   return { page: "confirmation",   shopId: null };
  if (pathname === "/reset-password") return { page: "reset-password", shopId: null };
  if (pathname === "/about")          return { page: "about",          shopId: null };
  if (pathname === "/privacy")        return { page: "privacy",        shopId: null };
  if (pathname === "/terms")          return { page: "terms",          shopId: null };
  if (pathname === "/cookies")        return { page: "cookies",        shopId: null };
  if (pathname === "/careers")        return { page: "careers",        shopId: null };
  if (pathname === "/account/orders")   return { page: "orders",   shopId: null };
  if (pathname === "/account/settings") return { page: "settings", shopId: null };
  return { page: "home", shopId: null };
}

export default function CustomerApp() {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("customerAuth"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [authPage, setAuthPage] = useState("login");
  const [showAuth, setShowAuth] = useState(false);
  const [pendingCartId, setPendingCartId] = useState(null);
  const [savedItems, setSavedItems] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("savedItems") || "[]")); } catch { return new Set(); }
  });

  const initState = pathToState(window.location.pathname);
  const [page, setPageState] = useState(initState.page);
  const [shopId, setShopId] = useState(() => initState.shopId || localStorage.getItem("shopId") || null);
  const [productId, setProductId] = useState(initState.productId || null);
  const [cartItems, setCartItems] = useState({});
  const [orderData, setOrderData] = useState(null);
  const [initialCat, setInitialCat] = useState(null);
  const [initialSaleOnly, setInitialSaleOnly] = useState(false);
  const cartSyncTimer = useRef(null);

  const syncCartToServer = (items) => {
    clearTimeout(cartSyncTimer.current);
    cartSyncTimer.current = setTimeout(async () => {
      try {
        await customerFetch(`${API_BASE}/customers/auth/cart`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: items }),
        });
      } catch { /* silent */ }
    }, 600);
  };

  const navigate = (newPage, newShopId, newProductId) => {
    const sid = newShopId !== undefined ? newShopId : shopId;
    const pid = newProductId !== undefined ? newProductId : null;
    const path = pageToPath(newPage, sid, pid);
    window.history.pushState({ page: newPage, shopId: sid, productId: pid }, "", path);
    window.scrollTo(0, 0);
    setPageState(newPage);
    if (newShopId !== undefined) setShopId(newShopId);
    if (newProductId !== undefined) setProductId(newProductId);
  };

  useEffect(() => {
    if (shopId) {
      localStorage.setItem("shopId", shopId);
      fetchShopInventory(shopId);
    }
  }, [shopId]);

  // customerFetch dispatches this when a session dies mid-use (expired token,
  // refresh failed) — without this listener the header kept showing the user
  // as logged in while every authenticated call silently failed in the background.
  useEffect(() => {
    const onCustomerLogout = () => {
      setUser(null);
      setCartItems({});
    };
    window.addEventListener("customerLogout", onCustomerLogout);
    return () => window.removeEventListener("customerLogout", onCustomerLogout);
  }, []);

  useEffect(() => {
    if (!user) return;
    customerFetch(`${API_BASE}/customers/auth/cart`)
      .then(res => res && res.json())
      .then(data => { if (data?.cart) setCartItems(data.cart); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onPop = (e) => {
      const s = e.state || pathToState(window.location.pathname);
      window.scrollTo(0, 0);
      setPageState(s.page || "home");
      if (s.shopId !== undefined) setShopId(s.shopId);
      if (s.productId !== undefined) setProductId(s.productId);
    };
    window.addEventListener("popstate", onPop);
    window.history.replaceState(
      { page: initState.page, shopId: initState.shopId },
      "",
      window.location.pathname
    );
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleSelectShop = (id) => {
    setShopId(id);
    navigate("browse", id);
  };

  const handleAddToCart = (id) => {
    if (!user) {
      setPendingCartId(id);
      setAuthPage("login");
      setShowAuth(true);
      return;
    }
    setCartItems(c => {
      const updated = { ...c, [id]: (c[id] || 0) + 1 };
      syncCartToServer(updated);
      return updated;
    });
  };

  const handleUpdateCart = (id, qty) => {
    setCartItems(c => {
      let updated;
      if (qty <= 0) { updated = { ...c }; delete updated[id]; }
      else { updated = { ...c, [id]: qty }; }
      syncCartToServer(updated);
      return updated;
    });
  };

  const handleCheckout = () => {
    if (!user) { setAuthPage("login"); setShowAuth(true); return; }
    navigate("checkout");
  };

  const handleConfirm = (data) => {
    setOrderData(data);
    setCartItems({});
    syncCartToServer({});
    navigate("confirmation");
  };

  const handleToggleSave = (productId) => {
    setSavedItems(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      localStorage.setItem("savedItems", JSON.stringify([...next]));
      return next;
    });
  };

  const handleNewOrder = () => {
    setShopId(null);
    navigate("home", null);
  };

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setShowAuth(false);
    try {
      const res = await customerFetch(`${API_BASE}/customers/auth/cart`);
      const data = res ? await res.json() : null;
      const serverCart = data?.cart || {};
      if (pendingCartId) {
        const merged = { ...serverCart, [pendingCartId]: (serverCart[pendingCartId] || 0) + 1 };
        setCartItems(merged);
        syncCartToServer(merged);
        setPendingCartId(null);
      } else {
        setCartItems(serverCart);
      }
    } catch {
      if (pendingCartId) {
        setCartItems({ [pendingCartId]: 1 });
        setPendingCartId(null);
      }
    }
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerRefreshToken");
    localStorage.removeItem("customerAuth");
    setUser(null);
    setCartItems({});
    // Do NOT wipe server cart on logout — preserve it for next login
    setShopId(null);
    navigate("home", null);
  };

  const setPage = (p) => navigate(p);

  if (page === "reset-password") {
    return <ResetPasswordPage onDone={() => { navigate("home"); setAuthPage("login"); }} />;
  }

  const cartCount = Object.values(cartItems).reduce((s, q) => s + q, 0);

  // Guard: browse requires a shopId — redirect home if missing
  if (page === "browse" && !shopId) navigate("home", null);
  if (page === "confirmation" && !orderData) navigate("home", null);
  if ((page === "orders" || page === "settings") && !user) navigate("home", null);

  const handleSelectProduct = (pid) => navigate("product", shopId, pid);
  const handleBackToBrowse = () => navigate("browse", shopId);

  // Deals nav: pre-set the on-sale filter, then either jump straight to browse
  // (shop already selected) or leave it queued for after the shop picker.
  const handleGoToDeals = () => {
    setInitialSaleOnly(true);
    if (shopId) setPage("browse");
  };

  const screens = {
    home: <CustomerHomepage onSelectShop={handleSelectShop} shopId={shopId} onGoToBrowse={(catId) => { setInitialCat(catId || null); setPage("browse"); }} />,
    browse: shopId ? <CustomerBrowse shopId={shopId} cartItems={cartItems} onAddToCart={handleAddToCart} onUpdateCart={handleUpdateCart} onChangeShop={() => navigate("home", null)} initialCat={initialCat} initialSaleOnly={initialSaleOnly} savedItems={savedItems} onToggleSave={handleToggleSave} onSelectProduct={handleSelectProduct} /> : null,
    product: (shopId && productId) ? <ProductDetailPage shopId={shopId} productId={productId} cartItems={cartItems} onAddToCart={handleAddToCart} onUpdateCart={handleUpdateCart} onBack={handleBackToBrowse} onSelectProduct={handleSelectProduct} savedItems={savedItems} onToggleSave={handleToggleSave} onRequireAuth={() => { setAuthPage("login"); setShowAuth(true); }} user={user} /> : null,
    cart: <CustomerCart shopId={shopId} cartItems={cartItems} onUpdateCart={handleUpdateCart} onCheckout={handleCheckout} onContinueShopping={() => navigate("browse")} />,
    checkout: <CustomerCheckout shopId={shopId} cartItems={cartItems} onConfirm={handleConfirm} onBack={() => setPage("cart")} />,
    confirmation: orderData ? <CustomerConfirmation orderData={orderData} onNewOrder={handleNewOrder} /> : null,
    about: <AboutUs />,
    privacy: <PrivacyPolicy />,
    terms: <TermsOfService />,
    cookies: <CookieSettings />,
    careers: <CareersPage onBack={() => navigate("home")} />,
    orders: user ? <MyOrdersPage user={user} onBack={() => navigate("home")} /> : null,
    settings: user ? <AccountSettingsPage user={user} onUserUpdate={(u) => { setUser(u); localStorage.setItem("customerAuth", JSON.stringify(u)); }} onBack={() => navigate("home")} /> : null,
  };

  const closeOverlay = () => { setShowAuth(false); setPendingCartId(null); };

  const authOverlay = showAuth && !user ? (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'grid', placeItems: 'center', padding: '20px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.45)' }}
      onClick={closeOverlay}
    >
      <div style={{ width: '100%', maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        {authPage === "login" && <CustomerLogin onLoginSuccess={handleLoginSuccess} onSignupClick={() => setAuthPage("signup")} onForgotClick={() => setAuthPage("forgot")} onClose={closeOverlay} overlay />}
        {authPage === "signup" && <CustomerSignup onSignupSuccess={handleSignupSuccess} onLoginClick={() => setAuthPage("login")} onClose={closeOverlay} overlay />}
        {authPage === "forgot" && <ForgotPassword onBack={() => setAuthPage("login")} onClose={closeOverlay} overlay />}
      </div>
    </div>
  ) : null;

  return (
    <>
      <CustomerShell
        page={page}
        setPage={setPage}
        cartCount={cartCount}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => { setAuthPage("login"); setShowAuth(true); }}
        onNavigate={screens[page]}
        shopId={shopId}
        onSelectShop={handleSelectShop}
        onGoToDeals={handleGoToDeals}
        savedItems={savedItems}
        onToggleSave={handleToggleSave}
        onAddToCart={handleAddToCart}
        onUpdateCart={handleUpdateCart}
        cartItems={cartItems}
      />
      {authOverlay}
    </>
  );
}
