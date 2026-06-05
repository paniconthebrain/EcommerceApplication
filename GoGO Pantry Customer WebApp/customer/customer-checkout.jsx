/* GoGO Pantry — Customer Checkout with time slot picker */

function CustomerCheckout({ shopId, cartItems, onConfirm, onBack }) {
  const [step, setStep] = useState(1); // 1: delivery type, 2: time slot, 3: payment
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [slot, setSlot] = useState(null);
  const storedCustomer = JSON.parse(localStorage.getItem("customerAuth") || "{}");
  const [email] = useState(storedCustomer.email || "");
  const [name] = useState(storedCustomer.name || "");
  const [address, setAddress] = useState(storedCustomer.address || "");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const cartProducts = Object.entries(cartItems).filter(([, qty]) => qty > 0).map(([id, qty]) => {
    const p = G.PRODUCTS.find(x => x.id === id);
    return { ...p, qty };
  });

  const subtotal = cartProducts.reduce((s, p) => s + p.price * p.qty, 0);
  const deliveryFee = deliveryType === "pickup" ? 0 : 3.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  // Available slots (next 7 days)
  const slots = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let day = 0; day < 7; day++) {
      const d = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      const dStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      for (const time of ["9am–11am", "11am–1pm", "1pm–3pm", "3pm–5pm", "5pm–7pm"]) {
        arr.push({ id: `${day}-${time}`, display: `${dStr} · ${time}`, day, time });
      }
    }
    return arr;
  }, []);

  const handleConfirm = () => {
    if (step === 1 && !deliveryType) return;
    if (step === 2 && !slot) return;
    if (step === 3) {
      if (!address && deliveryType === "delivery") {
        setError("Please enter your delivery address");
        return;
      }
      setProcessing(true);
      setError("");
      try {
        const cartEntries = Object.entries(cartItems).filter(([, qty]) => qty > 0);
        const orderItems = cartEntries.map(([productId, qty]) => ({ productId, qty }));

        const res = await customerFetch(`${API_BASE}/orders`, {
          method: "POST",
          body: JSON.stringify({
            shopId,
            items: orderItems,
            orderType: deliveryType,
            timeSlot: slots.find(s => s.id === slot)?.display || slot,
            deliveryAddress: deliveryType === "delivery" ? address : null,
          }),
        });

        if (!res) { setProcessing(false); return; } // 401 handled by customerFetch
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to place order. Please try again.");
          setProcessing(false);
          return;
        }
        onConfirm({ ...data, deliveryType, slot, total });
      } catch {
        setError("Cannot connect to server. Please try again.");
        setProcessing(false);
      }
      return;
    }
    setStep(step + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Progress indicator */}
      <ProgressIndicator currentStep={1} />

      <div style={{ padding: "20px 16px", maxWidth: 900, margin: "0 auto", width: "100%", flex: 1 }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, display: "grid", placeItems: "center", fontWeight: 700, background: s <= step ? "var(--primary)" : "var(--surface-2)", color: s <= step ? "var(--primary-ink)" : "var(--text-3)" }}>
              {s < step ? <IconC name="check" size={20} /> : s}
            </div>
            {s < 3 && <div style={{ flex: 1, height: 2, background: s < step ? "var(--primary)" : "var(--surface-2)" }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Delivery type */}
      {step === 1 && (
        <div style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px", color: "var(--text)" }}>How would you like to receive your order?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["delivery", "🚚 Delivery", "Delivered to your door within 2 hours"], ["pickup", "🏪 In-store pickup", "Pick up at " + G.SHOPS.find(s => s.id === shopId)?.name]].map(([id, label, desc]) => (
              <button key={id} onClick={() => setDeliveryType(id)} style={{ textAlign: "left", padding: 20, borderRadius: 14, border: "2px solid", borderColor: deliveryType === id ? "var(--primary)" : "var(--line)", background: deliveryType === id ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "transparent", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 999, border: "2px solid", borderColor: deliveryType === id ? "var(--primary)" : "var(--line-strong)", background: deliveryType === id ? "var(--primary)" : "transparent" }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Time slot */}
      {step === 2 && (
        <div style={{ maxWidth: 700 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px", color: "var(--text)" }}>Choose your {deliveryType} time</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {slots.map(s => (
              <button key={s.id} onClick={() => setSlot(s.id)} style={{ padding: 14, borderRadius: 11, border: "2px solid", borderColor: slot === s.id ? "var(--primary)" : "var(--line)", background: slot === s.id ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "transparent", cursor: "pointer", textAlign: "center", fontFamily: "var(--font-sans)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{s.display}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px", color: "var(--text)" }}>Review your order</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
            {/* Delivery details */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Delivery details</div>
              <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--text-2)" }}>
                <IconC name={deliveryType === "delivery" ? "truck" : "store"} size={18} style={{ color: "var(--primary)", marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                    {deliveryType === "delivery" ? "Delivery" : "Pickup"} · {slots.find(s => s.id === slot)?.display || "Select time"}
                  </div>
                  {deliveryType === "delivery" && <div>{address}</div>}
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>{cartProducts.length} items</div>
              {cartProducts.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-2)", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--line-strong)" }}>
                  <span>{p.name} × {p.qty}</span>
                  <span className="tnum">{G.money(p.price * p.qty)}</span>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                <span style={{ color: "var(--text-2)" }}>Subtotal</span>
                <span className="tnum" style={{ color: "var(--text)" }}>{G.money(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                <span style={{ color: "var(--text-2)" }}>{deliveryType === "delivery" ? "Delivery fee" : "Pickup"}</span>
                <span className="tnum" style={{ color: "var(--text)" }}>{G.money(deliveryFee)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 10, borderBottom: "1px solid var(--line-strong)" }}>
                <span style={{ color: "var(--text-2)" }}>Tax</span>
                <span className="tnum" style={{ color: "var(--text)" }}>{G.money(tax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, marginTop: 10 }}>
                <span>Total</span>
                <span className="tnum" style={{ color: "var(--primary)" }}>{G.money(total)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background:"var(--red-100)", color:"var(--red-700)",
              padding:"12px 14px", borderRadius:10, fontSize:13, marginBottom:16,
              border:"1px solid var(--red-300)" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <BtnC variant="ghost" full onClick={onBack}>Cancel</BtnC>
            <BtnC full onClick={handleConfirm} style={{ opacity: processing ? 0.7 : 1 }}>
              {processing ? "Processing…" : "Place order"}
            </BtnC>
          </div>
        </div>
      )}

      {/* Footer navigation */}
      {step > 1 && step !== 3 && (
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <BtnC variant="ghost" full onClick={() => setStep(step - 1)}>Back</BtnC>
          <BtnC full onClick={handleConfirm} style={{ opacity: (step === 1 && !deliveryType) || (step === 2 && !slot) ? 0.5 : 1, pointerEvents: (step === 1 && !deliveryType) || (step === 2 && !slot) ? "none" : "auto" }}>
            {step === 2 ? "Review order" : "Next"}
          </BtnC>
        </div>
      )}
      </div>
    </div>
  );
}

Object.assign(window, { CustomerCheckout });
