import { useState, useEffect } from 'react';
import { API_BASE, apiFetch } from '../../globals.js';
import { Btn, Pill, ConfirmDialog } from '../ui.jsx';
import { AdminPageWrap, MgmtModal, MgmtTable, FieldRow, inputStyle } from './shared.jsx';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
const DELIVERY_MODELS = [
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'dsd', label: 'Direct Store Delivery (DSD)' },
  { value: 'local_perishable', label: 'Local Perishable' },
];

const EMPTY_FORM = { name: '', type: '', contactName: '', email: '', phone: '', leadTime: '', deliveryModel: 'wholesale', deliveryDays: [], minimumOrderAmount: '', paymentTerms: '' };

export default function ManageSuppliersScreen() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState({ open: false, item: null });

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/suppliers`);
      if (res?.ok) setSuppliers(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErr('');
    setModal(true);
  }

  function openEdit(s) {
    setEditing(s.id);
    setForm({
      name: s.name || '',
      type: s.type || '',
      contactName: s.contactName || '',
      email: s.email || '',
      phone: s.phone || '',
      leadTime: s.leadTime || '',
      deliveryModel: s.deliveryModel || 'wholesale',
      deliveryDays: Array.isArray(s.deliveryDays) ? s.deliveryDays : [],
      minimumOrderAmount: s.minimumOrderAmount != null ? String(s.minimumOrderAmount) : '',
      paymentTerms: s.paymentTerms || '',
    });
    setErr('');
    setModal(true);
  }

  function handleDelete(s) {
    setConfirmDel({ open: true, item: s });
  }

  async function doDelete(s) {
    setConfirmDel({ open: false, item: null });
    try {
      await apiFetch(`${API_BASE}/suppliers/${s.id}`, { method: 'DELETE' });
      load();
    } catch { /* ignore */ }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const payload = {
        ...form,
        minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : null,
      };
      const url = editing ? `${API_BASE}/suppliers/${editing}` : `${API_BASE}/suppliers`;
      const method = editing ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (!res || !res.ok) { const d = await res?.json(); setErr(d?.error || 'Failed to save'); return; }
      setModal(false);
      load();
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  }

  function toggleDay(day) {
    setForm(f => ({
      ...f,
      deliveryDays: f.deliveryDays.includes(day)
        ? f.deliveryDays.filter(d => d !== day)
        : [...f.deliveryDays, day],
    }));
  }

  const rows = suppliers.map(s => ({
    id: s.id,
    raw: s,
    cells: [
      <div>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.type}</div>
      </div>,
      <div style={{ fontSize: 13 }}>
        <div style={{ fontWeight: 600 }}>{s.contactName || '—'}</div>
        <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{s.email}</div>
      </div>,
      <span style={{ fontSize: 13 }}>{s.leadTime || '—'}</span>,
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {(Array.isArray(s.deliveryDays) ? s.deliveryDays : []).map(d => (
          <Pill key={d} tone="neutral" size="sm">{DAY_LABELS[d] || d}</Pill>
        ))}
      </div>,
      <span style={{ fontSize: 13 }}>{s.minimumOrderAmount ? `$${s.minimumOrderAmount}` : '—'}</span>,
    ],
  }));

  return (
    <>
      <ConfirmDialog
        open={confirmDel.open}
        title={`Delete "${confirmDel.item?.name}"?`}
        body="This supplier and all associated data will be permanently removed."
        confirm="Delete" tone="danger"
        onConfirm={() => doDelete(confirmDel.item)}
        onCancel={() => setConfirmDel({ open: false, item: null })}
      />
      <AdminPageWrap
        title="Suppliers"
        subtitle={loading ? 'Loading…' : `${suppliers.length} supplier${suppliers.length !== 1 ? 's' : ''}`}
        action={<Btn size="sm" icon="plus" onClick={openCreate}>Add supplier</Btn>}
      >
        <MgmtTable
          cols={['Supplier', 'Contact', 'Lead time', 'Delivery days', 'Min. order']}
          rows={rows}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </AdminPageWrap>

      <MgmtModal open={modal} title={editing ? 'Edit supplier' : 'Add supplier'} onClose={() => setModal(false)}>
        <form onSubmit={handleSubmit}>
          <FieldRow label="Supplier name *">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="e.g. Fresh Farms Co." />
          </FieldRow>
          <FieldRow label="Type *">
            <input required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle} placeholder="e.g. Produce, Dairy, Bakery" />
          </FieldRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldRow label="Contact name *">
              <input required value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} style={inputStyle} placeholder="Jane Smith" />
            </FieldRow>
            <FieldRow label="Phone *">
              <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="(555) 000-0000" />
            </FieldRow>
          </div>
          <FieldRow label="Email *">
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="orders@supplier.com" />
          </FieldRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldRow label="Lead time *">
              <input required value={form.leadTime} onChange={e => setForm(f => ({ ...f, leadTime: e.target.value }))} style={inputStyle} placeholder="e.g. 2 days, Daily" />
            </FieldRow>
            <FieldRow label="Delivery model *">
              <select required value={form.deliveryModel} onChange={e => setForm(f => ({ ...f, deliveryModel: e.target.value }))} style={inputStyle}>
                {DELIVERY_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </FieldRow>
          </div>
          <FieldRow label="Delivery days *">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {DAYS.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    borderColor: form.deliveryDays.includes(day) ? 'var(--primary)' : 'var(--line)',
                    background: form.deliveryDays.includes(day) ? 'var(--primary)' : 'transparent',
                    color: form.deliveryDays.includes(day) ? 'white' : 'var(--text-2)' }}>
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </FieldRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldRow label="Min. order ($)">
              <input type="number" min="0" step="0.01" value={form.minimumOrderAmount} onChange={e => setForm(f => ({ ...f, minimumOrderAmount: e.target.value }))} style={inputStyle} placeholder="0.00" />
            </FieldRow>
            <FieldRow label="Payment terms">
              <input value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} style={inputStyle} placeholder="e.g. net30, cod" />
            </FieldRow>
          </div>
          {err && <div style={{ color: 'var(--red-500)', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Btn variant="ghost" full onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" full style={{ opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add supplier'}</Btn>
          </div>
        </form>
      </MgmtModal>
    </>
  );
}
