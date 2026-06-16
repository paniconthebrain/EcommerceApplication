import { useState, useEffect } from 'react';
import { G, APP_CONFIG } from '../globals.js';
import { IconC, getCategoryIcon } from './icons.jsx';
import { BtnC } from './ui.jsx';
import { ShopCard } from './shop.jsx';

const HERO_SLIDES = [
  {
    gradient: "linear-gradient(135deg, oklch(0.38 0.1 152) 0%, oklch(0.5 0.13 152) 60%, oklch(0.55 0.08 180) 100%)",
    badge: "Easy pickup at your local store",
    badgeIcon: "pin",
    title: ["Fresh Groceries,", "Delivered Fast"],
    sub: "Shop local stores. Get fresh produce, dairy, bakery & more at your door in under an hour.",
    cta1: "Shop Now", cta1Icon: "cart", cta2: "Browse Stores",
    decorIcons: [["leaf","-10%","10%",72],["cart","78%","8%",56],["box","88%","55%",48],["star","5%","70%",44],["check","55%","80%",40],["leaf","35%","-5%",52]],
    cards: [["leaf","#d1fae5"],["cart","#dbeafe"],["check","#fef3c7"],["star","#ede9fe"]],
  },
  {
    gradient: "linear-gradient(135deg, oklch(0.45 0.12 55) 0%, oklch(0.55 0.15 48) 60%, oklch(0.6 0.1 38) 100%)",
    badge: "Baked fresh every morning",
    badgeIcon: "clock",
    title: ["Warm Bread &", "Bakery Treats"],
    sub: "Artisan breads, pastries, croissants, and muffins — baked daily in-store and ready for pickup.",
    cta1: "Shop Bakery", cta1Icon: "cart", cta2: "All Stores",
    decorIcons: [["box","-10%","10%",72],["clock","78%","8%",56],["star","88%","55%",48],["check","5%","70%",44],["bell","55%","80%",40],["box","35%","-5%",52]],
    cards: [["box","#ffedd5"],["clock","#fef3c7"],["star","#fce7f3"],["bell","#fee2e2"]],
  },
  {
    gradient: "linear-gradient(135deg, oklch(0.33 0.1 175) 0%, oklch(0.43 0.12 160) 60%, oklch(0.48 0.09 140) 100%)",
    badge: "Locally sourced every day",
    badgeIcon: "leaf",
    title: ["Farm Fresh", "Produce Daily"],
    sub: "Handpicked fruits and vegetables from local farms — fresh, seasonal, and full of flavor.",
    cta1: "Shop Produce", cta1Icon: "cart", cta2: "Browse Stores",
    decorIcons: [["leaf","-10%","10%",72],["check","78%","8%",56],["star","88%","55%",48],["leaf","5%","70%",44],["box","55%","80%",40],["clock","35%","-5%",52]],
    cards: [["leaf","#d1fae5"],["check","#fee2e2"],["star","#ffedd5"],["box","#ede9fe"]],
  },
  {
    gradient: "linear-gradient(135deg, oklch(0.38 0.12 260) 0%, oklch(0.48 0.15 255) 60%, oklch(0.54 0.1 245) 100%)",
    badge: "New customer offer inside",
    badgeIcon: "gift",
    title: ["Save 20% on", "Your First Order"],
    sub: "Welcome to GoGO Pantry! Use code WELCOME20 at checkout and enjoy fresh groceries at a great price.",
    cta1: "Claim Offer", cta1Icon: "gift", cta2: "Learn More",
    decorIcons: [["gift","-10%","10%",72],["star","78%","8%",56],["check","88%","55%",48],["bell","5%","70%",44],["heart","55%","80%",40],["gift","35%","-5%",52]],
    cards: [["gift","#ede9fe"],["star","#dbeafe"],["check","#fef3c7"],["heart","#fce7f3"]],
  },
];

function HeroCarousel({ onSelectShop, onBrowse }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = HERO_SLIDES.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide(s => (s + 1) % total), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const prev = () => { setPaused(true); setSlide(s => (s - 1 + total) % total); };
  const next = () => { setPaused(true); setSlide(s => (s + 1) % total); };

  const arrowBtn = (dir) => (
    <button onClick={dir === "prev" ? prev : next}
      style={{ position: "absolute", [dir === "prev" ? "left" : "right"]: 16, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 44, height: 44, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", transition: "background 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.32)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}>
      <IconC name="chevR" size={20} style={{ transform: dir === "prev" ? "rotate(180deg)" : "none" }} />
    </button>
  );

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "55vh" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      {/* Slides track */}
      <div style={{ display: "flex", transform: `translateX(-${slide * 100}%)`, transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        {HERO_SLIDES.map((s, i) => (
          <div key={i} style={{ minWidth: "100%", background: s.gradient, color: "#fff", padding: "72px 20px 80px", minHeight: "55vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
            {/* floating icon decorations */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
              {s.decorIcons.map(([iconName, l, t, sz], di) => (
                <div key={di} style={{ position: "absolute", left: l, top: t, opacity: 0.15, color: "#fff" }}>
                  <IconC name={iconName} size={sz} stroke={1.5} />
                </div>
              ))}
            </div>
            {/* content */}
            <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center", position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 18, backdropFilter: "blur(4px)" }}>
                  <IconC name={s.badgeIcon} size={14} stroke={2.5} />{s.badge}
                </div>
                <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {s.title[0]}<br />{s.title[1]}
                </h1>
                <p style={{ fontSize: "clamp(14px, 2vw, 18px)", margin: "0 0 32px", opacity: 0.9, lineHeight: 1.7, maxWidth: 480 }}>{s.sub}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => { const sh = G.SHOPS[0]; if (sh) onSelectShop(sh.id); }}
                    style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: "#fff", color: "oklch(0.38 0.1 152)", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}>
                    <IconC name={s.cta1Icon} size={18} stroke={2.5} />{s.cta1}
                  </button>
                  <button onClick={onBrowse}
                    style={{ padding: "14px 24px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.5)", background: "transparent", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", backdropFilter: "blur(4px)" }}>
                    {s.cta2}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
                  {[["star", "4.9 rating"], ["pin", `${G.SHOPS.length || 4} stores`], ["zap", "Under 1hr"]].map(([ic, lb]) => (
                    <div key={lb} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, opacity: 0.9 }}>
                      <IconC name={ic} size={16} stroke={2} /><span style={{ fontWeight: 600 }}>{lb}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0, width: 220 }} className="hideOnMobile">
                {s.cards.map(([iconName, bg], ci) => (
                  <div key={ci} style={{ height: 90, borderRadius: 16, background: bg, display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", color: "oklch(0.35 0.1 152)" }}>
                    <IconC name={iconName} size={36} stroke={1.5} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {arrowBtn("prev")}
      {arrowBtn("next")}

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => { setPaused(true); setSlide(i); }}
            style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 999, background: i === slide ? "#fff" : "rgba(255,255,255,0.45)", border: "none", cursor: "pointer", transition: "all 0.35s", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}


export function CustomerHomepage({ onSelectShop, shopId, onGoToBrowse }) {
  const goToBrowseOrScroll = () => {
    if (shopId) { onGoToBrowse(); }
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
    <div style={{ padding: "0", background: "var(--bg)" }}>
      {/* Hero Carousel */}
      <HeroCarousel
        onSelectShop={onSelectShop}
        onBrowse={() => document.getElementById("featured-stores")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* Featured Stores */}
      <div id="featured-stores" style={{ padding: "48px 20px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "oklch(0.94 0.06 152)", display: "grid", placeItems: "center" }}>
            <IconC name="pin" size={22} style={{ color: "oklch(0.45 0.13 152)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "var(--text)", letterSpacing: "-0.02em" }}>{search ? "Search Results" : "Featured Stores"}</h2>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: "2px 0 0" }}>{filteredShops.length} store{filteredShops.length !== 1 ? "s" : ""} available near you</p>
          </div>
        </div>
        {filteredShops.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)", background: "var(--surface-2)", borderRadius: 16 }}>
            <IconC name="search" size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>No stores found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {filteredShops.map(shop => <ShopCard key={shop.id} shop={shop} onSelect={() => onSelectShop(shop.id)} />)}
          </div>
        )}
      </div>

      {/* Shop by Category */}
      <div style={{ padding: "48px 20px", background: "oklch(0.97 0.02 152)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "oklch(0.88 0.1 152)", display: "grid", placeItems: "center" }}>
              <IconC name="box" size={22} style={{ color: "oklch(0.4 0.15 152)" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "var(--text)", letterSpacing: "-0.02em" }}>Shop by Category</h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: "2px 0 0" }}>Browse {G.CATEGORIES.length} departments</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 14 }}>
            {G.CATEGORIES.map(c => (
              <div key={c.id} role="button" tabIndex={0} aria-label={`Browse ${c.name}`}
                onClick={goToBrowseOrScroll} onKeyDown={e => (e.key === "Enter" || e.key === " ") && goToBrowseOrScroll()}
                style={{ textAlign: "center", padding: "22px 14px 18px", borderRadius: 16, background: "var(--surface)", cursor: "pointer", transition: "all 0.2s var(--ease)", border: `2px solid hsl(${c.hue},40%,88%)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 24px hsl(${c.hue},40%,80%)`; e.currentTarget.style.borderColor = `hsl(${c.hue},55%,70%)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `hsl(${c.hue},40%,88%)`; }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `hsl(${c.hue},55%,92%)`, display: "grid", placeItems: "center" }}>
                  <span className="iconify" data-icon={getCategoryIcon(c.name)} style={{ fontSize: 28, color: `hsl(${c.hue},60%,40%)` }}></span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", lineHeight: 1.3 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: `hsl(${c.hue},50%,45%)`, fontWeight: 600 }}>{G.productsByCat(c.id).length} items</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promo banner */}
      <div style={{ padding: "40px 20px", background: "linear-gradient(135deg, oklch(0.6 0.12 245) 0%, oklch(0.55 0.1 245) 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.01em" }}>New Customer? Save 20%</h3>
            <p style={{ fontSize: 14, margin: 0, opacity: 0.9 }}>Use code WELCOME20 on your first order</p>
          </div>
          <BtnC onClick={() => document.getElementById("featured-stores")?.scrollIntoView({ behavior: "smooth" })} style={{ background: "#fff", color: "oklch(0.6 0.12 245)" }}>Explore Stores</BtnC>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "40px 20px", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 32px", color: "var(--text)", textAlign: "center" }}>How It Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {[
              { icon: "pin", title: "Select Store", desc: "Choose your nearest GoGO Pantry" },
              { icon: "cart", title: "Browse & Shop", desc: "Add fresh items to your cart" },
              { icon: "truck", title: "Pickup Anytime", desc: "Pick up at your own time, no rush" }
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center", padding: 24, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--primary)", color: "var(--primary-ink)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><IconC name={step.icon} size={28} /></div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>{step.title}</h4>
                <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ padding: "32px 20px", maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32, fontSize: 13, color: "var(--text-2)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><IconC name="checkCircle" size={20} />100% Fresh Guarantee</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><IconC name="truck" size={20} />Same-Day Delivery</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><IconC name="check" size={20} />Secure Checkout</span>
        </div>
      </div>
    </div>
  );
}
