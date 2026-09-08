"""
书籍数据模型
"""
from sqlalchemy import Column, BigInteger, String, Text, Enum, DECIMAL, Integer, DateTime
from sqlalchemy.sql import func

from ..database import Base


class Book(Base):
    """书籍模型"""
    
    __tablename__ = "books"
    
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True, comment="主键ID")
    book_name = Column(String(255), nullable=False, comment="书名")
    call_number = Column(String(200), nullable=False, comment="索书号")
    isbn = Column(String(50), nullable=True, comment="ISBN")
    douban_score = Column(DECIMAL(3, 1), nullable=True, comment="豆瓣得分（0.0-10.0）")
    remark = Column(Text, nullable=True, comment="备注")
    normal_loan = Column(Enum('Y', 'N'), default='N', comment="普通外借（Y=可借，N=不可借）")
    reference_loan = Column(Enum('Y', 'N'), default='N', comment="参考外借（Y=可借，N=不可借）")
    wechat_read = Column(Enum('Y', 'N'), default='N', comment="微信读书（Y=有，N=无）")
    borrow_status = Column(Enum('Y', 'N'), default='N', comment="借阅状态（Y=已读，N=未读）")
    category = Column(String(100), nullable=True, comment="类别")
    sub_category = Column(String(100), nullable=True, comment="小类别")
    level = Column(Integer, nullable=True, comment="等级")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    is_deleted = Column(Enum('Y', 'N'), default='N', comment="是否删除（Y=已删除，N=未删除）")
