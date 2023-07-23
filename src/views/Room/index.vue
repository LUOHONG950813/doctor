<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
import io, { Socket } from 'socket.io-client'
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import type { TimeMessages, Message } from '@/types/room'
import { MsgType, OrderType } from '@/enums'
import { ConsultOrderItem, Image } from '@/types/consult'
import { getConsultOrderDetail } from '@/services/consult'
// @ts-ignore
import dayjs from 'dayjs'
import { showToast } from 'vant'
const store = useUserStore()
const route = useRoute()
const list = ref<Message[]>([])
const consult = ref<ConsultOrderItem>()
// 获取问诊单信息
const loadConsult = async () => {
  const { data } = await getConsultOrderDetail(route.query.orderId as string)
  consult.value = data
}
const initiaMsg = ref(true)
let socket: Socket
onMounted(() => {
  loadConsult()
  socket = io(baseURL, {
    auth: {
      token: `Bearer ${store.user?.token}`
    },
    query: {
      orderId: route.query.orderId
    }
  })
  socket.on('connect', () => {
    console.log('连接成功')
  })
  socket.on('disconnect', () => {
    console.log('连接关闭')
  })
  socket.on('error', () => {
    console.log('连接错误')
  })
  // 读取聊天记录（第一次加载）
  socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
    const arr: Message[] = []
    data.forEach((item, i) => {
      // 记录最早的聊天记录的时间
      if (i === 0) {
        time.value = item.createTime
      }
      arr.push({
        msgType: MsgType.Notify,
        msg: {
          content: item.createTime
        },
        createTime: item.createTime,
        id: item.createTime
      })
      arr.push(...item.items)
    })
    list.value.unshift(...arr)
    loading.value = false
    if (!arr.length) return showToast('没有更多聊天记录了')
    // 如果是第一次加载
    if (initiaMsg.value) {
      // 进入页面就将所有消息变成已读
      socket.emit('updateMsgStatus', arr[arr.length - 1].id)
      // 滚动到最新的消息
      nextTick(() => {
        window.scrollTo(0, document.body.scrollHeight)
        initiaMsg.value = false
      })
    }
  })
  // 监听订单状态的变化
  socket.on('statusChange', () => {
    loadConsult()
  })
  // 接收消息
  socket.on('receiveChatMsg', async (event) => {
    // 读取一条已读一条
    socket.emit('updateMsgStatus', event.id)
    list.value.push(event)
    await nextTick()
    window.scrollTo(0, document.body.scrollHeight)
  })
})
onUnmounted(() => {
  socket.close()
})

// 发送文字信息
const onSendText = (text: string) => {
  // 发送信息需要  发送人  收消息人  消息类型  消息内容
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgText,
    msg: { content: text }
  })
}

// 发送图片信息
const onSendImage = (img: Image) => {
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgImage,
    msg: { picture: img }
  })
}

// 下拉刷新加载更多的聊天记录
const loading = ref(false)
const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const onRefresh = () => {
  socket.emit('getChatMsgList', 20, time.value, consult.value?.id)
}
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <room-status :status="consult?.status" :countdown="consult?.countdown" />
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message v-for="item in list" :key="item.id" :item="item"></room-message>
    </van-pull-refresh>
    <room-action
      :disabled="consult?.status !== OrderType.ConsultChat"
      @send-text="onSendText"
      @send-image="onSendImage"
    ></room-action>
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);
  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
