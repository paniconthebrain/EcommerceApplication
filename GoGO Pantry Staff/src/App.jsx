import { useState, useEffect, useCallback } from 'react';
import { G, API_BASE, initializeAppData, resolveValidShopId } from './globals.js';
import StaffLogin from './components/StaffLogin.jsx';
import Shell, { AdminOnly } from './components/Shell.jsx';
import DashboardScreen from './components/screens/DashboardScreen.jsx';
import FulfillScreen from './components/screens/FulfillScreen.jsx';
import ReceiveScreen from './components/screens/ReceiveScreen.jsx';
import TransferScreen from './components/screens/TransferScreen.jsx';
import ManageShopsScreen from './components/admin/ManageShopsScreen.jsx';
import ManageStaffScreen from './components/admin/ManageStaffScreen.jsx';
import ManageCategoriesScreen from './components/admin/ManageCategoriesScreen.jsx';
import EmailSettingsScreen from './components/admin/EmailSettingsScreen.jsx';
import InventoryScreen from './components/screens/InventoryScreen.jsx';
import PurchaseOrdersScreen from './components/screens/PurchaseOrdersScreen.jsx';
import ManageSuppliersScreen from './components/admin/ManageSuppliersScreen.jsx';
import ManageApplicationsScreen from './components/admin/ManageApplicationsScreen.jsx';
import ManageProductsScreen from './components/admin/ManageProductsScreen.jsx';

const STAFF_ROUTES = ["dashboard", "fulfill", "receive", "transfer", "inventory", "purchase-orders", "manage-shops", "manage-staff", "manage-categories", "manage-suppliers", "manage-products", "email-settings", "job-applications"];

function staffPathToRoute(pathname) {
  const seg = pathname.replace(/^\//, "") || "dashboard";
  return STAFF_ROUTES.includes(seg) ? seg : "dashboard";
}

export default function StaffApp() {
  const savedUser = G.currentUser;
  const [user, setUser] = useState(savedUser);
  const [shopId, setShopId] = useState(savedUser?.shopId || null);
  const [shopLoading, setShopLoading] = useState(!!(savedUser && !savedUser.shopId));
  const [shopError, setShopError] = useState(false);
  const [route, setRoute] = useState(() => (savedUser && shopId) ? staffPathToRoute(window.location.pathname) : "dashboard");

  const navigate = (newRoute) => {
    window.history.pushState({ route: newRoute }, "", "/" + newRoute);
    setRoute(newRoute);
  };

  useEffect(() => {
    const onPop = (e) => {
      const r = e.state?.route || staffPathToRoute(window.location.pathname);
      setRoute(r);
    };
    window.addEventListener("popstate", onPop);
    if (shopId) {
      window.history.replaceState({ route }, "", "/" + route);
    }
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // For admin users restored from session, load shops and set shopId. Re-validates
  // against the live backend rather than trusting a cached/stale shopId, since the
  // previously-selected shop may have been deleted or renamed since last visit.
  const resolveAdminShop = useCallback(async (preferredShopId) => {
    setShopLoading(true);
    const resolved = await resolveValidShopId(preferredShopId);
    if (G.dataLoadError) {
      setShopError(true);
      setShopLoading(false);
      return;
    }
    setShopError(false);
    setShopId(resolved);
    setShopLoading(false);
  }, []);

  useEffect(() => {
    if (!savedUser || savedUser.shopId) return;
    resolveAdminShop(shopId);
  }, []);

  // If any screen reports its shopId no longer resolves server-side (e.g. the
  // shop was deleted/renamed in another tab), re-resolve instead of looping
  // on the same dead request forever.
  useEffect(() => {
    if (user?.userType !== 'admin') return;
    const onInvalid = () => resolveAdminShop(null);
    window.addEventListener('staffShopInvalid', onInvalid);
    return () => window.removeEventListener('staffShopInvalid', onInvalid);
  }, [user, resolveAdminShop]);

  const handleLogin = async (loggedInUser) => {
    setUser(loggedInUser);
    if (!loggedInUser.shopId) {
      await resolveAdminShop(null);
    } else {
      setShopId(loggedInUser.shopId);
      setShopLoading(false);
    }
    navigate("dashboard");
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem("staff_token");
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      } catch { /* ignore */ }
    }
    sessionStorage.removeItem("staff_token");
    sessionStorage.removeItem("staff_refresh_token");
    sessionStorage.removeItem("staff_user");
    G.token = null;
    G.currentUser = null;
    window.history.pushState({}, "", "/");
    setUser(null);
    setShopId(null);
  };

  if (!user) return <StaffLogin onLogin={handleLogin} />;

  if (!shopLoading && shopError) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "var(--bg)", fontFamily: "var(--font-sans)", padding: 24, textAlign: "center" }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Couldn't load shop data</span>
      <span style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 320 }}>We couldn't reach the server to load your shops. Check your connection and try again.</span>
      <button onClick={() => resolveAdminShop(shopId)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Retry</button>
      <button onClick={handleLogout} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid var(--line)", background: "transparent", color: "var(--text-2)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Log out</button>
    </div>
  );

  if (!shopLoading && !shopError && !shopId) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "var(--bg)", fontFamily: "var(--font-sans)", padding: 24, textAlign: "center" }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>No shops configured yet</span>
      <span style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 320 }}>An admin needs to create a shop before this workspace can be used.</span>
      <button onClick={handleLogout} style={{ padding: "8px 20px", borderRadius: 10, border: "1px solid var(--line)", background: "transparent", color: "var(--text-2)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Log out</button>
    </div>
  );

  if (shopLoading || !shopId) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary)", display: "grid", placeItems: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>GoGoPantry</span>
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", animation: `gp-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes gp-pulse { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }`}</style>
      <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 500 }}>Loading your workspace…</span>
    </div>
  );

  const screenMap = {
    dashboard:           () => <DashboardScreen shopId={shopId} setRoute={navigate} />,
    fulfill:             () => <FulfillScreen shopId={shopId} setRoute={navigate} />,
    receive:             () => <ReceiveScreen shopId={shopId} setRoute={navigate} />,
    transfer:            () => <TransferScreen shopId={shopId} setRoute={navigate} />,
    "manage-shops":      () => <AdminOnly user={user}><ManageShopsScreen /></AdminOnly>,
    "manage-staff":      () => <AdminOnly user={user}><ManageStaffScreen /></AdminOnly>,
    "manage-categories": () => <AdminOnly user={user}><ManageCategoriesScreen /></AdminOnly>,
    "manage-suppliers":  () => <AdminOnly user={user}><ManageSuppliersScreen /></AdminOnly>,
    "manage-products":   () => <AdminOnly user={user}><ManageProductsScreen /></AdminOnly>,
    "email-settings":    () => <AdminOnly user={user}><EmailSettingsScreen /></AdminOnly>,
    "job-applications":  () => <AdminOnly user={user}><ManageApplicationsScreen /></AdminOnly>,
    "inventory":         () => <InventoryScreen shopId={shopId} setRoute={navigate} />,
    "purchase-orders":   () => <PurchaseOrdersScreen shopId={shopId} setRoute={navigate} user={user} />,
  };

  const renderScreen = (screenMap[route] || screenMap.dashboard)();

  const isAdmin = user?.role === "admin";

  return (
    <Shell user={user} currentPage={route} navigate={navigate} onLogout={handleLogout}
      shopId={shopId} onShopChange={isAdmin ? setShopId : undefined}>
      {renderScreen}
    </Shell>
  );
}
