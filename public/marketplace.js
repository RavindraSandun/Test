const API_BASE = '/api/public/store';

let allProducts = [];
let storeWhatsappNumber = '';

document.addEventListener('DOMContentLoaded', async () => {
    // Determine the business name from the URL path
    const pathParts = window.location.pathname.split('/').filter(p => p !== '');
    // Get the last part of the path (business name). 
    let businessNameRaw = pathParts[pathParts.length - 1];

    // Decode URL properly to handle spaces (like User%20Store -> User Store)
    let businessName = businessNameRaw ? decodeURIComponent(businessNameRaw) : '';

    // If empty path somehow, just alert
    if (!businessName || businessName === '/') {
        showError('Invalid Store URL');
        return;
    }

    try {
        // fetch the encoded name
        const res = await fetch(`${API_BASE}/${encodeURIComponent(businessName)}`);

        if (!res.ok) {
            throw new Error('Store not found or marketplace is disabled');
        }

        const data = await res.json();

        // Update header
        document.title = `${data.business_name} - Marketplace`;
        document.getElementById('store-name').textContent = data.business_name;

        allProducts = data.products;
        storeWhatsappNumber = data.whatsapp_number || '94711234567'; // Fallback if old user

        document.getElementById('loading-spinner').style.display = 'none';

        renderProducts(allProducts);

        // Setup Close Detail
        document.getElementById('btn-close-detail').addEventListener('click', closeDetail);
        document.getElementById('product-detail-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'product-detail-overlay') closeDetail();
        });

    } catch (err) {
        showError(err.message);
    }

    // Setup Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => p.name.toLowerCase().includes(term));
        renderProducts(filtered);
    });
});

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const noProducts = document.getElementById('no-products');

    grid.innerHTML = '';

    if (products.length === 0) {
        noProducts.style.display = 'block';
    } else {
        noProducts.style.display = 'none';

        products.forEach(p => {
            const formatCurrency = (amount) => {
                return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'LKR' }).format(amount).replace('LKR', 'Rs.');
            };

            const card = document.createElement('div');
            card.className = 'product-card';

            let imgHTML = '';
            if (p.image) {
                imgHTML = `<div class="product-image" style="background-image: url('${p.image}')"></div>`;
            } else {
                imgHTML = `<div class="product-image"><i class='bx bx-image'></i></div>`;
            }

            card.innerHTML = `
                ${imgHTML}
                <div class="product-details">
                    <div class="product-name">${p.name}</div>
                    <div class="product-price">${formatCurrency(p.price)}</div>
                </div>
            `;

            // Add Detail click handler
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                showDetail(p);
            });

            grid.appendChild(card);
        });
    }
}

function showDetail(product) {
    const overlay = document.getElementById('product-detail-overlay');
    const name = document.getElementById('detail-name');
    const price = document.getElementById('detail-price');
    const desc = document.getElementById('detail-description');
    const image = document.getElementById('detail-image');
    const btnWhatsapp = document.getElementById('btn-order-whatsapp');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'LKR' }).format(amount).replace('LKR', 'Rs.');
    };

    name.textContent = product.name;
    price.textContent = formatCurrency(product.price);
    desc.textContent = product.description || 'Experience the quality of our premium products.';

    if (product.image) {
        image.style.backgroundImage = `url('${product.image}')`;
        image.innerHTML = '';
    } else {
        image.style.backgroundImage = 'none';
        image.innerHTML = "<i class='bx bx-image' style='font-size: 80px; color: #cbd5e1;'></i>";
    }

    // Update WhatsApp Button
    btnWhatsapp.onclick = () => {
        const cleanPhone = storeWhatsappNumber.replace(/[^0-9]/g, '');
        const message = `Hi! I want to order:\n\n*Product:* ${product.name}\n*Price:* ${formatCurrency(product.price)}\n\nIs this available?`;
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeDetail() {
    const overlay = document.getElementById('product-detail-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}




function showError(msg) {
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('store-name').textContent = 'Store Unavailable';

    const grid = document.getElementById('products-grid');
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">
        <i class='bx bx-error-circle' style="font-size: 64px; margin-bottom: 20px;"></i>
        <h2>${msg}</h2>
        <p>This store might not exist or the owner has disabled their marketplace.</p>
    </div>`;
}
