import { ProjectProps } from '@renderer/types/apiTypes'

export const httpRequest = (url, options, timeOut = 0) => {
  if (!url) return Promise.reject('url is required')
  return new Promise(async (resolve, reject) => {
    const delay = Number(timeOut) || 0
    let timer: any = null
    if (delay > 0) {
      timer = setTimeout(() => {
        reject(new Error('请求超时'))
      }, delay)
    }
    try {
      const ipc = window.electron.ipcRenderer
      const res = await ipc.invoke('request-invokable-ipc', url, options)
      resolve(JSON.parse(res))
    } catch (error) {
      console.log(error, 'error')

      reject(
        String(error).replace("Error: Error invoking remote method 'request-invokable-ipc':", '')
      )
    } finally {
      timer && clearTimeout(timer)
    }
  })
}

export const saveDataToLocal = async (data) => {
  if (!data) return Promise.reject('data is required')
  try {
    const ipc = window.electron.ipcRenderer
    const newData = getFormatData(data)
    const res = await ipc.invoke('save-data', JSON.stringify(newData))
    return res
  } catch (error) {
    return Promise.reject(error)
  }
}

// 递归解析对象，去掉文件相关字段
export function getFormatData(data) {
  return data.map((pro: ProjectProps) => {
    pro.apiList.forEach((api) => {
      api.binary = []
      api.formData?.map((item) => {
        if (item.type == 'file') {
          item.value = ''
        }
        return item
      })
    })
    return pro
  })
}

export const getLocalData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const ipc = window.electron.ipcRenderer
      const res = await ipc.invoke('get-data')
      if (!res) return resolve([])
      resolve(JSON.parse(res))
    } catch (error) {
      reject(error)
    }
  })
}
