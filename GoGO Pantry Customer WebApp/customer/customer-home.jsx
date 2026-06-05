/* GoGO Pantry — Premium Customer Homepage (Complete Redesign) */

function CustomerHomepage({ onSelectShop }) {
  const [search, setSearch] = useState("");

  const filteredShops = search
    ? G.SHOPS.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase())
      )
    : G.SHOPS;

  const recommendedShops = G.SHOPS.slice(0, 4); // Top 4 shops as featured

  return (
    <div style={{ padding: "0", background: "var(--bg)" }}>
      {/* ===== HERO SECTION ===== */}
      <div style={{
        background: "linear-gradient(135deg, oklch(0.55 0.08 152) 0%, oklch(0.48 0.1 152) 100%)",
        color: "#fff",
        padding: "60px 20px",
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
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontSize: "clamp(28px, 8vw, 48px)",
            fontWeight: 800,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.2
          }}>
            Fresh Groceries, Delivered Fast
          </h1>
          <p style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            margin: "0 0 32px",
            opacity: 0.95,
            lineHeight: 1.6,
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            Shop from your favorite local stores. Same-day delivery. Fresh guarantee.
          </p>

          {/* Search bar */}
          <div style={{
            maxWidth: 500,
            margin: "0 auto",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center"
          }}>
            <div style={{ flex: "1 1 280px", minWidth: 200, position: "relative" }}>
              <span style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-3)",
                pointerEvents: "none"
              }}>
                <IconC name="search" size={18} />
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stores..."
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 40px",
                  borderRadius: 11,
                  border: "none",
                  outline: "none",
                  background: "rgba(255,255,255,0.95)",
                  color: "#1f2937",
                  fontSize: 14,
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
            </div>
            <BtnC
              variant="ghost"
              icon="pin"
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.3)",
                fontWeight: 700
              }}
            >
              Use Location
            </BtnC>
          </div>
        </div>
      </div>

      {/* ===== FEATURED SHOPS SECTION ===== */}
      <div style={{
        padding: "40px 20px",
        maxWidth: 1400,
        margin: "0 auto"
      }}>
        <div style={{ marginBottom: 8 }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 800,
            margin: "0 0 8px",
            color: "var(--text)",
            letterSpacing: "-0.01em"
          }}>
            {search ? "Search Results" : "Featured Stores"}
          </h2>
          <p style={{
            fontSize: 13,
            color: "var(--text-2)",
            margin: 0
          }}>
            {filteredShops.length} store{filteredShops.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {filteredShops.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-3)"
          }}>
            <IconC name="search" size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>No stores found</p>
            <p style={{ fontSize: 13, margin: "6px 0 0" }}>Try adjusting your search</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20
          }}>
            {filteredShops.map(shop => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onSelect={() => onSelectShop(shop.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== QUICK CATEGORY ACCESS ===== */}
      <div style={{
        padding: "40px 20px",
        background: "var(--surface-2)"
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto"
        }}>
          <h2 style={{
            fontSize: 22,
            fontWeight: 800,
            margin: "0 0 20px",
            color: "var(--text)"
          }}>
            Shop by Category
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 14
          }}>
            {G.CATEGORIES.map(c => (
              <div
                key={c.id}
                onClick={() => {
                  // Navigate to browse with category filter
                  // This will be handled by parent component
                }}
                style={{
                  textAlign: "center",
                  padding: 18,
                  borderRadius: 14,
                  background: "var(--surface)",
                  cursor: "pointer",
                  transition: "all 0.2s var(--ease)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: `oklch(0.6 0.08 ${c.hue})`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 24
                }}>
                  🥬
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text)",
                  lineHeight: 1.3,
                  textAlign: "center"
                }}>
                  {c.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FEATURED COLLECTIONS ===== */}
      <div style={{
        padding: "40px 20px",
        maxWidth: 1400,
        margin: "0 auto"
      }}>
        <h2 style={{
          fontSize: 22,
          fontWeight: 800,
          margin: "0 0 24px",
          color: "var(--text)"
        }}>
          This Week's Highlights
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20
        }}>
          {/* Weekly Deals Collection */}
          <CollectionBanner
            icon="spark"
            title="Weekly Deals"
            subtitle="Trending this week"
            accentColor={152}
          />

          {/* Organic & Natural Collection */}
          <CollectionBanner
            icon="leaf"
            title="Organic & Natural"
            subtitle="Hand-picked organic items"
            accentColor={152}
          />

          {/* Local Favorites Collection */}
          <CollectionBanner
            icon="pin"
            title="Local Favorites"
            subtitle="From your community"
            accentColor={65}
          />

          {/* Recently Added Collection */}
          <CollectionBanner
            icon="plus"
            title="Recently Added"
            subtitle="Fresh arrivals"
            accentColor={245}
          />
        </div>
      </div>

      {/* ===== PROMOTIONAL BANNER ===== */}
      <div style={{
        padding: "40px 20px",
        background: "linear-gradient(135deg, oklch(0.6 0.12 245) 0%, oklch(0.55 0.1 245) 100%)",
        color: "#fff"
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16
        }}>
          <div>
            <h3 style={{
              fontSize: 28,
              fontWeight: 800,
              margin: "0 0 8px",
              letterSpacing: "-0.01em"
            }}>
              New Customer? Save 20%
            </h3>
            <p style={{
              fontSize: 14,
              margin: 0,
              opacity: 0.9
            }}>
              Use code WELCOME20 on your first order
            </p>
          </div>
          <BtnC
            style={{
              background: "#fff",
              color: "oklch(0.6 0.12 245)"
            }}
          >
            Explore Stores
          </BtnC>
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div style={{
        padding: "40px 20px",
        background: "var(--surface-2)"
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto"
        }}>
          <h2 style={{
            fontSize: 22,
            fontWeight: 800,
            margin: "0 0 32px",
            color: "var(--text)",
            textAlign: "center"
          }}>
            How It Works
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24
          }}>
            {[
              { icon: "pin", title: "Select Store", desc: "Choose your nearest GoGO Pantry" },
              { icon: "cart", title: "Browse & Shop", desc: "Add fresh items to your cart" },
              { icon: "truck", title: "Fast Delivery", desc: "Same-day delivery to your door" }
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: 24,
                  background: "var(--surface)",
                  borderRadius: 14,
                  border: "1px solid var(--line)"
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "var(--primary)",
                  color: "var(--primary-ink)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 16px",
                  fontSize: 24
                }}>
                  <IconC name={step.icon} size={28} />
                </div>
                <h4 style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: "0 0 6px"
                }}>
                  {step.title}
                </h4>
                <p style={{
                  fontSize: 12,
                  color: "var(--text-2)",
                  margin: 0
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TRUST INDICATORS ===== */}
      <div style={{
        padding: "32px 20px",
        maxWidth: 1400,
        margin: "0 auto",
        textAlign: "center"
      }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 32,
          fontSize: 13,
          color: "var(--text-2)"
        }}>
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

/* ===== SHOP CARD COMPONENT ===== */
function ShopCard({ shop, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: 20,
        borderRadius: 14,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        cursor: "pointer",
        transition: "all 0.2s var(--ease)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Shop icon */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `oklch(0.6 0.13 ${shop.tint || '152'})`,
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontSize: 24
      }}>
        <IconC name="pin" size={24} />
      </div>

      {/* Shop info */}
      <div>
        <div style={{
          fontSize: 16,
          fontWeight: 800,
          color: "var(--text)",
          marginBottom: 4,
          letterSpacing: "-0.01em"
        }}>
          {shop.name}
        </div>
        <div style={{
          fontSize: 13,
          color: "var(--text-2)"
        }}>
          {shop.city}
        </div>
      </div>

      {/* Details */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 12,
        color: "var(--text-3)",
        paddingTop: 8,
        borderTop: "1px solid var(--line)"
      }}>
        <span>{shop.code}</span>
        <span>•</span>
        <span>Open {shop.hours}</span>
      </div>

      {/* CTA Button */}
      <BtnC
        full
        size="sm"
        style={{
          marginTop: "auto",
          background: "var(--primary)",
          color: "var(--primary-ink)"
        }}
      >
        Shop Now
      </BtnC>
    </div>
  );
}

/* ===== COLLECTION BANNER COMPONENT ===== */
function CollectionBanner({ icon, title, subtitle, accentColor }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 14,
        background: `linear-gradient(135deg, oklch(0.6 0.08 ${accentColor}) 0%, oklch(0.55 0.09 ${accentColor}) 100%)`,
        color: "#fff",
        cursor: "pointer",
        transition: "all 0.2s var(--ease)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 160,
        position: "relative",
        overflow: "hidden"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 120,
        height: 120,
        opacity: 0.15,
        fontSize: 100
      }}>
        🌿
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "rgba(255,255,255,0.2)",
          display: "grid",
          placeItems: "center",
          marginBottom: 12
        }}>
          <IconC name={icon} size={22} />
        </div>
        <h3 style={{
          fontSize: 18,
          fontWeight: 800,
          margin: "0 0 4px",
          letterSpacing: "-0.01em"
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 13,
          margin: 0,
          opacity: 0.85
        }}>
          {subtitle}
        </p>
      </div>

      <div style={{
        marginTop: "auto",
        fontSize: 12,
        fontWeight: 700,
        opacity: 0.9
      }}>
        View Collection →
      </div>
    </div>
  );
}

Object.assign(window, { CustomerHomepage, ShopCard, CollectionBanner });
