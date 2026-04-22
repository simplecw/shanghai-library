import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Typography, Button, message, Modal, Card } from 'antd'
import { PlusOutlined, BookOutlined } from '@ant-design/icons'
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

  useEffect(() => {
    fetchBooks(searchParams)
  }, [])

  const handleSearch = (values: BookQueryParams) => {
    setSearchParams(values)
    fetchBooks(values)
  }

  const handleReset = () => {
    const defaultParams: BookQueryParams = { page: 1, page_size: 20 }
    setSearchParams(defaultParams)
    fetchBooks(defaultParams)
  }

  const handlePageChange = (page: number, pageSize: number) => {
    const newParams = { ...searchParams, page, page_size: pageSize }
    setSearchParams(newParams)
    fetchBooks(newParams)
  }

  const handleAdd = () => {
    setCurrentBook(null)
    setFormVisible(true)
  }

  const handleEdit = (book: Book) => {
    setCurrentBook(book)
    setFormVisible(true)
  }

  const handleCancel = () => {
    setFormVisible(false)
    setCurrentBook(null)
  }

  const handleSubmit = async (data: BookFormData) => {
    if (currentBook) {
      await bookApi.updateBook(currentBook.id, data)
    } else {
      await bookApi.createBook(data)
    }
    fetchBooks(searchParams)
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该书籍吗？删除后可以在数据库中恢复。',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { style: { background: '#ff385c', borderColor: '#ff385c', borderRadius: 4 } },
      cancelButtonProps: { style: { borderRadius: 4 } },
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
    <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header style={{ 
        background: '#ffffff', 
        padding: '0 48px', 
        borderBottom: '1px solid #e9e9e9',
        height: 72,
        lineHeight: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookOutlined style={{ fontSize: 24, color: '#ff385c' }} />
          <Title level={3} style={{ margin: 0, fontWeight: 600, color: '#222222' }}>
            上海市图书馆
          </Title>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          fontSize: 13,
          color: '#717171'
        }}>
          <span style={{ 
            background: '#f7f7f7', 
            padding: '6px 16px', 
            borderRadius: 22,
            fontWeight: 500
          }}>
            共 {pagination.total} 本书籍
          </span>
        </div>
      </Header>

      <Content style={{ 
        background: '#f7f7f7', 
        padding: '32px 48px',
        minHeight: 'calc(100vh - 72px)'
      }}>
        <Card 
          bordered={false}
          style={{ 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <SearchForm onSearch={handleSearch} onReset={handleReset} />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16
          }}>
            <div style={{ fontSize: 13, color: '#717171' }}>
              查询结果
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
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
