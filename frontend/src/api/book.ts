import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Book {
  id: number
  book_name: string
  call_number: string
  isbn?: string
  douban_score?: number
  remark?: string
  normal_loan: string
  reference_loan: string
  wechat_read: string
  borrow_status: string
  category?: string
  sub_category?: string
  level?: number
  created_at?: string
  updated_at?: string
}

export interface BookListData {
  list: Book[]
  total: number
  page: number
  page_size: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface BookQueryParams {
  book_name?: string
  douban_score_min?: number
  douban_score_max?: number
  normal_loan?: string
  reference_loan?: string
  wechat_read?: string
  borrow_status?: string
  category?: string
  sub_category?: string
  level?: number
  page?: number
  page_size?: number
}

export interface BookFormData {
  book_name: string
  call_number: string
  isbn?: string
  douban_score?: number
  remark?: string
  normal_loan?: string
  reference_loan?: string
  wechat_read?: string
  borrow_status?: string
  category?: string
  sub_category?: string
  level?: number
}

export const bookApi = {
  getBooks: async (params: BookQueryParams): Promise<BookListData> => {
    const response = await api.get<ApiResponse<BookListData>>('/books', { params })
    if (response.data.code !== 0) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  getBook: async (id: number): Promise<Book> => {
    const response = await api.get<ApiResponse<Book>>(`/books/${id}`)
    if (response.data.code !== 0) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  createBook: async (data: BookFormData): Promise<{ id: number }> => {
    const response = await api.post<ApiResponse<{ id: number }>>('/books', data)
    if (response.data.code !== 0) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  updateBook: async (id: number, data: BookFormData): Promise<{ id: number }> => {
    const response = await api.put<ApiResponse<{ id: number }>>(`/books/${id}`, data)
    if (response.data.code !== 0) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  deleteBook: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/books/${id}`)
    if (response.data.code !== 0) {
      throw new Error(response.data.message)
    }
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/books/categories')
    if (response.data.code !== 0) {
      throw new Error(response.data.message)
    }
    return response.data.data
  },

  getSubCategories: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/books/sub-categories')
    if (response.data.code !== 0) {
      throw new Error(response.data.message)
    }
    return response.data.data
  }
}

export default api
