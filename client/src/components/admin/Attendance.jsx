import { useState, useEffect } from "react";
import axios from "axios";
import { UserCheck, Clock } from "lucide-react";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
    fetchMembers();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get("/api/attendance/today");
      setAttendance(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
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

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/attendance/checkin", {
        member_id: selectedMember,
      });
      fetchAttendance();
      setShowModal(false);
      setSelectedMember("");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to check in");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await axios.post(`/api/attendance/checkout/${id}`);
      fetchAttendance();
    } catch (error) {
      alert("Failed to check out");
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Today's Attendance
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserCheck size={20} />
          <span>Check In Member</span>
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Member
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Check In
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Check Out
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Duration
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => {
              const checkIn = new Date(record.check_in);
              const checkOut = record.check_out
                ? new Date(record.check_out)
                : null;
              const duration = checkOut
                ? Math.round((checkOut - checkIn) / 60000)
                : null;

              return (
                <tr
                  key={record.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium">
                    {record.member_name}
                  </td>
                  <td className="py-3 px-4">{checkIn.toLocaleTimeString()}</td>
                  <td className="py-3 px-4">
                    {checkOut ? (
                      checkOut.toLocaleTimeString()
                    ) : (
                      <span className="text-green-600 font-medium">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {duration ? `${duration} mins` : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {!checkOut && (
                      <button
                        onClick={() => handleCheckOut(record.id)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {attendance.map((record) => {
          const checkIn = new Date(record.check_in);
          const checkOut = record.check_out ? new Date(record.check_out) : null;
          const duration = checkOut
            ? Math.round((checkOut - checkIn) / 60000)
            : null;

          return (
            <div key={record.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {record.member_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    In: {checkIn.toLocaleTimeString()}
                  </p>
                </div>
                {!checkOut && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p>Out: {checkOut ? checkOut.toLocaleTimeString() : "-"}</p>
                <p>Duration: {duration ? `${duration} mins` : "-"}</p>
              </div>
              {!checkOut && (
                <button
                  onClick={() => handleCheckOut(record.id)}
                  className="w-full btn-primary"
                >
                  Check Out
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Check In Member
              </h2>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Member *
                  </label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.access_code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedMember("");
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Check In
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

export default Attendance;
