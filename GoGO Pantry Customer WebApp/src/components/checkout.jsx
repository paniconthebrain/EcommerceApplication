import { useState, useEffect, useMemo } from 'react';
import { G } from '../globals.js';
import { IconC } from './icons.jsx';
import { BtnC, ConfirmDialog } from './ui.jsx';

export function ProgressIndicator({ currentStep, steps = ["Cart", "Checkout", "Confirm"] }) {
  return (
    <div style={{ padding: "14px 16px", background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
      <div className="progress-inner" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {steps.map((step, index) => (
          <div key={index} className="progress-step-item">
            <div className="progress-step-circle" style={{ width: 40, height: 40, borderRadius: 999, background: index <= currentStep ? "var(--primary)" : "var(--surface-2)", color: index <= currentStep ? "var(--primary-ink)" : "var(--text-3)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, transition: "all 0.3s var(--ease)", border: `2px solid ${index <= currentStep ? "var(--primary)" : "var(--line)"}`, flexShrink: 0 }}>
              {index < currentStep ? <IconC name="check" size={18} /> : <span>{index + 1}</span>}
            </div>
            <div className="progress-step-label" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: index <= currentStep ? "var(--text)" : "var(--text-2)", whiteSpace: "nowrap" }}>{step}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="progress-connector" style={{ flex: 1, height: 2, background: index < currentStep ? "var(--primary)" : "var(--line)", margin: "0 8px", minWidth: 32, transition: "all 0.3s var(--ease)" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerCheckout({ shopId, cartItems, onConfirm, onBack }) {
  const [step, setStep] = useState(1);
  const [slot, setSlot] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [expandedDays, setExpandedDays] = useState(() => new Set([0]));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("customerAuth");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setName(u.name);
        if (u.email) { setEmail(u.email); setNewsletterEmail(u.email); }
      }
    } catch {}
  }, []);

  const shop = G.SHOPS.find(s => s.id === shopId);

  const cartProducts = useMemo(() =>
    Object.entries(cartItems)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const p = G.PRODUCTS.find(x => String(x.id) === String(id));
        return p ? { ...p, qty } : null;
      })
      .filter(Boolean),
    [cartItems]
  );

  const subtotal = cartProducts.reduce((s, p) => s + (parseFloat(p.price) || 0) * p.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const days = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    return Array.from({ length: 7 }, (_, day) => {
      const d = new Date(now.getTime() + day * 86400000);
      const dateLabel = day === 0 ? "Today" : day === 1 ? "Tomorrow" :
        d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      const shortDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const slotDefs = [
        { id: "9-11",  label: "9:00 – 11:00 AM",   short: "9–11 AM",  startHour: 9,  period: "morning" },
        { id: "11-1",  label: "11:00 AM – 1:00 PM", short: "11AM–1PM", startHour: 11, period: "morning" },
        { id: "1-3",   label: "1:00 – 3:00 PM",     short: "1–3 PM",   startHour: 13, period: "afternoon" },
        { id: "3-5",   label: "3:00 – 5:00 PM",     short: "3–5 PM",   startHour: 15, period: "afternoon" },
        { id: "5-7",   label: "5:00 – 7:00 PM",     short: "5–7 PM",   startHour: 17, period: "evening" },
      ];
      const times = slotDefs.map((t, i) => ({
        ...t,
        slotId: `${day}-${t.id}`,
        available: !(day === 0 && t.startHour <= currentHour) && ((day * 5 + i) % 7 !== 2),
      }));
      return { day, dateLabel, shortDate, times };
    });
  }, []);

  const filteredDays = useMemo(() =>
    days.map(d => ({
      ...d,
      times: timeFilter === "all" ? d.times : d.times.filter(t => t.period === timeFilter),
    })).filter(d => d.times.length > 0),
    [days, timeFilter]
  );

  const selectedSlotLabel = useMemo(() => {
    if (!slot) return null;
    for (const d of days) {
      const t = d.times.find(t => t.slotId === slot);
      if (t) return `${d.dateLabel}, ${t.label}`;
    }
    return null;
  }, [slot, days]);

  const toggleDay = (day) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  };

  const handleNext = () => {
    if (step === 2 && !slot) return;
    if (step === 3) { setConfirmOpen(true); return; }
    setStep(s => s + 1);
  };

  const handlePlaceOrder = () => {
    setConfirmOpen(false);
    setProcessing(true);
    setTimeout(() => onConfirm({ deliveryType: "pickup", slot: selectedSlotLabel, email, name, total }), 800);
  };

  const renderSummary = (showNewsletter) => (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
      <div style={{ background: "linear-gradient(135deg, oklch(0.42 0.14 152) 0%, oklch(0.35 0.11 152) 100%)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <IconC name="pin" size={22} style={{ color: "#fff", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Supporting local</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shop ? shop.name : "Your local store"}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}><IconC name="check" size={11} stroke={3} /> Local</div>
      </div>

      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", maxHeight: 180, overflowY: "auto" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          {cartProducts.length} item{cartProducts.length !== 1 ? "s" : ""}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {cartProducts.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13 }}>
              <span style={{ color: "var(--text-2)", minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 6 }}>
                {p.name} <span style={{ color: "var(--text-3)", fontWeight: 600 }}>×{p.qty}</span>
              </span>
              <span style={{ color: "var(--text)", fontWeight: 700, flexShrink: 0 }}>{G.money(p.price * p.qty)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
        {[["Subtotal", G.money(subtotal)], ["Tax (8%)", G.money(tax)]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
            <span style={{ color: "var(--text-2)" }}>{l}</span>
            <span style={{ color: "var(--text)" }}>{v}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, paddingTop: 10, marginTop: 6, borderTop: "1px solid var(--line)" }}>
          <span style={{ color: "var(--text)" }}>Total</span>
          <span style={{ color: "var(--primary)" }}>{G.money(total)}</span>
        </div>
        <div style={{ marginTop: 7, fontSize: 12, color: "var(--green-600)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <IconC name="check" size={13} stroke={2.5} />
          Free pickup — no delivery fee
        </div>
      </div>

      {slot && (
        <div style={{ padding: "11px 16px", background: "var(--green-100)", borderBottom: showNewsletter ? "1px solid var(--line)" : "none", display: "flex", alignItems: "center", gap: 8 }}>
          <IconC name="clock" size={14} style={{ color: "var(--green-600)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--green-700)", fontWeight: 700 }}>{selectedSlotLabel}</span>
        </div>
      )}

      {showNewsletter && (
        <div style={{ padding: "16px 16px" }}>
          {newsletterDone
            ? <div style={{ textAlign: "center", padding: "8px", fontSize: 13, color: "var(--green-600)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><IconC name="checkCircle" size={16} />You're subscribed!</div>
            : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}><IconC name="leaf" size={13} />Weekly fresh deals</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 10, lineHeight: 1.5 }}>Exclusive local offers · New arrivals · Zero spam</div>
                <div style={{ display: "flex", gap: 7 }}>
                  <input type="email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} placeholder="your@email.com"
                    style={{ flex: 1, padding: "9px 11px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 12, fontFamily: "var(--font-sans)", outline: "none", color: "var(--text)", minWidth: 0 }} />
                  <button onClick={() => newsletterEmail && setNewsletterDone(true)}
                    style={{ padding: "9px 14px", borderRadius: 9, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>Join</button>
                </div>
              </div>
            )
          }
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <ConfirmDialog
        open={confirmOpen}
        title="Ready to place your order?"
        body={`${cartProducts.length} item${cartProducts.length !== 1 ? 's' : ''} · ${G.money(total)} · ${selectedSlotLabel || 'pickup'}`}
        confirm="Place order"
        cancel="Review again"
        tone="primary"
        onConfirm={handlePlaceOrder}
        onCancel={() => setConfirmOpen(false)}
      />
      <ProgressIndicator currentStep={2} steps={["Store", "Cart", "Checkout", "Confirm"]} />

      <div style={{ padding: "28px 16px 56px", maxWidth: 1100, margin: "0 auto", width: "100%", flex: 1 }}>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>Step {step} of 3</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "var(--text)", letterSpacing: "-0.02em" }}>
            {step === 1 && "How would you like your order?"}
            {step === 2 && "Choose a pickup time"}
            {step === 3 && "Review your order"}
          </h1>
        </div>

        {step === 1 && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ background: "linear-gradient(135deg, var(--green-100) 0%, var(--amber-100) 100%)", border: "1px solid var(--green-300)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--green-600)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <IconC name="pin" size={22} style={{ color: "#fff" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--green-700)" }}>Supporting local stores</span>
                  <span style={{ fontSize: 11, fontWeight: 800, background: "var(--green-600)", color: "#fff", padding: "2px 9px", borderRadius: 99 }}>Local</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.45 }}>
                  Every purchase goes directly to <strong style={{ color: "var(--text)" }}>{shop ? shop.name : "your local store"}</strong> — keeping money in the community.
                </div>
              </div>
            </div>

            <div style={{ opacity: 0.42, cursor: "not-allowed", marginBottom: 12 }}>
              <div style={{ padding: "18px 20px", borderRadius: 14, border: "2px solid var(--line)", background: "var(--bg-sunken)", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: 999, border: "2px solid var(--line-strong)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 7 }}><IconC name="truck" size={16} />Home Delivery</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "var(--amber-100)", color: "var(--warm-600)", padding: "2px 9px", borderRadius: 99 }}>Coming soon</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 3 }}>Delivered to your door within 2 hours</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-3)" }}>$3.99</span>
              </div>
            </div>

            <div style={{ padding: "18px 20px", borderRadius: 14, border: "2px solid var(--primary)", background: "color-mix(in oklch, var(--primary) 8%, transparent)", display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, border: "2px solid var(--primary)", background: "var(--primary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fff" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}><IconC name="pin" size={16} />In-store Pickup</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 3 }}>
                  Ready in ~15 min at <strong style={{ color: "var(--text)" }}>{shop ? shop.name : "your selected store"}</strong>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, background: "var(--green-100)", color: "var(--green-700)", padding: "5px 13px", borderRadius: 99, flexShrink: 0 }}>Free</span>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <BtnC variant="ghost" onClick={onBack}>← Back to cart</BtnC>
              <BtnC full onClick={() => setStep(2)}>Continue to time slot →</BtnC>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="checkout-cols">
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {[["all","clock","All times"],["morning","sun","Morning"],["afternoon","sun","Afternoon"],["evening","moon","Evening"]].map(([v, ic, l]) => (
                  <button key={v} onClick={() => setTimeFilter(v)} aria-pressed={timeFilter === v}
                    style={{ padding: "8px 16px", borderRadius: 99, border: "1.5px solid", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 6,
                      borderColor: timeFilter === v ? "var(--primary)" : "var(--line)",
                      background: timeFilter === v ? "var(--primary)" : "transparent",
                      color: timeFilter === v ? "#fff" : "var(--text-2)" }}>
                    <IconC name={ic} size={14} />{l}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredDays.map(({ day, dateLabel, shortDate, times }) => {
                  const isExpanded = expandedDays.has(day);
                  const availCount = times.filter(t => t.available).length;
                  return (
                    <div key={day} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
                      <button onClick={() => toggleDay(day)} aria-expanded={isExpanded}
                        style={{ width: "100%", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{dateLabel}</span>
                          {day <= 1 && <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>{shortDate}</span>}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0, color: availCount > 0 ? "var(--green-600)" : "var(--text-3)" }}>
                          {availCount > 0 ? `${availCount} available` : "Fully booked"}
                        </span>
                        <div style={{ color: "var(--text-3)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none", display: "flex", marginLeft: 4 }}>
                          <IconC name="chevD" size={18} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div style={{ padding: "2px 16px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                          {times.map(t => {
                            const isSel = slot === t.slotId;
                            const isFull = !t.available;
                            return (
                              <button key={t.slotId} disabled={isFull} onClick={() => !isFull && setSlot(t.slotId)}
                                aria-pressed={isSel} aria-label={`${t.label}${isFull ? " — unavailable" : ""}`}
                                tabIndex={isFull ? -1 : 0}
                                style={{ padding: "11px 8px", borderRadius: 11, border: "2px solid", textAlign: "center", fontFamily: "var(--font-sans)", transition: "all 0.12s",
                                  borderColor: isSel ? "var(--primary)" : isFull ? "transparent" : "var(--line)",
                                  background: isSel ? "color-mix(in oklch, var(--primary) 14%, transparent)" : isFull ? "var(--bg-sunken)" : "var(--bg)",
                                  color: isFull ? "var(--text-3)" : "var(--text)",
                                  cursor: isFull ? "not-allowed" : "pointer", opacity: isFull ? 0.45 : 1 }}
                                onMouseEnter={e => { if (!isFull && !isSel) { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "color-mix(in oklch, var(--primary) 6%, transparent)"; } }}
                                onMouseLeave={e => { if (!isFull && !isSel) { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--bg)"; } }}>
                                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3 }}>{t.short}</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: isSel ? "var(--primary)" : "var(--text-3)" }}>
                                  {isFull ? "Full" : isSel ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><IconC name="check" size={11} stroke={3} />Selected</span> : t.period}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <BtnC variant="ghost" onClick={() => setStep(1)}>← Back</BtnC>
                <BtnC full onClick={handleNext} style={{ opacity: !slot ? 0.5 : 1, pointerEvents: !slot ? "none" : "auto" }}>
                  Review order →
                </BtnC>
              </div>
            </div>

            <div className="checkout-sticky checkout-summary-first" style={{ position: "sticky", top: 80 }}>{renderSummary(false)}</div>
          </div>
        )}

        {step === 3 && (
          <div className="checkout-cols">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "linear-gradient(135deg, var(--green-100) 0%, var(--blue-100) 100%)", border: "1px solid var(--green-300)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <IconC name="leaf" size={24} style={{ color: "var(--green-600)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--green-700)" }}>Supporting local stores</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>This order supports <strong>{shop ? shop.name : "your community"}</strong> directly. No middlemen.</div>
                </div>
                <div style={{ background: "var(--green-600)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}><IconC name="check" size={11} stroke={3} />Local</div>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <IconC name="pin" size={16} style={{ color: "var(--primary)" }} />
                  Pickup details
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {[["Store", shop ? shop.name : "Selected store"], ["Time", selectedSlotLabel || "—"], ["Ready in", "~15 min after arrival"]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", gap: 14, fontSize: 13 }}>
                      <span style={{ color: "var(--text-3)", minWidth: 68 }}>{l}</span>
                      <span style={{ fontWeight: 600, color: l === "Ready in" ? "var(--green-600)" : "var(--text)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <IconC name="user" size={16} style={{ color: "var(--primary)" }} />
                  Contact info
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {[["Name", name || "—"], ["Email", email || "—"]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", gap: 14, fontSize: 13 }}>
                      <span style={{ color: "var(--text-3)", minWidth: 68 }}>{l}</span>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <BtnC variant="ghost" onClick={() => setStep(2)}>← Back</BtnC>
                <BtnC full loading={processing} onClick={handleNext}>
                  Place order →
                </BtnC>
              </div>
            </div>

            <div className="checkout-sticky checkout-summary-first" style={{ position: "sticky", top: 80 }}>{renderSummary(true)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CustomerConfirmation({ orderData, onNewOrder }) {
  const [order] = useState(() => ({
    id: "GG-" + Math.random().toString().slice(2, 6).padStart(4, "0"),
    timestamp: new Date(),
    ...orderData,
    items: 8,
  }));

  const [timeline, setTimeline] = useState([
    { id: "confirmed", label: "Order confirmed",           time: "Just now", done: true },
    { id: "picking",   label: "Starting to pick items",    time: "2 min",    done: false },
    { id: "quality",   label: "Quality check",             time: "8 min",    done: false },
    { id: "ready",     label: "Ready for pickup / dispatch", time: "12 min", done: false },
  ]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setTimeline(t => t.map(x => x.id === "picking" ? { ...x, done: true } : x)), 3000),
      setTimeout(() => setTimeline(t => t.map(x => x.id === "quality" ? { ...x, done: true } : x)), 8000),
      setTimeout(() => setTimeline(t => t.map(x => x.id === "ready"   ? { ...x, done: true } : x)), 14000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <ProgressIndicator currentStep={3} steps={["Store", "Cart", "Checkout", "Confirm"]} />
      <div style={{ padding: "20px 16px", maxWidth: 800, margin: "0 auto", flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: 999, background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
            <IconC name="checkCircle" size={44} stroke={2} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>Order confirmed!</h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>Thank you. Here's what happens next.</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div className="confirm-detail-grid" style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Order number</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{order.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>${order.total?.toFixed(2)}</div>
            </div>
          </div>
          <div className="confirm-detail-grid">
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Delivery method</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                <IconC name="truck" size={18} style={{ color: "var(--primary)" }} />
                In-store pickup
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Time slot</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                <IconC name="clock" size={18} style={{ color: "var(--primary)" }} />
                {order.slot || "9am–11am"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px", color: "var(--text)" }}>Order status</h2>
          <div style={{ position: "relative", paddingLeft: 32 }}>
            {(() => {
              const firstPending = timeline.findIndex(s => !s.done);
              return timeline.map((step, i) => {
                const isCurrent = i === firstPending;
                const dotBg = step.done ? "var(--green-500)" : isCurrent ? "var(--amber-100)" : "var(--surface-2)";
                const dotBorder = step.done ? "var(--green-500)" : isCurrent ? "var(--amber-500)" : "var(--line-strong)";
                const lineColor = step.done ? "var(--green-500)" : isCurrent ? "var(--amber-300, #fcd34d)" : "var(--line-strong)";
                return (
                  <div key={step.id} style={{ marginBottom: i < timeline.length - 1 ? 20 : 0, opacity: !step.done && !isCurrent ? 0.45 : 1 }}>
                    <div style={{ position: "absolute", left: 0, top: 6, width: 24, height: 24, borderRadius: 999, background: dotBg, border: `2px solid ${dotBorder}`, display: "grid", placeItems: "center", color: step.done ? "white" : "var(--amber-500)", fontWeight: 700, fontSize: 12 }}>
                      {step.done
                        ? <IconC name="check" size={13} stroke={3} />
                        : isCurrent && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--amber-500)", display: "block" }} />}
                    </div>
                    {i < timeline.length - 1 && (
                      <div style={{ position: "absolute", left: 11, top: 24, width: 2, height: 20, background: lineColor }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: step.done ? "var(--green-700)" : isCurrent ? "var(--text)" : "var(--text-2)", marginBottom: 2 }}>{step.label}</div>
                      <div style={{ fontSize: 12, color: isCurrent ? "var(--amber-600, #d97706)" : "var(--text-3)" }}>{step.time}</div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
          <BtnC variant="ghost" full>Track order</BtnC>
          <BtnC full icon="home" onClick={onNewOrder}>Back to shopping</BtnC>
        </div>
      </div>
    </div>
  );
}
