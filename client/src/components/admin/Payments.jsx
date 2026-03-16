import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  Filter,
} from "lucide-react";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [duePayments, setDuePayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("due"); // 'due', 'history'
  const [dueFilter, setDueFilter] = useState("all"); // 'all', 'today', 'overdue', 'upcoming'
  const [formData, setFormData] = useState({
    member_id: "",
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    notes: "",
    payment_schedule_id: null,
  });

  useEffect(() => {
    fetchPayments();
    fetchDuePayments();
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchDuePayments();
  }, [dueFilter]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get("/api/payments");
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDuePayments = async () => {
    try {
      const response = await axios.get(`/api/payments/due?filter=${dueFilter}`);
      setDuePayments(response.data);
    } catch (error) {
      console.error("Error fetching due payments:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get("/api/members");
      setMembers(response.data.filter((m) => m.status === "active"));
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleQuickCollect = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      member_id: schedule.member_id,
      amount: schedule.expected_amount,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "cash",
      notes: "",
      payment_schedule_id: schedule.id,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/payments", formData);
      fetchPayments();
      fetchDuePayments();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to record payment");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
    setFormData({
      member_id: "",
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "cash",
      notes: "",
      payment_schedule_id: null,
    });
  };

  const getDaysOverdueText = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Due in ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return "Due Today";
    } else {
      return `${diffDays} days overdue`;
    }
  };

  const getStatusBadge = (dueDate) => {
    const today = new Date().toISOString().split("T")[0];
    const due = dueDate;

    if (due < today) {
      const days = Math.ceil(
        (new Date(today) - new Date(due)) / (1000 * 60 * 60 * 24),
      );
      if (days >= 15) {
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
            Severely Overdue
          </span>
        );
      }
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
          Overdue
        </span>
      );
    } else if (due === today) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
          Due Today
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
          Upcoming
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Payments
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("due")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "due"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Due Payments ({duePayments.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "history"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Payment History
        </button>
      </div>

      {activeTab === "due" && (
        <>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setDueFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dueFilter === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDueFilter("today")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dueFilter === "today"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Due Today
            </button>
            <button
              onClick={() => setDueFilter("overdue")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dueFilter === "overdue"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setDueFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dueFilter === "upcoming"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upcoming (7 days)
            </button>
          </div>

          {/* Due Payments List */}
          {duePayments.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No payments due in this category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duePayments.map((schedule) => (
                <div key={schedule.id} className="card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {schedule.member_name}
                        </h3>
                        {getStatusBadge(schedule.due_date)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          Due Date:{" "}
                          <span className="font-medium">
                            {new Date(schedule.due_date).toLocaleDateString()}
                          </span>
                        </p>
                        <p>
                          Amount:{" "}
                          <span className="font-medium text-green-600">
                            ₹{schedule.expected_amount}
                          </span>
                        </p>
                        <p>
                          Phone:{" "}
                          <span className="font-medium">
                            {schedule.phone || "N/A"}
                          </span>
                        </p>
                        <p>
                          Status:{" "}
                          <span className="font-medium">
                            {getDaysOverdueText(schedule.due_date)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickCollect(schedule)}
                      className="btn-primary whitespace-nowrap"
                    >
                      Collect Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "history" && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Member
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Recorded By
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium">
                      {payment.member_name}
                    </td>
                    <td className="py-3 px-4 text-green-600 font-semibold">
                      ₹{payment.amount}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {payment.payment_method}
                    </td>
                    <td className="py-3 px-4">
                      {payment.is_late ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          Late
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          On Time
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {payment.recorded_by_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {payment.member_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    ₹{payment.amount}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Method:{" "}
                    <span className="capitalize">{payment.payment_method}</span>
                  </p>
                  <p>
                    Status:{" "}
                    {payment.is_late ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                        Late
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        On Time
                      </span>
                    )}
                  </p>
                  <p>Recorded by: {payment.recorded_by_name}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedSchedule ? "Collect Payment" : "Record Payment"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member *
                  </label>
                  <select
                    value={formData.member_id}
                    onChange={(e) => {
                      const memberId = e.target.value;
                      const member = members.find((m) => m.id == memberId);
                      setFormData({
                        ...formData,
                        member_id: memberId,
                        amount: member?.membership_fee || "",
                      });
                    }}
                    className="input-field"
                    required
                    disabled={!!selectedSchedule}
                  >
                    <option value="">Select Member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - ₹{member.membership_fee}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="input-field"
                    rows="3"
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
