import { useState, useEffect, useRef } from 'react';
import { G, API_BASE, customerFetch } from './globals.js';
import { CustomerLogin, CustomerSignup, ForgotPassword, ResetPasswordPage } from './components/auth.jsx';
import { CustomerBrowse } from './components/browse.jsx';
import { CustomerHomepage } from './components/home.jsx';
import { CustomerCart } from './components/cart.jsx';
import { CustomerCheckout, CustomerConfirmation } from './components/checkout.jsx';
import { CustomerShell } from './components/layout.jsx';

function pageToPath(page, shopId) {
  if (page === "browse" && shopId) return `/shop/${shopId}`;
  if (page === "cart")             return "/cart";
  if (page === "checkout")         return "/checkout";
  if (page === "confirmation")     return "/confirmation";
  return "/";
}

function pathToState(pathname) {
  if (pathname.startsWith("/shop/"))  return { page: "browse",        shopId: pathname.slice(6) };
  if (pathname === "/cart")           return { page: "cart",           shopId: null };
  if (pathname === "/checkout")       return { page: "checkout",       shopId: null };
  if (pathname === "/confirmation")   return { page: "confirmation",   shopId: null };
  if (pathname === "/reset-password") return { page: "reset-password", shopId: null };
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
  const [cartItems, setCartItems] = useState({});
  const [orderData, setOrderData] = useState(null);
  const [initialCat, setInitialCat] = useState(null);
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

  const navigate = (newPage, newShopId) => {
    const sid = newShopId !== undefined ? newShopId : shopId;
    const path = pageToPath(newPage, sid);
    window.history.pushState({ page: newPage, shopId: sid }, "", path);
    window.scrollTo(0, 0);
    setPageState(newPage);
    if (newShopId !== undefined) setShopId(newShopId);
  };

  useEffect(() => {
    if (shopId) localStorage.setItem("shopId", shopId);
  }, [shopId]);

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
    setShopId(null);
    navigate("home", null);
  };

  const setPage = (p) => navigate(p);

  if (page === "reset-password") {
    return <ResetPasswordPage onDone={() => { navigate("home"); setAuthPage("login"); }} />;
  }

  if (showAuth && !user) {
    if (authPage === "login")
      return <CustomerLogin onLoginSuccess={handleLoginSuccess} onSignupClick={() => setAuthPage("signup")} onForgotClick={() => setAuthPage("forgot")} />;
    if (authPage === "signup")
      return <CustomerSignup onSignupSuccess={handleSignupSuccess} onLoginClick={() => setAuthPage("login")} />;
    if (authPage === "forgot")
      return <ForgotPassword onBack={() => setAuthPage("login")} />;
  }

  const cartCount = Object.values(cartItems).reduce((s, q) => s + q, 0);

  const screens = {
    home: <CustomerHomepage onSelectShop={handleSelectShop} shopId={shopId} onGoToBrowse={(catId) => { setInitialCat(catId || null); setPage("browse"); }} />,
    browse: shopId && <CustomerBrowse shopId={shopId} cartItems={cartItems} onAddToCart={handleAddToCart} onUpdateCart={handleUpdateCart} onChangeShop={() => navigate("home", null)} initialCat={initialCat} savedItems={savedItems} onToggleSave={handleToggleSave} />,
    cart: <CustomerCart shopId={shopId} cartItems={cartItems} onUpdateCart={handleUpdateCart} onCheckout={handleCheckout} onContinueShopping={() => navigate("browse")} />,
    checkout: <CustomerCheckout shopId={shopId} cartItems={cartItems} onConfirm={handleConfirm} onBack={() => setPage("cart")} />,
    confirmation: orderData && <CustomerConfirmation orderData={orderData} onNewOrder={handleNewOrder} />,
  };

  return (
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
      savedItems={savedItems}
      onToggleSave={handleToggleSave}
      onAddToCart={handleAddToCart}
      onUpdateCart={handleUpdateCart}
      cartItems={cartItems}
    />
  );
}
