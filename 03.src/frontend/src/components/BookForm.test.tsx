import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { message } from 'antd'
import type { Book } from '../api/book'
import BookForm from './BookForm'

afterEach(() => {
  cleanup()
  message.destroy()
})

const existingBook: Book = {
  id: 1,
  book_name: '已有书籍',
  call_number: 'K/1',
  isbn: '978-7-1',
  douban_score: 9.1,
  normal_loan: 'Y',
  reference_loan: 'N',
  wechat_read: 'Y',
  borrow_status: 'Y',
  category: '历史',
  sub_category: '古代史',
  level: 2,
  remark: '旧备注'
}

describe('BookForm', () => {
  it('visible=false 时不渲染弹窗', () => {
    render(<BookForm visible={false} onCancel={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('新增模式标题为"新增书籍"，Y/N 字段默认为否', () => {
    render(<BookForm visible onCancel={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('新增书籍')).toBeInTheDocument()
    const normalN = document.querySelector('input[name="normal_loan"][value="N"]') as HTMLInputElement
    const referenceN = document.querySelector('input[name="reference_loan"][value="N"]') as HTMLInputElement
    const wechatN = document.querySelector('input[name="wechat_read"][value="N"]') as HTMLInputElement
    const borrowN = document.querySelector('input[name="borrow_status"][value="N"]') as HTMLInputElement
    expect(normalN.checked).toBe(true)
    expect(referenceN.checked).toBe(true)
    expect(wechatN.checked).toBe(true)
    expect(borrowN.checked).toBe(true)
  })

  it('编辑模式标题为"编辑书籍"并回填数据', () => {
    render(<BookForm visible book={existingBook} onCancel={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('编辑书籍')).toBeInTheDocument()
    expect((screen.getByLabelText('书名') as HTMLInputElement).value).toBe('已有书籍')
    expect((screen.getByLabelText('索书号') as HTMLInputElement).value).toBe('K/1')
    expect((screen.getByLabelText('ISBN') as HTMLInputElement).value).toBe('978-7-1')
    expect((screen.getByLabelText('类别') as HTMLInputElement).value).toBe('历史')
    expect((screen.getByLabelText('小类别') as HTMLInputElement).value).toBe('古代史')
  })

  it('必填字段为空时提交显示校验错误且不调用 onSubmit', async () => {
    const onSubmit = vi.fn()
    render(<BookForm visible onCancel={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(await screen.findByText('请输入书名')).toBeInTheDocument()
    expect(screen.getByText('请输入索书号')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('填写必填字段后提交成功，调用 onSubmit 并提示新增成功', async () => {
    const successSpy = vi.spyOn(message, 'success').mockImplementation(() => 0 as never)
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onCancel = vi.fn()
    render(<BookForm visible onCancel={onCancel} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('书名'), { target: { value: '新书' } })
    fireEvent.change(screen.getByLabelText('索书号'), { target: { value: 'Z/9' } })
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ book_name: '新书', call_number: 'Z/9' })
    )
    await waitFor(() => expect(successSpy).toHaveBeenCalledWith('新增成功'))
    await waitFor(() => expect(onCancel).toHaveBeenCalled())
    successSpy.mockRestore()
  })

  it('编辑模式提交成功时提示编辑成功', async () => {
    const successSpy = vi.spyOn(message, 'success').mockImplementation(() => 0 as never)
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onCancel = vi.fn()
    render(<BookForm visible book={existingBook} onCancel={onCancel} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await waitFor(() => expect(successSpy).toHaveBeenCalledWith('编辑成功'))
    await waitFor(() => expect(onCancel).toHaveBeenCalled())
    successSpy.mockRestore()
  })

  it('onSubmit 失败时不提示成功也不关闭弹窗', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const successSpy = vi.spyOn(message, 'success').mockImplementation(() => 0 as never)
    const onSubmit = vi.fn().mockRejectedValue(new Error('后端错误'))
    const onCancel = vi.fn()
    render(<BookForm visible onCancel={onCancel} onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('书名'), { target: { value: '新书' } })
    fireEvent.change(screen.getByLabelText('索书号'), { target: { value: 'Z/9' } })
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(consoleError).toHaveBeenCalled())
    expect(successSpy).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
    consoleError.mockRestore()
    successSpy.mockRestore()
  })

  it('点击取消按钮调用 onCancel', () => {
    const onCancel = vi.fn()
    render(<BookForm visible onCancel={onCancel} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
