import { defineStore } from 'pinia'
import type { ApiProps, FieldType, ProjectProps } from '@renderer/types/apiTypes'
import { formatApiList, formatProjectData } from '@renderer/utils/api'

export const useApiStore = defineStore('api', {
  state: () => ({
    // 项目列表
    projectList: [] as Array<ProjectProps>,
    // 激活的项目id
    activeProjectId: '',
    // 激活的接口id
    activeApiId: '',
    // 发起请求
    loading: false,
    theme: 'dark'
  }),
  getters: {
    // 添加项目
    activeProject: (state) => {
      if (!state.projectList.length) return {}
      return state.projectList.find((item) => item.id === state.activeProjectId) || {}
    },
    // 接口列表
    activeApiList: (state) => {
      if (!state.projectList.length) return []
      return state.projectList.find((item) => item.id === state.activeProjectId)?.apiList || []
    },
    // 接口激活
    activeApi: (state) => {
      if (!state.projectList.length) return {}
      return (
        state.projectList
          ?.find((item) => item.id === state.activeProjectId)
          ?.apiList.find((apiItem) => apiItem.id === state.activeApiId) || {}
      )
    }
  },

  actions: {
    // 添加项目，需要初始化数据
    addProjectList(projects: Array<ProjectProps>) {
      const list = formatProjectData(projects)
      this.projectList = []
      this.projectList.push(...list)
      // 判断不存在激活的项目id，则设置为第一个项目
      if (!this.activeProjectId && this.projectList.length > 0) {
        this.activeProjectId = this.projectList[0].id
        // 激活APi
        if (this.projectList[0].apiList.length > 0) {
          this.setActiveApi(this.projectList[0].apiList[0])
        }
      }
    },
    addProject(pro: ProjectProps) {
      const project = formatProjectData([pro])[0]
      this.projectList.push(project)
    },
    editProject(form: ProjectProps) {
      this.projectList.forEach((item) => {
        if (item.id === form.id) {
          Object.assign(item, { ...form, id: item.id })
        }
      })
    },
    deleteProject(id: string) {
      const index = this.projectList.findIndex((item) => item.id === id)
      if (index !== -1) {
        this.projectList.splice(index, 1)
      }
    },
    setActiveProject(id: string) {
      this.activeProjectId = id
      // 更新激活的apiid
      const apiList = this.projectList?.find((item) => item.id === this.activeProjectId)?.apiList

      if (apiList) {
        apiList.forEach((item, i) => {
          if (i === 0) {
            this.setActiveApi(item)
            item.activeTab = 'params'
          }
        })
      }
    },
    getACtiveProject() {
      return this.projectList.find((item) => item.id === this.activeProjectId)
    },

    setActiveApi(api: ApiProps) {
      this.activeApiId = api.id
    },

    // api 相关操作
    addApi(apiObj?: ApiProps) {
      const project = this.getACtiveProject()
      if (!project) return
      const item = formatApiList(apiObj ? [apiObj] : [])[0]
      project.apiList.push(item)
      // 激活当前
      this.setActiveApi(item)
    },
    editApiInfo(data: ApiProps) {
      const project = this.getACtiveProject()
      console.log('更新')

      if (!project) return
      const curData = formatApiList([data])[0]
      project.apiList.forEach((item) => {
        if (item.id === data.id) {
          Object.assign(item, { ...curData, id: item.id })
        }
      })
    },

    removeApiById(id: string) {
      const pro = this.getACtiveProject()
      if (!pro) return
      // 删除接口，判断是否是激活的接口，如果是则设置为第一个接口
      pro.apiList = pro.apiList.filter((item) => item.id !== id)
      const len = pro.apiList?.length
      if (this.activeApiId === id) {
        this.activeApiId = len ? pro.apiList[len - 1].id : ''
      }
    },

    addApiField(fieldObj: FieldType) {
      const project = this.projectList.find((item) => item.id === this.activeProjectId)
      if (!project) return
      // 找到api对应的字段，如果没有则创建
      project.apiList.forEach((api) => {
        if (api.id === this.activeApiId) {
          const key = api.activeTab || 'params'
          // @ts-ignore
          api[key].push(fieldObj)
        }
      })
    },

    removeFiledById(id: string) {
      const project = this.projectList.find((item) => item.id === this.activeProjectId)
      if (!project) return
      project.apiList.forEach((api) => {
        if (api.id === this.activeApiId) {
          const key = api.activeTab || 'params'
          // @ts-ignore
          const index = api[key]?.findIndex((item) => item.id === id)
          if (index !== -1) {
            // @ts-ignore
            api[key].splice(index, 1)
          }
        }
      })
    },

    // 更新是否选择,选择的数组
    setFiledSelected(arr: Array<string>) {
      const project = this.projectList.find((item) => item.id === this.activeProjectId)
      if (!project) return
      project.apiList.forEach((api) => {
        if (api.id === this.activeApiId) {
          const key = api.activeTab || 'params'
          // @ts-ignore
          api[key]?.forEach((field) => {
            field.selected = arr.includes(field.id)
          })
        }
      })
    }
  }
})
