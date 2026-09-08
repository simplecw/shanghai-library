from app.config import Settings
from app import database


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
