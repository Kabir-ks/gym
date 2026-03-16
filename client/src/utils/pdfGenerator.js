import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Generate Members Report PDF
export const generateMembersReport = (members) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(2, 132, 199);
  doc.text("GymSmart - Members Report", 14, 20);

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  // Summary
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Members: ${members.length}`, 14, 38);
  const activeCount = members.filter((m) => m.status === "active").length;
  doc.text(`Active Members: ${activeCount}`, 14, 45);

  // Table
  const tableData = members.map((member) => [
    member.name,
    member.access_code,
    member.email || "-",
    member.phone || "-",
    member.membership_type,
    new Date(member.membership_end).toLocaleDateString(),
    member.status,
  ]);

  autoTable(doc, {
    startY: 55,
    head: [["Name", "Code", "Email", "Phone", "Type", "Expires", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [2, 132, 199] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 20 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 },
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  return doc;
};

// Generate Payments Report PDF
export const generatePaymentsReport = (payments, startDate, endDate) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(2, 132, 199);
  doc.text("GymSmart - Payments Report", 14, 20);

  // Date Range
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  if (startDate && endDate) {
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 34);
  }

  // Summary
  const totalAmount = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0,
  );
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Payments: ${payments.length}`, 14, 44);
  doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 14, 51);

  // Table
  const tableData = payments.map((payment) => [
    payment.member_name,
    `₹${parseFloat(payment.amount).toFixed(2)}`,
    new Date(payment.payment_date).toLocaleDateString(),
    payment.payment_method,
    payment.recorded_by_name,
    payment.notes || "-",
  ]);

  autoTable(doc, {
    startY: 60,
    head: [["Member", "Amount", "Date", "Method", "Recorded By", "Notes"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [2, 132, 199] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 35 },
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  return doc;
};

// Generate Attendance Report PDF
export const generateAttendanceReport = (attendance, startDate, endDate) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(2, 132, 199);
  doc.text("GymSmart - Attendance Report", 14, 20);

  // Date Range
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  if (startDate && endDate) {
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 34);
  }

  // Summary
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Check-ins: ${attendance.length}`, 14, 44);

  // Table
  const tableData = attendance.map((record) => {
    const checkIn = new Date(record.check_in);
    const checkOut = record.check_out ? new Date(record.check_out) : null;
    const duration = checkOut ? Math.round((checkOut - checkIn) / 60000) : "-";

    return [
      record.member_name,
      checkIn.toLocaleDateString(),
      checkIn.toLocaleTimeString(),
      checkOut ? checkOut.toLocaleTimeString() : "Active",
      duration !== "-" ? `${duration} mins` : "-",
    ];
  });

  autoTable(doc, {
    startY: 54,
    head: [["Member", "Date", "Check In", "Check Out", "Duration"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [2, 132, 199] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  return doc;
};

// Generate Member Details PDF (for individual member)
export const generateMemberDetailsPDF = (member, payments, attendance) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(2, 132, 199);
  doc.text("GymSmart - Member Details", 14, 20);

  // Member Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Name: ${member.name}`, 14, 35);
  doc.text(`Access Code: ${member.access_code}`, 14, 42);
  doc.text(`Email: ${member.email || "Not provided"}`, 14, 49);
  doc.text(`Phone: ${member.phone || "Not provided"}`, 14, 56);
  doc.text(`Membership Type: ${member.membership_type}`, 14, 63);
  doc.text(`Status: ${member.status}`, 14, 70);
  doc.text(
    `Valid Until: ${new Date(member.membership_end).toLocaleDateString()}`,
    14,
    77,
  );

  // Payment History
  if (payments && payments.length > 0) {
    doc.setFontSize(14);
    doc.text("Payment History", 14, 90);

    const paymentData = payments.map((p) => [
      `₹${parseFloat(p.amount).toFixed(2)}`,
      new Date(p.payment_date).toLocaleDateString(),
      p.payment_method,
      p.notes || "-",
    ]);

    autoTable(doc, {
      startY: 95,
      head: [["Amount", "Date", "Method", "Notes"]],
      body: paymentData,
      theme: "striped",
      headStyles: { fillColor: [2, 132, 199] },
      styles: { fontSize: 9 },
    });
  }

  // Attendance History
  if (attendance && attendance.length > 0) {
    const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 95;

    doc.setFontSize(14);
    doc.text("Attendance History", 14, startY);

    const attendanceData = attendance.slice(0, 20).map((record) => {
      const checkIn = new Date(record.check_in);
      const checkOut = record.check_out ? new Date(record.check_out) : null;
      const duration = checkOut
        ? Math.round((checkOut - checkIn) / 60000)
        : "-";

      return [
        checkIn.toLocaleDateString(),
        checkIn.toLocaleTimeString(),
        checkOut ? checkOut.toLocaleTimeString() : "Active",
        duration !== "-" ? `${duration} mins` : "-",
      ];
    });

    autoTable(doc, {
      startY: startY + 5,
      head: [["Date", "Check In", "Check Out", "Duration"]],
      body: attendanceData,
      theme: "striped",
      headStyles: { fillColor: [2, 132, 199] },
      styles: { fontSize: 9 },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      14,
      doc.internal.pageSize.height - 10,
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  return doc;
};

// Share PDF via WhatsApp
export const shareViaWhatsApp = (pdfDoc, fileName, message = "") => {
  // Convert PDF to blob
  const pdfBlob = pdfDoc.output("blob");

  // For mobile devices, try to share using Web Share API
  if (navigator.share && navigator.canShare) {
    const file = new File([pdfBlob], fileName, { type: "application/pdf" });

    // Check if files can be shared
    if (navigator.canShare({ files: [file] })) {
      navigator
        .share({
          title: fileName,
          text: message,
          files: [file],
        })
        .catch((err) => {
          console.error("Error sharing:", err);
          fallbackWhatsAppShare(message, fileName);
        });
    } else {
      fallbackWhatsAppShare(message, fileName);
    }
  } else {
    // Fallback: Open WhatsApp with message
    fallbackWhatsAppShare(message, fileName);
  }
};

// Fallback WhatsApp share (opens WhatsApp with text message)
const fallbackWhatsAppShare = (message, fileName) => {
  const text = encodeURIComponent(
    `${message}\n\nReport: ${fileName}\n\nGenerated from GymSmart`,
  );
  const whatsappUrl = `https://wa.me/?text=${text}`;
  window.open(whatsappUrl, "_blank");
};

// Download PDF
export const downloadPDF = (pdfDoc, fileName) => {
  pdfDoc.save(fileName);
};
