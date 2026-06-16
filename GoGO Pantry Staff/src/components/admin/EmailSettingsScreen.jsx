import { useState, useEffect } from 'react';
import { API_BASE, apiFetch } from '../../globals.js';

export default function EmailSettingsScreen() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/email/templates`)
      .then(r => r && r.json())
      .then(d => {
        if (d?.templates?.length) {
          setTemplates(d.templates);
          const first = d.templates[0];
          setSelected(first);
          setSubject(first.subject);
          setBody(first.body);
          setEnabled(first.enabled);
        }
      })
      .catch(() => setMsg({ type: "error", text: "Failed to load templates." }));
  }, []);

  const selectTemplate = (tpl) => {
    setSelected(tpl); setSubject(tpl.subject); setBody(tpl.body); setEnabled(tpl.enabled); setMsg(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true); setMsg(null);
    try {
      const res = await apiFetch(`${API_BASE}/email/templates/${selected.type}`, {
        method: "PUT", body: JSON.stringify({ subject, body, enabled }),
      });
      if (!res?.ok) { const d = res ? await res.json().catch(() => ({})) : {}; setMsg({ type: "error", text: d.error || "Save failed." }); return; }
      const d = await res.json();
      setTemplates(prev => prev.map(t => t.type === selected.type ? d.template : t));
      setSelected(d.template);
      setMsg({ type: "success", text: "Template saved." });
    } catch { setMsg({ type: "error", text: "Network error." }); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    if (!testEmail || !selected) return;
    setTesting(true); setMsg(null);
    try {
      const res = await apiFetch(`${API_BASE}/email/test`, {
        method: "POST", body: JSON.stringify({ type: selected.type, to: testEmail }),
      });
      if (!res?.ok) { const d = res ? await res.json().catch(() => ({})) : {}; setMsg({ type: "error", text: d.error || "Test failed." }); return; }
      const d = await res.json();
      setMsg({ type: "success", text: d.message });
    } catch { setMsg({ type: "error", text: "Network error." }); }
    finally { setTesting(false); }
  };

  const placeholders = { password_reset: ["{{name}}", "{{reset_link}}"] };
  const cardStyle = { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 24 };

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Email Settings</h2>
      <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24 }}>Edit email templates sent to customers.</p>

      {msg && (
        <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 600,
          background: msg.type === "success" ? "#f0fdf4" : "var(--red-100)", color: msg.type === "success" ? "#15803d" : "#b91c1c",
          border: `1px solid ${msg.type === "success" ? "#bbf7d0" : "#fca5a5"}` }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>Templates</div>
          {templates.map(tpl => (
            <button key={tpl.type} onClick={() => selectTemplate(tpl)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none", background: selected?.type === tpl.type ? "var(--primary)" : "transparent", color: selected?.type === tpl.type ? "#fff" : "var(--text)", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", marginBottom: 2 }}>
              {tpl.label}
            </button>
          ))}
          {templates.length === 0 && <p style={{ color: "var(--text-3)", fontSize: 13 }}>No templates found.</p>}
        </div>

        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{selected.label}</span>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
                  Enabled
                </label>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>SUBJECT</div>
                <input value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>BODY (HTML)</div>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={14} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontFamily: "monospace", fontSize: 12.5, resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>AVAILABLE PLACEHOLDERS</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(placeholders[selected.type] || []).map(p => (
                    <code key={p} style={{ background: "var(--line)", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{p}</code>
                  ))}
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Save Template"}
              </button>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Send Test Email</div>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14 }}>Sends the template with sample data to verify your Gmail config is working.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="recipient@example.com" style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 14 }} />
                <button onClick={handleTest} disabled={testing || !testEmail} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, cursor: testing || !testEmail ? "not-allowed" : "pointer", opacity: testing || !testEmail ? 0.6 : 1 }}>
                  {testing ? "Sending…" : "Send Test"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
