// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database Helper Functions
class DatabaseService {
    // Products
    static async getProducts(limit = 20, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories (name),
                    product_images (image_url, is_primary, sort_order)
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    static async getProductsByCategory(categoryId, limit = 20) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories (name),
                    product_images (image_url, is_primary, sort_order)
                `)
                .eq('category_id', categoryId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return [];
        }
    }

    static async getFeaturedProducts(limit = 8) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories (name),
                    product_images (image_url, is_primary, sort_order)
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching featured products:', error);
            return [];
        }
    }

    // Categories
    static async getCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Admin Authentication
    static async authenticateAdmin(username, password) {
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('username', username)
                .single();
            
            if (error) throw error;
            
            // In production, use proper password hashing (bcrypt)
            // For now, simple comparison
            return data && data.password_hash === password;
        } catch (error) {
            console.error('Error authenticating admin:', error);
            return false;
        }
    }

    // Newsletter subscription
    static async subscribeNewsletter(email) {
        try {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email: email, subscribed_at: new Date().toISOString() }]);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            return false;
        }
    }

    // Search products
    static async searchProducts(query, limit = 20) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories (name),
                    product_images (image_url, is_primary, sort_order)
                `)
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('status', 'active')
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }

    // Product details
    static async getProductById(productId) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories (name),
                    product_images (image_url, is_primary, sort_order)
                `)
                .eq('id', productId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching product details:', error);
            return null;
        }
    }

    // Admin Operations
    static async createProduct(productData) {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating product:', error);
            return null;
        }
    }

    static async updateProduct(productId, productData) {
        try {
            const { data, error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating product:', error);
            return null;
        }
    }

    static async deleteProduct(productId) {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }

    // Product Images
    static async addProductImage(productId, imageUrl, isPrimary = false, sortOrder = 0) {
        try {
            const { data, error } = await supabase
                .from('product_images')
                .insert([{
                    product_id: productId,
                    image_url: imageUrl,
                    is_primary: isPrimary,
                    sort_order: sortOrder
                }]);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error adding product image:', error);
            return false;
        }
    }

    static async removeProductImage(imageId) {
        try {
            const { error } = await supabase
                .from('product_images')
                .delete()
                .eq('id', imageId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error removing product image:', error);
            return false;
        }
    }

    // Categories Admin
    static async createCategory(categoryData) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([categoryData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating category:', error);
            return null;
        }
    }

    static async updateCategory(categoryId, categoryData) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update(categoryData)
                .eq('id', categoryId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating category:', error);
            return null;
        }
    }

    static async deleteCategory(categoryId) {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            return false;
        }
    }
}

// Export for use in other files
window.DatabaseService = DatabaseService;