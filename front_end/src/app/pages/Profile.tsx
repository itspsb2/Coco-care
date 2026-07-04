import { MapPin, Phone, Mail, Home, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { farmApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

const emptyFarmForm = {
  name: '',
  location: '',
  latitude: '7.4818',
  longitude: '80.365',
  acreage: '5',
  treeCount: '200',
}

export function Profile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showAddFarm, setShowAddFarm] = useState(false)
  const [newFarm, setNewFarm] = useState(emptyFarmForm)

  const resetFarmForm = () => setNewFarm(emptyFarmForm)

  const handleDialogChange = (open: boolean) => {
    setShowAddFarm(open)
    if (!open) resetFarmForm()
  }

  const { data: profile, isLoading } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const createFarmMutation = useMutation({
    mutationFn: farmApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer', 'profile'] })
      setShowAddFarm(false)
      resetFarmForm()
    },
  })

  const initials = (user?.name ?? 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createFarmMutation.mutate({
      name: newFarm.name,
      location: newFarm.location,
      latitude: parseFloat(newFarm.latitude),
      longitude: parseFloat(newFarm.longitude),
      acreage: parseFloat(newFarm.acreage),
      treeCount: parseInt(newFarm.treeCount, 10),
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  const displayUser = profile?.user ?? user

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Profile</h1>
        <p className="text-[#6b7c6b]">Your account and registered farms.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-full flex items-center justify-center text-white text-2xl">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl text-gray-900">{displayUser?.name}</h2>
            <p className="text-gray-600 capitalize">{displayUser?.role} · @{displayUser?.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={displayUser?.phone ?? '—'} />
          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={displayUser?.email ?? '—'} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-gray-900">My Farms</h3>
          <button
            type="button"
            onClick={() => setShowAddFarm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#2d5f2e] text-white rounded-lg text-sm hover:bg-[#1a2e1a]"
          >
            <Plus className="w-4 h-4" />
            Add Farm
          </button>
        </div>

        <Dialog open={showAddFarm} onOpenChange={handleDialogChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Farm</DialogTitle>
              <DialogDescription>
                Register a coconut estate for disease reporting and diagnosis.
              </DialogDescription>
            </DialogHeader>

            <form id="add-farm-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
              <label className="space-y-1">
                <span className="text-sm text-gray-600">Farm name</span>
                <input
                  placeholder="e.g. Akeel Coconut Estate"
                  value={newFarm.name}
                  onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-gray-600">Location / District</span>
                <input
                  placeholder="e.g. Kurunegala"
                  value={newFarm.location}
                  onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-sm text-gray-600">Acreage</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newFarm.acreage}
                    onChange={(e) => setNewFarm({ ...newFarm, acreage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                    required
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-gray-600">Tree count</span>
                  <input
                    type="number"
                    min="0"
                    value={newFarm.treeCount}
                    onChange={(e) => setNewFarm({ ...newFarm, treeCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                    required
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-sm text-gray-600">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    value={newFarm.latitude}
                    onChange={(e) => setNewFarm({ ...newFarm, latitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                    required
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-gray-600">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    value={newFarm.longitude}
                    onChange={(e) => setNewFarm({ ...newFarm, longitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                    required
                  />
                </label>
              </div>
            </form>

            <DialogFooter>
              <button
                type="button"
                onClick={() => handleDialogChange(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-farm-form"
                disabled={createFarmMutation.isPending}
                className="px-4 py-2 text-sm bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] disabled:opacity-60"
              >
                {createFarmMutation.isPending ? 'Saving...' : 'Save Farm'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          {(profile?.farms ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">No farms registered yet.</p>
          ) : (
            profile?.farms.map((farm) => (
              <div key={farm.id} className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                <Home className="w-5 h-5 text-[#2d5f2e] mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">{farm.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {farm.location} · {farm.acreage} acres · {farm.treeCount} trees
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <span className="text-[#2d5f2e]">{icon}</span>
      <div>
        <div className="text-gray-500 text-xs">{label}</div>
        <div className="text-gray-900">{value}</div>
      </div>
    </div>
  )
}
