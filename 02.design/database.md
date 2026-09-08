# 数据库设计

数据库为 MySQL `shanghai_library`，字符集 `utf8mb4`。核心表为 `books`。

| 字段组 | 字段 |
|---|---|
| 标识 | `id` |
| 核心书目信息 | `book_name`, `call_number`, `isbn`, `douban_score`, `remark` |
| 状态 | `normal_loan`, `reference_loan`, `wechat_read`, `borrow_status`, `is_deleted` |
| 分类 | `category`, `sub_category`, `level` |
| 审计时间 | `created_at`, `updated_at` |

`is_deleted='N'` 为有效数据，删除接口仅将其更新为 `Y`。所有业务查询默认过滤已删除数据。

索引覆盖书名、索书号、ISBN、分类、小分类、借阅状态、删除状态，并提供 `(is_deleted, category, sub_category)` 组合索引支持常见筛选。

`03.src/sql/init.sql` 用于建库、建表和少量示例数据；`03.src/sql/data.sql` 为业务数据脚本。执行数据脚本前应在目标环境备份并确认来源。
