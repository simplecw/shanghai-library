# 系统架构设计

## 1. 总体架构

系统采用前后端分离架构：

```text
Browser -> Nginx/Vite -> /api reverse proxy -> FastAPI -> SQLAlchemy -> MySQL
```

- 前端：React、TypeScript、Vite、Ant Design、Axios。
- Web 服务：生产环境由 Nginx 托管静态资源，并代理 `/api/`。
- 后端：FastAPI 提供 REST API，Pydantic 负责输入输出校验。
- 数据访问：SQLAlchemy ORM，PyMySQL 驱动 MySQL。
- 部署：Docker Compose 组织前后端容器；数据库为外部依赖。

## 2. 后端分层

| 层 | 目录 | 职责 |
|---|---|---|
| 路由层 | `app/routes` | HTTP 参数、状态码和统一响应 |
| Schema 层 | `app/schemas` | 请求与响应数据校验 |
| Service 层 | `app/services` | 查询、分页、CRUD 和逻辑删除 |
| Model 层 | `app/models` | ORM 表结构映射 |
| 基础设施 | `app/config.py`, `app/database.py` | 环境配置、引擎与会话生命周期 |

路由不直接拼装数据库查询，业务查询集中在 `BookService`；数据库会话由 FastAPI 依赖注入并在请求结束后关闭。

## 3. 运行时配置

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | MySQL 主机 |
| `DB_PORT` | `3306` | MySQL 端口 |
| `DB_USER` | `shanghai_library` | 数据库用户 |
| `DB_PASSWORD` | 空 | 数据库密码；部署时必须设置 |
| `DB_NAME` | `shanghai_library` | 数据库名 |
| `API_PORT` | `5202` | 后端端口 |

Docker Compose 对 `DB_PASSWORD` 使用必填变量检查，避免无意使用仓库内默认密码。

## 4. 测试设计

后端与前端测试覆盖率均要求 100%（语句、分支、函数、行），并在 CI 中强制执行。

### 4.1 后端测试（pytest + pytest-cov）

后端测试分为四类：

- API 集成测试：使用 FastAPI `TestClient` 和内存 SQLite，覆盖真实路由、Schema、Service 与 ORM。
- Service 测试：直接验证更新、删除及分类去重等数据库行为。
- Schema 测试：覆盖默认值、范围和长度校验。
- 基础设施测试：覆盖根路径、健康检查、配置 URL、数据库会话关闭以及 `__main__` 开发启动入口（mock `uvicorn.run`）。

每个测试独立创建和销毁数据库表，避免顺序依赖；测试不连接真实 MySQL。

### 4.2 前端测试（Vitest + jsdom + Testing Library）

- API 层测试：mock axios，覆盖全部接口方法的成功与业务失败路径。
- 容器组件测试：以桩件替换子组件，验证 `App` 的加载、搜索、分页、表单编排与删除确认逻辑及错误提示。
- UI 组件测试：在 jsdom 中真实渲染 `SearchForm`、`BookTable`、`BookForm`，覆盖渲染、交互与校验分支。
- 入口测试：验证 `main.tsx` 将应用渲染到 `#root`。

所有网络请求均被 mock，测试不发起真实 HTTP 请求；覆盖率阈值（100%）在 `vitest.config.ts` 中强制执行。
