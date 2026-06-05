/* GoGO Pantry — Progress Indicator Component */

function ProgressIndicator({ currentStep, steps = ["Cart", "Checkout", "Confirm"] }) {
  return (
    <div style={{
      padding: "20px 16px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--line)"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: 16,
        justifyContent: "center"
      }}>
        {steps.map((step, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Step circle */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: index <= currentStep ? "var(--primary)" : "var(--surface-2)",
                color: index <= currentStep ? "var(--primary-ink)" : "var(--text-3)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 14,
                transition: "all 0.3s var(--ease)",
                border: `2px solid ${index <= currentStep ? "var(--primary)" : "var(--line)"}`
              }}
            >
              {index < currentStep ? (
                <IconC name="check" size={20} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Step label */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: index <= currentStep ? "var(--text)" : "var(--text-2)"
              }}>
                {step}
              </div>
            </div>

            {/* Divider (except on last step) */}
            {index < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: index < currentStep ? "var(--primary)" : "var(--line)",
                margin: "0 8px",
                minWidth: 40,
                transition: "all 0.3s var(--ease)"
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ProgressIndicator });
