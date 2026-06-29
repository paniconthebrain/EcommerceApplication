import { useState, useEffect } from 'react';
import { API_BASE, apiFetch } from '../../globals.js';
import { Btn, Pill, ConfirmDialog } from '../ui.jsx';
import { AdminPageWrap, MgmtModal } from './shared.jsx';

const STATUS_COLORS = {
  new:      { bg: 'var(--blue-100)',  color: 'var(--blue-700)'  },
  reviewed: { bg: 'var(--green-100)', color: 'var(--green-700)' },
  rejected: { bg: 'var(--red-100)',   color: 'var(--red-700)'   },
};

const th = { padding: '10px 14px', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textAlign: 'left', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' };
const td = { padding: '12px 14px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--line)', verticalAlign: 'top' };

export default function ManageApplicationsScreen() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiFetch(`${API_BASE}/careers/applications`);
      if (r?.ok) setApps(await r.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    await apiFetch(`${API_BASE}/careers/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (detail?.id === id) setDetail(d => ({ ...d, status }));
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    await apiFetch(`${API_BASE}/careers/applications/${id}`, { method: 'DELETE' });
    setApps(prev => prev.filter(a => a.id !== id));
    if (detail?.id === id) setDetail(null);
  };

  const downloadResume = async (id, filename) => {
    setResumeLoading(true);
    try {
      const r = await apiFetch(`${API_BASE}/careers/applications/${id}/resume`);
      if (!r?.ok) return;
      const data = await r.json();
      const link = document.createElement('a');
      link.href = data.resumeBase64;
      link.download = data.resumeFilename || filename || 'resume.pdf';
      link.click();
    } finally { setResumeLoading(false); }
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const counts = { all: apps.length, new: apps.filter(a => a.status === 'new').length, reviewed: apps.filter(a => a.status === 'reviewed').length, rejected: apps.filter(a => a.status === 'rejected').length };

  return (
    <>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete application?"
        body="This will permanently remove the application and resume. This cannot be undone."
        confirm="Delete"
        cancel="Keep"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <AdminPageWrap
        title="Job Applications"
        subtitle={`${apps.length} total application${apps.length !== 1 ? 's' : ''}`}
      >
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'new', 'reviewed', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20, border: '1.5px solid var(--line)', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
              background: filter === f ? 'var(--primary)' : 'var(--surface)',
              color: filter === f ? '#fff' : 'var(--text-2)',
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No applications found.</p>
        ) : (
          <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Position</th>
                  <th style={th}>Applied</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(a)}>
                    <td style={td}><span style={{ fontWeight: 600 }}>{a.name}</span></td>
                    <td style={td}>{a.email}</td>
                    <td style={td}>{a.position}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td style={td} onClick={e => e.stopPropagation()}>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={td} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" onClick={() => setDetail(a)}>View</Btn>
                        <Btn size="sm" variant="danger" onClick={() => handleDelete(a.id)}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPageWrap>

      {/* Detail modal */}
      <MgmtModal open={!!detail} title={detail?.name || ''} onClose={() => setDetail(null)} maxWidth={540}>
        {detail && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginBottom: 18 }}>
              <Info label="Email" value={detail.email} />
              <Info label="Phone" value={detail.phone || '—'} />
              <Info label="Position" value={detail.position} />
              <Info label="Applied" value={new Date(detail.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })} />
            </div>

            {detail.coverLetter && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', margin: '0 0 6px' }}>Cover Letter</p>
                <p style={{ fontSize: 13, color: 'var(--text)', background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 10, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{detail.coverLetter}</p>
              </div>
            )}

            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', margin: '0 0 8px' }}>Resume</p>
              <Btn onClick={() => downloadResume(detail.id, detail.resumeFilename)} loading={resumeLoading}>
                Download PDF — {detail.resumeFilename}
              </Btn>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', margin: '0 0 8px' }}>Update Status</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['new', 'reviewed', 'rejected'].map(s => (
                  <button key={s} onClick={() => handleStatus(detail.id, s)} style={{
                    padding: '7px 14px', borderRadius: 8, border: '1.5px solid var(--line)', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)',
                    background: detail.status === s ? STATUS_COLORS[s].bg : 'var(--surface)',
                    color: detail.status === s ? STATUS_COLORS[s].color : 'var(--text-2)',
                  }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </MgmtModal>
    </>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.new;
  return (
    <span style={{ ...c, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block' }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0 }}>{value}</p>
    </div>
  );
}
