import { useState, useEffect } from 'react';
import { G, API_BASE, initializeAppData } from './globals.js';
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
  const [shopId, setShopId] = useState(savedUser ? (savedUser.shopId || "msn") : null);
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

  // For admin users restored from session, correct shopId once real shops load
  useEffect(() => {
    if (!savedUser || savedUser.shopId) return;
    initializeAppData().then(() => {
      if (G.SHOPS.length > 0) setShopId(G.SHOPS[0].id);
    });
  }, []);

  const handleLogin = async (loggedInUser) => {
    setUser(loggedInUser);
    if (!loggedInUser.shopId) {
      await initializeAppData();
      setShopId(G.SHOPS[0]?.id || 'msn');
    } else {
      setShopId(loggedInUser.shopId);
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

  if (!shopId || !user) return <StaffLogin onLogin={handleLogin} />;

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
