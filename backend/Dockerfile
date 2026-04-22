# 后端 Dockerfile
FROM python:3.10-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

COPY app/ ./app/

EXPOSE 5202

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5202"]
