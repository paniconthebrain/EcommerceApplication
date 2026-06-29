import { useState, useEffect, useRef } from 'react';
import { G, APP_CONFIG } from '../globals.js';
import { IconC, getCategoryIcon } from './icons.jsx';
import { BtnC } from './ui.jsx';
import { ShopCard } from './shop.jsx';

const HERO_SLIDES = [
  {
    gradient: "linear-gradient(135deg, oklch(0.3 0.12 152) 0%, oklch(0.42 0.16 152) 55%, oklch(0.5 0.1 175) 100%)",
    badge: "Easy pickup at your local store",
    badgeIcon: "pin",
    title: ["Fresh Groceries,", "Ready for Pickup"],
    sub: "Shop local stores. Get fresh produce, dairy, bakery & more — order online, pick up in minutes.",
    cta1: "Shop Now", cta1Icon: "cart", cta2: "Browse Stores",
    accent: "oklch(0.55 0.17 152)",
  },
  {
    gradient: "linear-gradient(135deg, oklch(0.27 0.1 170) 0%, oklch(0.37 0.13 158) 55%, oklch(0.44 0.1 140) 100%)",
    badge: "Locally sourced every day",
    badgeIcon: "leaf",
    title: ["Farm Fresh", "Produce Daily"],
    sub: "Handpicked fruits and vegetables from local farms — fresh, seasonal, and full of flavor.",
    cta1: "Shop Produce", cta1Icon: "cart", cta2: "Browse Stores",
    accent: "oklch(0.62 0.15 155)",
  },
];

const HERO_STATS = [
  { icon: "star", label: "4.9 rating" },
  { icon: "pin",  label: (n) => `${n || 4} stores` },
  { icon: "zap",  label: "Under 1hr" },
];

function HeroCarousel({ onSelectShop, onBrowse }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = HERO_SLIDES.length;
  const touchStartX = useRef(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide(s => (s + 1) % total), 5500);
    return () => clearInterval(t);
  }, [paused]);

  const prev = () => { setPaused(true); setSlide(s => (s - 1 + total) % total); };
  const next = () => { setPaused(true); setSlide(s => (s + 1) % total); };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  const s = HERO_SLIDES[slide];

  return (
    <div
      style={{ position: "relative", overflow: "hidden", minHeight: "58vh", background: s.gradient, transition: "background 0.7s var(--ease)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide track */}
      <div style={{ display: "flex", transform: `translateX(-${slide * 100}%)`, transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)", willChange: "transform" }}>
        {HERO_SLIDES.map((sl, i) => (
          <div key={i} className="hero-slide-inner" style={{ minWidth: "100%", background: sl.gradient, color: "#fff", padding: "clamp(40px, 8vw, 72px) 20px clamp(52px, 10vw, 88px)", minHeight: "58vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
            {/* Background texture dots */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
              {[["-8%","8%",72,0.1],["-5%","55%",48,0.07],["82%","6%",64,0.09],["90%","52%",52,0.08],["55%","82%",40,0.07],["38%","-6%",56,0.08]].map(([l, t, sz, op], di) => (
                <div key={di} style={{ position: "absolute", left: l, top: t, opacity: op, color: "#fff", borderRadius: "50%", width: sz, height: sz, border: "2px solid currentColor" }} />
              ))}
            </div>

            {/* Content */}
            <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center", position: "relative", zIndex: 1 }}>
              <div style={{ maxWidth: 560 }}>
                {/* Badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.14)", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 22, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <IconC name={sl.badgeIcon} size={13} stroke={2.5} />{sl.badge}
                </div>

                {/* Title */}
                <h1 style={{ fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 900, margin: "0 0 18px", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                  {sl.title[0]}<br />{sl.title[1]}
                </h1>

                <p style={{ fontSize: "clamp(14px, 1.8vw, 17px)", margin: "0 0 34px", opacity: 0.85, lineHeight: 1.7, maxWidth: 440 }}>{sl.sub}</p>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={() => { const sh = G.SHOPS[0]; if (sh) onSelectShop(sh.id); }}
                    style={{ padding: "14px 28px", borderRadius: 14, border: "none", background: "#fff", color: "oklch(0.3 0.12 152)", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "0 4px 24px rgba(0,0,0,0.22)", transition: "all 0.2s var(--spring)", display: "flex", alignItems: "center", gap: 8, letterSpacing: "-0.01em" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(0,0,0,0.28)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.22)"; }}
                  >
                    <IconC name={sl.cta1Icon} size={17} stroke={2.5} />{sl.cta1}
                  </button>
                  <button
                    onClick={onBrowse}
                    style={{ padding: "13px 22px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", backdropFilter: "blur(8px)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                  >
                    {sl.cta2}
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 24, marginTop: 30, flexWrap: "wrap" }}>
                  {HERO_STATS.map(({ icon, label }) => (
                    <div key={icon} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, opacity: 0.85 }}>
                      <IconC name={icon} size={15} stroke={2} />
                      <span style={{ fontWeight: 600 }}>{typeof label === "function" ? label(G.SHOPS.length) : label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flexShrink: 0 }} className="hideOnMobile">
                {[
                  { icon: "leaf",  bg: "rgba(255,255,255,0.15)", label: "Organic" },
                  { icon: "cart",  bg: "rgba(255,255,255,0.1)",  label: "Fast" },
                  { icon: "check", bg: "rgba(255,255,255,0.1)",  label: "Fresh" },
                  { icon: "star",  bg: "rgba(255,255,255,0.15)", label: "Top Rated" },
                ].map((c, ci) => (
                  <div key={ci} style={{ height: 100, width: 100, borderRadius: 18, background: c.bg, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff" }}>
                    <IconC name={c.icon} size={32} stroke={1.5} />
                    <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.85 }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrow buttons — hidden on mobile (swipe handles navigation) */}
      {[["prev", "left", prev], ["next", "right", next]].map(([dir, side, fn]) => (
        <button key={dir} onClick={fn} className="hideOnMobile"
          style={{ position: "absolute", [side]: 16, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 36, height: 36, borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", transition: "all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
        >
          <IconC name="chevR" size={16} style={{ transform: dir === "prev" ? "rotate(180deg)" : "none" }} />
        </button>
      ))}

      {/* Progress dots */}
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 10 }}>
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => { setPaused(true); setSlide(i); }}
            style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 999, background: i === slide ? "#fff" : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", transition: "all 0.32s var(--spring)", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}


export function CustomerHomepage({ onSelectShop, shopId, onGoToBrowse }) {
  const goToBrowse = (catId) => {
    if (shopId) { onGoToBrowse(catId); }
    else { document.getElementById("featured-stores")?.scrollIntoView({ behavior: "smooth" }); }
  };

  const [search, setSearch] = useState("");
  const [dataVersion, setDataVersion] = useState(() => G.SHOPS?.length > 0 ? 1 : 0);

  useEffect(() => {
    if (G.SHOPS?.length > 0) setDataVersion(n => n > 0 ? n : 1);
    const handler = () => setDataVersion(n => n + 1);
    window.addEventListener("dataLoaded", handler);
    return () => window.removeEventListener("dataLoaded", handler);
  }, []);

  const filteredShops = search
    ? G.SHOPS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.city || "").toLowerCase().includes(search.toLowerCase()))
    : G.SHOPS;

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <HeroCarousel
        onSelectShop={onSelectShop}
        onBrowse={() => document.getElementById("featured-stores")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* ── Featured Stores ── */}
      <div id="featured-stores" style={{ padding: "56px 24px", maxWidth: 1400, margin: "0 auto" }}>
        <SectionHeader icon="pin" iconBg="oklch(0.94 0.06 152)" iconColor="oklch(0.42 0.14 152)"
          title={search ? "Search Results" : "Featured Stores"}
          sub={`${filteredShops.length} store${filteredShops.length !== 1 ? "s" : ""} available near you`}
          action={
            <div style={{ position: "relative", maxWidth: 220 }}>
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
            sub={`Browse ${G.CATEGORIES.length} departments`}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))", gap: 12 }}>
            {G.CATEGORIES.map(c => (
              <CategoryTile key={c.id} category={c} onClick={() => goToBrowse(c.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Promo Banner ── */}
      <div style={{ margin: "0 24px 0", maxWidth: 1400, marginLeft: "auto", marginRight: "auto" }}>
        <div className="promo-banner-body" style={{ background: "linear-gradient(135deg, oklch(0.42 0.18 255) 0%, oklch(0.35 0.16 255) 100%)", borderRadius: 24, color: "#fff", padding: "40px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", margin: "48px 24px", position: "relative", overflow: "hidden" }}>
          {/* bg decoration */}
          <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 60, bottom: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.14)", borderRadius: 999, padding: "4px 12px", marginBottom: 12, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <IconC name="gift" size={12} />Limited offer
            </div>
            <h3 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>New Customer? Save 20%</h3>
            <p style={{ fontSize: 14, margin: 0, opacity: 0.8 }}>Use code <strong>WELCOME20</strong> on your first order</p>
          </div>
          <button
            onClick={() => document.getElementById("featured-stores")?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "14px 28px", borderRadius: 14, border: "none", background: "#fff", color: "oklch(0.42 0.18 255)", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.2s var(--spring)", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.28)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}
          >
            Explore Stores →
          </button>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div style={{ padding: "52px 24px 64px", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: "var(--text)", letterSpacing: "-0.03em" }}>How It Works</h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0 }}>Three simple steps to fresh groceries</p>
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

      {/* ── Trust Badges ── */}
      <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32 }}>
          {[
            { icon: "checkCircle", label: "100% Fresh Guarantee" },
            { icon: "pin",         label: "Same-Day Pickup Available" },
            { icon: "check",       label: "Secure Checkout" },
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
        <span className="iconify" data-icon={getCategoryIcon(c.name)} style={{ fontSize: 26, color: `hsl(${c.hue},60%,38%)` }} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text)", lineHeight: 1.3 }}>{c.name}</div>
      <div style={{ fontSize: 11, color: `hsl(${c.hue},50%,45%)`, fontWeight: 600 }}>{G.productsByCat(c.id).length} items</div>
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
