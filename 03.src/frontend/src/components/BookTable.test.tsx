import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Book } from '../api/book'
import BookTable from './BookTable'

afterEach(cleanup)

const bookAllY: Book = {
  id: 1,
  book_name: '书籍一',
  call_number: 'A/1',
  isbn: '978-1',
  douban_score: 8.5,
  normal_loan: 'Y',
  reference_loan: 'Y',
  wechat_read: 'Y',
  borrow_status: 'Y',
  category: '文学',
  sub_category: '小说',
  level: 3,
  remark: '这是备注'
}

const bookAllN: Book = {
  id: 2,
  book_name: '书籍二',
  call_number: 'B/2',
  normal_loan: 'N',
  reference_loan: 'N',
  wechat_read: 'N',
  borrow_status: 'N'
}

const props = (books: Book[], total = 100) => ({
  books,
  loading: false,
  pagination: { current: 1, pageSize: 20, total },
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onPageChange: vi.fn()
})

describe('BookTable', () => {
  it('渲染书名、索书号、ISBN、评分、分类、等级和备注', () => {
    render(<BookTable {...props([bookAllY], 1)} />)
    expect(screen.getByText('书籍一')).toBeInTheDocument()
    expect(screen.getByText('A/1')).toBeInTheDocument()
    expect(screen.getByText('978-1')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
    expect(screen.getByText('文学')).toBeInTheDocument()
    expect(screen.getByText('小说')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('这是备注')).toBeInTheDocument()
  })

  it('Y/N 字段按取值渲染为不同的标签文本', () => {
    render(<BookTable {...props([bookAllY, bookAllN])} />)
    // 每本书 3 个 Y/N 列（普通外借、参考外借、微信读书）
    expect(screen.getAllByText('是')).toHaveLength(3)
    expect(screen.getAllByText('否')).toHaveLength(3)
    expect(screen.getByText('已读')).toBeInTheDocument()
    expect(screen.getByText('未读')).toBeInTheDocument()
  })

  it('点击书名链接触发编辑', () => {
    const onEdit = vi.fn()
    render(<BookTable {...props([bookAllY])} onEdit={onEdit} />)
    fireEvent.click(screen.getByText('书籍一'))
    expect(onEdit).toHaveBeenCalledWith(bookAllY)
  })

  it('点击编辑按钮触发编辑', () => {
    const onEdit = vi.fn()
    render(<BookTable {...props([bookAllY])} onEdit={onEdit} />)
    fireEvent.click(screen.getByText('编辑'))
    expect(onEdit).toHaveBeenCalledWith(bookAllY)
  })

  it('点击删除按钮触发删除', () => {
    const onDelete = vi.fn()
    render(<BookTable {...props([bookAllY])} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('删除'))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('显示总记录数', () => {
    render(<BookTable {...props([bookAllY], 4150)} />)
    expect(screen.getByText('共 4150 条记录')).toBeInTheDocument()
  })

  it('翻页时触发 onPageChange', () => {
    const onPageChange = vi.fn()
    const { container } = render(<BookTable {...props([bookAllY])} onPageChange={onPageChange} />)
    const pageTwo = container.querySelector('.ant-pagination-item-2')
    expect(pageTwo).not.toBeNull()
    fireEvent.click(pageTwo as HTMLElement)
    expect(onPageChange).toHaveBeenCalledWith(2, 20)
  })
})
