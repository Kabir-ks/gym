import { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Filter } from "lucide-react";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter((log) => log.entity_type === filter));
    }
  }, [filter, logs]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("/api/audit");
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes("created")) return "text-green-600 bg-green-50";
    if (action.includes("updated")) return "text-blue-600 bg-blue-50";
    if (action.includes("deleted")) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
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
          Audit Logs
        </h1>

        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Actions</option>
            <option value="member">Members</option>
            <option value="payment">Payments</option>
            {/* <option value="attendance">Attendance</option> */}
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Timestamp
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Admin
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Action
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Entity
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{log.admin_name}</p>
                    <p className="text-xs text-gray-500">{log.admin_email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}
                  >
                    {log.action.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="py-3 px-4 capitalize text-gray-600">
                  {log.entity_type || "-"}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                  {log.ip_address || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {log.admin_name}
                </p>
                <p className="text-xs text-gray-500">{log.admin_email}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}
              >
                {log.action.replace(/_/g, " ")}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                Entity:{" "}
                <span className="capitalize">{log.entity_type || "-"}</span>
              </p>
              <p>Time: {new Date(log.created_at).toLocaleString()}</p>
              <p>
                IP:{" "}
                <span className="font-mono text-xs">
                  {log.ip_address || "-"}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No audit logs found</p>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
