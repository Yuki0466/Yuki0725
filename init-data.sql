-- 简化的数据初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 首先检查表是否存在，如果不存在则创建
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 启用行级安全性
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 创建简单的 RLS 策略（允许所有人读取）
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- 清空现有数据（可选）
-- TRUNCATE TABLE products RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- 插入分类数据
INSERT INTO categories (name, description) VALUES
('电子产品', '包括手机、电脑、平板等电子设备'),
('服装鞋包', '时尚服装、鞋子和包包'),
('家居生活', '家居用品、生活必需品'),
('美妆护肤', '化妆品和护肤产品'),
('运动户外', '运动装备和户外用品')
ON CONFLICT (name) DO NOTHING;

-- 插入产品数据
INSERT INTO products (name, description, price, category_id, stock, featured) VALUES
('智能手机 Pro Max', '最新款智能手机，配备高清摄像头和强大处理器', 4999.00, 
 (SELECT id FROM categories WHERE name = '电子产品' LIMIT 1), 50, true),
('笔记本电脑 Ultra', '轻薄便携的高性能笔记本电脑', 7999.00,
 (SELECT id FROM categories WHERE name = '电子产品' LIMIT 1), 30, true),
('无线蓝牙耳机', '高品质音效，降噪功能，续航持久', 299.00,
 (SELECT id FROM categories WHERE name = '电子产品' LIMIT 1), 100, false),
('运动时尚T恤', '透气舒适，适合运动和日常穿着', 99.00,
 (SELECT id FROM categories WHERE name = '服装鞋包' LIMIT 1), 200, false),
('牛仔裤经典款', '经典版型，舒适耐穿', 199.00,
 (SELECT id FROM categories WHERE name = '服装鞋包' LIMIT 1), 150, false),
('时尚手提包', '优雅设计，实用空间', 399.00,
 (SELECT id FROM categories WHERE name = '服装鞋包' LIMIT 1), 80, false),
('智能台灯', 'LED护眼，可调节亮度和色温', 159.00,
 (SELECT id FROM categories WHERE name = '家居生活' LIMIT 1), 120, false),
('记忆棉枕头', '人体工学设计，深度睡眠', 89.00,
 (SELECT id FROM categories WHERE name = '家居生活' LIMIT 1), 300, false),
('保温杯', '316不锈钢，24小时保温', 59.00,
 (SELECT id FROM categories WHERE name = '家居生活' LIMIT 1), 500, false),
('面膜套装', '深层补水，改善肌肤状态', 129.00,
 (SELECT id FROM categories WHERE name = '美妆护肤' LIMIT 1), 250, false),
('洗面奶', '温和清洁，适合各种肌肤', 49.00,
 (SELECT id FROM categories WHERE name = '美妆护肤' LIMIT 1), 400, false),
('防晒霜', 'SPF50+，长效防晒', 79.00,
 (SELECT id FROM categories WHERE name = '美妆护肤' LIMIT 1), 350, false),
('瑜伽垫', '防滑环保，加厚设计', 89.00,
 (SELECT id FROM categories WHERE name = '运动户外' LIMIT 1), 180, false),
('跑步鞋', '缓震透气，专业跑步装备', 399.00,
 (SELECT id FROM categories WHERE name = '运动户外' LIMIT 1), 100, true),
('背包', '大容量，防水设计', 199.00,
 (SELECT id FROM categories WHERE name = '运动户外' LIMIT 1), 120, false)
ON CONFLICT DO NOTHING;

-- 验证数据插入
SELECT 
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM products) as products_count;