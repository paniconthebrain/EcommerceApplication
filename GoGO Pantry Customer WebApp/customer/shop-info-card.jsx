/* GoGO Pantry — Shop Info Card Component (for Browse Sidebar) */

function ShopInfoCard({ shop, onChangeShop }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: 18,
      position: "sticky",
      top: 100,
      zIndex: 10
    }}>
      {/* Shop Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `oklch(0.6 0.13 ${shop.tint || '152'})`,
          color: "#fff",
          display: "grid",
          placeItems: "center",
          flexShrink: 0
        }}>
          <IconC name="pin" size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 2px",
            lineHeight: 1.2
          }}>
            {shop.name}
          </h4>
          <p style={{
            fontSize: 11,
            color: "var(--text-2)",
            margin: 0
          }}>
            {shop.city}
          </p>
        </div>
      </div>

      {/* Shop Details */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingBottom: 16,
        borderBottom: "1px solid var(--line)",
        fontSize: 12
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
          <span>Hours</span>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>{shop.hours}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
          <span>Delivery Fee</span>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>$3.99</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
          <span>Est. Delivery</span>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>30 min</span>
        </div>
      </div>

      {/* Change Shop Button */}
      <BtnC
        full
        size="sm"
        variant="ghost"
        onClick={onChangeShop}
        style={{ marginTop: 16 }}
      >
        Change Store
      </BtnC>
    </div>
  );
}

Object.assign(window, { ShopInfoCard });
