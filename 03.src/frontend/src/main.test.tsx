import { describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

// 阻止 main → App → SearchForm 发起真实网络请求
vi.mock('./api/book', () => ({
  bookApi: {
    getBooks: vi.fn().mockResolvedValue({ list: [], total: 0, page: 1, page_size: 20 }),
    getBook: vi.fn(),
    createBook: vi.fn(),
    updateBook: vi.fn(),
    deleteBook: vi.fn(),
    getCategories: vi.fn().mockResolvedValue([]),
    getSubCategories: vi.fn().mockResolvedValue([])
  }
}))

describe('main 入口', () => {
  it('将 App 渲染到 #root 容器', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    await import('./main')
    // React 18 并发渲染是异步提交的，等待首次渲染完成
    await waitFor(() => expect(document.getElementById('root')?.innerHTML).not.toBe(''))
  })
})
