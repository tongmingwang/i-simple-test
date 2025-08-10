<template>
  <div>
    <ImTable fixedHeader>
      <thead>
        <tr>
          <th class="checkbox_width">
            <ImCheckbox
              v-model="checkedAll"
              @change="onCheckAll"
              :indeterminate="indeterminate"
              label=""
            />
          </th>
          <th class="item_w">
            <span>Key</span>
            <ImTooltip class="ml_8" placement="bottom-right">
              <span><ImIcon name="question-circle" size="18" /></span>
              <template #content> 字段的键 </template>
            </ImTooltip>
          </th>
          <th class="item_w">
            <span>Value</span>
            <ImTooltip class="ml_8" placement="bottom-right">
              <ImIcon name="question-circle" size="18" />
              <template #content> 字段的值 </template>
            </ImTooltip>
          </th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in apiParamsList">
          <td class="checkbox_width"><ImCheckbox :value="item.id" v-model="item.selected" /></td>
          <td class="item_w">
            <ImInput placeholder="key" v-model="item.key" />
          </td>
          <td class="item_w">
            <div class="flex center between">
              <ImInput placeholder="value" v-model="item.value" v-if="item.type == 'text'" />
              <input type="file" v-else @change="(e) => handleItemFile(e, item)" />

              <ImDropdown class="ml_8" placement="bottom-right" v-if="props.name == 'formData'">
                <ImButton variant="tonal" shape="circle">
                  <ImIcon name="caret-down" />
                </ImButton>
                <template #content>
                  <ImList v-model="item.type" @change="() => (item.value = '')">
                    <ImListItem value="text">
                      <ImIcon name="file-text" size="20" class="mr_8" />
                      文本类型</ImListItem
                    >
                    <ImListItem value="file">
                      <ImIcon name="file-image" size="20" class="mr_8" />文件类型</ImListItem
                    >
                  </ImList>
                </template>
              </ImDropdown>
            </div>
          </td>
          <td class="edit_actions">
            <ImButton variant="tonal" shape="circle" color="primary" class="mr_8" @click="addField">
              <ImIcon name="plus" /> </ImButton
            ><ImButton
              v-if="apiParamsList.length > 1"
              variant="tonal"
              color="error"
              shape="circle"
              @click="() => removeField(item.id)"
            >
              <ImIcon name="close" />
            </ImButton>
          </td>
        </tr>
      </tbody>
    </ImTable>
  </div>
</template>

<script setup lang="ts">
import { ImButton, ImCheckbox, ImDropdown, ImIcon, ImTooltip } from 'im-design'
import { ref, computed, watch } from 'vue'
import { useApiStore } from '@renderer/store/useApiStore'
import type { FieldType } from '@renderer/types/apiTypes'
import { formatApiField } from '@renderer/utils/api'

const props = withDefaults(
  defineProps<{
    name: string
  }>(),
  {}
)

const store = useApiStore()
const checkedAll = ref(false)
// 渲染的实际列表，用于渲染表格数据
const apiParamsList = computed<Array<FieldType>>(() => {
  return store.activeApi?.[props.name || 'params'] || []
})
const checkedList = computed(() => {
  return apiParamsList.value?.filter((o) => o.selected)
})
// 选择一部分
const indeterminate = computed(() => {
  const len = apiParamsList.value.length
  const checkedLen = apiParamsList.value.filter((o) => o.selected).length

  return checkedLen > 0 && checkedLen < len
})

watch(
  () => checkedList.value,
  () => {
    checkedAll.value = checkedList.value.length === apiParamsList.value.length
  },
  {
    immediate: true,
    flush: 'post'
  }
)

function onCheckAll() {
  store.setFiledSelected(checkedAll.value ? apiParamsList.value?.map((o) => o.id) : [])
}

function addField() {
  const items = formatApiField([])
  store.addApiField(items[0])
}
function removeField(id: string) {
  store.removeFiledById(id)
}

function handleItemFile(e: Event, item: FieldType) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    item.value = target.files[0]
  }
}
</script>

<style scoped lang="scss">
.edit_actions {
  width: 120px;
  max-width: 120px;
}

.checkbox_width {
  width: 60px;
  max-width: 60px;
}

.item_w {
  min-width: 150px;
}
</style>
