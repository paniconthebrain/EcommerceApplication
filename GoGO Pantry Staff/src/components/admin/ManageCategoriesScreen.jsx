import { useState, useEffect } from 'react';
import { G, API_BASE, authHeaders } from '../../globals.js';
import { Btn, Pill } from '../ui.jsx';
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

  const del = async d => {
    if (!confirm(`Delete department "${d.name}"?`)) return;
    const r = await fetch(`${API_BASE}/departments/${d.id}`, { method: "DELETE", headers: authHeaders() });
    if (r.ok) load(); else { const d2 = await r.json(); alert(d2.error || "Delete failed"); }
  };

  const zoneLabel = z => ({ frozen: "Frozen (−18°C)", chilled: "Chilled (4°C)", ambient: "Ambient (20°C)" }[z] || z);

  return (
    <>
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

  const load = async () => {
    setLoading(true);
    try { const r = await fetch(`${API_BASE}/categories`, { headers: authHeaders() }); if (r.ok) { const d = await r.json(); setItems(d); G.CATEGORIES = d.map(c => ({ id: c.id, name: c.name, hue: c.hue || 152 })); } }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ id: "", name: "", hue: 152, blurb: "" }); setErr(""); setModal(true); };
  const openEdit = c => { setEditing(c.id); setForm({ id: c.id, name: c.name, hue: c.hue || 152, blurb: c.blurb || "" }); setErr(""); setModal(true); };

  const save = async e => {
    e.preventDefault(); setErr("");
    const url = editing ? `${API_BASE}/categories/${editing}` : `${API_BASE}/categories`;
    const body = editing ? { name: form.name, hue: form.hue, blurb: form.blurb } : { id: form.id, name: form.name, hue: form.hue, blurb: form.blurb };
    const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { setModal(false); load(); } else { const d = await r.json(); setErr(d.message || d.error || "Save failed"); }
  };

  const del = async c => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    const r = await fetch(`${API_BASE}/categories/${c.id}`, { method: "DELETE", headers: authHeaders() });
    if (r.ok) load(); else { const d = await r.json(); alert(d.error || "Delete failed"); }
  };

  return (
    <>
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
  const [form, setForm] = useState({ name: "", brand: "", categoryId: "", supplierId: "", price: "", unit: "", par: "", size: "", costPrice: "", featuredImage: "" });
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

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

  const openCreate = () => { setEditing(null); setForm({ name: "", brand: "", categoryId: categories[0]?.id || "", supplierId: suppliers[0]?.id || "", price: "", unit: "", par: "", size: "", costPrice: "", featuredImage: "" }); setErr(""); setModal(true); };
  const openEdit = p => { setEditing(p.id); setForm({ name: p.name, brand: p.brand || "", categoryId: p.categoryId || p.category_id || "", supplierId: p.supplierId || p.supplier_id || "", price: p.price, unit: p.unit, par: p.par, size: p.size || "", costPrice: p.costPrice || p.cost_price || "", featuredImage: p.featuredImage || "" }); setErr(""); setModal(true); };

  const save = async e => {
    e.preventDefault(); setErr("");
    const payload = { ...form, price: parseFloat(form.price), par: parseInt(form.par), costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined, featuredImage: form.featuredImage || null };
    const url = editing ? `${API_BASE}/products/${editing}` : `${API_BASE}/products`;
    const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (r.ok) { setModal(false); load(); } else { const d = await r.json(); setErr(d.message || d.error || "Save failed"); }
  };

  const del = async p => {
    if (!confirm(`Delete product "${p.name}"?`)) return;
    const r = await fetch(`${API_BASE}/products/${p.id}`, { method: "DELETE", headers: authHeaders() });
    if (r.ok) load(); else { const d = await r.json(); alert(d.error || "Delete failed"); }
  };

  const catName = id => categories.find(c => c.id === id)?.name || id || "—";
  const filtered = q ? items.filter(p => p.name.toLowerCase().includes(q.toLowerCase())) : items;

  return (
    <>
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
          cols={["Name", "Category", "Price", "Unit", "Par"]}
          rows={filtered.map(p => ({ id: p.id, raw: p, cells: [
            <span style={{ fontWeight: 600 }}>{p.name}{p.brand ? <span style={{ fontWeight: 400, color: "var(--text-3)", fontSize: 12 }}> · {p.brand}</span> : null}</span>,
            <span style={{ fontSize: 13 }}>{catName(p.categoryId || p.category_id)}</span>,
            <span className="tnum">{G.money(p.price)}</span>,
            p.unit,
            <span className="tnum">{p.par}</span>,
          ]}))}
          onEdit={openEdit} onDelete={del}
        />
      )}
      <MgmtModal open={modal} title={editing ? "Edit Product" : "Add Product"} onClose={() => setModal(false)}>
        <form onSubmit={save}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <FieldRow label="Name *"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></FieldRow>
            <FieldRow label="Brand"><input style={inputStyle} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></FieldRow>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <FieldRow label="Category *">
              <select style={{ ...inputStyle, appearance: "none" }} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Supplier *">
              <select style={{ ...inputStyle, appearance: "none" }} value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} required>
                <option value="">Select…</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FieldRow>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <FieldRow label="Price *"><input style={inputStyle} type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required placeholder="0.00" /></FieldRow>
            <FieldRow label="Unit *"><input style={inputStyle} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required placeholder="lb" /></FieldRow>
            <FieldRow label="Par level *"><input style={inputStyle} type="number" min="1" value={form.par} onChange={e => setForm({ ...form, par: e.target.value })} required placeholder="20" /></FieldRow>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FieldRow label="Size"><input style={inputStyle} value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="500g" /></FieldRow>
            <FieldRow label="Cost price"><input style={inputStyle} type="number" step="0.01" min="0" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} placeholder="0.00" /></FieldRow>
          </div>
          <FieldRow label="Product Image">
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: "2px dashed var(--line)", cursor: "pointer", background: "var(--surface-2)", color: "var(--text-2)", fontSize: 13, fontWeight: 500 }}>
                <Icon name="plus" size={16} />
                {form.featuredImage ? "Change image" : "Upload image"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setForm(f => ({ ...f, featuredImage: ev.target.result }));
                  reader.readAsDataURL(file);
                }} />
              </label>
              {form.featuredImage && (
                <div style={{ position: "relative", width: 56, height: 56, borderRadius: 9, overflow: "hidden", border: "1px solid var(--line)", flexShrink: 0 }}>
                  <img src={form.featuredImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => setForm(f => ({ ...f, featuredImage: "" }))} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: 999, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "grid", placeItems: "center" }}>×</button>
                </div>
              )}
            </div>
          </FieldRow>
          {err && <div style={{ color: "var(--red-500)", fontSize: 13, margin: "10px 0" }}>{err}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
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
    { id: "products", label: "Products" },
  ];

  return (
    <>
      <PageHead title="Manage Categories" subtitle="Departments · Categories · Products" />
      <div style={{ flex: 1, padding: "22px 34px 48px", overflowY: "auto" }}>
        <div style={{ display: "flex", gap: 4, padding: "4px 6px", background: "var(--surface-2)", borderRadius: 12, marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 13.5, transition: "all .15s var(--ease)", background: tab === t.id ? "var(--surface)" : "transparent", color: tab === t.id ? "var(--text)" : "var(--text-2)", boxShadow: tab === t.id ? "var(--shadow-sm)" : "none" }}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "departments" && <DepartmentsTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "products" && <ProductsTab />}
      </div>
    </>
  );
}
