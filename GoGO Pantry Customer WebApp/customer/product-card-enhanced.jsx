/* GoGO Pantry — Enhanced Product Card Component */

function ProductCardEnhanced({ product, inCart, disabled, stockState, onAdd, onAddQty }) {
  const categoryColor = G.catOf(product.cat);

  return (
    <div style={{
      background: "var(--surface)",
      border: `2px solid ${disabled ? "var(--line)" : `oklch(0.6 0.08 ${categoryColor.hue})`}`,
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "all 0.2s var(--ease)",
      opacity: disabled ? 0.65 : 1,
      cursor: disabled ? "not-allowed" : "pointer"
    }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Image area with stock badge */}
      <div style={{
        position: "relative",
        paddingBottom: "100%",
        background: `oklch(0.92 0.07 ${categoryColor.hue})`,
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: "3rem"
        }}>
          {product.image
            ? <img src={product.image} alt={product.name} loading="lazy" style={{ width: "70%", height: "70%", objectFit: "contain" }} />
            : <span>🛒</span>}
        </div>

        {/* Stock badge */}
        {stockState !== "ok" && (
          <div style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: stockState === "low" ? "var(--amber-500)" : "var(--red-500)",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}>
            {stockState === "low" ? "⚠️ Low" : "🚫 Out"}
          </div>
        )}

        {/* Wishlist button */}
        <button
          aria-label="Add to wishlist"
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(255,255,255,0.9)",
            border: "none",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            color: "var(--text-2)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => {
            e.target.style.background = "rgba(255,255,255,1)";
            e.target.style.color = "var(--red-500)";
          }}
          onMouseLeave={e => {
            e.target.style.background = "rgba(255,255,255,0.9)";
            e.target.style.color = "var(--text-2)";
          }}
          onClick={e => e.stopPropagation()}
        >
          <IconC name="heart" size={18} />
        </button>
      </div>

      {/* Content section */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: 14
      }}>
        {/* Product name */}
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1.3,
          marginBottom: 6,
          minHeight: "2.6em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {product.name}
        </div>

        {/* Unit */}
        <div style={{
          fontSize: 11,
          color: "var(--text-3)",
          marginBottom: 10,
          fontWeight: 500
        }}>
          {product.unit}
        </div>

        {/* Price and badge */}
        <div style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 12
        }}>
          <span className="tnum" style={{
            fontSize: 16,
            fontWeight: 800,
            color: "var(--text)"
          }}>
            {G.money(product.price)}
          </span>
          {product.tag && (
            <BadgeC tone="info" size="sm">{product.tag}</BadgeC>
          )}
        </div>

        {/* Rating (optional) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 10,
          fontSize: 12,
          color: "var(--text-2)"
        }}>
          <span>★★★★★</span>
          <span>(48)</span>
        </div>

        {/* Action button - sticky to bottom */}
        <div style={{ marginTop: "auto" }}>
          {inCart > 0 ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onAddQty();
                }}
                style={{
                  flex: 1,
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--primary)",
                  background: "transparent",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => {
                  e.target.style.background = "var(--primary)";
                  e.target.style.color = "var(--primary-ink)";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "var(--primary)";
                }}
              >
                +
              </button>
              <div style={{
                padding: "7px 10px",
                background: "var(--primary)",
                color: "var(--primary-ink)",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 13,
                minWidth: 32,
                textAlign: "center"
              }}>
                {inCart}
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  // Handle remove (would need onRemove prop)
                }}
                style={{
                  padding: "9px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--red-500)",
                  background: "transparent",
                  color: "var(--red-500)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => {
                  e.target.style.background = "var(--red-500)";
                  e.target.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "var(--red-500)";
                }}
              >
                −
              </button>
            </div>
          ) : (
            <BtnC
              full
              size="sm"
              onClick={onAdd}
              style={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? "none" : "auto"
              }}
            >
              Add to Cart
            </BtnC>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProductCardEnhanced });
