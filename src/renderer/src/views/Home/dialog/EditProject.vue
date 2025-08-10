<template>
  <div>
    <ImDialog v-model="editProShow" :getTarget="props.getTarget" width="520" class="no_drag">
      <ImDialogHeader divider
        >项目配置
        <template #action>
          <ImButton shape="square" variant="text" @click="editProShow = false">
            <ImIcon name="close" size="20" />
          </ImButton>
        </template>
      </ImDialogHeader>
      <ImDialogBody class="mt_16">
        <ImAlert class="mb_16">每一个项目基础配置统一，便于后续请求复用。</ImAlert>
        <div class="mb_16 flex center">
          <span class="base_label">项目名称:</span>
          <ImInput placeholder="项目名称 10个字符以内" maxlength="10" v-model="form.name" />
        </div>

        <div class="mb_16 flex center">
          <span class="base_label">BaseURl:</span>
          <ImInput placeholder="baseURL" v-model="form.baseURL" />
        </div>
        <div class="mb_16 flex center">
          <span class="base_label">TimeOut:</span>
          <ImInputNumber
            placeholder="超时"
            controlRight
            v-model="form.timeOut"
            :min="0"
            suffix="ms"
          />
        </div>

        <div class="mb_16 flex center">
          <span class="base_label">TokenKey:</span>
          <ImInput placeholder="TokenKey" v-model="form.tokenKey" />
        </div>

        <div class="mb_16 flex center">
          <span class="base_label">Token:</span>
          <ImInput placeholder="Token" v-model="form.token" />
        </div>

        <!-- cookie -->
        <div class="mb_16 flex center">
          <span class="base_label">Cookie:</span>
          <ImInput placeholder="Cookie" v-model="form.cookie" />
        </div>

        <div class="flex">
          <span class="base_label">项目描述:</span>
          <ImTextarea placeholder="请输入项目描述" v-model="form.description" />
        </div>
      </ImDialogBody>

      <ImDialogFooter>
        <ImButton @click="editProShow = false">取消</ImButton>
        <ImButton @click="onSave" color="primary">保存</ImButton>
      </ImDialogFooter>
    </ImDialog>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ref } from 'vue'

const props = defineProps<{
  getTarget?: () => HTMLElement | null
}>()

const editProShow = ref(false)
const form = reactive({
  name: '',
  baseURL: '',
  timeOut: '',
  tokenKey: '',
  token: '',
  cookie: '',
  description: '',
  id: ''
})

const emit = defineEmits(['save'])

defineExpose({
  setVisible: (bol: boolean) => {
    editProShow.value = bol
  },
  setForm: (data: { [key: string]: string }) => {
    console.log(data, 'form')

    for (let key in form) {
      form[key] = data[key]
    }
    if (data.id) {
      form.id = data.id
    } else {
      form.id = ''
    }
  },
  resetForm: () => {
    for (let key in form) {
      form[key] = ''
    }
  },
  getForm: () => {
    return { ...form }
  }
})

const onSave = () => {
  console.log('保存')
  editProShow.value = false
  emit('save', { ...form })
}
</script>

<style scoped></style>
