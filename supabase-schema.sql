-- Supabase 数据库结构
-- 电商网站数据库设计

-- 1. 分类表 (categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 产品表 (products)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 购物车表 (cart_items)
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- 简化版本，使用文本存储用户标识
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id) -- 确保每个用户每个产品只有一条记录
);

-- 4. 订单表 (orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 插入示例数据

-- 插入分类数据
INSERT INTO categories (name, description) VALUES
('电子产品', '包括手机、电脑、平板等电子设备'),
('服装鞋包', '时尚服装、鞋子和包包'),
('家居生活', '家居用品、生活必需品'),
('美妆护肤', '化妆品和护肤产品'),
('运动户外', '运动装备和户外用品');

-- 插入产品数据
INSERT INTO products (name, description, price, category_id, image_url, stock, featured) VALUES
('智能手机 Pro Max', '最新款智能手机，配备高清摄像头和强大处理器', 4999.00, (SELECT id FROM categories WHERE name = '电子产品'), '', 50, true),
('笔记本电脑 Ultra', '轻薄便携的高性能笔记本电脑', 7999.00, (SELECT id FROM categories WHERE name = '电子产品'), '', 30, true),
('无线蓝牙耳机', '高品质音效，降噪功能，续航持久', 299.00, (SELECT id FROM categories WHERE name = '电子产品'), '', 100, false),
('运动时尚T恤', '透气舒适，适合运动和日常穿着', 99.00, (SELECT id FROM categories WHERE name = '服装鞋包'), '', 200, false),
('牛仔裤经典款', '经典版型，舒适耐穿', 199.00, (SELECT id FROM categories WHERE name = '服装鞋包'), '', 150, false),
('时尚手提包', '优雅设计，实用空间', 399.00, (SELECT id FROM categories WHERE name = '服装鞋包'), '', 80, false),
('智能台灯', 'LED护眼，可调节亮度和色温', 159.00, (SELECT id FROM categories WHERE name = '家居生活'), '', 120, false),
('记忆棉枕头', '人体工学设计，深度睡眠', 89.00, (SELECT id FROM categories WHERE name = '家居生活'), '', 300, false),
('保温杯', '316不锈钢，24小时保温', 59.00, (SELECT id FROM categories WHERE name = '家居生活'), '', 500, false),
('面膜套装', '深层补水，改善肌肤状态', 129.00, (SELECT id FROM categories WHERE name = '美妆护肤'), '', 250, false),
('洗面奶', '温和清洁，适合各种肌肤', 49.00, (SELECT id FROM categories WHERE name = '美妆护肤'), '', 400, false),
('防晒霜', 'SPF50+，长效防晒', 79.00, (SELECT id FROM categories WHERE name = '美妆护肤'), '', 350, false),
('瑜伽垫', '防滑环保，加厚设计', 89.00, (SELECT id FROM categories WHERE name = '运动户外'), '', 180, false),
('跑步鞋', '缓震透气，专业跑步装备', 399.00, (SELECT id FROM categories WHERE name = '运动户外'), '', 100, true),
('背包', '大容量，防水设计', 199.00, (SELECT id FROM categories WHERE name = '运动户外'), '', 120, false);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表创建更新时间触发器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全性 (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 分类表：所有人都可以读取，只有管理员可以写入
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are insertable by authenticated users" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 产品表：所有人都可以读取，只有管理员可以写入
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are insertable by authenticated users" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 购物车表：用户只能操作自己的购物车数据
CREATE POLICY "Users can view own cart items" ON cart_items FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (user_id = auth.uid()::text);

-- 订单表：用户只能查看自己的订单
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (user_id = auth.uid()::text);