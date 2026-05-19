-- 科研奖励获奖信息查询系统数据库初始化脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建奖项表
CREATE TABLE IF NOT EXISTS awards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    award_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    level VARCHAR(50) CHECK (level IN ('国家级', '省级', '市级', '校级')),
    year INTEGER,
    session INTEGER,
    recipients VARCHAR(500),
    organization VARCHAR(255),
    department VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    openid VARCHAR(100) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    award_id INTEGER REFERENCES awards(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, award_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_awards_name ON awards(name);
CREATE INDEX IF NOT EXISTS idx_awards_award_name ON awards(award_name);
CREATE INDEX IF NOT EXISTS idx_awards_recipients ON awards(recipients);
CREATE INDEX IF NOT EXISTS idx_awards_organization ON awards(organization);
CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year);
CREATE INDEX IF NOT EXISTS idx_awards_level ON awards(level);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_award_id ON favorites(award_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 awards 表创建更新时间触发器
CREATE TRIGGER update_awards_updated_at
    BEFORE UPDATE ON awards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO awards (name, award_name, category, level, year, session, recipients, organization, department, description) VALUES 
('高性能计算在材料科学中的应用', '国家自然科学奖', '自然科学', '国家级', 2023, 5, '张三, 李四', '清华大学', '计算机科学与技术系', '该研究将高性能计算技术应用于新材料的开发，取得了突破性成果。'),
('人工智能在医学影像诊断中的研究', '国家科技进步奖', '科技进步', '国家级', 2023, 7, '王五, 赵六', '北京大学', '人工智能研究院', '开发了一套基于深度学习的医学影像诊断系统，准确率达到95%以上。'),
('新型能源材料的研发', '北京市科学技术奖', '科学技术', '市级', 2022, 12, '钱七, 孙八', '北京理工大学', '材料科学与工程学院', '研发的新型电池材料显著提升了能量密度。'),
('量子计算理论研究', '国家自然科学奖', '自然科学', '国家级', 2022, 4, '周九', '中国科学院', '计算技术研究所', '在量子算法设计方面取得重要突破。'),
('5G通信网络优化', '广东省科技进步奖', '科技进步', '省级', 2023, 8, '吴十, 郑十一', '华南理工大学', '电子与信息学院', '提出的通信网络优化方案提升了网络效率30%。');

-- 创建管理员用户（实际环境中应使用加密密码）
INSERT INTO users (openid, nickname, is_admin) VALUES 
('admin-001', '系统管理员', TRUE);

-- RLS 策略配置
-- 启用 RLS
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 所有用户都可以查看奖项
CREATE POLICY "Awards are viewable by everyone" ON awards
    FOR SELECT USING (true);

-- 只有管理员可以插入、更新、删除奖项
CREATE POLICY "Admins can manage awards" ON awards
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() AND users.is_admin = true
    ));

-- 用户可以查看自己的信息
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- 用户可以管理自己的收藏
CREATE POLICY "Users can manage their favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);