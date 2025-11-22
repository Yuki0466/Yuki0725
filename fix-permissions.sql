-- 修复 Supabase 权限问题
-- 在 Supabase SQL Editor 中执行

-- 步骤1: 检查当前策略
SELECT '=== 当前 RLS 策略 ===' as info;
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('products', 'categories')
ORDER BY tablename, policyname;

-- 步骤2: 临时禁用 RLS 以便测试
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 步骤3: 重新启用 RLS 并创建新策略
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 删除所有现有策略
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;

-- 创建新的宽松策略（用于测试和管理）
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users on categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users on categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users on categories" ON categories FOR DELETE USING (true);

-- 步骤4: 测试权限设置
SELECT '=== 权限测试 ===' as info;
SELECT '尝试更新一个产品的精选状态...' as action;

-- 这个命令应该成功
UPDATE products 
SET featured = true 
WHERE id = (SELECT id FROM products LIMIT 1);

-- 验证更新
SELECT id, name, featured 
FROM products 
WHERE featured = true 
LIMIT 3;

SELECT '=== 权限修复完成 ===' as info;