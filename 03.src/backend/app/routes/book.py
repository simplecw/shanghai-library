"""
书籍路由
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.book import (
    BookCreate,
    BookUpdate,
    BookResponse,
    BookListResponse,
    BookListData,
    ApiResponse
)
from ..services.book import BookService

router = APIRouter(prefix="/api/books", tags=["书籍管理"])


@router.get("", response_model=BookListResponse)
def get_books(
    book_name: Optional[str] = Query(None, description="书名（模糊查询）"),
    douban_score_min: Optional[float] = Query(None, ge=0, le=10, description="豆瓣得分最小值"),
    douban_score_max: Optional[float] = Query(None, ge=0, le=10, description="豆瓣得分最大值"),
    normal_loan: Optional[str] = Query(None, description="普通外借（Y/N）"),
    reference_loan: Optional[str] = Query(None, description="参考外借（Y/N）"),
    wechat_read: Optional[str] = Query(None, description="微信读书（Y/N）"),
    borrow_status: Optional[str] = Query(None, description="借阅状态（Y=已读，N=未读）"),
    category: Optional[str] = Query(None, description="类别"),
    sub_category: Optional[str] = Query(None, description="小类别"),
    level: Optional[int] = Query(None, description="等级"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    查询书籍列表
    """
    books, total = BookService.get_books(
        db=db,
        book_name=book_name,
        douban_score_min=douban_score_min,
        douban_score_max=douban_score_max,
        normal_loan=normal_loan,
        reference_loan=reference_loan,
        wechat_read=wechat_read,
        borrow_status=borrow_status,
        category=category,
        sub_category=sub_category,
        level=level,
        page=page,
        page_size=page_size
    )
    
    return BookListResponse(
        code=0,
        message="success",
        data=BookListData(
            list=[BookResponse.model_validate(book) for book in books],
            total=total,
            page=page,
            page_size=page_size
        )
    )


@router.get("/categories", response_model=ApiResponse)
def get_categories(db: Session = Depends(get_db)):
    """
    获取所有类别列表
    """
    categories = BookService.get_categories(db)
    return ApiResponse(
        code=0,
        message="success",
        data=categories
    )


@router.get("/sub-categories", response_model=ApiResponse)
def get_sub_categories(db: Session = Depends(get_db)):
    """
    获取所有小类别列表
    """
    sub_categories = BookService.get_sub_categories(db)
    return ApiResponse(
        code=0,
        message="success",
        data=sub_categories
    )


@router.get("/{book_id}", response_model=ApiResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    """
    获取单个书籍
    """
    book = BookService.get_db_book(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="书籍不存在")
    
    return ApiResponse(
        code=0,
        message="success",
        data=BookResponse.model_validate(book)
    )


@router.post("", response_model=ApiResponse)
def create_book(book_data: BookCreate, db: Session = Depends(get_db)):
    """
    新增书籍
    """
    book = BookService.create_book(db, book_data)
    
    return ApiResponse(
        code=0,
        message="success",
        data={"id": book.id}
    )


@router.put("/{book_id}", response_model=ApiResponse)
def update_book(book_id: int, book_data: BookUpdate, db: Session = Depends(get_db)):
    """
    更新书籍
    """
    book = BookService.update_book(db, book_id, book_data)
    if not book:
        raise HTTPException(status_code=404, detail="书籍不存在")
    
    return ApiResponse(
        code=0,
        message="success",
        data={"id": book.id}
    )


@router.delete("/{book_id}", response_model=ApiResponse)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    """
    删除书籍（逻辑删除）
    """
    success = BookService.delete_book(db, book_id)
    if not success:
        raise HTTPException(status_code=404, detail="书籍不存在")
    
    return ApiResponse(
        code=0,
        message="success",
        data=None
    )
