"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { formatMoney, formatDate } from "@/lib/format";
import { Printer, Calendar, MapPin, CheckCircle2, User } from "lucide-react";

export function ItineraryModal({
  open,
  onClose,
  bookingId,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: string;
}) {
  const booking = useStore((s) => s.bookings.find((b) => b.id === bookingId));
  const client = useStore((s) => s.clients.find((c) => c.id === booking?.clientId));
  const trips = useStore((s) => s.trips.filter((t) => t.destination === booking?.destination));
  
  if (!booking) return null;

  const trip = trips[0]; // Assume the first trip matching the destination

  function handlePrint() {
    window.print();
  }

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-semibold text-white">Booking Itinerary</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>Print PDF</Button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white text-black p-8 sm:p-12 rounded-lg shadow-sm font-sans relative">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black tracking-tight">Koi Travel</h1>
            <p className="text-gray-500 mt-1">Extraordinary Journeys</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-light text-gray-800 uppercase tracking-widest">Itinerary</h2>
            <p className="text-gray-500 mt-1">Ref: {booking.id.split('-')[0].toUpperCase()}</p>
            <p className="text-gray-500">Date: {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Client & Trip Info */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Prepared For</h3>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold text-lg">{booking.clientName}</p>
                <p className="text-gray-600">{booking.contactEmail}</p>
                {client?.phone && <p className="text-gray-600">{client.phone}</p>}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Trip Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-semibold">{booking.destination}</p>
                  <p className="text-gray-600 text-sm">Destination</p>
                </div>
              </div>
              {trip && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-semibold">{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</p>
                    <p className="text-gray-600 text-sm">Travel Dates</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-12">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Financial Summary</h3>
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-700">Total Package Value</span>
            <span className="font-semibold">{formatMoney((booking as any).valueKes || booking.value || 0, (booking as any).currency || "KES")}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-700">Booking Status</span>
            <div className="flex items-center gap-2">
              {booking.status === "confirmed" ? (
                <><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-green-700 font-medium">Confirmed</span></>
              ) : (
                <span className="text-yellow-600 font-medium capitalize">{booking.status}</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for traveling with Koi Travel. We look forward to hosting you!</p>
          <p className="mt-1">hello@koitravel.com • +254 700 000 000 • Nairobi, Kenya</p>
        </div>
      </div>

      {/* Print-specific CSS overrides inside the component to strip out the app shell during print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, aside, header {
            display: none !important;
          }
          .modal-content, .modal-content * {
            visibility: visible;
          }
          .modal-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          /* Hide the overlay background and close buttons when printing */
          .bg-black\\/50 {
            background: transparent !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </Modal>
  );
}
