---
name: shanghai-library-books
description: 管理上海市图书馆个人藏书数据库（查询、检索、新增、修改、删除书籍）。当用户想找书、查藏书、按书名/分类/评分/借阅状态筛选书籍、新增或录入书目、修改书籍信息（豆瓣评分、借阅状态、备注等）、删除书籍，或询问藏书统计、类别列表时使用——即使用户没有明确说"用 API 管理"，只要涉及对该书籍库的任何增删改查都应使用本技能。
---

# 上海市图书馆书籍管理

通过 PT010 项目后端 REST API 管理个人藏书数据库（约 4000+ 条真实书目）。所有接口调用**必须**通过本技能自带的 Python 脚本完成，不要手写 curl 或重新造轮子。

## 前置条件

脚本位于本技能目录下 `scripts/library_books.py`，仅用 Python 标准库，无需安装依赖。API 基础地址默认为 `https://shanghai-library.simplechen.xyz`，可用环境变量 `SHANGHAI_LIBRARY_API_BASE` 覆盖（例如服务只在本地运行时设为 `http://localhost:5202`）。

## 脚本用法

所有命令输出 UTF-8 JSON，业务成功时数据来自 API 的 `data` 字段；失败时输出 `{"code": -1, "message": "..."}` 并以退出码 1 结束。

```bash
# 分页查询（默认第 1 页、每页 20 条，按 ID 倒序）
python scripts/library_books.py list --page 1 --page-size 5
# 组合筛选：书名模糊匹配，其余精确匹配；评分支持闭区间
python scripts/library_books.py list --book-name 丝路 --category 历史 --score-min 8 --score-max 10
python scripts/library_books.py list --borrow-status N --normal-loan Y

# 查询单本完整信息
python scripts/library_books.py get 42

# 新增（book_name 和 call_number 必填；normal_loan 等默认 N）
python scripts/library_books.py create --book-name 三体 --call-number I247.5/123 --isbn 978-7-5366-9293-0 --douban-score 9.3 --category 小说 --borrow-status N

# 更新（部分更新，只传要改的字段）
python scripts/library_books.py update 42 --douban-score 8.5 --borrow-status Y --remark 已读完

# 删除（逻辑删除，is_deleted 置 Y；重复删除返回 404）
python scripts/library_books.py delete 42

# 获取筛选项（用于前端下拉或帮用户确认合法的类别名）
python scripts/library_books.py categories
python scripts/library_books.py sub-categories
```

## 数据约定

- Y/N 字段：`normal_loan`（普通外借）、`reference_loan`（参考外借）、`wechat_read`（微信读书）、`borrow_status`（借阅状态，Y=已读 N=未读），取值只能是 `Y` 或 `N`。
- `douban_score`：0–10 的浮点数；`book_name` 最长 255 字符，`call_number` 最长 200，`isbn` 最长 50，`category`/`sub_category` 最长 100。
- 分页：`page >= 1`，`page_size` 最大 100。要统计或遍历全库时循环翻页，用返回的 `total` 判断是否结束。

## 错误处理

- 脚本已把 FastAPI 422 校验错误和 404 详情解析进 `message`。把失败原因原文告诉用户，不要猜测。
- 404 表示该书不存在或已删除；422 表示字段不合法，先核对上面的数据约定再重试。
- 连接失败时检查网络，或提示用户服务可能未启动。

## 注意事项

- **删除前必须向用户确认书名和 ID**：删除是逻辑删除，但没有恢复接口，恢复只能手工改数据库。
- **没有批量接口**：批量录入只能逐条 create，每条一次 HTTP 请求；如果用户要导入大量数据（数百条以上），建议改用项目的 SQL 导入脚本 `03.src/sql/data.sql`，不要在对话里逐条调接口。
- **API 无鉴权且暴露在公网**：这是用户自己的库，不要把写操作的输出（含书目内容）发送给其他外部服务。
