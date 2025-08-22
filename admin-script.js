// Admin Dashboard JavaScript

// Global variables
let currentUser = null;
let currentSection = 'overview';

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkAuthStatus();
});

// Event Listeners
function initializeEventListeners() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleQuickAction(action);
        });
    });
    
    // Add buttons
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => showAddCategoryModal());
    document.getElementById('addProductBtn')?.addEventListener('click', () => showAddProductModal());
    
    // Modal controls
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = e.target.querySelector('.login-btn');
    const errorDiv = document.getElementById('loginError');
    
    // Show loading state
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    errorDiv.textContent = '';
    
    try {
        // For now, use simple authentication - in production, use proper hashing
        if (username === 'admin' && password === 'admin123') {
            currentUser = { username: username };
            showDashboard();
            await loadDashboardData();
        } else {
            // Try database authentication
            const isAuthenticated = await DatabaseService.authenticateAdmin(username, password);
            if (isAuthenticated) {
                currentUser = { username: username };
                showDashboard();
                await loadDashboardData();
            } else {
                throw new Error('Invalid credentials');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Invalid username or password';
    } finally {
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
    }
}

function handleLogout() {
    currentUser = null;
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function checkAuthStatus() {
    // Check if user is already logged in (simple check)
    if (currentUser) {
        showDashboard();
        loadDashboardData();
    }
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminUsername').textContent = currentUser.username;
    showSection('overview');
}

// Section Management
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionName);
    const navLink = document.querySelector(`[data-section="${sectionName}"]`);
    
    if (section) {
        section.classList.add('active');
        currentSection = sectionName;
    }
    
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Load section-specific data
    loadSectionData(sectionName);
}

async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'overview':
            await loadOverviewData();
            break;
        case 'categories':
            await loadCategories();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'feedback':
            await loadFeedback();
            break;
        case 'analytics':
            await loadAnalytics();
            break;
    }
}

// Dashboard Data Loading
async function loadDashboardData() {
    await loadOverviewData();
}

async function loadOverviewData() {
    try {
        // Load statistics
        const [products, categories, orders, users] = await Promise.all([
            DatabaseService.getProducts(),
            DatabaseService.getCategories(),
            [], // DatabaseService.getOrders() - implement when needed
            [] // DatabaseService.getUsers() - implement when needed
        ]);
        
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalCategories').textContent = categories.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalUsers').textContent = users.length;
        
    } catch (error) {
        console.error('Error loading overview data:', error);
    }
}

// Categories Management
async function loadCategories() {
    try {
        const categories = await DatabaseService.getCategories();
        const tbody = document.querySelector('#categoriesTable tbody');
        
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No categories found. <button onclick="showAddCategoryModal()" class="primary-btn">Add First Category</button></td></tr>';
            return;
        }
        
        tbody.innerHTML = categories.map(category => `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description || '-'}</td>
                <td>${new Date(category.created_at).toLocaleDateString()}</td>
                <td class="action-buttons-cell">
                    <button class="btn-edit" onclick="editCategory(${category.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteCategory(${category.id})">Delete</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading categories:', error);
        const tbody = document.querySelector('#categoriesTable tbody');
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Error loading categories</td></tr>';
    }
}

// Products Management
async function loadProducts() {
    try {
        const products = await DatabaseService.getProducts();
        const tbody = document.querySelector('#productsTable tbody');
        
        // Load categories for filter
        const categories = await DatabaseService.getCategories();
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No products found. <button onclick="showAddProductModal()" class="primary-btn">Add First Product</button></td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => {
            const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
            
            return `
                <tr>
                    <td>${product.id}</td>
                    <td>
                        ${primaryImage?.image_url ? 
                            `<img src="${primaryImage.image_url}" alt="${product.name}" class="product-image-thumb">` :
                            '<div style="width:50px;height:50px;background:#f0f0f0;border-radius:4px;"></div>'
                        }
                    </td>
                    <td>${product.name}</td>
                    <td>${product.categories?.name || 'Uncategorized'}</td>
                    <td>${product.price}</td>
                    <td>${product.stock}</td>
                    <td><span class="status-badge status-${product.status}">${product.status}</span></td>
                    <td class="action-buttons-cell">
                        <button class="btn-view" onclick="viewProduct(${product.id})">View</button>
                        <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add search functionality
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterProducts(this.value);
            });
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Error loading products</td></tr>';
    }
}

function filterProducts(searchTerm) {
    const rows = document.querySelectorAll('#productsTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

// Orders, Users, Feedback, Analytics (Placeholder implementations)
async function loadOrders() {
    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No orders found</td></tr>';
}

async function loadUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found</td></tr>';
}

async function loadFeedback() {
    const tbody = document.querySelector('#feedbackTable tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No feedback found</td></tr>';
    document.getElementById('avgRating').textContent = '0.0';
    document.getElementById('totalReviews').textContent = '0';
}

async function loadAnalytics() {
    // Placeholder for analytics
    console.log('Analytics loaded');
}

// Quick Actions
function handleQuickAction(action) {
    switch (action) {
        case 'add-product':
            showAddProductModal();
            break;
        case 'add-category':
            showAddCategoryModal();
            break;
        case 'view-orders':
            showSection('orders');
            break;
    }
}

// Modal Management
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// Category Modals
function showAddCategoryModal() {
    const content = `
        <form id="categoryForm">
            <div class="form-group">
                <label for="categoryName">Category Name *</label>
                <input type="text" id="categoryName" name="name" required>
            </div>
            <div class="form-group">
                <label for="categoryDescription">Description</label>
                <textarea id="categoryDescription" name="description" placeholder="Optional category description"></textarea>
            </div>
            <div class="form-group">
                <label for="categoryImage">Image URL</label>
                <input type="url" id="categoryImage" name="image_url" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Add Category</button>
            </div>
        </form>
    `;
    
    showModal('Add New Category', content);
    
    // Handle form submission
    document.getElementById('categoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const categoryData = {
            name: formData.get('name'),
            description: formData.get('description'),
            image_url: formData.get('image_url') || null,
            created_at: new Date().toISOString()
        };
        
        try {
            await DatabaseService.createCategory(categoryData);
            closeModal();
            await loadCategories();
            showNotification('Category added successfully!', 'success');
        } catch (error) {
            console.error('Error adding category:', error);
            showNotification('Error adding category', 'error');
        }
    });
}

// Product Modals
function showAddProductModal() {
    const content = `
        <form id="productForm">
            <div class="form-grid">
                <div class="form-group">
                    <label for="productName">Product Name *</label>
                    <input type="text" id="productName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="productPrice">Price *</label>
                    <input type="number" id="productPrice" name="price" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="productCategory">Category</label>
                    <select id="productCategory" name="category_id">
                        <option value="">Select Category</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="productStock">Stock</label>
                    <input type="number" id="productStock" name="stock" value="0">
                </div>
                <div class="form-group">
                    <label for="productStatus">Status</label>
                    <select id="productStatus" name="status">
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                    </select>
                </div>
            </div>
            <div class="form-group form-group-full">
                <label for="productDescription">Description</label>
                <textarea id="productDescription" name="description" placeholder="Product description"></textarea>
            </div>
            <div class="form-group form-group-full">
                <label>Product Images</label>
                <div class="image-upload-area">
                    <p>Add image URLs (one per line)</p>
                    <textarea id="productImages" placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"></textarea>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="primary-btn">Add Product</button>
            </div>
        </form>
    `;
    
    showModal('Add New Product', content);
    
    // Load categories for dropdown
    DatabaseService.getCategories().then(categories => {
        const select = document.getElementById('productCategory');
        select.innerHTML = '<option value="">Select Category</option>' + 
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    });
    
    // Handle form submission
    document.getElementById('productForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category_id: formData.get('category_id') || null,
            stock: parseInt(formData.get('stock')) || 0,
            status: formData.get('status'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        try {
            const product = await DatabaseService.createProduct(productData);
            
            // Handle images
            const imageUrls = document.getElementById('productImages').value
                .split('\n')
                .filter(url => url.trim())
                .map(url => url.trim());
            
            for (let i = 0; i < imageUrls.length; i++) {
                await DatabaseService.addProductImage(product.id, imageUrls[i], i === 0, i);
            }
            
            closeModal();
            await loadProducts();
            showNotification('Product added successfully!', 'success');
        } catch (error) {
            console.error('Error adding product:', error);
            showNotification('Error adding product', 'error');
        }
    });
}

// CRUD Operations
async function editCategory(categoryId) {
    // Implement edit category functionality
    showNotification('Edit category functionality to be implemented', 'info');
}

async function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            await DatabaseService.deleteCategory(categoryId);
            await loadCategories();
            showNotification('Category deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting category:', error);
            showNotification('Error deleting category', 'error');
        }
    }
}

async function viewProduct(productId) {
    // Implement view product functionality
    showNotification('View product functionality to be implemented', 'info');
}

async function editProduct(productId) {
    // Implement edit product functionality
    showNotification('Edit product functionality to be implemented', 'info');
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await DatabaseService.deleteProduct(productId);
            await loadProducts();
            showNotification('Product deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Error deleting product', 'error');
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const styles = `
        .notification {
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 2000;
            animation: slideInRight 0.3s ease;
        }
        .notification-success { background: #48bb78; }
        .notification-error { background: #e53e3e; }
        .notification-info { background: #4299e1; }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                document.head.removeChild(styleSheet);
            }
        }, 300);
    }, 3000);
}

console.log('Admin Dashboard Loaded Successfully!');