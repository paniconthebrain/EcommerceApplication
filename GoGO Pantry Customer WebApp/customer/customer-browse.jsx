/* GoGO Pantry — Customer Product Browse page (Enhanced) */

function CustomerBrowse({ shopId, onAddToCart, cartItems, onChangeShop }) {
  const [cat, setCat] = useState("produce");
  const [sort, setSort] = useState("popularity");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const products = useMemo(() => {
    let p = G.productsByCat(cat).map(x => ({ ...x, stock: G.shopStock(x.id, shopId) }));

    // Apply search filter
    if (search) {
      p = p.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Apply stock filter
    if (showInStockOnly) {
      p = p.filter(x => G.stockState(x.stock, x.par) !== "out");
    }

    // Apply price filter
    p = p.filter(x => x.price >= priceRange[0] && x.price <= priceRange[1]);

    // Apply sort
    if (sort === "price-low") p.sort((a, b) => a.price - b.price);
    if (sort === "price-high") p.sort((a, b) => b.price - a.price);
    if (sort === "name") p.sort((a, b) => a.name.localeCompare(b.name));

    return p;
  }, [cat, sort, search, shopId, priceRange, showInStockOnly]);

  const currentCat = G.catOf(cat);
  const currentShop = G.SHOPS.find(s => s.id === shopId);
  const cartCount = Object.values(cartItems).reduce((s, q) => s + q, 0);

  const resetFilters = () => {
    setPriceRange([0, 50]);
    setShowInStockOnly(false);
    setShowOnSaleOnly(false);
    setSearch("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      {/* ===== TOP NAVIGATION ===== */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--line)",
        padding: "14px 16px",
        position: "sticky",
        top: 0,
        zIndex: 30
      }}>
        <div style={{
          maxWidth: 1600,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap"
        }}>
          {/* Shop indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: "var(--surface-2)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-2)",
            fontWeight: 600
          }}>
            <IconC name="pin" size={16} />
            <span>{currentShop?.name || "Select Store"}</span>
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-3)"
            }}>
              <IconC name="search" size={16} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                fontFamily: "var(--font-sans)",
                transition: "all 0.15s"
              }}
              onFocus={e => e.target.style.borderColor = "var(--primary)"}
              onBlur={e => e.target.style.borderColor = "var(--line)"}
            />
          </div>

          {/* Sort dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                padding: "8px 32px 8px 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 13,
                fontFamily: "var(--font-sans)",
                appearance: "none",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="popularity">Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">A–Z</option>
            </select>
            <span style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "var(--text-3)"
            }}>
              <IconC name="chevD" size={14} />
            </span>
          </div>

          {/* Filter button (mobile) */}
          <button
            onClick={() => setShowFiltersModal(!showFiltersModal)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--bg)",
              color: "var(--text-2)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
            className="mobile-filter-btn"
          >
            ⚙️ Filter
          </button>
        </div>

        {/* Category tabs */}
        <div style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingTop: 12,
          paddingBottom: 0,
          marginBottom: -14,
          paddingLeft: 16,
          paddingRight: 16,
          scrollBehavior: "smooth"
        }}>
          {G.CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setCat(c.id);
                setSearch("");
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid",
                borderColor: cat === c.id ? "transparent" : "var(--line)",
                background: cat === c.id ? "var(--primary)" : "transparent",
                color: cat === c.id ? "var(--primary-ink)" : "var(--text-2)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-sans)",
                transition: "all 0.15s"
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CATEGORY HERO ===== */}
      <div style={{
        background: `linear-gradient(135deg, oklch(0.6 0.08 ${currentCat.hue}) 0%, oklch(0.52 0.1 ${currentCat.hue}) 100%)`,
        color: "#fff",
        padding: "20px 16px",
        textAlign: "center"
      }}>
        <p style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 600,
          opacity: 0.9
        }}>
          {currentCat.blurb}
        </p>
      </div>

      {/* ===== MAIN CONTENT WITH SIDEBAR ===== */}
      <div style={{
        flex: 1,
        display: "flex",
        gap: 20,
        padding: "20px 16px",
        maxWidth: 1600,
        margin: "0 auto",
        width: "100%"
      }}>
        {/* Left sidebar - hidden on mobile with CSS class */}
        <div className="sidebar-desktop" style={{
          minWidth: 280
        }}>
          <FilterSidebar
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            showInStockOnly={showInStockOnly}
            onStockToggle={setShowInStockOnly}
            showOnSaleOnly={showOnSaleOnly}
            onSaleToggle={setShowOnSaleOnly}
            resetFilters={resetFilters}
          />
          {currentShop && (
            <div style={{ marginTop: 20 }}>
              <ShopInfoCard
                shop={currentShop}
                onChangeShop={() => {
                  // Trigger shop change - parent will handle
                }}
              />
            </div>
          )}
        </div>

        {/* Main content area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Results counter */}
          <div style={{
            marginBottom: 18,
            fontSize: 12,
            color: "var(--text-2)",
            fontWeight: 500
          }}>
            Showing {products.length} of {G.productsByCat(cat).length} products
          </div>

          {/* Products grid */}
          {products.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-3)"
            }}>
              <IconC name="search" size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>No products found</p>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>Try adjusting your filters or search</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 14
            }}>
              {products.map(p => {
                const inCart = cartItems[p.id] || 0;
                const stockState = G.stockState(p.stock, p.par);
                const disabled = stockState === "out";

                return (
                  <ProductCardEnhanced
                    key={p.id}
                    product={p}
                    inCart={inCart}
                    disabled={disabled}
                    stockState={stockState}
                    onAdd={() => onAddToCart(p.id)}
                    onAddQty={() => onAddToCart(p.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter modal */}
      {showFiltersModal && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 40,
          display: "flex",
          alignItems: "flex-end"
        }}
          className="mobile-filter-modal"
          onClick={() => setShowFiltersModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              background: "var(--surface)",
              borderRadius: "16px 16px 0 0",
              padding: "20px 16px",
              maxHeight: "80vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--text)",
                margin: 0
              }}>
                Filters
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  color: "var(--text-2)",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </div>

            <FilterSidebar
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              showInStockOnly={showInStockOnly}
              onStockToggle={setShowInStockOnly}
              showOnSaleOnly={showOnSaleOnly}
              onSaleToggle={setShowOnSaleOnly}
              resetFilters={resetFilters}
            />

            <BtnC
              full
              onClick={() => setShowFiltersModal(false)}
              style={{ marginTop: "auto" }}
            >
              Apply Filters
            </BtnC>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CustomerBrowse });
