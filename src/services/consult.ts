import {
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  DoctorPage,
  FollowType,
  TopDep
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
  request('/like', 'post', { id, type })

// 获取所有科室
export const getAllDep = () => request<TopDep[]>('/dep/all')
