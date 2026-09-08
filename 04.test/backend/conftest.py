import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


BACKEND_DIR = Path(__file__).resolve().parents[2] / "03.src" / "backend"
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DB_HOST", "127.0.0.1")
os.environ.setdefault("DB_USER", "test")
os.environ.setdefault("DB_PASSWORD", "test")
os.environ.setdefault("DB_NAME", "test")

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def book_payload():
    return {
        "book_name": "测试书籍",
        "call_number": "I247.5/TEST",
        "isbn": "9780000000001",
        "douban_score": 8.6,
        "remark": "测试备注",
        "normal_loan": "Y",
        "reference_loan": "N",
        "wechat_read": "Y",
        "borrow_status": "N",
        "category": "文学",
        "sub_category": "小说",
        "level": 3,
    }
