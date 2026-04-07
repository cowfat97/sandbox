// 事件类型枚举
export type EventType = 'military_conflict' | 'terrorist_attack' | 'political_unrest' | 'border_clash' | 'other'

// 严重程度 1-5
export type Severity = 1 | 2 | 3 | 4 | 5

// 事件状态
export type EventStatus = 'pending' | 'processed' | 'invalid'

// 事件数据结构
export interface WarEvent {
  id: number
  title: string
  country: string
  locationName: string
  latitude: number
  longitude: number
  eventType: EventType
  severity: Severity
  source: string
  sourceUrl: string
  eventDate: string
  status: EventStatus
  createdAt: string
  updatedAt: string
  // 视角列表
  perspectives?: Perspective[]
  // 事件摘要（后端从对象存储获取）
  summary?: string
}

// 视角
export interface Perspective {
  name: string      // 视角名称，如"俄罗斯"、"乌克兰"
  latitude: number
  longitude: number
  zoom?: number     // 缩放级别，默认5
  summary?: string  // 该视角方的摘要文章
}

// 分页参数
export interface PageParams {
  page?: number
  pageSize?: number
}

// 地图视野参数
export interface MapBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

// API 响应结构
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
}

// 分页数据
export interface PagedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 筛选参数
export interface FilterParams {
  page?: number
  pageSize?: number
  eventType?: EventType
  severity?: Severity
  country?: string
  startDate?: string
  endDate?: string
}

// 统计数据
export interface StatsData {
  totalCount: number
  weeklyCount: number
  hotRegions: { name: string; count: number }[]
  byType: { type: EventType; count: number }[]
  bySeverity: { severity: Severity; count: number }[]
}

// 事件类型中文映射
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  military_conflict: '军事冲突',
  terrorist_attack: '恐怖袭击',
  political_unrest: '政治动荡',
  border_clash: '边境冲突',
  other: '其他'
}

// 严重程度中文映射
export const SEVERITY_LABELS: Record<Severity, string> = {
  1: '轻微',
  2: '一般',
  3: '中等',
  4: '严重',
  5: '极严重'
}

// 事件类型颜色映射
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  military_conflict: '#ef4444',
  terrorist_attack: '#f97316',
  political_unrest: '#eab308',
  border_clash: '#a855f7',
  other: '#6b7280'
}

// 严重程度对应标记大小
export const SEVERITY_RADIUS: Record<Severity, number> = {
  1: 8,
  2: 11,
  3: 14,
  4: 17,
  5: 20
}

// 事件详情（含完整摘要）
export interface WarEventDetail extends WarEvent {
  fullSummary: string  // 完整摘要
  relatedEvents?: number[]  // 相关事件 ID
}

// 国家搜索结果
export interface CountryResult {
  name: string
  code: string
  eventCount: number
}