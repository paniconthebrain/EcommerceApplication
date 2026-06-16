import { useState, useEffect } from 'react';
import { G, API_BASE, apiFetch } from '../../globals.js';
import { Btn, Pill } from '../ui.jsx';
import { AdminPageWrap, MgmtModal, FieldRow, inputStyle, MgmtTable } from './shared.jsx';

export default function ManageStaffScreen() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", shopId: "" });
  const [err, setErr] = useState("");
  const [resetInfo, setResetInfo] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiFetch(`${API_BASE}/staff`);
      if (r?.ok) setStaff(await r.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", email: "", password: "", phone: "", shopId: G.SHOPS[0]?.id || "" }); setErr(""); setModal(true); };
  const openEdit = s => { setEditing(s.id); setForm({ name: s.name, email: s.email, password: "", phone: s.phone || "", shopId: s.shopId || "" }); setErr(""); setModal(true); };

  const save = async e => {
    e.preventDefault(); setErr("");
    const url = editing ? `${API_BASE}/staff/${editing}` : `${API_BASE}/staff`;
    const body = editing ? { name: form.name, phone: form.phone, shopId: form.shopId } : form;
    const r = await apiFetch(url, { method: editing ? "PUT" : "POST", body: JSON.stringify(body) });
    if (r?.ok) { setModal(false); load(); }
    else { const d = r ? await r.json() : {}; setErr(d.message || d.error || "Save failed"); }
  };

  const del = async s => {
    if (!confirm(`Delete staff member "${s.name}"?`)) return;
    const r = await apiFetch(`${API_BASE}/staff/${s.id}`, { method: "DELETE" });
    if (r?.ok) load(); else alert("Delete failed");
  };

  const resetPw = async s => {
    if (!confirm(`Reset password for "${s.name}"? A temporary password will be generated.`)) return;
    const r = await apiFetch(`${API_BASE}/staff/${s.id}/reset-password`, { method: "POST" });
    if (r?.ok) { const d = await r.json(); setResetInfo(d); } else alert("Reset failed");
  };

  const shopName = id => G.SHOPS.find(s => s.id === id)?.name || id || "—";

  return (
    <AdminPageWrap title="Manage Staff" subtitle={`${staff.length} members`} action={<Btn size="sm" icon="plus" onClick={openCreate}>Add Staff</Btn>}>
      {loading ? <div style={{ color: "var(--text-3)", padding: 32, textAlign: "center" }}>Loading…</div> : (
        <MgmtTable
          cols={["Name", "Email", "Shop", "Status"]}
          rows={staff.map(s => ({ id: s.id, raw: s, cells: [
            <span style={{ fontWeight: 600 }}>{s.name}</span>,
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>{s.email}</span>,
            shopName(s.shopId),
            <Pill tone={s.status === "active" ? "ok" : "neutral"} size="sm">{s.status}</Pill>
          ]}))}
          onEdit={openEdit} onDelete={del}
          extraAction={s => <Btn size="sm" variant="soft" onClick={() => resetPw(s)}>Reset PW</Btn>}
        />
      )}
      <MgmtModal open={modal} title={editing ? "Edit Staff" : "Add Staff"} onClose={() => setModal(false)}>
        <form onSubmit={save}>
          <FieldRow label="Name *"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></FieldRow>
          {!editing && <FieldRow label="Email *"><input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></FieldRow>}
          {!editing && <FieldRow label="Password *"><input style={inputStyle} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></FieldRow>}
          <FieldRow label="Phone"><input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></FieldRow>
          <FieldRow label="Assigned Shop *">
            <select style={{ ...inputStyle, appearance: "none" }} value={form.shopId} onChange={e => setForm({ ...form, shopId: e.target.value })} required>
              <option value="">Select shop…</option>
              {G.SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FieldRow>
          {err && <div style={{ color: "var(--red-500)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn full type="submit">{editing ? "Update" : "Create"}</Btn>
            <Btn full variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
          </div>
        </form>
      </MgmtModal>
      <MgmtModal open={!!resetInfo} title="Password Reset" onClose={() => setResetInfo(null)}>
        {resetInfo && (
          <div>
            <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>New temporary password</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{resetInfo.temporaryPassword}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>Share this securely with {resetInfo.email}</div>
            </div>
            <Btn full onClick={() => setResetInfo(null)}>Done</Btn>
          </div>
        )}
      </MgmtModal>
    </AdminPageWrap>
  );
}
