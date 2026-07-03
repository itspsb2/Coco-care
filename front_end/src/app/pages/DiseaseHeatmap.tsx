import { MapPin, AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const spreadData = [
  { month: "Jan", cases: 12 },
  { month: "Feb", cases: 18 },
  { month: "Mar", cases: 25 },
  { month: "Apr", cases: 31 },
  { month: "May", cases: 28 },
];

const alerts = [
  { location: "Gampaha District", disease: "Weligama Leaf Wilt", cases: 15, risk: "high" },
  { location: "Kurunegala District", disease: "Stem Bleeding", cases: 8, risk: "medium" },
  { location: "Kalutara District", disease: "Bud Rot", cases: 12, risk: "high" },
  { location: "Puttalam District", disease: "Caterpillar Damage", cases: 5, risk: "low" },
];

export function DiseaseHeatmap() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Disease Heatmap & Risk Monitoring</h1>
        <p className="text-[#6b7c6b]">Monitor disease spread across Sri Lanka and track outbreak patterns.</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white">
          <option>All Diseases</option>
          <option>Weligama Leaf Wilt</option>
          <option>Stem Bleeding</option>
          <option>Bud Rot</option>
          <option>Caterpillar Damage</option>
        </select>
        <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-white">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
          <option>Last Year</option>
        </select>
        <button className="px-4 py-2 border-2 border-[#2d5f2e] text-[#2d5f2e] rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter Districts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">Sri Lanka Disease Distribution</h2>

          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 min-h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-[#2d5f2e] mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Interactive Map Visualization</p>
                <p className="text-sm text-gray-500">Disease hotspots across Sri Lanka</p>
              </div>
            </div>

            <div className="absolute top-8 left-8 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>High Risk</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Medium Risk</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Safe Areas</span>
              </div>
            </div>

            <div className="absolute top-1/4 left-1/2 w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center border-4 border-red-500 animate-pulse">
              <MapPin className="w-6 h-6 text-red-700" />
            </div>

            <div className="absolute top-1/2 left-1/3 w-10 h-10 bg-orange-500/30 rounded-full flex items-center justify-center border-4 border-orange-500">
              <MapPin className="w-5 h-5 text-orange-700" />
            </div>

            <div className="absolute top-2/3 left-2/3 w-10 h-10 bg-orange-500/30 rounded-full flex items-center justify-center border-4 border-orange-500">
              <MapPin className="w-5 h-5 text-orange-700" />
            </div>

            <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center border-4 border-green-500">
              <MapPin className="w-4 h-4 text-green-700" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-sm p-6 text-white">
            <h3 className="text-lg mb-2">High Risk Alerts</h3>
            <div className="text-3xl mb-1">3</div>
            <p className="text-red-100 text-sm">Districts with active outbreaks</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <h3 className="text-lg text-[#1a2e1a] mb-4">Recent Outbreaks</h3>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium text-gray-900 text-sm">{alert.location}</div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      alert.risk === "high" ? "bg-red-100 text-red-700" :
                      alert.risk === "medium" ? "bg-orange-100 text-orange-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {alert.risk}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{alert.disease}</div>
                  <div className="text-xs text-gray-500 mt-1">{alert.cases} cases reported</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-6">Disease Spread Timeline</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={spreadData}>
              <XAxis dataKey="month" stroke="#6b7c6b" />
              <YAxis stroke="#6b7c6b" />
              <Tooltip />
              <Line type="monotone" dataKey="cases" stroke="#dc2626" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
          <h2 className="text-xl text-[#1a2e1a] mb-4">Nearby Outbreak Alerts</h2>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">High Risk Warning</h4>
                  <p className="text-sm text-gray-700">
                    15 cases of Weligama Leaf Wilt reported within 5km radius in the last 14 days.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Gampaha District • 3.2 km away</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Increasing Cases</h4>
                  <p className="text-sm text-gray-700">
                    Stem Bleeding cases increased by 40% in your district this month.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Kurunegala District • Your area</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">New Detection</h4>
                  <p className="text-sm text-gray-700">
                    First case of Bud Rot detected in neighboring area. Monitor your plantation closely.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Kalutara District • 8.5 km away</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
