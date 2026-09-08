import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Typography, Button, message, Modal, Card } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { bookApi, Book, BookFormData, BookQueryParams } from './api/book'
import BookTable from './components/BookTable'
import SearchForm from './components/SearchForm'
import BookForm from './components/BookForm'

const { Header, Content } = Layout
const { Title } = Typography

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })
  const [searchParams, setSearchParams] = useState<BookQueryParams>({
    page: 1,
    page_size: 20
  })
  const [formVisible, setFormVisible] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)

  // 获取书籍列表
  const fetchBooks = useCallback(async (params: BookQueryParams) => {
    setLoading(true)
    try {
      const data = await bookApi.getBooks(params)
      setBooks(data.list)
      setPagination(prev => ({
        ...prev,
        total: data.total,
        current: data.page,
        pageSize: data.page_size
      }))
    } catch (error: any) {
      message.error(error.message || '获取书籍列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    fetchBooks(searchParams)
  }, [])

  // 搜索
  const handleSearch = (values: BookQueryParams) => {
    setSearchParams(values)
    fetchBooks(values)
  }

  // 重置
  const handleReset = () => {
    const defaultParams: BookQueryParams = { page: 1, page_size: 20 }
    setSearchParams(defaultParams)
    fetchBooks(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number, pageSize: number) => {
    const params = { ...searchParams, page, page_size: pageSize }
    setSearchParams(params)
    fetchBooks(params)
  }

  // 打开新增弹窗
  const handleAdd = () => {
    setCurrentBook(null)
    setFormVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (book: Book) => {
    setCurrentBook(book)
    setFormVisible(true)
  }

  // 关闭弹窗
  const handleCancel = () => {
    setFormVisible(false)
    setCurrentBook(null)
  }

  // 提交表单
  const handleSubmit = async (data: BookFormData) => {
    if (currentBook) {
      await bookApi.updateBook(currentBook.id, data)
      fetchBooks(searchParams)
    } else {
      await bookApi.createBook(data)
      fetchBooks(searchParams)
    }
  }

  // 删除
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该书籍吗？删除后可以在数据库中恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await bookApi.deleteBook(id)
          message.success('删除成功')
          fetchBooks(searchParams)
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      }
    })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>上海市图书馆书籍管理系统</Title>
        </div>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Card bordered={false}>
          <SearchForm onSearch={handleSearch} onReset={handleReset} />
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增书籍
            </Button>
          </div>
          <BookTable
            books={books}
            loading={loading}
            pagination={pagination}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        </Card>
      </Content>

      <BookForm
        visible={formVisible}
        book={currentBook}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </Layout>
  )
}

export default App
