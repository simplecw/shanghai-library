"""
书籍 Pydantic 模型
"""
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


class BookBase(BaseModel):
    """书籍基础模型"""
    book_name: str = Field(..., max_length=255, description="书名")
    call_number: str = Field(..., max_length=200, description="索书号")
    isbn: Optional[str] = Field(None, max_length=50, description="ISBN")
    douban_score: Optional[float] = Field(None, ge=0, le=10, description="豆瓣得分（0.0-10.0）")
    remark: Optional[str] = Field(None, description="备注")
    normal_loan: Optional[str] = Field('N', description="普通外借（Y/N）")
    reference_loan: Optional[str] = Field('N', description="参考外借（Y/N）")
    wechat_read: Optional[str] = Field('N', description="微信读书（Y/N）")
    borrow_status: Optional[str] = Field('N', description="借阅状态（Y=已读，N=未读）")
    category: Optional[str] = Field(None, max_length=100, description="类别")
    sub_category: Optional[str] = Field(None, max_length=100, description="小类别")
    level: Optional[int] = Field(None, description="等级")


class BookCreate(BookBase):
    """创建书籍请求模型"""
    pass


class BookUpdate(BaseModel):
    """更新书籍请求模型（所有字段可选）"""
    book_name: Optional[str] = Field(None, max_length=255, description="书名")
    call_number: Optional[str] = Field(None, max_length=200, description="索书号")
    isbn: Optional[str] = Field(None, max_length=50, description="ISBN")
    douban_score: Optional[float] = Field(None, ge=0, le=10, description="豆瓣得分（0.0-10.0）")
    remark: Optional[str] = Field(None, description="备注")
    normal_loan: Optional[str] = Field(None, description="普通外借（Y/N）")
    reference_loan: Optional[str] = Field(None, description="参考外借（Y/N）")
    wechat_read: Optional[str] = Field(None, description="微信读书（Y/N）")
    borrow_status: Optional[str] = Field(None, description="借阅状态（Y=已读，N=未读）")
    category: Optional[str] = Field(None, max_length=100, description="类别")
    sub_category: Optional[str] = Field(None, max_length=100, description="小类别")
    level: Optional[int] = Field(None, description="等级")


class BookResponse(BookBase):
    """书籍响应模型"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class BookListData(BaseModel):
    """书籍列表数据"""
    list: List[BookResponse]
    total: int
    page: int
    page_size: int


class ApiResponse(BaseModel):
    """统一API响应模型"""
    code: int = 0
    message: str = "success"
    data: Any = None


class BookListResponse(BaseModel):
    """书籍列表响应模型"""
    code: int = 0
    message: str = "success"
    data: BookListData
