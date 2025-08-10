<template>
  <div class="home">
    <section class="project">
      <ImCard borderless>
        <ImCardHeader divider>
          项目列表
          <template #actions>
            <ImButton variant="text" id="ADD_PROJECT" color="primary" @click="onAddProject">
              添加项目
            </ImButton>
          </template>
        </ImCardHeader>
        <ImMenu
          vertical
          v-model="apiStore.activeProjectId"
          :style="{
            '--im-menu-width': '100%'
          }"
        >
          <ImMenuItem
            :name="item.id"
            v-for="item in apiStore.projectList"
            style="width: 100%"
            :disabled="apiStore.loading"
          >
            <div class="flex center between">
              <span class="flex_1">{{ item.name }}</span>
              <ImButton
                shape="circle"
                variant="text"
                size="24"
                v-if="apiStore.activeProjectId !== item.id"
                @mousedown.stop
                @click.stop="() => onRemoveProject(item.id)"
              >
                <ImIcon name="close" size="1em" />
              </ImButton>
            </div>
          </ImMenuItem>
        </ImMenu>
      </ImCard>
    </section>
    <section class="api-list">
      <div class="flex between gap_8 mb_16">
        <div class="flex center gap_8"></div>

        <div class="flex center gap_8">
          <ImButton variant="tonal" @click="() => onAddEditApi()"> 添加接口 </ImButton>
          <ImButton
            variant="tonal"
            @mousedown.stop="() => {}"
            id="EDIT_PROJECT"
            @click.stop="onEditProject"
          >
            项目配置
          </ImButton>

          <ImButton variant="tonal" :loading="saveLoading" @click="saveDataToSystem">
            保存项目</ImButton
          >
          <ImButton variant="tonal" :loading="saveLoading" @click="exportToJSON">
            导出JSON</ImButton
          >
        </div>
      </div>
      <div class="request_config">
        <ImTabs color="primary" v-model="apiStore.activeApiId">
          <ImTab :name="item.id" v-for="item in apiStore.activeApiList"
            >{{ item.name }}
            <ImDropdown class="ml_8">
              <ImIcon name="caret-down" size="20" @mousedown.stop @click.stop="" />
              <template #content>
                <ImList>
                  <ImListItem @click="() => onAddEditApi(item)"> 编辑接口</ImListItem>
                  <ImListItem
                    @click="() => onRemoveApiById(item.id)"
                    v-if="apiStore.activeApiList.length > 1"
                    >删除接口
                  </ImListItem>
                </ImList>
              </template>
            </ImDropdown>
          </ImTab>
        </ImTabs>
        <ImPanes v-model="apiStore.activeApiId">
          <ImPane :name="item.id" v-for="item in apiStore.activeApiList">
            <div class="api_flex mb_16">
              <ImSelect v-model="item.method" placeholder="请选择" :options="METHOD_OPTIONS" />
              <ImInput
                placeholder="请输入接口地址"
                style="flex: 1; min-width: 240px"
                clearable
                v-model="item.path"
              >
              </ImInput>
              <ImButton color="primary" :disabled="apiStore.loading" @click="onSend">
                发送请求
                <ImIcon name="send" size="20" style="margin-left: 8px" />
              </ImButton>
            </div>
            <div>
              <ImTabs v-model="item.activeTab">
                <ImTab name="params">Params</ImTab>
                <ImTab name="headers">Headers</ImTab>
                <ImTab name="body">Body</ImTab>
                <ImTab name="binary">Binary</ImTab>
                <ImTab name="formData">FormData</ImTab>
                <ImTab name="json">JSON</ImTab>
              </ImTabs>
              <ImPanes v-model="item.activeTab">
                <ImPane name="params" class="pane_item">
                  <AddKeyValue name="params" />
                </ImPane>
                <ImPane name="headers" class="pane_item">
                  <AddKeyValue name="headers" />
                </ImPane>
                <ImPane name="body" class="pane_item">
                  <AddKeyValue name="body" />
                </ImPane>
                <ImPane name="binary" class="pane_item">
                  <ImUpload
                    :fileList="item.binary"
                    ref="uploadRef"
                    @change="(fileList) => (item.binary = fileList?.length ? fileList : null)"
                  >
                    <template v-slot="{ fileList }">
                      <div v-if="fileList.length" class="file_list">
                        <span v-for="file in fileList" class="file_item">
                          <ImIcon name="file" /> <span>{{ file.name }}</span>
                          <span>{{ file.size }}</span>
                          <ImButton
                            shape="circle"
                            variant="text"
                            size="24"
                            @click.stop="() => onRemoveFile(item)"
                          >
                            <ImIcon name="close" />
                          </ImButton>
                        </span>
                      </div>
                    </template>
                  </ImUpload>
                </ImPane>
                <ImPane name="formData" class="pane_item">
                  <AddKeyValue name="formData" />
                </ImPane>
                <ImPane name="json" class="pane_item">
                  <ImAlert class="mb_16" variant="outlined" color="warning"
                    >使用JSON输入，请求体全部使用该数据！</ImAlert
                  >
                  <JsonEditorVue
                    v-model="item.json"
                    :allowed-modes="[Mode.tree, Mode.text]"
                    :mode="Mode.text"
                    :class="apiStore.theme === 'light' ? '' : 'jse-theme-dark'"
                  />
                </ImPane>
              </ImPanes>
            </div>
          </ImPane>
        </ImPanes>
      </div>
      <ImAlert :color="responseColor" v-if="responseText" variant="outlined" class="mt_16"
        >{{ responseColor === 'success' ? '成功' : '异常' }} 参考响应结果查看详细信息
      </ImAlert>
      <!-- 请求和响应 -->
      <div class="result">
        <ImTabs v-model="resultTab">
          <ImTab name="request">请求参数</ImTab>
          <ImTab name="response">响应结果</ImTab>
        </ImTabs>
        <ImPanes v-model="resultTab">
          <ImPane name="request" class="pane_item">
            <Transition name="fade" mode="out-in">
              <ImAlert color="primary" variant="outlined" :showIcon="false" v-if="requestText">
                <VueJsonPretty :data="requestText" />
              </ImAlert>
              <ImEmpty v-else>暂无请求参数</ImEmpty>
            </Transition>
          </ImPane>
          <ImPane name="response" class="pane_item">
            <Transition name="fade" mode="out-in">
              <ImAlert
                :color="responseColor"
                v-if="responseText"
                :showIcon="false"
                variant="outlined"
              >
                <VueJsonPretty :data="responseText" />
              </ImAlert>

              <ImEmpty v-else>暂无响应信息 </ImEmpty>
            </Transition>
          </ImPane>
        </ImPanes>
      </div>
      <HelpAuth />
    </section>
  </div>

  <!-- 对话 -->
  <EditProject ref="editFormRef" :getTarget="getTarget" @save="onSaveProject" />
  <EditApiDialog ref="editApiRef" @save="onSaveApi" />
</template>

<script setup lang="ts">
import AddKeyValue from './modules/AddKeyValue.vue'
import { useApiStore } from '../../store/useApiStore'
import { METHOD_OPTIONS } from '../../utils/constance'
import { DEFAULT_PROJECT_DATA } from '@renderer/utils/constance'
import { ref, watch, onMounted } from 'vue'
import EditProject from './dialog/EditProject.vue'
import EditApiDialog from './dialog/EditApi.vue'
import { ApiProps, ProjectProps } from '@renderer/types/apiTypes'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { httpRequest, saveDataToLocal, getLocalData, getFormatData } from '@renderer/utils/request'
import { formatRequestParams } from '@renderer/utils/base'
import JsonEditorVue from 'json-editor-vue'
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import { Mode } from 'vanilla-jsoneditor'
import HelpAuth from '@renderer/components/HelpAuth.vue'
import { useImMessage } from 'im-design'

const message = useImMessage()
const apiStore = useApiStore()
const resultTab = ref('request')
const requestText = ref<any>(null)
const responseText = ref<any>(null)
// 编辑项目表单引用
const editFormRef = ref()
const targetId = ref('ADD_PROJECT')
// 编辑接口表单引用
const editApiRef = ref()
const responseColor = ref('success')
const saveLoading = ref(false)

// 上传组件
const uploadRef = ref()

onMounted(async () => {
  try {
    const data = await getLocalData()
    // @ts-ignore
    apiStore.addProjectList(Array.isArray(data) ? data : DEFAULT_PROJECT_DATA)
  } catch (error) {
    apiStore.addProjectList(DEFAULT_PROJECT_DATA)
  }
})
// 更新了，需要更新子
watch(
  () => apiStore.activeProjectId,
  () => {
    apiStore.setActiveProject(apiStore.activeProjectId)
  }
)
watch(
  () => apiStore.activeApiId,
  () => {
    // 清除响应结果
    responseText.value = null
    requestText.value = null
    responseColor.value = 'success'
  }
)

const onSend = async () => {
  const apiObj = apiStore.activeApi! as ApiProps
  if (apiObj && !apiObj?.id) return
  apiStore.loading = true
  try {
    const data = await formatRequestParams(apiObj, apiStore.activeProject as ProjectProps)

    requestText.value = data
    const res = await httpRequest(data.url, data.options, data.timeOut)
    responseText.value = res
    responseColor.value = 'success'
  } catch (error) {
    responseText.value = error
    responseColor.value = 'error'
  }
  apiStore.loading = false
}
function getTarget() {
  return document.getElementById(targetId.value)
}

const onEditProject = () => {
  targetId.value = 'EDIT_PROJECT'
  editFormRef.value.setForm(apiStore.activeProject)
  editFormRef.value.setVisible(true)
}

const onAddProject = () => {
  targetId.value = 'ADD_PROJECT'
  editFormRef.value.setForm({})
  editFormRef.value.setVisible(true)
}

const onSaveProject = (data: ProjectProps) => {
  data.id ? apiStore.editProject(data) : apiStore.addProject(data)
}

const onAddEditApi = (item?: ApiProps) => {
  editApiRef.value.setForm(item ? item : {})
  editApiRef.value.setVisible(true)
}
const onSaveApi = (data) => {
  data.id ? apiStore.editApiInfo(data) : apiStore.addApi(data)
}

const onRemoveApiById = (id: string) => {
  apiStore.removeApiById(id)
}

const onRemoveFile = (item) => {
  const el = Array.isArray(uploadRef.value) ? uploadRef.value[0].$el : uploadRef.value.$el
  item.binary = []
  el.fileList = null
  el.value = null
}

const saveDataToSystem = async () => {
  saveLoading.value = true
  try {
    await saveDataToLocal(apiStore.projectList)
    message.success('你的项目配置保存成功')
  } catch (error) {}
  saveLoading.value = false
}

const onRemoveProject = (id: string) => {
  apiStore.deleteProject(id)
}

const exportToJSON = () => {
  const data = JSON.stringify(getFormatData(apiStore.projectList), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `api-${new Date().getTime()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<style scoped lang="scss">
.home {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  justify-content: flex-start;
  padding: 16px 0 16px 16px;
  overflow-y: auto;
  position: relative;

  .project {
    width: 220px;
    min-width: 220px;
    height: 100%;
    overflow-y: auto;
    position: sticky;
    top: 0;
    left: 0;
    padding: 0;
    border-radius: 8px;
    background-color: var(--im-bg-content-color);
  }

  .api-list {
    padding: 0 16px 0;
    flex: 1;
    width: calc(100% - 220px);
    height: fit-content;

    .api_flex {
      display: flex;
      gap: 8px;
    }

    .pane_item {
      padding: 16px 0;
      min-height: 200px;
    }
  }

  .result {
    margin-top: 16px;
    padding: 1px 16px;
    background-color: var(--im-bg-content-color);
    border-radius: 8px;
  }
}

.file_list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
  cursor: default;

  .file_item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: default;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--im-rgb-color-1);
    }
  }
}

.mb_16 {
  margin-bottom: 16px;
}

.http_config {
  min-height: 350px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
