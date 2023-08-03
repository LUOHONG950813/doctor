<script setup lang="ts">
/*global QC*/
import { onMounted, ref } from 'vue'
import { loginByQQ } from '@/services/user'
import { codeRules, mobileRules } from '@/utils/rules'
import { useSendMobileCode } from '@/composable'
import { bindMobile } from '@/services/user'
import { User } from '@/types/user'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
const openId = ref('')
const isNeedBind = ref(false)
onMounted(() => {
  if (QC.Login.check()) {
    QC.Login.getMe((id) => {
      openId.value = id
      // QQ，登录
      loginByQQ(id)
        .then((res) => {
          // 登录成功
          loginSuccess(res)
        })
        .catch(() => {
          // 登录失败
          isNeedBind.value = true
        })
    })
  }
})

// 收集表单的数据
const mobile = ref('')
const code = ref('')
const store = useUserStore()
const router = useRouter()
const { onSend, time, form } = useSendMobileCode(mobile, 'bindMobile')
const bind = async () => {
  const res = await bindMobile({
    mobile: mobile.value,
    code: code.value,
    openId: openId.value
  })
  loginSuccess(res)
}

// 成功的回调
const loginSuccess = (res: { data: User }) => {
  // 存储用户的信息
  store.setUser(res.data)
  router.replace(store.returnUrl || '/user')
  showSuccessToast('登录成功')
  store.setReturnUrl('')
}
</script>

<!-- 未绑定手机号进行绑定界面 -->
<template>
  <div class="login-page" v-if="isNeedBind">
    <cp-nav-bar></cp-nav-bar>
    <div class="login-head">
      <h3>手机绑定</h3>
    </div>
    <van-form autocomplete="off" ref="form" @submit="bind">
      <van-field
        :rules="mobileRules"
        name="mobile"
        placeholder="请输入手机号"
        v-model="mobile"
      ></van-field>
      <van-field :rules="codeRules" name="code" placeholder="请输入验证码" v-model="code">
        <template #button>
          <span class="btn-send" :class="{ active: time > 0 }" @click="onSend">{{
            time > 0 ? `${time}s后再次发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-button style="margin-top: 50px" block round type="primary" native-type="submit">
          立即绑定
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/login.scss';
</style>
