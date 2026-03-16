import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, DollarSign, Calendar } from "lucide-react";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membership_type: "monthly",
    membership_start: "",
    membership_end: "",
    membership_fee: "",
    status: "active",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.access_code.includes(searchTerm),
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get("/api/members");
      setMembers(response.data);
      setFilteredMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedMember) {
        await axios.put(`/api/members/${selectedMember.id}`, formData);
      } else {
        await axios.post("/api/members", formData);
      }
      fetchMembers();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await axios.delete(`/api/members/${id}`);
        fetchMembers();
      } catch (error) {
        alert("Failed to delete member");
      }
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        name: member.name,
        email: member.email || "",
        phone: member.phone || "",
        membership_type: member.membership_type,
        membership_start: member.membership_start,
        membership_end: member.membership_end,
        membership_fee: member.membership_fee || "",
        status: member.status,
      });
    } else {
      setSelectedMember(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        membership_type: "monthly",
        membership_start: "",
        membership_end: "",
        membership_fee: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  const getPaymentStatusBadge = (member) => {
    if (!member.payment_status) return null;

    const statusConfig = {
      current: { bg: "bg-green-100", text: "text-green-700", label: "Current" },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Due Soon",
      },
      due_today: { bg: "bg-red-100", text: "text-red-700", label: "Due Today" },
      overdue: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "Overdue",
      },
      severely_overdue: {
        bg: "bg-red-100",
        text: "text-red-900",
        label: "Severely Overdue",
      },
    };

    const config = statusConfig[member.payment_status] || statusConfig.current;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
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
          Members
        </h1>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Add Member</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, or access code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Name
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Access Code
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Monthly Fee
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Next Due
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Payment Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr
                key={member.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4">{member.name}</td>
                <td className="py-3 px-4">
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded font-mono text-sm">
                    {member.access_code}
                  </span>
                </td>
                <td className="py-3 px-4 text-green-600 font-semibold">
                  ₹{member.membership_fee}
                </td>
                <td className="py-3 px-4">
                  {member.next_payment_due
                    ? new Date(member.next_payment_due).toLocaleDateString()
                    : "-"}
                </td>
                <td className="py-3 px-4">{getPaymentStatusBadge(member)}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      member.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(member)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredMembers.map((member) => (
          <div key={member.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Code:{" "}
                  <span className="font-mono bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                    {member.access_code}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    member.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {member.status}
                </span>
                {getPaymentStatusBadge(member)}
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <p className="flex items-center gap-2">
                <DollarSign size={16} />
                Monthly Fee:{" "}
                <span className="font-semibold text-green-600">
                  ₹{member.membership_fee}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={16} />
                Next Due:{" "}
                {member.next_payment_due
                  ? new Date(member.next_payment_due).toLocaleDateString()
                  : "-"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal(member)}
                className="flex-1 btn-secondary text-sm py-2"
              >
                <Edit size={16} className="inline mr-1" /> Edit
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm"
              >
                <Trash2 size={16} className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedMember ? "Edit Member" : "Add New Member"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membership Type *
                  </label>
                  <select
                    value={formData.membership_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membership_type: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Fee *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.membership_fee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membership_fee: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="3000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.membership_start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membership_start: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.membership_end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membership_end: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended</option>
                  </select>
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
                    {selectedMember ? "Update" : "Create"}
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

export default Members;
