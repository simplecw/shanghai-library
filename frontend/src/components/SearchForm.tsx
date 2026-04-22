import React, { useEffect, useState } from 'react'
import { Form, Input, Select, Button, Row, Col, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { BookQueryParams, bookApi } from '../api/book'

interface SearchFormProps {
  onSearch: (values: BookQueryParams) => void
  onReset: () => void
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()
  const [categories, setCategories] = useState<string[]>([])
  const [subCategories, setSubCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    setLoading(true)
    try {
      const [cats, subs] = await Promise.all([
        bookApi.getCategories(),
        bookApi.getSubCategories()
      ])
      setCategories(cats)
      setSubCategories(subs)
    } catch (error) {
      console.error('Failed to load options:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = (values: any) => {
    const params: BookQueryParams = {
      ...values,
      page: 1,
      page_size: 20
    }
    Object.keys(params).forEach(key => {
      if (params[key as keyof BookQueryParams] === undefined || params[key as keyof BookQueryParams] === '') {
        delete params[key as keyof BookQueryParams]
      }
    })
    onSearch(params)
  }

  const handleReset = () => {
    form.resetFields()
    onReset()
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ page: 1, page_size: 20 }}
    >
      <Row gutter={24} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item name="book_name" label="书名" style={{ marginBottom: 0 }}>
            <Input 
              placeholder="搜索书名..." 
              allowClear 
              size="large"
              prefix={<SearchOutlined style={{ color: '#b0b0b0' }} />}
            />
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4} lg={4}>
          <Form.Item name="douban_score_min" label="豆瓣评分 ≥" style={{ marginBottom: 0 }}>
            <Input type="number" placeholder="0" allowClear style={{ height: 40 }} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4} lg={4}>
          <Form.Item name="douban_score_max" label="豆瓣评分 ≤" style={{ marginBottom: 0 }}>
            <Input type="number" placeholder="10" allowClear style={{ height: 40 }} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4} lg={4}>
          <Form.Item name="normal_loan" label="普通外借" style={{ marginBottom: 0 }}>
            <Select placeholder="全部" allowClear size="large" style={{ height: 40 }}>
              <Select.Option value="Y">是</Select.Option>
              <Select.Option value="N">否</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4} lg={4}>
          <Form.Item name="reference_loan" label="参考外借" style={{ marginBottom: 0 }}>
            <Select placeholder="全部" allowClear size="large" style={{ height: 40 }}>
              <Select.Option value="Y">是</Select.Option>
              <Select.Option value="N">否</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24} align="middle">
        <Col xs={12} sm={6} md={4} lg={4}>
          <Form.Item name="wechat_read" label="微信读书" style={{ marginBottom: 0 }}>
            <Select placeholder="全部" allowClear size="large" style={{ height: 40 }}>
              <Select.Option value="Y">是</Select.Option>
              <Select.Option value="N">否</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4} lg={4}>
          <Form.Item name="borrow_status" label="借阅状态" style={{ marginBottom: 0 }}>
            <Select placeholder="全部" allowClear size="large" style={{ height: 40 }}>
              <Select.Option value="Y">已读</Select.Option>
              <Select.Option value="N">未读</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="category" label="类别" style={{ marginBottom: 0 }}>
            <Select
              placeholder="全部类别"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              loading={loading}
              size="large"
              style={{ height: 40 }}
            >
              {categories.map(cat => (
                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="sub_category" label="小类别" style={{ marginBottom: 0 }}>
            <Select
              placeholder="全部小类别"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              loading={loading}
              size="large"
              style={{ height: 40 }}
            >
              {subCategories.map(sub => (
                <Select.Option key={sub} value={sub}>{sub}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4} lg={4}>
          <Form.Item name="level" label="等级" style={{ marginBottom: 0 }}>
            <Input type="number" placeholder="等级" allowClear style={{ height: 40 }} />
          </Form.Item>
        </Col>
        <Col xs={12} sm={6} md={4} lg={4}>
          <Form.Item label=" " style={{ marginBottom: 0 }}>
            <Space size={8}>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="large">
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />} size="large">
                重置
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default SearchForm
