import { Upload, Camera, Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useState } from "react";

const diseases = [
  {
    name: "Weligama Coconut Leaf Wilt Disease",
    symptoms: ["Yellowing leaves", "Flaccid leaf appearance", "Reduced nut production", "Drooping leaflets"],
  },
  {
    name: "Stem Bleeding Disease",
    symptoms: ["Dark reddish brown liquid from trunk", "Cracked bark", "Stem wounds", "Internal rotting"],
  },
  {
    name: "Bud Rot Disease",
    symptoms: ["Rotting crown region", "Foul smell", "Young leaf decay", "Blackened bud"],
  },
  {
    name: "Coconut Caterpillar Damage",
    symptoms: ["Damaged leaf surface", "Brown dried leaves", "Holes in leaflets", "Visible caterpillars"],
  },
];

export function DiseaseDetection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setResult({
        disease: "Stem Bleeding Disease",
        confidence: 87,
        severity: "Medium",
        actions: [
          "Remove affected bark and apply Bordeaux paste",
          "Improve drainage around the tree base",
          "Apply recommended fungicides",
          "Monitor weekly for disease progression",
        ],
        prevention: [
          "Maintain proper drainage systems",
          "Avoid mechanical injuries to the trunk",
          "Regular inspection and early treatment",
          "Use disease-resistant varieties when replanting",
        ],
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-[#1a2e1a] mb-2">AI Disease Diagnosis</h1>
        <p className="text-[#6b7c6b]">Upload coconut images and select symptoms for accurate disease detection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <h2 className="text-xl text-[#1a2e1a] mb-4">Upload Image</h2>
            <div className="border-2 border-dashed border-green-200 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
              {uploadedImage ? (
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-64 object-cover rounded-lg" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">Drag and drop your image here</h3>
                  <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                  <div className="flex gap-3 justify-center">
                    <label className="px-4 py-2 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] cursor-pointer transition-colors">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      Choose File
                    </label>
                    <label className="px-4 py-2 border-2 border-[#2d5f2e] text-[#2d5f2e] rounded-lg hover:bg-green-50 cursor-pointer transition-colors flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Camera
                      <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
            <h2 className="text-xl text-[#1a2e1a] mb-4">Select Symptoms (Optional)</h2>
            <div className="space-y-4">
              {diseases.map((disease) => (
                <div key={disease.name}>
                  <h3 className="text-sm text-gray-900 mb-2">{disease.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {disease.symptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedSymptoms.includes(symptom)
                            ? "bg-[#2d5f2e] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={!uploadedImage || scanning}
            className="w-full py-4 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {scanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              "Start AI Diagnosis"
            )}
          </button>
        </div>

        <div>
          {scanning && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#2d5f2e] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl text-gray-900 mb-2">AI Scanning in Progress</h3>
                <p className="text-gray-600">Analyzing leaf patterns and symptoms...</p>
              </div>
            </div>
          )}

          {result && !scanning && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-2xl shadow-sm p-6 text-white">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-2xl mb-2">Detection Result</h2>
                    <p className="text-green-100 text-sm">AI Analysis Complete</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="text-sm text-green-100 mb-1">Detected Disease</div>
                  <div className="text-2xl mb-3">{result.disease}</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-100">Confidence</div>
                      <div className="text-xl">{result.confidence}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-green-100">Severity</div>
                      <div className="text-xl">{result.severity}</div>
                    </div>
                  </div>
                  <div className="mt-3 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg text-gray-900">Recommended Actions</h3>
                </div>
                <ul className="space-y-2">
                  {result.actions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg text-gray-900">Prevention Tips</h3>
                </div>
                <ul className="space-y-2">
                  {result.prevention.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm text-gray-900 mb-1">Nearby Risk Alert</h4>
                    <p className="text-sm text-gray-700">
                      2 cases of {result.disease} reported within 5km radius in the last 7 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!scanning && !result && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">Ready for Diagnosis</h3>
                <p className="text-gray-600">Upload an image and click "Start AI Diagnosis" to begin.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
