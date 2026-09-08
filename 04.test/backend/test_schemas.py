import pytest
from pydantic import ValidationError

from app.schemas.book import ApiResponse, BookCreate, BookListData, BookListResponse, BookUpdate


def test_book_create_defaults():
    book = BookCreate(book_name="书", call_number="A/1")
    assert book.normal_loan == "N"
    assert book.reference_loan == "N"
    assert book.wechat_read == "N"
    assert book.borrow_status == "N"


@pytest.mark.parametrize("score", [-0.1, 10.1])
def test_book_score_range(score):
    with pytest.raises(ValidationError):
        BookCreate(book_name="书", call_number="A/1", douban_score=score)


def test_book_length_validation():
    with pytest.raises(ValidationError):
        BookCreate(book_name="x" * 256, call_number="A/1")
    with pytest.raises(ValidationError):
        BookUpdate(category="x" * 101)


def test_response_models():
    response = ApiResponse(data={"id": 1})
    assert response.code == 0
    assert response.message == "success"
    listing = BookListResponse(data=BookListData(list=[], total=0, page=1, page_size=20))
    assert listing.data.total == 0
