<script setup lang="ts">
import { ref } from 'vue'
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { showSuccessToast, showToast } from 'vant'
import { loginByPassword, loginByMobile } from '@/services/user'
import { useUserStore } from '@/stores'
import { useRouter, useRoute } from 'vue-router'
import { useSendMobileCode } from '@/composable'
const mobile = ref('')
const password = ref('')
const code = ref('')
const agree = ref(false)
const store = useUserStore()
const router = useRouter()
const route = useRoute()
// 提交登陆
const onSubmit = async () => {
  if (!agree.value) {
    showToast('请先同意用户协议')
    return
  }
  // 密码登陆/验证码登陆
  const res = isPass.value
    ? await loginByPassword(mobile.value, password.value)
    : await loginByMobile(mobile.value, code.value)
  store.setUser(res.data)
  showSuccessToast('登陆成功')
  router.replace((route.query.returnUrl as string) || '/user')
}
// 密码登陆和验证码登陆的切换
// 界面切换
const isPass = ref(true)

// 发送短信验证码
const { onSend, time, form } = useSendMobileCode(mobile)

// 控制密码的可见与不可见
const isShowPassword = ref(false)
</script>

<template>
  <div class="login-page">
    <cp-nav-bar right-text="注册" @click-right="$router.push('/register')"></cp-nav-bar>
    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:;">
        <span @click="isPass = !isPass">{{ isPass ? '短信验证码登录' : '密码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- 表单 -->
    <van-form autocomplete="off" @submit="onSubmit" ref="form">
      <van-field
        name="mobile"
        v-model="mobile"
        :rules="mobileRules"
        placeholder="请输入手机号"
        type="tel"
      ></van-field>
      <van-field
        v-if="isPass"
        v-model="password"
        :rules="passwordRules"
        placeholder="请输入密码"
        :type="isShowPassword ? 'text' : 'password'"
        ><template #button>
          <span>
            <cp-icon
              :name="`login-eye-${isShowPassword ? 'on' : 'off'}`"
              style="margin-right: 10px"
              @click="isShowPassword = !isShowPassword"
            ></cp-icon>
          </span>
        </template>
      </van-field>
      <van-field v-else v-model="code" placeholder="短信验证码" :rules="codeRules">
        <template #button>
          <span class="btn-send" :class="{ active: time > 0 }" @click="onSend">{{
            time > 0 ? `${time}s后再次发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button block round native-type="submit" type="primary">登 录</van-button>
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
    <!-- 底部 -->
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <a
        class="icon"
        @click="store.setReturnUrl(route.query.returnUrl as string)"
        href="https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=http%3A%2F%2Fconsult-patients.itheima.net%2Flogin%2Fcallback"
      >
        <img src="@/assets/qq.svg" alt="" />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/login.scss';
</style>
