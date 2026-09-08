# API 设计

基础地址：`http://<host>:5202`。书籍接口统一使用 `/api/books` 前缀。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` | 服务名称与版本 |
| GET | `/health` | API 进程健康状态 |
| GET | `/api/books` | 条件查询与分页 |
| GET | `/api/books/categories` | 类别列表 |
| GET | `/api/books/sub-categories` | 小类别列表 |
| GET | `/api/books/{book_id}` | 查询单本书籍 |
| POST | `/api/books` | 新增书籍 |
| PUT | `/api/books/{book_id}` | 部分更新书籍 |
| DELETE | `/api/books/{book_id}` | 逻辑删除书籍 |

## 列表查询参数

`book_name`、`douban_score_min`、`douban_score_max`、`normal_loan`、`reference_loan`、`wechat_read`、`borrow_status`、`category`、`sub_category`、`level`、`page`、`page_size`。

## 响应约定

成功响应示意：

```json
{"code": 0, "message": "success", "data": {}}
```

列表响应的 `data` 包含 `list`、`total`、`page`、`page_size`。资源不存在返回 HTTP 404；请求字段或查询参数不合法返回 FastAPI 标准 HTTP 422 校验响应。
