export const CATEGORY_ICON_MAP = [
  { keywords: ["produce", "vegetable", "veg", "fruit", "fresh", "green"],       icon: "material-symbols:nutrition-outline" },
  { keywords: ["dairy", "milk", "cheese", "yogurt", "butter", "cream", "egg"],  icon: "material-symbols:water-drop-outline" },
  { keywords: ["bakery", "bread", "bake", "pastry", "loaf"],                    icon: "material-symbols:bakery-dining-outline" },
  { keywords: ["meat", "beef", "chicken", "pork", "poultry", "protein"],        icon: "material-symbols:kebab-dining-outline" },
  { keywords: ["seafood", "fish", "shrimp", "prawn", "salmon"],                 icon: "material-symbols:set-meal-outline" },
  { keywords: ["frozen", "ice", "freeze"],                                       icon: "material-symbols:ac-unit-outline" },
  { keywords: ["beverage", "drink", "juice", "soda", "coffee", "tea", "water"], icon: "material-symbols:local-drink-outline" },
  { keywords: ["snack", "chip", "cracker", "candy", "sweet", "chocolate"],      icon: "material-symbols:cookie-outline" },
  { keywords: ["pantry", "dry", "grain", "cereal", "pasta", "rice", "can"],     icon: "material-symbols:grocery-outline" },
  { keywords: ["organic", "natural", "bio", "eco"],                              icon: "material-symbols:eco-outline" },
  { keywords: ["household", "cleaning", "laundry", "detergent", "hygiene"],     icon: "material-symbols:cleaning-services-outline" },
  { keywords: ["health", "personal", "care", "beauty", "wellness", "vitamin"],  icon: "material-symbols:health-and-beauty-outline" },
  { keywords: ["deli", "prepared", "ready", "meal", "lunch"],                   icon: "material-symbols:lunch-dining-outline" },
  { keywords: ["baby", "infant", "toddler", "kids", "child"],                   icon: "material-symbols:child-care-outline" },
  { keywords: ["pet", "dog", "cat", "animal"],                                  icon: "material-symbols:pets-outline" },
  { keywords: ["floral", "flower", "plant"],                                     icon: "material-symbols:local-florist-outline" },
];

export function getCategoryIcon(name = "") {
  const lower = name.toLowerCase();
  const match = CATEGORY_ICON_MAP.find(({ keywords }) => keywords.some(k => lower.includes(k)));
  return match ? match.icon : "material-symbols:shopping-basket-outline";
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
