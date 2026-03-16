import { useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Apple,
  UserCog,
  FileText,
  Menu,
  X,
  LogOut,
  Download,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import Overview from "../components/admin/Overview";
import Members from "../components/admin/Members";
import Payments from "../components/admin/Payments";
import Attendance from "../components/admin/Attendance";
import Nutrition from "../components/admin/Nutrition";
import Admins from "../components/admin/Admins";
import AuditLogs from "../components/admin/AuditLogs";
import Reports from "../components/admin/Reports";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/dashboard/members", icon: Users, label: "Members" },
    { path: "/admin/dashboard/payments", icon: DollarSign, label: "Payments" },
   
    { path: "/admin/dashboard/reports", icon: Download, label: "Reports" },
    { path: "/admin/dashboard/nutrition", icon: Apple, label: "Nutrition" },
    { path: "/admin/dashboard/admins", icon: UserCog, label: "Admins" },
    { path: "/admin/dashboard/audit", icon: FileText, label: "Audit Logs" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:relative
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              GymSmart
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {admin?.name}
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Theme
              </span>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            GymSmart
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sidebarOpen ? (
                <X size={24} className="text-gray-900 dark:text-white" />
              ) : (
                <Menu size={24} className="text-gray-900 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="members" element={<Members />} />
            <Route path="payments" element={<Payments />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="admins" element={<Admins />} />
            <Route path="audit" element={<AuditLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
