/* GoGO Pantry — Customer app root */
function CustomerApp() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("customerAuth");
    return stored ? JSON.parse(stored) : null;
  });
  const [authPage, setAuthPage] = useState("login"); // login, signup, forgot
  const [page, setPage] = useState("home");
  const [shopId, setShopId] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [orderData, setOrderData] = useState(null);

  const handleSelectShop = (id) => {
    setShopId(id);
    setPage("browse");
    document.getElementById("shopName").textContent = "📍 " + G.SHOPS.find(s => s.id === id)?.name;
  };

  const handleAddToCart = (id) => {
    setCartItems(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };

  const handleUpdateCart = (id, qty) => {
    setCartItems(c => {
      if (qty <= 0) { const n = { ...c }; delete n[id]; return n; }
      return { ...c, [id]: qty };
    });
  };

  const handleCheckout = () => setPage("checkout");

  const handleConfirm = (data) => {
    setOrderData(data);
    setCartItems({});
    setPage("confirmation");
  };

  const handleNewOrder = () => {
    setPage("home");
    setShopId(null);
  };

  const handleContinueShopping = () => {
    setPage("browse");
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("customerAuth");
    setUser(null);
    setPage("home");
    setShopId(null);
    setCartItems({});
  };

  // Show auth pages if not logged in
  if (!user) {
    if (authPage === "login") {
      return (
        <CustomerLogin
          onLoginSuccess={handleLoginSuccess}
          onSignupClick={() => setAuthPage("signup")}
          onForgotClick={() => setAuthPage("forgot")}
        />
      );
    } else if (authPage === "signup") {
      return (
        <CustomerSignup
          onSignupSuccess={handleSignupSuccess}
          onLoginClick={() => setAuthPage("login")}
        />
      );
    } else if (authPage === "forgot") {
      return (
        <ForgotPassword onBack={() => setAuthPage("login")} />
      );
    }
  }

  const cartCount = Object.values(cartItems).reduce((s, q) => s + q, 0);

  const screens = {
    home: <CustomerHomepage onSelectShop={handleSelectShop} />,
    browse: shopId && <CustomerBrowse shopId={shopId} cartItems={cartItems} onAddToCart={handleAddToCart} onChangeShop={handleSelectShop} />,
    cart: <CustomerCart shopId={shopId} cartItems={cartItems} onUpdateCart={handleUpdateCart} onCheckout={handleCheckout} onContinueShopping={handleContinueShopping} />,
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
      onNavigate={screens[page]}
      shopId={shopId}
      onSelectShop={handleSelectShop}
    >
      {screens[page]}
    </CustomerShell>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CustomerApp />);
