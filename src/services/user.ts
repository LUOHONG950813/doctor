import { CodeType, User } from '@/types/user'
import { request } from '@/utils/request'
// 密码登陆
export const loginByPassword = (mobile: string, password: string) =>
  request<User>('/login/password', 'post', {
    mobile,
    password
  })

// 获取验证码
export const sendMobileCode = (mobile: string, type: CodeType) =>
  request('code', 'get', {
    mobile,
    type
  })

// 验证码登陆
export const loginByMobile = (mobile: string, code: string) =>
  request<User>('/login', 'post', {
    mobile,
    code
  })
