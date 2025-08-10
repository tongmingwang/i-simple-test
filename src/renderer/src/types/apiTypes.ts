export interface FieldType {
  key: string
  value: any
  id: string
  selected?: boolean
  type?: 'text' | 'file'
}

export interface ApiProps {
  id: string
  name: string
  description?: string
  path?: string
  params?: FieldType[]
  method?: string
  body?: FieldType[]
  headers?: FieldType[]
  binary?: Array<File | null>
  json?: string
  responseType?: string
  formData?: FieldType[]
  activeTab?: 'params' | 'body' | 'headers' | 'formData' | 'binary' | 'json'
}

export interface ProjectProps {
  id: string
  name: string
  description?: string
  createdAt?: string
  baseURL: string
  timeOut?: number
  apiList: ApiProps[]
  token?: string
  cookie?: string
  tokenKey?: string
}
