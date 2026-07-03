import { FlaskConical, Calculator, TrendingUp, DollarSign, Calendar, Info } from "lucide-react";
import { useState } from "react";

export function FertilizerPlanner() {
  const [formData, setFormData] = useState({
    treeAge: "",
    soilType: "",
    plantationSize: "",
    symptoms: [] as string[],
    previousFertilizer: "",
    rainfall: "",
  });

  const [recommendation, setRecommendation] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSymptom = (symptom: string) => {
    setFormData({
      ...formData,
      symptoms: formData.symptoms.includes(symptom)
        ? formData.symptoms.filter((s) => s !== symptom)
        : [...formData.symptoms, symptom],
    });
  };

  const handleCalculate = () => {
    setRecommendation({
      fertilizerType: "NPK 15:15:15",
      dosage: "2.5 kg per tree",
      frequency: "3 times per year",
      schedule: [
        { month: "June", application: "First application at onset of monsoon" },
        { month: "September", application: "Second application mid-monsoon" },
        { month: "December", application: "Third application at end of year" },
      ],
      estimatedCost: "LKR 18,750",
      yieldImprovement: "+15-20%",
      additionalNotes: [
        "Apply in a circular trench 1.5-2m from trunk",
        "Mix with organic manure for better results",
        "Water thoroughly after application",
        "Avoid application during dry periods",
      ],
    });
  };

  const symptoms = [
    "Yellowing leaves",
    "Stunted growth",
    "Poor nut production",
    "Leaf drop",
    "Nutrient deficiency signs",
    "Slow recovery from disease",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">Fertilizer Planner</h1>
        <p className="text-[#6b7c6b]">Get personalized fertilizer recommendations based on your plantation conditions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h2 className="text-xl text-[#1a2e1a]">Plantation Details</h2>
                <p className="text-sm text-gray-600">Provide information about your coconut plantation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tree Age (years)</label>
                <input
                  type="number"
                  name="treeAge"
                  value={formData.treeAge}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]"
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Soil Type</label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] appearance-none"
                >
                  <option value="">Select soil type</option>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="clay">Clay</option>
                  <option value="laterite">Laterite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Plantation Size (acres)</label>
                <input
                  type="number"
                  name="plantationSize"
                  value={formData.plantationSize}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]"
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Previous Fertilizer Usage</label>
                <select
                  name="previousFertilizer"
                  value={formData.previousFertilizer}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] appearance-none"
                >
                  <option value="">Select usage</option>
                  <option value="none">None</option>
                  <option value="low">Low (irregular)</option>
                  <option value="moderate">Moderate (2-3 times/year)</option>
                  <option value="high">High (4+ times/year)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">Rainfall Condition</label>
                <select
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] appearance-none"
                >
                  <option value="">Select rainfall</option>
                  <option value="low">Low (&lt; 1000mm/year)</option>
                  <option value="moderate">Moderate (1000-2000mm/year)</option>
                  <option value="high">High (&gt; 2000mm/year)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <h3 className="text-lg text-[#1a2e1a] mb-4">Current Symptoms (Optional)</h3>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    formData.symptoms.includes(symptom)
                      ? "bg-[#2d5f2e] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-4 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] transition-colors flex items-center justify-center gap-2"
          >
            <FlaskConical className="w-5 h-5" />
            Generate Fertilizer Plan
          </button>
        </div>

        <div>
          {recommendation ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-2xl shadow-sm p-6 text-white">
                <h3 className="text-xl mb-4">Recommended Plan</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="text-sm text-green-100 mb-1">Fertilizer Type</div>
                    <div className="text-lg">{recommendation.fertilizerType}</div>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="text-sm text-green-100 mb-1">Dosage</div>
                    <div className="text-lg">{recommendation.dosage}</div>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="text-sm text-green-100 mb-1">Frequency</div>
                    <div className="text-lg">{recommendation.frequency}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg text-gray-900">Application Schedule</h3>
                </div>
                <div className="space-y-3">
                  {recommendation.schedule.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-gray-900 mb-1">{item.month}</div>
                      <div className="text-sm text-gray-700">{item.application}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-4">
                  <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
                  <div className="text-xl text-gray-900">{recommendation.estimatedCost}</div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-4">
                  <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Yield Improvement</div>
                  <div className="text-xl text-gray-900">{recommendation.yieldImprovement}</div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <h4 className="text-sm text-gray-900">Application Notes</h4>
                </div>
                <ul className="space-y-2">
                  {recommendation.additionalNotes.map((note: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">Ready to Calculate</h3>
                <p className="text-gray-600 text-sm">
                  Fill in your plantation details and click "Generate Fertilizer Plan" to get personalized recommendations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
