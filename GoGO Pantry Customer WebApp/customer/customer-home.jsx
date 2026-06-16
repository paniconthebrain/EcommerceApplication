/* GoGO Pantry -- Premium Customer Homepage */

function getCategoryEmoji(name = "") {
  const n = name.toLowerCase();
  if (n.includes("produce") || n.includes("vegetable") || n.includes("fruit")) return "🥦";
  if (n.includes("dairy") || n.includes("milk") || n.includes("egg")) return "🥛";
  if (n.includes("bakery") || n.includes("bread") || n.includes("pastry")) return "🍞";
  if (n.includes("meat") || n.includes("seafood") || n.includes("fish") || n.includes("protein")) return "🥩";
  if (n.includes("pantry") || n.includes("dry") || n.includes("grain") || n.includes("rice")) return "🌾";
  if (n.includes("beverage") || n.includes("drink") || n.includes("juice")) return "🧃";
  if (n.includes("frozen") || n.includes("ice")) return "🧊";
  if (n.includes("snack") || n.includes("chip") || n.includes("candy")) return "🍿";
  if (n.includes("organic") || n.includes("natural")) return "🌿";
  if (n.includes("household") || n.includes("cleaning")) return "🧹";
  if (n.includes("health") || n.includes("wellness")) return "💊";
  if (n.includes("deli") || n.includes("prepared") || n.includes("meal")) return "🥗";
  return "🛒";
}

const SHOP_FOOD_EMOJIS = ["🥦", "🍎", "🥕", "🍋", "🧅", "🥬"];

function CustomerHomepage({ onSelectShop, onAddToCart }) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const copyPromo = () => {
    navigator.clipboard.writeText("WELCOME20").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const filteredShops = search
    ? G.SHOPS.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase())
      )
    : G.SHOPS;

  const trendingProducts = (G.PRODUCTS || []).slice(0, 6);

  return (
    <div style={{ padding: "0", background: "var(--bg)" }}>

      {/* ===== HERO SECTION ===== */}
      <div style={{
        background: "linear-gradient(135deg, oklch(0.55 0.08 152) 0%, oklch(0.48 0.1 152) 100%)",
        color: "#fff",
        padding: "64px 20px 72px",
        textAlign: "center",
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background pattern */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1,
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 640 }}>
          <h1 style={{
            fontSize: "clamp(28px, 8vw, 48px)", fontWeight: 800, margin: "0 0 16px",
            letterSpacing: "-0.02em", lineHeight: 1.2
          }}>
            Fresh Groceries, Delivered Fast
          </h1>
          <p style={{
            fontSize: "clamp(14px, 2vw, 18px)", margin: "0 0 12px", opacity: 0.95,
            lineHeight: 1.6, marginLeft: "auto", marginRight: "auto"
          }}>
            Tell us where you are and we'll find the freshest groceries near you.
          </p>

          {/* Address / ZIP input — prominent hero CTA */}
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 12px" }}>
            Enter your delivery address or ZIP code
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ flex: "1 1 300px", minWidth: 220, position: "relative" }}>
              <span style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: "#9ca3af", pointerEvents: "none"
              }}>
                <IconC name="pin" size={18} />
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Enter your ZIP code or delivery address..."
                style={{
                  width: "100%", padding: "14px 14px 14px 44px", borderRadius: 12, border: "none",
                  outline: "none", background: "rgba(255,255,255,0.97)", color: "#1f2937",
                  fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 500,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
                }}
              />
            </div>
            <BtnC
              variant="ghost"
              icon="pin"
              style={{
                background: "rgba(255,255,255,0.2)", color: "#fff",
                borderColor: "rgba(255,255,255,0.4)", fontWeight: 700, padding: "14px 20px"
              }}
            >
              Use My Location
            </BtnC>
          </div>
        </div>
      </div>

      {/* ===== FEATURED SHOPS SECTION ===== */}
      <div style={{ padding: "64px 20px 40px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", color: "var(--text)", letterSpacing: "-0.01em" }}>
            {search ? "Search Results" : "Featured Stores"}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
            {filteredShops.length} store{filteredShops.length !== 1 ? "s" : ""} available near you
          </p>
        </div>

        {filteredShops.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
            <IconC name="search" size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>No stores found</p>
            <p style={{ fontSize: 13, margin: "6px 0 0" }}>Try adjusting your search</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {filteredShops.map(shop => (
              <ShopCard key={shop.id} shop={shop} onSelect={() => onSelectShop(shop.id)} />
            ))}
          </div>
        )}
      </div>

      {/* ===== SHOP BY CATEGORY ===== */}
      <div style={{ padding: "40px 20px", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>
            Shop by Category
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 20px" }}>
            Browse fresh products by department
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 14 }}>
            {G.CATEGORIES.map(c => {
              const emoji = getCategoryEmoji(c.name);
              return (
                <div
                  key={c.id}
                  onClick={() => {}}
                  style={{
                    textAlign: "center", padding: "20px 12px", borderRadius: 14,
                    background: "var(--surface)", cursor: "pointer",
                    transition: "all 0.2s var(--ease)", border: "1px solid var(--line)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    e.currentTarget.style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "var(--line)";
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `oklch(0.93 0.06 ${c.hue})`,
                    display: "grid", placeItems: "center", fontSize: 28,
                    boxShadow: `0 2px 8px oklch(0.6 0.08 ${c.hue} / 0.2)`
                  }}>
                    {emoji}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                    {c.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== TRENDING NEAR YOU ===== */}
      {trendingProducts.length > 0 && (
        <div style={{ padding: "48px 20px 40px", maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>
                Trending Near You
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>Popular picks this week — add directly to your cart</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            {trendingProducts.map(product => {
              const cat = G.catOf(product.cat);
              return (
                <div
                  key={product.id}
                  style={{
                    background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)",
                    overflow: "hidden", display: "flex", flexDirection: "column",
                    transition: "all 0.2s var(--ease)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{
                    height: 120, background: `oklch(0.92 0.07 ${cat.hue})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", position: "relative"
                  }}>
                    {product.image
                      ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "2.5rem" }}>{getCategoryEmoji(cat.name)}</span>
                    }
                  </div>
                  <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.3, minHeight: "2.4em" }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{product.unit}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>
                        ${(parseFloat(product.price) || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart(product.id);
                          } else if (G.SHOPS.length > 0) {
                            onSelectShop(G.SHOPS[0].id);
                          }
                        }}
                        style={{
                          padding: "5px 12px", borderRadius: 8, border: "none",
                          background: "var(--primary)", color: "#fff",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          fontFamily: "var(--font-sans)", transition: "filter 0.15s",
                          minHeight: 44, minWidth: 44
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.9)"}
                        onMouseLeave={e => e.currentTarget.style.filter = "none"}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== FEATURED COLLECTIONS ===== */}
      <div style={{ padding: "40px 20px", maxWidth: 1400, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px", color: "var(--text)" }}>
          This Week's Highlights
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <CollectionBanner icon="spark" title="Weekly Deals" subtitle="Trending this week" accentColor={152} />
          <CollectionBanner icon="leaf" title="Organic & Natural" subtitle="Hand-picked organic items" accentColor={152} />
          <CollectionBanner icon="pin" title="Local Favorites" subtitle="From your community" accentColor={65} />
          <CollectionBanner icon="plus" title="Recently Added" subtitle="Fresh arrivals" accentColor={245} />
        </div>
      </div>

      {/* ===== PROMOTIONAL BANNER with Click-to-Copy ===== */}
      <div style={{
        padding: "40px 20px",
        background: "linear-gradient(135deg, oklch(0.6 0.12 245) 0%, oklch(0.55 0.1 245) 100%)",
        color: "#fff"
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16
        }}>
          <div>
            <h3 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              New Customer? Save 20%
            </h3>
            <p style={{ fontSize: 14, margin: "0 0 12px", opacity: 0.9 }}>
              Use the code below on your first order
            </p>
            {/* Click-to-copy promo code badge */}
            <button
              onClick={copyPromo}
              title="Click to copy code"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.15)", border: "2px dashed rgba(255,255,255,0.5)",
                padding: "10px 20px", borderRadius: 12, transition: "all 0.2s",
                fontFamily: "var(--font-sans)"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
            >
              <code style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 20, letterSpacing: "0.12em", color: "#fff" }}>
                WELCOME20
              </code>
              {copied
                ? <span style={{ fontSize: 11, fontWeight: 800, background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: 999 }}>
                    ✓ Copied!
                  </span>
                : <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)", color: "#fff", padding: "3px 10px", borderRadius: 999 }}>
                    Click to copy
                  </span>
              }
            </button>
          </div>
          <BtnC style={{ background: "#fff", color: "oklch(0.6 0.12 245)" }}>
            Explore Stores
          </BtnC>
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div style={{ padding: "40px 20px", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 32px", color: "var(--text)", textAlign: "center" }}>
            How It Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { icon: "pin", title: "Select Store", desc: "Choose your nearest GoGO Pantry location" },
              { icon: "cart", title: "Browse & Shop", desc: "Add fresh items to your cart" },
              { icon: "truck", title: "Fast Delivery", desc: "Same-day delivery to your door" }
            ].map((step, i) => (
              <div key={i} style={{
                textAlign: "center", padding: 24, background: "var(--surface)",
                borderRadius: 14, border: "1px solid var(--line)"
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12, background: "var(--primary)", color: "var(--primary-ink)",
                  display: "grid", placeItems: "center", margin: "0 auto 16px", fontSize: 24
                }}>
                  <IconC name={step.icon} size={28} />
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>{step.title}</h4>
                <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TRUST INDICATORS ===== */}
      <div style={{ padding: "32px 20px", maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32, fontSize: 13, color: "var(--text-2)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconC name="checkCircle" size={20} />
            100% Fresh Guarantee
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconC name="truck" size={20} />
            Same-Day Delivery
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconC name="check" size={20} />
            Secure Checkout
          </span>
        </div>
      </div>
    </div>
  );
}

/* ===== SHOP CARD ===== */
function ShopCard({ shop, onSelect }) {
  const FOOD_EMOJIS = ["🥦", "🍎", "🥕", "🍋", "🧅", "🥬"];
  const emoji = FOOD_EMOJIS[(shop.id?.charCodeAt(0) || 0) % FOOD_EMOJIS.length];

  return (
    <div
      onClick={onSelect}
      style={{
        borderRadius: 16, border: "1px solid var(--line)", background: "var(--surface)",
        cursor: "pointer", transition: "all 0.2s var(--ease)",
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative"
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Hero image area — consistent across all cards */}
      <div style={{
        height: 160,
        background: "linear-gradient(135deg, oklch(0.42 0.17 152) 0%, oklch(0.55 0.15 152) 100%)",
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {shop.image || shop.featuredImage
          ? <img
              src={shop.image || shop.featuredImage}
              alt={shop.name}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          : (
            <>
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)"
              }} />
              <span style={{ fontSize: 64, lineHeight: 1, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
                {emoji}
              </span>
            </>
          )
        }
        {/* Open badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
          color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "4px 10px", borderRadius: 999,
          display: "flex", alignItems: "center", gap: 5
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          Open
        </div>
        {/* Store code badge */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
          color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "4px 10px", borderRadius: 999
        }}>
          {shop.code}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em", marginBottom: 3 }}>
            {shop.name}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-2)" }}>{shop.city}</div>
        </div>

        {/* Pickup time + hours badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {shop.hours && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--surface-2)", color: "var(--text-2)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
              <IconC name="clock" size={12} />
              {shop.hours}
            </span>
          )}
          {shop.pickupTime && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--blue-100)", color: "var(--blue-500)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
              <IconC name="truck" size={12} />
              Pickup {shop.pickupTime}
            </span>
          )}
        </div>

        {/* CTA — always brand emerald, never per-shop color */}
        <BtnC
          full
          size="sm"
          style={{ marginTop: "auto", background: "var(--primary)", color: "var(--primary-ink)" }}
        >
          Shop Now →
        </BtnC>
      </div>
    </div>
  );
}

/* ===== COLLECTION BANNER ===== */
function CollectionBanner({ icon, title, subtitle, accentColor }) {
  return (
    <div
      style={{
        padding: 24, borderRadius: 14,
        background: `linear-gradient(135deg, oklch(0.6 0.08 ${accentColor}) 0%, oklch(0.55 0.09 ${accentColor}) 100%)`,
        color: "#fff", cursor: "pointer", transition: "all 0.2s var(--ease)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        minHeight: 160, position: "relative", overflow: "hidden"
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, opacity: 0.15, fontSize: 100 }}>
        🌿
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center", marginBottom: 12 }}>
          <IconC name={icon} size={22} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{title}</h3>
        <p style={{ fontSize: 13, margin: 0, opacity: 0.85 }}>{subtitle}</p>
      </div>
      <div style={{ marginTop: "auto", fontSize: 12, fontWeight: 700, opacity: 0.9 }}>
        View Collection →
      </div>
    </div>
  );
}

Object.assign(window, { CustomerHomepage, ShopCard, CollectionBanner });
