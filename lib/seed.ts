import {
  Client, Supplier, Lead, Booking, Trip, TeamMember, Notification, UserSettings, PurchaseOrder
} from "./types";

export const SEED_TEAM: TeamMember[] = [
  { id: "tm1", name: "Local Admin", email: "admin@koitravel.com", role: "management", status: "active", quotas: { revenue: 10000000, bookings: 50 }, joinDate: "2024-01-01", createdAt: "2024-01-01" }
];

export const DEFAULT_SETTINGS: UserSettings = {
  id: "s1", userId: "u1",
  currency: "KES", notificationsEnabled: true, emailAlerts: true,
  createdAt: "2024-01-01"
};

export const SEED_POS: PurchaseOrder[] = Array.from({length: 10}).map((_, i) => ({
  id: `po${i}`,
  supplierId: `s${i}`,
  supplierName: `Safari Lodge ${i+1}`,
  bookingId: `b${i}`,
  bookingName: `Booking ${i+1}`,
  status: "sent",
  amount: 1500 + i * 500,
  currency: "USD",
  issueDate: "2026-06-01",
  dueDate: "2026-07-01",
  createdAt: "2026-06-01"
}));

export const SEED_CLIENTS: Client[] = Array.from({length: 10}).map((_, i) => ({
  id: `c${i}`, name: `Corporate Client ${i+1}`, industry: "Technology", type: "corporate", tier: "Premium",
  city: "Nairobi", country: "Kenya", email: `contact${i}@example.com`, phone: `+254 700 00000${i}`,
  revenue: 500000 + (i * 100000), activeDeals: i % 3, lastContact: "2026-06-20", healthScore: 75 + i,
  createdAt: "2025-01-01"
}));

export const SEED_SUPPLIERS: Supplier[] = Array.from({length: 10}).map((_, i) => ({
  id: `s${i}`, name: `Luxury Camp ${i+1}`, type: "hotel", status: "approved",
  city: "Masai Mara", country: "Kenya", email: `reservations${i}@camp.com`, phone: `+254 800 00000${i}`,
  createdAt: "2025-01-01"
}));

export const SEED_LEADS: Lead[] = Array.from({length: 10}).map((_, i) => ({
  id: `l${i}`, clientId: `c${i}`, title: `Annual Retreat ${i+1}`, destination: "Diani Beach",
  value: 300000 + (i * 50000), currency: "KES", stage: i % 2 === 0 ? "new_lead" : "quoted",
  probability: 40 + i * 5, ownerId: "tm1", ownerName: "Local Admin", daysInStage: i, source: "Website",
  createdAt: "2026-05-01"
}));

export const SEED_BOOKINGS: Booking[] = Array.from({length: 10}).map((_, i) => ({
  id: `b${i}`, clientId: `c${i}`, clientName: `Corporate Client ${i+1}`, contactName: `Manager ${i+1}`,
  contactEmail: `manager${i}@example.com`, destination: "Serengeti", value: 400000 + (i * 50000),
  currency: "KES", status: "confirmed", stage: "confirmed", ownerName: "Local Admin",
  createdAt: "2026-04-01"
}));

export const SEED_INVOICES: any[] = Array.from({length: 10}).map((_, i) => ({
  id: `inv${i}`, bookingId: `b${i}`, number: `INV-2026-${100+i}`, amountKes: 400000 + (i * 50000),
  currency: "KES", issueDate: "2026-06-01", dueDate: "2026-06-30", paidAt: i % 2 === 0 ? "2026-06-15" : undefined,
  createdAt: "2026-06-01"
}));

export const SEED_TASKS: any[] = Array.from({length: 10}).map((_, i) => ({
  id: `t${i}`, title: `Follow up on Proposal ${i+1}`, description: "Client needs revised quotes.",
  status: i % 3 === 0 ? "done" : "to-do", dueDate: "2026-06-28", assignedTo: "tm1", assignedName: "Local Admin",
  relatedOpportunity: `Annual Retreat ${i+1}`, createdAt: "2026-06-01"
}));

export const SEED_TRIPS: Trip[] = Array.from({length: 10}).map((_, i) => ({
  id: `tr${i}`, bookingId: `b${i}`, bookingName: `Annual Retreat ${i+1}`, clientName: `Corporate Client ${i+1}`,
  destination: "Serengeti", startDate: "2026-07-01", endDate: "2026-07-10",
  status: "upcoming", travelerCount: 4 + i, ownerName: "Local Admin", createdAt: "2026-05-01"
}));
