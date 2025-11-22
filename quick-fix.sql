-- 快速修复脚本：确保有精选产品并正确设置
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 首先检查现有数据
SELECT COUNT(*) as total_products, 
       COUNT(CASE WHEN featured = true THEN 1 END) as featured_products
FROM products;

-- 2. 如果没有精选产品，将前两个产品设为精选
UPDATE products 
SET featured = true 
WHERE id IN (
    SELECT id FROM products 
    ORDER BY created_at 
    LIMIT 2
);

-- 3. 如果没有产品数据，插入一些基础产品
INSERT INTO products (name, description, price, stock, featured) VALUES
('智能手机 Pro Max', '最新款智能手机，配备高清摄像头和强大处理器', 4999.00, 50, true),
('笔记本电脑 Ultra', '轻薄便携的高性能笔记本电脑', 7999.00, 30, true),
('无线蓝牙耳机', '高品质音效，降噪功能，续航持久', 299.00, 100, false)
ON CONFLICT DO NOTHING;

-- 4. 确保分类表有数据
INSERT INTO categories (name, description) VALUES
('电子产品', '包括手机、电脑、平板等电子设备')
ON CONFLICT (name) DO NOTHING;

-- 5. 验证结果
SELECT 
    p.id, p.name, p.price, p.featured, p.stock,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.featured DESC, p.created_at;