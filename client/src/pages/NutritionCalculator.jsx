import { useState } from "react";
import axios from "axios";
import { Calculator, Dumbbell, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NutritionCalculator = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin/login" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">GymSmart</h1>
              <p className="text-sm text-gray-600">Nutrition Calculator</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Calculate Your Daily Macros
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get personalized calorie and macronutrient recommendations based on
            your goals, activity level, and body metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Form */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator size={24} className="text-primary-600" />
              Your Information
            </h3>

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
                    min="10"
                    max="100"
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
                    min="30"
                    max="300"
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
                    min="100"
                    max="250"
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
                  <option value="active">
                    Active (exercise 6-7 days/week)
                  </option>
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
                  <option value="weight_loss">
                    Weight Loss (500 cal deficit)
                  </option>
                  <option value="maintenance">
                    Maintenance (maintain weight)
                  </option>
                  <option value="muscle_gain">
                    Muscle Gain (300 cal surplus)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 py-3"
              >
                {loading ? "Calculating..." : "Calculate My Macros"}
              </button>
            </form>
          </div>

          {/* Results */}
          {result ? (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Your Nutrition Plan
              </h3>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-lg text-white">
                  <p className="text-sm opacity-90 mb-1">
                    Daily Calorie Target
                  </p>
                  <p className="text-4xl md:text-5xl font-bold">
                    {result.calculated_calories}
                  </p>
                  <p className="text-sm opacity-90 mt-1">kcal per day</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-4 rounded-lg text-center border-2 border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Protein</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {result.protein_grams}g
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        ((result.protein_grams * 4) /
                          result.calculated_calories) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Carbs</p>
                    <p className="text-2xl font-bold text-green-700">
                      {result.carbs_grams}g
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        ((result.carbs_grams * 4) /
                          result.calculated_calories) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center border-2 border-orange-200">
                    <p className="text-xs text-gray-600 mb-1">Fats</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {result.fats_grams}g
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        ((result.fats_grams * 9) / result.calculated_calories) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Macro Distribution
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Protein</span>
                        <span className="font-medium">
                          {result.protein_grams}g (
                          {Math.round(
                            ((result.protein_grams * 4) /
                              result.calculated_calories) *
                              100,
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${((result.protein_grams * 4) / result.calculated_calories) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Carbohydrates</span>
                        <span className="font-medium">
                          {result.carbs_grams}g (
                          {Math.round(
                            ((result.carbs_grams * 4) /
                              result.calculated_calories) *
                              100,
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${((result.carbs_grams * 4) / result.calculated_calories) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Fats</span>
                        <span className="font-medium">
                          {result.fats_grams}g (
                          {Math.round(
                            ((result.fats_grams * 9) /
                              result.calculated_calories) *
                              100,
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${((result.fats_grams * 9) / result.calculated_calories) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> These are general recommendations.
                    Consult with a nutritionist or healthcare provider for
                    personalized advice.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Calculator size={64} className="mx-auto mb-4 opacity-20" />
                <p>Fill out the form to see your personalized nutrition plan</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionCalculator;
