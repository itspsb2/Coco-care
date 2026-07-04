import { apiClient } from './client'
import type {
  User,
  LoginPayload,
  RegisterPayload,
  Farm,
  DiseaseReport,
  HeatmapPoint,
  ChatMessage,
  DiagnosisPayload,
  DiagnosisResult,
  WeatherForecast,
  KnowledgeArticle,
} from '@/types'

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<{ token: string; user: User }>(
      '/auth/login',
      payload,
    )
    return data
  },
  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post<{ token: string; user: User }>(
      '/auth/register',
      payload,
    )
    return data
  },
  me: async () => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
}

export const farmApi = {
  profile: async () => {
    const { data } = await apiClient.get<{ user: User; farms: Farm[] }>(
      '/farmers/profile',
    )
    return data
  },
  create: async (farm: Omit<Farm, 'id'>) => {
    const { data } = await apiClient.post<Farm>('/farms', farm)
    return data
  },
}

export const diagnosisApi = {
  submit: async (payload: DiagnosisPayload) => {
    const { data } = await apiClient.post<DiagnosisResult>(
      '/api/diagnosis',
      payload,
    )
    return data
  },
}

export const reportsApi = {
  my: async () => {
    const { data } = await apiClient.get<DiseaseReport[]>('/reports/my')
    return data
  },
  pending: async () => {
    const { data } = await apiClient.get<DiseaseReport[]>(
      '/officer/reports/pending',
    )
    return data
  },
  review: async (
    id: string,
    payload: { action: 'verify' | 'reject'; comment?: string },
  ) => {
    const { data } = await apiClient.post<DiseaseReport>(
      `/officer/reports/${id}/review`,
      payload,
    )
    return data
  },
}

export const diseaseMapApi = {
  heatmap: async () => {
    const { data } = await apiClient.get<HeatmapPoint[]>(
      '/api/disease-map/heatmap',
    )
    return data
  },
}

export const chatApi = {
  send: async (message: string) => {
    const { data } = await apiClient.post<ChatMessage>('/api/chat', {
      message,
    })
    return data
  },
  history: async () => {
    const { data } = await apiClient.get<ChatMessage[]>('/api/chat/history')
    return data
  },
}

export const adminApi = {
  users: async () => {
    const { data } = await apiClient.get<User[]>('/admin/users')
    return data
  },
  stats: async () => {
    const { data } = await apiClient.get<{
      totalUsers: number
      pendingReports: number
      verifiedOutbreaks: number
    }>('/admin/stats')
    return data
  },
}

export const weatherApi = {
  forecast: async (params: { lat?: number; lon?: number; location?: string }) => {
    const { data } = await apiClient.get<WeatherForecast>('/api/weather/forecast', {
      params,
    })
    return data
  },
}

export const knowledgeApi = {
  getByTitle: async (title: string) => {
    const { data } = await apiClient.get<KnowledgeArticle>('/api/knowledge/documents', {
      params: { title },
    })
    return data
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<KnowledgeArticle>(`/api/knowledge/documents/${id}`)
    return data
  },
}
