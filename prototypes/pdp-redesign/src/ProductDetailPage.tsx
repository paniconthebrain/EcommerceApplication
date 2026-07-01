import { useEffect, useRef, useState } from "react";

/* ============================================================================
 * Types
 * ==========================================================================*/

interface ProductImage {
  src: string;
  alt: string;
}

interface RatingBreakdownRow {
  stars: number;
  pct: number;
}

interface WrittenReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  body: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  /** null = no photo asset for this SKU yet (distinct from a broken URL). */
  image: string | null;
}

type SubstitutionPref = "none" | "similar" | "any";

type IconProps = React.SVGProps<SVGSVGElement>;

/* ============================================================================
 * Mock data — matches the reference product (Mike & Ike Mega Mix Theater Box)
 *
 * Image paths intentionally point at files that don't exist in this
 * prototype. That's on purpose: it lets the <img onError> fallback below run
 * for real instead of being simulated, which is the actual behavior a real
 * CDN-photo outage or missing-asset SKU would trigger in production.
 * ==========================================================================*/

const PRODUCT = {
  id: "mike-ike-mega-mix-theater-box",
  name: "Mike & Ike® Mega Mix 10 Flavors Theater Box",
  brand: "Mike & Ike",
  category: "Candy & Snacks",
  breadcrumb: ["Browse", "Candy & Snacks"],
  price: 2.49,
  unit: "box",
  size: "4.25 oz (120g)",
  rating: 4.6,
  reviewCount: 128,
  inStock: true,
  stockCount: 34,
  pickupLocation: "Bp Gas Station",
  readyTimeMinutes: 20,
  dietaryBadges: ["Gluten-Free", "Fat-Free"] as const,
  description:
    "Relive the magic of movie night with Mike & Ike Mega Mix — ten mouth-watering fruit flavors packed into one shareable Theater Box. Each chewy piece is fat-free and gluten-free, so the whole group can dig in without a second thought. Perfect for movie marathons, road trips, or restocking the candy dish at home.",
  images: [
    { src: "/mock-images/mike-ike-front.jpg", alt: "Mike & Ike Mega Mix Theater Box, front of package" },
    { src: "/mock-images/mike-ike-back.jpg", alt: "Nutrition facts on the back of the package" },
    { src: "/mock-images/mike-ike-angle.jpg", alt: "Theater box shown at an angle" },
    { src: "/mock-images/mike-ike-size.jpg", alt: "Size comparison next to a standard soda can" },
  ] as ProductImage[],
};

const RATING_BREAKDOWN: RatingBreakdownRow[] = [
  { stars: 5, pct: 74 },
  { stars: 4, pct: 16 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 2 },
];

// Intentionally empty — see the "no written reviews yet" empty state further
// down. The aggregate rating/count above are placeholder summary numbers;
// nobody has actually left written feedback for this SKU yet.
const WRITTEN_REVIEWS: WrittenReview[] = [];

const RELATED_PRODUCTS: RelatedProduct[] = [
  { id: "r1", name: "Skittles Original Share Size", price: 2.29, image: "/mock-images/skittles.jpg" },
  { id: "r2", name: "Starburst FaveREDs", price: 2.19, image: "/mock-images/starburst.jpg" },
  { id: "r3", name: "Sour Patch Kids Theater Box", price: 2.49, image: null },
  { id: "r4", name: "Jolly Rancher Assorted", price: 2.09, image: "/mock-images/jolly-rancher.jpg" },
  { id: "r5", name: "Nerds Rainbow Candy", price: 1.99, image: null },
  { id: "r6", name: "Twizzlers Twists", price: 2.59, image: "/mock-images/twizzlers.jpg" },
];

const SUBSTITUTION_OPTIONS: { value: SubstitutionPref; label: string; desc: string }[] = [
  { value: "none", label: "No substitutions", desc: "Cancel this item if it's unavailable" },
  { value: "similar", label: "Allow similar brand", desc: "Same product, different brand if needed" },
  { value: "any", label: "Allow any substitute", desc: "Shopper picks the best available option" },
];

// Static, fully-written class strings (not template-interpolated) so
// Tailwind's content scanner can actually find and generate them.
const STOCK_BADGE_CLASSES: Record<"ok" | "low" | "out", string> = {
  ok: "bg-brand-50 text-brand-700",
  low: "bg-amber-50 text-amber-700",
  out: "bg-red-50 text-red-700",
};
const STOCK_DOT_CLASSES: Record<"ok" | "low" | "out", string> = {
  ok: "bg-brand-500",
  low: "bg-amber-500",
  out: "bg-red-500",
};

/* ============================================================================
 * Icons — small inline SVGs so the component has zero icon-library deps
 * ==========================================================================*/

function HeartIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7.5-4.6-10-9.3C.5 8.4 2.1 5 5.6 5c2 0 3.4 1 4.4 2.5C11 6 12.4 5 14.4 5 17.9 5 19.5 8.4 22 11.7 19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
    </svg>
  );
}
function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function MinusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function MapPinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
function ShareIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <line x1="8.3" y1="10.7" x2="15.7" y2="6.3" />
      <line x1="8.3" y1="13.3" x2="15.7" y2="17.7" />
    </svg>
  );
}
function ListPlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" y1="6" x2="14" y2="6" />
      <line x1="4" y1="12" x2="14" y2="12" />
      <line x1="4" y1="18" x2="11" y2="18" />
      <line x1="18" y1="14" x2="18" y2="20" />
      <line x1="15" y1="17" x2="21" y2="17" />
    </svg>
  );
}
function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function LeafIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 4c-9 0-16 5-16 14 9 0 14-5 16-14z" />
      <path d="M5 18 12 11" />
    </svg>
  );
}
function DropletOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-10.6 3.8" />
      <path d="M7 14a5 5 0 0 1 .3-1.7" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}
function RulerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="9" width="18" height="6" rx="1.5" />
      <line x1="7" y1="9" x2="7" y2="12" />
      <line x1="11" y1="9" x2="11" y2="12" />
      <line x1="15" y1="9" x2="15" y2="12" />
    </svg>
  );
}
function ChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** Branded stand-in for a missing/broken product photo — a candy jar, not a bare cart icon. */
function BrandPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-brand-50 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-1/2 w-1/2 text-brand-400" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 24h28l-3 30a4 4 0 0 1-4 3.6H25a4 4 0 0 1-4-3.6L18 24Z" />
        <rect x="20" y="14" width="24" height="7" rx="2" />
        <path d="M26 14v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
        <circle cx="26" cy="34" r="2" fill="currentColor" stroke="none" />
        <circle cx="34" cy="30" r="2" fill="currentColor" stroke="none" />
        <circle cx="38" cy="38" r="2" fill="currentColor" stroke="none" />
        <circle cx="28" cy="44" r="2" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

/* ============================================================================
 * Small shared building blocks
 * ==========================================================================*/

/** Renders a 5-star row with partial-star fill via a percentage-width clip mask. */
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => {
        const fillPct = Math.max(0, Math.min(1, rating - (i - 1))) * 100;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon className="absolute inset-0 text-gray-200" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
              <StarIcon className="text-amber-400" style={{ width: size, height: size }} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function QuantityStepper({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="flex h-14 flex-shrink-0 items-center rounded-xl border border-gray-300">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className="grid h-full w-11 place-items-center text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-30"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="w-8 text-center text-base font-bold text-gray-900">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        aria-label="Increase quantity"
        className="grid h-full w-11 place-items-center text-gray-600 transition-colors hover:text-gray-900"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function Accordion({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <span className="text-base font-bold text-gray-900">{title}</span>
        <ChevronDownIcon className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3 text-sm leading-relaxed text-gray-600">{children}</div>}
    </div>
  );
}

/** Collapsed-by-default picker: "Substitution: No substitutions ▾" that expands into radio options. */
function SubstitutionPicker() {
  const [open, setOpen] = useState(false);
  const [pref, setPref] = useState<SubstitutionPref>("none");
  const current = SUBSTITUTION_OPTIONS.find((o) => o.value === pref) ?? SUBSTITUTION_OPTIONS[0];

  return (
    <div className="rounded-xl border border-gray-200">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="text-sm font-semibold text-gray-800">
          Substitution: <span className="font-normal text-gray-500">{current.label}</span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="radiogroup" aria-label="Substitution preference" className="space-y-2 border-t border-gray-100 px-4 py-3">
          {SUBSTITUTION_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors ${
                pref === opt.value ? "border-brand-500 bg-brand-50" : "border-transparent hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="substitution"
                value={opt.value}
                checked={pref === opt.value}
                onChange={() => {
                  setPref(opt.value);
                  setOpen(false);
                }}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-medium text-gray-800">{opt.label}</span>
                <span className="block text-xs text-gray-500">{opt.desc}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedProductCard({ product }: { product: RelatedProduct }) {
  const [broken, setBroken] = useState(false);
  const showPlaceholder = !product.image || broken;

  return (
    <div className="w-36 flex-shrink-0 snap-start">
      <div className="mb-2 aspect-square overflow-hidden rounded-xl bg-gray-50">
        {showPlaceholder ? (
          <BrandPlaceholder className="h-full w-full" />
        ) : (
          <img src={product.image ?? ""} alt={product.name} className="h-full w-full object-contain p-3" onError={() => setBroken(true)} />
        )}
      </div>
      <p className="line-clamp-2 text-sm font-medium text-gray-800">{product.name}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
 * Main component
 * ==========================================================================*/

export default function ProductDetailPage() {
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }

  function handleAddToCart() {
    setPulseKey((k) => k + 1);
    showToast(`Added ${qty} × ${PRODUCT.name} to cart`);
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: PRODUCT.name, text: `Check out ${PRODUCT.name} on GoGO Pantry`, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied to clipboard");
      }
    } catch {
      // User dismissed the native share sheet — nothing to do.
    }
  }

  function handleImageError(index: number) {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  function handleGalleryMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  const currentImage = PRODUCT.images[selectedIndex];
  const showHeroPlaceholder = !currentImage || failedImages.has(selectedIndex);

  const stockState: "ok" | "low" | "out" = !PRODUCT.inStock ? "out" : PRODUCT.stockCount <= 10 ? "low" : "ok";
  const stockLabel = stockState === "out" ? "Out of stock" : stockState === "low" ? `Only ${PRODUCT.stockCount} left` : "In stock";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Sticky header: breadcrumb + wishlist ── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
              {PRODUCT.breadcrumb.map((crumb) => (
                <li key={crumb} className="flex flex-shrink-0 items-center gap-1.5">
                  <span>{crumb}</span>
                  <span className="text-gray-300">/</span>
                </li>
              ))}
              <li className="min-w-0 truncate font-medium text-gray-800">{PRODUCT.name}</li>
            </ol>
          </nav>
          <button
            type="button"
            onClick={() => setWishlisted((w) => !w)}
            aria-pressed={wishlisted}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-gray-200 transition-colors hover:bg-gray-50"
          >
            <HeartIcon filled={wishlisted} className={`h-5 w-5 ${wishlisted ? "text-brand-600" : "text-gray-400"}`} />
          </button>
        </div>
      </header>

      {/* ── Toast confirmation ── */}
      {toastMsg && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div role="status" aria-live="polite" className="pointer-events-auto flex animate-toast-in items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <CheckIcon className="h-4 w-4 text-brand-400" />
            {toastMsg}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
          {/* ── Image gallery (~55% desktop) ── */}
          <div className="md:sticky md:top-20 md:col-span-7 md:self-start">
            <div
              className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-gray-50"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleGalleryMouseMove}
            >
              {showHeroPlaceholder ? (
                <BrandPlaceholder className="h-full w-full" />
              ) : (
                <img
                  key={selectedIndex}
                  src={currentImage.src}
                  alt={currentImage.alt}
                  onError={() => handleImageError(selectedIndex)}
                  className={`h-full w-full object-contain p-8 transition-transform duration-200 ease-out ${isZooming ? "scale-[1.8]" : "scale-100"}`}
                  style={{ transformOrigin: zoomOrigin }}
                />
              )}
            </div>

            {PRODUCT.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {PRODUCT.images.map((img, i) => {
                  const thumbBroken = failedImages.has(i);
                  return (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setSelectedIndex(i)}
                      aria-label={`Show image ${i + 1}: ${img.alt}`}
                      aria-pressed={selectedIndex === i}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        selectedIndex === i ? "border-brand-500" : "border-gray-200"
                      }`}
                    >
                      {thumbBroken ? (
                        <BrandPlaceholder className="h-full w-full" />
                      ) : (
                        <img src={img.src} alt="" onError={() => handleImageError(i)} className="h-full w-full object-contain p-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Info column (~45% desktop) ── */}
          <div className="md:col-span-5">
            <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{PRODUCT.category}</span>

            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-3xl">{PRODUCT.name}</h1>
            <button type="button" className="mt-1 text-sm font-medium text-brand-600 hover:underline">
              by {PRODUCT.brand}
            </button>

            <div className="mt-3 flex items-center gap-2">
              <StarRating rating={PRODUCT.rating} />
              <a href="#reviews-heading" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline">
                {PRODUCT.rating.toFixed(1)} ({PRODUCT.reviewCount} reviews)
              </a>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">${PRODUCT.price.toFixed(2)}</span>
              <span className="text-sm font-medium text-gray-500">/ {PRODUCT.unit}</span>
            </div>

            {/* Stock + fulfillment — single inline row */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${STOCK_BADGE_CLASSES[stockState]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STOCK_DOT_CLASSES[stockState]}`} />
                {stockLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                Pickup at <span className="font-semibold text-gray-800">{PRODUCT.pickupLocation}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                Ready in {PRODUCT.readyTimeMinutes} min
              </span>
            </div>

            {/* Dietary / nutrition pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                <LeafIcon className="h-3.5 w-3.5 text-brand-500" /> Gluten-Free
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                <DropletOffIcon className="h-3.5 w-3.5 text-brand-500" /> Fat-Free
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                <RulerIcon className="h-3.5 w-3.5 text-gray-400" /> {PRODUCT.size}
              </span>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Quantity + primary CTA */}
            <div className="flex items-stretch gap-3">
              <QuantityStepper value={qty} onChange={setQty} />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stockState === "out"}
                className="flex-1 rounded-xl bg-brand-600 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <span key={pulseKey} className="inline-block animate-pop">
                  {stockState === "out" ? "Out of Stock" : `Add to Cart — $${(PRODUCT.price * qty).toFixed(2)}`}
                </span>
              </button>
            </div>

            <div className="mt-4">
              <SubstitutionPicker />
            </div>

            {/* Secondary actions */}
            <div className="mt-4 flex items-center gap-5 text-sm font-semibold text-gray-600">
              <button type="button" onClick={() => showToast(`${PRODUCT.name} added to your list`)} className="inline-flex items-center gap-1.5 hover:text-gray-900">
                <ListPlusIcon className="h-4 w-4" /> Add to List
              </button>
              <button type="button" onClick={handleShare} className="inline-flex items-center gap-1.5 hover:text-gray-900">
                <ShareIcon className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* ── About this item ── */}
        <div className="mt-12 max-w-3xl md:mt-16">
          <Accordion title="About this item" defaultOpen>
            <p>{PRODUCT.description}</p>
          </Accordion>
        </div>

        {/* ── You might also like ── */}
        <section className="mt-12 md:mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-4 text-lg font-bold text-gray-900">
            You might also like
          </h2>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {RELATED_PRODUCTS.map((rp) => (
              <RelatedProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>

        {/* ── Customer reviews ── */}
        <section className="mt-12 max-w-3xl md:mt-16" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="mb-4 text-lg font-bold text-gray-900">
            Customer reviews
          </h2>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
            <div className="flex flex-shrink-0 flex-col items-start gap-1 sm:items-center">
              <span className="text-4xl font-extrabold text-gray-900">{PRODUCT.rating.toFixed(1)}</span>
              <StarRating rating={PRODUCT.rating} size={18} />
              <span className="text-sm text-gray-500">{PRODUCT.reviewCount} ratings</span>
            </div>
            <div className="flex-1 space-y-1.5">
              {RATING_BREAKDOWN.map((row) => (
                <div key={row.stars} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-10 flex-shrink-0">{row.stars} star</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="w-9 flex-shrink-0 text-right">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            {WRITTEN_REVIEWS.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                <ChatIcon className="h-8 w-8 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">No written reviews yet</p>
                <p className="max-w-xs text-sm text-gray-500">Be the first to share what you thought of this product.</p>
                <button type="button" className="mt-1 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                  Write a review
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {WRITTEN_REVIEWS.map((r) => (
                  <li key={r.id}>
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} size={13} />
                      <span className="text-sm font-semibold text-gray-800">{r.author}</span>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
