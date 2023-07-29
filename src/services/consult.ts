import {
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  DoctorPage,
  FollowType,
  TopDep,
  Image,
  ConsultOrderPreParams,
  ConsultOrderPreData,
  PartialConsult,
  ConsultOrderItem,
  ConsultOrderListParams,
  ConsultOrderPage
} from './../types/consult.d'

import { request } from '@/utils/request'

// 首页列表
export const getKnowledgePage = (params: KnowledgeParams) =>
  request<KnowledgePage>('patient/home/knowledge', 'get', params)

// 关注医生的列表
export const getDoctorPage = (params: PageParams) =>
  request<DoctorPage>('home/page/doc', 'get', params)

// 关注/取消关注医生
export const followOrUnfollow = (id: string, type: FollowType = 'doc') =>
  request('like', 'post', { id, type })

// 获取所有科室
export const getAllDep = () => request<TopDep[]>('/dep/all')

// 上传图片
export const uploadImg = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request<Image>('upload', 'post', formData)
}

// 问诊预下单
export const getConstOrderPre = (params: ConsultOrderPreParams) =>
  request<ConsultOrderPreData>('patient/consult/order/pre', 'get', params)

// 患者详情
export const getPatientDetail = (id: string) => request(`patient/info/${id}`, 'get')

// 生成问诊订单
export const createConsultOrder = (data: PartialConsult) =>
  request<{ id: string }>('patient/consult/order', 'post', data)

// 获取支付地址  0 是微信  1 支付宝
export const getConsultOrderPayUrl = (params: {
  paymentMethod: 0 | 1
  orderId: string
  payCallback: string
}) => request<{ payUrl: string }>('/patient/consult/pay', 'POST', params)

// 获取订单详情
export const getConsultOrderDetail = (orderId: string) =>
  request<ConsultOrderItem>('/patient/consult/order/detail', 'GET', { orderId })

// 查看处方
export const getPrescriptionPic = (id: string) =>
  request<{ url: string }>(`/patient/consult/prescription/${id}`)

// 评价问诊
export const evaluateConsultOrder = (data: {
  docId: string
  orderId: string
  score: number
  content: string
  anonymousFlag: 0 | 1
}) => request<{ id: string }>('/patient/order/evaluate', 'POST', data)

// 获取订单记录
export const getConsultOrderList = (params: ConsultOrderListParams) =>
  request<ConsultOrderPage>('/patient/consult/order/list', 'GET', params)

// 取消订单
export const cancelOrder = (id: string) => request(`/patient/order/cancel/${id}`, 'PUT')

// 删除订单
export const deleteOrder = (id: string) => request(`/patient/order/${id}`, 'DELETE')
