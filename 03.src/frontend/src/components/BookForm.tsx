import React from 'react'
import { Modal, Form, Input, InputNumber, Radio, message } from 'antd'
import { Book, BookFormData } from '../api/book'

interface BookFormProps {
  visible: boolean
  book?: Book | null
  onCancel: () => void
  onSubmit: (data: BookFormData) => Promise<void>
}

const BookForm: React.FC<BookFormProps> = ({ visible, book, onCancel, onSubmit }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (visible) {
      if (book) {
        form.setFieldsValue(book)
      } else {
        form.resetFields()
        form.setFieldsValue({
          normal_loan: 'N',
          reference_loan: 'N',
          wechat_read: 'N',
          borrow_status: 'N'
        })
      }
    }
  }, [visible, book, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await onSubmit(values as BookFormData)
      message.success(book ? '编辑成功' : '新增成功')
      form.resetFields()
      onCancel()
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={book ? '编辑书籍' : '新增书籍'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="book_name"
          label="书名"
          rules={[{ required: true, message: '请输入书名' }]}
        >
          <Input placeholder="请输入书名" maxLength={255} />
        </Form.Item>

        <Form.Item
          name="call_number"
          label="索书号"
          rules={[{ required: true, message: '请输入索书号' }]}
        >
          <Input placeholder="请输入索书号" maxLength={200} />
        </Form.Item>

        <Form.Item name="isbn" label="ISBN">
          <Input placeholder="请输入ISBN" maxLength={50} />
        </Form.Item>

        <Form.Item name="douban_score" label="豆瓣得分">
          <InputNumber min={0} max={10} step={0.1} placeholder="0.0-10.0" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>

        <Form.Item label="普通外借" name="normal_loan" initialValue="N">
          <Radio.Group>
            <Radio value="Y">是</Radio>
            <Radio value="N">否</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="参考外借" name="reference_loan" initialValue="N">
          <Radio.Group>
            <Radio value="Y">是</Radio>
            <Radio value="N">否</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="微信读书" name="wechat_read" initialValue="N">
          <Radio.Group>
            <Radio value="Y">是</Radio>
            <Radio value="N">否</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="借阅状态" name="borrow_status" initialValue="N">
          <Radio.Group>
            <Radio value="Y">已读</Radio>
            <Radio value="N">未读</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="category" label="类别">
          <Input placeholder="请输入类别" maxLength={100} />
        </Form.Item>

        <Form.Item name="sub_category" label="小类别">
          <Input placeholder="请输入小类别" maxLength={100} />
        </Form.Item>

        <Form.Item name="level" label="等级">
          <InputNumber min={1} placeholder="请输入等级" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BookForm
