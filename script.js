// Product details modal
async function showProductDetails(productId) {
    try {
        const product = await DatabaseService.getProductById(productId);
        if (!product) return;

        const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
        const primaryImage = images.find(img => img.is_primary) || images[0];

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content product-modal">
                <div class="modal-header">
                    <h3>${product.name}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-images">
                        <div class="main-image">
                            ${primaryImage?.image_url ? 
                                `<img src="${primaryImage.image_url}" alt="${product.name}" />` :
                                `<div class="image-placeholder"></div>`
                            }
                        </div>
                        ${images.length > 1 ? `
                            <div class="thumbnail-images">
                                ${images.map((img, index) => `
                                    <img src="${img.image_url}" alt="${product.name}" 
                                         class="thumbnail ${img.is_primary ? 'active' : ''}" 
                                         onclick="switchMainImage('${img.image_url}')" />
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-info">
                        <p class="product-price">${product.price}</p>
                        <p class="product-description">${product.description || 'No description available.'}</p>
                        <div class="product-meta">
                            <p><strong>Category:</strong> ${product.categories?.name || 'Uncategorized'}</p>
                            <p><strong>Stock:</strong> ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
                        </div>
                        ${product.stock > 0 ? `
                            <div class="product-actions">
                                <button class="add-to-cart-btn" onclick="addToCart('${product.name}', ${product.id})">
                                    Add to Cart
                                </button>
                            </div>
                        ` : `
                            <button class="out-of-stock-btn" disabled>Out of Stock</button>
                        `}
                    </div>
                </div>
            </div>
        `;

        // Enhanced modal styles
        const modalStyles = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .product-modal {
                background: white;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            .modal-header h3 {
                margin: 0;
                font-size: 24px;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 30px;
            }
            .modal-images {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .main-image {
                aspect-ratio: 1;
                overflow: hidden;
            }
            .main-image img, .main-image .image-placeholder {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .thumbnail-images {
                display: flex;
                gap: 10px;
                overflow-x: auto;
            }
            .thumbnail {
                width: 60px;
                height: 60px;
                object-fit: cover;
                cursor: pointer;
                border: 2px solid transparent;
                transition: border-color 0.3s ease;
            }
            .thumbnail.active {
                border-color: #2c2c2c;
            }
            .modal-info {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .product-price {
                font-size: 28px;
                font-weight: 600;
                color: #2c2c2c;
            }
            .product-description {
                color: #666;
                line-height: 1.6;
            }
            .product-meta p {
                margin: 5px 0;
                color: #888;
            }
            .add-to-cart-btn, .out-of-stock-btn {
                background: #2c2c2c;
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 14px;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: background 0.3s ease;
                width: 100%;
            }
            .add-to-cart-btn:hover {
                background: #1a1a1a;
            }
            .out-of-stock-btn {
                background: #ccc;
                cursor: not-allowed;
            }
            .no-data-message, .error-message {
                grid-column: 1/-1;
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }
            .admin-link {
                display: inline-block;
                margin-top: 15px;
                color: #2c2c2c;
                text-decoration: none;
                padding: 10px 20px;
                border: 1px solid #2c2c2c;
                transition: all 0.3s ease;
            }
            .admin-link:hover {
                background: #2c2c2c;
                color: white;
            }
            .out-of-stock {
                color: #ff4444;
                font-size: 12px;
                font-weight: 500;
            }
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                }
            }
        `;

        // Add styles to head
        const styleSheet = document.createElement('style');
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);

        // Add modal to body
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal functionality
        const closeModal = () => {
            document.body.removeChild(modal);
            document.head.removeChild(styleSheet);
            document.body.style.overflow = '';
        };

        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

    } catch (error) {
        console.error('Error showing product details:', error);
    }
}

// Switch main image in product modal
function switchMainImage(imageUrl) {
    const mainImage = document.querySelector('.main-image img');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === imageUrl) {
            thumb.classList.add('active');
        }
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Navigation clicked:', this.textContent);
        });
    });

    // Newsletter subscription
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubscription);
    }

    // Search functionality
    const searchIcon = document.querySelector('.nav-icons .icon');
    if (searchIcon && searchIcon.textContent === '🔍') {
        searchIcon.addEventListener('click', showSearchBar);
    }
}

// Newsletter subscription handler
async function handleNewsletterSubscription(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('.email-input');
    const subscribeBtn = e.target.querySelector('.subscribe-btn');
    const email = emailInput.value.trim();
    
    if (!validateEmail(email)) {
        emailInput.style.borderColor = '#ff4444';
        setTimeout(() => {
            emailInput.style.borderColor = '';
        }, 2000);
        return;
    }

    // Show loading state
    subscribeBtn.textContent = 'Subscribing...';
    subscribeBtn.disabled = true;

    try {
        const success = await DatabaseService.subscribeNewsletter(email);
        
        if (success) {
            subscribeBtn.textContent = 'Subscribed!';
            subscribeBtn.style.background = '#4CAF50';
            emailInput.value = '';
        } else {
            throw new Error('Subscription failed');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        subscribeBtn.textContent = 'Error!';
        subscribeBtn.style.background = '#ff4444';
    }

    // Reset button after 2 seconds
    setTimeout(() => {
        subscribeBtn.textContent = 'Subscribe';
        subscribeBtn.style.background = '';
        subscribeBtn.disabled = false;
    }, 2000);
}// Fashion Site Interactive Features with Supabase Integration

// Cart functionality
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    await loadCategories();
    await loadFeaturedProducts();
    initializeEventListeners();
    lazyLoadImages();
});

// Load categories from database
async function loadCategories() {
    try {
        const categories = await DatabaseService.getCategories();
        const categoryGrid = document.getElementById('categoryGrid');
        
        if (categories.length === 0) {
            // Show message when no categories exist
            categoryGrid.innerHTML = `
                <div class="no-data-message">
                    <p>No categories available yet. Admin can add categories from the dashboard.</p>
                    <a href="admin.html" class="admin-link">Go to Admin Dashboard</a>
                </div>
            `;
            return;
        }

        categoryGrid.innerHTML = categories.map(category => `
            <div class="category-item" data-category-id="${category.id}">
                <div class="category-image">
                    ${category.image_url ? 
                        `<img src="${category.image_url}" alt="${category.name}" />` :
                        `<div class="image-placeholder"></div>`
                    }
                </div>
                <h3>${category.name}</h3>
                <p>${category.description || 'Explore Collection'}</p>
            </div>
        `).join('');

        // Add click handlers for categories
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', function() {
                const categoryId = this.dataset.categoryId;
                loadProductsByCategory(categoryId);
            });
        });

    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categoryGrid').innerHTML = `
            <div class="error-message">
                <p>Error loading categories. Please try again later.</p>
            </div>
        `;
    }
}

// Load featured products from database
async function loadFeaturedProducts() {
    try {
        const products = await DatabaseService.getFeaturedProducts(8);
        const productGrid = document.getElementById('productGrid');
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="no-data-message">
                    <p>No products available yet. Admin can add products from the dashboard.</p>
                    <a href="admin.html" class="admin-link">Go to Admin Dashboard</a>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = products.map(product => {
            const primaryImage = product.product_images?.find(img => img.is_primary) || 
                               product.product_images?.[0];
            const imageUrl = primaryImage?.image_url || '';
            
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image">
                        ${imageUrl ? 
                            `<img src="${imageUrl}" alt="${product.name}" />` :
                            `<div class="image-placeholder"></div>`
                        }
                        <div class="product-overlay">
                            <button class="quick-view" onclick="showProductDetails(${product.id})">Quick View</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">${product.price}</p>
                        ${product.stock <= 0 ? '<p class="out-of-stock">Out of Stock</p>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Initialize product animations
        initializeProductAnimations();

    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productGrid').innerHTML = `
            <div class="error-message">
                <p>Error loading products. Please try again later.</p>
            </div>
        `;
    }
}

// Load products by category
async function loadProductsByCategory(categoryId) {
    try {
        const products = await DatabaseService.getProductsByCategory(categoryId);
        const productGrid = document.getElementById('productGrid');
        
        // Update section title
        const sectionTitle = document.querySelector('.featured-products .section-title');
        const category = await DatabaseService.getCategories();
        const selectedCategory = category.find(cat => cat.id == categoryId);
        if (selectedCategory) {
            sectionTitle.textContent = selectedCategory.name;
        }

        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="no-data-message">
                    <p>No products in this category yet.</p>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = products.map(product => {
            const primaryImage = product.product_images?.find(img => img.is_primary) || 
                               product.product_images?.[0];
            const imageUrl = primaryImage?.image_url || '';
            
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image">
                        ${imageUrl ? 
                            `<img src="${imageUrl}" alt="${product.name}" />` :
                            `<div class="image-placeholder"></div>`
                        }
                        <div class="product-overlay">
                            <button class="quick-view" onclick="showProductDetails(${product.id})">Quick View</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="price">${product.price}</p>
                        ${product.stock <= 0 ? '<p class="out-of-stock">Out of Stock</p>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to products section
        document.querySelector('.featured-products').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error loading category products:', error);
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        // Add smooth scrolling logic here when you have target sections
        console.log('Navigation clicked:', this.textContent);
    });
});

// Product interaction
document.querySelectorAll('.quick-view').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        
        // Simulate quick view modal
        showQuickView(productName);
    });
});

// Category item interactions
document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', function() {
        const categoryName = this.querySelector('h3').textContent;
        console.log('Category clicked:', categoryName);
        
        // Add visual feedback
        this.style.transform = 'translateY(-5px)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
});

// Newsletter subscription
const newsletterForm = document.querySelector('.newsletter-form');
const emailInput = document.querySelector('.email-input');
const subscribeBtn = document.querySelector('.subscribe-btn');

newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    if (validateEmail(email)) {
        // Simulate successful subscription
        subscribeBtn.textContent = 'Subscribed!';
        subscribeBtn.style.background = '#4CAF50';
        emailInput.value = '';
        
        setTimeout(() => {
            subscribeBtn.textContent = 'Subscribe';
            subscribeBtn.style.background = '';
        }, 2000);
    } else {
        // Show error
        emailInput.style.borderColor = '#ff4444';
        setTimeout(() => {
            emailInput.style.borderColor = '';
        }, 2000);
    }
});

// Add to cart functionality
function addToCart(productName, productId) {
    cartCount++;
    cartCountElement.textContent = cartCount;
    
    // Add animation to cart icon
    cartCountElement.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCountElement.style.transform = 'scale(1)';
    }, 200);
    
    // Store cart items in memory (you can extend this to use localStorage or send to backend)
    if (!window.cartItems) {
        window.cartItems = [];
    }
    
    // Check if item already exists in cart
    const existingItem = window.cartItems.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        window.cartItems.push({
            productId: productId,
            name: productName,
            quantity: 1
        });
    }
    
    console.log('Added to cart:', productName);
    
    // Show success message
    showToast(`${productName} added to cart!`);
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    const toastStyles = `
        .toast {
            position: fixed;
            top: 100px;
            right: 20px;
            background: #2c2c2c;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = toastStyles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
                document.head.removeChild(styleSheet);
            }
        }, 300);
    }, 3000);
}

// Search functionality
async function showSearchBar() {
    const searchBar = document.createElement('div');
    searchBar.className = 'search-overlay';
    searchBar.innerHTML = `
        <div class="search-container">
            <input type="text" placeholder="Search products..." class="search-input" autofocus>
            <button class="search-close">&times;</button>
        </div>
        <div class="search-suggestions">
            <div class="suggestion" data-query="dress">Dresses</div>
            <div class="suggestion" data-query="shoes">Footwear</div>
            <div class="suggestion" data-query="jewelry">Jewelry</div>
            <div class="suggestion" data-query="accessories">Accessories</div>
        </div>
        <div class="search-results" id="searchResults"></div>
    `;

    const searchStyles = `
        .search-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.98);
            backdrop-filter: blur(10px);
            z-index: 2000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow-y: auto;
        }
        .search-container {
            display: flex;
            align-items: center;
            max-width: 500px;
            width: 90%;
            margin-bottom: 40px;
        }
        .search-input {
            flex: 1;
            padding: 20px;
            border: none;
            border-bottom: 2px solid #2c2c2c;
            background: transparent;
            font-size: 24px;
            outline: none;
            color: #2c2c2c;
        }
        .search-close {
            background: none;
            border: none;
            font-size: 30px;
            margin-left: 20px;
            cursor: pointer;
            color: #2c2c2c;
        }
        .search-suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
            margin-bottom: 40px;
        }
        .suggestion {
            padding: 10px 20px;
            border: 1px solid #ddd;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            letter-spacing: 0.5px;
        }
        .suggestion:hover {
            background: #2c2c2c;
            color: white;
            border-color: #2c2c2c;
        }
        .search-results {
            max-width: 800px;
            width: 90%;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
        }
        .search-result-item {
            border: 1px solid #eee;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .search-result-item:hover {
            border-color: #2c2c2c;
            transform: translateY(-2px);
        }
        .search-result-image {
            width: 100%;
            height: 150px;
            margin-bottom: 10px;
        }
        .search-result-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = searchStyles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(searchBar);
    document.body.style.overflow = 'hidden';

    const searchInput = searchBar.querySelector('.search-input');
    const searchResults = searchBar.querySelector('#searchResults');

    // Real-time search
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        searchTimeout = setTimeout(async () => {
            await performSearch(query, searchResults);
        }, 300);
    });

    const closeSearch = () => {
        document.body.removeChild(searchBar);
        document.head.removeChild(styleSheet);
        document.body.style.overflow = '';
    };

    searchBar.querySelector('.search-close').addEventListener('click', closeSearch);
    
    // Close on escape key
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeSearch();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);

    // Handle suggestion clicks
    searchBar.querySelectorAll('.suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', async function() {
            const query = this.dataset.query;
            searchInput.value = query;
            await performSearch(query, searchResults);
        });
    });
}

// Perform search
async function performSearch(query, resultsContainer) {
    try {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #666;">Searching...</p>';
        
        const products = await DatabaseService.searchProducts(query);
        
        if (products.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #666;">No products found.</p>';
            return;
        }

        resultsContainer.innerHTML = products.map(product => {
            const primaryImage = product.product_images?.find(img => img.is_primary) || 
                               product.product_images?.[0];
            const imageUrl = primaryImage?.image_url || '';
            
            return `
                <div class="search-result-item" onclick="showProductDetails(${product.id})">
                    <div class="search-result-image">
                        ${imageUrl ? 
                            `<img src="${imageUrl}" alt="${product.name}" />` :
                            `<div class="image-placeholder"></div>`
                        }
                    </div>
                    <h4>${product.name}</h4>
                    <p>${product.price}</p>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = '<p style="text-align: center; color: #ff4444;">Search error. Please try again.</p>';
    }
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Product animations
function initializeProductAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Set initial state for animations
    const animatedElements = document.querySelectorAll('.product-card, .category-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Navbar scroll effect
window.addEventListener('scroll', debounce(function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}, 10));

// Lazy loading for images
function lazyLoadImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('LUXE Fashion Site Loaded Successfully with Supabase Integration!');