import { CodeType, PatientList, User, UserInfo } from '@/types/user'
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

// 获取用户信息
export const getUserInfo = () => request<UserInfo>('/patient/myUser', 'get')

// 获取患者信息列表
export const getPatientList = () => request<PatientList>('/patient/mylist', 'get')
