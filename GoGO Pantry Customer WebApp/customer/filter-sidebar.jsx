/* GoGO Pantry — Filter Sidebar Component */

function FilterSidebar({
  priceRange = [0, 50],
  onPriceChange,
  showInStockOnly = false,
  onStockToggle,
  showOnSaleOnly = false,
  onSaleToggle,
  resetFilters
}) {
  return (
    <div style={{
      width: 280,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: 20
    }}>
      {/* Filters header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 12,
        borderBottom: "1px solid var(--line)"
      }}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--text)",
          margin: 0
        }}>
          Filters
        </h3>
        <button
          onClick={resetFilters}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans)"
          }}
        >
          Reset
        </button>
      </div>

      {/* Price Range Filter */}
      <div>
        <label style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          display: "block",
          marginBottom: 12
        }}>
          Price Range
        </label>
        <div style={{
          display: "flex",
          gap: 8,
          alignItems: "center"
        }}>
          <input
            type="range"
            min="0"
            max="50"
            value={priceRange[1]}
            onChange={e => onPriceChange([priceRange[0], parseInt(e.target.value)])}
            style={{
              flex: 1,
              cursor: "pointer",
              accentColor: "var(--primary)"
            }}
          />
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: 12,
          color: "var(--text-2)"
        }}>
          <span>$0</span>
          <span className="tnum" style={{ fontWeight: 600, color: "var(--text)" }}>
            ${priceRange[1]}
          </span>
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          padding: "8px 0"
        }}>
          <input
            type="checkbox"
            checked={showInStockOnly}
            onChange={e => onStockToggle(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              cursor: "pointer",
              accentColor: "var(--primary)"
            }}
          />
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text)",
            userSelect: "none"
          }}>
            In Stock Only
          </span>
        </label>
      </div>

      {/* Sale Filter */}
      <div>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          padding: "8px 0"
        }}>
          <input
            type="checkbox"
            checked={showOnSaleOnly}
            onChange={e => onSaleToggle(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              cursor: "pointer",
              accentColor: "var(--primary)"
            }}
          />
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text)",
            userSelect: "none"
          }}>
            On Sale
          </span>
        </label>
      </div>

      {/* Rating Filter */}
      <div>
        <label style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          display: "block",
          marginBottom: 10
        }}>
          Rating
        </label>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}>
          {[
            { label: "4.5+ stars", value: 4.5 },
            { label: "4.0+ stars", value: 4.0 },
            { label: "3.5+ stars", value: 3.5 }
          ].map(option => (
            <label
              key={option.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "6px 0"
              }}
            >
              <input
                type="radio"
                name="rating"
                defaultChecked={false}
                style={{
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                  accentColor: "var(--primary)"
                }}
              />
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-2)",
                userSelect: "none"
              }}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FilterSidebar });
