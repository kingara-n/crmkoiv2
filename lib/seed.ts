import {
  Client, Supplier, Lead, Booking, Trip, TeamMember, Notification, UserSettings, PurchaseOrder
} from "./types";

export const SEED_TEAM: TeamMember[] = [
  { id: "tm1", name: "Local Admin", email: "admin@koitravel.com", role: "management", status: "active", quotas: { revenue: 10000000, bookings: 50 }, joinDate: "2024-01-01", createdAt: "2024-01-01" }
];

export const DEFAULT_SETTINGS: UserSettings = {
  firstName: "Local",
  lastName: "Admin",
  email: "admin@koitravel.com",
  role: "management",
  timezone: "Africa/Nairobi",
  darkMode: true,
  currency: "KES",
  compactView: false,
  revenueTarget: 5000000
};

const today = new Date();
const dOffset = (days: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + days);
  return d.toISOString().split("T")[0];
};

export const SEED_POS: PurchaseOrder[] = Array.from({length: 20}).map((_, i) => ({
  id: `po${i}`,
  supplierId: `s${i}`,
  supplierName: `Safari Lodge ${i+1}`,
  bookingId: `b${i}`,
  bookingName: `Booking ${i+1}`,
  status: i % 4 === 0 ? "draft" : i % 5 === 0 ? "closed" : "sent",
  amount: 1500 + i * 500,
  currency: "USD",
  issueDate: dOffset(-10 - i),
  dueDate: dOffset((i % 10) - 2),
  createdAt: dOffset(-10 - i)
}));

export const SEED_CLIENTS: Client[] = Array.from({length: 20}).map((_, i) => ({
  id: `c${i}`, name: `Corporate Client ${i+1}`, industry: i % 2 === 0 ? "Technology" : "Finance", type: "corporate", tier: i % 3 === 0 ? "Premium" : "Standard",
  city: "Nairobi", country: "Kenya", email: `contact${i}@example.com`, phone: `+254 700 00000${i}`,
  revenue: 500000 + (i * 100000), activeDeals: i % 3, lastContact: dOffset(-i), healthScore: 60 + i,
  createdAt: dOffset(-300 + i)
}));

export const SEED_SUPPLIERS: Supplier[] = Array.from({length: 20}).map((_, i) => ({
  id: `s${i}`, name: `Luxury Camp ${i+1}`, type: i % 3 === 0 ? "flight" : "hotel", status: "approved",
  city: "Masai Mara", country: "Kenya", email: `reservations${i}@camp.com`, phone: `+254 800 00000${i}`,
  contractExpires: dOffset((i % 30) - 5),
  createdAt: dOffset(-400 + i)
}));

export const SEED_LEADS: Lead[] = Array.from({length: 20}).map((_, i) => ({
  id: `l${i}`, clientId: `c${i}`, title: `Annual Retreat ${i+1}`, destination: i % 2 === 0 ? "Diani Beach" : "Amboseli",
  value: 300000 + (i * 50000), currency: "KES", stage: i % 5 === 0 ? "new_lead" : i % 5 === 1 ? "quoted" : i % 5 === 2 ? "in_discussion" : i % 5 === 3 ? "confirmed" : "paid",
  probability: 40 + (i % 5) * 10, ownerId: i % 2 === 0 ? "tm1" : "tm2", ownerName: i % 2 === 0 ? "Local Admin" : "Sarah Sales", daysInStage: i % 15, source: "Website",
  createdAt: dOffset(-30 - i)
}));

export const SEED_BOOKINGS: Booking[] = Array.from({length: 20}).map((_, i) => ({
  id: `b${i}`, clientId: `c${i}`, clientName: `Corporate Client ${i+1}`, contactName: `Manager ${i+1}`,
  contactEmail: `manager${i}@example.com`, destination: "Serengeti", value: 400000 + (i * 50000),
  currency: "KES", status: i % 8 === 0 ? "lost" : "confirmed", stage: "confirmed", ownerName: "Local Admin",
  closeDate: dOffset(-i * 15),
  createdAt: dOffset(-i * 15 - 30)
}));

export const SEED_INVOICES: any[] = Array.from({length: 20}).map((_, i) => ({
  id: `inv${i}`, bookingId: `b${i}`, number: `INV-2026-${100+i}`, amountKes: 400000 + (i * 50000),
  currency: "KES", issueDate: dOffset(-i * 5 - 10), dueDate: dOffset((i % 10) - 2), 
  paidAt: i % 3 === 0 ? undefined : dOffset(-i * 2),
  status: i % 3 === 0 ? "sent" : "paid",
  createdAt: dOffset(-i * 5 - 10)
}));

export const SEED_TASKS: any[] = Array.from({length: 20}).map((_, i) => ({
  id: `t${i}`, title: `Follow up on Proposal ${i+1}`, description: "Client needs revised quotes.",
  status: i % 3 === 0 ? "done" : "to-do", dueDate: dOffset((i % 7) - 2), assignedTo: "tm1", assignedName: "Local Admin",
  relatedOpportunity: `Annual Retreat ${i+1}`, createdAt: dOffset(-i)
}));

export const SEED_TRIPS: Trip[] = Array.from({length: 20}).map((_, i) => ({
  id: `tr${i}`, bookingId: `b${i}`, bookingName: `Annual Retreat ${i+1}`, clientName: `Corporate Client ${i+1}`,
  destination: "Serengeti", startDate: dOffset((i % 14) - 2), endDate: dOffset((i % 14) + 5),
  status: (i % 14) - 2 <= 0 && (i % 14) + 5 >= 0 ? "in-progress" : (i % 14) - 2 > 0 ? "upcoming" : "completed", 
  travelerCount: 4 + i, ownerName: "Local Admin", createdAt: dOffset(-30 - i)
}));
