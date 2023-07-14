<script setup lang="ts">
import { useRouter } from 'vue-router'

// 1.通过props来设置标题和右侧文字
const props = defineProps<{
  title?: string
  rightText?: string
  back?: () => void
}>()
const emit = defineEmits<{
  (e: 'click-right'): void
}>()
// 2.通过emit函数实现右侧文字的点击事件
const onClickRight = () => {
  emit('click-right')
}
// 3.左侧回退
const router = useRouter()
const onClickLeft = () => {
  if (props.back) return props.back()

  if (history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <van-nav-bar
    fixed
    left-arrow
    :title="title"
    :right-text="rightText"
    @click-right="onClickRight"
    @click-left="onClickLeft"
  ></van-nav-bar>
</template>

<style lang="scss" scoped>
:deep() {
  .van-nav-bar {
    &__arrow {
      color: var(--cp-text1);
      font-size: 18px;
    }
    &__title {
      font-size: 15px;
    }
  }
}
</style>
