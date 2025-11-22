// 修复版本 - 强制重新加载
const { createApp, ref, onMounted, computed } = Vue;
const { createRouter, createWebHistory } = VueRouter;

// Supabase 配置
const SUPABASE_URL = 'https://nysrxrlwrlcfrbhutwtd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4cmx3cmxjZnJiaHV0d3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTQ4MzgsImV4cCI6MjA3OTM5MDgzOH0.598J9S18JqKaqYP5e1lR_oKtly0pyhCzZ3FRJS0rwRI';

// 创建 Supabase 客户端
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 app-v2.js 启动 - 强制刷新版本');
console.log('📡 Supabase URL:', SUPABASE_URL);
console.log('🔑 API Key:', SUPABASE_ANON_KEY.substring(0, 10) + '...');

// 模拟数据（备用）
const mockProducts = [
    {
        id: 'mock-1-v2',
        name: '智能手机 Pro Max (模拟-v2)',
        description: '最新款智能手机，配备高清摄像头和强大处理器',
        price: 4999.00,
        category_name: '电子产品',
        image_url: '',
        stock: 50,
        featured: true
    },
    {
        id: 'mock-2-v2',
        name: '笔记本电脑 Ultra (模拟-v2)',
        description: '轻薄便携的高性能笔记本电脑',
        price: 7999.00,
        category_name: '电子产品',
        image_url: '',
        stock: 30,
        featured: true
    }
];

const mockCategories = [
    { id: '1', name: '电子产品' },
    { id: '2', name: '服装鞋包' },
    { id: '3', name: '家居生活' },
    { id: '4', name: '美妆护肤' },
    { id: '5', name: '运动户外' }
];

// 首页组件 - 强制修复版
const HomePage = {
    template: `
        <div class="home">
            <div class="hero">
                <h1>欢迎来到优选商城 (V2)</h1>
                <p>发现品质生活，享受购物乐趣</p>
                <router-link to="/products" class="btn btn-primary">开始购物</router-link>
            </div>
            
            <section class="featured-products">
                <h2>精选产品 (V2修复版)</h2>
                <div v-if="loading" class="loading">
                    <p>加载精选产品中...</p>
                </div>
                <div v-else-if="featuredProducts.length > 0" class="products-grid">
                    <div v-for="product in featuredProducts" :key="product.id" class="product-card">
                        <div class="product-image"></div>
                        <div class="product-info">
                            <h3 class="product-title">{{ product.name }}</h3>
                            <p class="product-description">{{ product.description }}</p>
                            <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
                            <div style="background: #007bff; color: white; padding: 5px; border-radius: 3px; margin: 5px 0; font-size: 12px;">
                                🎯 数据源: {{ dataSource }}
                            </div>
                            <router-link :to="'/product/' + product.id" class="btn btn-primary">查看详情</router-link>
                        </div>
                    </div>
                </div>
                <div v-else class="loading">
                    <p>没有找到产品</p>
                    <button @click="forceReload" class="btn btn-primary">强制重新加载</button>
                </div>
            </section>
        </div>
    `,
    setup() {
        const featuredProducts = ref([]);
        const loading = ref(true);
        const dataSource = ref('未知');

        const forceReload = async () => {
            console.log('🔄 强制重新加载...');
            loading.value = true;
            await loadData();
        };

        const loadData = async () => {
            console.log('🔄 V2版本开始加载精选产品...');
            loading.value = true;

            try {
                // 直接查询精选产品
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('featured', true)
                    .limit(6);

                console.log('📊 V2 Supabase 精选产品查询结果:', { data, error });

                if (error) {
                    console.error('❌ V2 Supabase 错误:', error);
                    featuredProducts.value = mockProducts.filter(p => p.featured);
                    dataSource.value = '模拟数据 (V2 - 查询错误)';
                } else if (data && data.length > 0) {
                    console.log('✅ V2 使用真实精选产品数据:', data.length, '个产品');
                    featuredProducts.value = data;
                    dataSource.value = '真实 Supabase 数据 (V2)';
                    loading.value = false;
                    return;
                } else {
                    console.warn('⚠️ V2 没有精选产品，查询所有产品...');
                    
                    const { data: allData, error: allError } = await supabase
                        .from('products')
                        .select('*')
                        .limit(6);
                    
                    if (!allError && allData && allData.length > 0) {
                        console.log('✅ V2 使用所有产品数据:', allData.length, '个产品');
                        featuredProducts.value = allData;
                        dataSource.value = '所有产品数据 (V2 - 备用)';
                    } else {
                        console.warn('⚠️ V2 数据库中没有产品，使用模拟数据');
                        featuredProducts.value = mockProducts.filter(p => p.featured);
                        dataSource.value = '模拟数据 (V2 - 无数据库数据)';
                    }
                }
            } catch (error) {
                console.error('❌ V2 加载产品时发生异常:', error);
                featuredProducts.value = mockProducts.filter(p => p.featured);
                dataSource.value = '模拟数据 (V2 - 异常)';
            } finally {
                loading.value = false;
                console.log('🏁 V2 首页加载完成:', {
                    产品数量: featuredProducts.value.length,
                    数据源: dataSource.value
                });
            }
        };

        onMounted(() => {
            console.log('🏠 V2 首页组件挂载');
            setTimeout(loadData, 1000); // 延迟1秒加载
        });

        return {
            featuredProducts,
            loading,
            dataSource,
            forceReload
        };
    }
};

// 产品列表页组件
const ProductsPage = {
    template: `
        <div class="products-page">
            <h1>所有产品 (V2)</h1>
            <div v-if="loading" class="loading">
                <p>加载产品中...</p>
            </div>
            <div v-else-if="products.length > 0" class="products-grid">
                <div v-for="product in products" :key="product.id" class="product-card">
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
                <p>没有找到产品</p>
            </div>
        </div>
    `,
    setup() {
        const products = ref([]);
        const loading = ref(true);

        onMounted(async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*');

                if (error) {
                    console.error('V2 产品列表错误:', error);
                    products.value = mockProducts;
                } else {
                    console.log('✅ V2 产品列表加载成功:', data?.length || 0, '个产品');
                    products.value = data || [];
                }
            } catch (error) {
                console.error('V2 产品列表异常:', error);
                products.value = mockProducts;
            } finally {
                loading.value = false;
            }
        });

        return { products, loading };
    }
};

// 购物车页面
const CartPage = {
    template: `
        <div class="cart-page">
            <h1>购物车 (V2)</h1>
            <div class="cart-items">
                <p>购物车功能开发中...</p>
            </div>
        </div>
    `,
    setup() {
        return {};
    }
};

// 创建路由
const routes = [
    { path: '/', component: HomePage },
    { path: '/products', component: ProductsPage },
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

console.log('✅ V2 应用启动完成');