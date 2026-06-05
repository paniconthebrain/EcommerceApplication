/* GoGO Pantry — Customer Order Confirmation & Tracking */

function CustomerConfirmation({ orderData, onNewOrder }) {
  const [order] = useState(() => ({
    id: "GG-" + Math.random().toString().slice(2, 6).padStart(4, "0"),
    timestamp: new Date(),
    ...orderData,
    items: 8, // placeholder
  }));

  const [timeline, setTimeline] = useState([
    { id: "confirmed", label: "Order confirmed", time: "Just now", done: true },
    { id: "picking", label: "Starting to pick items", time: "2 min", done: false },
    { id: "quality", label: "Quality check", time: "8 min", done: false },
    { id: "ready", label: "Ready for pickup / dispatch", time: "12 min", done: false },
  ]);

  useEffect(() => {
    const intervals = [
      setTimeout(() => setTimeline(t => t.map(x => x.id === "picking" ? { ...x, done: true } : x)), 3000),
      setTimeout(() => setTimeline(t => t.map(x => x.id === "quality" ? { ...x, done: true } : x)), 8000),
      setTimeout(() => setTimeline(t => t.map(x => x.id === "ready" ? { ...x, done: true } : x)), 14000),
    ];
    return () => intervals.forEach(clearTimeout);
  }, []);

  const slotDisplay = order.slot || "9am–11am";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Progress indicator */}
      <ProgressIndicator currentStep={2} />

      <div style={{ padding: "20px 16px", maxWidth: 800, margin: "0 auto", flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Success banner */}
      <div style={{ textAlign: "center", marginBottom: 32, animation: "gg-fade-up .5s var(--ease)" }}>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", margin: "0 auto 18px", animation: "gg-pop .5s var(--ease)" }}>
          <IconC name="checkCircle" size={44} stroke={2} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: "var(--text)", letterSpacing: "-0.02em" }}>Order confirmed!</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>Thank you, {order.name}. Here's what happens next.</p>
      </div>

      {/* Order summary card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Order number</div>
            <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{order.id}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Total</div>
            <div className="tnum" style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{G.money(order.total)}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Delivery method</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <IconC name={order.deliveryType === "delivery" ? "truck" : "store"} size={18} style={{ color: "var(--primary)" }} />
              {order.deliveryType === "delivery" ? "Delivery" : "In-store pickup"}
            </div>
            {order.deliveryType === "delivery" && <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>{order.address}</div>}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>Time slot</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
              <IconC name="clock" size={18} style={{ color: "var(--primary)" }} />
              {slotDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time tracking */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 20px", color: "var(--text)" }}>Order status</h2>
        <div style={{ position: "relative", paddingLeft: 32 }}>
          {timeline.map((step, i) => (
            <div key={step.id} style={{ marginBottom: i < timeline.length - 1 ? 20 : 0, opacity: step.done ? 1 : 0.6 }}>
              {/* Timeline node */}
              <div style={{ position: "absolute", left: 0, top: 6, width: 24, height: 24, borderRadius: 999, background: step.done ? "var(--primary)" : "var(--surface-2)", border: step.done ? "2px solid var(--primary)" : "2px solid var(--line-strong)", display: "grid", placeItems: "center", color: "var(--primary-ink)", fontWeight: 700, fontSize: 12, animation: step.done ? "gg-pop .4s var(--ease)" : "none" }}>
                {step.done && <IconC name="check" size={13} stroke={3} />}
              </div>

              {/* Timeline line */}
              {i < timeline.length - 1 && (
                <div style={{ position: "absolute", left: 11, top: 24, width: 2, height: 20, background: step.done ? "var(--primary)" : "var(--line-strong)" }} />
              )}

              {/* Content */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 2 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>{step.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support card */}
      <div style={{ background: "color-mix(in oklch, var(--blue-500) 8%, var(--surface))", border: "1px solid color-mix(in oklch, var(--blue-500) 25%, var(--line))", borderRadius: 16, padding: 18, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <IconC name="bell" size={20} style={{ color: "var(--blue-500)", marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>You'll get updates as your order progresses</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>We'll send text and email notifications to {order.email} when your order is ready.</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
        <BtnC variant="ghost" full>Track order</BtnC>
        <BtnC full icon="home" onClick={onNewOrder}>Back to shopping</BtnC>
      </div>
      </div>
    </div>
  );
}

Object.assign(window, { CustomerConfirmation });
