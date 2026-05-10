"""Generate all HTML pages for the Bonito handbook beta.
Run this once to produce: index.html, product_metal_fabrication.html,
product_prelam.html, product_gypsum.html, product_shutters.html.
"""
import os

OUT_DIR = '/home/claude/github_ready'

HEAD_COMMON = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>'''

BANNER_INDEX = '''<div class="beta-banner">
  <b>BETA PROTOTYPE</b> &middot; Click any product below to test the handbook feature
</div>'''

BANNER_PRODUCT = '''<div class="beta-banner">
  <b>BETA PROTOTYPE</b> &middot; Click <b>"View Handbook"</b> below the Add to Cart button
  <a href="index.html">&larr; Back to product list</a>
</div>'''

SIDEBAR = '''<aside class="sidebar">
  <div class="logo">
    <div class="logo-mark">B</div>
    <div class="logo-text"><b>BONITO</b><span>PULSE</span></div>
  </div>
  <nav class="nav">
    <div class="nav-item">Dashboard</div>
    <div class="nav-item active">Daily Tracker</div>
    <div class="nav-item">Tracker</div>
    <div class="nav-item active">Scripts</div>
    <div class="nav-item">Projects</div>
    <div class="nav-item">The Bonito Studio</div>
    <div class="nav-item active">Material Catalog</div>
    <div class="nav-item">All Products</div>
    <div class="nav-item">Create New Product</div>
    <div class="nav-item">All Product types</div>
    <div class="nav-item">All Product Categories</div>
    <div class="nav-item">All Product Brands</div>
    <div class="nav-item">Product Tags</div>
    <div class="nav-item">Bulk Product upload</div>
    <div class="nav-item">All Vendors</div>
  </nav>
</aside>'''

TOPBAR = '''<div class="topbar">
  <select class="select"><option>All category</option></select>
  <input class="search-input" placeholder="Search product" />
  <button class="btn-search">&#128269;</button>
  <select class="select"><option>Bengaluru</option></select>
  <button class="btn-qr">&#9881;</button>
  <button class="btn-qr">Generate QR Codes</button>
  <div class="right">
    <span>Search:</span>
    <input class="search-input" placeholder="Enter PID/Customer name" style="max-width:180px" />
    <div class="avatar">S</div>
  </div>
</div>
<div class="tabs">
  <div class="tab active">Studio 2</div>
  <div class="tab">Neo Modular</div>
  <div class="tab">Services</div>
</div>'''


def build_index():
    products = [
        {
            'href': 'product_metal_fabrication.html',
            'image': 'images/metal_fab.png',
            'title': 'Metal Fabrication',
            'price_html': 'Rs. 396.95 per rft',
        },
        {
            'href': 'product_prelam.html',
            'image': 'images/prelam.png',
            'title': 'Prelam - HDHMR',
            'price_html': 'Rs. 1,200 per sft',
        },
        {
            'href': 'product_gypsum.html',
            'image': 'images/gypsum.png',
            'title': 'Plain Gypsum False Ceiling',
            'price_html': 'Rs. 104.17 per sft',
        },
        {
            'href': 'product_shutters.html',
            'image': 'images/shutters.png',
            'title': 'Bonito Premium - Aluminium Profile Shutters',
            'price_html': 'Rs. 1,261.89 onwards',
        },
    ]

    cards_html = ''
    for p in products:
        cards_html += f'''<a class="product-card" href="{p['href']}">
      <div class="product-card-img"><img src="{p['image']}" alt="{p['title']}"></div>
      <div class="product-card-body">
        <div class="product-card-title">{p['title']}</div>
      </div>
      <div class="product-card-price">{p['price_html']}</div>
    </a>
'''

    html = HEAD_COMMON.format(title='Handbook Beta — app.bonito.in') + '\n' + BANNER_INDEX + '''
<div class="app">
''' + SIDEBAR + '''
  <div class="main">
''' + TOPBAR + f'''
    <div class="catalog-grid">
      {cards_html}
    </div>
  </div>
</div>
</body>
</html>'''
    with open(os.path.join(OUT_DIR, 'index.html'), 'w') as f:
        f.write(html)
    print(f"index.html written")


def build_product_page(filename, product):
    """Build a product page. `product` is a dict with all the configuration."""

    # Variant chips section
    variants_html = ''
    for v in product.get('variants', []):
        chips = ''.join(
            f'<div class="chip{" active" if i == 0 else ""}">{opt}</div>'
            for i, opt in enumerate(v['options'])
        )
        variants_html += f'''<div class="variant-row">
          <span class="label">{v['label']}</span>
          <div class="variant-chips">{chips}</div>
        </div>
'''

    # Numeric input rows (for gypsum-style horizontal/vertical panels)
    inputs_html = ''
    for inp in product.get('inputs', []):
        inputs_html += f'''<div class="input-row">
          <span class="label-lg">{inp['label']}</span>
          <input type="text" value="0">
          <span class="price-hint">{inp['hint']}</span>
        </div>
'''

    # Info grid (ERP code, brand, etc)
    info_rows = ''
    for lbl, val, css in product['info']:
        info_rows += f'<div class="lbl">{lbl}</div><div class="val{(" " + css) if css else ""}">{val}</div>'

    # Bottom tabs (Why This / Installation / Faq) — only for some products
    bottom_tabs_html = ''
    if product.get('bottom_tabs'):
        tabs_header = ''.join(
            f'<div class="tab-btn{" active" if i == 0 else ""}">{t["label"]}</div>'
            for i, t in enumerate(product['bottom_tabs'])
        )
        bottom_tabs_html = f'''<div class="bottom-tabs">
          <div class="bottom-tabs-header">{tabs_header}</div>
          <div class="bottom-tabs-body">{product['bottom_tabs'][0]['content']}</div>
        </div>'''

    # Build full HTML
    html = HEAD_COMMON.format(title=f"{product['name']} — app.bonito.in") + '\n' + BANNER_PRODUCT + '''
<div class="app">
''' + SIDEBAR + '''
  <div class="main">
''' + TOPBAR + f'''
    <div class="product-body">
      <div class="product-side">
        <div class="product-img-wrap">
          <div class="arrow-nav left">&lsaquo;</div>
          <img src="{product['image']}" alt="{product['name']}">
          <div class="arrow-nav right">&rsaquo;</div>
        </div>
      </div>

      <div class="details-side">
        <div class="product-title">{product['name']}</div>
        <div class="tags">{''.join(f'<span class="tag">{t}</span>' for t in product['tags'])}</div>

        {f'<div class="price-row deal"><span class="label"><b>Deal Price</b></span><span class="value">{product["deal_price"]}</span></div>' if product.get('deal_price') else ''}
        {f'<div class="price-row total"><span class="label"><b>Total Price</b> (with tax)</span><span class="value">{product["total_price"]}</span></div><hr>' if product.get('total_price') else ''}

        <div class="info-grid">
          {info_rows}
        </div>

        {variants_html}
        {inputs_html}

        <div class="field">
          <span class="field-label">Quantity</span>
          <input type="text" class="field-input" value="1">
        </div>

        <button class="btn-add-cart">Add to Cart</button>

        <button class="handbook-btn" onclick="openHandbook()">
          <div class="left-side">
            <div class="icon-circle">i</div>
            <div class="label-block">
              <div class="title">View Handbook</div>
              <div class="sub">{product['handbook_subtitle']}</div>
            </div>
          </div>
          <div class="arrow">&rarr;</div>
        </button>

        {bottom_tabs_html}
      </div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="handbookModal">
  <div class="modal">
    <div class="modal-header">
      <div class="left-info">
        <div class="icon-block">i</div>
        <div>
          <div class="eyebrow">HANDBOOK &middot; iLAB</div>
          <div class="h-title">{product['handbook_title']}</div>
          <div class="h-context">{product['name']} &middot; mapped at variant level</div>
        </div>
      </div>
      <button class="modal-close" onclick="closeHandbook()">&times;</button>
    </div>

    <iframe class="pdf-frame" src="{product['pdf']}#toolbar=1&navpanes=0" title="Handbook PDF"></iframe>

    <div class="modal-footer">
      <div class="source-info">
        <span class="pill">iLAB Handbook v1.4</span>
        <span>Source: {product['pdf_source']}</span>
      </div>
      <button class="got-it-btn" onclick="closeHandbook()">Got it, close</button>
    </div>
  </div>
</div>

<script src="script.js"></script>
</body>
</html>'''

    with open(os.path.join(OUT_DIR, filename), 'w') as f:
        f.write(html)
    print(f"{filename} written")


# ============== PRODUCT DEFINITIONS ==============

METAL_FAB = {
    'name': 'Metal Fabrication',
    'image': 'images/metal_fab.png',
    'tags': ['bengaluru', 'mumbai'],
    'deal_price': 'Rs. 396.95 per rft',
    'total_price': 'Rs. 468',
    'info': [
        ('ERP Code', 'MF20MMD16G', ''),
        ('Brand', 'Bonito Metal Fabrication', ''),
        ('Category', 'Metal Fabrication', ''),
        ('Availability', 'Available', 'green'),
        ('Order Type', 'Auto Order', ''),
        ('MOQ', '20 rft', ''),
        ('Lead Days', '15', ''),
    ],
    'variants': [
        {'label': 'Design', 'options': ['20 mm dia', '25 mm dia', '32 mm dia']},
    ],
    'handbook_subtitle': 'Quantity rules &middot; bending guide',
    'handbook_title': 'Curved Metal Fabrication',
    'pdf': 'pdfs/curved_metal_fabrication.pdf',
    'pdf_source': 'Curved_Metal_Fabrication.pptx &middot; uploaded 12 Apr 2026',
}

PRELAM = {
    'name': 'Prelam - HDHMR',
    'image': 'images/prelam.png',
    'tags': ['mumbai', 'bengaluru'],
    'info': [
        ('ERP Code', 'BD-PH-2026-0001', ''),
        ('Brand', 'HDHMR', ''),
        ('Category', 'Panels', ''),
    ],
    'variants': [
        {'label': 'Size', 'options': ['5.5mm - BSL', '16mm - BSL', '16mm - OSR']},
    ],
    'handbook_subtitle': 'Sizing &middot; finishes &middot; usage',
    'handbook_title': 'Prelam HDHMR Standards',
    'pdf': 'pdfs/prelam_handbook.pdf',
    'pdf_source': 'Prelam_HDHMR.pptx &middot; iLAB upload pending',
}

GYPSUM = {
    'name': 'Plain Gypsum False Ceiling',
    'image': 'images/gypsum.png',
    'tags': ['bengaluru', 'mumbai'],
    'deal_price': 'Rs. 1 per nos',
    'total_price': 'Rs. 1',
    'info': [
        ('ERP Code', 'PlainGypsumFalseCeiling', ''),
        ('Category', 'False ceiling', ''),
    ],
    'inputs': [
        {'label': 'Horizontal Panel (sft)', 'hint': '(Rs. 104.17)'},
        {'label': 'Vertical Panel - With Cove upto 6 inch (rft)', 'hint': '(Rs. 158.0)'},
        {'label': 'Vertical Panel - Without Cove (rft)', 'hint': '(Rs. 52.77)'},
    ],
    'handbook_subtitle': 'Material specs &middot; install steps',
    'handbook_title': 'Plain Gypsum False Ceiling',
    'pdf': 'pdfs/gypsum_handbook.pdf',
    'pdf_source': 'Plain_Gypsum_False_Ceiling.pptx &middot; iLAB upload pending',
    'bottom_tabs': [
        {'label': 'Why This', 'content': 'Gypsum is a soft, lightweight hydrated sulfate of calcium. It is a widely used material for false ceilings due to fire resistance, smooth finish, and ease of shaping into <b>curves, coves, and stepped designs</b>.'},
        {'label': 'Installation Instructions', 'content': 'Detailed installation steps will be shown here.'},
        {'label': 'Faq', 'content': 'Frequently asked questions about this product.'},
    ],
}

SHUTTERS = {
    'name': 'Bonito Premium - Aluminium Profile Shutters',
    'image': 'images/shutters.png',
    'tags': ['bengaluru', 'mumbai'],
    'total_price': '-',
    'info': [
        ('ERP Code', 'SlidingCTypeWood', ''),
        ('Brand', 'Aristo', ''),
        ('Category', 'Aluminium Profile Shutter', ''),
    ],
    'variants': [
        {'label': 'Shutter and Profile Type', 'options': [
            'Sliding C Type Wood', 'Sliding C Type Metal', 'Sliding Nova Metal',
            'Pivot Openable C Type Wood', 'Pivot Openable F Type Metal',
        ]},
        {'label': 'Profile Colour', 'options': ['White Oak', 'Country Oak', 'Noble Walnut']},
    ],
    'inputs': [
        {'label': 'Sliding C Type EVA 1 Wood', 'hint': '(Rs. 1,261.89)'},
        {'label': 'Sliding C Type MIA Wood', 'hint': '(Rs. 1,650.54)'},
        {'label': 'Sliding C Type LIZ 2 Wood', 'hint': '(Rs. 2,067.31)'},
    ],
    'handbook_subtitle': 'Profiles &middot; infills &middot; install',
    'handbook_title': 'Bonito Elite Openable Pivot Shutters',
    'pdf': 'pdfs/shutters_handbook.pdf',
    'pdf_source': 'Bonito_Elite_Pivot_Shutters.pptx &middot; iLAB upload pending',
}


if __name__ == '__main__':
    build_index()
    build_product_page('product_metal_fabrication.html', METAL_FAB)
    build_product_page('product_prelam.html', PRELAM)
    build_product_page('product_gypsum.html', GYPSUM)
    build_product_page('product_shutters.html', SHUTTERS)
    print('\nAll pages built. Files in:', OUT_DIR)
