# Shanghai Library Book Management System

上海市图书馆书籍管理系统 - 基于 Airbnb 设计风格的 PC 端 Web 应用。

## 技术栈

- **前端**: React + TypeScript + Ant Design
- **后端**: FastAPI + Python
- **数据库**: MySQL
- **部署**: Docker

## 快速开始

### 前置要求

- Docker & Docker Compose
- MySQL 5.7+

### 部署步骤

1. 初始化数据库:
```bash
mysql -h <DB_HOST> -u chenwei -p shanghai_library < sql/init.sql
```

2. 启动服务:
```bash
docker-compose build
docker-compose up -d
```

3. 访问应用: http://localhost:5102

## 功能特性

- 书籍查询（多条件组合）
- 新增/编辑书籍
- 逻辑删除
- 类别下拉选择

## 项目结构

```
├── docs/               # 设计文档
├── sql/               # 数据库脚本
├── backend/           # FastAPI 后端
├── frontend/          # React 前端
└── docker-compose.yml # 容器编排
```

## License

MIT
