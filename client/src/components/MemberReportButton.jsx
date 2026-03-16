import { useState } from "react";
import axios from "axios";
import { Download, Share2 } from "lucide-react";
import {
  generateMemberDetailsPDF,
  downloadPDF,
  shareViaWhatsApp,
} from "../utils/pdfGenerator";

const MemberReportButton = ({ member }) => {
  const [loading, setLoading] = useState(false);

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, attendanceRes] = await Promise.all([
        axios.get(`/api/members/${member.id}/payments`),
        axios.get(`/api/members/${member.id}/attendance`),
      ]);

      return {
        payments: paymentsRes.data,
        attendance: attendanceRes.data,
      };
    } catch (error) {
      console.error("Error fetching member data:", error);
      alert("Failed to fetch member data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const data = await fetchMemberData();
    if (data) {
      const pdfDoc = generateMemberDetailsPDF(
        member,
        data.payments,
        data.attendance,
      );
      const fileName = `${member.name.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      downloadPDF(pdfDoc, fileName);
    }
  };

  const handleShare = async () => {
    const data = await fetchMemberData();
    if (data) {
      const pdfDoc = generateMemberDetailsPDF(
        member,
        data.payments,
        data.attendance,
      );
      const fileName = `${member.name.replace(/\s+/g, "_")}_Report.pdf`;
      const message = `Member Report for ${member.name}\nAccess Code: ${member.access_code}`;
      shareViaWhatsApp(pdfDoc, fileName, message);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
        title="Download Member Report"
      >
        <Download size={18} />
      </button>
      <button
        onClick={handleShare}
        disabled={loading}
        className="text-green-600 hover:text-green-700 disabled:opacity-50"
        title="Share via WhatsApp"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
};

export default MemberReportButton;
