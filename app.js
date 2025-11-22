// 主应用入口文件
const { createApp, ref, onMounted, computed } = Vue;
const { createRouter, createWebHistory } = VueRouter;

// Supabase 配置
const SUPABASE_URL = 'https://nysrxrlwrlcfrbhutwtd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4cmx3cmxjZnJiaHV0d3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTQ4MzgsImV4cCI6MjA3OTM5MDgzOH0.598J9S18JqKaqYP5e1lR_oKtly0pyhCzZ3FRJS0rwRI';

// 创建 Supabase 客户端
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 模拟数据，以便在没有真实 Supabase 配置时也能运行
const mockProducts = [
    {
        id: '1',
        name: '智能手机 Pro Max',
        description: '最新款智能手机，配备高清摄像头和强大处理器',
        price: 4999.00,
        category_name: '电子产品',
        image_url: '',
        stock: 50,
        featured: true
    },
    {
        id: '2',
        name: '笔记本电脑 Ultra',
        description: '轻薄便携的高性能笔记本电脑',
        price: 7999.00,
        category_name: '电子产品',
        image_url: '',
        stock: 30,
        featured: true
    },
    {
        id: '3',
        name: '无线蓝牙耳机',
        description: '高品质音效，降噪功能，续航持久',
        price: 299.00,
        category_name: '电子产品',
        image_url: '',
        stock: 100,
        featured: false
    },
    {
        id: '4',
        name: '运动时尚T恤',
        description: '透气舒适，适合运动和日常穿着',
        price: 99.00,
        category_name: '服装鞋包',
        image_url: '',
        stock: 200,
        featured: false
    }
];

const mockCategories = [
    { id: '1', name: '电子产品' },
    { id: '2', name: '服装鞋包' },
    { id: '3', name: '家居生活' },
    { id: '4', name: '美妆护肤' },
    { id: '5', name: '运动户外' }
];

// 首页组件
const HomePage = {
    template: `
        <div class="home">
            <div class="hero">
                <h1>欢迎来到优选商城</h1>
                <p>发现品质生活，享受购物乐趣</p>
                <router-link to="/products" class="btn btn-primary">开始购物</router-link>
            </div>
            
            <section class="featured-products">
                <h2>精选产品</h2>
                <div class="products-grid" v-if="featuredProducts.length > 0">
                    <div v-for="product in featuredProducts" :key="product.id" class="product-card">
                        <div class="product-image"></div>
                        <div class="product-info">
                            <h3 class="product-title">{{ product.name }}</h3>
                            <p class="product-description">{{ product.description }}</p>
                            <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
                            <router-link :to="'/product/' + product.id" class="btn btn-primary">查看详情</router-link>
                        </div>
                    </div>
                </div>
                <div v-else class="loading">
                    <p>加载精选产品中...</p>
                </div>
            </section>
        </div>
    `,
    setup() {
        const featuredProducts = ref([]);
        const loading = ref(true);

        onMounted(async () => {
            console.log('🔄 开始加载精选产品...');
            loading.value = true;

            try {
                // 直接查询精选产品
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('featured', true)
                    .limit(6);

                console.log('📊 Supabase 精选产品查询结果:', { data, error });

                if (error) {
                    console.error('❌ Supabase 错误:', error);
                    featuredProducts.value = mockProducts.filter(p => p.featured);
                } else if (data && data.length > 0) {
                    console.log('✅ 使用真实精选产品数据:', data.length, '个产品');
                    featuredProducts.value = data;
                    loading.value = false;
                    return; // 早期返回，不再查询其他数据
                } else {
                    console.warn('⚠️ 没有精选产品，查询所有产品...');
                    
                    // 查询所有产品作为备用
                    const { data: allData, error: allError } = await supabase
                        .from('products')
                        .select('*')
                        .limit(6);
                    
                    if (!allError && allData && allData.length > 0) {
                        console.log('✅ 使用所有产品数据:', allData.length, '个产品');
                        featuredProducts.value = allData;
                    } else {
                        console.warn('⚠️ 数据库中没有产品，使用模拟数据');
                        featuredProducts.value = mockProducts.filter(p => p.featured);
                    }
                }
            } catch (error) {
                console.error('❌ 加载产品时发生异常:', error);
                featuredProducts.value = mockProducts.filter(p => p.featured);
            } finally {
                loading.value = false;
                console.log('🏁 首页加载完成:', featuredProducts.value.length, '个产品');
            }
        });

        return {
            featuredProducts,
            loading
        };
    }
};

// 产品列表页组件
const ProductsPage = {
    template: `
        <div class="products-page">
            <h1>产品列表</h1>
            
            <div class="categories">
                <button 
                    v-for="category in categories" 
                    :key="category.id"
                    @click="selectCategory(category.id)"
                    :class="['category-btn', { active: selectedCategory === category.id }]"
                >
                    {{ category.name }}
                </button>
                <button 
                    @click="selectCategory(null)"
                    :class="['category-btn', { active: selectedCategory === null }]"
                >
                    全部产品
                </button>
            </div>

            <div class="products-grid" v-if="filteredProducts.length > 0">
                <div v-for="product in filteredProducts" :key="product.id" class="product-card">
                    <div class="product-image"></div>
                    <div class="product-info">
                        <h3 class="product-title">{{ product.name }}</h3>
                        <p class="product-description">{{ product.description }}</p>
                        <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
                        <div class="product-detail">
                            <span>库存: {{ product.stock }}</span>
                        </div>
                        <router-link :to="'/product/' + product.id" class="btn btn-primary">查看详情</router-link>
                    </div>
                </div>
            </div>
            <div v-else class="loading">
                <p>{{ loading ? '加载产品中...' : '没有找到产品' }}</p>
            </div>
        </div>
    `,
    setup() {
        const products = ref([]);
        const categories = ref([]);
        const selectedCategory = ref(null);
        const loading = ref(true);

        const filteredProducts = computed(() => {
            if (!selectedCategory.value) {
                return products.value;
            }
            return products.value.filter(p => p.category_id === selectedCategory.value);
        });

        const loadProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*');

                console.log('产品查询结果:', { data, error });

                if (error) {
                    console.error('产品加载错误:', error);
                    products.value = mockProducts;
                } else if (data && data.length > 0) {
                    console.log('使用真实产品数据:', data);
                    products.value = data;
                } else {
                    console.log('产品数据为空，使用模拟数据');
                    products.value = mockProducts;
                }
            } catch (error) {
                console.error('产品加载异常:', error);
                products.value = mockProducts;
            }
        };

        const loadCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*');

                console.log('分类查询结果:', { data, error });

                if (error) {
                    console.error('分类加载错误:', error);
                    categories.value = mockCategories;
                } else if (data && data.length > 0) {
                    console.log('使用真实分类数据:', data);
                    categories.value = data;
                } else {
                    console.log('分类数据为空，使用模拟数据');
                    categories.value = mockCategories;
                }
            } catch (error) {
                console.error('分类加载异常:', error);
                categories.value = mockCategories;
            }
        };

        const selectCategory = (categoryId) => {
            selectedCategory.value = categoryId;
        };

        onMounted(async () => {
            await Promise.all([loadProducts(), loadCategories()]);
            loading.value = false;
        });

        return {
            products,
            categories,
            selectedCategory,
            filteredProducts,
            loading,
            selectCategory
        };
    }
};

// 产品详情页组件
const ProductDetailPage = {
    template: `
        <div class="product-detail" v-if="product">
            <div class="product-card">
                <div class="product-image"></div>
                <div class="product-info">
                    <h1 class="product-title">{{ product.name }}</h1>
                    <p class="product-description">{{ product.description }}</p>
                    <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
                    <div class="product-details">
                        <div class="product-detail">
                            <span><strong>库存:</strong> {{ product.stock }}</span>
                        </div>
                        <div class="product-detail">
                            <span><strong>分类:</strong> {{ product.category_name || '未分类' }}</span>
                        </div>
                    </div>
                    <div class="product-actions">
                        <div class="quantity-selector">
                            <button @click="decreaseQuantity" class="quantity-btn">-</button>
                            <span>{{ quantity }}</span>
                            <button @click="increaseQuantity" class="quantity-btn">+</button>
                        </div>
                        <button @click="addToCart" class="btn btn-primary" :disabled="quantity <= 0">
                            加入购物车
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="loading">
            <p>{{ loading ? '加载产品详情中...' : '产品不存在' }}</p>
        </div>
    `,
    setup() {
        const product = ref(null);
        const quantity = ref(1);
        const loading = ref(true);

        const loadProduct = async (productId) => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single();

                console.log('产品详情查询结果:', { productId, data, error });

                if (error) {
                    console.error('产品详情加载错误:', error);
                    product.value = mockProducts.find(p => p.id === productId);
                } else if (data) {
                    console.log('使用真实产品详情:', data);
                    product.value = data;
                } else {
                    console.log('产品详情不存在，使用模拟数据');
                    product.value = mockProducts.find(p => p.id === productId);
                }
            } catch (error) {
                console.error('产品详情加载异常:', error);
                product.value = mockProducts.find(p => p.id === productId);
            } finally {
                loading.value = false;
            }
        };

        const increaseQuantity = () => {
            if (quantity.value < product.value.stock) {
                quantity.value++;
            }
        };

        const decreaseQuantity = () => {
            if (quantity.value > 1) {
                quantity.value--;
            }
        };

        const addToCart = async () => {
            try {
                // 这里应该调用 Supabase 添加到购物车
                alert(`已将 ${quantity.value} 件 ${product.value.name} 加入购物车`);
                quantity.value = 1;
            } catch (error) {
                alert('添加到购物车失败，请重试');
            }
        };

        onMounted(() => {
            const productId = window.location.pathname.split('/').pop();
            loadProduct(productId);
        });

        return {
            product,
            quantity,
            loading,
            increaseQuantity,
            decreaseQuantity,
            addToCart
        };
    }
};

// 购物车页组件
const CartPage = {
    template: `
        <div class="cart-page">
            <h1>购物车</h1>
            
            <div class="cart-items" v-if="cartItems.length > 0">
                <div v-for="item in cartItems" :key="item.id" class="cart-item">
                    <div class="cart-item-image"></div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">{{ item.name }}</h3>
                        <p class="cart-item-price">¥{{ item.price.toFixed(2) }}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button @click="updateQuantity(item.id, item.quantity - 1)" class="quantity-btn">-</button>
                        <span>{{ item.quantity }}</span>
                        <button @click="updateQuantity(item.id, item.quantity + 1)" class="quantity-btn">+</button>
                        <button @click="removeItem(item.id)" class="btn btn-secondary" style="margin-left: 1rem;">删除</button>
                    </div>
                </div>
            </div>
            
            <div v-else class="empty-cart">
                <p>购物车是空的</p>
                <router-link to="/products" class="btn btn-primary">去购物</router-link>
            </div>
            
            <div class="cart-summary" v-if="cartItems.length > 0">
                <div class="cart-total">
                    <span>总计:</span>
                    <span>¥{{ totalPrice.toFixed(2) }}</span>
                </div>
                <button class="btn btn-primary" style="width: 100%;">结算</button>
            </div>
        </div>
    `,
    setup() {
        const cartItems = ref([]);

        const totalPrice = computed(() => {
            return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
        });

        const loadCartItems = async () => {
            try {
                // 模拟购物车数据
                cartItems.value = [
                    {
                        id: '1',
                        name: '智能手机 Pro Max',
                        price: 4999.00,
                        quantity: 1
                    }
                ];
            } catch (error) {
                console.error('加载购物车失败:', error);
            }
        };

        const updateQuantity = async (itemId, newQuantity) => {
            if (newQuantity <= 0) {
                removeItem(itemId);
                return;
            }
            
            const item = cartItems.value.find(item => item.id === itemId);
            if (item) {
                item.quantity = newQuantity;
            }
        };

        const removeItem = async (itemId) => {
            cartItems.value = cartItems.value.filter(item => item.id !== itemId);
        };

        onMounted(() => {
            loadCartItems();
        });

        return {
            cartItems,
            totalPrice,
            updateQuantity,
            removeItem
        };
    }
};

// 创建路由
const routes = [
    { path: '/', component: HomePage },
    { path: '/products', component: ProductsPage },
    { path: '/product/:id', component: ProductDetailPage },
    { path: '/cart', component: CartPage }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 创建应用
const app = createApp({
    setup() {
        return {};
    }
});

app.use(router);
app.mount('#app');