-- 管理精选产品脚本
-- 在 Supabase SQL Editor 中执行

-- 步骤1: 查看所有产品的精选状态
SELECT '=== 所有产品及精选状态 ===' as info;
SELECT 
    id,
    name,
    price,
    featured,
    stock,
    created_at,
    CASE 
        WHEN featured = true THEN '⭐ 精选'
        ELSE '📦 普通产品'
    END as status
FROM products
ORDER BY featured DESC, name;

-- 步骤2: 查看统计信息
SELECT '=== 产品统计 ===' as info;
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_products,
    COUNT(CASE WHEN featured = false THEN 1 END) as regular_products,
    COUNT(CASE WHEN featured IS NULL THEN 1 END) as null_featured
FROM products;

-- 步骤3: 重置所有产品的精选状态（可选）
-- UPDATE products SET featured = false;

-- 步骤4: 将前3个产品设为精选（按价格从高到低）
UPDATE products 
SET featured = true 
WHERE id IN (
    SELECT id FROM products 
    ORDER BY price DESC 
    LIMIT 3
);

-- 步骤5: 将前2个电子产品设为精选（按类别）
UPDATE products 
SET featured = true 
WHERE id IN (
    SELECT p.id 
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE c.name = '电子产品'
    ORDER BY p.price DESC
    LIMIT 2
);

-- 步骤6: 最终验证
SELECT '=== 最终精选产品 ===' as info;
SELECT 
    p.id,
    p.name,
    p.price,
    c.name as category_name
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.featured = true
ORDER BY p.price DESC;