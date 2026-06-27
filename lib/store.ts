"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Client, Supplier, Lead, Booking, Trip, TeamMember, Notification,
  UserSettings, Stage,
} from "./types";
import {
  SEED_CLIENTS, SEED_SUPPLIERS, SEED_LEADS, SEED_BOOKINGS, SEED_TRIPS,
  SEED_TEAM, SEED_NOTIFICATIONS, DEFAULT_SETTINGS,
} from "./seed";

interface Store {
  // Data
  clients: Client[];
  suppliers: Supplier[];
  leads: Lead[];
  bookings: Booking[];
  trips: Trip[];
  team: TeamMember[];
  notifications: Notification[];
  settings: UserSettings;

  // UI state (not persisted to avoid hydration issues)
  sidebarCollapsed: boolean;

  // Mutations: clients
  addClient: (c: Omit<Client, "id" | "createdAt" | "revenue" | "activeDeals" | "lastContact" | "healthScore">) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Mutations: suppliers
  addSupplier: (s: Omit<Supplier, "id" | "status">, asPending: boolean) => void;
  approveSupplier: (id: string) => void;
  rejectSupplier: (id: string) => void;
  deleteSupplier: (id: string) => void;

  // Mutations: leads (pipeline)
  addLead: (l: Omit<Lead, "id" | "createdAt" | "daysInStage">) => void;
  moveLead: (id: string, toStage: Stage) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  // Mutations: bookings
  addBooking: (b: Omit<Booking, "id">) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;

  // Mutations: trips
  addTrip: (t: Omit<Trip, "id">) => void;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Settings
  updateSettings: (patch: Partial<UserSettings>) => void;

  // UI
  toggleSidebar: () => void;

  // Reset (for the "Reset demo data" button in Settings)
  resetDemoData: () => void;
}

function uid(prefix = ""): string {
  return prefix + Math.random().toString(36).slice(2, 10);
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // initial data
      clients: SEED_CLIENTS,
      suppliers: SEED_SUPPLIERS,
      leads: SEED_LEADS,
      bookings: SEED_BOOKINGS,
      trips: SEED_TRIPS,
      team: SEED_TEAM,
      notifications: SEED_NOTIFICATIONS,
      settings: DEFAULT_SETTINGS,
      sidebarCollapsed: false,

      // ---------- Clients ----------
      addClient: (c) => set((s) => ({
        clients: [
          ...s.clients,
          {
            ...c,
            id: uid("c_"),
            createdAt: new Date().toISOString(),
            revenue: 0,
            activeDeals: 0,
            lastContact: new Date().toISOString(),
            healthScore: 75,
          },
        ],
      })),
      updateClient: (id, patch) => set((s) => ({
        clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),
      deleteClient: (id) => set((s) => ({
        clients: s.clients.filter((c) => c.id !== id),
      })),

      // ---------- Suppliers ----------
      addSupplier: (sup, asPending) => set((s) => ({
        suppliers: [
          ...s.suppliers,
          { ...sup, id: uid("s_"), status: asPending ? "pending" : "approved" },
        ],
      })),
      approveSupplier: (id) => set((s) => ({
        suppliers: s.suppliers.map((sp) =>
          sp.id === id ? { ...sp, status: "approved" } : sp,
        ),
      })),
      rejectSupplier: (id) => set((s) => ({
        suppliers: s.suppliers.map((sp) =>
          sp.id === id ? { ...sp, status: "rejected" } : sp,
        ),
      })),
      deleteSupplier: (id) => set((s) => ({
        suppliers: s.suppliers.filter((sp) => sp.id !== id),
      })),

      // ---------- Leads (pipeline) ----------
      addLead: (l) => set((s) => ({
        leads: [
          ...s.leads,
          { ...l, id: uid("l_"), createdAt: new Date().toISOString(), daysInStage: 0 },
        ],
      })),
      moveLead: (id, toStage) => set((s) => {
        // Drag-drop core: change the lead's stage and reset its days-in-stage.
        // Side effect: if it lands on 'confirmed' or 'paid', mirror it into bookings.
        const lead = s.leads.find((l) => l.id === id);
        if (!lead) return s;

        const updatedLeads = s.leads.map((l) =>
          l.id === id ? { ...l, stage: toStage, daysInStage: 0 } : l,
        );

        // Auto-create a booking when a lead is confirmed, if not already there
        if (toStage === "confirmed" || toStage === "paid") {
          const alreadyBooked = s.bookings.some((b) => b.clientId === lead.clientId && b.destination === lead.destination);
          if (!alreadyBooked) {
            const client = s.clients.find((c) => c.id === lead.clientId);
            return {
              ...s,
              leads: updatedLeads,
              bookings: [
                ...s.bookings,
                {
                  id: uid("b_"),
                  clientId: lead.clientId,
                  clientName: client?.name ?? "Unknown",
                  contactName: client?.name ?? "—",
                  contactEmail: client?.email ?? "—",
                  destination: lead.destination,
                  value: lead.value,
                  currency: lead.currency,
                  status: toStage === "paid" ? "confirmed" : "pending",
                  stage: toStage,
                  ownerName: lead.ownerName,
                  closeDate: new Date().toISOString().slice(0, 10),
                },
              ],
            };
          }
        }
        return { ...s, leads: updatedLeads };
      }),
      updateLead: (id, patch) => set((s) => ({
        leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      })),
      deleteLead: (id) => set((s) => ({
        leads: s.leads.filter((l) => l.id !== id),
      })),

      // ---------- Bookings ----------
      addBooking: (b) => set((s) => ({
        bookings: [...s.bookings, { ...b, id: uid("b_") }],
      })),
      updateBooking: (id, patch) => set((s) => ({
        bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      })),
      deleteBooking: (id) => set((s) => ({
        bookings: s.bookings.filter((b) => b.id !== id),
      })),

      // ---------- Trips ----------
      addTrip: (t) => set((s) => ({
        trips: [...s.trips, { ...t, id: uid("tr_") }],
      })),
      updateTrip: (id, patch) => set((s) => ({
        trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })),
      deleteTrip: (id) => set((s) => ({
        trips: s.trips.filter((t) => t.id !== id),
      })),

      // ---------- Notifications ----------
      markNotificationRead: (id) => set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      })),
      markAllNotificationsRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      })),

      // ---------- Settings ----------
      updateSettings: (patch) => set((s) => ({
        settings: { ...s.settings, ...patch },
      })),

      // ---------- UI ----------
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // ---------- Demo reset ----------
      resetDemoData: () => set({
        clients: SEED_CLIENTS,
        suppliers: SEED_SUPPLIERS,
        leads: SEED_LEADS,
        bookings: SEED_BOOKINGS,
        trips: SEED_TRIPS,
        team: SEED_TEAM,
        notifications: SEED_NOTIFICATIONS,
        settings: DEFAULT_SETTINGS,
      }),
    }),
    {
      name: "koi-crm-store",
      storage: createJSONStorage(() => localStorage),
      // Don't persist the sidebar state — restart fresh each session
      partialize: (state) => {
        const { sidebarCollapsed, ...rest } = state;
        return rest as Store;
      },
    },
  ),
);

// Convenient selector hooks
export const useSettings = () => useStore((s) => s.settings);
export const useCurrency = () => useStore((s) => s.settings.currency);
