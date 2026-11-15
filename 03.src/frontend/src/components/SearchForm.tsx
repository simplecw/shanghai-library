import React, { useEffect, useState } from 'react'
import { Form, Input, Select, Button, Row, Col, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { BookQueryParams, bookApi } from '../api/book'

interface SearchFormProps {
  onSearch: (values: BookQueryParams) => void
  onReset: () => void
}

// 按选项文本过滤（导出以便单元测试覆盖空选项分支）
export const filterOptionByText = (input: string, option?: { children?: React.ReactNode }) =>
  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase()) ?? false

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
    // 移除空值
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
      initialValues={{
        page: 1,
        page_size: 20
      }}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name="book_name" label="书名">
            <Input placeholder="请输入书名（模糊查询）" allowClear />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="douban_score_min" label="豆瓣得分从">
            <Input type="number" placeholder="最小值" allowClear />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="douban_score_max" label="豆瓣得分至">
            <Input type="number" placeholder="最大值" allowClear />
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item name="normal_loan" label="普通外借">
            <Select placeholder="请选择" allowClear>
              <Select.Option value="Y">是</Select.Option>
              <Select.Option value="N">否</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item name="reference_loan" label="参考外借">
            <Select placeholder="请选择" allowClear>
              <Select.Option value="Y">是</Select.Option>
              <Select.Option value="N">否</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="wechat_read" label="微信读书">
            <Select placeholder="请选择" allowClear>
              <Select.Option value="Y">是</Select.Option>
              <Select.Option value="N">否</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={4}>
          <Form.Item name="borrow_status" label="借阅状态">
            <Select placeholder="请选择" allowClear>
              <Select.Option value="Y">已读</Select.Option>
              <Select.Option value="N">未读</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="category" label="类别">
            <Select
              placeholder="请选择类别"
              allowClear
              showSearch
              filterOption={filterOptionByText}
              loading={loading}
            >
              {categories.map(cat => (
                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="sub_category" label="小类别">
            <Select
              placeholder="请选择小类别"
              allowClear
              showSearch
              filterOption={filterOptionByText}
              loading={loading}
            >
              {subCategories.map(sub => (
                <Select.Option key={sub} value={sub}>{sub}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="level" label="等级">
            <Input type="number" placeholder="请输入等级" allowClear />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label=" ">
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
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
