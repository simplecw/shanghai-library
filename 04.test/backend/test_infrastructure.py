import runpy

from app.config import Settings
from app import database
import uvicorn


def test_database_url_uses_settings_values():
    settings = Settings(
        DB_HOST="db.example",
        DB_PORT=3307,
        DB_USER="app",
        DB_PASSWORD="test-only",
        DB_NAME="library",
    )
    assert settings.DATABASE_URL == (
        "mysql+pymysql://app:test-only@db.example:3307/library?charset=utf8mb4"
    )


def test_get_db_closes_session(monkeypatch):
    class FakeSession:
        closed = False

        def close(self):
            self.closed = True

    session = FakeSession()
    monkeypatch.setattr(database, "SessionLocal", lambda: session)
    dependency = database.get_db()
    assert next(dependency) is session
    dependency.close()
    assert session.closed is True


def test_main_entrypoint_runs_uvicorn(monkeypatch):
    """__main__ 开发入口应以配置中的端口启动 uvicorn"""
    captured = {}

    def fake_run(app_target, **kwargs):
        captured["app"] = app_target
        captured.update(kwargs)

    monkeypatch.setattr(uvicorn, "run", fake_run)
    runpy.run_module("app.main", run_name="__main__")

    assert captured["app"] == "app.main:app"
    assert captured["host"] == "0.0.0.0"
    assert captured["port"] == Settings().API_PORT
