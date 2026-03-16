import { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Download, Share2, Calendar, Filter } from "lucide-react";
import {
  generateMembersReport,
  generatePaymentsReport,
  generateAttendanceReport,
  downloadPDF,
  shareViaWhatsApp,
} from "../../utils/pdfGenerator";

const Reports = () => {
  const [reportType, setReportType] = useState("members");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let response;

      switch (reportType) {
        case "members":
          response = await axios.get("/api/members");
          setData(response.data);
          break;

        case "payments":
          response = await axios.get("/api/payments");
          let payments = response.data;

          // Filter by date range if provided
          if (dateRange.startDate && dateRange.endDate) {
            payments = payments.filter((p) => {
              const paymentDate = new Date(p.payment_date);
              return (
                paymentDate >= new Date(dateRange.startDate) &&
                paymentDate <= new Date(dateRange.endDate)
              );
            });
          }
          setData(payments);
          break;

        case "attendance":
          response = await axios.get("/api/attendance");
          let attendance = response.data;

          // Filter by date range if provided
          if (dateRange.startDate && dateRange.endDate) {
            attendance = attendance.filter((a) => {
              const checkInDate = new Date(a.check_in);
              return (
                checkInDate >= new Date(dateRange.startDate) &&
                checkInDate <= new Date(dateRange.endDate)
              );
            });
          }
          setData(attendance);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      alert("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const handleGenerateReport = () => {
    if (!data || data.length === 0) {
      alert("No data available for the selected report");
      return;
    }

    let pdfDoc;
    let fileName;

    switch (reportType) {
      case "members":
        pdfDoc = generateMembersReport(data);
        fileName = `Members_Report_${new Date().toISOString().split("T")[0]}.pdf`;
        break;

      case "payments":
        pdfDoc = generatePaymentsReport(
          data,
          dateRange.startDate,
          dateRange.endDate,
        );
        fileName = `Payments_Report_${new Date().toISOString().split("T")[0]}.pdf`;
        break;

      case "attendance":
        pdfDoc = generateAttendanceReport(
          data,
          dateRange.startDate,
          dateRange.endDate,
        );
        fileName = `Attendance_Report_${new Date().toISOString().split("T")[0]}.pdf`;
        break;

      default:
        return;
    }

    return { pdfDoc, fileName };
  };

  const handleDownload = () => {
    const result = handleGenerateReport();
    if (result) {
      downloadPDF(result.pdfDoc, result.fileName);
    }
  };

  const handleShare = () => {
    const result = handleGenerateReport();
    if (result) {
      const message = `GymSmart ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      shareViaWhatsApp(result.pdfDoc, result.fileName, message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Reports & Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter size={20} />
              Report Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="input-field"
                >
                  <option value="members">Members Report</option>
                  <option value="payments">Payments Report</option>
                  
                </select>
              </div>

              {(reportType === "payments" || reportType === "attendance") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange({
                          ...dateRange,
                          startDate: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, endDate: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>

                  <button
                    onClick={fetchReportData}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} />
                    Apply Date Filter
                  </button>
                </>
              )}

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={loading || !data || data.length === 0}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download size={18} />
                  Download PDF
                </button>

                <button
                  onClick={handleShare}
                  disabled={loading || !data || data.length === 0}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Share2 size={18} />
                  Share via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Report Preview
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : data && data.length > 0 ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {reportType === "members" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Total Members</p>
                          <p className="text-2xl font-bold text-primary-700">
                            {data.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Active</p>
                          <p className="text-2xl font-bold text-green-700">
                            {data.filter((m) => m.status === "active").length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Inactive</p>
                          <p className="text-2xl font-bold text-red-700">
                            {data.filter((m) => m.status !== "active").length}
                          </p>
                        </div>
                      </>
                    )}

                    {reportType === "payments" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">
                            Total Payments
                          </p>
                          <p className="text-2xl font-bold text-primary-700">
                            {data.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-green-700">
                            ₹
                            {data
                              .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                              .toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}

                    {reportType === "attendance" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">
                            Total Check-ins
                          </p>
                          <p className="text-2xl font-bold text-primary-700">
                            {data.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Unique Members
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {new Set(data.map((a) => a.member_id)).size}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Data Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Showing {Math.min(data.length, 5)} of {data.length} records
                  </p>
                  <div className="space-y-2">
                    {data.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-gray-200 text-sm"
                      >
                        {reportType === "members" && (
                          <div className="flex justify-between">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-600">
                              {item.access_code}
                            </span>
                          </div>
                        )}
                        {reportType === "payments" && (
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {item.member_name}
                            </span>
                            <span className="text-green-600 font-semibold">
                              ₹{item.amount}
                            </span>
                          </div>
                        )}
                        {reportType === "attendance" && (
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {item.member_name}
                            </span>
                            <span className="text-gray-600">
                              {new Date(item.check_in).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {data.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      + {data.length - 5} more records in full report
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                <p>No data available for the selected report</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Report Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="card hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setReportType("members")}
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Members Report</h3>
              <p className="text-sm text-gray-600">
                Complete member list with details
              </p>
            </div>
          </div>
        </div>

        <div
          className="card hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setReportType("payments")}
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Payments Report</h3>
              <p className="text-sm text-gray-600">
                Revenue and payment history
              </p>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Reports;
