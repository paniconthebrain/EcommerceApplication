import { useState, useEffect } from 'react';
import { G, API_BASE, authHeaders } from '../../globals.js';
import { Btn, Pill, ConfirmDialog } from '../ui.jsx';
import { Icon } from '../icons.jsx';
import { MgmtModal, FieldRow, inputStyle, MgmtTable } from './shared.jsx';
import { PageHead } from '../ui.jsx';

function DepartmentsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", temperatureZone: "ambient", description: "" });
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState({ open: false, item: null });

  const load = async () => {
    setLoading(true);
    try { const r = await fetch(`${API_BASE}/departments`, { headers: authHeaders() }); if (r.ok) setItems(await r.json()); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", location: "", temperatureZone: "ambient", description: "" }); setErr(""); setModal(true); };
  const openEdit = d => { setEditing(d.id); setForm({ name: d.name, location: d.location || "", temperatureZone: d.temperatureZone || "ambient", description: d.description || "" }); setErr(""); setModal(true); };

  const save = async e => {
    e.preventDefault(); setErr("");
    const url = editing ? `${API_BASE}/departments/${editing}` : `${API_BASE}/departments`;
    const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setModal(false); load(); } else { const d = await r.json(); setErr(d.message || d.error || "Save failed"); }
  };

  const del = (d) => { setConfirmDel({ open: true, item: d }); };
  const doDel = async (d) => {
    setConfirmDel({ open: false, item: null });
    const r = await fetch(`${API_BASE}/departments/${d.id}`, { method: "DELETE", headers: authHeaders() });
    if (r.ok) load();
  };

  const zoneLabel = z => ({ frozen: "Frozen (−18°C)", chilled: "Chilled (4°C)", ambient: "Ambient (20°C)" }[z] || z);

  return (
    <>
      <ConfirmDialog
        open={confirmDel.open}
        title={`Delete "${confirmDel.item?.name}"?`}
        body="This department will be permanently removed."
        confirm="Delete" tone="danger"
        onConfirm={() => doDel(confirmDel.item)}
        onCancel={() => setConfirmDel({ open: false, item: null })}
      />
      <div style={{ marginBottom: 14 }}><Btn size="sm" icon="plus" onClick={openCreate}>Add Department</Btn></div>
      {loading ? <div style={{ color: "var(--text-3)", padding: 32, textAlign: "center" }}>Loading…</div> : (
        <MgmtTable
          cols={["Name", "Location", "Temperature zone"]}
          rows={items.map(d => ({ id: d.id, raw: d, cells: [
            <span style={{ fontWeight: 600 }}>{d.name}</span>,
            d.location || "—",
            <Pill tone="neutral" size="sm">{zoneLabel(d.temperatureZone)}</Pill>
          ]}))}
          onEdit={openEdit} onDelete={del}
        />
      )}
      <MgmtModal open={modal} title={editing ? "Edit Department" : "Add Department"} onClose={() => setModal(false)}>
        <form onSubmit={save}>
          <FieldRow label="Name *"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Frozen Foods" /></FieldRow>
          <FieldRow label="Location"><input style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Aisle A" /></FieldRow>
          <FieldRow label="Temperature zone">
            <select style={{ ...inputStyle, appearance: "none" }} value={form.temperatureZone} onChange={e => setForm({ ...form, temperatureZone: e.target.value })}>
              <option value="frozen">Frozen (−18°C)</option>
              <option value="chilled">Chilled (4°C)</option>
              <option value="ambient">Ambient (20°C)</option>
            </select>
          </FieldRow>
          <FieldRow label="Description"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FieldRow>
          {err && <div style={{ color: "var(--red-500)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn full type="submit">{editing ? "Update" : "Create"}</Btn>
            <Btn full variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </form>
      </MgmtModal>
    </>
  );
}

function CategoriesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", hue: 152, blurb: "" });
  const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState({ open: false, item: null });

  const load = async () => {
    setLoading(true);
    try { const r = await fetch(`${API_BASE}/categories`, { headers: authHeaders() }); if (r.ok) { const d = await r.json(); setItems(d); G.CATEGORIES = d.map(c => ({ id: c.id, name: c.name, hue: c.hue ?? 152 })); } }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ id: "", name: "", hue: 152, blurb: "" }); setErr(""); setModal(true); };
  const openEdit = c => { setEditing(c.id); setForm({ id: c.id, name: c.name, hue: c.hue ?? 152, blurb: c.blurb || "" }); setErr(""); setModal(true); };

  const save = async e => {
    e.preventDefault(); setErr("");
    const url = editing ? `${API_BASE}/categories/${editing}` : `${API_BASE}/categories`;
    const body = editing ? { name: form.name, hue: form.hue, blurb: form.blurb } : { id: form.id, name: form.name, hue: form.hue, blurb: form.blurb };
    const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { setModal(false); load(); } else { const d = await r.json(); setErr(d.message || d.error || "Save failed"); }
  };

  const del = (c) => { setConfirmDel({ open: true, item: c }); };
  const doDel = async (c) => {
    setConfirmDel({ open: false, item: null });
    const r = await fetch(`${API_BASE}/categories/${c.id}`, { method: "DELETE", headers: authHeaders() });
    if (r.ok) load();
  };

  return (
    <>
      <ConfirmDialog
        open={confirmDel.open}
        title={`Delete category "${confirmDel.item?.name}"?`}
        body="This will remove the category. Products assigned to it will need to be reassigned."
        confirm="Delete" tone="danger"
        onConfirm={() => doDel(confirmDel.item)}
        onCancel={() => setConfirmDel({ open: false, item: null })}
      />
      <div style={{ marginBottom: 14 }}><Btn size="sm" icon="plus" onClick={openCreate}>Add Category</Btn></div>
      {loading ? <div style={{ color: "var(--text-3)", padding: 32, textAlign: "center" }}>Loading…</div> : (
        <MgmtTable
          cols={["Name", "Color", "Description"]}
          rows={items.map(c => ({ id: c.id, raw: c, cells: [
            <span style={{ fontWeight: 600 }}>{c.name}</span>,
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: `hsl(${c.hue},65%,50%)`, border: "1px solid var(--line)" }} />
              <span className="mono" style={{ fontSize: 12 }}>{c.hue}°</span>
            </div>,
            <span style={{ color: "var(--text-3)", fontSize: 13 }}>{c.blurb || "—"}</span>
          ]}))}
          onEdit={openEdit} onDelete={del}
        />
      )}
      <MgmtModal open={modal} title={editing ? "Edit Category" : "Add Category"} onClose={() => setModal(false)}>
        <form onSubmit={save}>
          {!editing && <FieldRow label="ID (e.g. produce)"><input style={inputStyle} value={form.id} onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s/g, "-") })} required placeholder="produce" /></FieldRow>}
          <FieldRow label="Name *"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Produce" /></FieldRow>
          <FieldRow label="Color hue (0–360)">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input style={{ ...inputStyle, width: 90 }} type="number" min="0" max="360" value={form.hue} onChange={e => setForm({ ...form, hue: parseInt(e.target.value) || 0 })} />
              <div style={{ flex: 1, height: 36, borderRadius: 9, background: `hsl(${form.hue},65%,50%)`, border: "1px solid var(--line)", transition: "background 0.2s" }} />
            </div>
          </FieldRow>
          <FieldRow label="Description"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.blurb} onChange={e => setForm({ ...form, blurb: e.target.value })} placeholder="Short description shown to customers" /></FieldRow>
          {err && <div style={{ color: "var(--red-500)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn full type="submit">{editing ? "Update" : "Create"}</Btn>
            <Btn full variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </form>
      </MgmtModal>
    </>
  );
}

function ProductsTab() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { name: "", brand: "", categoryId: "", supplierId: "", price: "", unit: "", par: "", size: "", featuredImage: "", galleryImages: [], shortDescription: "", description: "", productType: "simple" };
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [confirmDel, setConfirmDel] = useState({ open: false, item: null });
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const [rp, rs, rc] = await Promise.all([
        fetch(`${API_BASE}/products`, { headers: authHeaders() }),
        fetch(`${API_BASE}/suppliers`, { headers: authHeaders() }),
        fetch(`${API_BASE}/categories`, { headers: authHeaders() }),
      ]);
      if (rp.ok) setItems(await rp.json());
      if (rs.ok) setSuppliers(await rs.json());
      if (rc.ok) setCategories(await rc.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || "", supplierId: suppliers[0]?.id || "" });
    setErr(""); setModal(true);
  };
  const openEdit = p => {
    setEditing(p.id);
    setForm({
      name: p.name, brand: p.brand || "",
      categoryId: p.categoryId || p.category_id || "",
      supplierId: p.supplierId || p.supplier_id || "",
      price: p.price ?? "", unit: p.unit ?? "", par: p.par ?? "", size: p.size || "",
      featuredImage: p.featuredImage || "",
      galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      productType: p.productType || "simple",
    });
    setErr(""); setModal(true);
  };

  const save = async e => {
    e.preventDefault(); setErr("");
    const isVariable = form.productType === "variable";
    const payload = {
      ...form,
      price: form.price !== "" ? parseFloat(form.price) : null,
      par: form.par !== "" ? parseInt(form.par) : (isVariable ? 0 : undefined),
      featuredImage: form.featuredImage || null,
      galleryImages: form.galleryImages || [],
    };
    const url = editing ? `${API_BASE}/products/${editing}` : `${API_BASE}/products`;
    const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (r.ok) { setModal(false); load(); } else { const d = await r.json(); setErr(d.message || d.error || "Save failed"); }
  };

  const addGalleryImages = e => {
    [...e.target.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, galleryImages: [...f.galleryImages, ev.target.result] }));
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const del = (p) => { setConfirmDel({ open: true, item: p }); };
  const doDel = async (p) => {
    setConfirmDel({ open: false, item: null });
    const r = await fetch(`${API_BASE}/products/${p.id}`, { method: "DELETE", headers: authHeaders() });
    if (r.ok) load();
  };

  const catName = id => categories.find(c => c.id === id)?.name || id || "—";
  const filtered = q ? items.filter(p => p.name.toLowerCase().includes(q.toLowerCase())) : items;
  const isVariable = form.productType === "variable";

  return (
    <>
      <ConfirmDialog
        open={confirmDel.open}
        title={`Delete "${confirmDel.item?.name}"?`}
        body="This product will be permanently removed from the catalog."
        confirm="Delete" tone="danger"
        onConfirm={() => doDel(confirmDel.item)}
        onCancel={() => setConfirmDel({ open: false, item: null })}
      />
      <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
        <Btn size="sm" icon="plus" onClick={openCreate}>Add Product</Btn>
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}><Icon name="search" size={15} /></span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>{filtered.length} of {items.length}</span>
      </div>
      {loading ? <div style={{ color: "var(--text-3)", padding: 32, textAlign: "center" }}>Loading…</div> : (
        <MgmtTable
          cols={["Name", "Type", "Category", "Price", "Unit", "Par"]}
          rows={filtered.map(p => ({ id: p.id, raw: p, cells: [
            <span style={{ fontWeight: 600 }}>{p.name}{p.brand ? <span style={{ fontWeight: 400, color: "var(--text-3)", fontSize: 12 }}> · {p.brand}</span> : null}</span>,
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: p.productType === "variable" ? "var(--violet-100,#ede9fe)" : "var(--surface-2)", color: p.productType === "variable" ? "var(--violet-700,#6d28d9)" : "var(--text-3)", textTransform: "capitalize" }}>{p.productType || "simple"}</span>,
            <span style={{ fontSize: 13 }}>{catName(p.categoryId || p.category_id)}</span>,
            <span className="tnum">{p.price != null ? G.money(p.price) : "—"}</span>,
            p.unit || "—",
            <span className="tnum">{p.par ?? "—"}</span>,
          ]}))}
          onEdit={openEdit} onDelete={del}
        />
      )}

      <MgmtModal open={modal} title={editing ? "Edit Product" : "Add Product"} onClose={() => setModal(false)} maxWidth={900}>
        <form onSubmit={save}>

          {/* ── Product type toggle ── */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>Product type</span>
            <div style={{ display: "inline-flex", background: "var(--surface-2)", borderRadius: 10, padding: 3, gap: 2 }}>
              {[["simple", "Simple product", "Single SKU with one price"], ["variable", "Variable product", "Multiple variants (size, flavor…)"]].map(([val, label, hint]) => (
                <button key={val} type="button" onClick={() => sf("productType", val)}
                  style={{ padding: "8px 20px", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13, transition: "all 0.15s", background: form.productType === val ? "var(--surface)" : "transparent", color: form.productType === val ? "var(--text)" : "var(--text-2)", boxShadow: form.productType === val ? "var(--shadow-sm)" : "none" }}>
                  {label}
                </button>
              ))}
            </div>
            {isVariable && (
              <div style={{ marginTop: 8, padding: "9px 14px", background: "oklch(0.95 0.05 270)", border: "1px solid oklch(0.88 0.06 270)", borderRadius: 9, fontSize: 12, color: "oklch(0.45 0.12 270)", fontWeight: 500 }}>
                Variable product — price, unit and par are set per variant. You can add variants after saving.
              </div>
            )}
          </div>

          {/* ── Main 2-col: fields left, images right ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>

            {/* Left — core fields */}
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <FieldRow label="Name *"><input style={inputStyle} value={form.name} onChange={e => sf("name", e.target.value)} required /></FieldRow>
                <FieldRow label="Brand"><input style={inputStyle} value={form.brand} onChange={e => sf("brand", e.target.value)} /></FieldRow>
              </div>
              <FieldRow label="Category *">
                <select style={{ ...inputStyle, appearance: "none" }} value={form.categoryId} onChange={e => sf("categoryId", e.target.value)} required>
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="Supplier *">
                <select style={{ ...inputStyle, appearance: "none" }} value={form.supplierId} onChange={e => sf("supplierId", e.target.value)} required>
                  <option value="">Select…</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </FieldRow>
              {!isVariable && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 14px" }}>
                  <FieldRow label="Selling price *" helper="Shown to customers">
                    <input style={inputStyle} type="number" step="0.01" min="0" value={form.price} onChange={e => sf("price", e.target.value)} required={!isVariable} placeholder="0.00" />
                  </FieldRow>
                  <FieldRow label="Unit *">
                    <select style={{ ...inputStyle, appearance: "none" }} value={form.unit} onChange={e => sf("unit", e.target.value)} required={!isVariable}>
                      <option value="">Select…</option>
                      <optgroup label="Weight">
                        <option value="g">g (gram)</option><option value="kg">kg</option>
                        <option value="oz">oz</option><option value="lb">lb</option>
                      </optgroup>
                      <optgroup label="Volume">
                        <option value="ml">ml</option><option value="L">L (litre)</option>
                        <option value="fl oz">fl oz</option>
                      </optgroup>
                      <optgroup label="Count">
                        <option value="each">each</option><option value="pack">pack</option>
                        <option value="box">box</option><option value="bag">bag</option>
                        <option value="bottle">bottle</option><option value="can">can</option>
                        <option value="bunch">bunch</option><option value="dozen">dozen</option>
                        <option value="serving">serving</option>
                      </optgroup>
                    </select>
                  </FieldRow>
                  <FieldRow label="Size"><input style={inputStyle} value={form.size} onChange={e => sf("size", e.target.value)} placeholder="500g" /></FieldRow>
                </div>
              )}
              {isVariable && (
                <FieldRow label="Size / display label"><input style={inputStyle} value={form.size} onChange={e => sf("size", e.target.value)} placeholder="e.g. Assorted sizes" /></FieldRow>
              )}
              {!isVariable && (
                <FieldRow label="Default par level *" helper="Starting point for shop inventory setup">
                  <input style={inputStyle} type="number" min="1" value={form.par} onChange={e => sf("par", e.target.value)} required={!isVariable} placeholder="20" />
                </FieldRow>
              )}
            </div>

            {/* Right — images */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Featured image */}
              <div>
                <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Featured Image</span>
                {form.featuredImage && (
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <img src={form.featuredImage} alt="preview" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)", display: "block" }} />
                    <button type="button" onClick={() => sf("featuredImage", "")}
                      style={{ position: "absolute", top: 8, right: 8, background: "rgba(220,53,69,0.88)", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                      Remove
                    </button>
                  </div>
                )}
                <label style={{ border: "2px dashed var(--line)", borderRadius: 10, padding: form.featuredImage ? "14px 16px" : "28px 16px", textAlign: "center", cursor: "pointer", color: "var(--text-3)", fontSize: 13, display: "block", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line)"}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{form.featuredImage ? "Replace featured image" : "Click to upload featured image"}</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>PNG, JPG</div>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                    const file = e.target.files[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => sf("featuredImage", ev.target.result);
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }} />
                </label>
              </div>

              {/* Gallery images */}
              <div>
                <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>
                  Gallery Images <span style={{ fontWeight: 400, color: "var(--text-3)" }}>({form.galleryImages.length})</span>
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
                  {form.galleryImages.map((img, i) => (
                    <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                      <img src={img} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)", display: "block" }} />
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, galleryImages: f.galleryImages.filter((_, j) => j !== i) }))}
                        style={{ position: "absolute", top: -7, right: -7, width: 19, height: 19, borderRadius: 999, background: "var(--red-500)", color: "#fff", border: "2px solid var(--surface)", cursor: "pointer", fontSize: 11, fontWeight: 900, display: "grid", placeItems: "center", lineHeight: 1 }}>
                        ×
                      </button>
                    </div>
                  ))}
                  <label style={{ width: 64, height: 64, border: "2px dashed var(--line)", borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--text-3)", fontSize: 24, flexShrink: 0, transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line)"}>
                    +
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={addGalleryImages} />
                  </label>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>Select multiple images at once or click + to add individually</div>
              </div>
            </div>
          </div>

          {/* ── Descriptions (full width) ── */}
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 20, paddingTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
            <FieldRow label="Short description" helper="2–3 lines shown on product cards">
              <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={form.shortDescription} onChange={e => sf("shortDescription", e.target.value)} placeholder="Fresh, locally sourced…" />
            </FieldRow>
            <FieldRow label="Full description" helper="Shown on the product detail page">
              <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={form.description} onChange={e => sf("description", e.target.value)} placeholder="Detailed product information, ingredients, storage tips…" />
            </FieldRow>
          </div>

          {err && <div style={{ color: "var(--red-500)", fontSize: 13, margin: "12px 0 0" }}>{err}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn full type="submit">{editing ? "Update" : "Create"}</Btn>
            <Btn full variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </form>
      </MgmtModal>
    </>
  );
}

export default function ManageCategoriesScreen() {
  const [tab, setTab] = useState("departments");
  const tabs = [
    { id: "departments", label: "Departments" },
    { id: "categories", label: "Categories" },
  ];

  return (
    <>
      <PageHead title="Manage Categories" subtitle="Departments · Categories" />
      <div style={{ flex: 1, padding: "22px 34px 48px", overflowY: "auto" }}>
        <div style={{ display: "flex", gap: 4, padding: "4px 6px", background: "var(--surface-2)", borderRadius: 12, marginBottom: 20, maxWidth: 320 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13.5, transition: "all .15s var(--ease)", background: tab === t.id ? "var(--surface)" : "transparent", color: tab === t.id ? "var(--text)" : "var(--text-2)", boxShadow: tab === t.id ? "var(--shadow-sm)" : "none" }}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "departments" && <DepartmentsTab />}
        {tab === "categories" && <CategoriesTab />}
      </div>
    </>
  );
}
