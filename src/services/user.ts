import { Patient } from './../types/user.d'
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

// 添加患者信息
export const addPatient = (patient: Patient) => request('/patient/add', 'post', patient)

// 编辑患者信息
export const editPatient = (patient: Patient) => request('/patient/update', 'put', patient)

// 删除患者信息
export const deletePatient = (id: string) => request(`/patient/del/${id}`, 'delete')

// 获取所有未读消息的数量
export const getUnreadMessageCount = () => request<number>('/patient/message/unRead/all')

// qq登陆
export const loginByQQ = (openId: string) =>
  request<User>('/login/thirdparty', 'POST', { openId, source: 'qq' })

// 手机号绑定
export const bindMobile = (data: { mobile: string; code: string; openId: string }) =>
  request<User>('/login/binding', 'POST', data)
