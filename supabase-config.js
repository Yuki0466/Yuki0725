// Supabase 配置
const SUPABASE_URL = 'https://nysrxrlwrlcfrbhutwtd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4cmx3cmxjZnJiaHV0d3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTQ4MzgsImV4cCI6MjA3OTM5MDgzOH0.598J9S18JqKaqYP5e1lR_oKtly0pyhCzZ3FRJS0rwRI';

// 创建 Supabase 客户端
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 数据库表结构说明
/*
1. products (产品表)
   - id: 主键
   - name: 产品名称
   - description: 产品描述
   - price: 价格
   - category_id: 分类ID (外键)
   - image_url: 产品图片URL
   - stock: 库存数量
   - created_at: 创建时间
   - updated_at: 更新时间

2. categories (分类表)
   - id: 主键
   - name: 分类名称
   - description: 分类描述
   - created_at: 创建时间

3. cart_items (购物车表)
   - id: 主键
   - user_id: 用户ID
   - product_id: 产品ID (外键)
   - quantity: 数量
   - created_at: 创建时间
   - updated_at: 更新时间

4. orders (订单表)
   - id: 主键
   - user_id: 用户ID
   - total_amount: 总金额
   - status: 订单状态
   - created_at: 创建时间
   - updated_at: 更新时间
*/