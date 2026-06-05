/* GoGO Pantry — Shop Selector Modal Component */

function ShopSelector({ isOpen, onClose, onSelectShop, currentShopId }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("distance"); // distance, name, rating

  const filteredShops = search
    ? G.SHOPS.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase())
      )
    : G.SHOPS;

  const sortedShops = [...filteredShops].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "distance") {
      // In real app, calculate from user location
      return 0;
    }
    return 0;
  });

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "16px"
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
          animation: "slideUp 0.3s var(--ease)"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--text)",
            margin: 0
          }}>
            Select a Store
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 28,
              color: "var(--text-2)",
              cursor: "pointer",
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center"
            }}
          >
            ×
          </button>
        </div>

        {/* Search & Sort */}
        <div style={{
          padding: "16px 20px",
          background: "var(--surface-2)",
          display: "flex",
          gap: 12,
          flexWrap: "wrap"
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-3)",
              pointerEvents: "none"
            }}>
              <IconC name="search" size={16} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stores..."
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: 9,
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

          {/* Sort */}
          <div style={{ position: "relative" }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: "10px 32px 10px 12px",
                borderRadius: 9,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
                appearance: "none",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="distance">Nearest</option>
              <option value="name">Name (A-Z)</option>
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
        </div>

        {/* Shops list */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 0"
        }}>
          {sortedShops.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--text-3)"
            }}>
              <IconC name="search" size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No stores found</p>
              <p style={{ fontSize: 12, margin: "4px 0 0" }}>Try a different search</p>
            </div>
          ) : (
            sortedShops.map(shop => (
              <ShopSelectorItem
                key={shop.id}
                shop={shop}
                isSelected={shop.id === currentShopId}
                onSelect={() => {
                  onSelectShop(shop.id);
                  onClose();
                }}
              />
            ))
          )}
        </div>

        {/* Footer with use location */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--line)",
          background: "var(--surface-2)"
        }}>
          <BtnC
            full
            variant="soft"
            icon="pin"
            style={{ marginBottom: 10 }}
          >
            Use My Location
          </BtnC>
          <p style={{
            fontSize: 11,
            color: "var(--text-3)",
            margin: 0,
            textAlign: "center"
          }}>
            We'll find the nearest store for you
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/* Shop Selector Item */
function ShopSelectorItem({ shop, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%",
        padding: "14px 20px",
        border: "none",
        background: isSelected ? "var(--surface-2)" : "transparent",
        borderLeft: isSelected ? "4px solid var(--primary)" : "4px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s var(--ease)",
        display: "flex",
        alignItems: "center",
        gap: 14
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.background = "var(--surface-2)";
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {/* Shop icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: `oklch(0.6 0.13 ${shop.tint || '152'})`,
        color: "#fff",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        fontSize: 20
      }}>
        <IconC name="pin" size={22} />
      </div>

      {/* Shop info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 2
        }}>
          {shop.name}
        </div>
        <div style={{
          fontSize: 12,
          color: "var(--text-2)",
          marginBottom: 4
        }}>
          {shop.city} · Open {shop.hours}
        </div>
        <div style={{
          fontSize: 11,
          color: "var(--text-3)",
          display: "flex",
          gap: 8
        }}>
          <span>📍 2.5 miles</span>
          <span>⏱️ 25 min</span>
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: "var(--primary)",
          color: "var(--primary-ink)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          fontWeight: 800,
          fontSize: 14
        }}>
          ✓
        </div>
      )}
    </button>
  );
}

Object.assign(window, { ShopSelector, ShopSelectorItem });
