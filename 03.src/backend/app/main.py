"""
FastAPI 应用入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.book import router as book_router
from .config import settings

# 创建 FastAPI 应用
app = FastAPI(
    title="上海市图书馆书籍管理系统",
    description="提供书籍的查询、新增、编辑、删除功能",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(book_router)


@app.get("/")
def root():
    """根路径"""
    return {"message": "上海市图书馆书籍管理系统 API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """健康检查"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.API_PORT,
        reload=True
    )
