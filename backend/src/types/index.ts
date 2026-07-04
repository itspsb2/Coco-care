export type UserRole = 'farmer' | 'officer' | 'admin'

export interface User {
  id: string
  username: string
  name: string
  email?: string
  phone?: string
  role: UserRole
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
  imageResult?: string
  symptomResult?: string
  finalResult?: string
  confidence: number
  status: 'verified' | 'pending' | 'rejected'
  createdAt: string
  reviewComment?: string
}

export interface HeatmapPoint {
  lat: number
  lng: number
  weight: number
  diseaseType: string
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
