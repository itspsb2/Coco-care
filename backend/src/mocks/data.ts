import type {
  User,
  Farm,
  DiseaseReport,
  HeatmapPoint,
  ChatMessage,
} from '../types/index.js'

export const mockUser: User = {
  id: 'user-1',
  username: 'akeel',
  name: 'Akeel Bandara',
  phone: '0771234567',
  role: 'farmer',
}

export const mockOfficer: User = {
  id: 'officer-1',
  username: 'officer1',
  name: 'Officer Silva',
  phone: '0777654321',
  role: 'officer',
}

export const mockAdmin: User = {
  id: 'admin-1',
  username: 'admin',
  name: 'System Admin',
  email: 'admin@cococare.lk',
  role: 'admin',
}

export const mockFarms: Farm[] = [
  {
    id: 'farm-1',
    name: 'Akeel Coconut Estate',
    location: 'Kurunegala',
    latitude: 7.4818,
    longitude: 80.365,
    acreage: 5,
    treeCount: 200,
  },
]

export const mockReports: DiseaseReport[] = [
  {
    id: 'report-1',
    farmId: 'farm-1',
    farmName: 'Akeel Coconut Estate',
    region: 'Kurunegala',
    imageResult: 'Weligama Coconut Leaf Wilt Disease',
    symptomResult: 'Weligama Coconut Leaf Wilt Disease',
    finalResult: 'Weligama Coconut Leaf Wilt Disease',
    confidence: 0.87,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
]

export const mockHeatmap: HeatmapPoint[] = [
  { lat: 7.48, lng: 80.37, weight: 0.8, diseaseType: 'Weligama Wilt' },
  { lat: 7.29, lng: 80.62, weight: 0.6, diseaseType: 'Bud Rot' },
  { lat: 7.95, lng: 81.0, weight: 0.9, diseaseType: 'Stem Bleeding' },
  { lat: 7.1, lng: 79.9, weight: 0.5, diseaseType: 'Caterpillar' },
  { lat: 7.6, lng: 80.1, weight: 0.7, diseaseType: 'Weligama Wilt' },
]

export let chatHistory: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      'Hello! I am Coco AI. Ask me anything about coconut farming, diseases, or fertilizer.',
    createdAt: new Date().toISOString(),
  },
]

export function getUserFromToken(authHeader: string | undefined): User {
  if (authHeader?.includes('officer')) return mockOfficer
  if (authHeader?.includes('admin')) return mockAdmin
  return mockUser
}

export function getUserByUsername(username: string): User {
  if (username === 'officer1') return mockOfficer
  if (username === 'admin') return mockAdmin
  return mockUser
}
