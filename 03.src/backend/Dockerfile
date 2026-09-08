# 后端 Dockerfile
FROM python:3.10-slim

WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 复制代码
COPY app/ ./app/

# 暴露端口
EXPOSE 5202

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5202"]
