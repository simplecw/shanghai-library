"""
书籍服务层
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..models.book import Book
from ..schemas.book import BookCreate, BookUpdate


class BookService:
    """书籍服务类"""
    
    @staticmethod
    def get_db_book(db: Session, book_id: int) -> Optional[Book]:
        """获取单个书籍"""
        return db.query(Book).filter(
            and_(Book.id == book_id, Book.is_deleted == 'N')
        ).first()
    
    @staticmethod
    def get_books(
        db: Session,
        book_name: Optional[str] = None,
        douban_score_min: Optional[float] = None,
        douban_score_max: Optional[float] = None,
        normal_loan: Optional[str] = None,
        reference_loan: Optional[str] = None,
        wechat_read: Optional[str] = None,
        borrow_status: Optional[str] = None,
        category: Optional[str] = None,
        sub_category: Optional[str] = None,
        level: Optional[int] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Book], int]:
        """
        查询书籍列表
        
        Returns:
            Tuple[List[Book], int]: (书籍列表, 总数)
        """
        query = db.query(Book).filter(Book.is_deleted == 'N')
        
        # 书名模糊查询
        if book_name:
            query = query.filter(Book.book_name.like(f"%{book_name}%"))
        
        # 豆瓣得分区间
        if douban_score_min is not None:
            query = query.filter(Book.douban_score >= douban_score_min)
        if douban_score_max is not None:
            query = query.filter(Book.douban_score <= douban_score_max)
        
        # Y/N 字段精确查询
        if normal_loan:
            query = query.filter(Book.normal_loan == normal_loan)
        if reference_loan:
            query = query.filter(Book.reference_loan == reference_loan)
        if wechat_read:
            query = query.filter(Book.wechat_read == wechat_read)
        if borrow_status:
            query = query.filter(Book.borrow_status == borrow_status)
        
        # 分类字段
        if category:
            query = query.filter(Book.category == category)
        if sub_category:
            query = query.filter(Book.sub_category == sub_category)
        if level is not None:
            query = query.filter(Book.level == level)
        
        # 获取总数
        total = query.count()
        
        # 分页
        offset = (page - 1) * page_size
        books = query.order_by(Book.id.desc()).offset(offset).limit(page_size).all()
        
        return books, total
    
    @staticmethod
    def create_book(db: Session, book_data: BookCreate) -> Book:
        """创建书籍"""
        book = Book(**book_data.model_dump())
        db.add(book)
        db.commit()
        db.refresh(book)
        return book
    
    @staticmethod
    def update_book(db: Session, book_id: int, book_data: BookUpdate) -> Optional[Book]:
        """更新书籍"""
        book = BookService.get_db_book(db, book_id)
        if not book:
            return None
        
        update_data = book_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(book, key, value)
        
        db.commit()
        db.refresh(book)
        return book
    
    @staticmethod
    def delete_book(db: Session, book_id: int) -> bool:
        """删除书籍（逻辑删除）"""
        book = BookService.get_db_book(db, book_id)
        if not book:
            return False
        
        book.is_deleted = 'Y'
        db.commit()
        return True
    
    @staticmethod
    def get_categories(db: Session) -> List[str]:
        """获取所有不重复的类别"""
        results = db.query(Book.category).filter(
            and_(Book.is_deleted == 'N', Book.category.isnot(None), Book.category != '')
        ).distinct().all()
        return [r[0] for r in results if r[0]]
    
    @staticmethod
    def get_sub_categories(db: Session) -> List[str]:
        """获取所有不重复的小类别"""
        results = db.query(Book.sub_category).filter(
            and_(Book.is_deleted == 'N', Book.sub_category.isnot(None), Book.sub_category != '')
        ).distinct().all()
        return [r[0] for r in results if r[0]]
