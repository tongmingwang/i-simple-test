import type { ProjectProps, ApiProps, FieldType } from '@renderer/types/apiTypes'
import { createUid } from './base'

export const formatProjectData = (list: Array<ProjectProps>): Array<ProjectProps> => {
  const result: Array<ProjectProps> = []

  list.forEach((pro) => {
    result.push({
      id: createUid(),
      name: pro.name || `默认项目`,
      description: pro.description || '无说明',
      baseURL: pro.baseURL || '',
      timeOut: pro.timeOut || 0,
      apiList: formatApiList(pro?.apiList || []),
      token: pro.token || '',
      cookie: pro.cookie || '',
      tokenKey: pro.tokenKey || ''
    })
  })

  return result
}

// 过来ApiList

export const formatApiList = (list: Array<ApiProps>): Array<ApiProps> => {
  const result: Array<ApiProps> = []

  if (!list.length) {
    return [
      {
        id: createUid(),
        name: 'Api' + Date.now().toString(16).slice(0, 4),
        description: '',
        path: '',
        params: formatApiField([]),
        method: 'GET',
        body: formatApiField([]),
        headers: formatApiField([]),
        binary: [] as any,
        json: '',
        responseType: '',
        formData: formatApiField([]),
        activeTab: 'params'
      }
    ]
  }
  list.forEach((api, i) => {
    result.push({
      id: createUid(),
      name: api.name || `接口名称${i + 1}`,
      description: api.description || '',
      path: api.path || '',
      params: formatApiField(api.params || []),
      method: api.method || 'GET',
      body: formatApiField(api.body || []),
      headers: formatApiField(api.headers || []),
      binary: api.binary || ([] as any),
      responseType: api.responseType || '',
      formData: formatApiField(api.formData || []),
      activeTab: api.activeTab || 'params',
      json: api.json || ''
    })
  })
  return result
}

// 处理字段
export const formatApiField = (list: Array<FieldType>): Array<FieldType> => {
  const result: Array<FieldType> = []
  if (!list.length) {
    return [
      {
        id: createUid(),
        key: '',
        value: '',
        selected: true,
        type: 'text'
      }
    ]
  }

  list.forEach((field) => {
    result.push({
      id: createUid(),
      key: field.key || ``,
      value: field.value || '',
      selected: field.selected || false,
      type: field.type || 'text'
    })
  })
  return result
}

// 解析可用字段
export const parseKeyValueByArr = (arr) => {
  const result = {}

  arr.forEach((item) => {
    const key = item.key.trim() || ''
    if (key) {
      result[key] = item.value
    }
  })
  return result
}
