import { useState } from "react";
import axios from "axios";
import { Calculator } from "lucide-react";

const Nutrition = () => {
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "male",
    activity_level: "moderate",
    goal: "maintenance",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/nutrition/calculate", formData);
      setResult(response.data);
    } catch (error) {
      alert("Failed to calculate nutrition plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Nutrition Calculator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calculator size={24} />
            Calculate Macros
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className="input-field"
                  placeholder="25"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="input-field"
                  placeholder="70"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  className="input-field"
                  placeholder="175"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Level *
              </label>
              <select
                value={formData.activity_level}
                onChange={(e) =>
                  setFormData({ ...formData, activity_level: e.target.value })
                }
                className="input-field"
                required
              >
                <option value="sedentary">
                  Sedentary (little or no exercise)
                </option>
                <option value="light">Light (exercise 1-3 days/week)</option>
                <option value="moderate">
                  Moderate (exercise 3-5 days/week)
                </option>
                <option value="active">Active (exercise 6-7 days/week)</option>
                <option value="very_active">
                  Very Active (intense exercise daily)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal *
              </label>
              <select
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
                className="input-field"
                required
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="maintenance">Maintenance</option>
                <option value="muscle_gain">Muscle Gain</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Calculate"}
            </button>
          </form>
        </div>

        {result && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Your Nutrition Plan
            </h2>

            <div className="space-y-4">
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Daily Calories</p>
                <p className="text-3xl font-bold text-primary-700">
                  {result.calculated_calories}
                </p>
                <p className="text-xs text-gray-500 mt-1">kcal per day</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Protein</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {result.protein_grams}g
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Carbs</p>
                  <p className="text-2xl font-bold text-green-700">
                    {result.carbs_grams}g
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Fats</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {result.fats_grams}g
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Macro Distribution
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span>
                        {Math.round(
                          ((result.protein_grams * 4) /
                            result.calculated_calories) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${((result.protein_grams * 4) / result.calculated_calories) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs</span>
                      <span>
                        {Math.round(
                          ((result.carbs_grams * 4) /
                            result.calculated_calories) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${((result.carbs_grams * 4) / result.calculated_calories) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fats</span>
                      <span>
                        {Math.round(
                          ((result.fats_grams * 9) /
                            result.calculated_calories) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${((result.fats_grams * 9) / result.calculated_calories) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nutrition;
