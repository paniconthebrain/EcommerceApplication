import { G } from '../../globals.js';
import { Btn, PageHead, card, th, td } from '../ui.jsx';

export function AdminPageWrap({ title, subtitle, action, children }) {
  return (
    <>
      <PageHead title={title} subtitle={subtitle}>{action}</PageHead>
      <div style={{ flex: 1, padding: "22px 34px 48px", overflowY: "auto" }}>{children}</div>
    </>
  );
}

export function MgmtModal({ open, title, onClose, children, maxWidth = 460 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "grid", placeItems: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--surface)", borderRadius: 16, padding: 28, width: "100%", maxWidth, border: "1px solid var(--line)", boxShadow: "var(--shadow-lg)", maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--text)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-3)", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FieldRow({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

export const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box" };

export function MgmtTable({ cols, rows, onEdit, onDelete, extraAction }) {
  return (
    <div style={{ ...card(), padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--surface-2)" }}>
            {cols.map(c => <th key={c} style={{ ...th, fontWeight: 700 }}>{c}</th>)}
            <th style={{ ...th, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length + 1} style={{ ...td, textAlign: "center", color: "var(--text-3)", padding: 32 }}>No records yet</td></tr>
          ) : rows.map(r => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--line)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {r.cells.map((c, i) => <td key={i} style={td}>{c}</td>)}
              <td style={{ ...td, textAlign: "right" }}>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  {extraAction && extraAction(r.raw)}
                  <Btn size="sm" variant="soft" icon="edit" onClick={() => onEdit(r.raw)}>Edit</Btn>
                  <Btn size="sm" variant="danger" icon="trash" onClick={() => onDelete(r.raw)}>Delete</Btn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
