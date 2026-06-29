export function PrivacyPolicy() {
  const EFFECTIVE_DATE = 'June 29, 2026';

  const SectionHeading = ({ num, title }) => (
    <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 14px', display: 'flex', gap: 12, alignItems: 'baseline' }}>
      <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--primary)', background: 'var(--primary-soft)', borderRadius: 8, padding: '3px 9px', flexShrink: 0 }}>{num}</span>
      {title}
    </h2>
  );

  const body = { fontSize: 15, color: 'var(--text-2)', lineHeight: 1.8, margin: 0 };
  const ul = { paddingLeft: 20, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 };
  const li = { fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7 };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 32px) 64px' }}>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--surface-2)', border: '1px solid var(--line)',
          borderRadius: 999, padding: '5px 16px', marginBottom: 20, fontSize: 12,
          fontWeight: 700, color: 'var(--text-3)',
        }}>
          Effective Date: {EFFECTIVE_DATE}
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', margin: '0 0 16px' }}>
          Privacy Policy
        </h1>
        <p style={{ ...body }}>
          Welcome to GoGo Pantry (<a href="https://www.gogopantry.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>gogopantry.com</a>).
          We value your privacy and are committed to protecting your personal information. This Privacy Policy
          outlines how we collect, use, and safeguard your data when you visit our website or interact with us online.
        </p>
      </div>

      {/* Disclaimer banner */}
      <div style={{
        background: 'oklch(0.97 0.03 55)', border: '1.5px solid oklch(0.85 0.08 55)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 48,
        fontSize: 13, color: 'oklch(0.4 0.08 55)', lineHeight: 1.65,
      }}>
        <strong>Note:</strong> This is a standard retail privacy policy template. Please review it with a
        legal professional to ensure full compliance with applicable state and federal laws.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* 1 */}
        <section>
          <SectionHeading num="1" title="Information We Collect" />
          <p style={body}>
            We may collect personal information that you voluntarily provide to us, including:
          </p>
          <ul style={ul}>
            <li style={li}>
              <strong style={{ color: 'var(--text)' }}>Contact Information</strong> — Name, email address, phone number, or
              physical address if you contact us through our website.
            </li>
            <li style={li}>
              <strong style={{ color: 'var(--text)' }}>Usage Data</strong> — Information about how you interact with our
              website, including your IP address, browser type, and pages visited, collected via standard cookies.
            </li>
          </ul>
        </section>

        <div style={{ height: 1, background: 'var(--line)' }} />

        {/* 2 */}
        <section>
          <SectionHeading num="2" title="How We Use Your Information" />
          <p style={body}>We use the information we collect to:</p>
          <ul style={ul}>
            <li style={li}>Respond to your customer inquiries or feedback.</li>
            <li style={li}>Improve our website experience and store offerings.</li>
            <li style={li}>Share store updates, promotions, or news — only if you opt in to receive them.</li>
          </ul>
        </section>

        <div style={{ height: 1, background: 'var(--line)' }} />

        {/* 3 */}
        <section>
          <SectionHeading num="3" title="Information Sharing & Disclosure" />
          <p style={body}>
            GoGo Pantry does <strong style={{ color: 'var(--text)' }}>not</strong> sell, rent, or trade your personal
            information to third parties. We may share information with trusted third-party service providers who assist
            us in operating our website, so long as those parties agree to keep this information confidential. We may
            also release information when required to comply with law enforcement or to protect our rights.
          </p>
        </section>

        <div style={{ height: 1, background: 'var(--line)' }} />

        {/* 4 */}
        <section>
          <SectionHeading num="4" title="Third-Party Links" />
          <p style={body}>
            Our website may contain links to third-party platforms, such as our Instagram profile or mapping services.
            These external sites have separate and independent privacy policies. We hold no responsibility or liability
            for the content and activities of these linked sites.
          </p>
        </section>

        <div style={{ height: 1, background: 'var(--line)' }} />

        {/* 5 */}
        <section>
          <SectionHeading num="5" title="Security of Your Information" />
          <p style={body}>
            We implement reasonable security measures to maintain the safety of your personal information when you
            enter, submit, or access your data. However, please remember that no method of transmission over the
            internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <div style={{ height: 1, background: 'var(--line)' }} />

        {/* 6 */}
        <section>
          <SectionHeading num="6" title="Changes to This Privacy Policy" />
          <p style={body}>
            GoGo Pantry reserves the right to update this Privacy Policy at any time. Any changes will be posted
            directly on this page with an updated effective date. We encourage you to review this page periodically
            to stay informed.
          </p>
        </section>

        <div style={{ height: 1, background: 'var(--line)' }} />

        {/* 7 */}
        <section>
          <SectionHeading num="7" title="Contact Us" />
          <p style={{ ...body, marginBottom: 20 }}>
            If you have any questions regarding this Privacy Policy, you may contact us via our website or visit
            us in person:
          </p>
          <div style={{
            background: 'oklch(0.13 0.022 152)', borderRadius: 18, padding: '24px 28px', color: '#fff',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>GoGo Pantry</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              12324 W North Ave<br />
              Wauwatosa, Wisconsin 53226<br />
              <a href="https://www.gogopantry.com" style={{ color: 'oklch(0.72 0.15 152)', fontWeight: 600 }}>
                gogopantry.com
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
