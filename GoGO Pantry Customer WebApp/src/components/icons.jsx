// Maps a category name to one of the local IconC icons below — no external
// icon CDN involved, so category tiles render identically offline.
export const CATEGORY_ICON_MAP = [
  { keywords: ["produce", "vegetable", "veg", "fruit", "fresh", "green"],       icon: "leaf" },
  { keywords: ["dairy", "milk", "cheese", "yogurt", "butter", "cream", "egg"],  icon: "drop" },
  { keywords: ["bakery", "bread", "bake", "pastry", "loaf"],                    icon: "gift" },
  { keywords: ["meat", "beef", "chicken", "pork", "poultry", "protein"],        icon: "flame" },
  { keywords: ["seafood", "fish", "shrimp", "prawn", "salmon"],                 icon: "drop" },
  { keywords: ["frozen", "ice", "freeze"],                                       icon: "snow" },
  { keywords: ["beverage", "drink", "juice", "soda", "coffee", "tea", "water"], icon: "cup" },
  { keywords: ["snack", "chip", "cracker", "candy", "sweet", "chocolate"],      icon: "star" },
  { keywords: ["pantry", "dry", "grain", "cereal", "pasta", "rice", "can"],     icon: "box" },
  { keywords: ["organic", "natural", "bio", "eco"],                              icon: "leaf" },
  { keywords: ["tobacco", "cigarette", "smoke", "vape"],                         icon: "flame" },
  { keywords: ["household", "cleaning", "laundry", "detergent", "hygiene"],     icon: "zap" },
  { keywords: ["health", "personal", "care", "beauty", "wellness", "vitamin"],  icon: "heart" },
  { keywords: ["deli", "prepared", "ready", "meal", "lunch"],                   icon: "tag" },
  { keywords: ["baby", "infant", "toddler", "kids", "child"],                   icon: "sun" },
  { keywords: ["pet", "dog", "cat", "animal"],                                  icon: "heart" },
  { keywords: ["floral", "flower", "plant"],                                     icon: "leaf" },
];

export function getCategoryIcon(name = "") {
  const lower = name.toLowerCase();
  const match = CATEGORY_ICON_MAP.find(({ keywords }) => keywords.some(k => lower.includes(k)));
  return match ? match.icon : "basket";
}

export const ICONS_CUSTOMER = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z",
  user: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  cart: "M2 3h2l2.4 12.4a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 6H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  pin: "M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  leaf: "M11 20A7 7 0 0 1 4 13c0-6 5-9 16-9 0 9-4 12-9 12ZM4 20c2-3 5-6 9-8",
  chevR: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  x: "M18 6 6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  truck: "M3 4h11v10H3zM14 8h4l3 3v3h-7M5.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4l-8.97 8.97",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  box: "M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4Z",
  sliders: "M4 6h16M7 12h10M10 18h4",
  mail: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  gift: "M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13",
  basket: "M4 9h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 9ZM8 9V7a4 4 0 0 1 8 0v2M9 13v4M15 13v4",
  drop: "M12 2.7s6.5 7.8 6.5 12.3a6.5 6.5 0 1 1-13 0C5.5 10.5 12 2.7 12 2.7Z",
  cup: "M17 8h1.5a2.5 2.5 0 0 1 0 5H17M5 8h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8ZM8 3v2M12 3v2",
  snow: "M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9",
  flame: "M12 22c4.2 0 7-2.8 7-6.8 0-3-1.8-5.4-3.3-7C14.6 10 13 9.6 13 6.8c0-1.8.4-3.2-1-4.8-1 2.8-2.4 3.8-3.9 5.7C6.6 9.6 5 11.6 5 15.2c0 4 2.8 6.8 7 6.8Z",
};

export function IconC({ name, size = 20, stroke = 2, fill = "none", style }) {
  const d = ICONS_CUSTOMER[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill === "current" ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}
