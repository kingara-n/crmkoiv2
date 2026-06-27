import jsPDF from "jspdf";
import "jspdf-autotable";
import { Invoice, PurchaseOrder, DocumentTemplate, Client, Booking, Supplier } from "./types";
import { formatDate } from "./format";

// Helper to convert image URL to base64
async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateInvoicePDF(
  invoice: Invoice,
  template: DocumentTemplate,
  client?: Client,
  booking?: Booking
) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  
  // 1. Draw Template Background
  try {
    const base64Img = await getBase64ImageFromUrl(template.imageUrl);
    doc.addImage(base64Img, "PNG", 0, 0, 210, 297);
  } catch (error) {
    console.error("Could not load template image", error);
  }

  // 2. Add Invoice Text Overlay
  // We'll use a generic layout. Adjust X,Y coordinates to fit standard letterheads.
  doc.setFont("helvetica");
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(50, 50, 50);
  doc.text("INVOICE", 150, 40);

  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Invoice Number: ${invoice.number}`, 150, 50);
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, 150, 56);
  if (invoice.dueDate) doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 150, 62);

  // Client Details
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Bill To:", 20, 50);
  doc.setFontSize(10);
  if (client) {
    doc.text(client.name, 20, 56);
    if (client.email) doc.text(client.email, 20, 62);
    if (client.phone) doc.text(client.phone, 20, 68);
    if (client.city || client.country) doc.text(`${client.city || ""}, ${client.country || ""}`, 20, 74);
  } else {
    doc.text("Unknown Client", 20, 56);
  }

  // Booking Details
  if (booking) {
    doc.text("Booking Reference:", 20, 90);
    doc.text(booking.destination || "N/A", 20, 96);
  }

  // Table using jspdf-autotable
  (doc as any).autoTable({
    startY: 110,
    head: [["Description", "Amount"]],
    body: [
      [`Trip/Service for Booking ${invoice.bookingId}`, `${invoice.currency} ${invoice.amountKes.toLocaleString()}`]
    ],
    theme: "striped",
    headStyles: { fillColor: [40, 40, 40] },
    margin: { left: 20, right: 20 }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Total Due:", 140, finalY);
  doc.setFontSize(14);
  doc.text(`${invoice.currency} ${invoice.amountKes.toLocaleString()}`, 170, finalY);

  // Footer notes
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Notes:", 20, finalY + 20);
    doc.text(invoice.notes, 20, finalY + 26, { maxWidth: 170 });
  }

  // Save the PDF
  doc.save(`Invoice_${invoice.number}.pdf`);
}

export async function generatePOPDF(
  po: PurchaseOrder,
  template: DocumentTemplate,
  supplier?: Supplier
) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  
  // 1. Draw Template Background
  try {
    const base64Img = await getBase64ImageFromUrl(template.imageUrl);
    doc.addImage(base64Img, "PNG", 0, 0, 210, 297);
  } catch (error) {
    console.error("Could not load template image", error);
  }

  // 2. Add PO Text Overlay
  doc.setFont("helvetica");
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(50, 50, 50);
  doc.text("PURCHASE ORDER", 120, 40);

  // PO Details
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`PO Number: ${po.poNumber}`, 140, 50);
  doc.text(`Date: ${formatDate(po.createdAt)}`, 140, 56);
  if (po.dueDate) doc.text(`Due Date: ${formatDate(po.dueDate)}`, 140, 62);

  // Supplier Details
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Vendor:", 20, 50);
  doc.setFontSize(10);
  if (supplier) {
    doc.text(supplier.name, 20, 56);
    if (supplier.bookingsEmail || supplier.accountsEmail) doc.text((supplier.bookingsEmail || supplier.accountsEmail) as string, 20, 62);
    if (supplier.phone) doc.text(supplier.phone, 20, 68);
    if (supplier.city || supplier.country) doc.text(`${supplier.city || ""}, ${supplier.country || ""}`, 20, 74);
  } else {
    doc.text(po.supplierName, 20, 56);
  }

  // Table
  (doc as any).autoTable({
    startY: 90,
    head: [["Description", "Amount"]],
    body: [
      [`Services / Booking ${po.linkedBookingId || "N/A"}`, `${po.currency} ${po.amount.toLocaleString()}`]
    ],
    theme: "striped",
    headStyles: { fillColor: [40, 40, 40] },
    margin: { left: 20, right: 20 }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Total:", 140, finalY);
  doc.setFontSize(14);
  doc.text(`${po.currency} ${po.amount.toLocaleString()}`, 170, finalY);

  // Save the PDF
  doc.save(`PO_${po.poNumber}.pdf`);
}
