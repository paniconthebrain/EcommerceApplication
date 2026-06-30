import { useState, useEffect, useRef } from 'react';
import { G, API_BASE, apiFetch } from '../../globals.js';
import { Btn, Pill, ProductSwatch, ConfirmDialog } from '../ui.jsx';
import { AdminPageWrap, MgmtModal, MgmtTable, FieldRow, inputStyle } from './shared.jsx';

const ALLERGEN_OPTIONS = ['gluten', 'dairy', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'sesame'];
const STATUS_OPTIONS   = ['draft', 'active', 'archived'];
const TYPE_OPTIONS     = [
  { value: 'simple',   label: 'Simple product' },
  { value: 'variable', label: 'Variable (has variants)' },
];

const EMPTY_FORM = {
  name: '', brand: '', categoryId: '', supplierId: '', unit: 'each',
  price: '', salePrice: '', costPrice: '', par: '',
  size: '', weight: '', description: '', shortDescription: '',
  featuredImage: '', galleryImages: [],
  productType: 'simple', status: 'active', visibility: 'public',
  isRestricted18Plus: false,
  barcode: '', countryOfOrigin: '', storageInstructions: '',
  ingredients: '',
  allergens: [],
  nutritionFacts: { servingSize: '', calories: '', fat: '', protein: '', carbs: '', sugar: '', sodium: '', fiber: '' },
  attributes: [],
};

function GalleryEditor({ images, onChange }) {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(f => new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res(ev.target.result);
      reader.readAsDataURL(f);
    }))).then(results => onChange([...images, ...results]));
    e.target.value = '';
  };
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: 'relative', width: 70, height: 70, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--line)' }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: 999, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'grid', placeItems: 'center', lineHeight: 1 }}
            >×</button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{ width: 70, height: 70, borderRadius: 10, border: '2px dashed var(--line)', background: 'var(--surface-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--text-3)', fontSize: 22 }}
        >+</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

function AttributeEditor({ attrs, onChange }) {
  const add = () => onChange([...attrs, { key: '', value: '' }]);
  const update = (i, field, val) => {
    const next = [...attrs];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const remove = (i) => onChange(attrs.filter((_, j) => j !== i));
  return (
    <div>
      {attrs.map((a, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 28px', gap: 6, marginBottom: 6 }}>
          <input value={a.key} onChange={e => update(i, 'key', e.target.value)} placeholder="Attribute (e.g. Flavor)" style={inputStyle} />
          <input value={a.value} onChange={e => update(i, 'value', e.target.value)} placeholder="Value (e.g. Almond)" style={inputStyle} />
          <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: 'var(--red-500)', cursor: 'pointer', fontSize: 18, fontFamily: 'var(--font-sans)' }}>×</button>
        </div>
      ))}
      <button type="button" onClick={add}
        style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-sans)' }}>
        + Add attribute
      </button>
    </div>
  );
}

function SectionHead({ label }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '18px 0 10px', paddingBottom: 6, borderBottom: '1px solid var(--line)' }}>
      {label}
    </div>
  );
}

export default function ManageProductsScreen() {
  const [products, setProducts]   = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [err, setErr]             = useState('');
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [confirmDel, setConfirmDel] = useState({ open: false, item: null });
  const [heroFile, setHeroFile]   = useState(null);
  const heroRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const [pRes, sRes, cRes] = await Promise.all([
        apiFetch(`${API_BASE}/products?grouped=true`),
        apiFetch(`${API_BASE}/suppliers`),
        apiFetch(`${API_BASE}/categories`),
      ]);
      if (pRes?.ok) setProducts(await pRes.json());
      if (sRes?.ok) setSuppliers(await sRes.json());
      if (cRes?.ok) setCategories(await cRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function formFromProduct(p) {
    const nf = p.nutritionFacts || p.nutrition_facts || {};
    return {
      name:               p.name || '',
      brand:              p.brand || '',
      categoryId:         p.categoryId || p.category_id || '',
      supplierId:         p.supplierId || p.supplier_id || '',
      unit:               p.unit || 'each',
      price:              p.price != null ? String(p.price) : '',
      salePrice:          p.salePrice != null ? String(p.salePrice) : '',
      costPrice:          p.costPrice != null ? String(p.costPrice) : '',
      par:                p.par != null ? String(p.par) : '',
      size:               p.size || '',
      weight:             p.weight || '',
      description:        p.description || '',
      shortDescription:   p.shortDescription || '',
      featuredImage:      p.featuredImage || p.featured_image || '',
      galleryImages:      Array.isArray(p.galleryImages || p.gallery_images) ? (p.galleryImages || p.gallery_images) : [],
      productType:        p.productType || p.product_type || 'simple',
      status:             p.status || 'active',
      visibility:         p.visibility || 'public',
      isRestricted18Plus: p.isRestricted18Plus || p.is_restricted_18_plus || false,
      barcode:            p.barcode || '',
      countryOfOrigin:    p.countryOfOrigin || p.country_of_origin || '',
      storageInstructions: p.storageInstructions || p.storage_instructions || '',
      ingredients:        p.ingredients || '',
      allergens:          Array.isArray(p.allergens) ? p.allergens : [],
      nutritionFacts: {
        servingSize: nf.servingSize || '',
        calories:    nf.calories    != null ? String(nf.calories)    : '',
        fat:         nf.fat         != null ? String(nf.fat)         : '',
        protein:     nf.protein     != null ? String(nf.protein)     : '',
        carbs:       nf.carbs       != null ? String(nf.carbs)       : '',
        sugar:       nf.sugar       != null ? String(nf.sugar)       : '',
        sodium:      nf.sodium      != null ? String(nf.sodium)      : '',
        fiber:       nf.fiber       != null ? String(nf.fiber)       : '',
      },
      attributes: Array.isArray(p.attributes) ? p.attributes : [],
    };
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setHeroFile(null);
    setErr('');
    setModal(true);
  }

  function openEdit(p) {
    setEditing(p.id);
    setForm(formFromProduct(p));
    setHeroFile(null);
    setErr('');
    setModal(true);
  }

  function handleDelete(p) { setConfirmDel({ open: true, item: p }); }

  async function doDelete(p) {
    setConfirmDel({ open: false, item: null });
    try {
      await apiFetch(`${API_BASE}/products/${p.id}`, { method: 'DELETE' });
      load();
    } catch { /* ignore */ }
  }

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function setNf(key, val) { setForm(f => ({ ...f, nutritionFacts: { ...f.nutritionFacts, [key]: val } })); }

  function toggleAllergen(a) {
    setForm(f => ({
      ...f,
      allergens: f.allergens.includes(a) ? f.allergens.filter(x => x !== a) : [...f.allergens, a],
    }));
  }

  async function handleHeroFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setHeroFile(ev.target.result);
      set('featuredImage', ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const nf = form.nutritionFacts;
      const hasNf = Object.values(nf).some(v => v !== '');
      const payload = {
        name:               form.name,
        brand:              form.brand || null,
        categoryId:         form.categoryId,
        supplierId:         form.supplierId,
        unit:               form.unit,
        price:              form.price !== '' ? parseFloat(form.price) : null,
        salePrice:          form.salePrice !== '' ? parseFloat(form.salePrice) : null,
        costPrice:          form.costPrice !== '' ? parseFloat(form.costPrice) : null,
        par:                form.par !== '' ? parseInt(form.par) : 0,
        size:               form.size || null,
        weight:             form.weight || null,
        description:        form.description || null,
        shortDescription:   form.shortDescription || null,
        featuredImage:      form.featuredImage || null,
        galleryImages:      form.galleryImages,
        productType:        form.productType,
        status:             form.status,
        visibility:         form.visibility,
        isRestricted18Plus: form.isRestricted18Plus,
        barcode:            form.barcode || null,
        countryOfOrigin:    form.countryOfOrigin || null,
        storageInstructions: form.storageInstructions || null,
        ingredients:        form.ingredients || null,
        allergens:          form.allergens,
        nutritionFacts:     hasNf ? {
          servingSize: nf.servingSize || null,
          calories:    nf.calories  !== '' ? parseFloat(nf.calories)  : null,
          fat:         nf.fat       !== '' ? parseFloat(nf.fat)       : null,
          protein:     nf.protein   !== '' ? parseFloat(nf.protein)   : null,
          carbs:       nf.carbs     !== '' ? parseFloat(nf.carbs)     : null,
          sugar:       nf.sugar     !== '' ? parseFloat(nf.sugar)     : null,
          sodium:      nf.sodium    !== '' ? parseFloat(nf.sodium)    : null,
          fiber:       nf.fiber     !== '' ? parseFloat(nf.fiber)     : null,
        } : null,
        attributes: form.attributes.filter(a => a.key && a.value),
      };

      const url    = editing ? `${API_BASE}/products/${editing}` : `${API_BASE}/products`;
      const method = editing ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (!res || !res.ok) {
        const d = await res?.json().catch(() => ({}));
        setErr(d?.error || 'Failed to save product');
        return;
      }
      setModal(false);
      load();
    } catch { setErr('Network error — please try again'); }
    finally { setSaving(false); }
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filtered.map(p => {
    const cat = categories.find(c => c.id === (p.categoryId || p.category_id));
    return {
      id: p.id,
      raw: p,
      cells: [
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ProductSwatch p={{ name: p.name, cat: p.categoryId || p.category_id }} size={36} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
              {p.brand || ''}{p.brand && p.size ? ' · ' : ''}{p.size || ''}
            </div>
          </div>
        </div>,
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{cat?.name || '—'}</span>,
        <div>
          {p.salePrice
            ? <><span style={{ fontWeight: 800, fontSize: 13 }}>${parseFloat(p.salePrice).toFixed(2)}</span><span style={{ textDecoration: 'line-through', color: 'var(--text-3)', fontSize: 11, marginLeft: 5 }}>${parseFloat(p.price).toFixed(2)}</span></>
            : <span style={{ fontWeight: 700, fontSize: 13 }}>{p.price != null ? `$${parseFloat(p.price).toFixed(2)}` : '—'}</span>
          }
        </div>,
        <Pill tone={p.status === 'active' ? 'success' : p.status === 'archived' ? 'neutral' : 'warning'} size="sm">
          {p.status || 'draft'}
        </Pill>,
      ],
    };
  });

  return (
    <>
      <ConfirmDialog
        open={confirmDel.open}
        title={`Delete "${confirmDel.item?.name}"?`}
        body="This product will be permanently deleted and removed from inventory."
        confirm="Delete" tone="danger"
        onConfirm={() => doDelete(confirmDel.item)}
        onCancel={() => setConfirmDel({ open: false, item: null })}
      />

      <AdminPageWrap
        title="Products"
        subtitle={loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
        action={<Btn size="sm" icon="plus" onClick={openCreate}>Add product</Btn>}
      >
        {/* Search bar */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            style={{ ...inputStyle, maxWidth: 340 }}
          />
        </div>

        <MgmtTable
          cols={['Product', 'Category', 'Price', 'Status']}
          rows={rows}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </AdminPageWrap>

      {/* ── Product edit/create modal ── */}
      <MgmtModal
        open={modal}
        title={editing ? 'Edit product' : 'Add product'}
        onClose={() => setModal(false)}
        maxWidth={600}
      >
        <form onSubmit={handleSubmit}>

          <SectionHead label="Basic info" />
          <FieldRow label="Product name *">
            <input required value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="e.g. Organic Whole Milk" />
          </FieldRow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldRow label="Brand">
              <input value={form.brand} onChange={e => set('brand', e.target.value)} style={inputStyle} placeholder="e.g. Organic Valley" />
            </FieldRow>
            <FieldRow label="Unit *">
              <input required value={form.unit} onChange={e => set('unit', e.target.value)} style={inputStyle} placeholder="each, kg, oz…" />
            </FieldRow>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldRow label="Category *">
              <select required value={form.categoryId} onChange={e => set('categoryId', e.target.value)} style={inputStyle}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Supplier *">
              <select required value={form.supplierId} onChange={e => set('supplierId', e.target.value)} style={inputStyle}>
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FieldRow>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldRow label="Product type">
              <select value={form.productType} onChange={e => set('productType', e.target.value)} style={inputStyle}>
                {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </FieldRow>
          </div>

          <SectionHead label="Pricing & stock" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <FieldRow label="Price ($) *">
              <input required type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} style={inputStyle} placeholder="0.00" />
            </FieldRow>
            <FieldRow label="Sale price ($)">
              <input type="number" min="0" step="0.01" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} style={inputStyle} placeholder="—" />
            </FieldRow>
            <FieldRow label="Cost price ($)">
              <input type="number" min="0" step="0.01" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} style={inputStyle} placeholder="—" />
            </FieldRow>
            <FieldRow label="Par (reorder)">
              <input type="number" min="0" value={form.par} onChange={e => set('par', e.target.value)} style={inputStyle} placeholder="10" />
            </FieldRow>
          </div>

          <SectionHead label="Media" />
          <FieldRow label="Featured image">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {(heroFile || form.featuredImage) && (
                <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--line)', flexShrink: 0 }}>
                  <img src={heroFile || form.featuredImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input ref={heroRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleHeroFile} />
                <button type="button" onClick={() => heroRef.current?.click()}
                  style={{ padding: '8px 14px', borderRadius: 9, border: '1.5px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  {form.featuredImage ? 'Replace image' : 'Upload image'}
                </button>
                {form.featuredImage && (
                  <button type="button" onClick={() => { setHeroFile(null); set('featuredImage', ''); }}
                    style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 9, border: 'none', background: 'none', color: 'var(--red-500)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </FieldRow>
          <FieldRow label="Gallery images">
            <GalleryEditor images={form.galleryImages} onChange={imgs => set('galleryImages', imgs)} />
          </FieldRow>

          <SectionHead label="Description" />
          <FieldRow label="Full description">
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Product description shown on the detail page…" />
          </FieldRow>

          <SectionHead label="Product details" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldRow label="Size">
              <input value={form.size} onChange={e => set('size', e.target.value)} style={inputStyle} placeholder="e.g. 32oz, 500ml" />
            </FieldRow>
            <FieldRow label="Weight">
              <input value={form.weight} onChange={e => set('weight', e.target.value)} style={inputStyle} placeholder="e.g. 1.5 lbs" />
            </FieldRow>
            <FieldRow label="Barcode (UPC/EAN)">
              <input value={form.barcode} onChange={e => set('barcode', e.target.value)} style={inputStyle} placeholder="e.g. 012345678901" />
            </FieldRow>
            <FieldRow label="Country of origin">
              <input value={form.countryOfOrigin} onChange={e => set('countryOfOrigin', e.target.value)} style={inputStyle} placeholder="e.g. USA" />
            </FieldRow>
          </div>
          <FieldRow label="Storage instructions">
            <input value={form.storageInstructions} onChange={e => set('storageInstructions', e.target.value)} style={inputStyle} placeholder="e.g. Keep refrigerated below 4°C" />
          </FieldRow>
          <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={form.isRestricted18Plus} onChange={e => set('isRestricted18Plus', e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
              Age-restricted (18+)
            </label>
          </div>
          <FieldRow label="Custom attributes">
            <AttributeEditor attrs={form.attributes} onChange={a => set('attributes', a)} />
          </FieldRow>

          <SectionHead label="Ingredients & nutrition" />
          <FieldRow label="Ingredients">
            <textarea rows={3} value={form.ingredients} onChange={e => set('ingredients', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Full ingredient list…" />
          </FieldRow>
          <FieldRow label="Allergens">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 2 }}>
              {ALLERGEN_OPTIONS.map(a => (
                <button key={a} type="button" onClick={() => toggleAllergen(a)}
                  style={{ padding: '5px 11px', borderRadius: 7, border: '1.5px solid', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.12s',
                    borderColor: form.allergens.includes(a) ? 'var(--amber-500)' : 'var(--line)',
                    background: form.allergens.includes(a) ? 'var(--amber-100)' : 'transparent',
                    color: form.allergens.includes(a) ? '#92400e' : 'var(--text-2)' }}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Nutrition facts" helper="Leave blank if not applicable (e.g. non-food items)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <FieldRow label="Serving size">
                <input value={form.nutritionFacts.servingSize} onChange={e => setNf('servingSize', e.target.value)} style={inputStyle} placeholder="e.g. 1 cup (240ml)" />
              </FieldRow>
              <FieldRow label="Calories">
                <input type="number" min="0" value={form.nutritionFacts.calories} onChange={e => setNf('calories', e.target.value)} style={inputStyle} placeholder="—" />
              </FieldRow>
              <FieldRow label="Fat (g)">
                <input type="number" min="0" step="0.1" value={form.nutritionFacts.fat} onChange={e => setNf('fat', e.target.value)} style={inputStyle} placeholder="—" />
              </FieldRow>
              <FieldRow label="Protein (g)">
                <input type="number" min="0" step="0.1" value={form.nutritionFacts.protein} onChange={e => setNf('protein', e.target.value)} style={inputStyle} placeholder="—" />
              </FieldRow>
              <FieldRow label="Carbs (g)">
                <input type="number" min="0" step="0.1" value={form.nutritionFacts.carbs} onChange={e => setNf('carbs', e.target.value)} style={inputStyle} placeholder="—" />
              </FieldRow>
              <FieldRow label="Sugars (g)">
                <input type="number" min="0" step="0.1" value={form.nutritionFacts.sugar} onChange={e => setNf('sugar', e.target.value)} style={inputStyle} placeholder="—" />
              </FieldRow>
              <FieldRow label="Sodium (mg)">
                <input type="number" min="0" value={form.nutritionFacts.sodium} onChange={e => setNf('sodium', e.target.value)} style={inputStyle} placeholder="—" />
              </FieldRow>
              <FieldRow label="Fiber (g)">
                <input type="number" min="0" step="0.1" value={form.nutritionFacts.fiber} onChange={e => setNf('fiber', e.target.value)} style={inputStyle} placeholder="—" />
              </FieldRow>
            </div>
          </FieldRow>

          {err && <div style={{ color: 'var(--red-500)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <Btn variant="ghost" full onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" full style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
            </Btn>
          </div>
        </form>
      </MgmtModal>
    </>
  );
}
