import { ApiProps, ProjectProps } from '@renderer/types/apiTypes'
import { parseKeyValueByArr } from '@renderer/utils/api'
// 获取一个唯一的id
export const createUid = () => {
  return 'ImApi_' + Math.random().toString(36).slice(2, 8) + '_' + Date.now().toString(36)
}

/**
 * 验证并纠正拼接的地址
 * @param {string} baseUrl 基础URL
 * @param {string} path 路径部分
 * @returns {string} 纠正后的完整URL
 */
function validateAndCorrectUrl(baseUrl, path) {
  // 去除两端空格
  baseUrl = (baseUrl || '').trim()
  path = (path || '').trim()

  // 如果path已经是完整URL，直接返回
  try {
    new URL(path)
    return path
  } catch (e) {
    // 不是完整URL，继续处理
  }

  // 确保baseUrl以协议开头
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = 'http://' + baseUrl
  }

  // 处理baseUrl末尾的斜杠和path开头的斜杠
  baseUrl = baseUrl.replace(/\/+$/, '') // 移除baseUrl末尾的所有斜杠
  path = path.replace(/^\/+/, '') // 移除path开头的所有斜杠

  // 拼接URL
  let fullUrl = baseUrl + '/' + path

  // 处理连续的斜杠
  fullUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1')

  // 再次验证URL是否有效
  try {
    new URL(fullUrl)
    return fullUrl
  } catch (e) {
    console.error('无法纠正的URL:', fullUrl, e)
    return fullUrl // 仍然返回拼接结果，尽管可能无效
  }
}

export const formatRequestParams = async (apiData: ApiProps, proData: ProjectProps) => {
  try {
    // 根据这些字段自动生成fetch请求参数
    const Headers = parseKeyValueByArr(apiData?.headers)
    const Params = parseKeyValueByArr(apiData?.params)
    const Body = parseKeyValueByArr(apiData?.body)
    const formData = parseKeyValueByArr(apiData?.formData)

    // 解析baseURL
    const options = {
      headers: { ...Headers }
    } as any

    const baseURL = proData?.baseURL || ''
    const path = apiData?.path || ''
    let url = validateAndCorrectUrl(baseURL, path)
    const token = proData?.token?.trim() || ''
    const cookie = proData?.cookie?.trim() || ''
    const tokenKey = proData?.tokenKey?.trim() || 'Authorization'

    if (!isVoidUrl(url)) {
      return Promise.reject('无效的URL:' + url)
    }
    if (token) {
      options.headers = {
        ...options.headers,
        [tokenKey]: token
      }
    }

    if (cookie) {
      options.headers = {
        ...options.headers,
        Cookie: cookie
      }
    }
    if (Object.keys(Params).length) {
      url +=
        '?' +
        Object.keys(Params)
          .map((key) => `${key}=${Params[key]}`)
          .join('&') // 拼接参数到url后面，例如：?name=xxx&age=18
    }

    if (Object.keys(Body).length) {
      options.body = JSON.stringify(Body)
    } else if (Object.keys(formData).length) {
      options.body = new FormData()
      Object.keys(formData).forEach((key) => {
        const value = formData[key]
        if (value instanceof File) {
          options.body.append(key, value)
        } else {
          options.body.append(key, String(value))
        }
      })
    }
    if (apiData.method) {
      options.method = apiData.method
    } else {
      options.method = 'GET'
    }

    // 判断是否是二进制文件 上传文件时需要设置responseType为blob，否则无法获取到文件内容
    if (apiData.binary?.length) {
      // 读取文件为blob类型，以便后续处理文件内容
      const file = apiData.binary[0] as File
      await new Promise((resolve) => {
        const read = new FileReader()

        read.readAsArrayBuffer(file)
        read.onload = (e) => {
          options.body = e.target?.result
          options.responseType = 'blob'
          resolve(true)
        }
        read.onerror = (e) => {
          console.error('读取文件失败', e)
          resolve(false)
        }
      })
    }

    // 判断JSON
    if (apiData.json) {
      options.body = apiData.json
    }

    return {
      url,
      options,
      timeOut: proData?.timeOut || 0
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const isVoidUrl = (url: string) => {
  // 验证URL格式
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return false
  }
  return true
}
