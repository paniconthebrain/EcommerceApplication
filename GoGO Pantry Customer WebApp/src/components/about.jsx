import { IconC } from './icons.jsx';

export function AboutUs() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 32px) 64px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--primary-soft)', border: '1px solid oklch(0.55 0.17 152 / 0.25)',
          borderRadius: 999, padding: '5px 16px', marginBottom: 20,
        }}>
          <IconC name="pin" size={12} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green-700)' }}>
            Wauwatosa, Wisconsin
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text)', margin: '0 0 18px' }}>
          Your Neighborhood<br />
          <span style={{ color: 'var(--primary)' }}>Convenience Hub</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto' }}>
          At GoGo Pantry, we believe a convenience store should be more than just a quick pit stop —
          it should be a vibrant part of the community.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--line)', marginBottom: 56 }} />

      {/* Mission paragraph */}
      <div style={{ marginBottom: 56 }}>
        <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.85, margin: '0 0 20px' }}>
          Located right in the heart of Wauwatosa, Wisconsin, we are proud to be your go-to neighborhood
          destination for everyday essentials, local favorites, and the latest viral trends. From the corner
          run for milk to hunting down that snack you saw on TikTok — we have got you covered.
        </p>
        <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.85, margin: 0 }}>
          We started GoGo Pantry with a simple idea: a convenience store that actually keeps up with what
          people want. That means stocking the newest drops before they go mainstream, keeping everyday
          staples always in supply, and making sure every neighbor — regardless of how they pay — feels
          genuinely welcome.
        </p>
      </div>

      {/* What we're passionate about */}
      <div style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 28px' }}>
          What We're Passionate About
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Card 1 */}
          <div style={{ display: 'flex', gap: 20, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '24px 24px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'oklch(0.9 0.08 50)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 22 }}>⚡</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>The Trends You Want</div>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
                From the rarest exotic snacks and viral ice creams to the newest energy drink drops —
                Ghost, C4, Monster, Zyn Energy, and whatever blows up next — we pride ourselves on
                keeping our shelves stocked with the hard-to-find treats blowing up your feed.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ display: 'flex', gap: 20, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '24px 24px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 22 }}>🛒</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Everyday Essentials & Hydration</div>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
                Whether you need a quick gallon of milk, a refreshing Gatorade, or a late-night snack
                craving satisfied, we keep the staples stocked and the coolers cold. The basics,
                done right, every single day.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ display: 'flex', gap: 20, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '24px 24px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'oklch(0.93 0.05 270)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 22 }}>🤝</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Community & Accessibility</div>
              <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
                We believe everyone deserves easy access to quality food and refreshments. That is why
                GoGo Pantry proudly welcomes{' '}
                <span style={{ fontWeight: 800, color: 'var(--text)' }}>SNAP EBT</span> customers,
                ensuring our neighborhood has a reliable, welcoming place to shop — no exceptions.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SNAP EBT highlight */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-soft) 0%, oklch(0.94 0.05 170) 100%)',
        border: '1.5px solid oklch(0.55 0.17 152 / 0.25)',
        borderRadius: 20, padding: '28px 28px', marginBottom: 56,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 4px 16px oklch(0.55 0.17 152 / 0.35)' }}>
          <IconC name="checkCircle" size={26} style={{ color: '#fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--green-700)', marginBottom: 4 }}>SNAP EBT Accepted</div>
          <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
            GoGo Pantry is proud to accept SNAP EBT — because access to food shouldn't depend on how you pay.
          </p>
        </div>
      </div>

      {/* Visit us */}
      <div style={{ background: 'oklch(0.13 0.022 152)', borderRadius: 24, padding: 'clamp(28px, 4vw, 40px)', color: '#fff', marginBottom: 56 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Visit Us Today!
        </h2>
        <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.55)', margin: '0 0 28px', lineHeight: 1.7 }}>
          Whether you are filling up your tank, hunting for a rare snack flavor, or just grabbing a quick
          morning pick-me-up, our friendly team is ready to welcome you with open doors.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconC name="pin" size={18} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Find Us At</div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.5 }}>12324 W North Ave</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Wauwatosa, Wisconsin 53226</div>
          </div>
        </div>
      </div>

      {/* Social proof strip */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { emoji: '⚡', label: 'Energy drinks' },
          { emoji: '🍬', label: 'Exotic snacks' },
          { emoji: '🧃', label: 'Everyday staples' },
          { emoji: '💳', label: 'SNAP EBT welcome' },
          { emoji: '📍', label: 'Wauwatosa, WI' },
        ].map(({ emoji, label }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 999, padding: '8px 16px',
            fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
          }}>
            <span>{emoji}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
