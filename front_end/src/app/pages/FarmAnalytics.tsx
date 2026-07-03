import { TrendingUp, DollarSign, Droplets, Leaf } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const yieldData = [
  { month: "Jul", yield: 120, predicted: 118 },
  { month: "Aug", yield: 135, predicted: 132 },
  { month: "Sep", yield: 128, predicted: 140 },
  { month: "Oct", yield: 145, predicted: 145 },
  { month: "Nov", yield: 152, predicted: 155 },
  { month: "Dec", yield: 0, predicted: 160 },
];

const incomeData = [
  { month: "Jul", income: 24000 },
  { month: "Aug", income: 27000 },
  { month: "Sep", income: 25600 },
  { month: "Oct", income: 29000 },
  { month: "Nov", income: 30400 },
];

const healthData = [
  { name: "Healthy", value: 75 },
  { name: "At Risk", value: 15 },
  { name: "Diseased", value: 10 },
];

const fertilizerData = [
  { month: "Jul", amount: 45 },
  { month: "Aug", amount: 50 },
  { month: "Sep", amount: 42 },
  { month: "Oct", amount: 48 },
  { month: "Nov", amount: 52 },
];

const diseaseData = [
  { disease: "Leaf Wilt", count: 8 },
  { disease: "Stem Bleeding", count: 5 },
  { disease: "Bud Rot", count: 3 },
  { disease: "Caterpillar", count: 6 },
];

const COLORS = ["#2d5f2e", "#fbbf24", "#dc2626"];

export function FarmAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Farm Analytics & Planning</h1>
        <p className="text-[#6b7c6b]">Track your plantation performance and make data-driven decisions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg Monthly Yield"
          value="136 kg"
          change="+8.5%"
          color="green"
        />
        <AnalyticsCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Total Income"
          value="LKR 136,000"
          change="+12.3%"
          color="blue"
        />
        <AnalyticsCard
          icon={<Droplets className="w-6 h-6" />}
          title="Water Usage"
          value="2,400 L"
          change="-5.2%"
          color="cyan"
        />
        <AnalyticsCard
          icon={<Leaf className="w-6 h-6" />}
          title="Health Score"
          value="83%"
          change="+3.1%"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-[#1a2e1a]">Monthly Yield Tracking</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#2d5f2e] rounded"></div>
                <span>Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#fbbf24] rounded"></div>
                <span>Predicted</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yieldData}>
              <XAxis dataKey="month" stroke="#6b7c6b" />
              <YAxis stroke="#6b7c6b" />
              <Tooltip />
              <Line type="monotone" dataKey="yield" stroke="#2d5f2e" strokeWidth={3} />
              <Line type="monotone" dataKey="predicted" stroke="#fbbf24" strokeWidth={3} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-6">Plantation Health</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={healthData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {healthData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded`} style={{ backgroundColor: COLORS[index] }}></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-6">Income Analytics (LKR)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeData}>
              <XAxis dataKey="month" stroke="#6b7c6b" />
              <YAxis stroke="#6b7c6b" />
              <Tooltip />
              <Bar dataKey="income" fill="#2d5f2e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total (5 months)</span>
              <span className="text-lg text-[#2d5f2e]">LKR 136,000</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-6">Fertilizer Usage (kg)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fertilizerData}>
              <XAxis dataKey="month" stroke="#6b7c6b" />
              <YAxis stroke="#6b7c6b" />
              <Tooltip />
              <Bar dataKey="amount" fill="#8b6f47" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Avg per month</span>
              <span className="text-lg text-[#8b6f47]">47.4 kg</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-6">Seasonal Disease Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={diseaseData} layout="vertical">
              <XAxis type="number" stroke="#6b7c6b" />
              <YAxis dataKey="disease" type="category" stroke="#6b7c6b" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#dc2626" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-2xl shadow-sm p-6 text-white">
          <h2 className="text-xl mb-4">AI Prediction Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-green-100 mb-1">Next Month Yield</div>
              <div className="text-2xl mb-2">160 kg</div>
              <div className="text-xs text-green-200">+5.3% from current month</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-green-100 mb-1">Estimated Income</div>
              <div className="text-2xl mb-2">LKR 32,000</div>
              <div className="text-xs text-green-200">Based on current market price</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-green-100 mb-1">Health Improvement</div>
              <div className="text-2xl mb-2">+4%</div>
              <div className="text-xs text-green-200">Expected if recommendations followed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg text-gray-900 mb-2">Performance Summary</h3>
            <p className="text-gray-700 mb-4">
              Your plantation is performing 12% better than the district average. Yield has increased consistently over the past 5 months. Continue following the AI recommendations for optimal results.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">vs District Avg</div>
                <div className="text-xl text-green-600">+12%</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">Growth Rate</div>
                <div className="text-xl text-green-600">+8.5%</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm text-gray-600">Efficiency Score</div>
                <div className="text-xl text-green-600">87/100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({
  icon,
  title,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    green: "bg-green-50",
    blue: "bg-blue-50",
    cyan: "bg-cyan-50",
  };

  const textColors: Record<string, string> = {
    green: "text-green-700",
    blue: "text-blue-700",
    cyan: "text-cyan-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
      <div className={`w-12 h-12 ${bgColors[color]} ${textColors[color]} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className={`text-sm ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
        {change} from last month
      </div>
    </div>
  );
}
