import { useState, useEffect, useRef } from 'react';
import { G, API_BASE, apiFetch, authHeaders, initializeAppData } from '../../globals.js';
import { Btn, Pill } from '../ui.jsx';
import { AdminPageWrap, MgmtModal, FieldRow, inputStyle, MgmtTable } from './shared.jsx';

export default function ManageShopsScreen() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", city: "", code: "", hours: "" });
  const [err, setErr] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/shops`, { headers: authHeaders() });
      if (r.ok) setShops(await r.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ id: "", name: "", city: "", code: "", hours: "" });
    setImageFile(null); setImagePreview(null); setCurrentImage(null);
    setErr(""); setModal(true);
  };

  const openEdit = s => {
    setEditing(s.id);
    setForm({ id: s.id, name: s.name, city: s.city, code: s.code, hours: s.hours || "" });
    setImageFile(null); setImagePreview(null);
    setCurrentImage(s.image ? `http://localhost:3000${s.image}` : null);
    setErr(""); setModal(true);
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearNewImage = () => {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeCurrentImage = async () => {
    if (!editing) return;
    const r = await fetch(`${API_BASE}/shops/${editing}/image`, {
      method: "DELETE", headers: { Authorization: `Bearer ${G.token}` },
    });
    if (r.ok) { setCurrentImage(null); load(); }
    else setErr("Failed to remove image");
  };

  const save = async e => {
    e.preventDefault(); setErr("");
    const url = editing ? `${API_BASE}/shops/${editing}` : `${API_BASE}/shops`;
    const body = editing ? { name: form.name, city: form.city, code: form.code, hours: form.hours } : form;
    const r = await apiFetch(url, { method: editing ? "PUT" : "POST", body: JSON.stringify(body) });
    if (!r || !r.ok) { const d = r ? await r.json() : {}; setErr(d.message || d.error || "Save failed"); return; }
    const saved = await r.json();
    const shopId = editing || saved.id;

    if (imageFile && shopId) {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", imageFile);
      const ir = await apiFetch(`${API_BASE}/shops/${shopId}/image`, { method: "POST", body: fd });
      setUploading(false);
      if (!ir || !ir.ok) { setErr("Shop saved but image upload failed"); load(); return; }
    }

    setModal(false); load(); G.SHOPS = []; initializeAppData();
  };

  const del = async s => {
    if (!confirm(`Delete shop "${s.name}"?`)) return;
    const r = await fetch(`${API_BASE}/shops/${s.id}`, { method: "DELETE", headers: authHeaders() });
    if (r.ok) load(); else alert("Delete failed");
  };

  const displayPreview = imagePreview || currentImage;

  return (
    <AdminPageWrap title="Manage Shops" subtitle={`${shops.length} locations`} action={<Btn size="sm" icon="plus" onClick={openCreate}>Add Shop</Btn>}>
      {loading ? <div style={{ color: "var(--text-3)", padding: 32, textAlign: "center" }}>Loading…</div> : (
        <MgmtTable
          cols={["Image", "Name", "Code", "City", "Hours"]}
          rows={shops.map(s => ({ id: s.id, raw: s, cells: [
            s.image
              ? <img src={`http://localhost:3000${s.image}`} alt={s.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
              : <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏪</div>,
            s.name,
            <span className="mono" style={{ fontSize: 12 }}>{s.code}</span>,
            s.city,
            s.hours || "—",
          ]}))}
          onEdit={openEdit} onDelete={del}
        />
      )}
      <MgmtModal open={modal} title={editing ? "Edit Shop" : "Add Shop"} onClose={() => setModal(false)}>
        <form onSubmit={save}>
          {!editing && <FieldRow label="Shop ID (short code, e.g. msn)"><input style={inputStyle} value={form.id} onChange={e => setForm({ ...form, id: e.target.value.toLowerCase() })} required placeholder="msn" /></FieldRow>}
          <FieldRow label="Name *"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Mission District" /></FieldRow>
          <FieldRow label="City *"><input style={inputStyle} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required placeholder="San Francisco" /></FieldRow>
          <FieldRow label="Code *"><input style={inputStyle} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="MSN" /></FieldRow>
          <FieldRow label="Hours"><input style={inputStyle} value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="9am–9pm" /></FieldRow>

          <FieldRow label="Shop Image">
            <div>
              {displayPreview && (
                <div style={{ position: "relative", marginBottom: 8 }}>
                  <img src={displayPreview} alt="preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)", display: "block" }} />
                  <button type="button" onClick={imagePreview ? clearNewImage : removeCurrentImage}
                    style={{ position: "absolute", top: 6, right: 6, background: "rgba(220,53,69,0.9)", color: "#fff", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                    Remove
                  </button>
                  {imagePreview && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Will upload on save</div>}
                </div>
              )}
              {!imagePreview && (
                <label style={{ border: "2px dashed var(--line)", borderRadius: 8, padding: "16px", textAlign: "center", cursor: "pointer", color: "var(--text-3)", fontSize: 13, display: "block" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                  <div style={{ fontWeight: 600 }}>Click to upload image</div>
                  <div style={{ fontSize: 11 }}>Any size — original quality preserved</div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </label>
              )}
            </div>
          </FieldRow>

          {err && <div style={{ color: "var(--red-500)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn full type="submit" disabled={uploading}>{uploading ? "Uploading…" : editing ? "Update" : "Create"}</Btn>
            <Btn full variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </form>
      </MgmtModal>
    </AdminPageWrap>
  );
}
