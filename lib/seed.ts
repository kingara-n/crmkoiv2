import {
  Client, Supplier, Lead, Booking, Trip, TeamMember, Notification, UserSettings,
} from "./types";

// All money values stored in KES. Conversion happens at display time.

export const SEED_CLIENTS: Client[] = [
  {
    id: "c1", name: "Acme Corporation", industry: "Technology", type: "corporate", tier: "enterprise",
    city: "Nairobi", country: "Kenya", email: "john@acme.com", phone: "+254 712 345 678",
    revenue: 4_850_000, activeDeals: 3, lastContact: "2026-06-25", healthScore: 92,
    createdAt: "2024-03-12",
  },
  {
    id: "c2", name: "GlobalTech Industries", industry: "Manufacturing", type: "corporate", tier: "enterprise",
    city: "Mombasa", country: "Kenya", email: "sarah@globaltech.com", phone: "+254 723 456 789",
    revenue: 3_200_000, activeDeals: 2, lastContact: "2026-06-20", healthScore: 85,
    createdAt: "2024-05-04",
  },
  {
    id: "c3", name: "Innovate Labs", industry: "Healthcare", type: "corporate", tier: "growth",
    city: "Kisumu", country: "Kenya", email: "michael@innovatelabs.com", phone: "+254 734 567 890",
    revenue: 1_560_000, activeDeals: 1, lastContact: "2026-06-24", healthScore: 78,
    createdAt: "2024-11-22",
  },
  {
    id: "c4", name: "DataStream Analytics", industry: "Data Services", type: "corporate", tier: "growth",
    city: "Nairobi", country: "Kenya", email: "emily@datastream.com", phone: "+254 745 678 901",
    revenue: 980_000, activeDeals: 2, lastContact: "2026-06-13", healthScore: 71,
    createdAt: "2025-01-18",
  },
  {
    id: "c5", name: "Amani Wanjiru", type: "leisure", tier: "growth",
    city: "Nairobi", country: "Kenya", email: "amani.w@gmail.com", phone: "+254 756 789 012",
    birthday: "1990-07-14", passport: "AK1234567", mealPreference: "Vegetarian",
    seatPreference: "Window", medicalNotes: "Mild peanut allergy",
    revenue: 420_000, activeDeals: 1, lastContact: "2026-06-26", healthScore: 88,
    createdAt: "2025-02-05",
  },
  {
    id: "c6", name: "Otieno Family", type: "leisure", tier: "starter",
    city: "Eldoret", country: "Kenya", email: "d.otieno@gmail.com", phone: "+254 767 890 123",
    birthday: "1985-11-02", passport: "AK7654321", mealPreference: "No restrictions",
    seatPreference: "Aisle", revenue: 180_000, activeDeals: 1, lastContact: "2026-06-22",
    healthScore: 65, createdAt: "2025-09-14",
  },
];

export const SEED_SUPPLIERS: Supplier[] = [
  {
    id: "s1", name: "Serena Beach Resort", type: "hotel", category: "Luxury · Beach",
    city: "Mombasa", country: "Kenya",
    accountsEmail: "accounts@serenabeach.com", bookingsEmail: "reservations@serenabeach.com",
    phone: "+254 720 111 222", childPolicy: "Children under 5 stay free",
    cancellationPolicy: "48 hrs free, then 1 night charged",
    paymentTerms: "30 days net", residentRate: 18_000, nonResidentRateUsd: 140,
    capacity: 120, amenities: ["Pool", "Spa", "Beach access", "Restaurant"],
    status: "approved", contractExpires: "2026-12-31",
  },
  {
    id: "s2", name: "Maasai Mara Eco Camp", type: "camp", category: "Safari · Family",
    city: "Maasai Mara", country: "Kenya",
    accountsEmail: "finance@maraecocamp.com", bookingsEmail: "book@maraecocamp.com",
    phone: "+254 720 333 444", childPolicy: "Children 8+ only on game drives",
    cancellationPolicy: "7 days free, then 50% charged",
    paymentTerms: "Deposit on booking, balance 14 days before arrival",
    residentRate: 22_500, nonResidentRateUsd: 175,
    capacity: 24, amenities: ["Game drives", "All meals", "Bush dinner", "Wi-Fi"],
    status: "approved", contractExpires: "2026-09-15",
  },
  {
    id: "s3", name: "Diani Reef Beach Resort", type: "hotel", category: "Luxury · Beach",
    city: "Diani", country: "Kenya",
    accountsEmail: "accounts@dianireef.com", bookingsEmail: "res@dianireef.com",
    phone: "+254 720 555 666", cancellationPolicy: "72 hrs free",
    paymentTerms: "Net 30", residentRate: 16_500, nonResidentRateUsd: 125,
    capacity: 80, amenities: ["Pool", "Diving centre", "Kids club"],
    status: "approved", contractExpires: "2027-01-20",
  },
  {
    id: "s4", name: "Nairobi Airport Transfers Ltd", type: "transport", category: "Transport · 14-seat",
    city: "Nairobi", country: "Kenya",
    accountsEmail: "billing@nbotransfers.co.ke", bookingsEmail: "ops@nbotransfers.co.ke",
    phone: "+254 720 777 888", cancellationPolicy: "24 hrs free",
    paymentTerms: "Payment on completion", residentRate: 3_500, nonResidentRateUsd: 30,
    capacity: 14, amenities: ["AC", "Wi-Fi", "Bottled water"],
    status: "pending",
  },
  {
    id: "s5", name: "Tsavo Trails Safari", type: "dmc", category: "Safari · Mid-range",
    city: "Voi", country: "Kenya",
    accountsEmail: "accounts@tsavotrails.com", bookingsEmail: "info@tsavotrails.com",
    phone: "+254 720 999 000", cancellationPolicy: "5 days free, then 30% charged",
    paymentTerms: "50% deposit, balance on arrival",
    residentRate: 14_000, nonResidentRateUsd: 110,
    capacity: 16, amenities: ["Park fees included", "Bush meals", "Birdwatching"],
    status: "approved", contractExpires: "2026-08-10",
  },
];

export const SEED_LEADS: Lead[] = [
  // New enquiry (within 24-hour SLA window)
  { id: "l1", clientId: "c5", title: "Wanjiru honeymoon · Zanzibar", destination: "Zanzibar",
    value: 580_000, currency: "KES", stage: "new_lead", probability: 20,
    ownerId: "t1", ownerName: "Sarah Chen", daysInStage: 0, source: "Referral",
    createdAt: "2026-06-26" },
  { id: "l2", clientId: "c1", title: "Acme team offsite · Naivasha", destination: "Naivasha",
    value: 1_240_000, currency: "KES", stage: "new_lead", probability: 25,
    ownerId: "t2", ownerName: "Mike Johnson", daysInStage: 1, source: "Corporate tender",
    createdAt: "2026-06-25" },

  // Quoted
  { id: "l3", clientId: "c6", title: "Otieno family · Mombasa beach", destination: "Mombasa",
    value: 320_000, currency: "KES", stage: "quoted", probability: 50,
    ownerId: "t3", ownerName: "Emily Davis", daysInStage: 3, source: "Website",
    createdAt: "2026-06-23" },
  { id: "l4", clientId: "c2", title: "GlobalTech leadership retreat", destination: "Maasai Mara",
    value: 2_450_000, currency: "KES", stage: "quoted", probability: 55,
    ownerId: "t1", ownerName: "Sarah Chen", daysInStage: 5, source: "Corporate tender",
    createdAt: "2026-06-21" },

  // In discussion
  { id: "l5", clientId: "c3", title: "Innovate Labs Diani weekend", destination: "Diani",
    value: 890_000, currency: "KES", stage: "in_discussion", probability: 70,
    ownerId: "t4", ownerName: "James Wilson", daysInStage: 8, source: "Referral",
    createdAt: "2026-06-18" },

  // Confirmed (not yet paid)
  { id: "l6", clientId: "c4", title: "DataStream Q3 client event", destination: "Nanyuki",
    value: 680_000, currency: "KES", stage: "confirmed", probability: 95,
    ownerId: "t5", ownerName: "Lisa Park", daysInStage: 2, source: "Referral",
    createdAt: "2026-06-24" },

  // Paid (closed/won) — kept on the board for visibility this month
  { id: "l7", clientId: "c1", title: "Acme · Tsavo safari (paid)", destination: "Tsavo",
    value: 1_780_000, currency: "KES", stage: "paid", probability: 100,
    ownerId: "t1", ownerName: "Sarah Chen", daysInStage: 1, source: "Corporate tender",
    createdAt: "2026-06-25" },
];

export const SEED_BOOKINGS: Booking[] = [
  { id: "b1", clientId: "c1", clientName: "Acme Corporation", contactName: "John Smith",
    contactEmail: "john@acme.com", destination: "Tsavo", value: 1_780_000, currency: "KES",
    status: "confirmed", stage: "paid", ownerName: "Sarah Chen", closeDate: "2026-06-25" },
  { id: "b2", clientId: "c2", clientName: "GlobalTech Industries", contactName: "Sarah K.",
    contactEmail: "sarah@globaltech.com", destination: "Maasai Mara", value: 2_450_000,
    currency: "KES", status: "pending", stage: "quoted", ownerName: "Sarah Chen",
    closeDate: "2026-07-12" },
  { id: "b3", clientId: "c3", clientName: "Innovate Labs", contactName: "Michael K.",
    contactEmail: "michael@innovatelabs.com", destination: "Diani", value: 890_000,
    currency: "KES", status: "pending", stage: "in_discussion", ownerName: "James Wilson",
    closeDate: "2026-07-08" },
  { id: "b4", clientId: "c4", clientName: "DataStream Analytics", contactName: "Emily K.",
    contactEmail: "emily@datastream.com", destination: "Nanyuki", value: 680_000,
    currency: "KES", status: "confirmed", stage: "confirmed", ownerName: "Lisa Park",
    closeDate: "2026-07-02" },
  { id: "b5", clientId: "c5", clientName: "Amani Wanjiru", contactName: "Amani W.",
    contactEmail: "amani.w@gmail.com", destination: "Zanzibar", value: 580_000,
    currency: "KES", status: "pending", stage: "new_lead", ownerName: "Sarah Chen",
    closeDate: "2026-07-20" },
  { id: "b6", clientId: "c6", clientName: "Otieno Family", contactName: "David O.",
    contactEmail: "d.otieno@gmail.com", destination: "Mombasa", value: 320_000,
    currency: "KES", status: "lost", stage: "in_discussion", ownerName: "Emily Davis",
    closeDate: "2026-06-15" },
];

export const SEED_TRIPS: Trip[] = [
  { id: "tr1", name: "Acme · Tsavo safari", destination: "Tsavo", startDate: "2026-06-25",
    endDate: "2026-06-29", status: "on_ground", travellerCount: 12, clientName: "Acme Corporation",
    ownerName: "Sarah Chen" },
  { id: "tr2", name: "Wanjiru honeymoon", destination: "Zanzibar", startDate: "2026-07-15",
    endDate: "2026-07-22", status: "upcoming", travellerCount: 2, clientName: "Amani Wanjiru",
    ownerName: "Sarah Chen" },
  { id: "tr3", name: "DataStream client event", destination: "Nanyuki", startDate: "2026-07-02",
    endDate: "2026-07-04", status: "upcoming", travellerCount: 18, clientName: "DataStream Analytics",
    ownerName: "Lisa Park" },
  { id: "tr4", name: "Innovate Labs Diani weekend", destination: "Diani", startDate: "2026-08-15",
    endDate: "2026-08-18", status: "upcoming", travellerCount: 8, clientName: "Innovate Labs",
    ownerName: "James Wilson" },
];

export const SEED_TEAM: TeamMember[] = [
  { id: "t1", name: "Sarah Chen", initials: "SC", role: "Senior Travel Consultant",
    email: "sarah@koitravel.com", phone: "+254 720 100 001", isTopPerformer: true,
    revenue: 4_880_000, dealsClosed: 24, quotaAttainment: 108, trend: 15 },
  { id: "t2", name: "Mike Johnson", initials: "MJ", role: "Travel Consultant",
    email: "mike@koitravel.com", phone: "+254 720 100 002",
    revenue: 3_560_000, dealsClosed: 19, quotaAttainment: 89, trend: 8 },
  { id: "t3", name: "Emily Davis", initials: "ED", role: "Senior Travel Consultant",
    email: "emily@koitravel.com", phone: "+254 720 100 003", isTopPerformer: true,
    revenue: 3_130_000, dealsClosed: 17, quotaAttainment: 89, trend: 12 },
  { id: "t4", name: "James Wilson", initials: "JW", role: "Travel Consultant",
    email: "james@koitravel.com", phone: "+254 720 100 004",
    revenue: 2_890_000, dealsClosed: 15, quotaAttainment: 83, trend: -5 },
  { id: "t5", name: "Lisa Park", initials: "LP", role: "Travel Consultant",
    email: "lisa@koitravel.com", phone: "+254 720 100 005",
    revenue: 2_670_000, dealsClosed: 14, quotaAttainment: 89, trend: 9 },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", message: "Acme Corp quotation needs follow-up — sent 5 days ago",
    type: "warning", createdAt: "2026-06-27T08:30:00Z", read: false },
  { id: "n2", message: "Wanjiru honeymoon · payment due in 3 days",
    type: "info", createdAt: "2026-06-27T08:15:00Z", read: false },
  { id: "n3", message: "Serena Beach contract expires in 6 months — renew soon",
    type: "warning", createdAt: "2026-06-26T16:00:00Z", read: true },
  { id: "n4", message: "Otieno Family Mombasa booking marked as confirmed",
    type: "success", createdAt: "2026-06-26T12:00:00Z", read: true },
];

export const DEFAULT_SETTINGS: UserSettings = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@koitravel.com",
  role: "Sales Manager",
  timezone: "Africa/Nairobi (EAT)",
  darkMode: true,
  currency: "KES",
  compactView: false,
};
