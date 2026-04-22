-- ========================================
-- 上海市图书馆书籍管理系统 - MySQL 建表脚本
-- ========================================

CREATE DATABASE IF NOT EXISTS shanghai_library 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE shanghai_library;

CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    book_name VARCHAR(255) NOT NULL COMMENT '书名',
    call_number VARCHAR(200) NOT NULL COMMENT '索书号',
    isbn VARCHAR(50) COMMENT 'ISBN',
    douban_score DECIMAL(3,1) COMMENT '豆瓣得分（0.0-10.0）',
    remark TEXT COMMENT '备注',
    normal_loan ENUM('Y', 'N') DEFAULT 'N' COMMENT '普通外借',
    reference_loan ENUM('Y', 'N') DEFAULT 'N' COMMENT '参考外借',
    wechat_read ENUM('Y', 'N') DEFAULT 'N' COMMENT '微信读书',
    borrow_status ENUM('Y', 'N') DEFAULT 'N' COMMENT '借阅状态（Y=已读，N=未读）',
    category VARCHAR(100) COMMENT '类别',
    sub_category VARCHAR(100) COMMENT '小类别',
    level INT COMMENT '等级',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted ENUM('Y', 'N') DEFAULT 'N' COMMENT '是否删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='书籍表';

CREATE INDEX idx_book_name ON books(book_name);
CREATE INDEX idx_category ON books(category);
CREATE INDEX idx_sub_category ON books(sub_category);
CREATE INDEX idx_is_deleted ON books(is_deleted);
