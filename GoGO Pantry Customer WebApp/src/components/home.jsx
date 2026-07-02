import { useState, useEffect, useRef } from 'react';
import { G, APP_CONFIG } from '../globals.js';
import { IconC, getCategoryIcon } from './icons.jsx';
import { BtnC } from './ui.jsx';
import { ShopCard } from './shop.jsx';

// Real, computed data only — no placeholder rating or made-up numbers.
function Hero({ onSelectShop, onBrowse }) {
  const shopCount = G.SHOPS.length;
  const productCount = G.PRODUCTS.length;
  const singleShop = shopCount === 1 ? G.SHOPS[0] : null;
  const openNow = singleShop ? G.isShopOpen(singleShop) : null;

  const scrollToHowItWorks = () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div style={{ background: "var(--bg)", padding: "clamp(32px, 6vw, 60px) 20px clamp(44px, 7vw, 72px)" }}>
      <div className="hero-grid" style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px, 5vw, 64px)", alignItems: "center" }}>

        {/* Left — copy */}
        <div className="hero-copy">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--primary-soft)", color: "var(--green-700)", padding: "6px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, marginBottom: 22 }}>
            <IconC name="pin" size={13} stroke={2.5} />Easy pickup at your local store
          </div>

          <h1 style={{ fontSize: "clamp(36px, 4.6vw, 56px)", fontWeight: 900, margin: "0 0 18px", letterSpacing: "-0.04em", lineHeight: 1.05, color: "var(--text)" }}>
            Snacks &amp; drinks,<br />ready for pickup.
          </h1>

          <p style={{ fontSize: "clamp(15px, 1.4vw, 17px)", margin: "0 0 34px", color: "var(--text-3)", lineHeight: 1.7, maxWidth: 460 }}>
            Shop your local convenience store — candy, energy drinks, soda &amp; more. Order online, pick up in minutes. $0 delivery fees, always.
          </p>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => { G.SHOPS.length === 1 ? onSelectShop(G.SHOPS[0].id) : onBrowse(); }}
              style={{ padding: "15px 30px", borderRadius: 999, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-primary)", transition: "all 0.2s var(--spring)", letterSpacing: "-0.01em" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.filter = "none"; }}
            >
              Shop now
            </button>
            <button
              onClick={scrollToHowItWorks}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 2px", border: "none", background: "transparent", color: "var(--text-2)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              <span style={{ width: 26, height: 26, borderRadius: 999, border: "1.5px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <span style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "7px solid currentColor", marginLeft: 2 }} />
              </span>
              See how it works
            </button>
          </div>
        </div>

        {/* Right — visual card */}
        <div className="hero-visual" style={{ position: "relative" }}>
          <div style={{
            position: "relative", borderRadius: 28, overflow: "hidden", aspectRatio: "4 / 3.1",
            background: "linear-gradient(135deg, oklch(0.94 0.035 152) 0%, oklch(0.88 0.06 152) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Decorative soft blobs */}
            <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "oklch(0.7 0.14 152 / 0.25)", top: "-8%", right: "-10%", filter: "blur(2px)" }} />
            <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "oklch(0.98 0.01 152 / 0.5)", bottom: "-6%", left: "-8%" }} />

            {/* Floating icon chips */}
            {[
              { icon: "cart", top: "18%", left: "14%", size: 44 },
              { icon: "zap", top: "62%", left: "20%", size: 36 },
              { icon: "star", top: "24%", left: "72%", size: 36 },
              { icon: "leaf", top: "68%", left: "70%", size: 40 },
            ].map((c, i) => (
              <div key={i} style={{ position: "absolute", top: c.top, left: c.left, width: c.size + 24, height: c.size + 24, borderRadius: 18, background: "rgba(255,255,255,0.65)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.7)", display: "grid", placeItems: "center", boxShadow: "0 8px 24px oklch(0.5 0.1 152 / 0.12)" }}>
                <IconC name={c.icon} size={c.size * 0.5} stroke={1.8} style={{ color: "var(--green-700)" }} />
              </div>
            ))}

            {/* Center mark */}
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--primary)", display: "grid", placeItems: "center", boxShadow: "0 16px 40px oklch(0.55 0.17 152 / 0.35)" }}>
              <IconC name="basket" size={44} stroke={1.6} style={{ color: "#fff" }} />
            </div>

            {/* Floating info pill */}
            <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, background: "#fff", borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 12px 32px oklch(0.2 0.05 152 / 0.16)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <IconC name="pin" size={19} stroke={2} style={{ color: "var(--green-700)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text)" }}>
                  {shopCount} local store{shopCount === 1 ? "" : "s"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{productCount} item{productCount === 1 ? "" : "s"} featured today</div>
              </div>
              {openNow != null && (
                <span style={{ fontSize: 11.5, fontWeight: 800, color: openNow ? "var(--green-700)" : "var(--text-3)", whiteSpace: "nowrap" }}>
                  {openNow ? "Open now" : "Closed"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export function CustomerHomepage({ onSelectShop, shopId, onGoToBrowse }) {
  const [search, setSearch] = useState("");
  const [dataVersion, setDataVersion] = useState(() => G.SHOPS?.length > 0 ? 1 : 0);
  const [pendingCatHint, setPendingCatHint] = useState(null);
  const hintTimerRef = useRef(null);

  useEffect(() => {
    if (G.SHOPS?.length > 0) setDataVersion(n => n > 0 ? n : 1);
    const handler = () => setDataVersion(n => n + 1);
    window.addEventListener("dataLoaded", handler);
    return () => window.removeEventListener("dataLoaded", handler);
  }, []);

  useEffect(() => () => clearTimeout(hintTimerRef.current), []);

  // Clicking a category before picking a store used to silently scroll away with
  // no explanation — now it also surfaces a hint banner next to the store list.
  const goToBrowse = (catId, catName) => {
    if (shopId) { onGoToBrowse(catId); return; }
    document.getElementById("featured-stores")?.scrollIntoView({ behavior: "smooth" });
    clearTimeout(hintTimerRef.current);
    setPendingCatHint(catName || null);
    hintTimerRef.current = setTimeout(() => setPendingCatHint(null), 4500);
  };

  const filteredShops = search
    ? G.SHOPS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.city || "").toLowerCase().includes(search.toLowerCase()))
    : G.SHOPS;

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <Hero
        onSelectShop={onSelectShop}
        onBrowse={() => document.getElementById("featured-stores")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* ── Featured Stores ── */}
      <div id="featured-stores" style={{ padding: "56px 24px", maxWidth: 1400, margin: "0 auto" }}>
        {pendingCatHint && (
          <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--primary-soft)", color: "var(--green-700)", border: "1px solid var(--green-300)", borderRadius: 12, padding: "10px 16px", marginBottom: 20, fontSize: 13, fontWeight: 700 }}>
            <IconC name="pin" size={15} /> Choose a store below to browse {pendingCatHint}
          </div>
        )}
        <SectionHeader icon="pin" iconBg="oklch(0.94 0.06 152)" iconColor="oklch(0.42 0.14 152)"
          title={search ? "Search Results" : "Featured Stores"}
          sub={`${filteredShops.length} store${filteredShops.length !== 1 ? "s" : ""} available near you`}
          action={
            <div className="section-search-action" style={{ position: "relative", maxWidth: 220 }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}><IconC name="search" size={15} /></span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stores…"
                style={{ width: "100%", padding: "8px 12px 8px 33px", borderRadius: 999, border: "1.5px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-sans)", outline: "none" }} />
            </div>
          }
        />
        {filteredShops.length === 0 ? (
          <EmptyState icon="search" title="No stores found" sub="Try a different search term" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(270px, 100%), 320px))", gap: 20, maxWidth: filteredShops.length === 1 ? 360 : filteredShops.length === 2 ? 720 : "100%" }}>
            {filteredShops.map(shop => <ShopCard key={shop.id} shop={shop} onSelect={() => onSelectShop(shop.id)} />)}
          </div>
        )}
      </div>

      {/* ── Shop by Category ── */}
      <div style={{ padding: "52px 24px", background: "var(--primary-soft)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <SectionHeader icon="box" iconBg="oklch(0.88 0.1 152)" iconColor="oklch(0.38 0.16 152)"
            title="Shop by Category"
            sub={`Browse ${G.CATEGORIES.length} department${G.CATEGORIES.length === 1 ? "" : "s"}`}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))", gap: 12 }}>
            {G.CATEGORIES.map(c => (
              <CategoryTile key={c.id} category={c} onClick={() => goToBrowse(c.id, c.name)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Value Banner ── */}
      {/* Replaces a "20% off WELCOME20" claim that had no coupon system behind it —
          this highlights a real, always-true fact instead: delivery isn't offered,
          so there's no delivery markup to charge in the first place. */}
      <div style={{ margin: "0 24px 0", maxWidth: 1400, marginLeft: "auto", marginRight: "auto" }}>
        <div className="promo-banner-body" style={{ background: "linear-gradient(135deg, oklch(0.42 0.18 255) 0%, oklch(0.35 0.16 255) 100%)", borderRadius: 24, color: "#fff", padding: "40px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", margin: "48px 24px", position: "relative", overflow: "hidden" }}>
          {/* bg decoration */}
          <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 60, bottom: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.14)", borderRadius: 999, padding: "4px 12px", marginBottom: 12, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <IconC name="checkCircle" size={12} />Pickup only, always
            </div>
            <h3 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>$0 Delivery Fees. Ever.</h3>
            <p style={{ fontSize: 14, margin: 0, opacity: 0.8, maxWidth: 420 }}>No delivery markup, no surge pricing — just the shelf price, picked up at your local store.</p>
          </div>
          <button
            onClick={() => document.getElementById("featured-stores")?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "14px 28px", borderRadius: 14, border: "none", background: "#fff", color: "oklch(0.42 0.18 255)", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.2s var(--spring)", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.28)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}
          >
            Find a Store →
          </button>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div id="how-it-works" style={{ padding: "52px 24px 64px", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: "var(--text)", letterSpacing: "-0.03em" }}>How It Works</h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0 }}>Three simple steps to snacks & drinks</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { n: 1, icon: "pin",   title: "Select Store",   desc: "Choose your nearest GoGoPantry location" },
              { n: 2, icon: "cart",  title: "Browse & Shop",  desc: "Add fresh items to your cart with ease" },
              { n: 3, icon: "truck", title: "Pickup Anytime", desc: "Pick up at your own time — no rush" },
            ].map((step, i, arr) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {i < arr.length - 1 && (
                  <div className="hideOnMobile" style={{ position: "absolute", top: 28, left: "calc(50% + 36px)", right: "calc(-50% + 36px)", height: 2, background: `linear-gradient(90deg, var(--primary) 0%, var(--line) 100%)`, zIndex: 0, borderRadius: 1 }} />
                )}
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--primary)", color: "var(--primary-ink)", display: "grid", placeItems: "center", marginBottom: 18, boxShadow: "var(--shadow-primary)", position: "relative", zIndex: 1 }}>
                  <IconC name={step.icon} size={26} />
                  <span style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "var(--surface)", border: "2px solid var(--primary)", fontSize: 10, fontWeight: 900, color: "var(--primary)", display: "grid", placeItems: "center" }}>{step.n}</span>
                </div>
                <div style={{ background: "var(--surface)", borderRadius: 16, padding: "22px 20px", textAlign: "center", border: "1px solid var(--line)", boxShadow: "var(--shadow-xs)", width: "100%" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.01em" }}>{step.title}</h4>
                  <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.55 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust Badges — real, verifiable numbers instead of generic claims ── */}
      <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32 }}>
          {[
            { icon: "checkCircle", label: "Verified local stores" },
            { icon: "pin",         label: `${G.SHOPS.length} store${G.SHOPS.length === 1 ? "" : "s"} near you` },
            { icon: "box",         label: `${G.PRODUCTS.length}+ products` },
            { icon: "check",       label: "Secure checkout" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-2)", fontWeight: 600 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-soft)", display: "grid", placeItems: "center" }}>
                <IconC name={icon} size={17} style={{ color: "var(--green-600)" }} />
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Shared helpers ── */

function SectionHeader({ icon, iconBg, iconColor, title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: iconBg, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <IconC name={icon} size={22} style={{ color: iconColor }} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{title}</h2>
          {sub && <p style={{ fontSize: 13, color: "var(--text-3)", margin: "3px 0 0", fontWeight: 500 }}>{sub}</p>}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

function CategoryTile({ category: c, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Browse ${c.name}`}
      onClick={onClick}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClick()}
      className="card-hover"
      style={{ textAlign: "center", padding: "22px 12px 18px", borderRadius: 18, background: "var(--surface)", cursor: "pointer", border: "1.5px solid var(--line)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxShadow: "var(--shadow-xs)" }}
    >
      <div style={{ width: 54, height: 54, borderRadius: 15, background: `hsl(${c.hue},55%,92%)`, display: "grid", placeItems: "center" }}>
        <IconC name={getCategoryIcon(c.name)} size={26} style={{ color: `hsl(${c.hue},60%,38%)` }} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text)", lineHeight: 1.3 }}>{c.name}</div>
      <div style={{ fontSize: 11, color: `hsl(${c.hue},50%,45%)`, fontWeight: 600 }}>{G.productsByCat(c.id).length} item{G.productsByCat(c.id).length === 1 ? "" : "s"}</div>
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-3)", background: "var(--surface-2)", borderRadius: 18 }}>
      <IconC name={icon} size={40} style={{ opacity: 0.25, marginBottom: 14 }} />
      <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "var(--text-2)" }}>{title}</p>
      {sub && <p style={{ fontSize: 13, margin: 0 }}>{sub}</p>}
    </div>
  );
}
