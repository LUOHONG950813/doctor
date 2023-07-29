<script setup lang="ts">
import { getMedicalOrderPre, getAddressList, createMedicalOrder } from '@/services/order'
import type { OrderPre, AddressItem } from '@/types/order'
import { showToast, showFailToast } from 'vant'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import OrderMedical from './components/OrderMedical.vue'
const route = useRoute()
const orderPre = ref<OrderPre>()
// 获取药品订单信息
const loadOrderPre = async () => {
  const res = await getMedicalOrderPre({
    prescriptionId: route.query.id as string
  })
  orderPre.value = res.data
}
const address = ref<AddressItem>()
// 获取收货地址
const loadAddress = async () => {
  const res = await getAddressList()
  if (res.data.length) {
    const defAddress = res.data.find((item) => item.isDefault === 1)
    // 如果有默认的收获地址
    if (defAddress) {
      address.value = defAddress
    } else {
      // 没有就取列表的第一个
      address.value = res.data[0]
    }
  }
}
onMounted(() => {
  loadOrderPre()
  loadAddress()
})
const agree = ref(false)
const loading = ref(false)
const orderId = ref('')
const show = ref(false)
// 创建药品订单
const onSubmit = async () => {
  if (!agree.value) return showToast('请勾选用户协议')
  if (!address.value) return showToast('请选择收获地址')
  if (!orderPre.value?.id) return showToast('未找到处方')
  // 如果没有创建订单id，发请求创建
  if (!orderId.value) {
    loading.value = true
    try {
      let params = {}
      if (orderPre.value.couponId) {
        params = {
          id: orderPre.value.id,
          addressId: address.value.id,
          couponId: orderPre.value.couponId
        }
      } else {
        params = {
          id: orderPre.value.id,
          addressId: address.value.id
        }
      }
      const res = await createMedicalOrder(params)
      orderId.value = res.data.id
      // 打开支付抽屉
      show.value = true
    } catch (error) {
      showFailToast('创建订单失败')
    } finally {
      loading.value = false
    }
  } else {
    // 打开支付抽屉
    show.value = true
  }
}
</script>

<template>
  <div class="order-pay-page" v-if="orderPre && address">
    <cp-nav-bar title="药品支付" />
    <div class="order-address">
      <p class="area">
        <van-icon name="location" />
        <span>{{ address.province + address.city + address.county }}</span>
      </p>
      <p class="detail">{{ address.addressDetail }}</p>
      <p>{{ address.receiver }} {{ address.mobile.replace(/^(\d{3})\d+(\d{4})/, '$1****$2') }}</p>
    </div>
    <!-- 药品清单组件 -->
    <order-medical :medicines="orderPre.medicines"></order-medical>
    <div class="order-detail">
      <van-cell-group>
        <van-cell title="药品金额" :value="`￥${orderPre.payment}`" />
        <van-cell title="运费" :value="`￥${orderPre.expressFee}`" />
        <van-cell title="优惠券" :value="`-￥${orderPre.couponDeduction}`" />
        <van-cell title="实付款" :value="`￥${orderPre.actualPayment}`" class="price" />
      </van-cell-group>
    </div>
    <div class="order-tip">
      <p class="tip">
        由于药品的特殊性，如非错发、漏发药品的情况，药品一经发出
        不得退换，请核对药品信息无误后下单。
      </p>
      <van-checkbox v-model="agree">我已同意<a href="javascript:;">支付协议</a></van-checkbox>
    </div>
    <van-submit-bar
      :price="orderPre.actualPayment * 100"
      button-text="立即支付"
      button-type="primary"
      text-align="left"
      @click="onSubmit"
      :loading="loading"
    ></van-submit-bar>
    <!-- 支付抽屉组件 -->
    <cp-pay-sheet
      v-model:show="show"
      :orderId="orderId"
      :actualPayment="orderPre.actualPayment"
      payCallback="/order/pay/result"
    />
  </div>
  <div class="order-pay-page" v-else>
    <cp-nav-bar title="药品支付" />
    <van-skeleton title avatar row="2" style="margin-top: 15px"></van-skeleton>
    <van-skeleton title row="4" style="margin-top: 50px"></van-skeleton>
    <van-skeleton title row="4" style="margin-top: 50px"></van-skeleton>
  </div>
</template>

<style lang="scss" scoped>
:deep(.van-nav-bar) {
  background-color: var(--cp-primary);
  .van-nav-bar__arrow,
  .van-nav-bar__title {
    color: #fff;
  }
}
:deep(.van-cell) {
  .van-cell__title {
    font-size: 16px;
  }
  .van-cell__value {
    font-size: 16px;
  }
  &.price {
    .van-cell__value {
      font-size: 18px;
      color: var(--cp-price);
    }
  }
}
:deep(.van-submit-bar) {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  .van-button {
    width: 200px;
  }
}
.order-pay-page {
  padding: 46px 0 65px;
}
.order-address {
  padding: 15px 15px 0 15px;
  background-color: #fff;
  font-size: 13px;
  .area {
    color: var(--cp-tag);
    margin-bottom: 5px;
    .van-icon-location {
      color: #ff7702;
      font-size: 14px;
    }
  }
  .detail {
    font-size: 17px;
    margin-bottom: 5px;
  }
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
    margin: 0 -15px;
    margin-top: 15px;
  }
}

.order-tip {
  padding: 0 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  .tip {
    font-size: 12px;
    color: var(--cp-tag);
    width: 100%;
    &::before {
      content: '*';
      color: var(--cp-price);
      font-size: 14px;
    }
    margin-bottom: 30px;
  }
  .van-checkbox {
    a {
      color: var(--cp-primary);
    }
  }
}
</style>
