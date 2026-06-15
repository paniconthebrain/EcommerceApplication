"""
Extract BP Inventory from Excel → bp_inventory_data.json

Run: python backend/scripts/extract_bp_inventory.py
Output: backend/scripts/bp_inventory_data.json
"""

import pandas as pd
import json

FILE = 'C:/Users/sakar/Downloads/BP Inventory 2024.xlsx'
OUT  = 'D:/PersonalProject/EcommerceApplication/backend/scripts/bp_inventory_data.json'

pid_counter = [0]

def new_pid(prefix):
    pid_counter[0] += 1
    return f"bp_{prefix}_{pid_counter[0]:03d}"

def s(v):
    """Clean string — returns None for blanks/NaN."""
    if pd.isna(v): return None
    t = str(v).strip()
    return t if t and t.lower() not in ('nan', 'none') else None

def n(v):
    """Parse numeric — returns None on failure."""
    if pd.isna(v): return None
    try:
        return float(str(v).replace(',', '').replace('$', '').strip())
    except:
        return None

def is_dairy(base_product):
    """Only flag actual dairy products — not energy drinks/protein shakes that mention 'milk'."""
    if not base_product: return False
    lower = base_product.lower()
    # Explicit non-dairy brands
    if any(x in lower for x in ('muscle milk', 'ghost', 'starbucks', 'nitro', 'frappuccino')):
        return False
    return any(k in lower for k in ('milk', 'butter', 'egg nog', 'eggnog')) or lower.strip() == 'eggs'

def clean_product_name(name):
    """Strip staff notes and normalize whitespace."""
    import re
    name = re.sub(r'\s*\([^)]*(?:no identity|taken space|taken)[^)]*\)', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+NOT IN COOLER\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+', ' ', name)  # collapse extra spaces
    return name.strip()

def strip_trailing_num(s):
    """Remove trailing stock count baked into variant names e.g. 'Blue razz ice 6' → 'Blue razz ice'"""
    import re
    return re.sub(r'\s+\d+$', '', s).strip()

def first_num(row, start, end):
    """First non-null numeric value in row[start:end]."""
    for i in range(start, min(end, len(row))):
        v = n(row.iloc[i])
        if v is not None and v >= 0:
            return int(v)
    return 0

# ─────────────────────────────────────────────
# 1. DRINKS  (Inventory sheet — cooler products)
# ─────────────────────────────────────────────
products  = []
seen_names = set()
inv_stock  = {}   # pid -> stock

df = pd.read_excel(FILE, sheet_name='Inventory', header=None)

for _, row in df.iterrows():
    vendor  = s(row.iloc[1])
    product = s(row.iloc[2])
    flavor  = s(row.iloc[5])

    if not product or not vendor:
        continue
    if vendor == 'Vendor':          # header row
        continue

    product = clean_product_name(product)
    name = f"{product} - {flavor}" if flavor else product

    if name in seen_names:          # skip duplicates
        continue
    seen_names.add(name)

    # Price: col 16; fallback 2.79
    price = n(row.iloc[16]) or 2.79

    # Stock: col 19 (2025 latest), else col 8 (original count)
    stock_latest  = n(row.iloc[19]) if len(row) > 19 else None
    stock_initial = s(row.iloc[8])

    if stock_latest is not None:
        stock = int(stock_latest)
    elif stock_initial and stock_initial.lower() != 'out of stock':
        try:
            stock = int(float(stock_initial))
        except:
            stock = 0
    else:
        stock = 0

    pid = new_pid('bev')
    cat = 'dairy' if is_dairy(name) else 'beverages'
    products.append({
        'id': pid, 'name': name,
        'categoryId': cat, 'price': round(price, 2),
        'unit': 'each', 'par': max(stock, 6),
        'supplierId': 'cascade', 'productType': 'simple', 'status': 'active',
    })
    inv_stock[pid] = stock

# ─────────────────────────────────────────────
# 2. CIGARETTES  (Cigarette Inventory sheet)
#    Col 0 = name, Col 1 = SRP, Col 2 = latest on-hand (2025-03-02)
# ─────────────────────────────────────────────
SKIP_CIG = {'DATE :', 'Row 1', 'Section 1 :', 'Section 2 :', 'Section 3 :',
            'Section 4 :', 'Section 5 :', 'Section 6 :', 'Section 7 :'}

df = pd.read_excel(FILE, sheet_name='Cigarette Inventory', header=None)

for _, row in df.iterrows():
    product = s(row.iloc[0])
    srp     = n(row.iloc[1])

    if not product or not srp:
        continue
    if product in SKIP_CIG:
        continue
    if product in seen_names:
        continue
    seen_names.add(product)

    stock = first_num(row, 2, 8)   # col 2 = most recent date

    pid = new_pid('cig')
    products.append({
        'id': pid, 'name': product,
        'categoryId': 'tobacco', 'price': round(srp, 2),
        'unit': 'pack', 'par': max(stock, 2),
        'supplierId': 'bp_dist', 'productType': 'simple', 'status': 'active',
    })
    inv_stock[pid] = stock

# ─────────────────────────────────────────────
# 3. ZYN / TOBACCO POUCHES
#    Col 0 = brand section, Col 1 = variant/strength-header
#    Col 2 = SRP, Col 3 = latest on-hand (2025-03-02)
# ─────────────────────────────────────────────
SKIP_ZYN_VARIANTS = {'SRP', '3Mg', '6Mg', '3mg', '6mg', 'On Hand', 'on hand',
                     'On hand', 'ON HAND', 'Distro', 'Chambers', 'Date'}

df = pd.read_excel(FILE, sheet_name='ZYNVELOLonghornAll tabacoos', header=None)
current_brand = None

for _, row in df.iterrows():
    brand_cell = s(row.iloc[0])
    variant    = s(row.iloc[1])
    srp        = n(row.iloc[2])

    # Detect brand section headers (col 0 has value, col 1 and srp empty)
    if brand_cell and not srp:
        current_brand = brand_cell
        continue

    if not variant or not srp:
        continue
    if variant in SKIP_ZYN_VARIANTS:
        continue

    name = f"{current_brand} {variant}" if current_brand else variant

    if name in seen_names:
        continue
    seen_names.add(name)

    stock = int(n(row.iloc[3]) or 0) if len(row) > 3 else 0

    pid = new_pid('tob')
    products.append({
        'id': pid, 'name': name,
        'categoryId': 'tobacco', 'price': round(srp, 2),
        'unit': 'can', 'par': max(stock, 2),
        'supplierId': 'bp_dist', 'productType': 'simple', 'status': 'active',
    })
    inv_stock[pid] = stock

# ─────────────────────────────────────────────
# 4. VAPE  (Vape Inventory sheet)
#    Col 0 = brand, Col 1 = variant, Col 2 = SRP, Col 3 = latest on-hand
# ─────────────────────────────────────────────
SKIP_VAPE = {'Date', 'SRP', 'On Hand', 'on Hand', 'ON HAND', 'received', 'Received',
             'MOBIL', 'on hand'}

df = pd.read_excel(FILE, sheet_name='Vape Inventory', header=None)
current_brand = None

for _, row in df.iterrows():
    brand_cell = s(row.iloc[0])
    variant    = s(row.iloc[1])
    srp        = n(row.iloc[2])

    if brand_cell and not srp:
        current_brand = brand_cell
        continue

    if not variant or not srp:
        continue
    if variant in SKIP_VAPE:
        continue

    variant_clean = strip_trailing_num(variant)
    name = f"{current_brand} - {variant_clean}" if current_brand else variant_clean

    if name in seen_names:
        continue
    seen_names.add(name)

    stock = int(n(row.iloc[3]) or 0) if len(row) > 3 else 0

    pid = new_pid('vape')
    products.append({
        'id': pid, 'name': name,
        'categoryId': 'vape', 'price': round(srp, 2),
        'unit': 'each', 'par': max(stock, 2),
        'supplierId': 'bp_dist', 'productType': 'simple', 'status': 'active',
    })
    inv_stock[pid] = stock

# ─────────────────────────────────────────────
# Build output JSON
# ─────────────────────────────────────────────
output = {
    'categories': [
        {'id': 'tobacco',  'name': 'Tobacco',       'hue': 30,  'blurb': 'Cigarettes, cigars and nicotine products'},
        {'id': 'vape',     'name': 'Vape & E-Cigs', 'hue': 200, 'blurb': 'Disposable vapes and e-cigarettes'},
    ],
    'suppliers': [
        {
            'id': 'bp_dist', 'name': 'BP Distribution', 'type': 'Tobacco & Vape',
            'leadTime': '3 days', 'email': 'orders@bpdist.com', 'phone': '(555) 000-9999',
            'contactName': 'BP Rep', 'deliveryModel': 'dsd',
            'deliveryDays': ['monday', 'thursday'],
            'minimumOrderAmount': None, 'paymentTerms': 'cod',
        },
    ],
    'products': products,
    # Seed stock into 'msn' shop (primary); other shops get 0
    'inventory': [
        {'shopId': 'msn', 'productId': pid, 'stock': stock, 'par': max(stock, 2)}
        for pid, stock in inv_stock.items()
    ],
}

with open(OUT, 'w') as f:
    json.dump(output, f, indent=2)

cats  = len(output['categories'])
sups  = len(output['suppliers'])
prods = len(products)
inv   = len(output['inventory'])
print(f"Done — {prods} products, {cats} new categories, {sups} new suppliers, {inv} inventory records")
print(f"Output: {OUT}")
