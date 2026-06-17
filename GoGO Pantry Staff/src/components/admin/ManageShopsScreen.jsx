import { useState, useEffect, useRef } from 'react';
import { G, API_BASE, STATIC_BASE, apiFetch, initializeAppData } from '../../globals.js';
import { Btn, Pill, ConfirmDialog } from '../ui.jsx';
import { AdminPageWrap, MgmtModal, FieldRow, inputStyle, MgmtTable } from './shared.jsx';

export default function ManageShopsScreen() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", city: "", code: "", hours: "", allowStaffPO: false, pickupTime: "" });
  const [err, setErr] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDel, setConfirmDel] = useState({ open: false, item: null });
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiFetch(`${API_BASE}/shops`);
      if (r?.ok) setShops(await r.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ id: "", name: "", city: "", code: "", hours: "", allowStaffPO: false, pickupTime: "" });
    setImageFile(null); setImagePreview(null); setCurrentImage(null);
    setErr(""); setModal(true);
  };

  const openEdit = s => {
    setEditing(s.id);
    setForm({ id: s.id, name: s.name, city: s.city, code: s.code, hours: s.hours || "", allowStaffPO: !!s.allowStaffPO, pickupTime: s.pickupTime || "" });
    setImageFile(null); setImagePreview(null);
    setCurrentImage(s.image ? `${STATIC_BASE}${s.image}` : null);
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
    const r = await apiFetch(`${API_BASE}/shops/${editing}/image`, { method: "DELETE" });
    if (r?.ok) { setCurrentImage(null); load(); }
    else setErr("Failed to remove image");
  };

  const save = async e => {
    e.preventDefault(); setErr("");
    const url = editing ? `${API_BASE}/shops/${editing}` : `${API_BASE}/shops`;
    const body = editing
      ? { name: form.name, city: form.city, code: form.code, hours: form.hours, allowStaffPO: form.allowStaffPO, pickupTime: form.pickupTime || null }
      : { ...form, pickupTime: form.pickupTime || null };
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

  const del = (s) => { setConfirmDel({ open: true, item: s }); };

  const doDel = async (s) => {
    setConfirmDel({ open: false, item: null });
    const r = await apiFetch(`${API_BASE}/shops/${s.id}`, { method: "DELETE" });
    if (r?.ok) load();
  };

  const displayPreview = imagePreview || currentImage;

  return (
    <>
    <ConfirmDialog
      open={confirmDel.open}
      title={`Delete "${confirmDel.item?.name}"?`}
      body="This shop and all associated inventory data will be permanently removed."
      confirm="Delete" tone="danger"
      onConfirm={() => doDel(confirmDel.item)}
      onCancel={() => setConfirmDel({ open: false, item: null })}
    />
    <AdminPageWrap title="Manage Shops" subtitle={`${shops.length} locations`} action={<Btn size="sm" icon="plus" onClick={openCreate}>Add Shop</Btn>}>
      {loading ? <div style={{ color: "var(--text-3)", padding: 32, textAlign: "center" }}>Loading...</div> : (
        <MgmtTable
          cols={["Image", "Name", "Code", "City", "Hours", "Pickup Time", "Staff POs"]}
          rows={shops.map(s => ({ id: s.id, raw: s, cells: [
            s.image
              ? <img src={`${STATIC_BASE}${s.image}`} alt={s.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
              : <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>&#x1F3EA;</div>,
            s.name,
            <span className="mono" style={{ fontSize: 12 }}>{s.code}</span>,
            s.city,
            s.hours || "-",
            s.pickupTime ? <Pill tone="ok" size="sm">{s.pickupTime}</Pill> : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Not set</span>,
            <Pill tone={s.allowStaffPO ? 'ok' : 'neutral'} size="sm">{s.allowStaffPO ? 'Enabled' : 'Admin only'}</Pill>,
          ]}))}
          onEdit={openEdit} onDelete={del}
        />
      )}
      <MgmtModal open={modal} title={editing ? "Edit Shop" : "Add Shop"} onClose={() => setModal(false)} maxWidth={820}>
        <form onSubmit={save}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
            {/* Left column — text fields */}
            <div>
              {!editing && <FieldRow label="Shop ID (short code, e.g. msn)"><input style={inputStyle} value={form.id} onChange={e => setForm({ ...form, id: e.target.value.toLowerCase() })} required placeholder="msn" /></FieldRow>}
              <FieldRow label="Name *"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Mission District" /></FieldRow>
              <FieldRow label="City *"><input style={inputStyle} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required placeholder="San Francisco" /></FieldRow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <FieldRow label="Code *"><input style={inputStyle} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="MSN" /></FieldRow>
                <FieldRow label="Hours"><input style={inputStyle} value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="9am-9pm" /></FieldRow>
              </div>
              <FieldRow label="Pickup time">
                <select style={inputStyle} value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })}>
                  <option value="">— Not set —</option>
                  <option value="5-15 min">5-15 min</option>
                  <option value="10-20 min">10-20 min</option>
                  <option value="15-30 min">15-30 min</option>
                  <option value="20-35 min">20-35 min</option>
                  <option value="30-45 min">30-45 min</option>
                  <option value="35-50 min">35-50 min</option>
                  <option value="45-60 min">45-60 min</option>
                  <option value="1-2 hr">1-2 hr</option>
                </select>
              </FieldRow>
              <FieldRow label="Staff can create POs">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', paddingTop: 4 }}>
                  <div onClick={() => setForm(f => ({ ...f, allowStaffPO: !f.allowStaffPO }))}
                    style={{ width: 42, height: 24, borderRadius: 999, background: form.allowStaffPO ? 'var(--primary)' : 'var(--surface-2)', border: '1px solid var(--line)', position: 'relative', transition: 'background .2s', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: form.allowStaffPO ? 20 : 3, width: 16, height: 16, borderRadius: 999, background: form.allowStaffPO ? '#fff' : 'var(--text-3)', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    {form.allowStaffPO ? 'Enabled' : 'Admin only'}
                  </span>
                </label>
              </FieldRow>
            </div>

            {/* Right column — image */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Shop Image</span>
              {displayPreview && (
                <div style={{ position: "relative", marginBottom: 8 }}>
                  <img src={displayPreview} alt="preview" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)", display: "block" }} />
                  <button type="button" onClick={imagePreview ? clearNewImage : removeCurrentImage}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(220,53,69,0.9)", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                    Remove
                  </button>
                  {imagePreview && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Will upload on save</div>}
                </div>
              )}
              <label style={{ border: "2px dashed var(--line)", borderRadius: 10, padding: "24px 16px", textAlign: "center", cursor: "pointer", color: "var(--text-3)", fontSize: 13, display: "block", flex: displayPreview ? "0" : "1" }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>&#x1F4F7;</div>
                <div style={{ fontWeight: 600 }}>{displayPreview ? "Upload different image" : "Click to upload image"}</div>
                <div style={{ fontSize: 11, marginTop: 3 }}>Any size · original quality</div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {err && <div style={{ color: "var(--red-500)", fontSize: 13, margin: "12px 0 0" }}>{err}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn full type="submit" disabled={uploading}>{uploading ? "Uploading..." : editing ? "Update" : "Create"}</Btn>
            <Btn full variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </form>
      </MgmtModal>
    </AdminPageWrap>
    </>
  );
}
