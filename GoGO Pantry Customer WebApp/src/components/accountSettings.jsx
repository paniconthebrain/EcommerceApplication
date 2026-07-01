import { useEffect, useState } from 'react';
import { API_BASE, customerFetch } from '../globals.js';
import { BtnC, BadgeC, AuthField, authInputStyle, useToast, ToastContainer, ConfirmDialog, EmptyState } from './ui.jsx';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const container = {
  minHeight: '100vh',
  background: 'var(--bg)',
  padding: '40px 16px 80px',
};

const wrap = {
  maxWidth: 640,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const heading = {
  fontSize: 26,
  fontWeight: 800,
  color: 'var(--text)',
  margin: '0 0 4px',
};

const card = {
  background: 'var(--surface)',
  borderRadius: 18,
  padding: '28px 32px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
};

const sectionTitle = {
  fontSize: 16,
  fontWeight: 800,
  color: 'var(--text)',
  margin: '0 0 18px',
};

function ErrorBanner({ msg }) {
  return (
    <div style={{ background: 'var(--red-100)', color: 'var(--red-700)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14, border: '1px solid var(--red-300)' }}>
      {msg}
    </div>
  );
}

/* ── Profile section ── */
function ProfileSection({ user, onUserUpdate, toast }) {
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    try {
      const res = await customerFetch(`${API_BASE}/customers/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error || 'Failed to update profile'); return; }
      const updated = { ...user, ...data.customer };
      localStorage.setItem('customerAuth', JSON.stringify(updated));
      onUserUpdate(updated);
      toast('Profile updated');
    } catch {
      setError('Unable to connect to server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={card}>
      <h2 style={sectionTitle}>Profile</h2>
      {error && <ErrorBanner msg={error} />}
      <form onSubmit={handleSubmit}>
        <AuthField label="Full name">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={authInputStyle} />
        </AuthField>
        <AuthField label="Phone">
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={authInputStyle} placeholder="(555) 000-0000" />
        </AuthField>
        <BtnC type="submit" loading={saving}>Save changes</BtnC>
      </form>
    </div>
  );
}

/* ── Password section ── */
function PasswordSection({ toast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.currentPassword || !form.newPassword) { setError('All fields are required'); return; }
    if (!PASSWORD_REGEX.test(form.newPassword)) {
      setError('New password must be at least 8 characters with uppercase, lowercase, and a number');
      return;
    }
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match'); return; }

    setSaving(true);
    try {
      const res = await customerFetch(`${API_BASE}/customers/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      if (!res) return;
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error || 'Failed to change password'); return; }
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast('Password updated');
    } catch {
      setError('Unable to connect to server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={card}>
      <h2 style={sectionTitle}>Change password</h2>
      {error && <ErrorBanner msg={error} />}
      <form onSubmit={handleSubmit}>
        <AuthField label="Current password">
          <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} style={authInputStyle} autoComplete="current-password" />
        </AuthField>
        <AuthField label="New password">
          <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} style={authInputStyle} autoComplete="new-password" />
        </AuthField>
        <AuthField label="Confirm new password">
          <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} style={authInputStyle} autoComplete="new-password" />
        </AuthField>
        <BtnC type="submit" loading={saving}>Update password</BtnC>
      </form>
    </div>
  );
}

/* ── Address book section ── */
const emptyAddressForm = { label: '', address: '', city: '', zipCode: '', isDefault: false };

function AddressForm({ initial, onCancel, onSave, saving }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.address.trim() || !form.city.trim() || !form.zipCode.trim()) {
      setError('Address, city, and zip code are required');
      return;
    }
    const ok = await onSave(form);
    if (!ok) setError('Failed to save address');
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      {error && <ErrorBanner msg={error} />}
      <AuthField label="Label (optional)">
        <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} style={authInputStyle} placeholder="Home, Work, etc." />
      </AuthField>
      <AuthField label="Address">
        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={authInputStyle} />
      </AuthField>
      <div style={{ display: 'flex', gap: 12 }}>
        <AuthField label="City">
          <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={authInputStyle} />
        </AuthField>
        <AuthField label="Zip code">
          <input value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} style={authInputStyle} />
        </AuthField>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 13.5, color: 'var(--text-2)', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
        Set as default address
      </label>
      <div style={{ display: 'flex', gap: 10 }}>
        <BtnC type="submit" loading={saving}>Save address</BtnC>
        <BtnC type="button" variant="ghost" onClick={onCancel}>Cancel</BtnC>
      </div>
    </form>
  );
}

function AddressSection({ toast }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // null | 'new' | address id
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadAddresses = async () => {
    const res = await customerFetch(`${API_BASE}/customers/addresses`);
    if (!res || !res.ok) return;
    setAddresses(await res.json());
  };

  useEffect(() => {
    setLoading(true);
    loadAddresses().finally(() => setLoading(false));
  }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isNew = editingId === 'new';
      const res = await customerFetch(
        isNew ? `${API_BASE}/customers/addresses` : `${API_BASE}/customers/addresses/${editingId}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      if (!res || !res.ok) return false;
      await loadAddresses();
      setEditingId(null);
      toast(isNew ? 'Address added' : 'Address updated');
      return true;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    const res = await customerFetch(`${API_BASE}/customers/addresses/${id}`, { method: 'DELETE' });
    if (res && res.ok) {
      await loadAddresses();
      toast('Address removed');
    }
  };

  const handleSetDefault = async (id) => {
    const res = await customerFetch(`${API_BASE}/customers/addresses/${id}/default`, { method: 'PATCH' });
    if (res && res.ok) {
      await loadAddresses();
      toast('Default address updated');
    }
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ ...sectionTitle, margin: 0 }}>Saved addresses</h2>
        {editingId === null && (
          <BtnC size="sm" variant="soft" onClick={() => setEditingId('new')}>Add address</BtnC>
        )}
      </div>

      {editingId === 'new' && (
        <AddressForm initial={emptyAddressForm} saving={saving} onCancel={() => setEditingId(null)} onSave={handleSave} />
      )}

      {loading && <div style={{ fontSize: 13.5, color: 'var(--text-3)' }}>Loading addresses…</div>}

      {!loading && addresses.length === 0 && editingId !== 'new' && (
        <EmptyState
          icon="pin"
          title="No saved addresses"
          sub="Add an address to speed up checkout in the future."
          action={<BtnC size="sm" onClick={() => setEditingId('new')}>Add address</BtnC>}
        />
      )}

      {addresses.map(addr => (
        editingId === addr.id ? (
          <AddressForm
            key={addr.id}
            initial={{ label: addr.label || '', address: addr.address, city: addr.city, zipCode: addr.zipCode, isDefault: addr.isDefault }}
            saving={saving}
            onCancel={() => setEditingId(null)}
            onSave={handleSave}
          />
        ) : (
          <div key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{addr.label || 'Address'}</span>
                {addr.isDefault && <BadgeC tone="success" size="sm">Default</BadgeC>}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{addr.address}, {addr.city} {addr.zipCode}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {!addr.isDefault && (
                <BtnC size="sm" variant="ghost" onClick={() => handleSetDefault(addr.id)}>Set default</BtnC>
              )}
              <BtnC size="sm" variant="ghost" onClick={() => setEditingId(addr.id)}>Edit</BtnC>
              <BtnC size="sm" variant="danger" onClick={() => setDeleteTarget(addr.id)}>Delete</BtnC>
            </div>
          </div>
        )
      ))}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this address?"
        body="This can't be undone."
        confirm="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export function AccountSettingsPage({ user, onUserUpdate }) {
  const { toasts, toast, dismiss } = useToast();

  return (
    <div style={container}>
      <div style={wrap}>
        <h1 style={heading}>Account Settings</h1>
        <ProfileSection user={user} onUserUpdate={onUserUpdate} toast={toast} />
        <PasswordSection toast={toast} />
        <AddressSection toast={toast} />
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
