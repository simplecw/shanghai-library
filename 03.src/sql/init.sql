-- ========================================
-- 上海市图书馆书籍管理系统 - MySQL 建表脚本
-- 数据库名: shanghai_library
-- 服务器和用户由部署环境变量提供
-- ========================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS shanghai_library 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE shanghai_library;

-- ========================================
-- 删除旧表（谨慎使用）
-- DROP TABLE IF EXISTS books;
-- ========================================

-- ========================================
-- 书籍表
-- ========================================

CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    
    -- 核心字段
    book_name VARCHAR(255) NOT NULL COMMENT '书名',
    call_number VARCHAR(200) NOT NULL COMMENT '索书号',
    isbn VARCHAR(50) COMMENT 'ISBN',
    douban_score DECIMAL(3,1) COMMENT '豆瓣得分（0.0-10.0）',
    remark TEXT COMMENT '备注',
    
    -- 状态字段
    normal_loan ENUM('Y', 'N') DEFAULT 'N' COMMENT '普通外借（Y=可借，N=不可借）',
    reference_loan ENUM('Y', 'N') DEFAULT 'N' COMMENT '参考外借（Y=可借，N=不可借）',
    wechat_read ENUM('Y', 'N') DEFAULT 'N' COMMENT '微信读书（Y=有，N=无）',
    borrow_status ENUM('Y', 'N') DEFAULT 'N' COMMENT '借阅状态（Y=已读，N=未读）',
    
    -- 分类字段
    category VARCHAR(100) COMMENT '类别',
    sub_category VARCHAR(100) COMMENT '小类别',
    level INT COMMENT '等级',
    
    -- 通用字段
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted ENUM('Y', 'N') DEFAULT 'N' COMMENT '是否删除（Y=已删除，N=未删除）'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='书籍表';

-- ========================================
-- 索引
-- ========================================

-- 单字段索引
CREATE INDEX idx_book_name ON books(book_name);
CREATE INDEX idx_call_number ON books(call_number);
CREATE INDEX idx_isbn ON books(isbn);
CREATE INDEX idx_category ON books(category);
CREATE INDEX idx_sub_category ON books(sub_category);
CREATE INDEX idx_borrow_status ON books(borrow_status);
CREATE INDEX idx_is_deleted ON books(is_deleted);

-- 复合索引（用于组合查询优化）
CREATE INDEX idx_search ON books(is_deleted, category, sub_category);

-- ========================================
-- 初始化测试数据（可选）
-- ========================================

-- 注释以下行以跳过测试数据插入
INSERT INTO books (book_name, call_number, isbn, douban_score, remark, normal_loan, reference_loan, wechat_read, borrow_status, category, sub_category, level) VALUES
('活着', 'I247.5/1234', '9787506365437', 9.4, '余华的代表作，讲述了一个农民的命运', 'N', 'Y', 'Y', 'N', '文学', '小说', 3),
('平凡的世界', 'I247.5/5678', '9787020048735', 9.0, '路遥的长篇小说', 'Y', 'Y', 'Y', 'Y', '文学', '小说', 2),
('三体', 'I247.5/9012', '9787536692930', 8.8, '刘慈欣科幻小说', 'Y', 'N', 'Y', 'N', '科幻', '小说', 4);

-- ========================================
-- 执行完成
-- ========================================
