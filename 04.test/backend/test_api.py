from app.models.book import Book


def test_root_and_health(client):
    root = client.get("/")
    assert root.status_code == 200
    assert root.json()["version"] == "1.0.0"

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json() == {"status": "healthy"}


def test_create_get_update_delete_lifecycle(client, book_payload):
    created = client.post("/api/books", json=book_payload)
    assert created.status_code == 200
    book_id = created.json()["data"]["id"]

    fetched = client.get(f"/api/books/{book_id}")
    assert fetched.status_code == 200
    assert fetched.json()["data"]["book_name"] == book_payload["book_name"]

    updated = client.put(
        f"/api/books/{book_id}",
        json={"book_name": "修改后的书名", "douban_score": 9.1},
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["id"] == book_id
    assert client.get(f"/api/books/{book_id}").json()["data"]["book_name"] == "修改后的书名"

    deleted = client.delete(f"/api/books/{book_id}")
    assert deleted.status_code == 200
    assert deleted.json()["data"] is None
    assert client.get(f"/api/books/{book_id}").status_code == 404
    assert client.delete(f"/api/books/{book_id}").status_code == 404


def test_list_filters_pagination_and_soft_delete(client, db):
    db.add_all([
        Book(book_name="Python 入门", call_number="TP311/1", douban_score=8.5,
             normal_loan="Y", reference_loan="N", wechat_read="Y", borrow_status="N",
             category="技术", sub_category="编程", level=1),
        Book(book_name="Python 进阶", call_number="TP311/2", douban_score=9.2,
             normal_loan="N", reference_loan="Y", wechat_read="N", borrow_status="Y",
             category="技术", sub_category="编程", level=2),
        Book(book_name="历史读本", call_number="K/1", douban_score=7.0,
             category="历史", sub_category="通史", level=1),
        Book(book_name="已删除", call_number="X/1", is_deleted="Y", category="隐藏"),
    ])
    db.commit()

    response = client.get("/api/books", params={
        "book_name": "Python", "douban_score_min": 8, "douban_score_max": 9,
        "normal_loan": "Y", "reference_loan": "N", "wechat_read": "Y",
        "borrow_status": "N", "category": "技术", "sub_category": "编程",
        "level": 1, "page": 1, "page_size": 1,
    })
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["page_size"] == 1
    assert [item["book_name"] for item in data["list"]] == ["Python 入门"]

    all_books = client.get("/api/books", params={"page": 2, "page_size": 2}).json()["data"]
    assert all_books["total"] == 3
    assert len(all_books["list"]) == 1
    assert all(item["book_name"] != "已删除" for item in all_books["list"])


def test_categories_and_sub_categories(client, db):
    db.add_all([
        Book(book_name="A", call_number="1", category="文学", sub_category="小说"),
        Book(book_name="B", call_number="2", category="文学", sub_category="诗歌"),
        Book(book_name="C", call_number="3", category="", sub_category=None),
        Book(book_name="D", call_number="4", category="隐藏", sub_category="隐藏", is_deleted="Y"),
    ])
    db.commit()

    categories = client.get("/api/books/categories")
    sub_categories = client.get("/api/books/sub-categories")
    assert categories.status_code == 200
    assert categories.json()["data"] == ["文学"]
    assert set(sub_categories.json()["data"]) == {"小说", "诗歌"}


def test_not_found_responses(client):
    assert client.get("/api/books/999").status_code == 404
    assert client.put("/api/books/999", json={"book_name": "不存在"}).status_code == 404
    assert client.delete("/api/books/999").status_code == 404


def test_request_validation(client, book_payload):
    assert client.get("/api/books", params={"page": 0}).status_code == 422
    assert client.get("/api/books", params={"page_size": 101}).status_code == 422
    assert client.get("/api/books", params={"douban_score_min": -0.1}).status_code == 422
    assert client.get("/api/books", params={"douban_score_max": 10.1}).status_code == 422
    assert client.post("/api/books", json={"book_name": "缺索书号"}).status_code == 422

    invalid = dict(book_payload, douban_score=11)
    assert client.post("/api/books", json=invalid).status_code == 422
