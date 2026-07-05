export type UserRole = 'farmer' | 'officer' | 'admin'

export interface User {
  id: string
  username: string
  name: string
  email?: string
  phone?: string
  role: UserRole
  isActive?: boolean
  officerId?: string
  assignedRegion?: string
}

export interface Farm {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  acreage: number
  treeCount: number
}

export interface DiseaseReport {
  id: string
  farmId: string
  farmName: string
  region: string
  imageUrl?: string
  symptoms?: Record<string, string | boolean>
  imageResult?: string
  symptomResult?: string
  finalResult?: string
  confidence: number
  advice?: string
  status: 'verified' | 'pending' | 'rejected'
  createdAt: string
  reviewComment?: string
}

export interface HeatmapPoint {
  lat: number
  lng: number
  weight: number
  diseaseType: string
  createdAt?: string
}

export interface DiseaseAlert {
  id: string
  reportId: string
  farmId: string
  diseaseType: string
  distanceKm: number
  message: string
  read: boolean
  createdAt: string
}

export interface NearbyOutbreak {
  lat: number
  lng: number
  diseaseType: string
  weight: number
  distanceKm: number
  reportId: string
  createdAt: string
}

export interface NearbyResponse {
  farms: Array<{
    farmId: string
    farmName: string
    outbreaks: NearbyOutbreak[]
  }>
}

export interface DiseaseMapStats {
  byDisease: Array<{ diseaseType: string; count: number }>
  byWeek: Array<{ week: string; count: number }>
  highRiskCount: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  conversationId?: string
}

export interface ChatConversation {
  id: string
  title: string
  updatedAt: string
  createdAt: string
}

export interface KnowledgeArticle {
  id: string
  title: string
  source: string
  content: string
  sourceUrl?: string | null
}

export interface RegisterPayload {
  role: UserRole
  name?: string
  username: string
  email?: string
  phone: string
  password: string
  officerId?: string
  assignedRegion?: string
  farms?: Omit<Farm, 'id'>[]
}

export interface LoginPayload {
  username: string
  password: string
}

export interface DiagnosisPayload {
  farmId: string
  imageUrl?: string
  symptoms: Record<string, string | boolean>
  notes?: string
}

export interface DiagnosisResult {
  id: string
  imageResult: string
  symptomResult: string
  finalResult: string
  confidence: number
  status: 'verified' | 'pending'
  advice: string
}
