import { useState } from "react";
import axios from "axios";
import {
  Dumbbell,
  DollarSign,
  User,
  LogOut,
  Calculator,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const MemberPortal = () => {
  const { toggleTheme, isDark } = useTheme();
  const [accessCode, setAccessCode] = useState("");
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Nutrition calculator state
  const [nutritionForm, setNutritionForm] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "male",
    activity_level: "moderate",
    goal: "maintenance",
  });
  const [nutritionResult, setNutritionResult] = useState(null);
  const [calculatingNutrition, setCalculatingNutrition] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const memberRes = await axios.post("/api/members/portal/access", {
        accessCode,
      });
      setMember(memberRes.data);

      const paymentsRes = await axios.post(
        `/api/members/portal/${accessCode}/payments`,
      );
      setPayments(paymentsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid access code");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setMember(null);
    setAccessCode("");
    setPayments([]);
    setActiveTab("overview");
    setNutritionResult(null);
  };

  const handleNutritionSubmit = async (e) => {
    e.preventDefault();
    setCalculatingNutrition(true);

    try {
      const response = await axios.post(
        "/api/nutrition/calculate",
        nutritionForm,
      );
      setNutritionResult(response.data);
    } catch (error) {
      alert("Failed to calculate nutrition plan");
    } finally {
      setCalculatingNutrition(false);
    }
  };

  const getMembershipStatus = () => {
    if (!member) return null;
    const endDate = new Date(member.membership_end);
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (member.status !== "active") {
      return { text: "Inactive", color: "bg-red-900 text-red-300" };
    } else if (daysLeft < 0) {
      return { text: "Expired", color: "bg-red-900 text-red-300" };
    } else if (daysLeft <= 7) {
      return {
        text: `Expires in ${daysLeft} days`,
        color: "bg-yellow-900 text-yellow-300",
      };
    } else {
      return { text: "Active", color: "bg-green-900 text-green-300" };
    }
  };

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              GymSmart
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Member Portal
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  6-Digit Access Code
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="input-field text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  Enter your 6-digit access code to view your membership details
                </p>
              </div>

              {error && (
                <div className="bg-red-900 text-red-300 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? "Accessing..." : "Access Portal"}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link
                to="/admin/login"
                className="text-gray-400 hover:text-gray-300 text-sm block"
              >
                ← Admin Login
              </Link>
              <Link
                to="/nutrition"
                className="text-primary-400 hover:text-primary-300 text-sm block"
              >
                Nutrition Calculator →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = getMembershipStatus();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                GymSmart
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDark ? (
                <Sun size={20} className="text-gray-300" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-primary-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <User className="inline w-4 h-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "payments"
                ? "bg-primary-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <DollarSign className="inline w-4 h-4 mr-2" />
            Payments
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "nutrition"
                ? "bg-primary-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Calculator className="inline w-4 h-4 mr-2" />
            Nutrition
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h2>
                <p className="text-gray-400 mt-1">
                  Access Code:{" "}
                  <span className="font-mono bg-primary-900 text-primary-300 px-2 py-1 rounded">
                    {member.access_code}
                  </span>
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg font-medium ${status.color}`}
              >
                {status.text}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-medium text-white">
                  {member.email || "Not provided"}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Phone</p>
                <p className="font-medium text-white">
                  {member.phone || "Not provided"}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Membership Type</p>
                <p className="font-medium text-white capitalize">
                  {member.membership_type}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Valid Until</p>
                <p className="font-medium text-white">
                  {new Date(member.membership_end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="text-primary-400" />
              Payment History
            </h2>

            {payments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No payment records
              </p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-gray-700 rounded-lg p-4 bg-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">
                          ₹{payment.amount}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 capitalize mt-1">
                          via {payment.payment_method}
                        </p>
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-gray-400 max-w-xs">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === "nutrition" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Form */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calculator
                  size={24}
                  className="text-primary-600 dark:text-primary-400"
                />
                Calculate Your Macros
              </h2>

              <form onSubmit={handleNutritionSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={nutritionForm.age}
                      onChange={(e) =>
                        setNutritionForm({
                          ...nutritionForm,
                          age: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="25"
                      min="10"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Gender *
                    </label>
                    <select
                      value={nutritionForm.gender}
                      onChange={(e) =>
                        setNutritionForm({
                          ...nutritionForm,
                          gender: e.target.value,
                        })
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutritionForm.weight}
                      onChange={(e) =>
                        setNutritionForm({
                          ...nutritionForm,
                          weight: e.target.value,
                        })
                      }
                      className="input-field"
                      placeholder="70"
                      min="30"
                      max="300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Height (cm) *
                    </label>
                    <input
                      type="number"
                      value={nutritionForm.height}
                      onChange={(e) =>
                        setNutritionForm({
                          ...nutritionForm,
                          height: e.target.value,
                        })
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Activity Level *
                  </label>
                  <select
                    value={nutritionForm.activity_level}
                    onChange={(e) =>
                      setNutritionForm({
                        ...nutritionForm,
                        activity_level: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="sedentary">
                      Sedentary (little or no exercise)
                    </option>
                    <option value="light">
                      Light (exercise 1-3 days/week)
                    </option>
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Goal *
                  </label>
                  <select
                    value={nutritionForm.goal}
                    onChange={(e) =>
                      setNutritionForm({
                        ...nutritionForm,
                        goal: e.target.value,
                      })
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
                  disabled={calculatingNutrition}
                  className="w-full btn-primary disabled:opacity-50 py-3"
                >
                  {calculatingNutrition
                    ? "Calculating..."
                    : "Calculate My Macros"}
                </button>
              </form>
            </div>

            {/* Results */}
            {nutritionResult ? (
              <div className="card">
                <h2 className="text-xl font-bold text-white mb-4">
                  Your Nutrition Plan
                </h2>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-lg text-white">
                    <p className="text-sm opacity-90 mb-1">
                      Daily Calorie Target
                    </p>
                    <p className="text-4xl md:text-5xl font-bold">
                      {nutritionResult.calculated_calories}
                    </p>
                    <p className="text-sm opacity-90 mt-1">kcal per day</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-900 p-4 rounded-lg text-center border-2 border-blue-700">
                      <p className="text-xs text-gray-300 mb-1">Protein</p>
                      <p className="text-2xl font-bold text-blue-300">
                        {nutritionResult.protein_grams}g
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.round(
                          ((nutritionResult.protein_grams * 4) /
                            nutritionResult.calculated_calories) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                    <div className="bg-green-900 p-4 rounded-lg text-center border-2 border-green-700">
                      <p className="text-xs text-gray-300 mb-1">Carbs</p>
                      <p className="text-2xl font-bold text-green-300">
                        {nutritionResult.carbs_grams}g
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.round(
                          ((nutritionResult.carbs_grams * 4) /
                            nutritionResult.calculated_calories) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                    <div className="bg-orange-900 p-4 rounded-lg text-center border-2 border-orange-700">
                      <p className="text-xs text-gray-300 mb-1">Fats</p>
                      <p className="text-2xl font-bold text-orange-300">
                        {nutritionResult.fats_grams}g
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.round(
                          ((nutritionResult.fats_grams * 9) /
                            nutritionResult.calculated_calories) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-100 mb-3">
                      Macro Distribution
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Protein</span>
                          <span className="font-medium text-gray-200">
                            {nutritionResult.protein_grams}g (
                            {Math.round(
                              ((nutritionResult.protein_grams * 4) /
                                nutritionResult.calculated_calories) *
                                100,
                            )}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${((nutritionResult.protein_grams * 4) / nutritionResult.calculated_calories) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Carbohydrates</span>
                          <span className="font-medium text-gray-200">
                            {nutritionResult.carbs_grams}g (
                            {Math.round(
                              ((nutritionResult.carbs_grams * 4) /
                                nutritionResult.calculated_calories) *
                                100,
                            )}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${((nutritionResult.carbs_grams * 4) / nutritionResult.calculated_calories) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Fats</span>
                          <span className="font-medium text-gray-200">
                            {nutritionResult.fats_grams}g (
                            {Math.round(
                              ((nutritionResult.fats_grams * 9) /
                                nutritionResult.calculated_calories) *
                                100,
                            )}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-3">
                          <div
                            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${((nutritionResult.fats_grams * 9) / nutritionResult.calculated_calories) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                    <p className="text-sm text-blue-200">
                      💡 <strong>Tip:</strong> These are general
                      recommendations. Consult with a nutritionist or healthcare
                      provider for personalized advice.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Calculator size={64} className="mx-auto mb-4 opacity-20" />
                  <p>
                    Fill out the form to see your personalized nutrition plan
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberPortal;
