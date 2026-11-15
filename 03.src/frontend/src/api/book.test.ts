import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookApi } from './book'

const { http, createArgs } = vi.hoisted(() => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  createArgs: [] as Array<Record<string, unknown>>
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn((...args: Array<Record<string, unknown>>) => {
      createArgs.push(args[0])
      return http
    })
  }
}))

beforeEach(() => {
  // 只清理 http 桩件的调用记录；axios.create 的调用发生在模块导入时，保留以便断言
  http.get.mockClear()
  http.post.mockClear()
  http.put.mockClear()
  http.delete.mockClear()
})

describe('axios 实例配置', () => {
  it('以 /api 为 baseURL 创建实例', () => {
    expect(createArgs).toContainEqual({
      baseURL: '/api',
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    })
  })
})

describe('bookApi', () => {
  const listData = { list: [], total: 0, page: 1, page_size: 20 }

  it('getBooks 成功时返回 data', async () => {
    http.get.mockResolvedValueOnce({ data: { code: 0, message: 'success', data: listData } })
    await expect(bookApi.getBooks({ page: 1, page_size: 20 })).resolves.toEqual(listData)
    expect(http.get).toHaveBeenCalledWith('/books', { params: { page: 1, page_size: 20 } })
  })

  it('getBooks 业务失败时抛出 message', async () => {
    http.get.mockResolvedValueOnce({ data: { code: 1, message: '查询失败', data: null } })
    await expect(bookApi.getBooks({})).rejects.toThrow('查询失败')
  })

  it('getBook 成功时返回书籍', async () => {
    const book = { id: 5, book_name: '书五', call_number: 'A/5', normal_loan: 'N', reference_loan: 'N', wechat_read: 'N', borrow_status: 'N' }
    http.get.mockResolvedValueOnce({ data: { code: 0, message: 'success', data: book } })
    await expect(bookApi.getBook(5)).resolves.toEqual(book)
    expect(http.get).toHaveBeenCalledWith('/books/5')
  })

  it('getBook 业务失败时抛出 message', async () => {
    http.get.mockResolvedValueOnce({ data: { code: 1, message: '书籍不存在', data: null } })
    await expect(bookApi.getBook(999)).rejects.toThrow('书籍不存在')
  })

  it('createBook 以 POST 提交表单并返回新 ID', async () => {
    http.post.mockResolvedValueOnce({ data: { code: 0, message: 'success', data: { id: 9 } } })
    const form = { book_name: '新书', call_number: 'Z/1' }
    await expect(bookApi.createBook(form)).resolves.toEqual({ id: 9 })
    expect(http.post).toHaveBeenCalledWith('/books', form)
  })

  it('createBook 业务失败时抛出 message', async () => {
    http.post.mockResolvedValueOnce({ data: { code: 1, message: '创建失败', data: null } })
    await expect(bookApi.createBook({ book_name: '', call_number: '' })).rejects.toThrow('创建失败')
  })

  it('updateBook 以 PUT 提交表单并返回 ID', async () => {
    http.put.mockResolvedValueOnce({ data: { code: 0, message: 'success', data: { id: 3 } } })
    const form = { book_name: '改书', call_number: 'B/2' }
    await expect(bookApi.updateBook(3, form)).resolves.toEqual({ id: 3 })
    expect(http.put).toHaveBeenCalledWith('/books/3', form)
  })

  it('updateBook 业务失败时抛出 message', async () => {
    http.put.mockResolvedValueOnce({ data: { code: 1, message: '更新失败', data: null } })
    await expect(bookApi.updateBook(3, {} as never)).rejects.toThrow('更新失败')
  })

  it('deleteBook 成功时无返回值', async () => {
    http.delete.mockResolvedValueOnce({ data: { code: 0, message: 'success', data: null } })
    await expect(bookApi.deleteBook(7)).resolves.toBeUndefined()
    expect(http.delete).toHaveBeenCalledWith('/books/7')
  })

  it('deleteBook 业务失败时抛出 message', async () => {
    http.delete.mockResolvedValueOnce({ data: { code: 1, message: '删除失败', data: null } })
    await expect(bookApi.deleteBook(7)).rejects.toThrow('删除失败')
  })

  it('getCategories 返回类别数组', async () => {
    http.get.mockResolvedValueOnce({ data: { code: 0, message: 'success', data: ['文学', '历史'] } })
    await expect(bookApi.getCategories()).resolves.toEqual(['文学', '历史'])
    expect(http.get).toHaveBeenCalledWith('/books/categories')
  })

  it('getCategories 业务失败时抛出 message', async () => {
    http.get.mockResolvedValueOnce({ data: { code: 1, message: '类别查询失败', data: null } })
    await expect(bookApi.getCategories()).rejects.toThrow('类别查询失败')
  })

  it('getSubCategories 返回小类别数组', async () => {
    http.get.mockResolvedValueOnce({ data: { code: 0, message: 'success', data: ['小说'] } })
    await expect(bookApi.getSubCategories()).resolves.toEqual(['小说'])
    expect(http.get).toHaveBeenCalledWith('/books/sub-categories')
  })

  it('getSubCategories 业务失败时抛出 message', async () => {
    http.get.mockResolvedValueOnce({ data: { code: 1, message: '小类别查询失败', data: null } })
    await expect(bookApi.getSubCategories()).rejects.toThrow('小类别查询失败')
  })
})
