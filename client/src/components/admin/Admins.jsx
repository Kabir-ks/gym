import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Copy, Check } from "lucide-react";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newInvite, setNewInvite] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
    fetchInvites();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("/api/admin");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvites = async () => {
    try {
      const response = await axios.get("/api/auth/admin/invites");
      setInvites(response.data);
    } catch (error) {
      console.error("Error fetching invites:", error);
    }
  };

  const generateInvite = async () => {
    try {
      const response = await axios.post("/api/auth/admin/invite");
      setNewInvite(response.data);
      setShowModal(true);
      fetchInvites();
    } catch (error) {
      alert("Failed to generate invite code");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this admin?")) {
      try {
        await axios.delete(`/api/admin/${id}`);
        fetchAdmins();
      } catch (error) {
        alert(error.response?.data?.error || "Failed to delete admin");
      }
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
          Admin Management
        </h1>
        <button
          onClick={generateInvite}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Generate Invite</span>
        </button>
      </div>

      {/* Current Admins */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Current Admins
        </h2>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Invited By
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Joined
                </th>
                
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium">{admin.name}</td>
                  <td className="py-3 px-4">{admin.email}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {admin.invited_by_name || "System"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {admin.name}
                  </h3>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                </div>
                <button
                  onClick={() => handleDelete(admin.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <p>Invited by: {admin.invited_by_name || "System"}</p>
                <p>Joined: {new Date(admin.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Invites */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Active Invite Codes
        </h2>

        {invites.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No active invites</p>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded inline-block">
                      {invite.code}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Created by: {invite.created_by_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires: {new Date(invite.expires_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(invite.code)}
                    className="btn-secondary flex items-center gap-2 justify-center"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showModal && newInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Invite Code Generated
              </h2>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Share this code with the new admin:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 font-mono text-sm">
                    {newInvite.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newInvite.code)}
                    className="btn-secondary p-2"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ This code expires in 24 hours and can only be used once.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setNewInvite(null);
                }}
                className="w-full btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
