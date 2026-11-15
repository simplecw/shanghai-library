# 上海市图书馆书籍管理系统

面向个人藏书与上海图书馆借阅记录的前后端分离管理系统。系统提供书籍检索、分页、新增、编辑、逻辑删除以及分类筛选能力。

## 目录

- `01.requirements/`：需求规格说明
- `02.design/`：架构、接口与数据库设计
- `03.src/`：前端、后端、SQL 和容器编排源码
- `04.test/backend/`：后端自动化测试
- `.agents/skills/shanghai-library-books/`：书籍管理 agent skill（ZCode 技能，基于 REST API 管理书籍数据）
- `deployment/`：agent skill 的交付包（zip）
- `99.references/`：本地参考资料，不提交到 Git

## 本地运行

1. 复制 `03.src/.env.example` 为 `.env`，设置真实数据库密码。
2. 在 `03.src/sql/` 中执行建表脚本及所需数据脚本。
3. 在 `03.src` 下执行 `docker compose --env-file .env up --build`。
4. 访问前端 `http://localhost:5102`，API 文档位于 `http://localhost:5202/docs`。

## 自动化测试

后端测试（覆盖率 100%）：

```powershell
cd 03.src\backend
py -3 -m pip install -r requirements-dev.txt
py -3 -m pytest ..\..\04.test\backend --cov=app --cov-report=term-missing --cov-fail-under=100
```

前端测试（覆盖率 100%，vitest + Testing Library）：

```powershell
cd 03.src\frontend
npm install
npm run test:coverage
```

后端测试使用内存 SQLite，与实际 MySQL 数据隔离，不需要真实凭证或数据库服务；前端测试在 jsdom 中运行，不发起真实网络请求。

## 安全约定

- `.env` 和 `99.references/` 已由 `.gitignore` 排除。
- 数据库密码必须通过 `DB_PASSWORD` 环境变量提供。
- 不在源码、SQL 或文档中记录真实服务器地址、用户名或密码。
