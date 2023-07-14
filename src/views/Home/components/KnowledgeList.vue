<script setup lang="ts">
import KnowledgeCard from './KnowledgeCard.vue'
// @ts-ignore
import { getKnowledgePage } from '@/services/consult'
// @ts-ignore
import { KnowledgeType, KnowledgeParams, KnowledgeList } from '@/types/consult'
import { ref } from 'vue'

const props = defineProps<{
  type: KnowledgeType
}>()

const loading = ref(false)
const finished = ref(false)
const list = ref<KnowledgeList[]>([])
// 查询参数
const params = ref<KnowledgeParams>({
  type: props.type,
  current: 1,
  pageSize: 5
})
const onLoad = async () => {
  // 加载数据
  const res = await getKnowledgePage(params.value)
  list.value.push(...res.data.rows)
  // 判断是否加载完毕
  if (res.data.pageTotal <= params.value.current) {
    finished.value = true
  } else {
    params.value.current++
  }
  loading.value = false
}
</script>

<template>
  <div class="knowledge-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <knowledge-card v-for="item in list" :key="item" :item="item"></knowledge-card
    ></van-list>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px;
}
</style>
