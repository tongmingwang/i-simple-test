<template>
  <div>
    <ImDialog v-model="editProShow" :getTarget="props.getTarget" width="520" class="no_drag">
      <ImDialogHeader divider
        >接口信息
        <template #action>
          <ImButton shape="square" variant="text" @click="editProShow = false">
            <ImIcon name="close" size="20" />
          </ImButton>
        </template>
      </ImDialogHeader>
      <ImDialogBody class="mt_16">
        <div class="mb_16 flex center">
          <span class="base_label">接口名称:</span>
          <ImInput placeholder="名称 10个字符以内" maxlength="10" v-model="form.name" />
        </div>

        <div class="flex">
          <span class="base_label">接口描述:</span>
          <ImTextarea placeholder="请输入描述" v-model="form.description" />
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
const emit = defineEmits(['save'])
const editProShow = ref(false)
const form = reactive({
  name: '',
  description: '',
  id: ''
})

defineExpose({
  setVisible: (bol: boolean) => {
    editProShow.value = bol
  },
  setForm: (data: { [key: string]: string }) => {
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
