import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/logo.png?asset'
import initProject, { saveDataToLocal, getLocalData } from './project'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      allowRunningInsecureContent: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    // mainWindow.webContents.openDevTools()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('request-invokable-ipc', (_, ...args) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [url, option] = args
        const res = await fetch(url, option)

        if (!res.ok) {
          return reject(
            JSON.stringify(
              {
                status: res.status,
                message: `HTTP错误! 状态码: ${res.status}`,
                url: res.url,
                headers: Object.fromEntries(res.headers.entries()),
                error: new Error('HTTP请求失败')
              },
              null,
              2
            )
          )
        }
        let data: any = null
        // 根据响应头判断是否为json
        const contentType = res.headers.get('content-type') || ''
        if (contentType && contentType.includes('application/json')) {
          data = await res.json()
        } else if (
          contentType.includes('text') ||
          contentType.includes('html') ||
          contentType.includes('xml') ||
          contentType.includes('xhtml') ||
          contentType.includes('svg')
        ) {
          data = await res.text()
        } else if (contentType && contentType.includes('image')) {
          data = await res.blob()
        } else if (contentType && contentType.includes('application/octet-stream')) {
          data = await res.blob()
        } else {
          data = await res.text()
        }

        resolve(
          JSON.stringify(
            {
              data,
              status: res.status,
              headers: Object.fromEntries(res.headers.entries()),
              url: res.url
            },
            null,
            2
          )
        )
      } catch (error) {
        // 将错误信息转换为JSON
        reject(
          JSON.stringify(
            {
              error: error instanceof Error ? error.message : error
            },
            null,
            2
          )
        )
      }
    })
  })

  // 保存数据到本地
  ipcMain.handle('save-data', async (_, data) => {
    return saveDataToLocal(data)
  })
  // 获取本地数据
  ipcMain.handle('get-data', async () => {
    return getLocalData()
  })

  // 检测最小化
  ipcMain.on('minimize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.minimize()
    }
  })
  ipcMain.on('close', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.close()
    }
  })
  ipcMain.on('maximize', () => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      // 判断是否已经最大化
      if (window.isMaximized()) {
        return window.restore()
      }
      window.maximize()
    }
  })
  initProject()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('web-contents-created', (_, contents) => {
  if (contents.getType() === 'webview') {
    contents.setWindowOpenHandler(({ url }) => {
      // 在当前 webview 加载 URL，并阻止新窗口
      contents.loadURL(url)
      return { action: 'deny' }
    })
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
