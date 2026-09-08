import React from 'react'
import { Table, Tag, Button, Space } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Book } from '../api/book'

interface BookTableProps {
  books: Book[]
  loading: boolean
  pagination: {
    current: number
    pageSize: number
    total: number
  }
  onEdit: (book: Book) => void
  onDelete: (id: number) => void
  onPageChange: (page: number, pageSize: number) => void
}

const BookTable: React.FC<BookTableProps> = ({
  books,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPageChange
}) => {
  const handleDelete = (id: number) => {
    onDelete(id)
  }

  const columns: ColumnsType<Book> = [
    {
      title: '书名',
      dataIndex: 'book_name',
      key: 'book_name',
      width: 200,
      fixed: 'left',
      render: (text: string, record: Book) => (
        <a onClick={() => onEdit(record)}>{text}</a>
      )
    },
    {
      title: '索书号',
      dataIndex: 'call_number',
      key: 'call_number',
      width: 120
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 150
    },
    {
      title: '豆瓣得分',
      dataIndex: 'douban_score',
      key: 'douban_score',
      width: 90,
      align: 'center'
    },
    {
      title: '普通外借',
      dataIndex: 'normal_loan',
      key: 'normal_loan',
      width: 90,
      align: 'center',
      render: (val: string) => (
        <Tag color={val === 'Y' ? 'green' : 'default'}>{val === 'Y' ? '是' : '否'}</Tag>
      )
    },
    {
      title: '参考外借',
      dataIndex: 'reference_loan',
      key: 'reference_loan',
      width: 90,
      align: 'center',
      render: (val: string) => (
        <Tag color={val === 'Y' ? 'green' : 'default'}>{val === 'Y' ? '是' : '否'}</Tag>
      )
    },
    {
      title: '微信读书',
      dataIndex: 'wechat_read',
      key: 'wechat_read',
      width: 90,
      align: 'center',
      render: (val: string) => (
        <Tag color={val === 'Y' ? 'blue' : 'default'}>{val === 'Y' ? '是' : '否'}</Tag>
      )
    },
    {
      title: '借阅状态',
      dataIndex: 'borrow_status',
      key: 'borrow_status',
      width: 90,
      align: 'center',
      render: (val: string) => (
        <Tag color={val === 'Y' ? 'purple' : 'orange'}>{val === 'Y' ? '已读' : '未读'}</Tag>
      )
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '小类别',
      dataIndex: 'sub_category',
      key: 'sub_category',
      width: 100
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 70,
      align: 'center'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 300,
      render: (text: string) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: Book) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <Table
      columns={columns}
      dataSource={books}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1500 }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条记录`,
        onChange: onPageChange
      }}
    />
  )
}

export default BookTable
