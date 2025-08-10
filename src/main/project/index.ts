import fs from 'fs'
import path from 'path'
import { app } from 'electron'

// 保存的路径
const LocalDataName = 'LOCAL_DATA.json'

export function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// 判断目录是否存在
export function isDirExist(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
}

// 创建目录
export function createDirIfNotExists(dirPath: string): void {
  if (!isDirExist(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// 获取文件列表
export async function getFileList(dirPath: string): Promise<string[]> {
  const files = await new Promise<string[]>((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
  return files
}

// 获取文件路径
export function getFilePath(fileName: string): string {
  return path.join(app.getPath('userData'), 'Im_APi_data', fileName)
}

export default async function initProject() {
  // 判断当前安装路径是否有目录为 project，如果没有则创建
  const projectDirPath = path.join(app.getPath('userData'), 'Im_APi_data')
  createDirIfNotExists(projectDirPath)
}

// 保存数据到本地,node.js写文件到目录下
export const saveDataToLocal = async (data: string) => {
  if (!data) return Promise.reject('data is required')
  try {
    const filePath = getFilePath(LocalDataName)
    await fs.writeFileSync(filePath, data, 'utf8')
    return filePath
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getLocalData = async () => {
  try {
    const projectDirPath = path.join(app.getPath('userData'), 'Im_APi_data')
    const filePath = path.join(projectDirPath, LocalDataName)
    // 判断文件是否存在
    if (!fs.existsSync(filePath)) {
      return Promise.reject('file not found')
    }

    const data = await readFile(filePath)
    return data
    // const files = await getFileList(projectDirPath)
    // 读取文件内容
    // const result: Array<Object> = []
    // for (const file of files) {
    //   const filePath = path.join(projectDirPath, file)
    //   try {
    //     const data = await readFile(filePath)
    //     const arr = JSON.parse(data)
    //     result.push(Array.isArray(arr) ? arr : arr)
    //     console.log('data:', data)
    //   } catch (error) {
    //     console.log('readFile error', error)
    //   }
    // }
    // return JSON.stringify(result)
  } catch (error) {
    console.log('getLocalData error', error)
    return Promise.reject(error)
  }
}
