import axios from 'axios'
import type { WarEvent, WarEventDetail, FilterParams, MapBounds, ApiResponse, PagedData, StatsData, CountryResult } from '@/types'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

// 获取统计数据
export const fetchStats = async (): Promise<StatsData> => {
  const response = await api.get<ApiResponse<StatsData>>('/war-events/stats')
  return response.data.data
}

// 获取事件列表
export const fetchEvents = async (params: FilterParams): Promise<PagedData<WarEvent>> => {
  const response = await api.get<ApiResponse<PagedData<WarEvent>>>('/war-events', { params })
  return response.data.data
}

// 获取事件详情（含文章）
export const fetchEventById = async (id: number): Promise<WarEventDetail> => {
  const response = await api.get<ApiResponse<WarEventDetail>>(`/war-events/${id}`)
  return response.data.data
}

// 获取地图标记数据（视野范围）
export const fetchMapMarkers = async (bounds: MapBounds, params?: FilterParams): Promise<WarEvent[]> => {
  const response = await api.get<ApiResponse<WarEvent[]>>('/war-events/map', {
    params: { ...bounds, ...params }
  })
  return response.data.data
}

// 搜索国家
export const searchCountries = async (keyword: string): Promise<CountryResult[]> => {
  const response = await api.get<ApiResponse<CountryResult[]>>('/countries/search', {
    params: { keyword }
  })
  return response.data.data
}