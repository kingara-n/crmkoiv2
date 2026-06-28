import {
  Client, Supplier, Lead, Booking, Trip, TeamMember, Notification, UserSettings, PurchaseOrder, Stage
} from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────
const today = new Date();
const dOffset = (days: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + days);
  return d.toISOString().split("T")[0];
};
const pick = <T>(arr: readonly T[], i: number) => arr[i % arr.length];

// ─── Lookup tables ───────────────────────────────────────────────────────────
const CLIENT_NAMES = [
  "Meridian Holdings","Apex Ventures","Stonebridge Group","Crestline Capital",
  "BlueSky Enterprises","Harborview Corp","Pinnacle Solutions","Nexus Partners",
  "Summit Strategies","Coastline Investments","Orion Industries","Skyline Collective",
  "Horizon Advisors","Redwood Financial","Clearwater Associates","Vanguard Dynamics",
  "Ironclad Resources","Tidewater Group","Greenfield Capital","Northern Star Ltd",
  "Wanjiru & Family","The Odhiambo Family","James & Sarah Kimani","Patel Enterprises",
  "Chen Family Trust","Al-Rashid Group","Moreau Vacations","The Nguyen Family",
  "Müller Corporate Travel","Rodriguez Events","Abubakar Holdings","The Smith Family",
  "Yamamoto Leisure","Okonkwo & Associates","The Dupont Group","Fernandez Corp",
  "The Hassan Family","Sterling Capital","Blackwood Partners","Thornton Group",
  "Elara Consult","Bright Path Ltd","Falcon Wings Co","Desert Rose LLC",
  "Jade River Group","Timber Peak Inc","Golden Gate Inv","Coral Bay Trips",
  "Ember Falls Corp","Arctic Fox Ventures",
];
const DESTINATIONS = [
  "Masai Mara, Kenya","Serengeti, Tanzania","Zanzibar, Tanzania","Amboseli, Kenya",
  "Diani Beach, Kenya","Lamu, Kenya","Samburu, Kenya","Tsavo, Kenya",
  "Ngorongoro Crater, Tanzania","Kilimanjaro, Tanzania","Rwanda Gorillas","Uganda Chimps",
  "Victoria Falls, Zimbabwe","Okavango Delta, Botswana","Cape Town, South Africa",
  "Maldives","Seychelles","Mauritius","Dubai, UAE","Nairobi City Tour",
  "Bali, Indonesia","Thailand Beach","Swiss Alps","Santorini, Greece","Paris, France",
  "New York City","Safari & Beach Combo","Mt Kenya Trekking","Laikipia Plateau",
  "Solio Ranch, Kenya",
];
const SUPPLIER_NAMES = [
  "Angama Mara","Singita Grumeti","Mahali Mzuri","Cottar's 1920s Camp","Ol Seki Hemingways",
  "Sasaab Lodge","Elephant Pepper Camp","Rekero Camp","Kichwa Tembo","Elewana Tortilis",
  "Giraffe Manor","The Hemingways Nairobi","Villa Rosa Kempinski","Fairmont The Norfolk",
  "Tribe Hotel Nairobi","Sala's Camp","Ndutu Safari Lodge","Four Seasons Safari Lodge",
  "The Highlands Ngorongoro","andBeyond Ngorongoro","Ngorongoro Serena","Speke Resort",
  "Bougainvillea Safari Lodge","Sopa Lodges Serengeti","Sanctuary Retreats","&Beyond Mara",
  "Governor's Camp","Little Governors'","Mara Intrepids","Keekorok Lodge",
  "Heritage Hotels Kenya","Kenya Airways","Ethiopian Airlines","Qatar Airways",
  "Emirates","African Safari Club","Pollman's Tours","Southern Cross Safaris",
  "Gamewatchers Safaris","East Africa Shuttles","Kenya Car Hire Ltd","Bush & Beyond",
  "Asilia Africa","Robin Hurt Safaris","Cheli & Peacock","Origins Safaris",
  "Natural World Safaris","Journeys by Design","Abercrombie & Kent","Cox & Kings",
];
const STAFF_NAMES = ["Amara Osei","Sarah Kimani","David Mwangi","Fatima Hassan","John Njoroge","Lucy Wanjiku","Brian Ochieng","Grace Mutua"];
const STAFF_IDS   = ["tm1","tm2","tm3","tm4","tm5","tm6","tm7","tm8"];
const STAFF_INITS = ["AO","SK","DM","FH","JN","LW","BO","GM"];
const INDUSTRIES  = ["Technology","Finance","Healthcare","Logistics","Real Estate","NGO","Government","Manufacturing","Hospitality","Media"];
const SOURCES     = ["Referral","Website","LinkedIn","Travel Fair","Repeat Client","Cold Outreach","Corporate Partnership","Instagram","Google Ads","Walk-in"];
const AMENITIES_POOL = [["WiFi","Pool","Spa","Game Drives"],["WiFi","Gym","Restaurant","Bar"],["WiFi","Pool","Helipad","Butler"],["Safari","Bush Walks","Sundowners","Cultural Visits"],["Beach Access","Snorkeling","Watersports","Spa"]];

// ─── Team ────────────────────────────────────────────────────────────────────
export const SEED_TEAM: TeamMember[] = STAFF_NAMES.map((name, i) => ({
  id: STAFF_IDS[i],
  name,
  initials: STAFF_INITS[i],
  phone: `+254 7${String(10 + i * 7).padStart(2,"0")} ${String(100000 + i * 13000)}`,
  email: `${name.toLowerCase().replace(" ",".")}@koitravel.com`,
  role: i === 0 ? "management" : i <= 2 ? "senior_sales" : "sales",
  status: "active",
  revenue: 4500000 + i * 780000,
  dealsClosed: 18 + i * 4,
  quotaAttainment: 78 + i * 4,
  trend: i % 2 === 0 ? 12 : -5,
  isTopPerformer: i <= 2,
  quotas: { revenue: 8000000, bookings: 40 },
  joinDate: dOffset(-(365 + i * 30)),
  createdAt: dOffset(-(365 + i * 30)),
}));

// ─── Default settings ─────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS: UserSettings = {
  firstName: "Amara",
  lastName: "Osei",
  email: "amara.osei@koitravel.com",
  role: "management",
  timezone: "Africa/Nairobi",
  darkMode: true,
  currency: "KES",
  compactView: false,
  revenueTarget: 50000000,
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────
export const SEED_POS: PurchaseOrder[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `po${i}`,
  poNumber: `PO-2026-${String(1000 + i).padStart(4, "0")}`,
  supplierId: `s${i % 50}`,
  supplierName: pick(SUPPLIER_NAMES, i),
  linkedBookingId: `b${i % 50}`,
  amount: 80000 + i * 15000,
  currency: "USD" as const,
  status: (["draft","sent","received","closed"] as const)[i % 4],
  issueDate: dOffset(-20 - i),
  dueDate: dOffset((i % 20) - 5),
  createdAt: dOffset(-20 - i),
}));

// ─── Clients ──────────────────────────────────────────────────────────────────
export const SEED_CLIENTS: Client[] = CLIENT_NAMES.map((name, i) => ({
  id: `c${i}`,
  name,
  industry: pick(INDUSTRIES, i),
  type: (i % 3 === 0 ? "individual" : "corporate") as "individual"|"corporate",
  tripType: (["Travel","Business","Incentive","Meeting","Conference"][i % 5]) as any,
  city: pick(["Nairobi","Mombasa","Kisumu","Dubai","London","New York","Kampala","Dar es Salaam"], i),
  country: pick(["Kenya","Kenya","Kenya","UAE","UK","USA","Uganda","Tanzania"], i),
  email: `${name.toLowerCase().replace(/[^a-z]/g,".").replace(/\.+/g,".").slice(0,20)}@example.com`,
  phone: `+254 7${String(10 + i * 3).padStart(2,"0")} ${String(100000 + i * 9371).slice(0,6)}`,
  revenue: 350000 + i * 120000,
  activeDeals: (i % 5),
  lastContact: dOffset(-(i % 30)),
  healthScore: Math.min(98, 55 + (i * 7) % 45),
  createdAt: dOffset(-(180 + i * 3)),
}));

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const SEED_SUPPLIERS: Supplier[] = SUPPLIER_NAMES.map((name, i) => ({
  id: `s${i}`,
  name,
  type: (["hotel","camp","airline","transport","dmc","cruise_line"] as const)[i % 6],
  category: pick(["Luxury · Safari","Mid-range · Beach","Budget · City","Ultra-luxury · Private","Boutique · Wilderness"], i),
  status: (["approved","approved","approved","pending","approved"] as const)[i % 5],
  city: pick(["Masai Mara","Nairobi","Serengeti","Zanzibar","Cape Town","Amboseli","Lamu","Diani"], i),
  country: pick(["Kenya","Kenya","Tanzania","Tanzania","South Africa","Kenya","Kenya","Kenya"], i),
  accountsEmail: `accounts@${name.toLowerCase().replace(/[^a-z]/g,"").slice(0,15)}.com`,
  bookingsEmail: `bookings@${name.toLowerCase().replace(/[^a-z]/g,"").slice(0,15)}.com`,
  phone: `+254 7${String(20 + i * 2).padStart(2,"0")} ${String(200000 + i * 7123).slice(0,6)}`,
  cancellationPolicy: pick(["72 hours notice","48 hours notice","30 days notice","Non-refundable","14 days notice"], i),
  paymentTerms: pick(["Net 30","Net 15","50% upfront, 50% on arrival","Full payment required","Net 45"], i),
  residentRate: 8000 + i * 2500,
  nonResidentRateUsd: 150 + i * 30,
  capacity: 12 + (i * 4) % 80,
  amenities: pick(AMENITIES_POOL, i),
  contractExpires: dOffset((i % 60) - 10),
}));

// ─── Leads (Pipeline) ─────────────────────────────────────────────────────────
const TRIP_TITLES = [
  "Honeymoon Safari","Anniversary Beach Escape","Corporate Team Retreat","Family Safari Adventure",
  "Solo Trekking Expedition","Group Incentive Trip","Romantic Zanzibar Getaway","Wildlife Photography Tour",
  "Gorilla Trekking Experience","Bush & Beach Combo","Executive Golf Retreat","Cultural Heritage Tour",
  "New Year's Safari","Christmas Family Trip","School Educational Safari","Medical Tourism Package",
  "Conference & Safari Bundle","Private Island Escape","Luxury Train Journey","Hot Air Balloon Safari",
];
const STAGES: Stage[] = ["new_lead","quoted","in_discussion","confirmed","paid"];

export const SEED_LEADS: Lead[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `l${i}`,
  clientId: `c${i % 50}`,
  title: `${pick(CLIENT_NAMES, i).split(" ")[0]} · ${pick(TRIP_TITLES, i)}`,
  destination: pick(DESTINATIONS, i),
  value: 200000 + i * 35000,
  currency: "KES" as const,
  stage: pick(STAGES, i),
  probability: [20, 45, 65, 85, 98][i % 5],
  ownerId: pick(STAFF_IDS, i),
  ownerName: pick(STAFF_NAMES, i),
  daysInStage: (i * 3) % 21,
  source: pick(SOURCES, i),
  createdAt: dOffset(-(10 + i * 2)),
}));

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const SEED_BOOKINGS: Booking[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `b${i}`,
  clientId: `c${i % 50}`,
  clientName: pick(CLIENT_NAMES, i),
  contactName: `${pick(["James","Mary","Peter","Grace","Ali","Chen","Sofia","Liam"],i)} ${pick(["Waweru","Oduya","Kariuki","Muthoni","Rahman","Zhang","Costa","Murphy"],i)}`,
  contactEmail: `contact${i}@${pick(["gmail.com","outlook.com","yahoo.com","company.co.ke","work.com"],i)}`,
  destination: pick(DESTINATIONS, i),
  value: 350000 + i * 42000,
  currency: "KES" as const,
  status: (["confirmed","confirmed","confirmed","lost","confirmed","confirmed","confirmed","pending"][i % 8]) as any,
  stage: "confirmed" as const,
  ownerName: pick(STAFF_NAMES, i),
  closeDate: dOffset(-(i * 7)),
  createdAt: dOffset(-(i * 7 + 14)),
}));

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const SEED_INVOICES: any[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `inv${i}`,
  bookingId: `b${i % 50}`,
  number: `INV-2026-${String(1000 + i).padStart(4,"0")}`,
  clientName: pick(CLIENT_NAMES, i),
  amountKes: 350000 + i * 42000,
  currency: "KES",
  issueDate: dOffset(-(i * 5 + 5)),
  dueDate: dOffset((i % 14) - 3),
  paidAt: i % 4 === 0 ? undefined : dOffset(-(i * 2 + 1)),
  status: i % 4 === 0 ? "sent" : "paid",
  createdAt: dOffset(-(i * 5 + 5)),
}));

// ─── Tasks ────────────────────────────────────────────────────────────────────
const TASK_TITLES = [
  "Send revised itinerary","Follow up on visa documents","Confirm supplier availability",
  "Prepare cost breakdown","Call client for feedback","Process deposit payment",
  "Book flight tickets","Arrange airport transfers","Share packing list with client",
  "Request rooming list","Send travel insurance options","Update booking in system",
  "Confirm dietary requirements","Send welcome kit","Review contract terms",
  "Follow up unpaid invoice","Schedule debrief call","Send post-trip survey",
  "Renew supplier contract","Prepare quarterly report",
];

export const SEED_TASKS: any[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `t${i}`,
  title: pick(TASK_TITLES, i),
  description: `Action required for ${pick(CLIENT_NAMES, i)} - ${pick(DESTINATIONS, i)} trip.`,
  status: (["to-do","to-do","in-progress","done","to-do"][i % 5]),
  dueDate: dOffset((i % 14) - 3),
  assignedTo: pick(STAFF_IDS, i),
  assignedName: pick(STAFF_NAMES, i),
  relatedOpportunity: `${pick(CLIENT_NAMES, i).split(" ")[0]} · ${pick(TRIP_TITLES, i)}`,
  createdAt: dOffset(-(i * 2)),
}));

// ─── Trips ────────────────────────────────────────────────────────────────────
export const SEED_TRIPS: Trip[] = Array.from({ length: 50 }).map((_, i) => {
  const startOffset = (i * 3) % 30 - 10;
  const endOffset   = startOffset + 7 + (i % 8);
  const status: "upcoming"|"on_ground"|"completed" =
    endOffset < 0 ? "completed" : startOffset <= 0 ? "on_ground" : "upcoming";
  return {
    id: `tr${i}`,
    bookingId: `b${i % 50}`,
    bookingName: `${pick(CLIENT_NAMES, i).split(" ")[0]} · ${pick(TRIP_TITLES, i)}`,
    clientName: pick(CLIENT_NAMES, i),
    destination: pick(DESTINATIONS, i),
    startDate: dOffset(startOffset),
    endDate: dOffset(endOffset),
    status,
    travelerCount: 2 + (i % 12),
    ownerName: pick(STAFF_NAMES, i),
    createdAt: dOffset(-(30 + i)),
  };
});
