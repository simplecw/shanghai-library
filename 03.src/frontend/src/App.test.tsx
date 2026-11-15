import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { message, Modal } from 'antd'
import { bookApi } from './api/book'
import type { Book } from './api/book'
import App from './App'

// 桩件：记录回调，便于直接触发 App 的编排逻辑
vi.mock('./components/SearchForm', async () => {
  const React = await import('react')
  return {
    default: (props: {
      onSearch: (values: Record<string, unknown>) => void
      onReset: () => void
    }) =>
      React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          { 'data-testid': 'do-search', onClick: () => props.onSearch({ book_name: '三体', category: '小说' }) },
          'do-search'
        ),
        React.createElement('button', { 'data-testid': 'do-reset', onClick: props.onReset }, 'do-reset')
      )
  }
})

vi.mock('./components/BookTable', async () => {
  const React = await import('react')
  return {
    default: (props: {
      books: Book[]
      loading: boolean
      pagination: Record<string, number>
      onEdit: (book: Book) => void
      onDelete: (id: number) => void
      onPageChange: (page: number, pageSize: number) => void
    }) =>
      React.createElement(
        'div',
        null,
        React.createElement('div', { 'data-testid': 'book-count' }, props.books.length),
        React.createElement('div', { 'data-testid': 'loading' }, String(props.loading)),
        React.createElement('div', { 'data-testid': 'pagination' }, JSON.stringify(props.pagination)),
        React.createElement(
          'button',
          { 'data-testid': 'edit-first', onClick: () => props.books[0] && props.onEdit(props.books[0]) },
          'edit-first'
        ),
        React.createElement(
          'button',
          { 'data-testid': 'delete-first', onClick: () => props.books[0] && props.onDelete(props.books[0].id) },
          'delete-first'
        ),
        React.createElement(
          'button',
          { 'data-testid': 'change-page', onClick: () => props.onPageChange(2, 50) },
          'change-page'
        )
      )
  }
})

vi.mock('./components/BookForm', async () => {
  const React = await import('react')
  return {
    default: (props: {
      visible: boolean
      book: Book | null
      onCancel: () => void
      onSubmit: (data: Record<string, string>) => Promise<void>
    }) =>
      React.createElement(
        'div',
        null,
        React.createElement('div', { 'data-testid': 'form-visible' }, String(props.visible)),
        React.createElement('div', { 'data-testid': 'form-book' }, props.book ? props.book.id : 'none'),
        React.createElement(
          'button',
          {
            'data-testid': 'form-submit',
            onClick: () => {
              props.onSubmit({ book_name: '表单书', call_number: 'F/1' }).catch(() => {})
            }
          },
          'form-submit'
        ),
        React.createElement('button', { 'data-testid': 'form-cancel', onClick: props.onCancel }, 'form-cancel')
      )
  }
})

vi.mock('./api/book', () => ({
  bookApi: {
    getBooks: vi.fn(),
    getBook: vi.fn(),
    createBook: vi.fn(),
    updateBook: vi.fn(),
    deleteBook: vi.fn(),
    getCategories: vi.fn(),
    getSubCategories: vi.fn()
  }
}))

const mockedGetBooks = vi.mocked(bookApi.getBooks)
const mockedCreateBook = vi.mocked(bookApi.createBook)
const mockedUpdateBook = vi.mocked(bookApi.updateBook)
const mockedDeleteBook = vi.mocked(bookApi.deleteBook)

const bookY: Book = {
  id: 1,
  book_name: '书籍一',
  call_number: 'A/1',
  normal_loan: 'Y',
  reference_loan: 'Y',
  wechat_read: 'Y',
  borrow_status: 'Y'
}

const bookN: Book = {
  id: 2,
  book_name: '书籍二',
  call_number: 'B/2',
  normal_loan: 'N',
  reference_loan: 'N',
  wechat_read: 'N',
  borrow_status: 'N'
}

beforeEach(() => {
  mockedGetBooks.mockResolvedValue({
    list: [bookY, bookN],
    total: 2,
    page: 1,
    page_size: 20
  })
  mockedCreateBook.mockResolvedValue({ id: 99 })
  mockedUpdateBook.mockResolvedValue({ id: 1 })
  mockedDeleteBook.mockResolvedValue(undefined)
})

afterEach(() => {
  cleanup()
  // 清理 message / Modal.confirm 的 portal，保持 antd 管理器可用
  message.destroy()
  Modal.destroyAll()
})

// 等待确认弹窗出现并点击其确认按钮。
// 被销毁的弹窗在 jsdom 中可能因动画未完成而残留，因此始终点击文档中最后一个弹窗。
const clickConfirmOk = async () => {
  await screen.findAllByText('确认删除', {}, { timeout: 8000 })
  const roots = document.querySelectorAll('.ant-modal-confirm')
  const last = roots[roots.length - 1]
  fireEvent.click(last.querySelector('.ant-btn-primary') as HTMLElement)
}

describe('App', () => {
  it('初始加载书籍列表并传递给表格', async () => {
    render(<App />)
    expect(await screen.findByTestId('book-count')).toHaveTextContent('2')
    expect(mockedGetBooks).toHaveBeenCalledWith({ page: 1, page_size: 20 })
    expect(screen.getByTestId('pagination')).toHaveTextContent('"total":2')
  })

  it('加载失败且错误带 message 时提示原始信息', async () => {
    mockedGetBooks.mockRejectedValueOnce(new Error('网络故障'))
    render(<App />)
    expect(await screen.findByText('网络故障')).toBeInTheDocument()
  })

  it('加载失败且错误无 message 时提示兜底文案', async () => {
    mockedGetBooks.mockRejectedValueOnce({})
    render(<App />)
    expect(await screen.findByText('获取书籍列表失败')).toBeInTheDocument()
  })

  it('搜索时按条件重新加载', async () => {
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByTestId('do-search'))
    await waitFor(() =>
      expect(mockedGetBooks).toHaveBeenLastCalledWith({ book_name: '三体', category: '小说' })
    )
  })

  it('重置时恢复默认分页参数', async () => {
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByTestId('do-reset'))
    await waitFor(() =>
      expect(mockedGetBooks).toHaveBeenLastCalledWith({ page: 1, page_size: 20 })
    )
  })

  it('翻页时合并当前查询条件', async () => {
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByTestId('do-search'))
    await waitFor(() => expect(mockedGetBooks).toHaveBeenCalledTimes(2))
    fireEvent.click(screen.getByTestId('change-page'))
    await waitFor(() =>
      expect(mockedGetBooks).toHaveBeenLastCalledWith({
        book_name: '三体',
        category: '小说',
        page: 2,
        page_size: 50
      })
    )
  })

  it('点击新增打开空白表单，提交后调用 createBook 并刷新列表', async () => {
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByRole('button', { name: /新\s*增\s*书\s*籍/ }))
    expect(screen.getByTestId('form-visible')).toHaveTextContent('true')
    expect(screen.getByTestId('form-book')).toHaveTextContent('none')
    fireEvent.click(screen.getByTestId('form-submit'))
    await waitFor(() => expect(mockedCreateBook).toHaveBeenCalledWith({ book_name: '表单书', call_number: 'F/1' }))
    await waitFor(() => expect(mockedGetBooks).toHaveBeenCalledTimes(2))
  })

  it('点击编辑打开回填表单，提交后调用 updateBook 并刷新列表', async () => {
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByTestId('edit-first'))
    expect(screen.getByTestId('form-visible')).toHaveTextContent('true')
    expect(screen.getByTestId('form-book')).toHaveTextContent('1')
    fireEvent.click(screen.getByTestId('form-submit'))
    await waitFor(() =>
      expect(mockedUpdateBook).toHaveBeenCalledWith(1, { book_name: '表单书', call_number: 'F/1' })
    )
    await waitFor(() => expect(mockedGetBooks).toHaveBeenCalledTimes(2))
  })

  it('取消表单时关闭弹窗', async () => {
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByTestId('edit-first'))
    fireEvent.click(screen.getByTestId('form-cancel'))
    expect(screen.getByTestId('form-visible')).toHaveTextContent('false')
  })

  it('确认删除后调用 deleteBook 并提示成功', async () => {
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByTestId('delete-first'))
    await clickConfirmOk()
    await waitFor(() => expect(mockedDeleteBook).toHaveBeenCalledWith(1))
    expect(await screen.findByText('删除成功', {}, { timeout: 8000 })).toBeInTheDocument()
    await waitFor(() => expect(mockedGetBooks).toHaveBeenCalledTimes(2))
  })

  it('删除失败且错误带 message 时提示原始信息', async () => {
    mockedDeleteBook.mockRejectedValueOnce(new Error('服务器拒绝删除'))
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByTestId('delete-first'))
    await clickConfirmOk()
    await waitFor(() => expect(mockedDeleteBook).toHaveBeenCalled())
    expect(await screen.findByText('服务器拒绝删除', {}, { timeout: 8000 })).toBeInTheDocument()
  })

  it('删除失败且错误无 message 时提示兜底文案', async () => {
    mockedDeleteBook.mockRejectedValueOnce({})
    render(<App />)
    await screen.findByTestId('book-count')
    fireEvent.click(screen.getByTestId('delete-first'))
    await clickConfirmOk()
    await waitFor(() => expect(mockedDeleteBook).toHaveBeenCalled())
    expect(await screen.findByText('删除失败', {}, { timeout: 8000 })).toBeInTheDocument()
  })
})
