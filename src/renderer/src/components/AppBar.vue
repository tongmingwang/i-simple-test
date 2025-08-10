<template>
  <header class="app_bar drag">
    <div class="left">
      <img src="../assets/logo.svg" alt="i简测" class="logo" />
      <span class="title">i简测</span>
    </div>
    <div class="app_menu no_drag">
      <ImButton variant="text" size="36" shape="circle" @click="openView = true">
        <ImIcon name="search" size="20" />
      </ImButton>
      <ImButton color="default" variant="text" shape="circle" size="36" @click="onOpenTip">
        <ImIcon name="question-circle" size="20" />
      </ImButton>
      <ImButton color="default" variant="text" shape="circle" size="36" @click="open = true">
        <ImIcon name="setting" size="20" />
      </ImButton>

      <ImDivider vertical />

      <ImButton shape="circle" variant="text" @click="onMini">
        <ImIcon name="minus" size="18" />
      </ImButton>
      <ImButton shape="circle" variant="text" @click="onSetMax">
        <ImIcon name="expend" size="18" />
      </ImButton>
      <ImButton shape="circle" variant="text" @click="onClose">
        <ImIcon name="close" size="18" />
      </ImButton>
    </div>
  </header>

  <!-- 对话框 -->
  <ImDrawer v-model="open" size="280">
    <ImDialogHeader divider class="mb_16">
      设置
      <template #action>
        <ImButton color="default" variant="text" shape="circle" size="40" @click="open = false">
          <ImIcon name="close" size="20" />
        </ImButton>
      </template>
    </ImDialogHeader>
    <ImDialogBody>
      <ImAlert class="mb_16">
        <template #icon>
          <ImIcon name="info-circle" size="24" />
        </template>
        设置主题</ImAlert
      >

      <ImRadioGroup vertical v-model="theme">
        <ImRadio value="system">根据系统</ImRadio>
        <ImRadio value="light">亮色模式</ImRadio>
        <ImRadio value="dark">暗色模式</ImRadio>
      </ImRadioGroup>
    </ImDialogBody>
  </ImDrawer>
  <!-- 全屏对话框 -->
  <ImDialog v-model="openTip" fullscreen class="no_drag">
    <ImDialogHeader divider class="mb_16">
      使用说明
      <template #action>
        <ImButton color="default" variant="text" shape="circle" size="40" @click="openTip = false">
          <ImIcon name="close" size="20" />
        </ImButton>
      </template>
    </ImDialogHeader>
    <ImDialogBody>
      <div class="tip_content">
        <h2>一、新建项目</h2>
        <div>首先先创建项目或者模块，方便配置请求公共部分，如请求地址前缀，时间，toke/cookie等</div>
        <img src="../assets/tips/addproject.png" />

        <h2>二、填写项目基础配置</h2>
        <div>设置项目基础配置信息，项目名称，描述，BaseURL，Timeout,Token,cookie等</div>
        <img src="../assets/tips/project.png" />

        <h2>三、操作区</h2>
        <div>一个请求需要做哪些事情？</div>
        <div>请求地址，请求头，请求体等信息可以通过如下操作完成</div>
        <img src="../assets/tips/actions.png" />

        <h2>四、设置主题</h2>
        <div>可以根据自己的喜好设置主题</div>
        <img src="../assets/tips/theme.png" />
      </div>
    </ImDialogBody>
  </ImDialog>

  <!-- webview模式 -->
  <ImDialog v-model="openView" width="90%" height="90%" class="no_drag">
    <ImDialogHeader divider>
      搜索一下
      <template #action>
        <ImButton color="default" variant="text" shape="circle" size="40" @click="openView = false">
          <ImIcon name="close" size="20" />
        </ImButton>
      </template>
    </ImDialogHeader>
    <div>
      <div class="pl_24 pr_24">
        <ImTabs v-model="searchUrl" color="warning">
          <ImTab v-for="item in List" :name="item.url">{{ item.label }}</ImTab>
        </ImTabs>
      </div>
      <ImPanes v-model="searchUrl">
        <ImPane v-for="item in List" :name="item.url">
          <webview id="webview" :src="item.url" allowpopups nodeintegration></webview>
        </ImPane>
      </ImPanes>
    </div>
  </ImDialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useApiStore } from '@renderer/store/useApiStore'

const open = ref(false)
const openTip = ref(false)
const openView = ref(false)
const theme = ref('dark')
const ipc = window.electron.ipcRenderer
const searchUrl = ref('https://www.bing.com/')

const store = useApiStore()

const List = [
  {
    label: '百度',
    url: 'https://www.baidu.com'
  },
  {
    label: 'DeepSeek',
    url: 'https://chat.deepseek.com/'
  },
  {
    label: 'google',
    url: 'https://www.google.com/'
  },
  {
    label: 'Bing',
    url: 'https://www.bing.com/'
  }
]

// 获取本地储存
onMounted(() => {
  theme.value = localStorage.getItem('theme') || 'dark'
  updateTheme()
})
// 监听主题变化，并保存到本地储存
watch(theme, (val) => {
  localStorage.setItem('theme', val)
  updateTheme()
})

const onMini = () => {
  ipc.send('minimize')
}

const onSetMax = () => {
  ipc.send('maximize')
}

const onClose = () => {
  ipc.send('close')
}

// 设置主题
function updateTheme() {
  const root = document.documentElement
  switch (theme.value) {
    case 'system':
      const isDark = window.matchMedia('(prefers-color-scheme: dark)')
      if (isDark.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
      }
      break
    case 'light':
      root.classList.add('light')
      root.classList.remove('dark')
      break
    case 'dark':
      root.classList.add('dark')
      root.classList.remove('light')
      break
  }
  // 更新store中的值
  store.theme = theme.value
}

const onOpenTip = () => {
  openTip.value = true
}
</script>

<style scoped lang="scss">
.app_bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--im-bg-content-color);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 100;
  height: 48px;

  .left {
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo {
    width: 20px;
    height: 20px;
  }

  .menu_items {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.app_menu {
  display: flex;
  align-items: center;
  height: 48px;
  padding-right: 8px;
  gap: 8px;
}

.mb_24 {
  margin-bottom: 24px;
}
.mb_16 {
  margin-bottom: 16px;
}

.tip_content {
  padding: 16px;
  height: calc(100vh - 114px);
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  line-height: 28px;

  img {
    margin: 16px 0;
    border-radius: 8px;
  }
  h2 {
    font-size: 18px;
    line-height: 40px;
  }
}

.tip_text {
  font-size: 14px;
  margin-left: 24px;
}

#webview {
  height: calc(80vh - 90px);
  overflow: auto;
  border-radius: 4px;
}
</style>
