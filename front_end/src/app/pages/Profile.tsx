import { User, MapPin, Phone, Mail, Home, Calendar, Edit2, Save } from "lucide-react";
import { useState } from "react";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Nimal Perera",
    email: "nimal.perera@example.com",
    phone: "077 123 4567",
    nic: "199012345678",
    district: "Gampaha",
    plantationSize: "Medium (3 acres)",
    joinedDate: "January 2025",
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Profile</h1>
        <p className="text-[#6b7c6b]">Manage your account information and plantation details.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-full flex items-center justify-center text-white text-2xl">
              NP
            </div>
            <div>
              <h2 className="text-2xl text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">Coconut Farmer</p>
            </div>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="px-4 py-2 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] transition-colors flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField
            icon={<User className="w-5 h-5" />}
            label="Full Name"
            value={profile.name}
            isEditing={isEditing}
            onChange={(value) => setProfile({ ...profile, name: value })}
          />
          <ProfileField
            icon={<Mail className="w-5 h-5" />}
            label="Email"
            value={profile.email}
            isEditing={isEditing}
            onChange={(value) => setProfile({ ...profile, email: value })}
          />
          <ProfileField
            icon={<Phone className="w-5 h-5" />}
            label="Mobile Number"
            value={profile.phone}
            isEditing={isEditing}
            onChange={(value) => setProfile({ ...profile, phone: value })}
          />
          <ProfileField
            icon={<User className="w-5 h-5" />}
            label="NIC"
            value={profile.nic}
            isEditing={false}
          />
          <ProfileField
            icon={<MapPin className="w-5 h-5" />}
            label="District"
            value={profile.district}
            isEditing={isEditing}
            onChange={(value) => setProfile({ ...profile, district: value })}
          />
          <ProfileField
            icon={<Home className="w-5 h-5" />}
            label="Plantation Size"
            value={profile.plantationSize}
            isEditing={isEditing}
            onChange={(value) => setProfile({ ...profile, plantationSize: value })}
          />
          <ProfileField
            icon={<Calendar className="w-5 h-5" />}
            label="Member Since"
            value={profile.joinedDate}
            isEditing={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <div className="text-3xl text-[#2d5f2e] mb-2">156</div>
          <div className="text-gray-600">AI Scans Completed</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <div className="text-3xl text-[#2d5f2e] mb-2">83%</div>
          <div className="text-gray-600">Plantation Health</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <div className="text-3xl text-[#2d5f2e] mb-2">12</div>
          <div className="text-gray-600">Alerts Received</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl border border-green-200 p-6">
        <h3 className="text-lg text-gray-900 mb-4">Account Activity</h3>
        <div className="space-y-3">
          <ActivityItem time="2 hours ago" action="Completed AI disease scan" />
          <ActivityItem time="1 day ago" action="Generated fertilizer plan" />
          <ActivityItem time="3 days ago" action="Viewed disease heatmap" />
          <ActivityItem time="5 days ago" action="Used AI chatbot for farming advice" />
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
  isEditing,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        {icon}
        {label}
      </label>
      {isEditing && onChange ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]"
        />
      ) : (
        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">{value}</div>
      )}
    </div>
  );
}

function ActivityItem({ time, action }: { time: string; action: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
      <span className="text-gray-900">{action}</span>
      <span className="text-sm text-gray-500">{time}</span>
    </div>
  );
}
