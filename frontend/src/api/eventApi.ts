import axios from 'axios'
import type { WarEvent, MapBounds, ApiResponse, PagedData, StatsData } from '@/types'

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
export const fetchEvents = async (params: { page?: number; pageSize?: number }): Promise<PagedData<WarEvent>> => {
  const response = await api.get<ApiResponse<PagedData<WarEvent>>>('/war-events', { params })
  return response.data.data
}

// 获取事件详情
export const fetchEventById = async (id: number): Promise<WarEvent> => {
  const response = await api.get<ApiResponse<WarEvent>>(`/war-events/${id}`)
  return response.data.data
}

// 获取地图标记数据（视野范围）
export const fetchMapMarkers = async (bounds: MapBounds): Promise<WarEvent[]> => {
  const response = await api.get<ApiResponse<WarEvent[]>>('/war-events/map', {
    params: bounds
  })
  return response.data.data
}