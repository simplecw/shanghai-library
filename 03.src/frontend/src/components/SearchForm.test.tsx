import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { bookApi } from '../api/book'
import { filterOptionByText } from './SearchForm'
import SearchForm from './SearchForm'

vi.mock('../api/book', () => ({
  bookApi: {
    getCategories: vi.fn(),
    getSubCategories: vi.fn()
  }
}))

const mockedGetCategories = vi.mocked(bookApi.getCategories)
const mockedGetSubCategories = vi.mocked(bookApi.getSubCategories)

beforeEach(() => {
  mockedGetCategories.mockResolvedValue(['文学', '历史'])
  mockedGetSubCategories.mockResolvedValue(['小说', '散文'])
})

afterEach(cleanup)

// jsdom 中点击 submit 按钮不会触发 form 提交，需要直接派发 submit 事件
const submit = (container: HTMLElement) =>
  fireEvent.submit(container.querySelector('form') as HTMLFormElement)

describe('filterOptionByText', () => {
  it('选项为空时返回 false', () => {
    expect(filterOptionByText('文', undefined)).toBe(false)
  })

  it('选项无文本时返回 false', () => {
    expect(filterOptionByText('文', {})).toBe(false)
  })

  it('按选项文本大小写不敏感匹配', () => {
    expect(filterOptionByText('文', { children: '文学' })).toBe(true)
    expect(filterOptionByText('lite', { children: 'Literature' })).toBe(true)
    expect(filterOptionByText('科幻', { children: '文学' })).toBe(false)
  })
})

describe('SearchForm', () => {
  it('挂载时加载类别和小类别选项', async () => {
    render(<SearchForm onSearch={vi.fn()} onReset={vi.fn()} />)
    await waitFor(() => expect(mockedGetCategories).toHaveBeenCalled())
    await waitFor(() => expect(mockedGetSubCategories).toHaveBeenCalled())
    // 打开类别下拉，验证选项来自接口
    fireEvent.mouseDown(screen.getByText('请选择类别'))
    expect(await screen.findByRole('option', { name: '历史' })).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByText('请选择小类别'))
    expect(await screen.findByRole('option', { name: '散文' })).toBeInTheDocument()
  })

  it('选项加载失败时静默降级，不影响表单使用', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedGetCategories.mockRejectedValueOnce(new Error('接口故障'))
    mockedGetSubCategories.mockRejectedValueOnce(new Error('接口故障'))
    const onSearch = vi.fn()
    const { container } = render(<SearchForm onSearch={onSearch} onReset={vi.fn()} />)
    await waitFor(() => expect(consoleError).toHaveBeenCalled())
    submit(container)
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith({ page: 1, page_size: 20 }))
    consoleError.mockRestore()
  })

  it('空表单提交时移除空值，仅保留分页参数', async () => {
    const onSearch = vi.fn()
    const { container } = render(<SearchForm onSearch={onSearch} onReset={vi.fn()} />)
    submit(container)
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith({ page: 1, page_size: 20 }))
  })

  it('填写书名后提交携带书名参数', async () => {
    const onSearch = vi.fn()
    const { container } = render(<SearchForm onSearch={onSearch} onReset={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('书名'), { target: { value: '三体' } })
    submit(container)
    await waitFor(() =>
      expect(onSearch).toHaveBeenCalledWith({ book_name: '三体', page: 1, page_size: 20 })
    )
  })

  it('书名清空为空字符串后提交时同样被移除', async () => {
    const onSearch = vi.fn()
    const { container } = render(<SearchForm onSearch={onSearch} onReset={vi.fn()} />)
    const input = screen.getByLabelText('书名')
    fireEvent.change(input, { target: { value: '三体' } })
    fireEvent.change(input, { target: { value: '' } })
    submit(container)
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith({ page: 1, page_size: 20 }))
  })

  it('点击重置清空表单并调用 onReset', async () => {
    const onReset = vi.fn()
    render(<SearchForm onSearch={vi.fn()} onReset={onReset} />)
    const input = screen.getByLabelText('书名')
    fireEvent.change(input, { target: { value: '三体' } })
    fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }))
    expect(onReset).toHaveBeenCalled()
    await waitFor(() => expect((screen.getByLabelText('书名') as HTMLInputElement).value).toBe(''))
  })
})
