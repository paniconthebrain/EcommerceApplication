export function TermsOfService() {
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
          Terms of Service
        </h1>
        <p style={body}>
          Welcome to GoGo Pantry. By accessing or using our website at{' '}
          <a href="https://www.gogopantry.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>gogopantry.com</a>{' '}
          or placing an order through our platform, you agree to be bound by these Terms of Service.
          Please read them carefully before using our services.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: 'oklch(0.97 0.03 55)', border: '1.5px solid oklch(0.85 0.08 55)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 48,
        fontSize: 13, color: 'oklch(0.4 0.08 55)', lineHeight: 1.65,
      }}>
        <strong>Note:</strong> These terms are based on a standard retail service agreement. We recommend
        reviewing them with a legal professional to ensure full compliance with applicable laws.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* 1 */}
        <section>
          <SectionHeading num="1" title="Acceptance of Terms" />
          <p style={body}>
            By using GoGo Pantry's website, mobile platform, or online ordering service, you confirm that you
            are at least 18 years of age (or have parental consent) and have the legal capacity to enter into
            a binding agreement. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        {/* 2 */}
        <section>
          <SectionHeading num="2" title="Our Services" />
          <p style={body}>
            GoGo Pantry provides an online platform that allows customers to browse products, place orders for
            in-store pickup, and manage their accounts. We reserve the right to:
          </p>
          <ul style={ul}>
            <li style={li}>Modify, suspend, or discontinue any part of the service at any time without notice.</li>
            <li style={li}>Limit the availability of products or services to any person or geographic area.</li>
            <li style={li}>Refuse service to anyone for any reason at our discretion.</li>
            <li style={li}>Update product pricing and availability without prior notice.</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <SectionHeading num="3" title="Orders and Payment" />
          <p style={body}>
            When you place an order through GoGo Pantry, you are making an offer to purchase goods subject
            to these terms. Orders are confirmed once you receive an order confirmation. We reserve the right
            to cancel orders due to:
          </p>
          <ul style={ul}>
            <li style={li}>Product unavailability or stock discrepancies at the time of pickup.</li>
            <li style={li}>Pricing errors or inaccuracies on the platform.</li>
            <li style={li}>Suspected fraudulent or unauthorised activity.</li>
          </ul>
          <p style={{ ...body, marginTop: 14 }}>
            All prices are displayed in Australian Dollars (AUD) and include GST where applicable. Payment is
            processed securely at the time of order placement.
          </p>
        </section>

        {/* 4 */}
        <section>
          <SectionHeading num="4" title="Pickup Policy" />
          <p style={body}>
            GoGo Pantry currently offers in-store pickup only. Home delivery is not yet available. By selecting
            a pickup time slot, you agree to collect your order within the nominated time window. Uncollected
            orders may be restocked after 60 minutes past the end of your selected slot. We are not responsible
            for any loss arising from failure to collect your order on time.
          </p>
        </section>

        {/* 5 */}
        <section>
          <SectionHeading num="5" title="User Accounts" />
          <p style={body}>
            To place orders, you may be required to create an account. You are responsible for:
          </p>
          <ul style={ul}>
            <li style={li}>Maintaining the confidentiality of your login credentials.</li>
            <li style={li}>All activity that occurs under your account.</li>
            <li style={li}>Notifying us immediately of any unauthorised use of your account.</li>
          </ul>
          <p style={{ ...body, marginTop: 14 }}>
            GoGo Pantry reserves the right to suspend or terminate accounts that violate these terms or engage
            in fraudulent behaviour.
          </p>
        </section>

        {/* 6 */}
        <section>
          <SectionHeading num="6" title="Intellectual Property" />
          <p style={body}>
            All content on the GoGo Pantry platform — including but not limited to logos, product images, text,
            and software — is the property of GoGo Pantry Pty Ltd or its licensors and is protected by
            applicable intellectual property laws. You may not reproduce, distribute, or create derivative works
            from our content without express written permission.
          </p>
        </section>

        {/* 7 */}
        <section>
          <SectionHeading num="7" title="Limitation of Liability" />
          <p style={body}>
            To the maximum extent permitted by law, GoGo Pantry shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising from your use of or inability to use our services.
            Our total liability for any claim arising out of or relating to these terms shall not exceed the
            value of the order giving rise to the claim.
          </p>
        </section>

        {/* 8 */}
        <section>
          <SectionHeading num="8" title="Prohibited Conduct" />
          <p style={body}>
            You agree not to use our platform to:
          </p>
          <ul style={ul}>
            <li style={li}>Violate any applicable laws or regulations.</li>
            <li style={li}>Submit false, misleading, or fraudulent information.</li>
            <li style={li}>Interfere with or disrupt the platform's operation or security.</li>
            <li style={li}>Attempt to gain unauthorised access to any part of our systems.</li>
            <li style={li}>Use automated tools, bots, or scrapers to access our platform without permission.</li>
          </ul>
        </section>

        {/* 9 */}
        <section>
          <SectionHeading num="9" title="Governing Law" />
          <p style={body}>
            These Terms of Service are governed by and construed in accordance with the laws of the State of
            Wisconsin, United States. Any disputes arising from these terms shall be subject to the exclusive
            jurisdiction of the courts in Milwaukee County, Wisconsin.
          </p>
        </section>

        {/* 10 */}
        <section>
          <SectionHeading num="10" title="Changes to These Terms" />
          <p style={body}>
            We may update these Terms of Service from time to time. We will notify you of significant changes
            by updating the effective date at the top of this page. Your continued use of the platform after
            any changes constitutes your acceptance of the revised terms.
          </p>
        </section>

        {/* 11 */}
        <section>
          <SectionHeading num="11" title="Contact Us" />
          <p style={body}>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--line)', fontSize: 15, color: 'var(--text-2)', lineHeight: 2 }}>
            <strong style={{ color: 'var(--text)' }}>GoGo Pantry Pty Ltd</strong><br />
            Wauwatosa, Wisconsin, USA<br />
            Email: <a href="mailto:legal@gogopantry.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>legal@gogopantry.com</a><br />
            Website: <a href="https://www.gogopantry.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>www.gogopantry.com</a>
          </div>
        </section>

      </div>
    </div>
  );
}
