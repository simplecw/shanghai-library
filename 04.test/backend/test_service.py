from app.models.book import Book
from app.schemas.book import BookCreate, BookUpdate
from app.services.book import BookService


def test_service_create_and_get(db, book_payload):
    created = BookService.create_book(db, BookCreate(**book_payload))
    assert created.id is not None
    assert BookService.get_db_book(db, created.id).book_name == book_payload["book_name"]


def test_service_update_only_provided_fields(db):
    book = Book(book_name="原名", call_number="A/1", remark="保留")
    db.add(book)
    db.commit()

    updated = BookService.update_book(db, book.id, BookUpdate(book_name="新名"))
    assert updated.book_name == "新名"
    assert updated.call_number == "A/1"
    assert updated.remark == "保留"
    assert BookService.update_book(db, 999, BookUpdate(book_name="无")) is None


def test_service_soft_delete(db):
    book = Book(book_name="待删除", call_number="D/1")
    db.add(book)
    db.commit()

    assert BookService.delete_book(db, book.id) is True
    assert book.is_deleted == "Y"
    assert BookService.get_db_book(db, book.id) is None
    assert BookService.delete_book(db, book.id) is False


def test_service_empty_results(db):
    books, total = BookService.get_books(db, book_name="没有这本书")
    assert books == []
    assert total == 0
    assert BookService.get_categories(db) == []
    assert BookService.get_sub_categories(db) == []
