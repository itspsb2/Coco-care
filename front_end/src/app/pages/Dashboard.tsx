import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Cloud, Droplets, Activity, Zap } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";

const healthData = [
  { month: "Jan", health: 75 },
  { month: "Feb", health: 78 },
  { month: "Mar", health: 82 },
  { month: "Apr", health: 85 },
  { month: "May", health: 83 },
];

const yieldData = [
  { month: "Jan", yield: 120 },
  { month: "Feb", yield: 135 },
  { month: "Mar", yield: 128 },
  { month: "Apr", yield: 145 },
  { month: "May", yield: 152 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Dashboard</h1>
        <p className="text-[#6b7c6b]">Welcome back, Nimal! Here's your plantation overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Plantation Health"
          value="83%"
          change="+2.5%"
          trend="up"
          icon={<Activity className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Active Alerts"
          value="3"
          change="-1"
          trend="down"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Monthly Yield"
          value="152 kg"
          change="+4.8%"
          trend="up"
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Risk Level"
          value="Low"
          change="Stable"
          trend="stable"
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-[#1a2e1a]">Plantation Health Trend</h2>
            <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={healthData}>
              <XAxis dataKey="month" stroke="#6b7c6b" />
              <YAxis stroke="#6b7c6b" />
              <Tooltip />
              <Line type="monotone" dataKey="health" stroke="#2d5f2e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-2xl shadow-sm p-6 text-white">
          <h2 className="text-xl mb-4">Quick AI Diagnosis</h2>
          <p className="text-green-100 mb-6">Upload a coconut leaf image for instant disease detection.</p>
          <button className="w-full py-3 bg-white text-[#2d5f2e] rounded-lg hover:bg-green-50 transition-colors">
            Upload Image
          </button>
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>AI Accuracy: 95%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span>25,000+ Diagnoses</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">Current Disease Alerts</h2>
          <div className="space-y-3">
            <AlertItem
              disease="Weligama Leaf Wilt"
              location="5 km away"
              severity="medium"
            />
            <AlertItem
              disease="Stem Bleeding"
              location="12 km away"
              severity="low"
            />
            <AlertItem
              disease="Caterpillar Damage"
              location="2 km away"
              severity="high"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">Weather & Conditions</h2>
          <div className="grid grid-cols-2 gap-4">
            <WeatherCard
              icon={<Cloud className="w-8 h-8 text-blue-500" />}
              label="Temperature"
              value="28°C"
            />
            <WeatherCard
              icon={<Droplets className="w-8 h-8 text-blue-500" />}
              label="Humidity"
              value="75%"
            />
            <WeatherCard
              icon={<Cloud className="w-8 h-8 text-gray-500" />}
              label="Condition"
              value="Partly Cloudy"
            />
            <WeatherCard
              icon={<Droplets className="w-8 h-8 text-blue-400" />}
              label="Rainfall"
              value="12mm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-6">Monthly Yield Prediction</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yieldData}>
              <XAxis dataKey="month" stroke="#6b7c6b" />
              <YAxis stroke="#6b7c6b" />
              <Tooltip />
              <Bar dataKey="yield" fill="#2d5f2e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">Recent AI Diagnoses</h2>
          <div className="space-y-3">
            <DiagnosisItem disease="Healthy" confidence={95} date="2 hours ago" />
            <DiagnosisItem disease="Stem Bleeding" confidence={87} date="1 day ago" />
            <DiagnosisItem disease="Healthy" confidence={92} date="3 days ago" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-yellow-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <FlaskConical className="w-6 h-6 text-yellow-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg text-gray-900 mb-1">Fertilizer Recommendation</h3>
            <p className="text-gray-700 mb-3">
              Based on your plantation conditions, we recommend applying NPK fertilizer (15:15:15) at 2.5 kg per tree.
            </p>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              View Full Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  color: "green" | "yellow" | "blue";
}) {
  const bgColors = {
    green: "bg-green-50",
    yellow: "bg-yellow-50",
    blue: "bg-blue-50",
  };

  const textColors = {
    green: "text-green-700",
    yellow: "text-yellow-700",
    blue: "text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 ${bgColors[color]} rounded-lg ${textColors[color]}`}>{icon}</div>
        <div className="flex items-center gap-1 text-sm">
          {trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
          {trend === "down" && <TrendingDown className="w-4 h-4 text-green-600" />}
          <span className={trend === "up" || trend === "down" ? "text-green-600" : "text-gray-500"}>
            {change}
          </span>
        </div>
      </div>
      <div className="text-2xl text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

function AlertItem({ disease, location, severity }: { disease: string; location: string; severity: string }) {
  const colors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="text-gray-900">{disease}</div>
        <div className="text-sm text-gray-500">{location}</div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs border ${colors[severity as keyof typeof colors]}`}>
        {severity}
      </span>
    </div>
  );
}

function WeatherCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
      {icon}
      <div className="mt-2 text-sm text-gray-600">{label}</div>
      <div className="text-lg text-gray-900">{value}</div>
    </div>
  );
}

function DiagnosisItem({ disease, confidence, date }: { disease: string; confidence: number; date: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-900">{disease}</span>
        <span className="text-sm text-green-600">{confidence}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${confidence}%` }}></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{date}</div>
    </div>
  );
}

function FlaskConical({ className }: { className?: string }) {
  return <span className={className}>🧪</span>;
}
