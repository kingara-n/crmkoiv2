// Shared types for the whole app.
// If you add a field, update the seed in lib/seed.ts so demo data still loads.

export type UserRole = "management" | "sales" | "accounts" | "operations";

export type Stage =
  | "new_enquiry"
  | "quoted"
  | "in_discussion"
  | "confirmed"
  | "paid";

export const STAGE_ORDER: Stage[] = [
  "new_enquiry",
  "quoted",
  "in_discussion",
  "confirmed",
  "paid",
];

export const STAGE_LABELS: Record<Stage, string> = {
  new_enquiry: "New enquiry",
  quoted: "Quoted",
  in_discussion: "In discussion",
  confirmed: "Confirmed",
  paid: "Paid",
};

export type Currency = "KES" | "USD" | "EUR" | "GBP";

export type BookingStatus = "confirmed" | "pending" | "lost";

export type Tier = "enterprise" | "growth" | "starter";

export type SupplierType = "hotel" | "camp" | "transport" | "dmc" | "airline";

export type SupplierStatus = "approved" | "pending" | "rejected";

export type TripStatus = "upcoming" | "on_ground" | "completed";

export interface Client {
  id: string;
  name: string;            // company or family name (display)
  industry?: string;       // for corporate
  type: "leisure" | "corporate";
  tier: Tier;
  city?: string;
  country: string;
  email: string;
  phone: string;
  birthday?: string;       // ISO date for individuals
  passport?: string;
  mealPreference?: string;
  seatPreference?: string;
  medicalNotes?: string;
  revenue: number;         // lifetime, in KES
  activeDeals: number;
  lastContact: string;     // ISO date
  healthScore: number;     // 0..100
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  category: string;        // e.g. 'Luxury · Beach'
  city: string;
  country: string;
  accountsEmail: string;
  bookingsEmail: string;
  phone: string;
  childPolicy?: string;
  cancellationPolicy: string;
  paymentTerms: string;
  residentRate: number;    // KES per night/trip
  nonResidentRateUsd: number;
  capacity: number;
  amenities: string[];
  status: SupplierStatus;
  contractExpires?: string;
}

export interface Lead {
  // A pipeline card. Becomes a Booking once it hits 'confirmed'.
  id: string;
  clientId: string;
  title: string;           // trip name, e.g. "Wanjiru · Zanzibar honeymoon"
  destination: string;
  value: number;           // KES
  currency: Currency;
  stage: Stage;
  probability: number;     // 0..100
  ownerId: string;         // staff id
  ownerName: string;
  daysInStage: number;
  source: string;          // 'referral', 'website', 'corporate', ...
  createdAt: string;
}

export interface Booking {
  // Aggregate of confirmed leads — what shows in the Bookings table.
  id: string;
  clientId: string;
  clientName: string;
  contactName: string;
  contactEmail: string;
  destination: string;
  value: number;
  currency: Currency;
  status: BookingStatus;
  stage: Stage;            // mirrors lead.stage; useful for filtering
  ownerName: string;
  closeDate: string;       // ISO
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  travellerCount: number;
  clientName: string;
  ownerName: string;
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  phone: string;
  isTopPerformer?: boolean;
  revenue: number;
  dealsClosed: number;
  quotaAttainment: number; // 0..150
  trend: number;           // -100..100
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  createdAt: string;
  read: boolean;
}

export interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  timezone: string;
  darkMode: boolean;
  currency: Currency;
  compactView: boolean;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  filename: string;
  storageUrl: string;
  docType?: string;
  expiresAt?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  clientId?: string;
  number: string;
  amountKes: number;
  currency: Currency;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceEditApproval {
  id: string;
  invoiceId: string;
  requestedBy: string;
  approverId: string;
  approvedAt: string;
  diffJson?: any;
}
