import { useState, useRef } from 'react';
import { API_BASE } from '../globals.js';
import { BtnC } from './ui.jsx';

const POSITIONS = [
  'Store Associate',
  'Cashier',
  'Delivery Driver',
  'Warehouse Staff',
  'Customer Service',
  'Shift Supervisor',
  'Store Manager',
  'Other',
];

const container = {
  minHeight: '100vh',
  background: 'var(--bg)',
  padding: '40px 16px 80px',
};

const card = {
  maxWidth: 640,
  margin: '0 auto',
  background: 'var(--surface)',
  borderRadius: 18,
  padding: '36px 36px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
};

const heading = {
  fontSize: 26,
  fontWeight: 800,
  color: 'var(--text)',
  margin: '0 0 6px',
};

const subtitle = {
  fontSize: 14,
  color: 'var(--text-2)',
  margin: '0 0 28px',
};

const label = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-2)',
  marginBottom: 5,
};

const input = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 14,
  border: '1.5px solid var(--line)',
  borderRadius: 10,
  background: 'var(--surface)',
  color: 'var(--text)',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box',
};

const fieldWrap = { marginBottom: 16 };

export function CareersPage({ onBack }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', coverLetter: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef = useRef(null);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file only'); e.target.value = ''; return; }
    if (f.size > 5 * 1024 * 1024) { setError('Resume must be under 5 MB'); e.target.value = ''; return; }
    setError('');
    setResumeFile(f);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (!form.email.includes('@')) return setError('Valid email is required');
    if (!form.position) return setError('Please select a position');
    if (!resumeFile) return setError('Please attach your resume (PDF)');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim());
      fd.append('phone', form.phone.trim());
      fd.append('position', form.position);
      fd.append('coverLetter', form.coverLetter.trim());
      fd.append('resume', resumeFile);

      const res = await fetch(`${API_BASE}/careers/apply`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Submission failed. Please try again.'); return; }
      setSuccess(true);
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={container}>
        <div style={card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-100)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: 32 }}>✓</span>
            </div>
            <h1 style={{ ...heading, textAlign: 'center' }}>Application submitted!</h1>
            <p style={{ ...subtitle, textAlign: 'center', marginBottom: 28 }}>
              Thanks {form.name.split(' ')[0]}! We'll review your application and be in touch soon.
            </p>
            <BtnC onClick={onBack}>← Back to home</BtnC>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={card}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 24, padding: 0, fontFamily: 'var(--font-sans)' }}>
          ← Back
        </button>

        <h1 style={heading}>Join our team</h1>
        <p style={subtitle}>We're always looking for passionate people to help us deliver fresh groceries to the community.</p>

        {error && (
          <div style={{ background: 'var(--red-100)', color: 'var(--red-700)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 18, border: '1px solid var(--red-300)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }} className="careers-row2">
            <div style={fieldWrap}>
              <label style={label}>Full name *</label>
              <input style={input} type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
            </div>
            <div style={fieldWrap}>
              <label style={label}>Email *</label>
              <input style={input} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>
          </div>

          {/* Phone + Position */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="careers-row2">
            <div style={fieldWrap}>
              <label style={label}>Phone</label>
              <input style={input} type="tel" value={form.phone} onChange={set('phone')} placeholder="0400 000 000" />
            </div>
            <div style={fieldWrap}>
              <label style={label}>Position applying for *</label>
              <select style={{ ...input, cursor: 'pointer' }} value={form.position} onChange={set('position')} required>
                <option value="">Select a role…</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Cover letter */}
          <div style={fieldWrap}>
            <label style={label}>Cover letter</label>
            <textarea
              style={{ ...input, height: 120, resize: 'vertical', lineHeight: 1.5 }}
              value={form.coverLetter}
              onChange={set('coverLetter')}
              placeholder="Tell us a bit about yourself and why you'd like to join GoGoPantry…"
            />
          </div>

          {/* Resume upload */}
          <div style={fieldWrap}>
            <label style={label}>Resume / CV * <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(PDF only, max 5 MB)</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--line)', borderRadius: 10, padding: '18px 20px', cursor: 'pointer', textAlign: 'center', background: resumeFile ? 'var(--green-100)' : 'var(--surface-2)', transition: 'background .15s' }}
            >
              {resumeFile ? (
                <span style={{ fontSize: 13, color: 'var(--green-700)', fontWeight: 600 }}>
                  ✓ {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
                </span>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Click to upload your PDF resume</span>
              )}
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} style={{ display: 'none' }} />
          </div>

          <BtnC full type="submit" loading={loading} style={{ marginTop: 8 }}>
            {loading ? 'Submitting…' : 'Submit application'}
          </BtnC>
        </form>
      </div>
    </div>
  );
}
