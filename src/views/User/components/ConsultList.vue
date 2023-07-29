<script setup lang="ts">
// @ts-ignore
import type { ConsultType } from '@/enums'
import ConsultItem from './ConsultItem.vue'
import { ref } from 'vue'
// @ts-ignore
import type { ConsultOrderListParams, ConsultOrderItem } from '@/types/consult'
// @ts-ignore
import { getConsultOrderList } from '@/services/consult'

const props = defineProps<{
  type: ConsultType
}>()
const params = ref<ConsultOrderListParams>({
  type: props.type,
  current: 1,
  pageSize: 5
})
// 加载更多
const loading = ref(false)
const finished = ref(false)
const list = ref<ConsultOrderItem>([])
const onLoad = async () => {
  loading.value = true
  const res = await getConsultOrderList(params.value)
  list.value.push(...res.data.rows)
  if (params.value.current < res.data.pageTotal) {
    params.value.current++
  } else {
    finished.value = true
  }
  loading.value = false
}

// 删除订单
const onDelete = (id: string) => {
  list.value = list.value.filter((item) => item.id !== id)
  // 删除订单后列表没有数据后，重新加载数据
  if (!list.value.length) onLoad()
}
</script>

<template>
  <div class="consult-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <consult-item v-for="item in list" :key="item.id" :item="item" @on-delete="onDelete" />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
